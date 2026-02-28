package main

import (
	"backend/internal/config"
	"backend/internal/database"
	"backend/internal/models"
	"backend/pkg/utils/logger"
	"log"

	"github.com/google/uuid"
)

func main() {
	log.Println("开始填充菜单和角色数据...")

	// 加载配置
	config.Init()
	cfg := config.AppConfig

	// 初始化日志
	logger.Init()

	// 初始化数据库
	dbManager, err := database.NewManager(cfg)
	if err != nil {
		log.Fatalf("初始化数据库失败: %v", err)
	}
	defer dbManager.Close()

	db := dbManager.GetDB()

	// 清空现有数据
	log.Println("清空现有菜单和角色数据...")
	db.Exec("DELETE FROM role_menus")
	db.Exec("DELETE FROM menus")
	db.Exec("DELETE FROM roles")

	// 创建角色
	log.Println("创建角色...")
	roles := []models.Role{
		{
			ID:          uuid.New(),
			Name:        "游客",
			Code:        "guest",
			Description: "未登录用户，可访问公开内容",
			Status:      "active",
		},
		{
			ID:          uuid.New(),
			Name:        "普通用户",
			Code:        "user",
			Description: "已登录的普通用户",
			Status:      "active",
		},
		{
			ID:          uuid.New(),
			Name:        "高级用户",
			Code:        "premium",
			Description: "付费高级用户，可使用数据分析功能",
			Status:      "active",
		},
		{
			ID:          uuid.New(),
			Name:        "管理员",
			Code:        "admin",
			Description: "系统管理员，拥有所有权限",
			Status:      "active",
		},
	}

	for _, role := range roles {
		if err := db.Create(&role).Error; err != nil {
			log.Printf("创建角色失败 %s: %v", role.Name, err)
		} else {
			log.Printf("创建角色成功: %s", role.Name)
		}
	}

	// 创建菜单
	log.Println("创建菜单...")
	menus := []models.Menu{}
	menuMap := make(map[string]uuid.UUID) // key -> menu_id

	// 一级菜单
	homeMenu := models.Menu{
		ID:     uuid.New(),
		Name:   "首页",
		Path:   "/",
		Icon:   "home",
		Sort:   1,
		Type:   "menu",
		Status: "active",
	}
	menus = append(menus, homeMenu)
	menuMap["home"] = homeMenu.ID

	trackingMenu := models.Menu{
		ID:     uuid.New(),
		Name:   "实时追踪",
		Icon:   "tracking",
		Sort:   2,
		Type:   "menu",
		Status: "active",
	}
	menus = append(menus, trackingMenu)
	menuMap["tracking"] = trackingMenu.ID

	dronesMenu := models.Menu{
		ID:     uuid.New(),
		Name:   "无人机",
		Icon:   "drone",
		Sort:   3,
		Type:   "menu",
		Status: "active",
	}
	menus = append(menus, dronesMenu)
	menuMap["drones"] = dronesMenu.ID

	analyticsMenu := models.Menu{
		ID:     uuid.New(),
		Name:   "数据分析",
		Icon:   "analytics",
		Sort:   4,
		Type:   "menu",
		Status: "active",
	}
	menus = append(menus, analyticsMenu)
	menuMap["analytics"] = analyticsMenu.ID

	communityMenu := models.Menu{
		ID:     uuid.New(),
		Name:   "社区",
		Icon:   "community",
		Sort:   5,
		Type:   "menu",
		Status: "active",
	}
	menus = append(menus, communityMenu)
	menuMap["community"] = communityMenu.ID

	systemMenu := models.Menu{
		ID:     uuid.New(),
		Name:   "系统",
		Icon:   "settings",
		Sort:   6,
		Type:   "menu",
		Status: "active",
	}
	menus = append(menus, systemMenu)
	menuMap["system"] = systemMenu.ID

	aboutMenu := models.Menu{
		ID:     uuid.New(),
		Name:   "关于",
		Path:   "/about",
		Icon:   "info",
		Sort:   7,
		Type:   "menu",
		Status: "active",
	}
	menus = append(menus, aboutMenu)
	menuMap["about"] = aboutMenu.ID

	// 实时追踪子菜单
	mapMenu := models.Menu{
		ID:       uuid.New(),
		ParentID: &trackingMenu.ID,
		Name:     "实时地图",
		Path:     "/map",
		Icon:     "map",
		Sort:     1,
		Type:     "menu",
		Status:   "active",
	}
	menus = append(menus, mapMenu)
	menuMap["map"] = mapMenu.ID

	flightsMenu := models.Menu{
		ID:       uuid.New(),
		ParentID: &trackingMenu.ID,
		Name:     "航班列表",
		Path:     "/flights",
		Icon:     "flight",
		Sort:     2,
		Type:     "menu",
		Status:   "active",
	}
	menus = append(menus, flightsMenu)
	menuMap["flights"] = flightsMenu.ID

	airportsMenu := models.Menu{
		ID:       uuid.New(),
		ParentID: &trackingMenu.ID,
		Name:     "机场信息",
		Path:     "/airports",
		Icon:     "airport",
		Sort:     3,
		Type:     "menu",
		Status:   "active",
	}
	menus = append(menus, airportsMenu)
	menuMap["airports"] = airportsMenu.ID

	// 无人机子菜单
	droneMapMenu := models.Menu{
		ID:       uuid.New(),
		ParentID: &dronesMenu.ID,
		Name:     "无人机地图",
		Path:     "/drones/map",
		Icon:     "location",
		Sort:     1,
		Type:     "menu",
		Status:   "active",
	}
	menus = append(menus, droneMapMenu)
	menuMap["drone-map"] = droneMapMenu.ID

	droneListMenu := models.Menu{
		ID:       uuid.New(),
		ParentID: &dronesMenu.ID,
		Name:     "设备管理",
		Path:     "/drones/list",
		Icon:     "device",
		Sort:     2,
		Type:     "menu",
		Status:   "active",
	}
	menus = append(menus, droneListMenu)
	menuMap["drone-list"] = droneListMenu.ID

	droneMissionsMenu := models.Menu{
		ID:       uuid.New(),
		ParentID: &dronesMenu.ID,
		Name:     "任务管理",
		Path:     "/drones/missions",
		Icon:     "mission",
		Sort:     3,
		Type:     "menu",
		Status:   "active",
	}
	menus = append(menus, droneMissionsMenu)
	menuMap["drone-missions"] = droneMissionsMenu.ID

	// 数据分析子菜单
	analyticsOverviewMenu := models.Menu{
		ID:       uuid.New(),
		ParentID: &analyticsMenu.ID,
		Name:     "数据总览",
		Path:     "/analytics/overview",
		Icon:     "dashboard",
		Sort:     1,
		Type:     "menu",
		Status:   "active",
	}
	menus = append(menus, analyticsOverviewMenu)
	menuMap["analytics-overview"] = analyticsOverviewMenu.ID

	analyticsRoutesMenu := models.Menu{
		ID:       uuid.New(),
		ParentID: &analyticsMenu.ID,
		Name:     "航线分析",
		Path:     "/analytics/routes",
		Icon:     "route",
		Sort:     2,
		Type:     "menu",
		Status:   "active",
	}
	menus = append(menus, analyticsRoutesMenu)
	menuMap["analytics-routes"] = analyticsRoutesMenu.ID

	analyticsTrendsMenu := models.Menu{
		ID:       uuid.New(),
		ParentID: &analyticsMenu.ID,
		Name:     "趋势分析",
		Path:     "/analytics/trends",
		Icon:     "trend",
		Sort:     3,
		Type:     "menu",
		Status:   "active",
	}
	menus = append(menus, analyticsTrendsMenu)
	menuMap["analytics-trends"] = analyticsTrendsMenu.ID

	// 社区子菜单
	communityPostsMenu := models.Menu{
		ID:       uuid.New(),
		ParentID: &communityMenu.ID,
		Name:     "飞行分享",
		Path:     "/community/posts",
		Icon:     "chat",
		Sort:     1,
		Type:     "menu",
		Status:   "active",
	}
	menus = append(menus, communityPostsMenu)
	menuMap["community-posts"] = communityPostsMenu.ID

	communityPhotosMenu := models.Menu{
		ID:       uuid.New(),
		ParentID: &communityMenu.ID,
		Name:     "照片库",
		Path:     "/community/photos",
		Icon:     "photo",
		Sort:     2,
		Type:     "menu",
		Status:   "active",
	}
	menus = append(menus, communityPhotosMenu)
	menuMap["community-photos"] = communityPhotosMenu.ID

	// 系统子菜单
	adminUsersMenu := models.Menu{
		ID:       uuid.New(),
		ParentID: &systemMenu.ID,
		Name:     "用户管理",
		Path:     "/admin/users",
		Icon:     "users",
		Sort:     1,
		Type:     "menu",
		Status:   "active",
	}
	menus = append(menus, adminUsersMenu)
	menuMap["admin-users"] = adminUsersMenu.ID

	adminRolesMenu := models.Menu{
		ID:       uuid.New(),
		ParentID: &systemMenu.ID,
		Name:     "角色管理",
		Path:     "/admin/roles",
		Icon:     "shield",
		Sort:     2,
		Type:     "menu",
		Status:   "active",
	}
	menus = append(menus, adminRolesMenu)
	menuMap["admin-roles"] = adminRolesMenu.ID

	adminMenusMenu := models.Menu{
		ID:       uuid.New(),
		ParentID: &systemMenu.ID,
		Name:     "菜单管理",
		Path:     "/admin/menus",
		Icon:     "menu",
		Sort:     3,
		Type:     "menu",
		Status:   "active",
	}
	menus = append(menus, adminMenusMenu)
	menuMap["admin-menus"] = adminMenusMenu.ID

	adminAirportsMenu := models.Menu{
		ID:       uuid.New(),
		ParentID: &systemMenu.ID,
		Name:     "机场管理",
		Path:     "/admin/airports",
		Icon:     "building",
		Sort:     4,
		Type:     "menu",
		Status:   "active",
	}
	menus = append(menus, adminAirportsMenu)
	menuMap["admin-airports"] = adminAirportsMenu.ID

	adminAirlinesMenu := models.Menu{
		ID:       uuid.New(),
		ParentID: &systemMenu.ID,
		Name:     "航空公司管理",
		Path:     "/admin/airlines",
		Icon:     "briefcase",
		Sort:     5,
		Type:     "menu",
		Status:   "active",
	}
	menus = append(menus, adminAirlinesMenu)
	menuMap["admin-airlines"] = adminAirlinesMenu.ID

	adminAircraftMenu := models.Menu{
		ID:       uuid.New(),
		ParentID: &systemMenu.ID,
		Name:     "飞机管理",
		Path:     "/admin/aircraft",
		Icon:     "paper-airplane",
		Sort:     6,
		Type:     "menu",
		Status:   "active",
	}
	menus = append(menus, adminAircraftMenu)
	menuMap["admin-aircraft"] = adminAircraftMenu.ID

	adminDronesMenu := models.Menu{
		ID:       uuid.New(),
		ParentID: &systemMenu.ID,
		Name:     "无人机管理",
		Path:     "/admin/drones",
		Icon:     "view-grid",
		Sort:     7,
		Type:     "menu",
		Status:   "active",
	}
	menus = append(menus, adminDronesMenu)
	menuMap["admin-drones"] = adminDronesMenu.ID

	adminOperatorsMenu := models.Menu{
		ID:       uuid.New(),
		ParentID: &systemMenu.ID,
		Name:     "运营商管理",
		Path:     "/admin/operators",
		Icon:     "building",
		Sort:     8,
		Type:     "menu",
		Status:   "active",
	}
	menus = append(menus, adminOperatorsMenu)
	menuMap["admin-operators"] = adminOperatorsMenu.ID

	adminNoFlyZonesMenu := models.Menu{
		ID:       uuid.New(),
		ParentID: &systemMenu.ID,
		Name:     "禁飞区管理",
		Path:     "/admin/no-fly-zones",
		Icon:     "ban",
		Sort:     9,
		Type:     "menu",
		Status:   "active",
	}
	menus = append(menus, adminNoFlyZonesMenu)
	menuMap["admin-no-fly-zones"] = adminNoFlyZonesMenu.ID

	adminLogsMenu := models.Menu{
		ID:       uuid.New(),
		ParentID: &systemMenu.ID,
		Name:     "系统日志",
		Path:     "/admin/logs",
		Icon:     "document-text",
		Sort:     10,
		Type:     "menu",
		Status:   "active",
	}
	menus = append(menus, adminLogsMenu)
	menuMap["admin-logs"] = adminLogsMenu.ID

	apiDocsMenu := models.Menu{
		ID:       uuid.New(),
		ParentID: &systemMenu.ID,
		Name:     "API 文档",
		Path:     "/system/api-docs",
		Icon:     "code",
		Sort:     11,
		Type:     "menu",
		Status:   "active",
	}
	menus = append(menus, apiDocsMenu)
	menuMap["api-docs"] = apiDocsMenu.ID

	// 批量插入菜单
	for _, menu := range menus {
		if err := db.Create(&menu).Error; err != nil {
			log.Printf("创建菜单失败 %s: %v", menu.Name, err)
		} else {
			log.Printf("创建菜单成功: %s", menu.Name)
		}
	}

	// 创建角色菜单关联
	log.Println("创建角色菜单关联...")

	// 游客角色 (guest) - 只能访问公开内容
	guestMenus := []string{
		"home", "tracking", "map", "flights", "airports", "about",
	}
	for _, menuKey := range guestMenus {
		roleMenu := models.RoleMenu{
			ID:     uuid.New(),
			RoleID: roles[0].ID, // guest
			MenuID: menuMap[menuKey],
		}
		if err := db.Create(&roleMenu).Error; err != nil {
			log.Printf("创建角色菜单关联失败: %v", err)
		}
	}

	// 普通用户 (user) - 包含游客权限 + 无人机 + 社区
	userMenus := []string{
		"home", "tracking", "map", "flights", "airports",
		"drones", "drone-map", "drone-list", "drone-missions",
		"community", "community-posts", "community-photos",
		"about",
	}
	for _, menuKey := range userMenus {
		roleMenu := models.RoleMenu{
			ID:     uuid.New(),
			RoleID: roles[1].ID, // user
			MenuID: menuMap[menuKey],
		}
		if err := db.Create(&roleMenu).Error; err != nil {
			log.Printf("创建角色菜单关联失败: %v", err)
		}
	}

	// 高级用户 (premium) - 包含普通用户权限 + 数据分析
	premiumMenus := []string{
		"home", "tracking", "map", "flights", "airports",
		"drones", "drone-map", "drone-list", "drone-missions",
		"analytics", "analytics-overview", "analytics-routes", "analytics-trends",
		"community", "community-posts", "community-photos",
		"about",
	}
	for _, menuKey := range premiumMenus {
		roleMenu := models.RoleMenu{
			ID:     uuid.New(),
			RoleID: roles[2].ID, // premium
			MenuID: menuMap[menuKey],
		}
		if err := db.Create(&roleMenu).Error; err != nil {
			log.Printf("创建角色菜单关联失败: %v", err)
		}
	}

	// 管理员 (admin) - 所有菜单
	for _, menuID := range menuMap {
		roleMenu := models.RoleMenu{
			ID:     uuid.New(),
			RoleID: roles[3].ID, // admin
			MenuID: menuID,
		}
		if err := db.Create(&roleMenu).Error; err != nil {
			log.Printf("创建角色菜单关联失败: %v", err)
		}
	}

	log.Println("菜单和角色数据填充完成！")
	log.Printf("共创建 %d 个菜单", len(menus))
	log.Printf("共创建 %d 个角色", len(roles))
}
