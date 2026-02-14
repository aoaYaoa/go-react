import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../app/theme.dart';
import '../../../shared/mock/mock_data.dart';

/// 无人机列表页面
class DroneListScreen extends StatelessWidget {
  const DroneListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final drones = MockDataProvider.getMockDrones();
    return Scaffold(
      appBar: AppBar(title: const Text('我的无人机')),
      body: ListView.builder(
        padding: const EdgeInsets.all(AppTheme.spacingMd),
        itemCount: drones.length,
        itemBuilder: (context, index) {
          final d = drones[index];
          return Card(
            margin: const EdgeInsets.only(bottom: AppTheme.spacingSm),
            child: ListTile(
              leading: Icon(Icons.airplanemode_active, color: d.status == DroneStatus.flying ? AppTheme.statusEnRoute : AppTheme.statusScheduled),
              title: Text(d.name, style: const TextStyle(fontWeight: FontWeight.w600)),
              subtitle: Text('${d.model} | 电量 ${d.batteryLevel}%'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () => context.push('/drones/${d.id}'),
            ),
          );
        },
      ),
    );
  }
}
