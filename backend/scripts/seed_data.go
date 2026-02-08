package main

import (
	"backend/internal/config"
	"backend/internal/database"
	"backend/internal/models"
	"backend/pkg/utils/logger"
	"encoding/csv"
	"fmt"
	"io"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// 数据填充脚本
// 从公开数据源获取机场、航空公司、飞机等数据并填充到数据库
func main() {
	fmt.Println("==========================================")
	fmt.Println("  数据填充脚本")
	fmt.Println("==========================================")
	fmt.Println()

	// 初始化配置
	config.Init()
	cfg := config.AppConfig

	// 初始化日志
	logger.Init()

	// 创建数据库管理器
	fmt.Println("🔌 连接数据库...")
	dbManager, err := database.NewManager(cfg)
	if err != nil {
		fmt.Printf("❌ 数据库连接失败: %v\n", err)
		os.Exit(1)
	}
	defer dbManager.Close()

	db := dbManager.GetDB()
	fmt.Println("✅ 数据库连接成功")
	fmt.Println()

	// 填充机场数据
	fmt.Println("📍 开始填充机场数据...")
	if err := seedAirports(db); err != nil {
		fmt.Printf("⚠️  机场数据填充失败: %v\n", err)
	} else {
		fmt.Println("✅ 机场数据填充完成")
	}
	fmt.Println()

	// 填充航空公司数据
	fmt.Println("✈️  开始填充航空公司数据...")
	if err := seedAirlines(db); err != nil {
		fmt.Printf("⚠️  航空公司数据填充失败: %v\n", err)
	} else {
		fmt.Println("✅ 航空公司数据填充完成")
	}
	fmt.Println()

	// 填充飞机数据
	fmt.Println("🛩️  开始填充飞机数据...")
	if err := seedAircrafts(db); err != nil {
		fmt.Printf("⚠️  飞机数据填充失败: %v\n", err)
	} else {
		fmt.Println("✅ 飞机数据填充完成")
	}
	fmt.Println()

	// 填充运营商数据
	fmt.Println("🏢 开始填充运营商数据...")
	if err := seedOperators(db); err != nil {
		fmt.Printf("⚠️  运营商数据填充失败: %v\n", err)
	} else {
		fmt.Println("✅ 运营商数据填充完成")
	}
	fmt.Println()

	// 填充无人机数据
	fmt.Println("🚁 开始填充无人机数据...")
	if err := seedDrones(db); err != nil {
		fmt.Printf("⚠️  无人机数据填充失败: %v\n", err)
	} else {
		fmt.Println("✅ 无人机数据填充完成")
	}
	fmt.Println()

	// 填充禁飞区数据
	fmt.Println("🚫 开始填充禁飞区数据...")
	if err := seedNoFlyZones(db); err != nil {
		fmt.Printf("⚠️  禁飞区数据填充失败: %v\n", err)
	} else {
		fmt.Println("✅ 禁飞区数据填充完成")
	}
	fmt.Println()

	fmt.Println("==========================================")
	fmt.Println("  ✅ 数据填充完成！")
	fmt.Println("==========================================")
}

// seedAirports 填充机场数据
// 数据来源: OpenFlights 机场数据库
func seedAirports(db *gorm.DB) error {
	// 使用 OpenFlights 的机场数据
	// https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat
	url := "https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat"

	resp, err := http.Get(url)
	if err != nil {
		return fmt.Errorf("下载机场数据失败: %w", err)
	}
	defer resp.Body.Close()

	reader := csv.NewReader(resp.Body)
	reader.Comma = ','
	reader.LazyQuotes = true

	count := 0
	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			continue
		}

		// 只导入有 IATA 代码的主要机场
		if len(record) < 12 || record[4] == "\\N" || record[4] == "" {
			continue
		}

		lat, _ := strconv.ParseFloat(record[6], 64)
		lon, _ := strconv.ParseFloat(record[7], 64)
		altitude, _ := strconv.ParseFloat(record[8], 64)

		airport := models.Airport{
			ID:        uuid.New(),
			Code:      record[4],
			Name:      record[1],
			City:      record[2],
			Country:   record[3],
			Latitude:  lat,
			Longitude: lon,
			Altitude:  altitude,
			Timezone:  record[11],
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}

		if err := db.Create(&airport).Error; err != nil {
			// 忽略重复数据错误
			continue
		}

		count++
		if count%100 == 0 {
			fmt.Printf("  已导入 %d 个机场...\n", count)
		}

		// 限制导入数量
		if count >= 200 {
			break
		}
	}

	fmt.Printf("  共导入 %d 个机场\n", count)
	return nil
}

