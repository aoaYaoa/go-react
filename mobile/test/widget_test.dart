import 'package:flutter_test/flutter_test.dart';

import 'package:go_react_mobile/app/app.dart';

void main() {
  testWidgets('App renders smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const App());
    await tester.pumpAndSettle();

    // 验证首页标题显示
    expect(find.text('SkyTracker'), findsOneWidget);
  });
}
