import 'package:flutter/material.dart';
import '../../app/theme.dart';

/// 离线状态指示器
/// 在页面顶部显示离线状态横幅
class OfflineIndicator extends StatelessWidget {
  const OfflineIndicator({super.key, this.isOffline = false, this.lastUpdated});
  final bool isOffline;
  final DateTime? lastUpdated;

  @override
  Widget build(BuildContext context) {
    if (!isOffline) return const SizedBox.shrink();
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: AppTheme.spacingMd, vertical: AppTheme.spacingSm),
      color: AppTheme.warningColor,
      child: Row(
        children: [
          const Icon(Icons.cloud_off, color: Colors.white, size: 16),
          const SizedBox(width: AppTheme.spacingSm),
          Expanded(
            child: Text(
              lastUpdated != null
                  ? '离线模式 - 数据更新于 ${lastUpdated!.hour.toString().padLeft(2, '0')}:${lastUpdated!.minute.toString().padLeft(2, '0')}'
                  : '当前处于离线状态',
              style: const TextStyle(color: Colors.white, fontSize: 12),
            ),
          ),
        ],
      ),
    );
  }
}
