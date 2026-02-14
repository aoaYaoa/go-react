import 'package:flutter/material.dart';
import '../../../app/theme.dart';
import '../../../shared/mock/mock_data.dart';
import '../../../shared/widgets/glass_card.dart';

/// 航班卡片组件
/// 显示航班号、航空公司、起降机场和时间、状态标签
class FlightCard extends StatelessWidget {
  const FlightCard({super.key, required this.flight, this.onTap});

  final Flight flight;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return GlassCard(
      margin: const EdgeInsets.symmetric(horizontal: AppTheme.spacingMd, vertical: AppTheme.spacingSm),
      onTap: onTap,
      child: Column(
            children: [
              // 顶部：航班号 + 状态
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Icon(Icons.flight, size: 18, color: theme.colorScheme.primary),
                      const SizedBox(width: AppTheme.spacingSm),
                      Text(
                        flight.flightNumber,
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
                      ),
                      if (flight.airline != null) ...[
                        const SizedBox(width: AppTheme.spacingSm),
                        Text(
                          flight.airline!.name,
                          style: TextStyle(fontSize: 12, color: theme.colorScheme.onSurface.withValues(alpha: 0.6)),
                        ),
                      ],
                    ],
                  ),
                  _StatusChip(status: flight.status, delayMinutes: flight.delayMinutes),
                ],
              ),
              const SizedBox(height: AppTheme.spacingMd),
              // 中间：起降信息
              Row(
                children: [
                  Expanded(child: _AirportInfo(code: flight.departureAirport, city: flight.departureCity, alignment: CrossAxisAlignment.start)),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: AppTheme.spacingSm),
                    child: Column(
                      children: [
                        Icon(Icons.arrow_forward, size: 16, color: theme.colorScheme.onSurface.withValues(alpha: 0.4)),
                      ],
                    ),
                  ),
                  Expanded(child: _AirportInfo(code: flight.arrivalAirport, city: flight.arrivalCity, alignment: CrossAxisAlignment.end)),
                ],
              ),
              const SizedBox(height: AppTheme.spacingSm),
              // 底部：时间
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(_formatTime(flight.scheduledDeparture), style: TextStyle(fontSize: 13, color: theme.colorScheme.onSurface.withValues(alpha: 0.6))),
                  Text(_formatTime(flight.scheduledArrival), style: TextStyle(fontSize: 13, color: theme.colorScheme.onSurface.withValues(alpha: 0.6))),
                ],
              ),
            ],
          ),
    );
  }

  String _formatTime(DateTime? dt) {
    if (dt == null) return '--:--';
    return '${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
  }
}

class _AirportInfo extends StatelessWidget {
  const _AirportInfo({required this.code, required this.city, required this.alignment});
  final String code;
  final String city;
  final CrossAxisAlignment alignment;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: alignment,
      children: [
        Text(code, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
        Text(city, style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.6))),
      ],
    );
  }
}

class _StatusChip extends StatelessWidget {
  const _StatusChip({required this.status, this.delayMinutes = 0});
  final FlightStatus status;
  final int delayMinutes;

  @override
  Widget build(BuildContext context) {
    final (label, color) = _getStatusInfo();
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(AppTheme.radiusSm),
      ),
      child: Text(label, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: color)),
    );
  }

  (String, Color) _getStatusInfo() {
    switch (status) {
      case FlightStatus.scheduled:
        return ('计划中', AppTheme.statusScheduled);
      case FlightStatus.boarding:
        return ('登机中', AppTheme.statusBoarding);
      case FlightStatus.departed:
        return ('已起飞', AppTheme.statusDeparted);
      case FlightStatus.enRoute:
        return ('飞行中', AppTheme.statusEnRoute);
      case FlightStatus.landed:
        return ('已降落', AppTheme.statusLanded);
      case FlightStatus.arrived:
        return ('已到达', AppTheme.statusDeparted);
      case FlightStatus.delayed:
        return ('延误${delayMinutes > 0 ? " ${delayMinutes}min" : ""}', AppTheme.statusDelayed);
      case FlightStatus.cancelled:
        return ('已取消', AppTheme.statusCancelled);
    }
  }
}
