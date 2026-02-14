import 'package:flutter/material.dart';
import '../../../app/theme.dart';
import '../../../shared/mock/mock_data.dart';

/// 飞行统计页面
class FlightStatsScreen extends StatelessWidget {
  const FlightStatsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final user = MockDataProvider.getCurrentUser();

    return Scaffold(
      appBar: AppBar(title: const Text('飞行统计')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppTheme.spacingMd),
        child: Column(
          children: [
            // 统计数据卡片
            Row(
              children: [
                Expanded(child: _statCard('飞行次数', '${user.totalFlights}', Icons.flight_takeoff, theme)),
                const SizedBox(width: AppTheme.spacingSm),
                Expanded(child: _statCard('总里程', '${(user.totalDistance / 1000).toStringAsFixed(1)}k', Icons.straighten, theme)),
              ],
            ),
            const SizedBox(height: AppTheme.spacingSm),
            Row(
              children: [
                Expanded(child: _statCard('访问机场', '${user.airportsVisited}', Icons.location_city, theme)),
                const SizedBox(width: AppTheme.spacingSm),
                Expanded(child: _statCard('乘坐机型', '${user.aircraftTypes}', Icons.airplanemode_active, theme)),
              ],
            ),
            const SizedBox(height: AppTheme.spacingMd),
            // 飞行地图占位
            Card(
              margin: EdgeInsets.zero,
              child: Container(
                height: 250,
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
                      Text('飞行航线地图', style: TextStyle(color: theme.colorScheme.onSurface.withValues(alpha: 0.5))),
                      Text('${user.airportsVisited} 个机场', style: TextStyle(fontSize: 12, color: theme.colorScheme.primary)),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _statCard(String label, String value, IconData icon, ThemeData theme) {
    return Card(
      margin: EdgeInsets.zero,
      child: Padding(
        padding: const EdgeInsets.all(AppTheme.spacingMd),
        child: Column(
          children: [
            Icon(icon, color: theme.colorScheme.primary, size: 28),
            const SizedBox(height: AppTheme.spacingSm),
            Text(value, style: TextStyle(fontSize: 24, fontWeight: FontWeight.w700, color: theme.colorScheme.primary)),
            const SizedBox(height: 4),
            Text(label, style: TextStyle(fontSize: 13, color: theme.colorScheme.onSurface.withValues(alpha: 0.6))),
          ],
        ),
      ),
    );
  }
}
