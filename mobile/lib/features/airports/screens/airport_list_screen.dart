import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../app/theme.dart';
import '../../../shared/mock/mock_data.dart';

/// 机场列表页面
class AirportListScreen extends StatefulWidget {
  const AirportListScreen({super.key});

  @override
  State<AirportListScreen> createState() => _AirportListScreenState();
}

class _AirportListScreenState extends State<AirportListScreen> {
  final _searchController = TextEditingController();
  List<Airport> _airports = MockDataProvider.airports;
  bool _isSearching = false;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _onSearch(String query) async {
    if (query.isEmpty) {
      setState(() {
        _airports = MockDataProvider.airports;
        _isSearching = false;
      });
      return;
    }
    setState(() => _isSearching = true);
    final results = await MockDataProvider.searchAirports(query);
    if (mounted) setState(() => _airports = results);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(title: const Text('机场')),
      body: Column(
        children: [
          // 附近机场提示
          Container(
            margin: const EdgeInsets.fromLTRB(AppTheme.spacingMd, AppTheme.spacingSm, AppTheme.spacingMd, 0),
            padding: const EdgeInsets.all(AppTheme.spacingMd),
            decoration: BoxDecoration(
              color: theme.colorScheme.primary.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(AppTheme.radiusSm),
            ),
            child: Row(
              children: [
                Icon(Icons.location_on, color: theme.colorScheme.primary, size: 20),
                const SizedBox(width: AppTheme.spacingSm),
                Expanded(child: Text('开启位置权限以自动识别附近机场', style: TextStyle(fontSize: 13, color: theme.colorScheme.primary))),
              ],
            ),
          ),
          // 搜索框
          Padding(
            padding: const EdgeInsets.all(AppTheme.spacingMd),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: '搜索机场名称或代码',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(icon: const Icon(Icons.clear), onPressed: () { _searchController.clear(); _onSearch(''); })
                    : null,
              ),
              onChanged: _onSearch,
            ),
          ),
          Expanded(
            child: _airports.isEmpty
                ? Center(child: Text(_isSearching ? '未找到匹配的机场' : '暂无机场数据', style: TextStyle(color: theme.colorScheme.onSurface.withValues(alpha: 0.5))))
                : ListView.builder(
                    itemCount: _airports.length,
                    itemBuilder: (context, index) {
                      final airport = _airports[index];
                      return ListTile(
                        leading: CircleAvatar(
                          backgroundColor: theme.colorScheme.primary.withValues(alpha: 0.1),
                          child: Text(airport.code.substring(0, 2), style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: theme.colorScheme.primary)),
                        ),
                        title: Text(airport.name),
                        subtitle: Text('${airport.city} | ${airport.code}'),
                        trailing: const Icon(Icons.chevron_right),
                        onTap: () => context.push('/airports/${airport.id}'),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
