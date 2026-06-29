import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

class OnlineConsultationScreen extends StatelessWidget {
  const OnlineConsultationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        appBar: AppBar(title: const Text('استشارة أونلاين')),
        body: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              const Spacer(),
              Container(
                height: 200,
                width: double.infinity,
                decoration: BoxDecoration(
                  color: AppColors.primaryLight,
                  borderRadius: BorderRadius.circular(24),
                ),
                child: const Icon(Icons.videocam, size: 80, color: AppColors.primary),
              ),
              const SizedBox(height: 32),
              const Text('ابدأ استشارة فيديو مع طبيبك', textAlign: TextAlign.center, style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              const Text('تواصل مع أطبائنا المتخصصين من منزلك', textAlign: TextAlign.center, style: TextStyle(color: AppColors.textSecondary)),
              const Spacer(),
              ElevatedButton.icon(
                onPressed: () {},
                icon: const Icon(Icons.videocam),
                label: const Text('بدء الاستشارة'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
