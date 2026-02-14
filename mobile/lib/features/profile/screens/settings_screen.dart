import 'package:flutter/material.dart';
import '../../../app/theme.dart';

/// 设置页面
class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _notificationsEnabled = true;
  bool _biometricEnabled = false;
  bool _darkMode = false;
  String _language = '中文';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('设置')),
      body: ListView(
        padding: const EdgeInsets.all(AppTheme.spacingMd),
        children: [
          Card(
            margin: EdgeInsets.zero,
            child: Column(
              children: [
                SwitchListTile(
                  title: const Text('推送通知'),
                  subtitle: const Text('接收航班和无人机状态通知'),
                  value: _notificationsEnabled,
                  onChanged: (v) => setState(() => _notificationsEnabled = v),
                ),
                const Divider(height: 1, indent: 16),
                SwitchListTile(
                  title: const Text('生物识别登录'),
                  subtitle: const Text('使用指纹或面容快速登录'),
                  value: _biometricEnabled,
                  onChanged: (v) => setState(() => _biometricEnabled = v),
                ),
                const Divider(height: 1, indent: 16),
                SwitchListTile(
                  title: const Text('深色模式'),
                  subtitle: const Text('切换应用主题'),
                  value: _darkMode,
                  onChanged: (v) => setState(() => _darkMode = v),
                ),
                const Divider(height: 1, indent: 16),
                ListTile(
                  title: const Text('语言'),
                  subtitle: Text(_language),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => _showLanguagePicker(context),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppTheme.spacingLg),
          Card(
            margin: EdgeInsets.zero,
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.info_outline),
                  title: const Text('关于'),
                  trailing: const Text('v1.0.0', style: TextStyle(color: Color(0xFF757575))),
                ),
                const Divider(height: 1, indent: 56),
                ListTile(
                  leading: const Icon(Icons.delete_outline, color: AppTheme.errorColor),
                  title: const Text('清除缓存', style: TextStyle(color: AppTheme.errorColor)),
                  onTap: () => ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('缓存已清除'))),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppTheme.spacingLg),
          OutlinedButton(
            onPressed: () => ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('已退出登录'))),
            style: OutlinedButton.styleFrom(foregroundColor: AppTheme.errorColor, side: const BorderSide(color: AppTheme.errorColor)),
            child: const Text('退出登录'),
          ),
        ],
      ),
    );
  }

  void _showLanguagePicker(BuildContext context) {
    showModalBottomSheet(
      context: context,
      builder: (ctx) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: ['中文', 'English'].map((lang) => ListTile(
            title: Text(lang),
            trailing: _language == lang ? const Icon(Icons.check, color: AppTheme.primaryColor) : null,
            onTap: () { setState(() => _language = lang); Navigator.pop(ctx); },
          )).toList(),
        ),
      ),
    );
  }
}
