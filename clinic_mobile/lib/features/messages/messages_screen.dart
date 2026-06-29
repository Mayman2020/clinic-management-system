import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../shared/widgets/main_shell.dart';

class MessagesScreen extends StatefulWidget {
  const MessagesScreen({super.key});

  @override
  State<MessagesScreen> createState() => _MessagesScreenState();
}

class _MessagesScreenState extends State<MessagesScreen> {
  int _tab = 0;

  @override
  Widget build(BuildContext context) {
    return MainShell(
      currentIndex: 2,
      child: Column(
        children: [
          const SizedBox(height: 16),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: SegmentedButton<int>(
              segments: const [
                ButtonSegment(value: 0, label: Text('الكل')),
                ButtonSegment(value: 1, label: Text('الأطباء')),
                ButtonSegment(value: 2, label: Text('العيادة')),
              ],
              selected: {_tab},
              onSelectionChanged: (s) => setState(() => _tab = s.first),
            ),
          ),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                _chatTile('د. سارة أحمد', 'سأراجع نتائج التحاليل', '10:30 ص', 2),
                _chatTile('مكتب الاستقبال', 'تم تأكيد موعدك', 'أمس', 0),
                _chatTile('د. محمد علي', 'كيف حالك بعد العلاج؟', 'الإثنين', 1),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _chatTile(String name, String msg, String time, int unread) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: CircleAvatar(backgroundColor: AppColors.primaryLight, child: Text(name[0], style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold))),
        title: Text(name, style: const TextStyle(fontWeight: FontWeight.w600)),
        subtitle: Text(msg, maxLines: 1, overflow: TextOverflow.ellipsis),
        trailing: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(time, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
            if (unread > 0) ...[
              const SizedBox(height: 4),
              CircleAvatar(radius: 10, backgroundColor: AppColors.primary, child: Text('$unread', style: const TextStyle(color: Colors.white, fontSize: 10))),
            ],
          ],
        ),
      ),
    );
  }
}
