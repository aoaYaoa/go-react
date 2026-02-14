package main

import (
	"backend/internal/config"
	"backend/internal/database"
	"backend/internal/models"
	"backend/pkg/utils/logger"
	"encoding/csv"
	"fmt"
	"io"
	"math/rand"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

const (
	airportsURL = "https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat"
	airlinesURL = "https://raw.githubusercontent.com/jpatokal/openflights/master/data/airlines.dat"
	maxAirports = 200
	maxAirlines = 200
	httpTimeout = 30 * time.Second
)

func main() {
	fmt.Println("==========================================")
	fmt.Println("  业务数据导入脚本")
	fmt.Println("==========================================")
	fmt.Println()

	config.Init()
	cfg := config.AppConfig
	logger.Init()

	dbManager, err := database.NewManager(cfg)
	if err != nil {
		fmt.Printf("数据库连接失败: %v\n", err)
		os.Exit(1)
	}
	defer dbManager.Close()

	db := dbManager.GetDB()
	fmt.Println("数据库连接成功")
	fmt.Println()

	now := time.Now()

	seedAirportsFromOpenFlights(db, now)
	seedAirlinesFromOpenFlights(db, now)
	airlineMap := getAirlineMap(db)
	seedAircrafts(db, now, airlineMap)
	seedOperators(db, now)
	operatorIDs := getOperatorIDs(db)
	seedDrones(db, now, operatorIDs)
	seedNoFlyZones(db, now)
	airportMap := getAirportMap(db)
	seedFlights(db, now, airlineMap, airportMap)

	fmt.Println()
	fmt.Println("==========================================")
	fmt.Println("  数据导入完成")
	fmt.Println("==========================================")
}

// ========== 辅助函数 ==========

func httpGet(url string) (io.ReadCloser, error) {
	client := &http.Client{Timeout: httpTimeout}
	resp, err := client.Get(url)
	if err != nil {
		return nil, err
	}
	if resp.StatusCode != http.StatusOK {
		resp.Body.Close()
		return nil, fmt.Errorf("HTTP %d", resp.StatusCode)
	}
	return resp.Body, nil
}

func getAirlineMap(db *gorm.DB) map[string]uuid.UUID {
	var list []models.Airline
	db.Find(&list)
	m := make(map[string]uuid.UUID, len(list))
	for _, a := range list {
		m[a.Code] = a.ID
	}
	return m
}

func getAirportMap(db *gorm.DB) map[string]uuid.UUID {
	var list []models.Airport
	db.Find(&list)
	m := make(map[string]uuid.UUID, len(list))
	for _, a := range list {
		m[a.Code] = a.ID
	}
	return m
}

func getOperatorIDs(db *gorm.DB) []uuid.UUID {
	var list []models.Operator
	db.Find(&list)
	ids := make([]uuid.UUID, len(list))
	for i, o := range list {
		ids[i] = o.ID
	}
	return ids
}

// ========== 机场数据 (OpenFlights + 中国核心机场) ==========
// 数据源: https://openflights.org/data.html
// airports.dat 格式: ID, Name, City, Country, IATA, ICAO, Lat, Lon, Alt, Timezone, DST, TzDB, Type, Source
//
// 策略: 先从 OpenFlights 全量解析，筛选有 IATA code 的机场，随机取样到 maxAirports 条。
// 同时确保中国核心机场（航班数据依赖）一定被包含。

func seedAirportsFromOpenFlights(db *gorm.DB, now time.Time) {
	fmt.Println("从 OpenFlights 下载机场数据...")

	body, err := httpGet(airportsURL)
	if err != nil {
		fmt.Printf("  下载失败: %v, 跳过机场导入\n\n", err)
		return
	}
	defer body.Close()

	reader := csv.NewReader(body)
	reader.LazyQuotes = true

	// 航班数据依赖的中国核心机场 code
	coreSet := map[string]bool{
		"PEK": true, "PKX": true, "PVG": true, "SHA": true, "CAN": true,
		"SZX": true, "TFU": true, "CTU": true, "CKG": true, "HGH": true,
		"WUH": true, "XIY": true, "NKG": true, "KMG": true, "CSX": true,
		"CGO": true, "XMN": true, "TAO": true, "DLC": true, "HAK": true,
		"SYX": true, "TSN": true, "SHE": true, "HRB": true, "URC": true,
		"KWE": true, "FOC": true, "TNA": true, "NNG": true, "LHW": true,
	}

	// 第一遍: 全量解析，分为核心机场和其他机场
	var coreAirports []models.Airport
	var otherAirports []models.Airport

	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil || len(record) < 12 {
			continue
		}

		iata := strings.TrimSpace(record[4])
		if iata == "" || iata == "\\N" || len(iata) != 3 {
			continue
		}

		lat, _ := strconv.ParseFloat(record[6], 64)
		lon, _ := strconv.ParseFloat(record[7], 64)
		alt, _ := strconv.ParseFloat(record[8], 64)

		tzDB := strings.TrimSpace(record[11])
		if tzDB == "\\N" {
			tzDB = ""
		}

		airport := models.Airport{
			Code: iata, Name: strings.TrimSpace(record[1]),
			City: strings.TrimSpace(record[2]), Country: strings.TrimSpace(record[3]),
			Latitude: lat, Longitude: lon, Altitude: alt,
			Timezone: tzDB, Type: "civil", Status: "active",
			CreatedAt: now, UpdatedAt: now,
		}

		if coreSet[iata] {
			coreAirports = append(coreAirports, airport)
		} else {
			otherAirports = append(otherAirports, airport)
		}
	}

	fmt.Printf("  解析完成: 核心机场 %d 条, 其他机场 %d 条\n", len(coreAirports), len(otherAirports))

	// 打乱其他机场顺序，取样补足到 maxAirports
	rng := rand.New(rand.NewSource(time.Now().UnixNano()))
	rng.Shuffle(len(otherAirports), func(i, j int) {
		otherAirports[i], otherAirports[j] = otherAirports[j], otherAirports[i]
	})

	remaining := maxAirports - len(coreAirports)
	if remaining < 0 {
		remaining = 0
	}
	if remaining > len(otherAirports) {
		remaining = len(otherAirports)
	}

	// 合并: 核心机场 + 随机抽样的其他机场
	toInsert := append(coreAirports, otherAirports[:remaining]...)

	count := 0
	for i := range toInsert {
		result := db.Where("code = ?", toInsert[i].Code).FirstOrCreate(&toInsert[i])
		if result.Error != nil {
			continue
		}
		if result.RowsAffected > 0 {
			count++
		}
	}
	fmt.Printf("机场数据导入完成: 新增 %d 条\n\n", count)
}

