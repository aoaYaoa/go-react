import 'package:flutter/material.dart';
import '../../../app/theme.dart';
import '../../../shared/mock/mock_data.dart';

/// 机场设施搜索页面
class FacilitiesScreen extends StatelessWidget {
  const FacilitiesScreen({super.key, required this.airportCode});
  final String airportCode;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final facilities = MockDataProvider.getFacilitiesByAirport(airportCode);
    final categories = facilities.map((f) => f.category).toSet().toList();

    return Scaffold(
      appBar: AppBar(title: Text('$airportCode 设施')),
      body: facilities.isEmpty
          ? Center(child: Text('暂无设施信息', style: TextStyle(color: theme.colorScheme.onSurface.withValues(alpha: 0.5))))
          : ListView.builder(
              padding: const EdgeInsets.all(AppTheme.spacingMd),
              itemCount: categories.length,
              itemBuilder: (context, catIndex) {
                final cat = categories[catIndex];
                final items = facilities.where((f) => f.category == cat).toList();
                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (catIndex > 0) const SizedBox(height: AppTheme.spacingMd),
                    Text(cat, style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: theme.colorScheme.primary)),
                    const SizedBox(height: AppTheme.spacingSm),
                    ...items.map((f) => Card(
                      margin: const EdgeInsets.only(bottom: AppTheme.spacingSm),
                      child: ListTile(
                        leading: Icon(_categoryIcon(f.category), color: theme.colorScheme.primary),
                        title: Text(f.name),
                        subtitle: Text('${f.terminal} ${f.floor} | ${f.description}', style: const TextStyle(fontSize: 12)),
                      ),
                    )),
                  ],
                );
              },
            ),
    );
  }

  IconData _categoryIcon(String category) {
    switch (category) {
      case '餐饮': return Icons.restaurant;
      case '购物': return Icons.shopping_bag;
      case '休息室': return Icons.airline_seat_flat;
      default: return Icons.place;
    }
  }
}
