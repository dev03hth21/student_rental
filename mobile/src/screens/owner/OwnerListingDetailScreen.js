import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { colors, spacing, fonts } from '../../constants';
import { getRoomDetail } from '../../api/rooms';

const STATUS_LABELS = {
  approved: 'Đã duyệt',
  pending: 'Chờ duyệt',
  rejected: 'Bị từ chối',
  expired: 'Hết hạn hiển thị',
  expiring: 'Sắp hết hạn',
  draft: 'Nháp',
  available: 'Đang hiển thị',
  rented: 'Đã cho thuê',
};

const STATUS_COLORS = {
  approved: colors.secondary,
  pending: colors.warning || '#F59E0B',
  rejected: colors.error || '#F04438',
  expired: colors.textLight,
  expiring: colors.warning || '#F59E0B',
  draft: colors.textSecondary,
  available: colors.primary,
  rented: colors.textSecondary,
};

const fallbackThumbnail = 'https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&w=800&q=60';

const formatPrice = (price) => {
  if (typeof price !== 'number') return 'Liên hệ';
  return `${price.toLocaleString('vi-VN')} đ/tháng`;
};

export default function OwnerListingDetailScreen({ route, navigation }) {
  const roomId = route?.params?.roomId;
  const returnTo = route?.params?.returnTo;
  const readOnly = route?.params?.readOnly;
  const fromOverviewTop = route?.params?.fromOverviewTop;
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDetail = useCallback(async () => {
    if (!roomId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getRoomDetail(roomId);
      setRoom(data);
    } catch (err) {
      const message = err?.response?.data?.message || 'Không thể tải chi tiết tin đăng';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const statusMeta = useMemo(() => {
    const key = room?.derivedStatus || room?.status;
    return {
      label: STATUS_LABELS[key] || 'Đang cập nhật',
      color: STATUS_COLORS[key] || colors.text,
    };
  }, [room]);

  const handleBack = useCallback(() => {
    const parentNav = navigation.getParent?.();

    // Luôn đưa về tab Tin đăng (OwnerListings) và màn danh sách chủ đạo
    parentNav?.navigate('OwnerListings', { screen: 'OwnerListingsHome' });
    navigation.navigate('OwnerListings', { screen: 'OwnerListingsHome' });
  }, [navigation]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loaderText}>Đang tải chi tiết tin...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadDetail}>
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!room) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={styles.errorText}>Không tìm thấy tin đăng.</Text>
      </View>
    );
  }

  const images = Array.isArray(room.images) && room.images.length ? room.images : [fallbackThumbnail];
  const price = formatPrice(room.price);
  const area = room.area ? `${room.area} m²` : 'Chưa cập nhật';
  const createdAt = room.createdAt ? new Date(room.createdAt).toLocaleString('vi-VN') : '—';
  const updatedAt = room.updatedAt ? new Date(room.updatedAt).toLocaleString('vi-VN') : '—';
  const rejectReason = room.adminNote || room.rejectReason || room.reason || null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{room.title || 'Tin đăng'}</Text>
          <Text style={styles.address}>{room.address || 'Chưa có địa chỉ'}</Text>
        </View>
        <Text style={[styles.statusBadge, { color: statusMeta.color }]}>{statusMeta.label}</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gallery}>
        {images.map((uri, idx) => (
          <Image key={`${uri}-${idx}`} source={{ uri }} style={styles.image} />
        ))}
      </ScrollView>

      <View style={styles.infoCard}>
        <InfoRow label="Giá" value={price} />
        <InfoRow label="Diện tích" value={area} />
        <InfoRow label="Trạng thái" value={statusMeta.label} color={statusMeta.color} />
        <InfoRow label="Ngày tạo" value={createdAt} />
        <InfoRow label="Cập nhật" value={updatedAt} />
        {room.views !== undefined && <InfoRow label="Lượt xem" value={`${room.views}`} />}
        {rejectReason && room.status === 'rejected' && (
          <InfoRow label="Lý do từ chối" value={rejectReason} color={colors.error || '#F04438'} />
        )}
      </View>

      {room.description ? (
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Mô tả</Text>
          <Text style={styles.description}>{room.description}</Text>
        </View>
      ) : null}

      {Array.isArray(room.amenities) && room.amenities.length ? (
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Tiện ích</Text>
          <Text style={styles.description}>{room.amenities.join(' • ')}</Text>
        </View>
      ) : null}

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={handleBack}
        >
          <Text style={styles.secondaryText}>Về danh sách</Text>
        </TouchableOpacity>
        {!readOnly && (
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={() => navigation.getParent()?.navigate('OwnerCreate', { roomId })}
          >
            <Text style={styles.primaryText}>Sửa tin</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

function InfoRow({ label, value, color }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, color ? { color } : null]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.screenPadding,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  loaderText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
  },
  errorText: {
    color: colors.error || '#F04438',
    fontWeight: fonts.weights.medium,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius,
    backgroundColor: colors.primary,
  },
  retryText: {
    color: colors.white,
    fontWeight: fonts.weights.semiBold,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  title: {
    fontSize: fonts.sizes.title,
    fontWeight: fonts.weights.bold,
    color: colors.text,
  },
  address: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
  },
  statusBadge: {
    fontWeight: fonts.weights.bold,
    fontSize: fonts.sizes.sm,
  },
  gallery: {
    marginVertical: spacing.sm,
  },
  image: {
    width: 220,
    height: 140,
    borderRadius: spacing.borderRadius,
    marginRight: spacing.sm,
    backgroundColor: colors.surface,
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  infoLabel: {
    color: colors.textSecondary,
  },
  infoValue: {
    color: colors.text,
    fontWeight: fonts.weights.medium,
    flexShrink: 1,
    textAlign: 'right',
  },
  sectionTitle: {
    fontWeight: fonts.weights.semiBold,
    fontSize: fonts.sizes.md,
    marginBottom: spacing.xs,
  },
  description: {
    color: colors.text,
    lineHeight: 20,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: spacing.borderRadius,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  primaryText: {
    color: colors.white,
    fontWeight: fonts.weights.semiBold,
  },
  secondaryText: {
    color: colors.text,
    fontWeight: fonts.weights.medium,
  },
});
