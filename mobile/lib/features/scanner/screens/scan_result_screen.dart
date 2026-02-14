import 'package:flutter/material.dart';
import '../../../app/theme.dart';

/// 扫描结果确认页面
class ScanResultScreen extends StatelessWidget {
  const ScanResultScreen({super.key, required this.flightNumber, required this.departureCity, required this.arrivalCity, this.seatNumber});
  final String flightNumber;
  final String departureCity;
  final String arrivalCity;
  final String? seatNumber;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(title: const Text('确认航班信息')),
      body: Padding(
        padding: const EdgeInsets.all(AppTheme.spacingMd),
        child: Column(
          children: [
            Card(
              margin: EdgeInsets.zero,
              child: Padding(
                padding: const EdgeInsets.all(AppTheme.spacingLg),
                child: Column(
                  children: [
                    Icon(Icons.check_circle_outline, size: 48, color: AppTheme.successColor),
                    const SizedBox(height: AppTheme.spacingMd),
                    const Text('登机牌解析成功', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
                    const SizedBox(height: AppTheme.spacingLg),
                    _row('航班号', flightNumber),
                    _row('出发', departureCity),
                    _row('到达', arrivalCity),
                    if (seatNumber != null) _row('座位', seatNumber!),
                  ],
                ),
              ),
            ),
            const Spacer(),
            ElevatedButton(
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('航班已添加，通知已开启')));
                Navigator.pop(context);
              },
              child: const Text('确认添加并开启通知'),
            ),
            const SizedBox(height: AppTheme.spacingSm),
            OutlinedButton(onPressed: () => Navigator.pop(context), child: const Text('取消')),
            const SizedBox(height: AppTheme.spacingLg),
          ],
        ),
      ),
    );
  }

  Widget _row(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 15, color: Color(0xFF757575))),
          Text(value, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}
