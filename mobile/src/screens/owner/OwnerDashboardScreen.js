import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { colors, spacing, fonts } from '../../constants';
import { useAppContext } from '../../context/AppContext';
import { fetchHostDashboard } from '../../api/dashboard';

const suggestionTabs = [
  { id: 'important', label: 'Quan trọng' },
  { id: 'info', label: 'Thông tin' },
  { id: 'tips', label: 'Gợi ý' },
];

const avatarFallback = 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=500&q=60';

const formatNumber = (value) => {
  const numeric = typeof value === 'number' ? value : Number(value || 0);
  if (Number.isNaN(numeric)) return '0';
  return numeric.toLocaleString('vi-VN');
};

export default function OwnerDashboardScreen({ navigation }) {
  const { state } = useAppContext();
  const user = state.user || { name: 'Chủ trọ' };
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(suggestionTabs[0].id);

  const loadDashboard = useCallback(async ({ isRefresh = false } = {}) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const data = await fetchHostDashboard();
      setDashboardData(data || {});
    } catch (err) {
      const message = err.response?.data?.message || 'Không thể tải dashboard';
      setError(message);
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const onRefresh = useCallback(() => loadDashboard({ isRefresh: true }), [loadDashboard]);

  const stats = dashboardData || {};

  const suggestionData = useMemo(() => {
    if (stats.recommendations) {
      return {
        important: stats.recommendations.important || [],
        info: stats.recommendations.info || [],
        tips: stats.recommendations.tips || [],
      };
    }

    const important = [];
    if ((stats.pendingRooms || 0) > 0) {
      important.push({
        id: 'pending-rooms',
        title: `${formatNumber(stats.pendingRooms)} tin đang chờ duyệt`,
        description: 'Hoàn thiện mô tả và ảnh để được xét duyệt nhanh hơn.',
      });
    }
    if ((stats.rejectedRooms || 0) > 0) {
      important.push({
        id: 'rejected-rooms',
        title: `${formatNumber(stats.rejectedRooms)} tin bị từ chối gần đây`,
        description: 'Kiểm tra lý do từ chối và cập nhật lại nội dung.',
      });
    }
    if (!important.length) {
      important.push({
        id: 'all-good',
        title: 'Tất cả tin đăng đang ổn định',
        description: 'Tiếp tục duy trì phản hồi nhanh để giữ thứ hạng cao.',
      });
    }

    const info = [
      {
        id: 'total-rooms',
        title: `${formatNumber(stats.totalRooms)} tin trong tài khoản`,
        description: `${formatNumber(stats.approvedRooms)} tin đã được phê duyệt, ${formatNumber(stats.availableRooms)} tin đang mở đặt chỗ.`,
      },
      {
        id: 'rented-rooms',
        title: `${formatNumber(stats.rentedRooms)} phòng đã có khách`,
        description: 'Có thể chuyển sang trạng thái “đã thuê” để tránh khách gọi nhầm.',
      },
    ];

    const tips = (stats.topRooms || []).length
      ? (stats.topRooms || []).map((room, index) => ({
          id: room.roomId || `room-${index}`,
          title: `${room.title || 'Tin đăng'} • ${formatNumber(room.callCount)} liên hệ`,
          description: 'Duy trì cập nhật hình ảnh đẹp và phản hồi dưới 5 phút để giữ vị trí top.',
        }))
      : [
          {
            id: 'tip-default',
            title: 'Chưa có dữ liệu phòng nổi bật',
            description: 'Hãy đẩy tin và thêm video tour để thu hút sinh viên.',
          },
        ];

    return {
      important,
      info,
      tips,
    };
  }, [stats]);

  const currentSuggestions = suggestionData[activeTab] || [];

  if (loading && !refreshing) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loaderText}>Đang tải dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Image source={{ uri: user.avatar || avatarFallback }} style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.welcomeText}>Xin chào</Text>
            <Text style={styles.hostName}>{user.name || 'Chủ trọ'}</Text>
            <Text style={styles.hostMeta}>UID: HOST-{(user._id || '0000').slice(-4)}</Text>
          </View>
        </View>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.primaryStatRow}>
        <View style={[styles.primaryStatCard, styles.primaryStatCardAccent]}>
          <Text style={styles.statLabel}>Tin đăng đang hiển thị</Text>
          <Text style={styles.statValue}>{formatNumber(stats.approvedRooms)}</Text>
          <Text style={styles.statCaption}>{formatNumber(stats.pendingRooms)} đang chờ duyệt</Text>
        </View>
        <View style={styles.primaryStatCard}>
          <Text style={styles.statLabel}>Lượt liên hệ 30 ngày</Text>
          <Text style={styles.statValue}>{formatNumber(stats.totalCalls)}</Text>
          <Text style={styles.statCaption}>{formatNumber(stats.callsToday)} cuộc gọi hôm nay</Text>
        </View>
      </View>

      <View style={styles.secondaryStatRow}>
        <View style={styles.secondaryStatCard}>
          <Text style={styles.secondaryLabel}>Tin bị từ chối</Text>
          <Text style={styles.secondaryValue}>{formatNumber(stats.rejectedRooms)}</Text>
        </View>
        <View style={styles.secondaryStatCard}>
          <Text style={styles.secondaryLabel}>Tin đã thuê</Text>
          <Text style={styles.secondaryValue}>{formatNumber(stats.rentedRooms)}</Text>
        </View>
        <View style={styles.secondaryStatCard}>
          <Text style={styles.secondaryLabel}>Tổng tin</Text>
          <Text style={styles.secondaryValue}>{formatNumber(stats.totalRooms)}</Text>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trợ lý dành cho bạn</Text>
          <TouchableOpacity>
            <Text style={styles.sectionAction}>Xem lịch sử</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabRow}>
          {suggestionTabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabChip, activeTab === tab.id && styles.tabChipActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={[styles.tabLabel, activeTab === tab.id && styles.tabLabelActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.suggestionList}>
          {currentSuggestions.map((item) => (
            <View key={item.id} style={styles.suggestionCard}>
              <Text style={styles.suggestionTitle}>{item.title}</Text>
              <Text style={styles.suggestionDescription}>{item.description}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tin được quan tâm nhất</Text>
          <TouchableOpacity onPress={() => navigation?.getParent()?.navigate('OwnerListings')}>
            <Text style={styles.sectionAction}>Quản lý tin</Text>
          </TouchableOpacity>
        </View>
        {(stats.topRooms || []).map((room, index) => (
          <View key={room.roomId || index} style={styles.topRoomCard}>
            <View style={styles.topRoomBadge}>
              <Text style={styles.topRoomBadgeText}>#{index + 1}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.topRoomTitle}>{room.title || 'Tin đăng'}</Text>
              <Text style={styles.topRoomMeta}>{formatNumber(room.callCount)} lượt liên hệ gần đây</Text>
            </View>
            <TouchableOpacity
              style={styles.manageButton}
              onPress={() =>
                navigation?.navigate('OwnerListings', {
                  screen: 'OwnerListingDetail',
                  params: {
                    roomId: room.roomId,
                    returnTo: 'OwnerOverview',
                    fromOverviewTop: true,
                    readOnly: true,
                  },
                })
              }
            >
              <Text style={styles.manageButtonText}>Chi tiết</Text>
            </TouchableOpacity>
          </View>
        ))}
        {((stats.topRooms || []).length === 0) && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Chưa có dữ liệu</Text>
            <Text style={styles.emptyDescription}>Khi học sinh gọi điện nhiều, danh sách này sẽ được cập nhật.</Text>
          </View>
        )}
      </View>
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
    gap: spacing.lg,
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  loaderText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: spacing.lg,
    borderRadius: spacing.borderRadius,
    backgroundColor: colors.text,
    gap: spacing.md,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  welcomeText: {
    color: colors.textLight,
    fontSize: fonts.sizes.sm,
    textTransform: 'uppercase',
  },
  hostName: {
    color: colors.white,
    fontSize: fonts.sizes.heading,
    fontWeight: fonts.weights.bold,
  },
  hostMeta: {
    color: colors.textLight,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationIcon: {
    fontSize: fonts.sizes.lg,
  },
  errorText: {
    color: colors.error || '#F04438',
    fontWeight: fonts.weights.medium,
  },
  primaryStatRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  primaryStatCard: {
    flex: 1,
    borderRadius: spacing.borderRadius,
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    minHeight: 120,
  },
  primaryStatCardAccent: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  statLabel: {
    color: colors.textSecondary,
    textTransform: 'uppercase',
    fontSize: fonts.sizes.sm,
    textAlign: 'center',
  },
  statValue: {
    marginTop: spacing.xs,
    fontSize: fonts.sizes.title,
    fontWeight: fonts.weights.bold,
    color: colors.text,
    textAlign: 'center',
  },
  statCaption: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  secondaryStatRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  secondaryStatCard: {
    flex: 1,
    borderRadius: spacing.borderRadius,
    padding: spacing.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    minHeight: 100,
  },
  secondaryLabel: {
    color: colors.textSecondary,
    fontSize: fonts.sizes.sm,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  secondaryValue: {
    marginTop: spacing.xs,
    fontSize: fonts.sizes.heading,
    fontWeight: fonts.weights.bold,
    textAlign: 'center',
  },
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadius,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.semiBold,
  },
  sectionAction: {
    color: colors.primary,
    fontWeight: fonts.weights.medium,
  },
  tabRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  tabChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.borderRadius,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  tabChipActive: {
    backgroundColor: colors.text,
    borderColor: colors.text,
  },
  tabLabel: {
    fontWeight: fonts.weights.medium,
    color: colors.text,
  },
  tabLabelActive: {
    color: colors.white,
  },
  suggestionList: {
    gap: spacing.sm,
  },
  suggestionCard: {
    borderRadius: spacing.borderRadius,
    borderWidth: 1,
    borderColor: colors.divider,
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  suggestionTitle: {
    fontWeight: fonts.weights.semiBold,
    fontSize: fonts.sizes.md,
  },
  suggestionDescription: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
  },
  topRoomCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  topRoomBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topRoomBadgeText: {
    fontWeight: fonts.weights.semiBold,
  },
  topRoomTitle: {
    fontWeight: fonts.weights.medium,
  },
  topRoomMeta: {
    color: colors.textSecondary,
    marginTop: spacing.xs / 2,
  },
  manageButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius,
    borderWidth: 1,
    borderColor: colors.border,
  },
  manageButtonText: {
    fontWeight: fonts.weights.medium,
  },
  emptyState: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  emptyTitle: {
    fontWeight: fonts.weights.semiBold,
  },
  emptyDescription: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
