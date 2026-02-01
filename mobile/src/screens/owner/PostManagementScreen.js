import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { colors, spacing, fonts } from '../../constants';
import { getHostRooms, updateRoomStatus, deleteRoom } from '../../api/rooms';

const DEBOUNCE_DELAY = 400;

const FILTERS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'available', label: 'Đang hiển thị' },
  { id: 'approved', label: 'Đã duyệt' },
  { id: 'draft', label: 'Nháp' },
  { id: 'pending', label: 'Chờ duyệt' },
  { id: 'rejected', label: 'Bị từ chối' },
];

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

const getToggleConfig = (status) => {
  switch (status) {
    case 'available':
      return { label: 'Đánh dấu đã thuê', nextStatus: 'rented', enabled: true };
    case 'rented':
      return { label: 'Mở lại tin', nextStatus: 'available', enabled: true };
    case 'approved':
      return { label: 'Đẩy lên hiển thị', nextStatus: 'available', enabled: true };
    case 'pending':
      return { label: 'Đang chờ duyệt', enabled: false };
    case 'draft':
      return { label: 'Hoàn thiện tin', enabled: false };
    default:
      return { label: 'Tạm khoá', enabled: false };
  }
};

const fallbackThumbnail = 'https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&w=800&q=60';

const formatPrice = (price) => {
  if (typeof price !== 'number') return 'Liên hệ';
  return `${price.toLocaleString('vi-VN')} đ/tháng`;
};