// ========== 航空公司数据 (OpenFlights) ==========
// 数据源: https://openflights.org/data.html
// airlines.dat 格式: ID, Name, Alias, IATA, ICAO, Callsign, Country, Active

// ========== 航空公司数据 (OpenFlights + 中国核心航司) ==========
// 数据源: https://openflights.org/data.html
// airlines.dat 格式: ID, Name, Alias, IATA, ICAO, Callsign, Country, Active
//
// 策略: 同机场，确保航班依赖的中国航司一定被包含，其余随机取样到 maxAirlines。

func seedAirlinesFromOpenFlights(db *gorm.DB, now time.Time) {
	fmt.Println("从 OpenFlights 下载航空公司数据...")

	body, err := httpGet(airlinesURL)
	if err != nil {
		fmt.Printf("  下载失败: %v, 跳过航空公司导入\n\n", err)
		return
	}
	defer body.Close()

	reader := csv.NewReader(body)
	reader.LazyQuotes = true

	// 航班数据依赖的航司 IATA code
	coreSet := map[string]bool{
		"CA": true, "MU": true, "CZ": true, "HU": true, "ZH": true,
		"MF": true, "3U": true, "SC": true, "9C": true, "HO": true,
		"KN": true, "GS": true,
	}

	var coreAirlines []models.Airline
	var otherAirlines []models.Airline

	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil || len(record) < 8 {
			continue
		}

		// 只导入活跃的航空公司
		if strings.TrimSpace(record[7]) != "Y" {
			continue
		}

		iata := strings.TrimSpace(record[3])
		if iata == "" || iata == "\\N" || iata == "-" {
			continue
		}

		callsign := strings.TrimSpace(record[5])
		if callsign == "\\N" {
			callsign = ""
		}

		airline := models.Airline{
			Code: iata, Name: strings.TrimSpace(record[1]),
			Country: strings.TrimSpace(record[6]), Callsign: callsign,
			Type: "passenger", Status: "active",
			CreatedAt: now, UpdatedAt: now,
		}

		if coreSet[iata] {
			coreAirlines = append(coreAirlines, airline)
		} else {
			otherAirlines = append(otherAirlines, airline)
		}
	}

	fmt.Printf("  解析完成: 核心航司 %d 条, 其他航司 %d 条\n", len(coreAirlines), len(otherAirlines))

	rng := rand.New(rand.NewSource(time.Now().UnixNano()))
	rng.Shuffle(len(otherAirlines), func(i, j int) {
		otherAirlines[i], otherAirlines[j] = otherAirlines[j], otherAirlines[i]
	})

	remaining := maxAirlines - len(coreAirlines)
	if remaining < 0 {
		remaining = 0
	}
	if remaining > len(otherAirlines) {
		remaining = len(otherAirlines)
	}

	toInsert := append(coreAirlines, otherAirlines[:remaining]...)

	count := 0
	for i := range toInsert {
		result := db.Where("code = ?", toInsert[i].Code).FirstOrCreate(&toInsert[i])
		if result.Error != nil {
			continue
		}
		if result.RowsAffected > 0 {
			count++
		}
	}
	fmt.Printf("航空公司数据导入完成: 新增 %d 条\n\n", count)
}