// seedAirlines 填充航空公司数据
func seedAirlines(db *gorm.DB) error {
	// 使用 OpenFlights 的航空公司数据
	url := "https://raw.githubusercontent.com/jpatokal/openflights/master/data/airlines.dat"

	resp, err := http.Get(url)
	if err != nil {
		return fmt.Errorf("下载航空公司数据失败: %w", err)
	}
	defer resp.Body.Close()

	reader := csv.NewReader(resp.Body)
	reader.Comma = ','
	reader.LazyQuotes = true

	count := 0
	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			continue
		}

		if len(record) < 8 {
			continue
		}

		// 只导入活跃的航空公司
		if record[7] != "Y" {
			continue
		}

		airline := models.Airline{
			ID:        uuid.New(),
			Code:      record[3],
			Name:      record[1],
			Country:   record[6],
			Callsign:  record[5],
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}

		if err := db.Create(&airline).Error; err != nil {
			continue
		}

		count++
		if count%50 == 0 {
			fmt.Printf("  已导入 %d 家航空公司...\n", count)
		}

		if count >= 200 {
			break
		}
	}

	fmt.Printf("  共导入 %d 家航空公司\n", count)
	return nil
}

// seedAircrafts 填充飞机数据（示例数据）
func seedAircrafts(db *gorm.DB) error {
	// 常见飞机型号示例数据（生成200架）
	aircraftModels := []struct {
		Model        string
		Manufacturer string
		YearBuilt    int
	}{
		{"Boeing 737-800", "Boeing", 2015},
		{"Airbus A320", "Airbus", 2018},
		{"Boeing 777-300ER", "Boeing", 2016},
		{"Airbus A350-900", "Airbus", 2019},
		{"Boeing 787-9", "Boeing", 2017},
		{"Boeing 737 MAX 8", "Boeing", 2020},
		{"Airbus A321neo", "Airbus", 2021},
		{"Airbus A380-800", "Airbus", 2014},
		{"Boeing 747-400", "Boeing", 2010},
		{"Airbus A330-300", "Airbus", 2013},
	}

	// 生成200架飞机
	registrationPrefixes := []string{"B-", "N-", "D-", "G-", "F-", "JA-", "HL-", "VT-", "9M-", "HS-"}

	count := 0
	for i := 0; i < 200; i++ {
		am := aircraftModels[i%len(aircraftModels)]
		prefix := registrationPrefixes[i%len(registrationPrefixes)]

		aircraft := models.Aircraft{
			ID:           uuid.New(),
			Registration: fmt.Sprintf("%s%04d", prefix, i+1000),
			Model:        am.Model,
			Manufacturer: am.Manufacturer,
			YearBuilt:    am.YearBuilt,
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
		}

		if err := db.Create(&aircraft).Error; err != nil {
			continue
		}
		count++
		if count%50 == 0 {
			fmt.Printf("  已导入 %d 架飞机...\n", count)
		}
	}

	fmt.Printf("  共导入 %d 架飞机\n", count)
	return nil
}

// seedOperators 填充运营商数据（生成50个）
func seedOperators(db *gorm.DB) error {
	operatorTemplates := []struct {
		NameTemplate string
		Type         string
	}{
		{"天翼无人机科技有限公司", "commercial"},
		{"翔云航空服务公司", "commercial"},
		{"智飞无人机运营中心", "commercial"},
		{"蓝天物流无人机", "delivery"},
		{"农业植保无人机服务", "agriculture"},
		{"城市巡检无人机", "government"},
		{"应急救援无人机队", "government"},
		{"影视航拍工作室", "commercial"},
		{"测绘勘探服务", "commercial"},
		{"环境监测中心", "government"},
	}

	contacts := []string{"张经理", "李经理", "王经理", "赵经理", "刘经理", "陈经理", "杨经理", "黄经理", "周经理", "吴经理"}

	count := 0
	for i := 0; i < 50; i++ {
		template := operatorTemplates[i%len(operatorTemplates)]
		contact := contacts[i%len(contacts)]

		operator := models.Operator{
			ID:        uuid.New(),
			Code:      fmt.Sprintf("OP%03d", i+1),
			Name:      fmt.Sprintf("%s-%d", template.NameTemplate, i+1),
			LicenseNo: fmt.Sprintf("UAV-2024-%04d", i+1),
			Type:      template.Type,
			Contact:   contact,
			Phone:     fmt.Sprintf("138%08d", 10000000+i),
			Email:     fmt.Sprintf("contact%d@operator.com", i+1),
			Status:    "active",
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}

		if err := db.Create(&operator).Error; err != nil {
			continue
		}
		count++
		if count%10 == 0 {
			fmt.Printf("  已导入 %d 个运营商...\n", count)
		}
	}

	fmt.Printf("  共导入 %d 个运营商\n", count)
	return nil
}

