import 'package:flutter/material.dart';
import '../../../app/theme.dart';

/// 照片预览页面
class PhotoPreviewScreen extends StatelessWidget {
  const PhotoPreviewScreen({super.key, this.flightNumber, this.aircraftModel, this.location});
  final String? flightNumber;
  final String? aircraftModel;
  final String? location;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(title: const Text('照片预览')),
      body: Column(
        children: [
          // 照片占位
          Expanded(
            child: Container(
              color: const Color(0xFFE0E0E0),
              child: Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.photo, size: 64, color: theme.colorScheme.onSurface.withValues(alpha: 0.3)),
                    const SizedBox(height: 8),
                    Text('照片预览', style: TextStyle(color: theme.colorScheme.onSurface.withValues(alpha: 0.5))),
                  ],
                ),
              ),
            ),
          ),
          // 元数据
          Padding(
            padding: const EdgeInsets.all(AppTheme.spacingMd),
            child: Card(
              margin: EdgeInsets.zero,
              child: Padding(
                padding: const EdgeInsets.all(AppTheme.spacingMd),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('照片信息', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: theme.colorScheme.primary)),
                    const SizedBox(height: AppTheme.spacingSm),
                    if (flightNumber != null) _row('航班号', flightNumber!),
                    if (aircraftModel != null) _row('机型', aircraftModel!),
                    if (location != null) _row('拍摄位置', location!),
                    _row('拍摄时间', _formatNow()),
                  ],
                ),
              ),
            ),
          ),
          // 分享选项
          Padding(
            padding: const EdgeInsets.fromLTRB(AppTheme.spacingMd, 0, AppTheme.spacingMd, AppTheme.spacingMd),
            child: Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('分享到社区 (开发中)'))),
                    icon: const Icon(Icons.share),
                    label: const Text('分享'),
                  ),
                ),
                const SizedBox(width: AppTheme.spacingSm),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('已保存到相册'))),
                    icon: const Icon(Icons.save_alt),
                    label: const Text('保存'),
                  ),
                ),
              ],
            ),
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
          Text(label, style: const TextStyle(fontSize: 13, color: Color(0xFF757575))),
          Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }

  String _formatNow() {
    final now = DateTime.now();
    return '${now.year}/${now.month}/${now.day} ${now.hour.toString().padLeft(2, '0')}:${now.minute.toString().padLeft(2, '0')}';
  }
}