// ========== 飞机数据 (内嵌) ==========

func seedAircrafts(db *gorm.DB, now time.Time, airlineMap map[string]uuid.UUID) {
	fmt.Println("导入飞机数据...")

	type acDef struct {
		Reg, Model, Manufacturer, EngineType, AirlineCode  string
		Year, Capacity, MaxRange, CruiseSpeed, EngineCount int
	}

	defs := []acDef{
		{"B-1234", "Boeing 737-800", "Boeing", "CFM56-7B", "CA", 2015, 189, 5765, 842, 2},
		{"B-2345", "Airbus A320-200", "Airbus", "CFM56-5B", "CA", 2018, 180, 6150, 840, 2},
		{"B-3456", "Boeing 787-9", "Boeing", "GEnx-1B", "MU", 2017, 290, 14140, 903, 2},
		{"B-4567", "Airbus A330-300", "Airbus", "Trent 700", "MU", 2016, 300, 11750, 871, 2},
		{"B-5678", "Boeing 777-300ER", "Boeing", "GE90-115B", "CZ", 2014, 396, 13650, 905, 2},
		{"B-6789", "Airbus A350-900", "Airbus", "Trent XWB", "CZ", 2019, 325, 15000, 903, 2},
		{"B-7890", "Boeing 737 MAX 8", "Boeing", "LEAP-1B", "HU", 2020, 178, 6570, 839, 2},
		{"B-8901", "Airbus A321neo", "Airbus", "LEAP-1A", "ZH", 2021, 220, 7400, 840, 2},
		{"B-9012", "Boeing 737-800", "Boeing", "CFM56-7B", "MF", 2016, 189, 5765, 842, 2},
		{"B-1357", "Airbus A320neo", "Airbus", "LEAP-1A", "3U", 2022, 194, 6300, 840, 2},
		{"B-2468", "COMAC C919", "COMAC", "LEAP-1C", "MU", 2023, 168, 5555, 834, 2},
		{"B-3579", "COMAC ARJ21", "COMAC", "CF34-10A", "CA", 2020, 90, 3700, 828, 2},
		{"B-6001", "Boeing 787-9", "Boeing", "GEnx-1B", "HU", 2019, 290, 14140, 903, 2},
		{"B-6002", "Airbus A330-200", "Airbus", "Trent 700", "SC", 2015, 260, 13450, 871, 2},
		{"B-6003", "Boeing 737-800", "Boeing", "CFM56-7B", "9C", 2017, 189, 5765, 842, 2},
		{"B-6004", "Airbus A320-200", "Airbus", "CFM56-5B", "HO", 2019, 180, 6150, 840, 2},
		{"B-6005", "Boeing 737-800", "Boeing", "CFM56-7B", "KN", 2018, 189, 5765, 842, 2},
		{"B-6006", "Airbus A320neo", "Airbus", "LEAP-1A", "GS", 2021, 194, 6300, 840, 2},
		{"B-6007", "Airbus A350-900", "Airbus", "Trent XWB", "CA", 2020, 325, 15000, 903, 2},
		{"B-6008", "Boeing 777-300ER", "Boeing", "GE90-115B", "MU", 2016, 396, 13650, 905, 2},
	}

	count := 0
	for _, d := range defs {
		var airlineID *uuid.UUID
		if id, ok := airlineMap[d.AirlineCode]; ok {
			airlineID = &id
		}
		ac := models.Aircraft{
			Registration: d.Reg, Model: d.Model, Manufacturer: d.Manufacturer,
			YearBuilt: d.Year, Capacity: d.Capacity, MaxRange: d.MaxRange,
			CruiseSpeed: d.CruiseSpeed, EngineType: d.EngineType, EngineCount: d.EngineCount,
			AirlineID: airlineID, Status: "active", CreatedAt: now, UpdatedAt: now,
		}
		result := db.Where("registration = ?", ac.Registration).FirstOrCreate(&ac)
		if result.Error != nil {
			fmt.Printf("  飞机 %s 导入失败: %v\n", ac.Registration, result.Error)
		} else if result.RowsAffected > 0 {
			count++
		}
	}
	fmt.Printf("飞机数据导入完成: 新增 %d 条\n\n", count)
}

