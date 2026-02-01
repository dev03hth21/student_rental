import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
// Sharing removed per request
import { RoomCard } from '../../components';
import { colors, spacing, fonts } from '../../constants';
import { useAppContext } from '../../context/AppContext';

const FAVORITE_FILTERS = [
  { id: 'all', label: 'Tất cả', predicate: () => true },
  // Removed non-price filters; using price-focused quick filters
  { id: 'under3', label: '< 3 triệu', predicate: (room) => Number(room.price || 0) < 3000000 },
  {
    id: '3to5',
    label: '3 - 5 triệu',
    predicate: (room) => {
      const price = Number(room.price || 0);
      return price >= 3000000 && price <= 5000000;
    },
  },
  { id: 'over5', label: '> 5 triệu', predicate: (room) => Number(room.price || 0) > 5000000 },
];

export default function FavoritesScreen({ navigation }) {
  const { state, actions } = useAppContext();
  const favoriteRooms = state.favoriteRooms || [];
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredFavorites = useMemo(() => {
    const filter = FAVORITE_FILTERS.find((item) => item.id === activeFilter);
    if (!filter) return favoriteRooms;
    return favoriteRooms.filter(filter.predicate);
  }, [favoriteRooms, activeFilter]);

  const visitCount = favoriteRooms.reduce((acc, room) => acc + (room.views || 0), 0);
  const expiringRooms = favoriteRooms.filter((room) => room.status === 'pending').length;

  // Removed handleShareFavorites function as per the patch request

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Phòng yêu thích</Text>
          <Text style={styles.subtitle}>{favoriteRooms.length} phòng đang theo dõi</Text>
        </View>
      </View>


      <View style={styles.filterCard}>
        <Text style={styles.filterTitle}>Lọc nhanh</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {FAVORITE_FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[styles.filterChip, activeFilter === filter.id && styles.filterChipActive]}
              onPress={() => setActiveFilter(filter.id)}
            >
              <Text
                style={[styles.filterChipText, activeFilter === filter.id && styles.filterChipTextActive]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredFavorites}
        keyExtractor={(item) => String(item.id || item._id)}
        renderItem={({ item }) => (
          <RoomCard
            room={item}
            onPress={() =>
              navigation.navigate('HomeTab', {
                screen: 'RoomDetail',
                params: { roomId: item.id || item._id },
              })
            }
            isFavorite
            onFavoriteToggle={() => actions.toggleFavorite(item.id || item._id)}
          />
        )}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Danh sách trống</Text>
            <Text style={styles.emptySubtitle}>
              {favoriteRooms.length
                ? 'Không có phòng nào khớp bộ lọc này'
                : 'Hãy nhấn biểu tượng ♥ ở phòng bạn thích để lưu lại tại đây.'}
            </Text>
            {favoriteRooms.length > 0 && (
              <TouchableOpacity onPress={() => setActiveFilter('all')}>
                <Text style={styles.resetFilter}>Xóa lọc</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.screenPadding,
  },
  title: {
    fontSize: fonts.sizes.title,
    fontWeight: fonts.weights.bold,
    color: colors.text,
  },
  subtitle: {
    color: colors.textSecondary,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  filterCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: spacing.borderRadius,
    marginBottom: spacing.md,
  },
  filterTitle: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.semiBold,
    marginBottom: spacing.sm,
  },
  filterChip: {
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadius,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    color: colors.text,
  },
  filterChipTextActive: {
    color: colors.white,
    fontWeight: fonts.weights.medium,
  },
  emptyState: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.bold,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    textAlign: 'center',
    color: colors.textSecondary,
  },
  resetFilter: {
    marginTop: spacing.md,
    color: colors.primary,
    fontWeight: fonts.weights.medium,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
});
