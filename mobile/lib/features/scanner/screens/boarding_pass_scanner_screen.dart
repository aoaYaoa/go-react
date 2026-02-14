import 'package:flutter/material.dart';
import '../../../app/theme.dart';
import '../../../shared/mock/mock_data.dart';

/// 登机牌扫描页面
class BoardingPassScannerScreen extends StatelessWidget {
  const BoardingPassScannerScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(title: const Text('扫描登机牌')),
      body: Column(
        children: [
          // 相机预览占位
          Expanded(
            flex: 3,
            child: Container(
              margin: const EdgeInsets.all(AppTheme.spacingMd),
              decoration: BoxDecoration(
                color: Colors.black87,
                borderRadius: BorderRadius.circular(AppTheme.radiusMd),
              ),
              child: Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.camera_alt_outlined, size: 64, color: Colors.white.withValues(alpha: 0.5)),
                    const SizedBox(height: AppTheme.spacingMd),
                    Text('将登机牌条形码对准扫描框', style: TextStyle(color: Colors.white.withValues(alpha: 0.7))),
                    const SizedBox(height: AppTheme.spacingLg),
                    // 扫描框
                    Container(
                      width: 250,
                      height: 100,
                      decoration: BoxDecoration(
                        border: Border.all(color: theme.colorScheme.primary, width: 2),
                        borderRadius: BorderRadius.circular(AppTheme.radiusSm),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          // 模拟扫描按钮
          Expanded(
            flex: 1,
            child: Padding(
              padding: const EdgeInsets.all(AppTheme.spacingMd),
              child: Column(
                children: [
                  ElevatedButton.icon(
                    onPressed: () => _simulateScan(context),
                    icon: const Icon(Icons.qr_code_scanner),
                    label: const Text('模拟扫描'),
                  ),
                  const SizedBox(height: AppTheme.spacingSm),
                  TextButton(
                    onPressed: () => ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('手动输入航班号 (开发中)'))),
                    child: const Text('手动输入航班号'),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _simulateScan(BuildContext context) {
    final flight = MockDataProvider.getMockFlights().first;
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('扫描成功'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('航班号: ${flight.flightNumber}'),
            Text('${flight.departureCity} -> ${flight.arrivalCity}'),
            Text('日期: ${flight.scheduledDeparture?.month}/${flight.scheduledDeparture?.day}'),
            Text('座位: 32A'),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('取消')),
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('航班已添加到行程')));
            },
            child: const Text('确认添加'),
          ),
        ],
      ),
    );
  }
}
