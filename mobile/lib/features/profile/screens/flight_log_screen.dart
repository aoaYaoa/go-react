import 'package:flutter/material.dart';
import '../../../app/theme.dart';
import '../../../shared/mock/mock_data.dart';

/// 飞行日志页面
class FlightLogScreen extends StatelessWidget {
  const FlightLogScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final records = MockDataProvider.getMockFlightRecords()
      ..sort((a, b) => b.date.compareTo(a.date));

    return Scaffold(
      appBar: AppBar(title: const Text('飞行日志')),
      body: ListView.builder(
        padding: const EdgeInsets.all(AppTheme.spacingMd),
        itemCount: records.length,
        itemBuilder: (context, index) {
          final r = records[index];
          return Card(
            margin: const EdgeInsets.only(bottom: AppTheme.spacingSm),
            child: ListTile(
              leading: CircleAvatar(
                backgroundColor: theme.colorScheme.primary.withValues(alpha: 0.12),
                child: Icon(Icons.flight, color: theme.colorScheme.primary, size: 20),
              ),
              title: Text('${r.flightNumber}  ${r.departureCity} - ${r.arrivalCity}', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
              subtitle: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('${r.date.year}/${r.date.month}/${r.date.day}  ${r.aircraftModel ?? ""}', style: const TextStyle(fontSize: 12)),
                  if (r.seatNumber != null) Text('座位: ${r.seatNumber}', style: const TextStyle(fontSize: 12)),
                ],
              ),
              trailing: Text('${r.distance} km', style: TextStyle(fontSize: 13, color: theme.colorScheme.primary, fontWeight: FontWeight.w600)),
              isThreeLine: true,
            ),
          );
        },
      ),
    );
  }
}
