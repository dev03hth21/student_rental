import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Button } from '../../components';
import { colors, spacing, fonts } from '../../constants';
import { useAppContext } from '../../context/AppContext';

const METHODS = [
  { id: 'momo', label: 'Ví Momo' },
  { id: 'zalopay', label: 'ZaloPay' },
  { id: 'bank', label: 'Chuyển khoản ngân hàng' },
];

export default function DepositCheckoutScreen({ route }) {
  const { state } = useAppContext();
  const roomId = route?.params?.roomId;
  const roomFromState = useMemo(() => state.rooms.find((item) => item.id === roomId), [state.rooms, roomId]);
  const room = roomFromState || route?.params?.room || {
    id: 'mock-room',
    title: 'Studio full nội thất Quận 7',
    price: 5500000,
    owner: { name: 'Anh Quân' },
  };

  const depositLevels = useMemo(() => {
    const price = Number(room.price || 0);
    if (!price) return [1000000, 1500000, 2000000];
    return [0.2, 0.4, 0.6].map((ratio) => Math.max(500000, Math.round((price * ratio) / 1000) * 1000));
  }, [room.price]);

  const [method, setMethod] = useState('momo');
  const [amount, setAmount] = useState(depositLevels[0]);
  useEffect(() => {
    setAmount(depositLevels[0]);
  }, [depositLevels]);
  const fee = Math.round(amount * 0.02);

  const handleCheckout = () => {
    Alert.alert(
      'Đang hoàn thiện',
      'Luồng thanh toán sẽ kết nối cổng thật ở giai đoạn tiếp theo. Số tiền bạn chọn đã được ghi nhận cho bài test UI.'
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: spacing.xl }}>
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Thông tin đặt cọc</Text>
        <Text style={styles.room}>{room.title}</Text>
        <Text style={styles.meta}>Giá thuê: {room.price.toLocaleString('vi-VN')} đ/tháng</Text>
        <Text style={styles.meta}>Chủ trọ: {room.owner?.name || 'Đang cập nhật'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Chọn số tiền đặt cọc</Text>
        <View style={styles.optionRow}>
          {depositLevels.map((value) => (
            <TouchableOpacity
              key={value}
              style={[styles.amountCard, amount === value && styles.amountCardActive]}
              onPress={() => setAmount(value)}
            >
              <Text style={[styles.amountText, amount === value && styles.amountTextActive]}>
                {value.toLocaleString('vi-VN')} đ
              </Text>
              <Text style={styles.amountCaption}>~ {Math.round((value / room.price) * 100)}% giá phòng</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Phương thức thanh toán</Text>
        {METHODS.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.methodRow, method === item.id && styles.methodRowActive]}
            onPress={() => setMethod(item.id)}
          >
            <Text style={[styles.methodName, method === item.id && styles.methodNameActive]}>{item.label}</Text>
            <Text style={styles.methodHint}>{method === item.id ? 'Đang chọn' : 'Nhấn để chọn'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Tóm tắt thanh toán</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tiền đặt cọc</Text>
          <Text style={styles.summaryValue}>{amount.toLocaleString('vi-VN')} đ</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Phí bảo vệ giao dịch (2%)</Text>
          <Text style={styles.summaryValue}>{fee.toLocaleString('vi-VN')} đ</Text>
        </View>
        <View style={styles.summaryRowTotal}>
          <Text style={styles.summaryTotalLabel}>Tổng thanh toán</Text>
          <Text style={styles.summaryTotalValue}>{(amount + fee).toLocaleString('vi-VN')} đ</Text>
        </View>
        <Text style={styles.note}>
          * Sau khi chủ trọ xác nhận, tiền cọc sẽ chuyển trạng thái "tạm giữ". Bạn có thể yêu cầu hoàn trả trong mục "Yêu cầu hoàn cọc".
        </Text>
      </View>

      <Button title="Thanh toán và giữ phòng" fullWidth onPress={handleCheckout} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.screenPadding,
    backgroundColor: colors.background,
  },
  section: {
    marginBottom: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  sectionLabel: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.semiBold,
    marginBottom: spacing.sm,
  },
  room: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.medium,
    marginBottom: spacing.xs,
  },
  meta: {
    color: colors.textSecondary,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  amountCard: {
    flex: 1,
    minWidth: 120,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.borderRadius,
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  amountCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  amountText: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.semiBold,
    color: colors.text,
  },
  amountTextActive: {
    color: colors.white,
  },
  amountCaption: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
  },
  methodRow: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.borderRadius,
    padding: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.white,
  },
  methodRowActive: {
    borderColor: colors.primary,
  },
  methodName: {
    fontWeight: fonts.weights.medium,
    color: colors.text,
  },
  methodNameActive: {
    color: colors.primary,
  },
  methodHint: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  summaryRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    color: colors.textSecondary,
  },
  summaryValue: {
    fontWeight: fonts.weights.medium,
    color: colors.text,
  },
  summaryTotalLabel: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.semiBold,
  },
  summaryTotalValue: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.bold,
    color: colors.primary,
  },
  note: {
    marginTop: spacing.sm,
    color: colors.textLight,
    fontStyle: 'italic',
  },
});