// ========== 运营商数据 (内嵌) ==========

func seedOperators(db *gorm.DB, now time.Time) {
	fmt.Println("导入运营商数据...")
	operators := []models.Operator{
		{Code: "OP001", Name: "大疆创新科技", LicenseNo: "UAV-2024-0001", Type: "commercial", Contact: "张经理", Phone: "13800138001", Email: "contact@dji-ops.com", Address: "深圳市南山区", Status: "active", CreatedAt: now, UpdatedAt: now},
		{Code: "OP002", Name: "亿航智能", LicenseNo: "UAV-2024-0002", Type: "commercial", Contact: "李经理", Phone: "13800138002", Email: "contact@ehang-ops.com", Address: "广州市天河区", Status: "active", CreatedAt: now, UpdatedAt: now},
		{Code: "OP003", Name: "极飞科技", LicenseNo: "UAV-2024-0003", Type: "commercial", Contact: "王经理", Phone: "13800138003", Email: "contact@xag-ops.com", Address: "广州市黄埔区", Status: "active", CreatedAt: now, UpdatedAt: now},
		{Code: "OP004", Name: "中航无人机", LicenseNo: "UAV-2024-0004", Type: "government", Contact: "赵经理", Phone: "13800138004", Email: "contact@avic-uav.com", Address: "北京市海淀区", Status: "active", CreatedAt: now, UpdatedAt: now},
		{Code: "OP005", Name: "顺丰无人机", LicenseNo: "UAV-2024-0005", Type: "commercial", Contact: "孙经理", Phone: "13800138005", Email: "drone@sf-ops.com", Address: "深圳市福田区", Status: "active", CreatedAt: now, UpdatedAt: now},
		{Code: "OP006", Name: "京东物流无人机", LicenseNo: "UAV-2024-0006", Type: "commercial", Contact: "周经理", Phone: "13800138006", Email: "drone@jd-ops.com", Address: "北京市亦庄", Status: "active", CreatedAt: now, UpdatedAt: now},
		{Code: "OP007", Name: "农业植保服务中心", LicenseNo: "UAV-2024-0007", Type: "commercial", Contact: "吴经理", Phone: "13800138007", Email: "agri@plant-ops.com", Address: "成都市武侯区", Status: "active", CreatedAt: now, UpdatedAt: now},
		{Code: "OP008", Name: "城市应急救援队", LicenseNo: "UAV-2024-0008", Type: "government", Contact: "郑经理", Phone: "13800138008", Email: "rescue@city-ops.com", Address: "上海市浦东新区", Status: "active", CreatedAt: now, UpdatedAt: now},
	}

	count := 0
	for i := range operators {
		result := db.Where("code = ?", operators[i].Code).FirstOrCreate(&operators[i])
		if result.Error != nil {
			fmt.Printf("  运营商 %s 导入失败: %v\n", operators[i].Name, result.Error)
		} else if result.RowsAffected > 0 {
			count++
		}
	}
	fmt.Printf("运营商数据导入完成: 新增 %d 条\n\n", count)
}

