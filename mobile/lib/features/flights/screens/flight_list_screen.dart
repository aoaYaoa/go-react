import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../app/theme.dart';
import '../../../shared/mock/mock_data.dart';
import '../widgets/flight_card.dart';

/// 航班列表页面
/// 提供航班搜索和列表展示功能
class FlightListScreen extends StatefulWidget {
  const FlightListScreen({super.key});

  @override
  State<FlightListScreen> createState() => _FlightListScreenState();
}

class _FlightListScreenState extends State<FlightListScreen> {
  final _searchController = TextEditingController();
  List<Flight> _flights = [];
  List<Flight> _searchResults = [];
  bool _isLoading = true;
  bool _isSearching = false;

  @override
  void initState() {
    super.initState();
    _loadFlights();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadFlights() async {
    setState(() => _isLoading = true);
    final flights = await MockDataProvider.simulateDelay(
      MockDataProvider.getMockFlights(),
    );
    if (mounted) {
      setState(() {
        _flights = flights;
        _isLoading = false;
      });
    }
  }

  Future<void> _onSearch(String query) async {
    if (query.isEmpty) {
      setState(() {
        _isSearching = false;
        _searchResults = [];
      });
      return;
    }
    setState(() => _isSearching = true);
    final results = await MockDataProvider.searchFlights(query);
    if (mounted) {
      setState(() => _searchResults = results);
    }
  }

  @override
  Widget build(BuildContext context) {
    final displayFlights = _isSearching ? _searchResults : _flights;

    return Scaffold(
      appBar: AppBar(title: const Text('航班追踪')),
      body: Column(
        children: [
          // 搜索框
          Padding(
            padding: const EdgeInsets.all(AppTheme.spacingMd),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: '搜索航班号，如 CA1234',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          _searchController.clear();
                          _onSearch('');
                        },
                      )
                    : null,
              ),
              onChanged: _onSearch,
            ),
          ),
          // 航班列表
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : displayFlights.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.flight_outlined,
                                size: 64,
                                color: Theme.of(context)
                                    .colorScheme
                                    .onSurface
                                    .withValues(alpha: 0.3)),
                            const SizedBox(height: AppTheme.spacingMd),
                            Text(
                              _isSearching ? '未找到匹配的航班' : '暂无航班数据',
                              style: TextStyle(
                                color: Theme.of(context)
                                    .colorScheme
                                    .onSurface
                                    .withValues(alpha: 0.5),
                              ),
                            ),
                          ],
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: _loadFlights,
                        child: ListView.builder(
                          padding: const EdgeInsets.only(
                              bottom: 100),
                          itemCount: displayFlights.length,
                          itemBuilder: (context, index) {
                            final flight = displayFlights[index];
                            return FlightCard(
                              flight: flight,
                              onTap: () =>
                                  context.push('/flights/${flight.id}'),
                            );
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }
}
