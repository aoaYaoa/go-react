import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../features/home/screens/home_screen.dart';
import '../features/flights/screens/flight_list_screen.dart';
import '../features/flights/screens/flight_detail_screen.dart';
import '../features/airports/screens/airport_list_screen.dart';
import '../features/airports/screens/airport_detail_screen.dart';
import '../features/drones/screens/drone_map_screen.dart';
import '../features/drones/screens/drone_detail_screen.dart';
import '../features/profile/screens/profile_screen.dart';
import '../features/auth/screens/login_screen.dart';
import '../features/auth/screens/register_screen.dart';
import '../features/scanner/screens/boarding_pass_scanner_screen.dart';
import '../features/notifications/screens/notification_list_screen.dart';
import '../features/ar_view/screens/ar_view_screen.dart';

/// 路由路径常量
class RoutePaths {
  RoutePaths._();

  static const String home = '/';
  static const String flights = '/flights';
  static const String flightDetail = '/flights/:id';
  static const String airports = '/airports';
  static const String airportDetail = '/airports/:id';
  static const String drones = '/drones';
  static const String droneDetail = '/drones/:id';
  static const String profile = '/profile';
  static const String login = '/login';
  static const String register = '/register';
  static const String scanner = '/scanner';
  static const String notifications = '/notifications';
  static const String ar = '/ar';
}

/// 导航器 Key
final _rootNavigatorKey = GlobalKey<NavigatorState>();
final _shellNavigatorKey = GlobalKey<NavigatorState>();

/// 应用路由配置
final GoRouter appRouter = GoRouter(
  navigatorKey: _rootNavigatorKey,
  initialLocation: RoutePaths.home,
  routes: [
    // 底部导航栏 ShellRoute
    ShellRoute(
      navigatorKey: _shellNavigatorKey,
      builder: (context, state, child) {
        return _ScaffoldWithNavBar(child: child);
      },
      routes: [
        GoRoute(
          path: RoutePaths.home,
          pageBuilder: (context, state) => const NoTransitionPage(
            child: HomeScreen(),
          ),
        ),
        GoRoute(
          path: RoutePaths.flights,
          pageBuilder: (context, state) => const NoTransitionPage(
            child: FlightListScreen(),
          ),
        ),
        GoRoute(
          path: RoutePaths.airports,
          pageBuilder: (context, state) => const NoTransitionPage(
            child: AirportListScreen(),
          ),
        ),
        GoRoute(
          path: RoutePaths.drones,
          pageBuilder: (context, state) => const NoTransitionPage(
            child: DroneMapScreen(),
          ),
        ),
        GoRoute(
          path: RoutePaths.profile,
          pageBuilder: (context, state) => const NoTransitionPage(
            child: ProfileScreen(),
          ),
        ),
      ],
    ),

    // 详情页和独立页面（不显示底部导航栏）
    GoRoute(
      path: RoutePaths.flightDetail,
      builder: (context, state) {
        final id = state.pathParameters['id'] ?? '';
        return FlightDetailScreen(flightId: id);
      },
    ),
    GoRoute(
      path: RoutePaths.airportDetail,
      builder: (context, state) {
        final id = state.pathParameters['id'] ?? '';
        return AirportDetailScreen(airportId: id);
      },
    ),
    GoRoute(
      path: RoutePaths.droneDetail,
      builder: (context, state) {
        final id = state.pathParameters['id'] ?? '';
        return DroneDetailScreen(droneId: id);
      },
    ),
    GoRoute(
      path: RoutePaths.login,
      builder: (context, state) => const LoginScreen(),
    ),
    GoRoute(
      path: RoutePaths.register,
      builder: (context, state) => const RegisterScreen(),
    ),
    GoRoute(
      path: RoutePaths.scanner,
      builder: (context, state) => const BoardingPassScannerScreen(),
    ),
    GoRoute(
      path: RoutePaths.notifications,
      builder: (context, state) => const NotificationListScreen(),
    ),
    GoRoute(
      path: RoutePaths.ar,
      builder: (context, state) => const ArViewScreen(),
    ),
  ],
);

/// 底部导航栏项定义
class _NavBarItem {
  const _NavBarItem({
    required this.path,
    required this.icon,
    required this.activeIcon,
    required this.label,
  });

  final String path;
  final IconData icon;
  final IconData activeIcon;
  final String label;
}

const _navBarItems = [
  _NavBarItem(
    path: RoutePaths.home,
    icon: Icons.home_outlined,
    activeIcon: Icons.home,
    label: '首页',
  ),
  _NavBarItem(
    path: RoutePaths.flights,
    icon: Icons.flight_outlined,
    activeIcon: Icons.flight,
    label: '航班',
  ),
  _NavBarItem(
    path: RoutePaths.airports,
    icon: Icons.location_city_outlined,
    activeIcon: Icons.location_city,
    label: '机场',
  ),
  _NavBarItem(
    path: RoutePaths.drones,
    icon: Icons.airplanemode_active_outlined,
    activeIcon: Icons.airplanemode_active,
    label: '无人机',
  ),
  _NavBarItem(
    path: RoutePaths.profile,
    icon: Icons.person_outline,
    activeIcon: Icons.person,
    label: '我的',
  ),
];

/// 带底部导航栏的 Scaffold 容器
class _ScaffoldWithNavBar extends StatelessWidget {
  const _ScaffoldWithNavBar({required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBody: true,
      body: child,
      bottomNavigationBar: ClipRect(
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 16, sigmaY: 16),
          child: NavigationBar(
            selectedIndex: _calculateSelectedIndex(context),
            onDestinationSelected: (index) => _onItemTapped(index, context),
            destinations: _navBarItems
                .map(
                  (item) => NavigationDestination(
                    icon: Icon(item.icon),
                    selectedIcon: Icon(item.activeIcon),
                    label: item.label,
                  ),
                )
                .toList(),
          ),
        ),
      ),
    );
  }

  /// 根据当前路由路径计算选中的 Tab 索引
  int _calculateSelectedIndex(BuildContext context) {
    final location = GoRouterState.of(context).uri.path;
    for (int i = 0; i < _navBarItems.length; i++) {
      if (location == _navBarItems[i].path) {
        return i;
      }
    }
    return 0;
  }

  /// 处理 Tab 点击事件
  void _onItemTapped(int index, BuildContext context) {
    context.go(_navBarItems[index].path);
  }
}
