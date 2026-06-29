import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/routes/app_routes.dart';

class DoctorsScreen extends StatelessWidget {
  const DoctorsScreen({super.key});

  static const _doctors = [
    {'name': 'د. سارة أحمد', 'specialty': 'طب الأسنان', 'rating': 4.9, 'price': 150},
    {'name': 'د. محمد علي', 'specialty': 'طب عام', 'rating': 4.8, 'price': 120},
    {'name': 'د. فاطمة حسن', 'specialty': 'أمراض القلب', 'rating': 4.9, 'price': 200},
    {'name': 'د. عمر خالد', 'specialty': 'طب الأطفال', 'rating': 4.7, 'price': 130},
  ];

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        appBar: AppBar(title: const Text('الأطباء')),
        body: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(16),
              child: TextField(
                decoration: InputDecoration(
                  hintText: 'ابحث عن طبيب...',
                  prefixIcon: const Icon(Icons.search),
                  suffixIcon: IconButton(icon: const Icon(Icons.tune), onPressed: () {}),
                ),
              ),
            ),
            SizedBox(
              height: 44,
              child: ListView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                children: ['الكل', 'عام', 'أسنان', 'قلب', 'أطفال'].map((c) => Padding(
                  padding: const EdgeInsets.only(left: 8),
                  child: FilterChip(label: Text(c), selected: c == 'الكل', onSelected: (_) {}),
                )).toList(),
              ),
            ),
            Expanded(
              child: ListView.separated(
                padding: const EdgeInsets.all(16),
                itemCount: _doctors.length,
                separatorBuilder: (_, __) => const SizedBox(height: 12),
                itemBuilder: (context, i) {
                  final d = _doctors[i];
                  return Card(
                    child: ListTile(
                      contentPadding: const EdgeInsets.all(12),
                      leading: CircleAvatar(
                        radius: 28,
                        backgroundColor: AppColors.primaryLight,
                        child: Text(d['name'].toString().substring(3, 4), style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold)),
                      ),
                      title: Text(d['name'] as String, style: const TextStyle(fontWeight: FontWeight.bold)),
                      subtitle: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(d['specialty'] as String),
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              const Icon(Icons.star, size: 16, color: Colors.amber),
                              Text(' ${d['rating']}'),
                              const SizedBox(width: 12),
                              Text('${d['price']} ر.س', style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600)),
                            ],
                          ),
                        ],
                      ),
                      trailing: IconButton(icon: const Icon(Icons.favorite_border, color: AppColors.red), onPressed: () {}),
                      onTap: () => Navigator.pushNamed(context, AppRoutes.bookAppointment),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
