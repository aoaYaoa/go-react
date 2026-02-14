import 'package:flutter/material.dart';
import '../../../app/theme.dart';
import '../../../shared/mock/mock_data.dart';

/// 成就徽章页面
class AchievementsScreen extends StatelessWidget {
  const AchievementsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final achievements = MockDataProvider.getMockAchievements();

    return Scaffold(
      appBar: AppBar(title: const Text('成就徽章')),
      body: ListView.builder(
        padding: const EdgeInsets.all(AppTheme.spacingMd),
        itemCount: achievements.length,
        itemBuilder: (context, index) {
          final a = achievements[index];
          final progress = a.targetValue > 0 ? (a.currentValue / a.targetValue).clamp(0.0, 1.0) : 0.0;
          return Card(
            margin: const EdgeInsets.only(bottom: AppTheme.spacingSm),
            child: Padding(
              padding: const EdgeInsets.all(AppTheme.spacingMd),
              child: Row(
                children: [
                  // 徽章图标
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: a.unlocked ? theme.colorScheme.primary.withValues(alpha: 0.12) : theme.colorScheme.onSurface.withValues(alpha: 0.08),
                    ),
                    child: Icon(
                      _getIcon(a.icon),
                      color: a.unlocked ? theme.colorScheme.primary : theme.colorScheme.onSurface.withValues(alpha: 0.3),
                      size: 24,
                    ),
                  ),
                  const SizedBox(width: AppTheme.spacingMd),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(a.name, style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          color: a.unlocked ? null : theme.colorScheme.onSurface.withValues(alpha: 0.5),
                        )),
                        const SizedBox(height: 2),
                        Text(a.description, style: TextStyle(fontSize: 12, color: theme.colorScheme.onSurface.withValues(alpha: 0.6))),
                        const SizedBox(height: 6),
                        LinearProgressIndicator(
                          value: progress,
                          backgroundColor: theme.colorScheme.onSurface.withValues(alpha: 0.1),
                          color: a.unlocked ? AppTheme.successColor : theme.colorScheme.primary,
                        ),
                        const SizedBox(height: 4),
                        Text('${a.currentValue} / ${a.targetValue}', style: TextStyle(fontSize: 11, color: theme.colorScheme.onSurface.withValues(alpha: 0.5))),
                      ],
                    ),
                  ),
                  if (a.unlocked)
                    Icon(Icons.check_circle, color: AppTheme.successColor, size: 24),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  IconData _getIcon(String name) {
    switch (name) {
      case 'flight_takeoff': return Icons.flight_takeoff;
      case 'airplanemode_active': return Icons.airplanemode_active;
      case 'stars': return Icons.stars;
      case 'public': return Icons.public;
      case 'language': return Icons.language;
      case 'explore': return Icons.explore;
      case 'collections': return Icons.collections;
      case 'flight': return Icons.flight;
      default: return Icons.emoji_events;
    }
  }
}
