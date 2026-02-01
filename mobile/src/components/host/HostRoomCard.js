import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors, spacing, fonts } from '../../constants';

const statusColors = {
  'Đang hiển thị': colors.secondary,
  'Chờ duyệt': colors.warning,
  'Đã hết hạn': colors.textLight,
  'Tin nháp': colors.textLight,
};

const fallbackThumbnail = 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=60';

export default function HostRoomCard({
  room,
  onPrimaryAction,
  onSecondaryAction,
}) {
  if (!room) return null;

  const { thumbnail, title, price, status, views, updatedAt } = room;
  const formatted = updatedAt ? new Date(updatedAt).toLocaleDateString('vi-VN') : 'Chưa cập nhật';
  const priceDisplay = typeof price === 'number' ? `${price.toLocaleString('vi-VN')} đ/tháng` : price || 'Đang cập nhật';

  return (
    <View style={styles.card}>
      <Image source={{ uri: thumbnail || fallbackThumbnail }} style={styles.thumbnail} />
      <View style={{ flex: 1 }}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{title}</Text>
          <Text style={[styles.badge, { color: statusColors[status] || colors.primary }]}>{status}</Text>
        </View>
        <Text style={styles.price}>{priceDisplay}</Text>
        <Text style={styles.meta}>Lượt xem: {views}</Text>
        <Text style={styles.meta}>Cập nhật: {formatted}</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.secondaryButton} onPress={onSecondaryAction}>
            <Text style={styles.secondaryText}>Xem phân tích</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryButton} onPress={onPrimaryAction}>
            <Text style={styles.primaryText}>Chỉnh sửa</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: spacing.borderRadius,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    marginBottom: spacing.md,
  },
  thumbnail: {
    width: 96,
    height: 96,
    borderRadius: spacing.borderRadius,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.semiBold,
  },
  badge: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.bold,
  },
  price: {
    marginTop: spacing.xs,
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.medium,
    color: colors.primary,
  },
  meta: {
    marginTop: spacing.xs / 2,
    color: colors.textSecondary,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: spacing.borderRadius,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  primaryText: {
    color: colors.white,
    fontWeight: fonts.weights.semiBold,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: spacing.borderRadius,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  secondaryText: {
    color: colors.text,
    fontWeight: fonts.weights.medium,
  },
});
