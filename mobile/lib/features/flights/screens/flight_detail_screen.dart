import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import '../../../app/theme.dart';
import '../../../shared/mock/mock_data.dart';
import '../../../shared/widgets/glass_card.dart';
import '../../../shared/widgets/offline_indicator.dart';

/// 航班详情页面
class FlightDetailScreen extends StatefulWidget {
  const FlightDetailScreen({super.key, required this.flightId});
  final String flightId;

  @override
  State<FlightDetailScreen> createState() => _FlightDetailScreenState();
}

class _FlightDetailScreenState extends State<FlightDetailScreen> {
  Flight? _flight;
  bool _isLoading = true;
  bool _isFollowed = false;
  // 模拟离线状态，实际应由网络状态管理
  final bool _isOffline = false;
  final DateTime _lastCacheTime = DateTime.now().subtract(const Duration(minutes: 15));

  @override
  void initState() {
    super.initState();
    _loadFlight();
  }

  Future<void> _loadFlight() async {
    final flight = await MockDataProvider.getFlightById(widget.flightId);
    if (mounted) {
      setState(() {
        _flight = flight;
        _isLoading = false;
        // 模拟前3个航班为已关注
        _isFollowed = MockDataProvider.getFollowedFlights().any((f) => f.id == widget.flightId);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    if (_isLoading) {
      return Scaffold(
        appBar: AppBar(title: const Text('航班详情')),
        body: const Center(child: CircularProgressIndicator()),
      );
    }
    if (_flight == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('航班详情')),
        body: const Center(child: Text('航班不存在')),
      );
    }
    final f = _flight!;
    return Scaffold(
      appBar: AppBar(
        title: Text(f.flightNumber),
        actions: [
          IconButton(
            icon: Icon(_isFollowed ? Icons.star : Icons.star_border, color: _isFollowed ? AppTheme.warningColor : null),
            onPressed: () => setState(() => _isFollowed = !_isFollowed),
          ),
        ],
      ),
      body: Column(
        children: [
          // 离线/缓存数据指示
          OfflineIndicator(isOffline: _isOffline, lastUpdated: _lastCacheTime),
          if (!_isOffline) _buildCacheHint(theme),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(AppTheme.spacingMd),
              child: Column(
                children: [
                  // 航班基本信息卡片
                  _buildFlightInfoCard(f, theme),
            const SizedBox(height: AppTheme.spacingMd),
            // 飞机信息卡片
            if (f.aircraft != null) _buildAircraftCard(f.aircraft!, theme),
            const SizedBox(height: AppTheme.spacingMd),
                  // 航线地图占位
                  _buildMapPlaceholder(theme),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCacheHint(ThemeData theme) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: AppTheme.spacingMd, vertical: 6),
      color: theme.colorScheme.surfaceContainerHighest,
      child: Row(
        children: [
          Icon(Icons.cached, size: 14, color: theme.colorScheme.onSurface.withValues(alpha: 0.5)),
          const SizedBox(width: 6),
          Text(
            '缓存数据 - ${_lastCacheTime.hour.toString().padLeft(2, '0')}:${_lastCacheTime.minute.toString().padLeft(2, '0')} 更新',
            style: TextStyle(fontSize: 11, color: theme.colorScheme.onSurface.withValues(alpha: 0.5)),
          ),
        ],
      ),
    );
  }

  Widget _buildFlightInfoCard(Flight f, ThemeData theme) {
    return GlassCard(
      child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('航班信息', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: theme.colorScheme.primary)),
            const SizedBox(height: AppTheme.spacingMd),
            // 起降机场
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(f.departureAirport, style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w700)),
                      Text(f.departureCity, style: TextStyle(fontSize: 13, color: theme.colorScheme.onSurface.withValues(alpha: 0.6))),
                      const SizedBox(height: 4),
                      Text(_formatDateTime(f.scheduledDeparture), style: const TextStyle(fontSize: 14)),
                    ],
                  ),
                ),
                Icon(Icons.flight_takeoff, color: theme.colorScheme.primary),
                const SizedBox(width: 8),
                Expanded(
                  child: Container(height: 1, color: theme.colorScheme.onSurface.withValues(alpha: 0.2)),
                ),
                const SizedBox(width: 8),
                Icon(Icons.flight_land, color: theme.colorScheme.primary),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(f.arrivalAirport, style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w700)),
                      Text(f.arrivalCity, style: TextStyle(fontSize: 13, color: theme.colorScheme.onSurface.withValues(alpha: 0.6))),
                      const SizedBox(height: 4),
                      Text(_formatDateTime(f.scheduledArrival), style: const TextStyle(fontSize: 14)),
                    ],
                  ),
                ),
              ],
            ),
            const Divider(height: 24),
            // 详细信息行
            _infoRow('航空公司', f.airline?.name ?? '-'),
            _infoRow('航班状态', _statusLabel(f.status)),
            _infoRow('登机口', f.gate ?? '-'),
            _infoRow('航站楼', f.terminal ?? '-'),
            if (f.delayMinutes > 0) _infoRow('延误', '${f.delayMinutes} 分钟'),
          ],
        ),
    );
  }

  Widget _buildAircraftCard(Aircraft ac, ThemeData theme) {
    return GlassCard(
      child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('飞机信息', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: theme.colorScheme.primary)),
            const SizedBox(height: AppTheme.spacingMd),
            _infoRow('机型', ac.model),
            _infoRow('制造商', ac.manufacturer),
            _infoRow('注册号', ac.registration),
            _infoRow('载客量', '${ac.capacity} 人'),
            _infoRow('巡航速度', '${ac.cruiseSpeed} km/h'),
          ],
        ),
    );
  }

  Widget _buildMapPlaceholder(ThemeData theme) {
    // 查找起降机场坐标
    final depAirport = MockDataProvider.airports.where((a) => a.code == _flight!.departureAirport).firstOrNull;
    final arrAirport = MockDataProvider.airports.where((a) => a.code == _flight!.arrivalAirport).firstOrNull;

    if (depAirport == null || arrAirport == null) {
      return Card(
        margin: EdgeInsets.zero,
        child: Container(
          height: 200, width: double.infinity,
          decoration: BoxDecoration(borderRadius: BorderRadius.circular(AppTheme.radiusMd), color: theme.colorScheme.surfaceContainerHighest),
          child: Center(child: Text('航线地图 (机场数据不可用)', style: TextStyle(color: theme.colorScheme.onSurface.withValues(alpha: 0.5)))),
        ),
      );
    }

    final depLatLng = LatLng(depAirport.latitude, depAirport.longitude);
    final arrLatLng = LatLng(arrAirport.latitude, arrAirport.longitude);
    // 计算地图中心和缩放
    final centerLat = (depAirport.latitude + arrAirport.latitude) / 2;
    final centerLng = (depAirport.longitude + arrAirport.longitude) / 2;

    return Card(
      margin: EdgeInsets.zero,
      clipBehavior: Clip.antiAlias,
      child: SizedBox(
        height: 200,
        child: FlutterMap(
          options: MapOptions(
            initialCenter: LatLng(centerLat, centerLng),
            initialZoom: 4.5,
          ),
          children: [
            TileLayer(
              urlTemplate: 'https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
            ),
            // 航线
            PolylineLayer(
              polylines: [
                Polyline(points: [depLatLng, arrLatLng], color: theme.colorScheme.primary, strokeWidth: 2.5),
              ],
            ),
            // 起降机场标记
            MarkerLayer(
              markers: [
                Marker(point: depLatLng, width: 60, height: 30, child: _airportLabel(depAirport.code, AppTheme.statusDeparted)),
                Marker(point: arrLatLng, width: 60, height: 30, child: _airportLabel(arrAirport.code, AppTheme.primaryColor)),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _airportLabel(String code, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(4)),
      child: Text(code, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700)),
    );
  }

  Widget _infoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(fontSize: 14, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.6))),
          Text(value, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }

  String _formatDateTime(DateTime? dt) {
    if (dt == null) return '--:--';
    return '${dt.month}/${dt.day} ${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
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
}
