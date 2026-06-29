import 'package:flutter_test/flutter_test.dart';
import 'package:clinic_mobile/main.dart';

void main() {
  testWidgets('App loads welcome screen', (WidgetTester tester) async {
    await tester.pumpWidget(const ClinicApp());
    expect(find.text('مرحباً بك في عيادتي'), findsOneWidget);
  });
}
