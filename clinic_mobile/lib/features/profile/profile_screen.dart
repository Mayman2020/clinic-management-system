import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/routes/app_routes.dart';
import '../../shared/widgets/main_shell.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return MainShell(
      currentIndex: 3,
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            const CircleAvatar(radius: 48, backgroundColor: AppColors.primaryLight, child: Icon(Icons.person, size: 48, color: AppColors.primary)),
            const SizedBox(height: 12),
            const Text('أحمد محمد', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
            const Text('مريض', style: TextStyle(color: AppColors.textSecondary)),
            const SizedBox(height: 28),
            _menuItem(Icons.person_outline, 'الملف الشخصي', () {}),
            _menuItem(Icons.event, 'مواعيدي', () => Navigator.pushNamed(context, AppRoutes.myAppointments)),
            _menuItem(Icons.folder_shared, 'السجل الطبي', () => Navigator.pushNamed(context, AppRoutes.records)),
            _menuItem(Icons.medical_services, 'الأطباء', () => Navigator.pushNamed(context, AppRoutes.doctors)),
            _menuItem(Icons.settings, 'الإعدادات', () {}),
            const SizedBox(height: 16),
            OutlinedButton.icon(
              onPressed: () => Navigator.pushNamedAndRemoveUntil(context, AppRoutes.welcome, (_) => false),
              icon: const Icon(Icons.logout, color: AppColors.red),
              label: const Text('تسجيل الخروج', style: TextStyle(color: AppColors.red)),
              style: OutlinedButton.styleFrom(minimumSize: const Size(double.infinity, 48), side: const BorderSide(color: AppColors.red)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _menuItem(IconData icon, String label, VoidCallback onTap) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(leading: Icon(icon, color: AppColors.primary), title: Text(label), trailing: const Icon(Icons.chevron_left), onTap: onTap),
    );
  }
}