// ========== 无人机数据 (内嵌) ==========

func seedDrones(db *gorm.DB, now time.Time, operatorIDs []uuid.UUID) {
	fmt.Println("导入无人机数据...")

	type droneDef struct {
		Serial, Name, Model, Manufacturer, Camera, Status string
		MaxAlt, MaxSpd, MaxRng, Weight                    float64
		Battery                                           int
	}

	defs := []droneDef{
		{"DJI-M300-001", "经纬 M300 RTK #1", "Matrice 300 RTK", "DJI", "H20T", "idle", 7000, 23, 15000, 6300, 55},
		{"DJI-M300-002", "经纬 M300 RTK #2", "Matrice 300 RTK", "DJI", "H20T", "flying", 7000, 23, 15000, 6300, 55},
		{"DJI-M30-001", "经纬 M30 #1", "Matrice 30", "DJI", "M30T", "idle", 7000, 23, 8000, 3770, 41},
		{"DJI-M30-002", "经纬 M30 #2", "Matrice 30", "DJI", "M30T", "maintenance", 7000, 23, 8000, 3770, 41},
		{"DJI-MAV3-001", "Mavic 3 #1", "Mavic 3 Enterprise", "DJI", "Hasselblad", "idle", 6000, 21, 30000, 920, 46},
		{"DJI-MAV3-002", "Mavic 3 #2", "Mavic 3 Enterprise", "DJI", "Hasselblad", "flying", 6000, 21, 30000, 920, 46},
		{"DJI-P4P-001", "精灵 4 Pro #1", "Phantom 4 Pro V2", "DJI", "1-inch CMOS", "idle", 6000, 20, 7000, 1375, 30},
		{"DJI-INS2-001", "悟 2 #1", "Inspire 2", "DJI", "X5S", "offline", 5000, 26, 7000, 3440, 27},
		{"AUTEL-EVO2-001", "EVO II Pro #1", "EVO II Pro V3", "Autel", "1-inch CMOS", "idle", 7200, 20, 9000, 1250, 42},
		{"AUTEL-EVO2-002", "EVO II Pro #2", "EVO II Pro V3", "Autel", "1-inch CMOS", "flying", 7200, 20, 9000, 1250, 42},
		{"DJI-AGR-001", "T40 植保机 #1", "Agras T40", "DJI", "FPV", "idle", 30, 10, 2000, 28500, 18},
		{"DJI-AGR-002", "T40 植保机 #2", "Agras T40", "DJI", "FPV", "idle", 30, 10, 2000, 28500, 18},
		{"DJI-M600-001", "经纬 M600 Pro #1", "Matrice 600 Pro", "DJI", "Ronin-MX", "maintenance", 2500, 18, 5000, 9500, 35},
		{"EHANG-216-001", "亿航 216 #1", "EHang 216", "EHang", "Surveillance", "idle", 3000, 35, 35000, 260000, 25},
		{"XAG-P100-001", "极飞 P100 #1", "P100 Pro", "XAG", "RTK", "idle", 50, 12, 3000, 32000, 15},
	}

	if len(operatorIDs) == 0 {
		fmt.Println("  没有运营商数据，跳过\n")
		return
	}

	count := 0
	for i, d := range defs {
		opID := operatorIDs[i%len(operatorIDs)]
		drone := models.Drone{
			SerialNumber: d.Serial, Name: d.Name, Model: d.Model, Manufacturer: d.Manufacturer,
			OperatorID: &opID, MaxAltitude: d.MaxAlt, MaxSpeed: d.MaxSpd, MaxRange: d.MaxRng,
			BatteryLife: d.Battery, Weight: d.Weight, CameraModel: d.Camera,
			Status: d.Status, CreatedAt: now, UpdatedAt: now,
		}
		result := db.Where("serial_number = ?", drone.SerialNumber).FirstOrCreate(&drone)
		if result.Error != nil {
			fmt.Printf("  无人机 %s 导入失败: %v\n", drone.Name, result.Error)
		} else if result.RowsAffected > 0 {
			count++
		}
	}
	fmt.Printf("无人机数据导入完成: 新增 %d 条\n\n", count)
}

