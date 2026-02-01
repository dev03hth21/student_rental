import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, spacing, fonts } from '../../constants';
import { studentProfileMock } from '../../data/profileMock';

export default function PaymentHistoryScreen() {
  const payments = studentProfileMock.payments;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Thanh toán & hoá đơn</Text>
      <Text style={styles.subtitle}>Theo dõi các khoản thanh toán tiền phòng, điện nước và cọc.</Text>
      {payments.map((payment) => (
        <View key={payment.id} style={styles.card}>
          <View style={styles.row}>
            <View>
              <Text style={styles.amount}>{payment.amount}</Text>
              <Text style={styles.room}>{payment.room.title}</Text>
            </View>
            <Text style={[styles.status, payment.status !== 'Đã thanh toán' && styles.pending]}>
              {payment.status}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detail}>Phương thức: {payment.method}</Text>
            <Text style={styles.detail}>Ngày thanh toán: {payment.date}</Text>
          </View>
          <TouchableOpacity style={styles.downloadButton}>
            <Text style={styles.downloadText}>Tải hóa đơn PDF</Text>
          </TouchableOpacity>
        </View>
      ))}
      <Text style={styles.note}>* Sẽ kết nối Payment API (Momo/ZaloPay) để tự động lưu hóa đơn.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.screenPadding },
  title: { fontSize: fonts.sizes.title, fontWeight: fonts.weights.bold, marginBottom: spacing.lg },
  subtitle: {
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: spacing.borderRadius,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  amount: { fontSize: fonts.sizes.lg, fontWeight: fonts.weights.semiBold },
  room: { color: colors.textSecondary, marginTop: spacing.xs },
  status: { color: colors.secondary, fontWeight: fonts.weights.semiBold },
  pending: { color: colors.warning },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  detail: { color: colors.textSecondary },
  downloadButton: {
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
  },
  downloadText: { color: colors.primary, fontWeight: fonts.weights.semiBold },
  note: { marginTop: spacing.lg, color: colors.textLight, fontStyle: 'italic' },
});
