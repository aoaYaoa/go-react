/// 小组件数据模型
/// 定义主屏幕小组件显示的数据结构

/// 小组件尺寸
enum WidgetSize { small, medium, large }

/// 小组件数据
class FlightWidgetData {
  final String flightNumber;
  final String departureAirport;
  final String arrivalAirport;
  final String status;
  final String? departureTime;
  final String? arrivalTime;
  final String? gate;

  const FlightWidgetData({
    required this.flightNumber,
    required this.departureAirport,
    required this.arrivalAirport,
    required this.status,
    this.departureTime,
    this.arrivalTime,
    this.gate,
  });
}

/// 小组件配置
class WidgetConfig {
  final String id;
  final WidgetSize size;
  final List<String> selectedFlightIds;
  final bool autoRefresh;

  const WidgetConfig({
    required this.id,
    required this.size,
    required this.selectedFlightIds,
    this.autoRefresh = true,
  });
}