// ========== 禁飞区数据 (内嵌) ==========

func seedNoFlyZones(db *gorm.DB, now time.Time) {
	fmt.Println("导入禁飞区数据...")

	type nfzDef struct {
		Name, Type, Reason, Authority string
		Lat, Lon, MinAlt, MaxAlt      float64
		Radius                        int
	}

	defs := []nfzDef{
		{"北京首都机场禁飞区", "permanent", "机场净空保护区", "民航局", 40.0799, 116.6031, 0, 1000, 10000},
		{"北京大兴机场禁飞区", "permanent", "机场净空保护区", "民航局", 39.5098, 116.4105, 0, 1000, 10000},
		{"上海浦东机场禁飞区", "permanent", "机场净空保护区", "民航局", 31.1443, 121.8083, 0, 1000, 10000},
		{"广州白云机场禁飞区", "permanent", "机场净空保护区", "民航局", 23.3924, 113.2988, 0, 1000, 10000},
		{"深圳宝安机场禁飞区", "permanent", "机场净空保护区", "民航局", 22.6393, 113.8107, 0, 1000, 10000},
		{"成都双流机场禁飞区", "permanent", "机场净空保护区", "民航局", 30.5785, 103.9471, 0, 1000, 10000},
		{"杭州萧山机场禁飞区", "permanent", "机场净空保护区", "民航局", 30.2295, 120.4344, 0, 1000, 10000},
		{"西安咸阳机场禁飞区", "permanent", "机场净空保护区", "民航局", 34.4471, 108.7516, 0, 1000, 10000},
		{"重庆江北机场禁飞区", "permanent", "机场净空保护区", "民航局", 29.7192, 106.6417, 0, 1000, 10000},
		{"南京禄口机场禁飞区", "permanent", "机场净空保护区", "民航局", 31.7420, 118.8620, 0, 1000, 10000},
		{"天安门广场禁飞区", "permanent", "重要政治区域", "公安部", 39.9042, 116.4074, 0, 500, 5000},
		{"中南海禁飞区", "permanent", "重要政治区域", "公安部", 39.9167, 116.3833, 0, 500, 3000},
		{"故宫博物院禁飞区", "permanent", "文物保护区域", "文旅部", 39.9163, 116.3972, 0, 300, 2000},
		{"西湖景区禁飞区", "permanent", "景区保护区域", "杭州市政府", 30.2489, 120.1480, 0, 300, 3000},
		{"上海外滩禁飞区", "permanent", "重要公共区域", "上海市政府", 31.2397, 121.4900, 0, 300, 2000},
	}

	count := 0
	for _, d := range defs {
		geometry := fmt.Sprintf(`{"type":"Point","coordinates":[%f,%f],"properties":{"radius":%d}}`, d.Lon, d.Lat, d.Radius)
		nfz := models.NoFlyZone{
			Name: d.Name, Type: d.Type, Geometry: geometry,
			MinAltitude: d.MinAlt, MaxAltitude: d.MaxAlt,
			Reason: d.Reason, Authority: d.Authority,
			Status: "active", CreatedAt: now, UpdatedAt: now,
		}
		result := db.Where("name = ?", nfz.Name).FirstOrCreate(&nfz)
		if result.Error != nil {
			fmt.Printf("  禁飞区 %s 导入失败: %v\n", nfz.Name, result.Error)
		} else if result.RowsAffected > 0 {
			count++
		}
	}
	fmt.Printf("禁飞区数据导入完成: 新增 %d 条\n\n", count)
}