// seedDrones 填充无人机数据（生成200架）
func seedDrones(db *gorm.DB) error {
	// 获取所有运营商
	var operators []models.Operator
	if err := db.Find(&operators).Error; err != nil {
		return fmt.Errorf("未找到运营商数据，请先填充运营商: %w", err)
	}

	if len(operators) == 0 {
		return fmt.Errorf("未找到运营商数据，请先填充运营商")
	}

	droneModels := []struct {
		Model        string
		Manufacturer string
		MaxAltitude  int
		MaxSpeed     int
		MaxRange     int
		BatteryLife  int
		Weight       float64
	}{
		{"Matrice 300 RTK", "DJI", 7000, 82, 15000, 55, 6.3},
		{"Matrice 30", "DJI", 7000, 82, 8000, 41, 3.77},
		{"Phantom 4 Pro", "DJI", 6000, 72, 7000, 30, 1.375},
		{"Matrice 600 Pro", "DJI", 2500, 65, 5000, 35, 9.5},
		{"Inspire 2", "DJI", 5000, 94, 7000, 27, 3.44},
		{"Mavic 3", "DJI", 6000, 75, 30000, 46, 0.895},
		{"EVO II Pro", "Autel", 7200, 72, 9000, 40, 1.127},
		{"Anafi USA", "Parrot", 4500, 55, 3200, 32, 0.5},
	}

	count := 0
	statuses := []string{"idle", "flying", "maintenance", "offline"}

	for i := 0; i < 200; i++ {
		model := droneModels[i%len(droneModels)]
		operator := operators[i%len(operators)]
		operatorID := operator.ID
		status := statuses[i%len(statuses)]

		drone := models.Drone{
			ID:           uuid.New(),
			SerialNumber: fmt.Sprintf("%s-%04d", model.Manufacturer, i+1000),
			Name:         fmt.Sprintf("%s #%d", model.Model, i+1),
			OperatorID:   &operatorID,
			Model:        model.Model,
			Manufacturer: model.Manufacturer,
			MaxAltitude:  float64(model.MaxAltitude),
			MaxSpeed:     float64(model.MaxSpeed),
			MaxRange:     float64(model.MaxRange),
			BatteryLife:  model.BatteryLife,
			Weight:       model.Weight,
			Status:       status,
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
		}

		if err := db.Create(&drone).Error; err != nil {
			continue
		}
		count++
		if count%50 == 0 {
			fmt.Printf("  已导入 %d 架无人机...\n", count)
		}
	}

	fmt.Printf("  共导入 %d 架无人机\n", count)
	return nil
}

// seedNoFlyZones 填充禁飞区数据（50个）
func seedNoFlyZones(db *gorm.DB) error {
	// 中国主要城市的禁飞区
	noFlyZones := []struct {
		Name      string
		Type      string
		Latitude  float64
		Longitude float64
		Radius    int
	}{
		{"北京首都国际机场禁飞区", "permanent", 40.0799, 116.6031, 10000},
		{"上海浦东国际机场禁飞区", "permanent", 31.1443, 121.8083, 10000},
		{"广州白云国际机场禁飞区", "permanent", 23.3924, 113.2988, 10000},
		{"深圳宝安国际机场禁飞区", "permanent", 22.6393, 113.8107, 10000},
		{"成都双流国际机场禁飞区", "permanent", 30.5785, 103.9470, 10000},
		{"杭州萧山国际机场禁飞区", "permanent", 30.2295, 120.4340, 10000},
		{"西安咸阳国际机场禁飞区", "permanent", 34.4471, 108.7519, 10000},
		{"重庆江北国际机场禁飞区", "permanent", 29.7192, 106.6417, 10000},
		{"南京禄口国际机场禁飞区", "permanent", 31.7420, 118.8620, 10000},
		{"武汉天河国际机场禁飞区", "permanent", 30.7838, 114.2081, 10000},
		{"天安门广场禁飞区", "permanent", 39.9042, 116.4074, 5000},
		{"中南海禁飞区", "permanent", 39.9167, 116.3833, 3000},
		{"上海外滩禁飞区", "permanent", 31.2397, 121.4900, 2000},
		{"西湖景区禁飞区", "permanent", 30.2489, 120.1480, 3000},
		{"故宫博物院禁飞区", "permanent", 39.9163, 116.3972, 2000},
	}

	count := 0
	for i := 0; i < 50; i++ {
		nfz := noFlyZones[i%len(noFlyZones)]

		// 为每个模板生成多个实例，稍微调整位置
		offsetLat := float64(i/len(noFlyZones)) * 0.01
		offsetLon := float64(i/len(noFlyZones)) * 0.01

		// 构建 GeoJSON 格式的几何数据（圆形区域）
		geometry := fmt.Sprintf(`{"type":"Point","coordinates":[%f,%f],"properties":{"radius":%d}}`,
			nfz.Longitude+offsetLon, nfz.Latitude+offsetLat, nfz.Radius)

		name := nfz.Name
		if i >= len(noFlyZones) {
			name = fmt.Sprintf("%s-%d", nfz.Name, i/len(noFlyZones)+1)
		}

		noFlyZone := models.NoFlyZone{
			ID:          uuid.New(),
			Name:        name,
			Type:        nfz.Type,
			Geometry:    geometry,
			MinAltitude: 0,
			MaxAltitude: 500,
			Reason:      fmt.Sprintf("%s禁飞区域", name),
			Authority:   "民航局",
			Status:      "active",
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		}

		if err := db.Create(&noFlyZone).Error; err != nil {
			continue
		}
		count++
		if count%10 == 0 {
			fmt.Printf("  已导入 %d 个禁飞区...\n", count)
		}
	}

	fmt.Printf("  共导入 %d 个禁飞区\n", count)
	return nil
}