export default function PostManagementScreen({ navigation }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const searchPersistRef = useRef('');
  const searchEffectInitializedRef = useRef(false);

  const loadRooms = useCallback(
    async ({ isRefresh = false, searchText } = {}) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        setError(null);

        const params = {};
        if (activeFilter !== 'all') {
          params.status = activeFilter;
        }

        let normalizedSearch;
        if (typeof searchText === 'string') {
          normalizedSearch = searchText.trim();
          searchPersistRef.current = normalizedSearch;
        } else {
          normalizedSearch = searchPersistRef.current;
        }

        if (normalizedSearch) {
          params.search = normalizedSearch;
        }

        const data = await getHostRooms(params);
        const responsePayload = data?.data || data;
        const list = Array.isArray(responsePayload?.rooms)
          ? responsePayload.rooms
          : Array.isArray(responsePayload)
          ? responsePayload
          : responsePayload?.rooms || [];
        setRooms(list);
      } catch (err) {
        const message = err.response?.data?.message || 'Không thể tải danh sách tin đăng';
        setError(message);
      } finally {
        if (isRefresh) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    [activeFilter]
  );

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  useEffect(() => {
    if (!searchEffectInitializedRef.current) {
      searchEffectInitializedRef.current = true;
      return;
    }
    const handler = setTimeout(() => {
      loadRooms({ searchText: search });
    }, DEBOUNCE_DELAY);
    return () => clearTimeout(handler);
  }, [search, loadRooms]);

  const onRefresh = useCallback(
    () => loadRooms({ isRefresh: true, searchText: searchPersistRef.current }),
    [loadRooms]
  );

  const statusCounters = useMemo(() => {
    return rooms.reduce(
      (acc, room) => {
        if (room?.status && acc[room.status] !== undefined) {
          acc[room.status] += 1;
        }
        return acc;
      },
      {
        draft: 0,
        pending: 0,
        rejected: 0,
      }
    );
  }, [rooms]);

  const handleUpdateStatus = async (room, nextStatus) => {
    if (!nextStatus) return;
    try {
      setActionLoading(room._id);
      await updateRoomStatus(room._id, { status: nextStatus });
      setRooms((prev) =>
        prev.map((item) =>
          item._id === room._id
            ? { ...item, status: nextStatus, derivedStatus: null }
            : item
        )
      );
    } catch (err) {
      Alert.alert('Lỗi', err.response?.data?.message || 'Không thể cập nhật trạng thái');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = (roomId) => {
    Alert.alert('Xoá tin đăng', 'Bạn chắc chắn muốn xoá tin này?', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Xoá',
        style: 'destructive',
        onPress: async () => {
          try {
            setActionLoading(roomId);
            await deleteRoom(roomId);
            setRooms((prev) => prev.filter((room) => room._id !== roomId));
          } catch (err) {
            Alert.alert('Lỗi', err.response?.data?.message || 'Không thể xoá tin đăng');
          } finally {
            setActionLoading(null);
          }
        },
      },
    ]);
  };

  const handleEdit = (roomId) => {
    navigation?.getParent()?.navigate('OwnerCreate', { roomId });
  };

  const handleView = (roomId) => {
    navigation?.navigate('OwnerListingDetail', { roomId });
  };

  const renderRoomCard = (room) => {
    const price = formatPrice(room.price);
    const views = typeof room.views === 'number' ? `${room.views} lượt xem` : 'Chưa có lượt xem';
    const statusKey = room.derivedStatus || room.status;
    const statusLabel = STATUS_LABELS[statusKey] || 'Đang cập nhật';
    const badgeColor = STATUS_COLORS[statusKey] || colors.text;
    const toggleConfig = getToggleConfig(room.status);
    const canEdit = room.status === 'draft';

    return (
      <View key={room._id} style={styles.card}>
        <Image source={{ uri: room.thumbnail || fallbackThumbnail }} style={styles.thumbnail} />
        <View style={{ flex: 1 }}>
          <View style={styles.cardHeader}>
            <Text style={styles.title}>{room.title || 'Tin đăng chưa đặt tên'}</Text>
            <Text style={[styles.statusBadge, { color: badgeColor }]}>{statusLabel}</Text>
          </View>
          <Text style={styles.price}>{price}</Text>
          <Text style={styles.address}>{room.address || 'Chưa cập nhật địa chỉ'}</Text>
          <Text style={styles.meta}>{views}</Text>
          {(room.status === 'draft' || room.status === 'pending') && (
            <Text style={styles.draftHint}>
              {room.status === 'draft'
                ? 'Tin nháp - chọn Sửa để hoàn thiện trước khi gửi duyệt'
                : 'Tin đang chờ duyệt - bạn sẽ được thông báo khi có kết quả'}
            </Text>
          )}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.neutralButton} onPress={() => handleView(room._id)}>
              <Text style={styles.neutralLabel}>Xem</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.neutralButton, !canEdit && styles.buttonDisabled]}
              onPress={() =>
                canEdit
                  ? handleEdit(room._id)
                  : Alert.alert('Không thể sửa', 'Chỉ có thể chỉnh sửa khi tin đang ở trạng thái nháp.')
              }
            >
              <Text style={[styles.neutralLabel, !canEdit && styles.neutralDisabled]}>Sửa</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.primaryButton,
                (!toggleConfig.enabled || actionLoading === room._id) && styles.buttonDisabled,
              ]}
              onPress={() => toggleConfig.enabled && handleUpdateStatus(room, toggleConfig.nextStatus)}
              disabled={actionLoading === room._id || !toggleConfig.enabled}
            >
              {actionLoading === room._id ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.primaryLabel}>{toggleConfig.label}</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dangerButton, actionLoading === room._id && styles.buttonDisabled]}
              onPress={() => handleDelete(room._id)}
              disabled={actionLoading === room._id}
            >
              <Text style={styles.dangerLabel}>Xoá</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loaderText}>Đang tải tin đăng...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <Text style={styles.screenTitle}>Quản lý tin đăng</Text>
      <Text style={styles.screenSubtitle}>Theo dõi trạng thái tin và thao tác nhanh.</Text>

      <View style={styles.searchBar}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Tìm theo tên, mã phòng, địa chỉ..."
          placeholderTextColor={colors.textLight}
          style={styles.searchInput}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[styles.filterChip, activeFilter === filter.id && styles.filterChipActive]}
            onPress={() => setActiveFilter(filter.id)}
          >
            <Text style={[styles.filterLabel, activeFilter === filter.id && styles.filterLabelActive]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {rooms.length > 0 && (
        <View style={styles.draftBanner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.draftBannerTitle}>Tin cần hoàn tất</Text>
            <Text style={styles.draftBannerSubtitle}>
              {statusCounters.draft} nháp · {statusCounters.pending} chờ duyệt · {statusCounters.rejected} bị từ chối
            </Text>
          </View>
          <TouchableOpacity style={styles.draftBannerButton} onPress={() => setActiveFilter('draft')}>
            <Text style={styles.draftBannerButtonText}>Xem nháp</Text>
          </TouchableOpacity>
        </View>
      )}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {rooms.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Chưa có tin phù hợp</Text>
          <Text style={styles.emptyDescription}>Thay đổi bộ lọc hoặc tạo tin mới để hiển thị tại đây.</Text>
        </View>
      ) : (
        rooms.map(renderRoomCard)
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.screenPadding,
    paddingBottom: spacing.xl,
    gap: spacing.md,
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
  screenTitle: {
    fontSize: fonts.sizes.title,
    fontWeight: fonts.weights.bold,
  },
  screenSubtitle: {
    color: colors.textSecondary,
  },
  searchBar: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.borderRadius,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
  },
  searchInput: {
    height: 44,
    color: colors.text,
  },
  filterRow: {
    marginVertical: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.borderRadius,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
  },
  filterChipActive: {
    backgroundColor: colors.text,
    borderColor: colors.text,
  },
  filterLabel: {
    fontWeight: fonts.weights.medium,
    color: colors.text,
  },
  filterLabelActive: {
    color: colors.white,
  },
  errorText: {
    color: colors.error || '#F04438',
    fontWeight: fonts.weights.medium,
  },
  draftBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: spacing.borderRadius,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  draftBannerTitle: {
    fontWeight: fonts.weights.semiBold,
    fontSize: fonts.sizes.md,
  },
  draftBannerSubtitle: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
  },
  draftBannerButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius,
    backgroundColor: colors.primary,
  },
  draftBannerButtonText: {
    color: colors.white,
    fontWeight: fonts.weights.semiBold,
  },
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.semiBold,
  },
  statusBadge: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.bold,
    textTransform: 'capitalize',
  },
  price: {
    marginTop: spacing.xs,
    fontSize: fonts.sizes.md,
    color: colors.primary,
    fontWeight: fonts.weights.bold,
  },
  address: {
    color: colors.textSecondary,
    marginTop: spacing.xs / 2,
  },
  meta: {
    color: colors.textLight,
    marginTop: spacing.xs / 2,
  },
  draftHint: {
    marginTop: spacing.xs,
    color: colors.warning || '#F59E0B',
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.medium,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  neutralButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.borderRadius,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  neutralLabel: {
    fontWeight: fonts.weights.medium,
    color: colors.text,
    textAlign: 'center',
  },
  neutralDisabled: {
    color: colors.textLight,
  },
  primaryButton: {
    flex: 1.2,
    borderRadius: spacing.borderRadius,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
  },
  primaryLabel: {
    color: colors.white,
    fontWeight: fonts.weights.semiBold,
    textAlign: 'center',
  },
  dangerButton: {
    flex: 1,
    borderRadius: spacing.borderRadius,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    backgroundColor: colors.error || '#F04438',
  },
  dangerLabel: {
    color: colors.white,
    fontWeight: fonts.weights.semiBold,
    textAlign: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  emptyState: {
    padding: spacing.lg,
    borderRadius: spacing.borderRadius,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  emptyTitle: {
    fontWeight: fonts.weights.semiBold,
    fontSize: fonts.sizes.md,
  },
  emptyDescription: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