// ========== 航班数据 (内嵌) ==========

func seedFlights(db *gorm.DB, now time.Time, airlineMap map[string]uuid.UUID, airportMap map[string]uuid.UUID) {
	fmt.Println("导入航班数据...")

	type flightDef struct {
		Number, AirlineCode, DepCode, ArrCode, Status, Gate, Terminal string
		DepOffset, Duration                                           int
	}

	defs := []flightDef{
		{"CA1301", "CA", "PEK", "PVG", "scheduled", "A12", "T3", 2, 150},
		{"CA1302", "CA", "PVG", "PEK", "scheduled", "B08", "T2", 5, 155},
		{"MU5101", "MU", "PVG", "CAN", "boarding", "C15", "T1", 1, 165},
		{"MU5102", "MU", "CAN", "PVG", "scheduled", "A03", "T2", 4, 160},
		{"CZ3101", "CZ", "CAN", "PEK", "scheduled", "B22", "T2", 3, 190},
		{"CZ3102", "CZ", "PEK", "CAN", "departed", "A08", "T3", -1, 185},
		{"HU7801", "HU", "HAK", "PEK", "scheduled", "A01", "T1", 6, 240},
		{"ZH9101", "ZH", "SZX", "PVG", "boarding", "B05", "T3", 0, 160},
		{"MF8101", "MF", "XMN", "PEK", "scheduled", "A10", "T3", 2, 180},
		{"3U8801", "3U", "CTU", "PVG", "scheduled", "C02", "T1", 3, 175},
		{"SC4601", "SC", "TNA", "CAN", "boarding", "A05", "T1", 1, 170},
		{"9C8801", "9C", "PVG", "KMG", "scheduled", "B12", "T2", 4, 195},
		{"HO1201", "HO", "SHA", "SZX", "scheduled", "A18", "T1", 2, 165},
		{"CA1501", "CA", "PEK", "CTU", "scheduled", "A20", "T3", 5, 175},
		{"MU2101", "MU", "PVG", "XIY", "boarding", "C08", "T1", 1, 155},
		{"CZ6101", "CZ", "CAN", "CKG", "arrived", "B15", "T2", -2, 140},
		{"CA1801", "CA", "PEK", "HGH", "scheduled", "A06", "T3", 3, 130},
		{"MU5301", "MU", "PVG", "WUH", "departed", "C03", "T1", 0, 110},
		{"CZ3501", "CZ", "CAN", "NKG", "scheduled", "B09", "T2", 6, 145},
		{"HU7201", "HU", "HAK", "SZX", "boarding", "A02", "T1", 1, 80},
		{"CA1601", "CA", "PEK", "KMG", "scheduled", "A15", "T3", 4, 210},
		{"MU9201", "MU", "PVG", "CSX", "scheduled", "C12", "T1", 2, 120},
		{"CZ3801", "CZ", "CAN", "CGO", "scheduled", "B18", "T2", 5, 150},
		{"3U8501", "3U", "CTU", "PEK", "departed", "C05", "T1", -1, 170},
		{"MF8301", "MF", "XMN", "PVG", "scheduled", "A08", "T3", 3, 115},
		{"CA1901", "CA", "PEK", "SYX", "scheduled", "A22", "T3", 7, 260},
		{"MU5501", "MU", "PVG", "TAO", "boarding", "C18", "T1", 1, 95},
		{"CZ6301", "CZ", "CAN", "DLC", "scheduled", "B20", "T2", 4, 210},
		{"HU7501", "HU", "HAK", "CTU", "scheduled", "A04", "T1", 2, 160},
		{"9C8501", "9C", "PVG", "URC", "scheduled", "B06", "T2", 6, 300},
	}

	// 用于模拟飞行中位置的坐标表
	coords := map[string][2]float64{
		"PEK": {40.08, 116.60}, "PVG": {31.14, 121.81}, "CAN": {23.39, 113.30},
		"SZX": {22.64, 113.81}, "CTU": {30.58, 103.95}, "CKG": {29.72, 106.64},
		"HGH": {30.23, 120.43}, "WUH": {30.78, 114.21}, "XIY": {34.45, 108.75},
		"NKG": {31.74, 118.86}, "KMG": {25.10, 102.93}, "CSX": {28.19, 113.22},
		"CGO": {34.52, 113.84}, "XMN": {24.54, 118.13}, "TAO": {36.27, 120.10},
		"DLC": {38.97, 121.54}, "HAK": {19.93, 110.46}, "SYX": {18.30, 109.41},
		"SHA": {31.20, 121.34}, "TNA": {36.86, 117.22}, "URC": {43.91, 87.47},
	}

	rng := rand.New(rand.NewSource(now.UnixNano()))
	count := 0

	for _, d := range defs {
		airlineID, aOk := airlineMap[d.AirlineCode]
		depID, dOk := airportMap[d.DepCode]
		arrID, rOk := airportMap[d.ArrCode]
		if !aOk || !dOk || !rOk {
			continue
		}

		depTime := now.Add(time.Duration(d.DepOffset) * time.Hour)
		arrTime := depTime.Add(time.Duration(d.Duration) * time.Minute)

		var lat, lon *float64
		var alt, spd float64
		if d.Status == "departed" {
			if dc, ok := coords[d.DepCode]; ok {
				if ac, ok2 := coords[d.ArrCode]; ok2 {
					p := 0.3 + rng.Float64()*0.4
					midLat := dc[0] + (ac[0]-dc[0])*p
					midLon := dc[1] + (ac[1]-dc[1])*p
					lat, lon = &midLat, &midLon
					alt = 9000 + rng.Float64()*2000
					spd = 750 + rng.Float64()*150
				}
			}
		}

		delay := 0
		if rng.Float64() < 0.15 {
			delay = 15 + rng.Intn(60)
		}

		flight := models.Flight{
			FlightNumber: d.Number, AirlineID: &airlineID,
			DepartureID: &depID, ArrivalID: &arrID,
			DepartureTime: depTime, ArrivalTime: arrTime,
			Status: d.Status, Gate: d.Gate, Terminal: d.Terminal,
			Altitude: alt, Speed: spd, Latitude: lat, Longitude: lon,
			DelayMinutes: delay, CreatedAt: now, UpdatedAt: now,
		}
		result := db.Where("flight_number = ? AND departure_time = ?", flight.FlightNumber, flight.DepartureTime).FirstOrCreate(&flight)
		if result.Error != nil {
			fmt.Printf("  航班 %s 导入失败: %v\n", flight.FlightNumber, result.Error)
		} else if result.RowsAffected > 0 {
			count++
		}
	}
	fmt.Printf("航班数据导入完成: 新增 %d 条\n\n", count)
}
