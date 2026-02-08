package main

import (
	"backend/internal/config"
	"backend/internal/database"
	"backend/pkg/utils/logger"
	"fmt"
	"os"
)

func main() {
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

	var counts struct {
		Airports   int64
		Airlines   int64
		Aircrafts  int64
		Operators  int64
		Drones     int64
		NoFlyZones int64
	}

	db.Table("airports").Count(&counts.Airports)
	db.Table("airlines").Count(&counts.Airlines)
	db.Table("aircrafts").Count(&counts.Aircrafts)
	db.Table("operators").Count(&counts.Operators)
	db.Table("drones").Count(&counts.Drones)
	db.Table("no_fly_zones").Count(&counts.NoFlyZones)

	fmt.Println("==========================================")
	fmt.Println("  数据库数据统计")
	fmt.Println("==========================================")
	fmt.Printf("机场 (airports):       %d\n", counts.Airports)
	fmt.Printf("航空公司 (airlines):   %d\n", counts.Airlines)
	fmt.Printf("飞机 (aircrafts):      %d\n", counts.Aircrafts)
	fmt.Printf("运营商 (operators):    %d\n", counts.Operators)
	fmt.Printf("无人机 (drones):       %d\n", counts.Drones)
	fmt.Printf("禁飞区 (no_fly_zones): %d\n", counts.NoFlyZones)
	fmt.Println("==========================================")
}
