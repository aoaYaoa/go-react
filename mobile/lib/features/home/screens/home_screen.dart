import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:go_router/go_router.dart';
import 'package:latlong2/latlong.dart';
import '../../../app/theme.dart';
import '../../../shared/mock/mock_data.dart';
import '../../../shared/widgets/glass_card.dart';

/// 首页
class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  late List<Flight> _followedFlights;
  late List<Drone> _flyingDrones;
  late MockUser _user;
  late int _unreadCount;

  @override
  void initState() {
    super.initState();
    _followedFlights = MockDataProvider.getFollowedFlights();
    _flyingDrones = MockDataProvider.getMockDrones().where((d) => d.status == DroneStatus.flying).toList();
    _user = MockDataProvider.getCurrentUser();
    _unreadCount = MockDataProvider.getUnreadNotificationCount();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: const Text('SkyTracker'),
        actions: [
          Stack(
            children: [
              IconButton(
                icon: const Icon(Icons.notifications_outlined),
                onPressed: () => context.push('/notifications'),
              ),
              if (_unreadCount > 0)
                Positioned(
                  right: 8, top: 8,
                  child: Container(
                    width: 16, height: 16,
                    decoration: const BoxDecoration(color: AppTheme.errorColor, shape: BoxShape.circle),
                    child: Center(child: Text('$_unreadCount', style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w700))),
                  ),
                ),
            ],
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          setState(() {
            _followedFlights = MockDataProvider.getFollowedFlights();
            _flyingDrones = MockDataProvider.getMockDrones().where((d) => d.status == DroneStatus.flying).toList();
          });
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.fromLTRB(AppTheme.spacingMd, AppTheme.spacingMd, AppTheme.spacingMd, 100),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('你好, ${_user.username}', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: theme.colorScheme.onSurface)),
              const SizedBox(height: 4),
              Text('实时追踪航班与无人机', style: TextStyle(fontSize: 14, color: theme.colorScheme.onSurface.withValues(alpha: 0.6))),
              const SizedBox(height: AppTheme.spacingMd),
              _buildMapOverview(theme),
              const SizedBox(height: AppTheme.spacingLg),
              _buildQuickActions(theme),
              const SizedBox(height: AppTheme.spacingLg),
              _buildSectionTitle(theme, '关注的航班', onTap: () => context.go('/flights')),
              const SizedBox(height: AppTheme.spacingSm),
              ..._followedFlights.map((f) => _buildFollowedFlightCard(f, theme)),
              if (_flyingDrones.isNotEmpty) ...[
                const SizedBox(height: AppTheme.spacingLg),
                _buildSectionTitle(theme, '飞行中的无人机', onTap: () => context.go('/drones')),
                const SizedBox(height: AppTheme.spacingSm),
                ..._flyingDrones.map((d) => _buildDroneCard(d, theme)),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMapOverview(ThemeData theme) {
    final airportMarkers = MockDataProvider.airports.map((a) {
      return Marker(
        point: LatLng(a.latitude, a.longitude),
        width: 30, height: 30,
        child: GestureDetector(
          onTap: () => context.push('/airports/${a.id}'),
          child: Tooltip(
            message: '${a.code} ${a.city}',
            child: const Icon(Icons.location_on, color: AppTheme.primaryColor, size: 28),
          ),
        ),
      );
    }).toList();

    final droneMarkers = _flyingDrones.where((d) => d.latitude != null && d.longitude != null).map((d) {
      return Marker(
        point: LatLng(d.latitude!, d.longitude!),
        width: 24, height: 24,
        child: GestureDetector(
          onTap: () => context.push('/drones/${d.id}'),
          child: const Icon(Icons.airplanemode_active, color: AppTheme.successColor, size: 22),
        ),
      );
    }).toList();

    return ClipRRect(
      borderRadius: BorderRadius.circular(AppTheme.radiusMd),
      child: SizedBox(
        height: 220,
        child: FlutterMap(
          options: const MapOptions(
            initialCenter: LatLng(34.0, 108.0),
            initialZoom: 3.8,
            interactionOptions: InteractionOptions(flags: InteractiveFlag.all),
          ),
          children: [
            TileLayer(
              urlTemplate: 'https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
            ),
            MarkerLayer(markers: [...airportMarkers, ...droneMarkers]),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickActions(ThemeData theme) {
    final actions = [
      _QuickAction(icon: Icons.search, label: '搜索航班', color: AppTheme.primaryColor, onTap: () => context.go('/flights')),
      _QuickAction(icon: Icons.location_city, label: '附近机场', color: AppTheme.secondaryColor, onTap: () => context.go('/airports')),
      _QuickAction(icon: Icons.qr_code_scanner, label: '扫描登机牌', color: AppTheme.successColor, onTap: () => context.push('/scanner')),
      _QuickAction(icon: Icons.airplanemode_active, label: '无人机', color: AppTheme.warningColor, onTap: () => context.go('/drones')),
    ];
    return GlassCard(
      padding: const EdgeInsets.symmetric(vertical: AppTheme.spacingMd, horizontal: AppTheme.spacingSm),
      child: Row(
        children: actions.map((a) {
          return Expanded(
            child: GestureDetector(
              onTap: a.onTap,
              child: Column(
                children: [
                  Container(
                    width: 48, height: 48,
                    decoration: BoxDecoration(
                      color: a.color.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Icon(a.icon, color: a.color, size: 24),
                  ),
                  const SizedBox(height: 6),
                  Text(a.label, style: TextStyle(fontSize: 11, color: theme.colorScheme.onSurface.withValues(alpha: 0.7))),
                ],
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildSectionTitle(ThemeData theme, String title, {VoidCallback? onTap}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(title, style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: theme.colorScheme.onSurface)),
        if (onTap != null)
          GestureDetector(
            onTap: onTap,
            child: Text('查看全部', style: TextStyle(fontSize: 13, color: theme.colorScheme.primary)),
          ),
      ],
    );
  }

  Widget _buildFollowedFlightCard(Flight f, ThemeData theme) {
    return GlassCard(
      margin: const EdgeInsets.only(bottom: AppTheme.spacingSm),
      onTap: () => context.push('/flights/${f.id}'),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(f.flightNumber, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                    const SizedBox(width: 8),
                    _buildStatusChip(f.status),
                  ],
                ),
                const SizedBox(height: 6),
                Text('${f.departureCity} (${f.departureAirport}) -> ${f.arrivalCity} (${f.arrivalAirport})',
                    style: TextStyle(fontSize: 13, color: theme.colorScheme.onSurface.withValues(alpha: 0.6))),
                const SizedBox(height: 4),
                Text(_formatFlightTime(f), style: TextStyle(fontSize: 12, color: theme.colorScheme.onSurface.withValues(alpha: 0.5))),
              ],
            ),
          ),
          Icon(Icons.chevron_right, color: theme.colorScheme.onSurface.withValues(alpha: 0.3)),
        ],
      ),
    );
  }

  Widget _buildDroneCard(Drone d, ThemeData theme) {
    return GlassCard(
      margin: const EdgeInsets.only(bottom: AppTheme.spacingSm),
      onTap: () => context.push('/drones/${d.id}'),
      child: Row(
        children: [
          CircleAvatar(
            backgroundColor: AppTheme.statusEnRoute.withValues(alpha: 0.12),
            child: const Icon(Icons.airplanemode_active, color: AppTheme.statusEnRoute, size: 20),
          ),
          const SizedBox(width: AppTheme.spacingMd),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(d.name, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                const SizedBox(height: 4),
                Text('电量 ${d.batteryLevel}% | 高度 ${d.altitude ?? 0}m | 速度 ${d.speed ?? 0}m/s',
                    style: TextStyle(fontSize: 12, color: theme.colorScheme.onSurface.withValues(alpha: 0.6))),
              ],
            ),
          ),
          Icon(Icons.chevron_right, color: theme.colorScheme.onSurface.withValues(alpha: 0.3)),
        ],
      ),
    );
  }

  Widget _buildStatusChip(FlightStatus s) {
    Color color;
    String label;
    switch (s) {
      case FlightStatus.scheduled: color = AppTheme.statusScheduled; label = '计划中';
      case FlightStatus.boarding: color = AppTheme.statusBoarding; label = '登机中';
      case FlightStatus.departed: color = AppTheme.statusDeparted; label = '已起飞';
      case FlightStatus.enRoute: color = AppTheme.statusEnRoute; label = '飞行中';
      case FlightStatus.landed: color = AppTheme.statusLanded; label = '已降落';
      case FlightStatus.arrived: color = AppTheme.statusLanded; label = '已到达';
      case FlightStatus.delayed: color = AppTheme.statusDelayed; label = '延误';
      case FlightStatus.cancelled: color = AppTheme.statusCancelled; label = '已取消';
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(color: color.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(AppTheme.radiusSm)),
      child: Text(label, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: color)),
    );
  }

  String _formatFlightTime(Flight f) {
    if (f.scheduledDeparture == null) return '--';
    final dep = f.scheduledDeparture!;
    final arr = f.scheduledArrival;
    final depStr = '${dep.hour.toString().padLeft(2, '0')}:${dep.minute.toString().padLeft(2, '0')}';
    if (arr == null) return '出发 $depStr';
    final arrStr = '${arr.hour.toString().padLeft(2, '0')}:${arr.minute.toString().padLeft(2, '0')}';
    return '$depStr - $arrStr';
  }
}

class _QuickAction {
  const _QuickAction({required this.icon, required this.label, required this.color, required this.onTap});
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;
}
