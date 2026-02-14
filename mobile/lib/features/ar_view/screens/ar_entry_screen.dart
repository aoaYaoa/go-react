import 'package:flutter/material.dart';
import '../../../app/theme.dart';

/// AR 入口页面
class ArEntryScreen extends StatelessWidget {
  const ArEntryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(title: const Text('AR 天空视图')),
      body: Padding(
        padding: const EdgeInsets.all(AppTheme.spacingLg),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.view_in_ar, size: 80, color: theme.colorScheme.primary),
            const SizedBox(height: AppTheme.spacingLg),
            const Text('AR 天空视图', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700)),
            const SizedBox(height: AppTheme.spacingMd),
            Text(
              '将手机对准天空，即可看到飞过的航班信息叠加在真实画面上。',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 15, color: theme.colorScheme.onSurface.withValues(alpha: 0.6)),
            ),
            const SizedBox(height: AppTheme.spacingLg),
            // 设备兼容性检查
            Card(
              margin: EdgeInsets.zero,
              child: Padding(
                padding: const EdgeInsets.all(AppTheme.spacingMd),
                child: Column(
                  children: [
                    _checkItem('ARCore/ARKit 支持', true, theme),
                    _checkItem('陀螺仪传感器', true, theme),
                    _checkItem('GPS 定位', true, theme),
                    _checkItem('相机权限', false, theme),
                  ],
                ),
              ),
            ),
            const SizedBox(height: AppTheme.spacingLg),
            ElevatedButton.icon(
              onPressed: () => ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('AR 视图 (开发中)'))),
              icon: const Icon(Icons.camera),
              label: const Text('进入 AR 视图'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _checkItem(String label, bool passed, ThemeData theme) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Icon(passed ? Icons.check_circle : Icons.cancel, size: 20, color: passed ? AppTheme.successColor : AppTheme.errorColor),
          const SizedBox(width: AppTheme.spacingSm),
          Text(label, style: const TextStyle(fontSize: 14)),
        ],
      ),
    );
  }
}
