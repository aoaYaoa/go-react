import 'package:flutter/material.dart';
import '../../../app/theme.dart';

/// 拍照页面
class CameraScreen extends StatelessWidget {
  const CameraScreen({super.key, this.flightNumber, this.aircraftModel});
  final String? flightNumber;
  final String? aircraftModel;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // 相机预览占位
          Container(
            color: const Color(0xFF1A1A1A),
            child: Center(child: Icon(Icons.camera_alt, size: 64, color: Colors.white.withValues(alpha: 0.2))),
          ),
          // 关联航班信息
          if (flightNumber != null)
            Positioned(
              top: 0,
              left: 0,
              right: 0,
              child: SafeArea(
                child: Container(
                  margin: const EdgeInsets.all(AppTheme.spacingMd),
                  padding: const EdgeInsets.all(AppTheme.spacingSm),
                  decoration: BoxDecoration(color: Colors.black54, borderRadius: BorderRadius.circular(AppTheme.radiusSm)),
                  child: Row(
                    children: [
                      const Icon(Icons.flight, color: Colors.white, size: 16),
                      const SizedBox(width: 8),
                      Text('$flightNumber ${aircraftModel ?? ""}', style: const TextStyle(color: Colors.white, fontSize: 13)),
                    ],
                  ),
                ),
              ),
            ),
          // 底部控制栏
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: SafeArea(
              child: Padding(
                padding: const EdgeInsets.all(AppTheme.spacingLg),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    IconButton(icon: const Icon(Icons.close, color: Colors.white, size: 28), onPressed: () => Navigator.pop(context)),
                    GestureDetector(
                      onTap: () => ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('照片已拍摄 (模拟)'))),
                      child: Container(
                        width: 64, height: 64,
                        decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(color: Colors.white, width: 3)),
                        child: Container(
                          margin: const EdgeInsets.all(4),
                          decoration: const BoxDecoration(shape: BoxShape.circle, color: Colors.white),
                        ),
                      ),
                    ),
                    IconButton(icon: const Icon(Icons.flip_camera_ios, color: Colors.white, size: 28), onPressed: () {}),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
