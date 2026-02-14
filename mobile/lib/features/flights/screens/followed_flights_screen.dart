import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../app/theme.dart';
import '../../../shared/mock/mock_data.dart';
import '../widgets/flight_card.dart';

/// 关注航班列表页面
class FollowedFlightsScreen extends StatefulWidget {
  const FollowedFlightsScreen({super.key});

  @override
  State<FollowedFlightsScreen> createState() => _FollowedFlightsScreenState();
}

class _FollowedFlightsScreenState extends State<FollowedFlightsScreen> {
  late List<Flight> _flights;

  @override
  void initState() {
    super.initState();
    _flights = MockDataProvider.getFollowedFlights();
  }

  void _unfollowFlight(int index) {
    setState(() => _flights.removeAt(index));
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('已取消关注')));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('关注的航班')),
      body: _flights.isEmpty
          ? Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.star_border, size: 64, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.3)),
                  const SizedBox(height: AppTheme.spacingMd),
                  Text('暂无关注的航班', style: TextStyle(color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.5))),
                ],
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.only(bottom: AppTheme.spacingMd),
              itemCount: _flights.length,
              itemBuilder: (context, index) {
                final flight = _flights[index];
                return Dismissible(
                  key: Key(flight.id),
                  direction: DismissDirection.endToStart,
                  background: Container(
                    alignment: Alignment.centerRight,
                    padding: const EdgeInsets.only(right: 20),
                    color: AppTheme.errorColor,
                    child: const Icon(Icons.star_border, color: Colors.white),
                  ),
                  onDismissed: (_) => _unfollowFlight(index),
                  child: FlightCard(flight: flight, onTap: () => context.push('/flights/${flight.id}')),
                );
              },
            ),
    );
  }
}
