import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:go_router/go_router.dart';
import 'package:latlong2/latlong.dart';
import '../../../app/theme.dart';
import '../../../shared/mock/mock_data.dart';
import '../../../shared/widgets/glass_card.dart';

/// 无人机地图页面
/// 使用 flutter_map 显示无人机实时位置
class DroneMapScreen extends StatefulWidget {
  const DroneMapScreen({super.key});

  @override
  State<DroneMapScreen> createState() => _DroneMapScreenState();
}

class _DroneMapScreenState extends State<DroneMapScreen> {
  late List<Drone> _drones;

  @override
  void initState() {
    super.initState();
    _drones = MockDataProvider.getMockDrones();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final flyingCount = _drones.where((d) => d.status == DroneStatus.flying).length;

    return Scaffold(
      appBar: AppBar(
        title: const Text('无人机监控'),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: AppTheme.spacingMd),
            child: Center(
              child: Text('$flyingCount 架飞行中',
                  style: TextStyle(fontSize: 13, color: theme.colorScheme.primary, fontWeight: FontWeight.w600)),
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          // 地图区域
          SizedBox(
            height: 260,
            child: _buildDroneMap(theme),
          ),
          // 无人机列表
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: AppTheme.spacingMd),
              itemCount: _drones.length,
              itemBuilder: (context, index) {
                final drone = _drones[index];
                return GlassCard(
                  margin: const EdgeInsets.only(bottom: AppTheme.spacingSm),
                  onTap: () => context.push('/drones/${drone.id}'),
                  child: Row(
                    children: [
                      CircleAvatar(
                        backgroundColor: _droneStatusColor(drone.status).withValues(alpha: 0.12),
                        child: Icon(Icons.airplanemode_active, color: _droneStatusColor(drone.status), size: 20),
                      ),
                      const SizedBox(width: AppTheme.spacingMd),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(drone.name, style: const TextStyle(fontWeight: FontWeight.w600)),
                            const SizedBox(height: 2),
                            Text('${drone.model} | 电量 ${drone.batteryLevel}%',
                                style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.6))),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: _droneStatusColor(drone.status).withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(AppTheme.radiusSm),
                        ),
                        child: Text(_droneStatusLabel(drone.status),
                            style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: _droneStatusColor(drone.status))),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  /// 无人机地图
  Widget _buildDroneMap(ThemeData theme) {
    // 构建无人机标记
    final markers = _drones
        .where((d) => d.latitude != null && d.longitude != null)
        .map((d) {
      final color = _droneStatusColor(d.status);
      return Marker(
        point: LatLng(d.latitude!, d.longitude!),
        width: 36, height: 36,
        child: GestureDetector(
          onTap: () => context.push('/drones/${d.id}'),
          child: Tooltip(
            message: '${d.name} (${_droneStatusLabel(d.status)})',
            child: Container(
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.15),
                shape: BoxShape.circle,
                border: Border.all(color: color, width: 2),
              ),
              child: Icon(Icons.airplanemode_active, color: color, size: 18),
            ),
          ),
        ),
      );
    }).toList();

    return FlutterMap(
      options: const MapOptions(
        initialCenter: LatLng(31.0, 114.0), // 中国中部
        initialZoom: 4.0,
        interactionOptions: InteractionOptions(flags: InteractiveFlag.all),
      ),
      children: [
        TileLayer(
          urlTemplate: 'https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
        ),
        MarkerLayer(markers: markers),
      ],
    );
  }

  String _droneStatusLabel(DroneStatus s) {
    switch (s) {
      case DroneStatus.idle: return '空闲';
      case DroneStatus.flying: return '飞行中';
      case DroneStatus.maintenance: return '维护中';
      case DroneStatus.offline: return '离线';
      case DroneStatus.charging: return '充电中';
      case DroneStatus.returning: return '返航中';
    }
  }

  Color _droneStatusColor(DroneStatus s) {
    switch (s) {
      case DroneStatus.idle: return AppTheme.statusScheduled;
      case DroneStatus.flying: return AppTheme.statusEnRoute;
      case DroneStatus.maintenance: return AppTheme.warningColor;
      case DroneStatus.offline: return AppTheme.errorColor;
      case DroneStatus.charging: return AppTheme.infoColor;
      case DroneStatus.returning: return AppTheme.warningColor;
    }
  }
}
