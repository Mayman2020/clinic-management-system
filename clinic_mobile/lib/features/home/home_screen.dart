import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/routes/app_routes.dart';
import '../../shared/widgets/main_shell.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return MainShell(
      currentIndex: 0,
      child: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('مرحباً، أحمد 👋', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
                      Text('نتمنى لك يوماً صحياً', style: TextStyle(color: AppColors.textSecondary)),
                    ],
                  ),
                  IconButton(
                    onPressed: () => Navigator.pushNamed(context, AppRoutes.messages),
                    icon: const Badge(label: Text('3'), child: Icon(Icons.notifications_outlined)),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(colors: [AppColors.primary, AppColors.primaryDark]),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('احجز موعدك الآن', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    const Text('مع أفضل الأطباء المتخصصين', style: TextStyle(color: Colors.white70)),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(backgroundColor: Colors.white, foregroundColor: AppColors.primary, minimumSize: const Size(140, 44)),
                      onPressed: () => Navigator.pushNamed(context, AppRoutes.bookAppointment),
                      child: const Text('احجز موعد'),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              const Text('الخدمات', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),
              GridView.count(
                crossAxisCount: 2,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                mainAxisSpacing: 12,
                crossAxisSpacing: 12,
                childAspectRatio: 1.3,
                children: [
                  ServiceCard(icon: Icons.event, label: 'حجز موعد', color: AppColors.primary, onTap: () => Navigator.pushNamed(context, AppRoutes.bookAppointment)),
                  ServiceCard(icon: Icons.videocam, label: 'استشارة أونلاين', color: AppColors.green, onTap: () => Navigator.pushNamed(context, AppRoutes.consultation)),
                  ServiceCard(icon: Icons.folder_shared, label: 'السجل الطبي', color: AppColors.purple, onTap: () => Navigator.pushNamed(context, AppRoutes.records)),
                  ServiceCard(icon: Icons.science, label: 'نتائج التحاليل', color: AppColors.primary, onTap: () => Navigator.pushNamed(context, AppRoutes.records)),
                ],
              ),
              const SizedBox(height: 24),
              const Text('الموعد القادم', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      CircleAvatar(radius: 28, backgroundColor: AppColors.greenLight, child: const Icon(Icons.medical_services, color: AppColors.green)),
                      const SizedBox(width: 14),
                      const Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('د. سارة أحمد', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                            Text('طب الأسنان', style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                            SizedBox(height: 4),
                            Text('27 مايو 2024 • 10:00 ص', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600, fontSize: 13)),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(color: AppColors.greenLight, borderRadius: BorderRadius.circular(20)),
                        child: const Text('قادم', style: TextStyle(color: AppColors.green, fontWeight: FontWeight.w600, fontSize: 12)),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
