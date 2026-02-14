import 'package:flutter/material.dart';
import '../../../app/theme.dart';
import '../../../shared/mock/mock_data.dart';

/// 航班信息板页面 - 类似机场大屏
class FlightBoardScreen extends StatefulWidget {
  const FlightBoardScreen({super.key, required this.airportCode});
  final String airportCode;

  @override
  State<FlightBoardScreen> createState() => _FlightBoardScreenState();
}

class _FlightBoardScreenState extends State<FlightBoardScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: Text('${widget.airportCode} 航班动态'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [Tab(text: '出发'), Tab(text: '到达')],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildFlightList(MockDataProvider.getFlightsByAirport(widget.airportCode, isDeparture: true), true, theme),
          _buildFlightList(MockDataProvider.getFlightsByAirport(widget.airportCode, isDeparture: false), false, theme),
        ],
      ),
    );
  }

  Widget _buildFlightList(List<Flight> flights, bool isDeparture, ThemeData theme) {
    if (flights.isEmpty) {
      return Center(child: Text('暂无${isDeparture ? "出发" : "到达"}航班', style: TextStyle(color: theme.colorScheme.onSurface.withValues(alpha: 0.5))));
    }
    // 按时间排序
    flights.sort((a, b) {
      final ta = isDeparture ? a.scheduledDeparture : a.scheduledArrival;
      final tb = isDeparture ? b.scheduledDeparture : b.scheduledArrival;
      if (ta == null && tb == null) return 0;
      if (ta == null) return 1;
      if (tb == null) return -1;
      return ta.compareTo(tb);
    });

    return ListView.separated(
      padding: const EdgeInsets.all(AppTheme.spacingMd),
      itemCount: flights.length,
      separatorBuilder: (_, __) => const Divider(height: 1),
      itemBuilder: (context, index) {
        final f = flights[index];
        final time = isDeparture ? f.scheduledDeparture : f.scheduledArrival;
        final dest = isDeparture ? '${f.arrivalAirport} ${f.arrivalCity}' : '${f.departureAirport} ${f.departureCity}';
        return ListTile(
          contentPadding: const EdgeInsets.symmetric(vertical: 4),
          leading: SizedBox(
            width: 50,
            child: Text(
              time != null ? '${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}' : '--:--',
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
            ),
          ),
          title: Text(f.flightNumber, style: const TextStyle(fontWeight: FontWeight.w600)),
          subtitle: Text(dest, style: const TextStyle(fontSize: 13)),
          trailing: Text(_statusLabel(f.status), style: TextStyle(fontSize: 12, color: _statusColor(f.status), fontWeight: FontWeight.w600)),
        );
      },
    );
  }

  String _statusLabel(FlightStatus s) {
    switch (s) {
      case FlightStatus.scheduled: return '计划中';
      case FlightStatus.boarding: return '登机中';
      case FlightStatus.departed: return '已起飞';
      case FlightStatus.enRoute: return '飞行中';
      case FlightStatus.landed: return '已降落';
      case FlightStatus.arrived: return '已到达';
      case FlightStatus.delayed: return '延误';
      case FlightStatus.cancelled: return '已取消';
    }
  }

  Color _statusColor(FlightStatus s) {
    switch (s) {
      case FlightStatus.scheduled: return AppTheme.statusScheduled;
      case FlightStatus.boarding: return AppTheme.statusBoarding;
      case FlightStatus.departed: return AppTheme.statusDeparted;
      case FlightStatus.enRoute: return AppTheme.statusEnRoute;
      case FlightStatus.landed: return AppTheme.statusLanded;
      case FlightStatus.arrived: return AppTheme.statusDeparted;
      case FlightStatus.delayed: return AppTheme.statusDelayed;
      case FlightStatus.cancelled: return AppTheme.statusCancelled;
    }
  }
}
