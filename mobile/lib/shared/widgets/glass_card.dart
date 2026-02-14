import 'dart:ui';
import 'package:flutter/material.dart';

/// 玻璃态卡片组件
/// 半透明背景 + 高斯模糊 + 微妙边框，实现 Glassmorphism 效果
class GlassCard extends StatelessWidget {
  const GlassCard({
    super.key,
    required this.child,
    this.padding,
    this.margin,
    this.borderRadius,
    this.blur = 12.0,
    this.opacity = 0.15,
    this.borderOpacity = 0.2,
    this.onTap,
  });

  final Widget child;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final BorderRadius? borderRadius;
  final double blur;
  final double opacity;
  final double borderOpacity;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = isDark
        ? Colors.white.withValues(alpha: opacity * 0.6)
        : Colors.white.withValues(alpha: opacity + 0.55);
    final borderColor = isDark
        ? Colors.white.withValues(alpha: borderOpacity)
        : Colors.white.withValues(alpha: borderOpacity + 0.3);
    final radius = borderRadius ?? BorderRadius.circular(16);

    return Container(
      margin: margin ?? EdgeInsets.zero,
      child: ClipRRect(
        borderRadius: radius,
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: blur, sigmaY: blur),
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: onTap,
              borderRadius: radius,
              child: Container(
                decoration: BoxDecoration(
                  color: bgColor,
                  borderRadius: radius,
                  border: Border.all(color: borderColor, width: 0.8),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.05),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                padding: padding ?? const EdgeInsets.all(16),
                child: child,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
