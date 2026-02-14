import 'package:flutter/material.dart';
import '../../../app/theme.dart';
import '../../../shared/mock/mock_data.dart';

/// 无人机详情页面
class DroneDetailScreen extends StatelessWidget {
  const DroneDetailScreen({super.key, required this.droneId});
  final String droneId;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final drone = MockDataProvider.getMockDrones().where((d) => d.id == droneId).firstOrNull;
    if (drone == null) {
      return Scaffold(appBar: AppBar(title: const Text('无人机详情')), body: const Center(child: Text('设备不存在')));
    }
    final missions = MockDataProvider.getMissionsByDrone(droneId);

    return Scaffold(
      appBar: AppBar(title: Text(drone.name)),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppTheme.spacingMd),
        child: Column(
          children: [
            // 基本信息
            Card(
              margin: EdgeInsets.zero,
              child: Padding(
                padding: const EdgeInsets.all(AppTheme.spacingMd),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('设备信息', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: theme.colorScheme.primary)),
                    const SizedBox(height: AppTheme.spacingMd),
                    _row('型号', drone.model),
                    _row('制造商', drone.manufacturer),
                    _row('序列号', drone.serialNumber),
                    _row('类别', _categoryLabel(drone.category)),
                    if (drone.cameraModel != null) _row('相机', drone.cameraModel!),
                  ],
                ),
              ),
            ),
            const SizedBox(height: AppTheme.spacingMd),
            // 实时状态
            Card(
              margin: EdgeInsets.zero,
              child: Padding(
                padding: const EdgeInsets.all(AppTheme.spacingMd),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('实时状态', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: theme.colorScheme.primary)),
                    const SizedBox(height: AppTheme.spacingMd),
                    // 电量进度条
                    Row(
                      children: [
                        const Text('电量', style: TextStyle(fontSize: 14)),
                        const SizedBox(width: AppTheme.spacingMd),
                        Expanded(
                          child: LinearProgressIndicator(
                            value: drone.batteryLevel / 100,
                            backgroundColor: theme.colorScheme.onSurface.withValues(alpha: 0.1),
                            color: drone.batteryLevel > 20 ? AppTheme.successColor : AppTheme.errorColor,
                          ),
                        ),
                        const SizedBox(width: AppTheme.spacingSm),
                        Text('${drone.batteryLevel}%', style: const TextStyle(fontWeight: FontWeight.w600)),
                      ],
                    ),
                    const SizedBox(height: AppTheme.spacingSm),
                    if (drone.altitude != null) _row('高度', '${drone.altitude} 米'),
                    if (drone.speed != null) _row('速度', '${drone.speed} m/s'),
                    _row('最大飞行高度', '${drone.maxAltitude.toInt()} 米'),
                    _row('最大速度', '${drone.maxSpeed.toInt()} m/s'),
                    _row('续航时间', '${drone.batteryLife} 分钟'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: AppTheme.spacingMd),
            // 飞行任务
            Card(
              margin: EdgeInsets.zero,
              child: Padding(
                padding: const EdgeInsets.all(AppTheme.spacingMd),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('飞行任务', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: theme.colorScheme.primary)),
                    const SizedBox(height: AppTheme.spacingSm),
                    if (missions.isEmpty)
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: AppTheme.spacingMd),
                        child: Center(child: Text('暂无任务', style: TextStyle(color: theme.colorScheme.onSurface.withValues(alpha: 0.5)))),
                      )
                    else
                      ...missions.map((m) => ListTile(
                        contentPadding: EdgeInsets.zero,
                        title: Text(m.missionName, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
                        subtitle: Text(m.area, style: const TextStyle(fontSize: 12)),
                        trailing: Text(_missionStatusLabel(m.status), style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: _missionStatusColor(m.status))),
                      )),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _row(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 14, color: Color(0xFF757575))),
          Text(value, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }

  String _categoryLabel(DroneCategory c) {
    switch (c) {
      case DroneCategory.commercial: return '商用';
      case DroneCategory.industrial: return '工业';
      case DroneCategory.agricultural: return '农业';
      case DroneCategory.photography: return '航拍';
      case DroneCategory.delivery: return '物流配送';
      case DroneCategory.rescue: return '应急救援';
    }
  }

  String _missionStatusLabel(MissionStatus s) {
    switch (s) {
      case MissionStatus.pending: return '待执行';
      case MissionStatus.inProgress: return '执行中';
      case MissionStatus.completed: return '已完成';
      case MissionStatus.failed: return '失败';
      case MissionStatus.cancelled: return '已取消';
      case MissionStatus.paused: return '暂停';
    }
  }

  Color _missionStatusColor(MissionStatus s) {
    switch (s) {
      case MissionStatus.pending: return AppTheme.statusScheduled;
      case MissionStatus.inProgress: return AppTheme.statusEnRoute;
      case MissionStatus.completed: return AppTheme.successColor;
      case MissionStatus.failed: return AppTheme.errorColor;
      case MissionStatus.cancelled: return AppTheme.statusCancelled;
      case MissionStatus.paused: return AppTheme.warningColor;
    }
  }
}
