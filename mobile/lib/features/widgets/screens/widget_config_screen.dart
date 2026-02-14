import 'package:flutter/material.dart';
import '../../../app/theme.dart';
import '../../../shared/mock/mock_data.dart';

/// 小组件配置页面
class WidgetConfigScreen extends StatefulWidget {
  const WidgetConfigScreen({super.key});

  @override
  State<WidgetConfigScreen> createState() => _WidgetConfigScreenState();
}

class _WidgetConfigScreenState extends State<WidgetConfigScreen> {
  final Set<String> _selectedFlightIds = {};
  int _sizeIndex = 1; // 0=小, 1=中, 2=大

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final flights = MockDataProvider.getFollowedFlights();
    final sizes = ['小', '中', '大'];

    return Scaffold(
      appBar: AppBar(title: const Text('小组件配置')),
      body: ListView(
        padding: const EdgeInsets.all(AppTheme.spacingMd),
        children: [
          // 预览
          Card(
            margin: EdgeInsets.zero,
            child: Container(
              height: [80.0, 120.0, 180.0][_sizeIndex],
              padding: const EdgeInsets.all(AppTheme.spacingMd),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('SkyTracker', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: theme.colorScheme.primary)),
                  const SizedBox(height: 4),
                  if (_selectedFlightIds.isEmpty)
                    Text('请选择要显示的航班', style: TextStyle(fontSize: 13, color: theme.colorScheme.onSurface.withValues(alpha: 0.5)))
                  else
                    ...flights.where((f) => _selectedFlightIds.contains(f.id)).take(_sizeIndex + 1).map((f) => Padding(
                      padding: const EdgeInsets.only(bottom: 4),
                      child: Text('${f.flightNumber}  ${f.departureAirport}-${f.arrivalAirport}', style: const TextStyle(fontSize: 13)),
                    )),
                ],
              ),
            ),
          ),
          const SizedBox(height: AppTheme.spacingMd),
          // 尺寸选择
          Text('小组件尺寸', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: theme.colorScheme.primary)),
          const SizedBox(height: AppTheme.spacingSm),
          SegmentedButton<int>(
            segments: List.generate(3, (i) => ButtonSegment(value: i, label: Text(sizes[i]))),
            selected: {_sizeIndex},
            onSelectionChanged: (v) => setState(() => _sizeIndex = v.first),
          ),
          const SizedBox(height: AppTheme.spacingMd),
          // 航班选择
          Text('选择显示的航班', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: theme.colorScheme.primary)),
          const SizedBox(height: AppTheme.spacingSm),
          ...flights.map((f) => CheckboxListTile(
            title: Text(f.flightNumber),
            subtitle: Text('${f.departureCity} - ${f.arrivalCity}'),
            value: _selectedFlightIds.contains(f.id),
            onChanged: (v) {
              setState(() {
                if (v == true) { _selectedFlightIds.add(f.id); } else { _selectedFlightIds.remove(f.id); }
              });
            },
          )),
          const SizedBox(height: AppTheme.spacingLg),
          ElevatedButton(
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('小组件配置已保存')));
              Navigator.pop(context);
            },
            child: const Text('保存配置'),
          ),
        ],
      ),
    );
  }
}
