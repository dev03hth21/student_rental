import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, spacing, fonts } from '../../constants';
import { studentProfileMock } from '../../data/profileMock';

export default function ReviewsScreen() {
  const reviews = studentProfileMock.reviews;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Đánh giá của tôi</Text>
      <Text style={styles.subtitle}>Quản lý các nhận xét bạn gửi cho chủ trọ.</Text>
      {reviews.map((review) => (
        <View key={review.id} style={styles.card}>
          <View style={styles.header}>
            <View>
              <Text style={styles.room}>{review.room.title}</Text>
              <Text style={styles.address}>{review.room.address}</Text>
            </View>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>⭐ {review.rating}</Text>
            </View>
          </View>
          <Text style={styles.comment}>{review.comment}</Text>
          <Text style={styles.date}>Ngày gửi: {review.date}</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.outlineButton}>
              <Text style={styles.outlineText}>Chỉnh sửa</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.outlineButton}>
              <Text style={styles.outlineText}>Xoá</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
      <Text style={styles.note}>* Tính năng chỉnh sửa/xoá sẽ khả dụng sau khi nối Review API.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.screenPadding },
  title: { fontSize: fonts.sizes.title, fontWeight: fonts.weights.bold, marginBottom: spacing.lg },
  subtitle: { color: colors.textSecondary, marginBottom: spacing.lg },
  card: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: spacing.borderRadius,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  room: { fontSize: fonts.sizes.lg, fontWeight: fonts.weights.semiBold },
  address: { color: colors.textSecondary },
  ratingBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.borderRadius,
  },
  ratingText: { fontSize: fonts.sizes.md, color: colors.warning, fontWeight: fonts.weights.semiBold },
  comment: { color: colors.text, marginBottom: spacing.sm },
  date: { color: colors.textSecondary, fontSize: fonts.sizes.sm },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  outlineButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.borderRadius,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  outlineText: {
    color: colors.text,
    fontWeight: fonts.weights.medium,
  },
  note: { marginTop: spacing.lg, color: colors.textLight, fontStyle: 'italic' },
});
