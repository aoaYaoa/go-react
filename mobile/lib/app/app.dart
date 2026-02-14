import 'package:flutter/material.dart';

import 'routes.dart';
import 'theme.dart';

/// SkyTracker 应用根组件
class App extends StatelessWidget {
  const App({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'SkyTracker',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.system,
      routerConfig: appRouter,
      builder: (context, child) {
        // 渐变背景容器，实现玻璃态风格的底层渐变
        final isDark = Theme.of(context).brightness == Brightness.dark;
        return Container(
          decoration: BoxDecoration(
            gradient: isDark ? AppTheme.darkGradient : AppTheme.lightGradient,
          ),
          child: child,
        );
      },
    );
  }
}
