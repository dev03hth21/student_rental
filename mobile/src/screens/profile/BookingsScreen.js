import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, spacing, fonts } from '../../constants';
import { studentProfileMock } from '../../data/profileMock';

const STATUS_STYLES = {
  'Đã xác nhận': { backgroundColor: '#D1FAE5', color: colors.secondary },
  'Đang chờ': { backgroundColor: '#FEF3C7', color: colors.warning },
  'Đã hủy': { backgroundColor: '#FEE2E2', color: colors.error },
};

export default function BookingsScreen() {
  const bookings = studentProfileMock.bookings;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Lịch sử đặt phòng</Text>
      <Text style={styles.subtitle}>Theo dõi trạng thái đặt phòng và hành động tiếp theo của bạn.</Text>
      {bookings.map((booking) => {
        const statusStyle = STATUS_STYLES[booking.status] || STATUS_STYLES['Đang chờ'];
        return (
          <View key={booking.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.room}>{booking.room.title}</Text>
                <Text style={styles.address}>{booking.room.address}</Text>
              </View>
              <View style={[styles.statusPill, { backgroundColor: statusStyle.backgroundColor }] }>
                <Text style={[styles.statusText, { color: statusStyle.color }]}>{booking.status}</Text>
              </View>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Ngày đặt: <Text style={styles.metaValue}>{booking.date}</Text></Text>
              <Text style={styles.metaLabel}>Giá dự kiến: <Text style={styles.metaValue}>{booking.room.price.toLocaleString('vi-VN')} đ/tháng</Text></Text>
            </View>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionText}>{booking.action}</Text>
            </TouchableOpacity>
          </View>
        );
      })}
      <Text style={styles.note}>* Màn hình minh hoạ, sẽ đồng bộ với Booking API + push notification.</Text>
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  room: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.semiBold,
    color: colors.text,
  },
  address: {
    color: colors.textSecondary,
  },
  statusPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
  },
  statusText: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.semiBold,
  },
  metaRow: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  metaLabel: {
    color: colors.textSecondary,
  },
  metaValue: {
    color: colors.text,
    fontWeight: fonts.weights.medium,
  },
  actionButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
  },
  actionText: {
    color: colors.primary,
    fontWeight: fonts.weights.semiBold,
  },
  note: { marginTop: spacing.lg, color: colors.textLight, fontStyle: 'italic' },
});
