import 'package:flutter/material.dart';
import '../../../app/theme.dart';
import '../../../shared/mock/mock_data.dart';

/// AR 视图占位页面
class ArViewScreen extends StatelessWidget {
  const ArViewScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final flights = MockDataProvider.getMockFlights().where((f) => f.status == FlightStatus.enRoute).toList();

    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // 相机预览占位
          Container(
            color: const Color(0xFF1A2030),
            child: Center(
              child: Icon(Icons.camera, size: 64, color: Colors.white.withValues(alpha: 0.2)),
            ),
          ),
          // Mock 航班标签
          ...flights.asMap().entries.map((entry) {
            final index = entry.key;
            final flight = entry.value;
            final top = 100.0 + index * 120.0;
            final left = 40.0 + (index % 3) * 100.0;
            return Positioned(
              top: top,
              left: left,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: theme.colorScheme.primary.withValues(alpha: 0.85),
                  borderRadius: BorderRadius.circular(AppTheme.radiusSm),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(flight.flightNumber, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w700)),
                    Text('${flight.departureAirport} -> ${flight.arrivalAirport}', style: TextStyle(color: Colors.white.withValues(alpha: 0.8), fontSize: 11)),
                  ],
                ),
              ),
            );
          }),
          // 顶部返回按钮
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(AppTheme.spacingMd),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  IconButton(
                    icon: const Icon(Icons.arrow_back, color: Colors.white),
                    onPressed: () => Navigator.pop(context),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(color: Colors.black54, borderRadius: BorderRadius.circular(20)),
                    child: Text('${flights.length} 架航班', style: const TextStyle(color: Colors.white, fontSize: 13)),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
