import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors, spacing, fonts } from '../../constants';

const fallbackAvatar = 'https://i.pravatar.cc/100?img=12';

export default function HostCallLogItem({ log, onCallPress }) {
  if (!log) return null;

  const name = log.name || log.studentName || 'Sinh viên ẩn danh';
  const phone = log.phone || log.phoneNumber || '---';
  const room = log.room || log.roomTitle || 'Tin đã xóa';
  const minutesAgo = log.minutesAgo ?? log.relativeTime ?? 0;
  const badgeCount = log.count ?? log.roomCallCount ?? 1;
  const avatar = log.avatar || log.studentAvatar || fallbackAvatar;

  return (
    <View style={[styles.card, log.isRead === false && styles.unreadCard]}>
      <Image source={{ uri: avatar }} style={styles.avatar} />
      <View style={{ flex: 1 }}>
        <View style={styles.row}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.badge}>{badgeCount} lần</Text>
        </View>
        <Text style={styles.phone}>{phone}</Text>
        <Text style={styles.room}>{room}</Text>
        <Text style={styles.meta}>{minutesAgo} phút trước</Text>
      </View>
      <TouchableOpacity style={styles.callButton} onPress={() => onCallPress?.(log)}>
        <Text style={styles.callLabel}>Gọi lại</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: spacing.borderRadius,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  unreadCard: {
    borderColor: colors.primary,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.semiBold,
  },
  badge: {
    fontSize: fonts.sizes.sm,
    color: colors.primary,
    fontWeight: fonts.weights.medium,
  },
  phone: {
    color: colors.text,
    marginTop: spacing.xs / 2,
    fontWeight: fonts.weights.medium,
  },
  room: {
    color: colors.textSecondary,
    marginTop: spacing.xs / 2,
  },
  meta: {
    color: colors.textLight,
    marginTop: spacing.xs / 2,
  },
  callButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius,
    backgroundColor: colors.primary,
  },
  callLabel: {
    color: colors.white,
    fontWeight: fonts.weights.semiBold,
  },
});
