import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { RoomCard } from '../../components';
import { colors, spacing, fonts } from '../../constants';
import { useAppContext } from '../../context/AppContext';

const FILTERS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'nearby', label: 'Có bản đồ', predicate: (room) => Boolean(room.location) },
  { id: 'under3', label: 'Dưới 3 triệu', max: 3000000 },
  { id: '3to5', label: '3-5 triệu', min: 3000000, max: 5000000 },
  { id: 'over5', label: 'Trên 5 triệu', min: 5000000 },
];

const formatCurrency = (value) => {
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric)) return 'Đang cập nhật';
  return `${numeric.toLocaleString('vi-VN')} đ/tháng`;
};

const RoomListItem = React.memo(({ room, isFavorite, onPress, onFavoriteToggle }) => (
  <RoomCard
    room={room}
    onPress={onPress}
    isFavorite={isFavorite}
    onFavoriteToggle={onFavoriteToggle}
  />
));

export default function HomeScreen({ navigation, route }) {
  const { state, actions } = useAppContext();
  const {
    rooms = [],
    favoriteRoomIds = [],
    roomsLoading,
    roomStats,
  } = state;

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [advancedFilters, setAdvancedFilters] = useState(null);

  const latestAdvancedFilters = route?.params?.advancedFilters;

  useEffect(() => {
    if (latestAdvancedFilters) {
      setAdvancedFilters(latestAdvancedFilters);
    }
  }, [latestAdvancedFilters]);

  const favoriteRoomIdSet = useMemo(() => new Set(favoriteRoomIds), [favoriteRoomIds]);

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = [room.title, room.address, room.district]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(query));

      const filter = FILTERS.find((f) => f.id === activeFilter);

      const matchesQuickFilter = () => {
        if (!filter || filter.id === 'all') return true;
        if (typeof filter.predicate === 'function') {
          return filter.predicate(room);
        }

        const price = room.price || 0;
        if (filter?.min && price < filter.min) return false;
        if (filter?.max && price > filter.max) return false;
        return true;
      };

      const matchesAdvancedFilters = () => {
        if (!advancedFilters) return true;
        const { priceRange, area, amenities } = advancedFilters;
        const price = room.price || 0;

        if (priceRange) {
          if (priceRange.min && price < priceRange.min) return false;
          if (priceRange.max && price > priceRange.max) return false;
        }

        if (area) {
          const normalized = area.toLowerCase();
          const matchesArea = [room.district, room.address]
            .filter(Boolean)
            .some((field) => field.toLowerCase().includes(normalized));
          if (!matchesArea) return false;
        }

        if (amenities?.length) {
          const roomAmenities = room.amenities || [];
          const hasAll = amenities.every((amenity) => roomAmenities.includes(amenity));
          if (!hasAll) return false;
        }

        return true;
      };

      return matchesSearch && matchesQuickFilter() && matchesAdvancedFilters();
    });
  }, [rooms, searchQuery, activeFilter, advancedFilters]);

  const derivedStats = useMemo(() => {
    const totalRooms = roomStats?.total ?? rooms.length;
    const avgPrice = roomStats?.avgPrice ?? (rooms.length
      ? rooms.reduce((acc, room) => acc + (room.price || 0), 0) / rooms.length
      : 0);

    const weekThreshold = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const newThisWeek = rooms.filter((room) => {
      const created = new Date(room.createdAt);
      return Number.isFinite(created.getTime()) && created.getTime() >= weekThreshold;
    }).length;

    return {
      totalRooms,
      avgPrice,
      newThisWeek,
    };
  }, [roomStats, rooms]);

  const keyExtractor = useCallback((item) => String(item.id || item._id), []);

  const handleRoomPress = useCallback((roomId) => {
    actions.markRoomAsViewed(roomId);
    navigation.navigate('RoomDetail', { roomId });
  }, [actions, navigation]);

  const handleFavoriteToggle = useCallback((roomId) => {
    actions.toggleFavorite(roomId);
  }, [actions]);

  const onRefresh = useCallback(() => {
    actions.fetchRooms();
  }, [actions]);

  const renderRoom = useCallback(({ item }) => {
    const roomId = item.id || item._id;
    return (
      <RoomListItem
        room={item}
        isFavorite={favoriteRoomIdSet.has(roomId)}
        onPress={() => handleRoomPress(roomId)}
        onFavoriteToggle={() => handleFavoriteToggle(roomId)}
      />
    );
  }, [favoriteRoomIdSet, handleFavoriteToggle, handleRoomPress]);

  const renderListHeader = () => (
    <>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Xin chào 👋</Text>
          <Text style={styles.headerSubtitle}>
            {`Hiện có ${rooms.length} phòng đang mở thuê`}
          </Text>
        </View>
        <TouchableOpacity style={styles.refreshPill} onPress={() => actions.fetchRooms()}>
          <Text style={styles.refreshPillText}>Làm mới</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Phòng khả dụng</Text>
          <Text style={styles.statValue}>{derivedStats.totalRooms}</Text>
          <Text style={styles.statHint}>+{derivedStats.newThisWeek} tuần này</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Giá trung bình</Text>
          <Text style={styles.statValue}>{formatCurrency(derivedStats.avgPrice)}</Text>
          <Text style={styles.statHint}>Web view không hỗ trợ bản đồ</Text>
        </View>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm phòng..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          onSubmitEditing={() => navigation.navigate('SearchResults', { query: searchQuery })}
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => navigation.navigate('AdvancedFilter', { initialFilters: advancedFilters })}
        >
          <Text style={styles.filterButtonText}>Bộ lọc</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map((filter) => {
          const isActive = activeFilter === filter.id;
          return (
            <TouchableOpacity
              key={filter.id}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setActiveFilter(filter.id)}
            >
              <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Bản đồ không hỗ trợ trên web</Text>
        <Text style={styles.bannerText}>
          Vui lòng dùng app mobile để xem bản đồ. Bạn vẫn có thể duyệt danh sách phòng và tìm kiếm.
        </Text>
      </View>
    </>
  );

  if (roomsLoading && !rooms.length) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Đang tải danh sách phòng...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredRooms}
        keyExtractor={keyExtractor}
        renderItem={renderRoom}
        ListHeaderComponent={renderListHeader}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={roomsLoading} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Chưa có phòng phù hợp</Text>
            <Text style={styles.emptyText}>Thử đổi tiêu chí tìm kiếm hoặc làm mới dữ liệu.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContent: {
    padding: spacing.m,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: fonts.semiBold,
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.s,
    marginBottom: spacing.m,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f7f7f9',
    padding: spacing.m,
    borderRadius: 12,
  },
  statLabel: {
    fontSize: 13,
    color: colors.textLight,
  },
  statValue: {
    fontSize: 20,
    fontFamily: fonts.semiBold,
    color: colors.text,
    marginTop: 6,
  },
  statHint: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 4,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
    marginBottom: spacing.s,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: spacing.m,
    paddingVertical: 12,
    fontSize: 15,
  },
  filterButton: {
    paddingHorizontal: spacing.m,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 10,
  },
  filterButtonText: {
    color: '#fff',
    fontFamily: fonts.medium,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: spacing.m,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterChipText: {
    color: colors.text,
    fontSize: 13,
  },
  filterChipTextActive: {
    color: '#fff',
  },
  banner: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: spacing.m,
    marginBottom: spacing.m,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  bannerTitle: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: '#92400e',
    marginBottom: 6,
  },
  bannerText: {
    fontSize: 14,
    color: '#92400e',
  },
  refreshPill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#eef2ff',
    borderRadius: 999,
  },
  refreshPillText: {
    color: colors.primary,
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.l,
  },
  loadingText: {
    marginTop: spacing.s,
    color: colors.textLight,
  },
  emptyState: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: colors.text,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    paddingHorizontal: spacing.l,
  },
});
