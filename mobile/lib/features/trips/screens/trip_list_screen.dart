import 'package:flutter/material.dart';
import '../../../app/theme.dart';
import '../../../shared/mock/mock_data.dart';

/// 行程列表页面
class TripListScreen extends StatelessWidget {
  const TripListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    // 使用前5个航班模拟行程
    final trips = MockDataProvider.getMockFlights().take(5).toList()
      ..sort((a, b) {
        final ta = a.scheduledDeparture;
        final tb = b.scheduledDeparture;
        if (ta == null && tb == null) return 0;
        if (ta == null) return 1;
        if (tb == null) return -1;
        return ta.compareTo(tb);
      });

    return Scaffold(
      appBar: AppBar(title: const Text('我的行程')),
      body: ListView.builder(
        padding: const EdgeInsets.all(AppTheme.spacingMd),
        itemCount: trips.length,
        itemBuilder: (context, index) {
          final f = trips[index];
          return Card(
            margin: const EdgeInsets.only(bottom: AppTheme.spacingSm),
            child: ListTile(
              leading: Icon(Icons.flight, color: theme.colorScheme.primary),
              title: Text('${f.flightNumber}  ${f.departureCity} - ${f.arrivalCity}', style: const TextStyle(fontWeight: FontWeight.w600)),
              subtitle: Text(
                f.scheduledDeparture != null
                    ? '${f.scheduledDeparture!.month}/${f.scheduledDeparture!.day} ${f.scheduledDeparture!.hour.toString().padLeft(2, '0')}:${f.scheduledDeparture!.minute.toString().padLeft(2, '0')}'
                    : '--',
                style: const TextStyle(fontSize: 13),
              ),
              trailing: Text(_statusLabel(f.status), style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: _statusColor(f.status))),
            ),
          );
        },
      ),
    );
  }

  String _statusLabel(FlightStatus s) {
    switch (s) {
      case FlightStatus.scheduled: return '计划中';
      case FlightStatus.boarding: return '登机中';
      case FlightStatus.departed: return '已起飞';
      case FlightStatus.enRoute: return '飞行中';
      case FlightStatus.landed: return '已降落';
      case FlightStatus.arrived: return '已到达';
      case FlightStatus.delayed: return '延误';
      case FlightStatus.cancelled: return '已取消';
    }
  }

  Color _statusColor(FlightStatus s) {
    switch (s) {
      case FlightStatus.scheduled: return AppTheme.statusScheduled;
      case FlightStatus.boarding: return AppTheme.statusBoarding;
      case FlightStatus.departed: return AppTheme.statusDeparted;
      case FlightStatus.enRoute: return AppTheme.statusEnRoute;
      case FlightStatus.landed: return AppTheme.statusLanded;
      case FlightStatus.arrived: return AppTheme.statusDeparted;
      case FlightStatus.delayed: return AppTheme.statusDelayed;
      case FlightStatus.cancelled: return AppTheme.statusCancelled;
    }
  }
}
