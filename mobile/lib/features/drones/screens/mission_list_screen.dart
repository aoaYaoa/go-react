import 'package:flutter/material.dart';
import '../../../app/theme.dart';
import '../../../shared/mock/mock_data.dart';

/// 任务列表页面
class MissionListScreen extends StatelessWidget {
  const MissionListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final missions = MockDataProvider.getMockMissions()
      ..sort((a, b) => a.plannedStartTime.compareTo(b.plannedStartTime));

    return Scaffold(
      appBar: AppBar(title: const Text('飞行任务')),
      body: ListView.builder(
        padding: const EdgeInsets.all(AppTheme.spacingMd),
        itemCount: missions.length,
        itemBuilder: (context, index) {
          final m = missions[index];
          return Card(
            margin: const EdgeInsets.only(bottom: AppTheme.spacingSm),
            child: Padding(
              padding: const EdgeInsets.all(AppTheme.spacingMd),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(child: Text(m.missionName, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600))),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: _statusColor(m.status).withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(AppTheme.radiusSm),
                        ),
                        child: Text(_statusLabel(m.status), style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: _statusColor(m.status))),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text('${m.droneName} | ${m.area}', style: TextStyle(fontSize: 13, color: theme.colorScheme.onSurface.withValues(alpha: 0.6))),
                  const SizedBox(height: 6),
                  Text('${_formatTime(m.plannedStartTime)} - ${_formatTime(m.plannedEndTime)}',
                      style: TextStyle(fontSize: 12, color: theme.colorScheme.onSurface.withValues(alpha: 0.5))),
                  if (m.status == MissionStatus.inProgress) ...[
                    const SizedBox(height: 8),
                    LinearProgressIndicator(value: m.progress / 100, backgroundColor: theme.colorScheme.onSurface.withValues(alpha: 0.1)),
                    const SizedBox(height: 4),
                    Text('${m.progress}%', style: TextStyle(fontSize: 12, color: theme.colorScheme.primary)),
                  ],
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  String _formatTime(DateTime dt) => '${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';

  String _statusLabel(MissionStatus s) {
    switch (s) {
      case MissionStatus.pending: return '待执行';
      case MissionStatus.inProgress: return '执行中';
      case MissionStatus.completed: return '已完成';
      case MissionStatus.failed: return '失败';
      case MissionStatus.cancelled: return '已取消';
      case MissionStatus.paused: return '暂停';
    }
  }

  Color _statusColor(MissionStatus s) {
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
