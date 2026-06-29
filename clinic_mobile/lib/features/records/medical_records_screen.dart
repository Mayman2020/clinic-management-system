import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

class MedicalRecordsScreen extends StatelessWidget {
  const MedicalRecordsScreen({super.key});

  static const _records = [
    {'type': 'وصفة طبية', 'date': '15 مايو 2024', 'icon': Icons.medication, 'color': AppColors.primary},
    {'type': 'نتائج تحاليل', 'date': '10 مايو 2024', 'icon': Icons.science, 'color': AppColors.green},
    {'type': 'أشعة سينية', 'date': '5 مايو 2024', 'icon': Icons.biotech, 'color': AppColors.purple},
  ];

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        appBar: AppBar(title: const Text('السجل الطبي')),
        body: ListView.separated(
          padding: const EdgeInsets.all(16),
          itemCount: _records.length,
          separatorBuilder: (_, __) => const SizedBox(height: 8),
          itemBuilder: (_, i) {
            final r = _records[i];
            return Card(
              child: ListTile(
                leading: Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(color: (r['color'] as Color).withValues(alpha: 0.15), borderRadius: BorderRadius.circular(12)),
                  child: Icon(r['icon'] as IconData, color: r['color'] as Color),
                ),
                title: Text(r['type'] as String, style: const TextStyle(fontWeight: FontWeight.w600)),
                subtitle: Text(r['date'] as String),
                trailing: const Icon(Icons.chevron_left),
                onTap: () {},
              ),
            );
          },
        ),
      ),
    );
  }
}
