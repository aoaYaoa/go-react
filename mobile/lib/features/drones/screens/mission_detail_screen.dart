import 'package:flutter/material.dart';
import '../../../app/theme.dart';
import '../../../shared/mock/mock_data.dart';

/// 任务详情页面
class MissionDetailScreen extends StatelessWidget {
  const MissionDetailScreen({super.key, required this.missionId});
  final String missionId;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final mission = MockDataProvider.getMockMissions().where((m) => m.id == missionId).firstOrNull;
    if (mission == null) {
      return Scaffold(appBar: AppBar(title: const Text('任务详情')), body: const Center(child: Text('任务不存在')));
    }

    return Scaffold(
      appBar: AppBar(title: Text(mission.missionName)),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppTheme.spacingMd),
        child: Column(
          children: [
            // 任务信息
            Card(
              margin: EdgeInsets.zero,
              child: Padding(
                padding: const EdgeInsets.all(AppTheme.spacingMd),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('任务信息', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: theme.colorScheme.primary)),
                    const SizedBox(height: AppTheme.spacingMd),
                    _row('任务名称', mission.missionName),
                    _row('无人机', mission.droneName),
                    _row('任务类型', _typeLabel(mission.missionType)),
                    _row('作业区域', mission.area),
                    _row('计划开始', _formatDateTime(mission.plannedStartTime)),
                    _row('计划结束', _formatDateTime(mission.plannedEndTime)),
                    if (mission.status == MissionStatus.inProgress) ...[
                      const SizedBox(height: AppTheme.spacingSm),
                      Row(
                        children: [
                          const Text('进度', style: TextStyle(fontSize: 14)),
                          const SizedBox(width: AppTheme.spacingMd),
                          Expanded(child: LinearProgressIndicator(value: mission.progress / 100)),
                          const SizedBox(width: AppTheme.spacingSm),
                          Text('${mission.progress}%', style: const TextStyle(fontWeight: FontWeight.w600)),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
            ),
            const SizedBox(height: AppTheme.spacingMd),
            // 航线地图占位
            Card(
              margin: EdgeInsets.zero,
              child: Container(
                height: 200,
                width: double.infinity,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                  color: theme.colorScheme.surfaceContainerHighest,
                ),
                child: Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.map_outlined, size: 48, color: theme.colorScheme.onSurface.withValues(alpha: 0.3)),
                      const SizedBox(height: 8),
                      Text('航线地图', style: TextStyle(color: theme.colorScheme.onSurface.withValues(alpha: 0.5))),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: AppTheme.spacingLg),
            // 操作按钮
            if (mission.status == MissionStatus.pending)
              ElevatedButton.icon(
                onPressed: () => ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('飞行前检查中...'))),
                icon: const Icon(Icons.play_arrow),
                label: const Text('开始任务'),
              ),
            if (mission.status == MissionStatus.inProgress) ...[
              ElevatedButton.icon(
                onPressed: () => _showEmergencyDialog(context),
                icon: const Icon(Icons.warning),
                label: const Text('紧急返航'),
                style: ElevatedButton.styleFrom(backgroundColor: AppTheme.errorColor),
              ),
            ],
          ],
        ),
      ),
    );
  }

  void _showEmergencyDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('确认紧急返航'),
        content: const Text('无人机将立即中止当前任务并返回起飞点，确认执行?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('取消')),
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('已发送返航指令')));
            },
            child: const Text('确认返航', style: TextStyle(color: AppTheme.errorColor)),
          ),
        ],
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
          Flexible(child: Text(value, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500), textAlign: TextAlign.end)),
        ],
      ),
    );
  }

  String _formatDateTime(DateTime dt) => '${dt.month}/${dt.day} ${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';

  String _typeLabel(MissionType t) {
    switch (t) {
      case MissionType.inspection: return '巡检';
      case MissionType.mapping: return '测绘';
      case MissionType.delivery: return '配送';
      case MissionType.surveillance: return '监控';
      case MissionType.agriculture: return '农业植保';
      case MissionType.rescue: return '搜救';
      case MissionType.photography: return '航拍';
    }
  }
}
