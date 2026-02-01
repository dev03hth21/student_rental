import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { colors, spacing, fonts } from '../../constants';
import { useAppContext } from '../../context/AppContext';
import { RoomCard } from '../../components';

const PRICE_FILTERS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'under3', label: '< 3 triệu', max: 3000000 },
  { id: '3to5', label: '3-5 triệu', min: 3000000, max: 5000000 },
  { id: 'over5', label: '> 5 triệu', min: 5000000 },
];

const SORT_OPTIONS = [
  { id: 'relevant', label: 'Phù hợp nhất' },
  { id: 'price-asc', label: 'Giá tăng dần' },
  { id: 'price-desc', label: 'Giá giảm dần' },
  { id: 'newest', label: 'Đăng mới' },
];

const formatCurrency = (value) => {
  const numeric = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numeric) ? `${numeric.toLocaleString('vi-VN')} đ/tháng` : 'Đang cập nhật';
};

export default function SearchResultsScreen({ route, navigation }) {
  const query = route.params?.query || '';
  const { state, actions } = useAppContext();
  const [priceFilter, setPriceFilter] = useState('all');
  const [sortOption, setSortOption] = useState('relevant');

  const filteredResults = useMemo(() => {
    const lower = query.toLowerCase();
    const quickFilter = PRICE_FILTERS.find((filter) => filter.id === priceFilter);

    const matchesQuery = (room) => {
      if (!lower) return true;
      return [room.title, room.address, room.district]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(lower));
    };

    const matchesPrice = (room) => {
      if (!quickFilter || quickFilter.id === 'all') return true;
      const price = Number(room.price || 0);
      if (quickFilter.min && price < quickFilter.min) return false;
      if (quickFilter.max && price > quickFilter.max) return false;
      return true;
    };

    const base = state.rooms.filter((room) => matchesQuery(room) && matchesPrice(room));

    const sorted = [...base];
    if (sortOption === 'price-asc') {
      sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortOption === 'price-desc') {
      sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortOption === 'newest') {
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return sorted;
  }, [query, state.rooms, priceFilter, sortOption]);

  const stats = {
    total: filteredResults.length,
    avgPrice: filteredResults.length
      ? Math.round(
          filteredResults.reduce((acc, room) => acc + (room.price || 0), 0) / filteredResults.length
        )
      : 0,
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Kết quả tìm kiếm</Text>
        <Text style={styles.subtitle}>
          Từ khóa: "{query || 'Tất cả'}" • {filteredResults.length} phòng
        </Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Số lượng</Text>
          <Text style={styles.statValue}>{stats.total}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Giá TB</Text>
          <Text style={styles.statValue}>{formatCurrency(stats.avgPrice)}</Text>
        </View>
      </View>

      <View style={styles.filterGroup}>
        <ScrollRow>
          {PRICE_FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[styles.chip, priceFilter === filter.id && styles.chipActive]}
              onPress={() => setPriceFilter(filter.id)}
            >
              <Text style={[styles.chipText, priceFilter === filter.id && styles.chipTextActive]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollRow>
        <ScrollRow>
          {SORT_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[styles.sortChip, sortOption === option.id && styles.sortChipActive]}
              onPress={() => setSortOption(option.id)}
            >
              <Text style={[styles.sortChipText, sortOption === option.id && styles.sortChipTextActive]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollRow>
      </View>

      <FlatList
        data={filteredResults}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RoomCard
            room={item}
            onPress={() => {
              actions.markRoomAsViewed(item.id);
              navigation.navigate('RoomDetail', { roomId: item.id });
            }}
            isFavorite={state.favoriteRoomIds.includes(item.id)}
            onFavoriteToggle={() => actions.toggleFavorite(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={(
          <RefreshControl
            refreshing={Boolean(state.roomsLoading)}
            onRefresh={() => actions.fetchRooms()}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Không tìm thấy phòng phù hợp</Text>
            <Text style={styles.emptySubtitle}>Hãy thử thay đổi từ khóa hoặc áp dụng bộ lọc khác.</Text>
          </View>
        )}
      />
    </View>
  );
}

function ScrollRow({ children }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollRowContent}
      style={styles.scrollRow}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  title: { fontSize: fonts.sizes.title, fontWeight: fonts.weights.bold, color: colors.text },
  subtitle: { color: colors.textSecondary, marginTop: spacing.xs },
  listContent: { paddingHorizontal: spacing.screenPadding, paddingBottom: spacing.lg },
  emptyState: { padding: spacing.lg, alignItems: 'center' },
  emptyTitle: { fontSize: fonts.sizes.lg, fontWeight: fonts.weights.bold, marginBottom: spacing.sm },
  emptySubtitle: { textAlign: 'center', color: colors.textSecondary },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.screenPadding,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadius,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: fonts.sizes.sm,
  },
  statValue: {
    marginTop: spacing.xs,
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.bold,
    color: colors.text,
  },
  filterGroup: {
    paddingHorizontal: spacing.screenPadding,
    marginBottom: spacing.md,
  },
  scrollRow: {
    marginBottom: spacing.sm,
  },
  scrollRowContent: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.text,
    fontSize: fonts.sizes.sm,
  },
  chipTextActive: {
    color: colors.white,
    fontWeight: fonts.weights.medium,
  },
  sortChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.borderRadius,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  sortChipActive: {
    borderColor: colors.primary,
  },
  sortChipText: {
    color: colors.text,
  },
  sortChipTextActive: {
    color: colors.primary,
    fontWeight: fonts.weights.semiBold,
  },
});
