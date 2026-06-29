import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

class BookAppointmentScreen extends StatefulWidget {
  const BookAppointmentScreen({super.key});

  @override
  State<BookAppointmentScreen> createState() => _BookAppointmentScreenState();
}

class _BookAppointmentScreenState extends State<BookAppointmentScreen> {
  int _selectedDay = 2;
  String? _selectedTime;

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        appBar: AppBar(title: const Text('حجز موعد')),
        body: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Card(
                child: ListTile(
                  leading: const CircleAvatar(child: Icon(Icons.person)),
                  title: const Text('د. سارة أحمد', style: TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: const Text('طب الأسنان'),
                ),
              ),
              const SizedBox(height: 24),
              const Text('اختر التاريخ', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              const SizedBox(height: 12),
              SizedBox(
                height: 80,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  itemCount: 7,
                  itemBuilder: (_, i) {
                    final days = ['أحد', 'إثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'];
                    final selected = i == _selectedDay;
                    return GestureDetector(
                      onTap: () => setState(() => _selectedDay = i),
                      child: Container(
                        width: 56,
                        margin: const EdgeInsets.only(left: 8),
                        decoration: BoxDecoration(
                          color: selected ? AppColors.primary : Colors.white,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: selected ? AppColors.primary : AppColors.border),
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(days[i], style: TextStyle(fontSize: 12, color: selected ? Colors.white70 : AppColors.textSecondary)),
                            Text('${23 + i}', style: TextStyle(fontWeight: FontWeight.bold, color: selected ? Colors.white : AppColors.textPrimary)),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 24),
              const Text('اختر الوقت', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'].map((t) {
                  final selected = _selectedTime == t;
                  return ChoiceChip(
                    label: Text(t),
                    selected: selected,
                    selectedColor: AppColors.primary,
                    labelStyle: TextStyle(color: selected ? Colors.white : AppColors.textPrimary),
                    onSelected: (_) => setState(() => _selectedTime = t),
                  );
                }).toList(),
              ),
              const SizedBox(height: 24),
              const TextField(
                maxLines: 3,
                decoration: InputDecoration(labelText: 'سبب الزيارة (اختياري)', alignLabelWithHint: true),
              ),
              const SizedBox(height: 32),
              ElevatedButton(
                onPressed: _selectedTime == null ? null : () => Navigator.pop(context),
                child: const Text('تأكيد الموعد'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
