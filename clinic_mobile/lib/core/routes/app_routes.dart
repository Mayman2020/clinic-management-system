import 'package:flutter/material.dart';
import '../../features/auth/welcome_screen.dart';
import '../../features/auth/login_screen.dart';
import '../../features/home/home_screen.dart';
import '../../features/doctors/doctors_screen.dart';
import '../../features/appointments/book_appointment_screen.dart';
import '../../features/appointments/my_appointments_screen.dart';
import '../../features/consultation/online_consultation_screen.dart';
import '../../features/records/medical_records_screen.dart';
import '../../features/messages/messages_screen.dart';
import '../../features/profile/profile_screen.dart';

class AppRoutes {
  static const welcome = '/';
  static const login = '/login';
  static const home = '/home';
  static const doctors = '/doctors';
  static const bookAppointment = '/book-appointment';
  static const myAppointments = '/my-appointments';
  static const consultation = '/consultation';
  static const records = '/records';
  static const messages = '/messages';
  static const profile = '/profile';

  static Route<dynamic> onGenerateRoute(RouteSettings settings) {
    switch (settings.name) {
      case welcome:
        return _page(const WelcomeScreen());
      case login:
        return _page(const LoginScreen());
      case home:
        return _page(const HomeScreen());
      case doctors:
        return _page(const DoctorsScreen());
      case bookAppointment:
        return _page(const BookAppointmentScreen());
      case myAppointments:
        return _page(const MyAppointmentsScreen());
      case consultation:
        return _page(const OnlineConsultationScreen());
      case records:
        return _page(const MedicalRecordsScreen());
      case messages:
        return _page(const MessagesScreen());
      case profile:
        return _page(const ProfileScreen());
      default:
        return _page(const WelcomeScreen());
    }
  }

  static MaterialPageRoute _page(Widget child) => MaterialPageRoute(builder: (_) => child);
}
