import 'package:flutter/material.dart';
import '../../../app/theme.dart';
import '../../../shared/mock/mock_data.dart';

/// 通知列表页面
class NotificationListScreen extends StatefulWidget {
  const NotificationListScreen({super.key});

  @override
  State<NotificationListScreen> createState() => _NotificationListScreenState();
}

class _NotificationListScreenState extends State<NotificationListScreen> {
  late List<MockNotification> _notifications;

  @override
  void initState() {
    super.initState();
    _notifications = MockDataProvider.getMockNotifications();
  }

  void _markAsRead(int index) {
    // Mock: 由于模型是 immutable，这里只做 UI 反馈
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('已标记为已读')));
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(title: const Text('通知')),
      body: _notifications.isEmpty
          ? Center(child: Text('暂无通知', style: TextStyle(color: theme.colorScheme.onSurface.withValues(alpha: 0.5))))
          : ListView.separated(
              padding: const EdgeInsets.all(AppTheme.spacingMd),
              itemCount: _notifications.length,
              separatorBuilder: (_, __) => const SizedBox(height: 4),
              itemBuilder: (context, index) {
                final n = _notifications[index];
                return Card(
                  margin: EdgeInsets.zero,
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: _typeColor(n.type).withValues(alpha: 0.12),
                      child: Icon(_typeIcon(n.type), color: _typeColor(n.type), size: 20),
                    ),
                    title: Text(n.title, style: TextStyle(fontSize: 14, fontWeight: n.isRead ? FontWeight.w400 : FontWeight.w600)),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(n.body, style: const TextStyle(fontSize: 12), maxLines: 2, overflow: TextOverflow.ellipsis),
                        const SizedBox(height: 4),
                        Text(_formatTime(n.receivedAt), style: TextStyle(fontSize: 11, color: theme.colorScheme.onSurface.withValues(alpha: 0.4))),
                      ],
                    ),
                    isThreeLine: true,
                    trailing: n.isRead ? null : Container(width: 8, height: 8, decoration: BoxDecoration(shape: BoxShape.circle, color: theme.colorScheme.primary)),
                    onTap: () => _markAsRead(index),
                  ),
                );
              },
            ),
    );
  }

  String _formatTime(DateTime dt) {
    final now = DateTime.now();
    final diff = now.difference(dt);
    if (diff.inMinutes < 60) return '${diff.inMinutes} 分钟前';
    if (diff.inHours < 24) return '${diff.inHours} 小时前';
    return '${dt.month}/${dt.day}';
  }

  IconData _typeIcon(NotificationType t) {
    switch (t) {
      case NotificationType.flightDeparture: return Icons.flight_takeoff;
      case NotificationType.flightArrival: return Icons.flight_land;
      case NotificationType.flightDelay: return Icons.schedule;
      case NotificationType.flightGateChange: return Icons.door_sliding;
      case NotificationType.flightCancelled: return Icons.cancel;
      case NotificationType.droneLowBattery: return Icons.battery_alert;
      case NotificationType.droneNoFlyZoneWarning: return Icons.warning;
      case NotificationType.droneEmergency: return Icons.emergency;
      case NotificationType.missionStarted: return Icons.play_circle;
      case NotificationType.missionCompleted: return Icons.check_circle;
      case NotificationType.systemMessage: return Icons.info;
    }
  }

  Color _typeColor(NotificationType t) {
    switch (t) {
      case NotificationType.flightDeparture:
      case NotificationType.flightArrival:
      case NotificationType.missionStarted:
      case NotificationType.missionCompleted:
        return AppTheme.infoColor;
      case NotificationType.flightDelay:
      case NotificationType.flightGateChange:
      case NotificationType.droneLowBattery:
      case NotificationType.droneNoFlyZoneWarning:
        return AppTheme.warningColor;
      case NotificationType.flightCancelled:
      case NotificationType.droneEmergency:
        return AppTheme.errorColor;
      case NotificationType.systemMessage:
        return AppTheme.statusScheduled;
    }
  }
}
