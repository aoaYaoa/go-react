package main

import (
	"backend/internal/config"
	"backend/internal/database"
	"backend/internal/models"
	"backend/pkg/utils/logger"
	"fmt"
	"math/rand"
	"os"
	"time"

	"github.com/google/uuid"
)

func main() {
	fmt.Println("==========================================")
	fmt.Println("  补充禁飞区数据")
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

	// 禁飞区模板（使用随机经纬度）
	noFlyZoneTemplates := []struct {
		NamePrefix string
		Type       string
		BaseRadius int
	}{
		{"机场禁飞区", "permanent", 10000},
		{"军事基地禁飞区", "permanent", 15000},
		{"政府机关禁飞区", "permanent", 5000},
		{"核电站禁飞区", "permanent", 20000},
		{"水库禁飞区", "permanent", 8000},
		{"监狱禁飞区", "permanent", 6000},
		{"文物保护区禁飞区", "permanent", 3000},
		{"自然保护区禁飞区", "permanent", 12000},
		{"临时活动禁飞区", "temporary", 5000},
		{"演习区域禁飞区", "temporary", 25000},
	}

	cities := []string{
		"北京", "上海", "广州", "深圳", "成都", "杭州", "西安", "重庆", "南京", "武汉",
		"天津", "苏州", "郑州", "长沙", "沈阳", "青岛", "济南", "大连", "厦门", "合肥",
		"昆明", "福州", "无锡", "哈尔滨", "长春", "石家庄", "南昌", "贵阳", "南宁", "兰州",
		"太原", "乌鲁木齐", "银川", "西宁", "呼和浩特", "拉萨", "海口", "三亚", "珠海", "东莞",
	}

	rand.Seed(time.Now().UnixNano())
	count := 0

	// 生成50个禁飞区
	for i := 0; i < 50; i++ {
		template := noFlyZoneTemplates[i%len(noFlyZoneTemplates)]
		city := cities[i%len(cities)]

		// 生成随机经纬度（中国范围：纬度18-54，经度73-135）
		latitude := 18.0 + rand.Float64()*(54.0-18.0)
		longitude := 73.0 + rand.Float64()*(135.0-73.0)

		// 半径随机变化 ±30%
		radiusVariation := 0.7 + rand.Float64()*0.6
		radius := int(float64(template.BaseRadius) * radiusVariation)

		// 构建 GeoJSON 格式的几何数据
		geometry := fmt.Sprintf(`{"type":"Point","coordinates":[%.6f,%.6f],"properties":{"radius":%d}}`,
			longitude, latitude, radius)

		name := fmt.Sprintf("%s%s-%d", city, template.NamePrefix, i+1)

		noFlyZone := models.NoFlyZone{
			ID:          uuid.New(),
			Name:        name,
			Type:        template.Type,
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
			fmt.Printf("  警告: 插入失败 - %v\n", err)
			continue
		}

		count++
		if count%10 == 0 {
			fmt.Printf("  已添加 %d 个禁飞区...\n", count)
		}
	}

	fmt.Printf("\n共添加 %d 个禁飞区\n", count)
	fmt.Println()
	fmt.Println("==========================================")
	fmt.Println("  补充完成！")
	fmt.Println("==========================================")
}
