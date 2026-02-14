import 'package:flutter/material.dart';
import '../../../app/theme.dart';
import '../../../shared/mock/mock_data.dart';
import '../../../shared/widgets/glass_card.dart';

/// 个人中心首页
class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final user = MockDataProvider.getCurrentUser();

    return Scaffold(
      appBar: AppBar(title: const Text('我的')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(AppTheme.spacingMd, AppTheme.spacingMd, AppTheme.spacingMd, 100),
        child: Column(
          children: [
            // 用户信息卡片
            GlassCard(
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 32,
                    backgroundColor: theme.colorScheme.primary.withValues(alpha: 0.12),
                    child: Text(user.username.substring(0, 1), style: TextStyle(fontSize: 24, fontWeight: FontWeight.w700, color: theme.colorScheme.primary)),
                  ),
                  const SizedBox(width: AppTheme.spacingMd),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(user.username, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                        const SizedBox(height: 4),
                        Text(user.email, style: TextStyle(fontSize: 13, color: theme.colorScheme.onSurface.withValues(alpha: 0.6))),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppTheme.spacingMd),
            // 飞行统计摘要
            GlassCard(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _statItem('飞行次数', '${user.totalFlights}', theme),
                  _statItem('总里程', '${(user.totalDistance / 1000).toStringAsFixed(1)}k km', theme),
                  _statItem('机场', '${user.airportsVisited}', theme),
                  _statItem('机型', '${user.aircraftTypes}', theme),
                ],
              ),
            ),
            const SizedBox(height: AppTheme.spacingMd),
            // 功能入口
            GlassCard(
              padding: EdgeInsets.zero,
              child: Column(
                children: [
                  _menuItem(context, Icons.bar_chart, '飞行统计', '/profile/stats'),
                  Divider(height: 1, indent: 56, color: theme.colorScheme.onSurface.withValues(alpha: 0.1)),
                  _menuItem(context, Icons.emoji_events, '成就徽章', '/profile/achievements'),
                  Divider(height: 1, indent: 56, color: theme.colorScheme.onSurface.withValues(alpha: 0.1)),
                  _menuItem(context, Icons.history, '飞行日志', '/profile/flight-log'),
                  Divider(height: 1, indent: 56, color: theme.colorScheme.onSurface.withValues(alpha: 0.1)),
                  _menuItem(context, Icons.settings, '设置', '/profile/settings'),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _statItem(String label, String value, ThemeData theme) {
    return Column(
      children: [
        Text(value, style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: theme.colorScheme.primary)),
        const SizedBox(height: 4),
        Text(label, style: TextStyle(fontSize: 12, color: theme.colorScheme.onSurface.withValues(alpha: 0.6))),
      ],
    );
  }

  Widget _menuItem(BuildContext context, IconData icon, String title, String route) {
    return ListTile(
      leading: Icon(icon, color: Theme.of(context).colorScheme.primary),
      title: Text(title),
      trailing: const Icon(Icons.chevron_right),
      onTap: () => ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$title (开发中)'))),
    );
  }
}
