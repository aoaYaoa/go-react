import 'package:flutter/material.dart';
import '../../../app/theme.dart';

/// 通知设置页面
class NotificationSettingsScreen extends StatefulWidget {
  const NotificationSettingsScreen({super.key});

  @override
  State<NotificationSettingsScreen> createState() => _NotificationSettingsScreenState();
}

class _NotificationSettingsScreenState extends State<NotificationSettingsScreen> {
  bool _departureReminder = true;
  bool _arrivalReminder = true;
  bool _delayAlert = true;
  bool _gateChangeAlert = true;
  bool _droneLowBattery = true;
  bool _droneNoFlyZone = true;
  bool _droneEmergency = true;
  int _reminderMinutes = 30;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('通知设置')),
      body: ListView(
        padding: const EdgeInsets.all(AppTheme.spacingMd),
        children: [
          // 航班通知
          Card(
            margin: EdgeInsets.zero,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                  child: Text('航班通知', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Theme.of(context).colorScheme.primary)),
                ),
                SwitchListTile(title: const Text('起飞提醒'), value: _departureReminder, onChanged: (v) => setState(() => _departureReminder = v)),
                SwitchListTile(title: const Text('到达提醒'), value: _arrivalReminder, onChanged: (v) => setState(() => _arrivalReminder = v)),
                SwitchListTile(title: const Text('延误提醒'), value: _delayAlert, onChanged: (v) => setState(() => _delayAlert = v)),
                SwitchListTile(title: const Text('登机口变更'), value: _gateChangeAlert, onChanged: (v) => setState(() => _gateChangeAlert = v)),
                ListTile(
                  title: const Text('提前提醒时间'),
                  trailing: DropdownButton<int>(
                    value: _reminderMinutes,
                    items: [15, 30, 45, 60].map((m) => DropdownMenuItem(value: m, child: Text('$m 分钟'))).toList(),
                    onChanged: (v) { if (v != null) setState(() => _reminderMinutes = v); },
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppTheme.spacingMd),
          // 无人机通知
          Card(
            margin: EdgeInsets.zero,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                  child: Text('无人机通知', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Theme.of(context).colorScheme.primary)),
                ),
                SwitchListTile(title: const Text('低电量警告'), value: _droneLowBattery, onChanged: (v) => setState(() => _droneLowBattery = v)),
                SwitchListTile(title: const Text('禁飞区预警'), value: _droneNoFlyZone, onChanged: (v) => setState(() => _droneNoFlyZone = v)),
                SwitchListTile(title: const Text('紧急情况'), value: _droneEmergency, onChanged: (v) => setState(() => _droneEmergency = v)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
