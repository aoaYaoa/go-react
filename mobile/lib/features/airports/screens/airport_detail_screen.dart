import 'package:flutter/material.dart';
import '../../../app/theme.dart';
import '../../../shared/mock/mock_data.dart';
import '../../../shared/widgets/glass_card.dart';
import '../../../shared/widgets/offline_indicator.dart';

/// 机场详情页面
class AirportDetailScreen extends StatelessWidget {
  const AirportDetailScreen({super.key, required this.airportId});
  final String airportId;

  // 模拟离线状态，实际应由网络状态管理
  bool get _isOffline => false;
  DateTime get _lastCacheTime => DateTime.now().subtract(const Duration(minutes: 10));

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final airport = MockDataProvider.airports.where((a) => a.id == airportId).firstOrNull;
    if (airport == null) {
      return Scaffold(appBar: AppBar(title: const Text('机场详情')), body: const Center(child: Text('机场不存在')));
    }
    final weather = MockDataProvider.getWeatherByAirport(airport.code);

    return Scaffold(
      appBar: AppBar(title: Text(airport.code)),
      body: Column(
        children: [
          // 离线/缓存数据指示
          OfflineIndicator(isOffline: _isOffline, lastUpdated: _lastCacheTime),
          if (!_isOffline) _buildCacheHint(theme),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(AppTheme.spacingMd),
              child: Column(
                children: [
                  // 基本信息
                  GlassCard(
                    child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(airport.name, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                          const SizedBox(height: 4),
                          Text('${airport.city}, ${airport.country}', style: TextStyle(color: theme.colorScheme.onSurface.withValues(alpha: 0.6))),
                          const Divider(height: 24),
                          _row('IATA 代码', airport.code),
                          _row('航站楼', '${airport.terminalCount} 个'),
                          _row('跑道', '${airport.runwayCount} 条'),
                          _row('海拔', '${airport.altitude.toInt()} 米'),
                          _row('时区', airport.timezone),
                        ],
                      ),
                  ),
                  const SizedBox(height: AppTheme.spacingMd),
                  // 天气信息
                  if (weather != null)
                    GlassCard(
                      child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('天气信息', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: theme.colorScheme.primary)),
                            const SizedBox(height: AppTheme.spacingMd),
                            Row(
                              children: [
                                Text('${weather.temperature.toStringAsFixed(0)}°C', style: const TextStyle(fontSize: 36, fontWeight: FontWeight.w700)),
                                const SizedBox(width: AppTheme.spacingMd),
                                Text(weather.condition, style: const TextStyle(fontSize: 16)),
                              ],
                            ),
                            const SizedBox(height: AppTheme.spacingSm),
                            _row('湿度', '${weather.humidity.toInt()}%'),
                            _row('风速', '${weather.windSpeed.toInt()} km/h ${weather.windDirection}'),
                            _row('能见度', '${weather.visibility.toStringAsFixed(0)} km'),
                          ],
                        ),
                    ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCacheHint(ThemeData theme) {
    final cacheTime = _lastCacheTime;
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: AppTheme.spacingMd, vertical: 6),
      color: theme.colorScheme.surfaceContainerHighest,
      child: Row(
        children: [
          Icon(Icons.cached, size: 14, color: theme.colorScheme.onSurface.withValues(alpha: 0.5)),
          const SizedBox(width: 6),
          Text(
            '缓存数据 - ${cacheTime.hour.toString().padLeft(2, '0')}:${cacheTime.minute.toString().padLeft(2, '0')} 更新',
            style: TextStyle(fontSize: 11, color: theme.colorScheme.onSurface.withValues(alpha: 0.5)),
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
          Text(value, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }
}
