import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../../components';
import { colors, spacing, fonts } from '../../../constants';
import { useCreatePost } from '../../../context/CreatePostContext';

export default function LocationStepWeb({ onBack, onReset }) {
  const { data } = useCreatePost();

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>3. Đặt ghim bản đồ & gửi duyệt</Text>
      <Text style={styles.subtitle}>
        Bản đồ không hỗ trợ trên web. Vui lòng sử dụng ứng dụng mobile để đặt ghim vị trí chính xác rồi gửi duyệt tin.
      </Text>

      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Không hỗ trợ bản đồ trên web</Text>
        <Text style={styles.bannerText}>
          - Bạn cần mở ứng dụng mobile để đặt ghim tọa độ phòng.
          {'\n'}- Sau khi ghim, quay lại đây để xem lại thông tin nếu cần.
        </Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Tóm tắt tin đăng</Text>
        <InfoRow label="Loại" value={data.type || 'Chưa chọn'} />
        <InfoRow label="Tiêu đề" value={data.title || 'Chưa có'} />
        <InfoRow label="Giá" value={data.price ? `${data.price} VND/tháng` : 'Chưa có'} />
        <InfoRow label="Diện tích" value={data.area ? `${data.area} m²` : 'Chưa có'} />
        <InfoRow label="Ảnh" value={`${data.images?.length || 0} ảnh`} />
      </View>

      <View style={styles.actions}>
        <Button title="Quay lại" variant="ghost" onPress={onBack} style={styles.flexButton} />
        <Button
          title="Đóng"
          variant="outline"
          onPress={onReset}
          style={styles.flexButton}
        />
      </View>
    </ScrollView>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  title: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fonts.sizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  banner: {
    backgroundColor: '#fef3c7',
    borderRadius: spacing.borderRadius,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#fde68a',
    marginBottom: spacing.lg,
  },
  bannerTitle: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.semiBold,
    color: '#92400e',
    marginBottom: spacing.xs,
  },
  bannerText: {
    fontSize: fonts.sizes.md,
    color: '#92400e',
    lineHeight: 20,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.lg,
  },
  summaryTitle: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.semiBold,
    marginBottom: spacing.sm,
    color: colors.text,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  infoLabel: {
    color: colors.textSecondary,
  },
  infoValue: {
    color: colors.text,
    fontWeight: fonts.weights.medium,
    textAlign: 'right',
    flex: 1,
    marginLeft: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  flexButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
});
