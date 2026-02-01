import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { colors, spacing, fonts } from '../../constants';

const PREFERENCES = [
  { id: 'notification', label: 'Thông báo đẩy', description: 'Gửi cảnh báo về phòng yêu thích, hóa đơn mới.', value: true },
  { id: 'email', label: 'Email tổng hợp tuần', description: 'Nhận danh sách phòng/mẹo tiết kiệm mỗi thứ Hai.', value: false },
  { id: 'dark', label: 'Chế độ tối (đang phát triển)', description: 'Giảm chói và phù hợp dùng ban đêm.', value: false, disabled: true },
];

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cài đặt</Text>
      {PREFERENCES.map((pref) => (
        <View key={pref.id} style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>{pref.label}</Text>
            <Text style={styles.description}>{pref.description}</Text>
          </View>
          <Switch value={pref.value} disabled={pref.disabled} />
        </View>
      ))}
      <Text style={styles.note}>* Các tuỳ chọn sẽ đồng bộ với API hồ sơ người dùng trong giai đoạn tiếp theo.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.screenPadding, backgroundColor: colors.background },
  title: { fontSize: fonts.sizes.title, fontWeight: fonts.weights.bold, marginBottom: spacing.lg },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderColor: colors.divider,
  },
  label: { fontSize: fonts.sizes.md, color: colors.text },
  description: { color: colors.textSecondary, fontSize: fonts.sizes.sm },
  note: { marginTop: spacing.lg, color: colors.textLight, fontStyle: 'italic' },
});
