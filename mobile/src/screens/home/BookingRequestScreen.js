import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Button, Input } from '../../components';
import { colors, spacing, fonts } from '../../constants';
import { useAppContext } from '../../context/AppContext';

const VISIT_SLOTS = [
  '09:00 - 10:00 • Hôm nay',
  '14:00 - 15:00 • Hôm nay',
  '09:00 - 10:00 • Ngày mai',
  '16:00 - 17:00 • Ngày mai',
];

const COMMUNICATION = ['Chat trong app', 'Gọi điện', 'Zalo'];

export default function BookingRequestScreen({ route }) {
  const { state, actions } = useAppContext();
  const roomId = route?.params?.roomId;
  const roomFromState = useMemo(() => state.rooms.find((item) => item.id === roomId), [state.rooms, roomId]);
  const room = roomFromState || route?.params?.room || {
    id: 'mock-room',
    title: 'Phòng trọ Q10 gần ĐH Bách Khoa',
    price: 3500000,
    address: '268 Lý Thường Kiệt, Quận 10',
  };
  const viewer = state.user || { name: 'Sinh viên Demo', email: 'demo@student.com' };

  const [slot, setSlot] = useState(VISIT_SLOTS[0]);
  const [channel, setChannel] = useState(COMMUNICATION[0]);
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    const request = actions.createBookingRequest({
      roomId: room.id,
      roomTitle: room.title,
      slot,
      channel,
      notes,
      user: {
        name: viewer.name,
        email: viewer.email,
      },
    });
    Alert.alert(
      'Đã gửi yêu cầu',
      'Thông tin sẽ hiển thị ở mục "Lịch sử đặt phòng" khi backend hoàn tất.',
      [{ text: 'Xem yêu cầu', onPress: () => console.log('Booking request', request) }, { text: 'Đóng' }]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: spacing.xl }}>
      <View style={styles.summaryCard}>
        <Text style={styles.label}>Phòng quan tâm</Text>
        <Text style={styles.roomTitle}>{room.title}</Text>
        <Text style={styles.address}>{room.address}</Text>
        <Text style={styles.price}>{room.price.toLocaleString('vi-VN')} đ/tháng</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Chọn lịch xem phòng</Text>
        <View style={styles.chipWrap}>
          {VISIT_SLOTS.map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.chip, slot === item && styles.chipActive]}
              onPress={() => setSlot(item)}
            >
              <Text style={[styles.chipText, slot === item && styles.chipTextActive]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.helper}>* Thời gian thực tế sẽ được xác nhận bởi chủ trọ.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
        <Input label="Họ tên" placeholder="Nguyễn Văn A" value={viewer.name} disabled />
        <Input label="Email" placeholder="demo@student.com" value={viewer.email} disabled />
        <Input
          label="Ghi chú thêm"
          placeholder="Ví dụ: Em muốn xem thêm bãi giữ xe"
          value={notes}
          onChangeText={setNotes}
          multiline
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Giao tiếp ưu tiên</Text>
        <View style={styles.chipWrap}>
          {COMMUNICATION.map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.chip, channel === item && styles.chipActive]}
              onPress={() => setChannel(item)}
            >
              <Text style={[styles.chipText, channel === item && styles.chipTextActive]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Button title="Gửi yêu cầu xem phòng" fullWidth onPress={handleSubmit} />
      <Text style={styles.note}>
        * Layout mô phỏng. Khi kết nối API, trạng thái lịch hẹn sẽ hiển thị trong mục "Lịch sử đặt phòng" và gửi thông báo cho chủ trọ.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.screenPadding,
    backgroundColor: colors.background,
  },
  summaryCard: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: spacing.borderRadius,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  label: {
    color: colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  roomTitle: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.semiBold,
    marginBottom: spacing.xs,
  },
  address: {
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  price: {
    color: colors.primary,
    fontWeight: fonts.weights.bold,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.semiBold,
    marginBottom: spacing.sm,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  chipText: {
    color: colors.text,
  },
  chipTextActive: {
    color: colors.white,
    fontWeight: fonts.weights.semiBold,
  },
  helper: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
  },
  note: {
    marginTop: spacing.md,
    color: colors.textLight,
    fontStyle: 'italic',
  },
});
