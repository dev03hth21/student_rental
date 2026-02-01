import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as Location from 'expo-location';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import RoomCard from '../../components/RoomCard';
import { colors, spacing, fonts } from '../../constants';
import { useAppContext } from '../../context/AppContext';

const DEFAULT_REGION = {
  latitude: 10.776889,
  longitude: 106.700897,
  latitudeDelta: 0.15,
  longitudeDelta: 0.15,
};

const FILTERS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'budget', label: 'Dưới 3 triệu', max: 3000000 },
  { id: 'mid', label: '3 - 5 triệu', min: 3000000, max: 5000000 },
  { id: 'premium', label: 'Trên 5 triệu', min: 5000000 },
  {
    id: 'new',
    label: 'Mới đăng',
    predicate: (room) => {
      if (!room?.createdAt) return false;
      const created = new Date(room.createdAt).getTime();
      if (!Number.isFinite(created)) return false;
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      return created >= weekAgo;
    },
  },
];

const normalizeCoordinate = (location) => {
  if (!location) return null;
  if (location.latitude && location.longitude) {
    return { latitude: Number(location.latitude), longitude: Number(location.longitude) };
  }
  if (location.lat && location.lng) {
    return { latitude: Number(location.lat), longitude: Number(location.lng) };
  }
  if (Array.isArray(location.coordinates) && location.coordinates.length === 2) {
    return { latitude: Number(location.coordinates[1]), longitude: Number(location.coordinates[0]) };
  }
  return null;
};

const formatCurrency = (value) => {
  if (!Number.isFinite(value)) return 'Liên hệ';
  return `${Number(value).toLocaleString('vi-VN')} đ`;
};

// Hiển thị giá dạng triệu với 2 chữ số thập phân (1,65 triệu)
const formatMillion = (value) => {
  if (!Number.isFinite(value)) return '0';
  const million = value / 1_000_000;
  return `${million.toFixed(2)} triệu`;
};

const extractAreaLabel = (room) => {
  if (room?.district) return room.district;
  if (room?.address) {
    const parts = room.address.split(',').map((p) => p.trim()).filter(Boolean);
    if (parts.length) return parts[parts.length - 1];
  }
  return 'Khu vực khác';
};

export default function HomeScreen({ navigation }) {
  const { state, actions } = useAppContext();
  const {
    rooms = [],
    favoriteRoomIds = [],
    recentRoomItems = [],
    roomsError,
    roomsLoading,
    roomStats,
  } = state || {};

  const mapRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedMapRoom, setSelectedMapRoom] = useState(null);
  const [mapRegion, setMapRegion] = useState(DEFAULT_REGION);
  const [userLocation, setUserLocation] = useState(null);
  const [locationPermission, setLocationPermission] = useState(null);

  useEffect(() => {
    actions?.fetchRooms?.();
    // run only on mount to avoid re-fetch loops when context actions change reference
  }, []);

  const derivedRegion = useMemo(() => {
    const coords = rooms
      .map((room) => normalizeCoordinate(room.location))
      .filter(Boolean);
    if (!coords.length) return DEFAULT_REGION;

    const avgLat = coords.reduce((acc, c) => acc + c.latitude, 0) / coords.length;
    const avgLng = coords.reduce((acc, c) => acc + c.longitude, 0) / coords.length;

    return {
      latitude: avgLat,
      longitude: avgLng,
      latitudeDelta: 0.12,
      longitudeDelta: 0.12,
    };
  }, [rooms]);

  useEffect(() => {
    const requestLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        setLocationPermission(status);
        if (status !== 'granted') return;

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          mayShowUserSettingsDialog: false,
        });

        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };
        setUserLocation(coords);
        setMapRegion(coords);
      } catch (error) {
        console.warn('Location error', error?.message || error);
      }
    };

    requestLocation();
  }, []);

  useEffect(() => {
    if (!userLocation) {
      setMapRegion(derivedRegion);
    }
  }, [derivedRegion, userLocation]);

  useEffect(() => {
    if (mapRef.current && mapRegion) {
      mapRef.current.animateToRegion(mapRegion, 250);
    }
  }, [mapRegion]);

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = query
        ? [room.title, room.address, room.district]
            .filter(Boolean)
            .some((field) => field.toLowerCase().includes(query))
        : true;

      const filter = FILTERS.find((f) => f.id === activeFilter);
      if (!filter || filter.id === 'all') return matchesSearch;

      if (typeof filter.predicate === 'function') {
        return matchesSearch && filter.predicate(room);
      }

      const price = room.price || 0;
      if (filter.min && price < filter.min) return false;
      if (filter.max && price > filter.max) return false;
      return matchesSearch;
    });
  }, [rooms, searchQuery, activeFilter]);

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

    const nearCampus = rooms.filter((room) => {
      const text = `${room.address || ''} ${room.description || ''}`.toLowerCase();
      return text.includes('đh') || text.includes('đại học') || text.includes('campus');
    }).length;

    const areaCounts = rooms.reduce((acc, room) => {
      const areaLabel = extractAreaLabel(room);
      acc[areaLabel] = (acc[areaLabel] || 0) + 1;
      return acc;
    }, {});

    const trendingDistricts = Object.entries(areaCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([label, count]) => `${label} (${count})`);

    return {
      totalRooms,
      avgPrice,
      nearCampus,
      newThisWeek,
      trendingDistricts,
    };
  }, [roomStats, rooms]);

  const mapRooms = useMemo(
    () =>
      filteredRooms
        .map((room) => ({ ...room, coordinate: normalizeCoordinate(room.location) }))
        .filter((room) => room.coordinate)
        .slice(0, 20),
    [filteredRooms]
  );

  useEffect(() => {
    if (mapRooms.length && mapRef.current) {
      const first = mapRooms[0].coordinate;
      mapRef.current.animateToRegion(
        {
          ...first,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        },
        300
      );
      setMapRegion((prev) => ({
        ...prev,
        ...first,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
      }));
    }
  }, [mapRooms]);

  const favoriteRoomIdSet = useMemo(() => new Set(favoriteRoomIds), [favoriteRoomIds]);
  const keyExtractor = useCallback((item) => String(item.id || item._id), []);

  const handleSearchSubmit = () => {
    navigation.navigate('SearchResults', { query: searchQuery });
  };

  const handleRoomPress = useCallback((roomId) => {
    actions?.markRoomAsViewed?.(roomId);
    navigation.navigate('RoomDetail', { roomId });
  }, [actions, navigation]);

  const handleFavoriteToggle = useCallback((room) => {
    const roomId = room.id || room._id;
    actions?.toggleFavorite?.(roomId);
  }, [actions]);

  const handleMarkerPress = useCallback((room) => {
    setSelectedMapRoom(room);
    const coord = room.coordinate || normalizeCoordinate(room.location);
    if (coord) {
      setMapRegion((prev) => ({
        ...prev,
        latitude: coord.latitude,
        longitude: coord.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }));
    }
  }, []);

  const onRefresh = useCallback(() => {
    actions?.fetchRooms?.();
  }, [actions]);

  const renderRoom = useCallback(({ item }) => {
    const roomId = item.id || item._id;
    return (
      <RoomCard
        room={item}
        onPress={() => handleRoomPress(roomId)}
        onToggleFavorite={() => handleFavoriteToggle(item)}
        isFavorite={favoriteRoomIdSet.has(roomId)}
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
        <TouchableOpacity style={styles.refreshPill} onPress={() => actions?.fetchRooms?.()}>
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
          <Text style={styles.statValue}>{formatMillion(derivedStats.avgPrice)}</Text>
          {derivedStats.nearCampus > 0 && (
            <Text style={styles.statHint}>{`${derivedStats.nearCampus} gần campus`}</Text>
          )}
        </View>
      </View>

      {mapRooms.length > 0 && (
        <View style={styles.mapCard}>
          <View style={styles.mapHeader}>
            <View>
              <Text style={styles.mapTitle}>Khám phá trên bản đồ</Text>
              <Text style={styles.mapSubtitle}>{mapRooms.length} phòng có tọa độ</Text>
            </View>
            <View style={styles.mapActions}>
              <TouchableOpacity onPress={() => navigation.navigate('MapViewScreen')}>
                <Text style={styles.mapAction}>Phóng to</Text>
              </TouchableOpacity>
            </View>
          </View>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={mapRegion}
            showsUserLocation={locationPermission === 'granted'}
            showsMyLocationButton
            followsUserLocation={false}
            onMapReady={() => {
              if (mapRooms.length && mapRooms[0].coordinate && mapRef.current) {
                mapRef.current.animateToRegion({
                  ...mapRooms[0].coordinate,
                  latitudeDelta: 0.08,
                  longitudeDelta: 0.08,
                }, 250);
              }
            }}
          >
            {mapRooms.map((room) => {
              const roomId = room.id || room._id;
              return (
                <Marker
                  key={roomId}
                  coordinate={room.coordinate}
                  onPress={() => handleMarkerPress(room)}
                  tracksViewChanges={false}
                >
                  <View style={styles.markerWrapper}>
                    <View style={styles.markerBubble}>
                      <Text style={styles.markerText}>{formatCurrency(room.price)}</Text>
                    </View>
                    <View style={styles.markerPointer} />
                  </View>
                </Marker>
              );
            })}
          </MapView>
          {selectedMapRoom && (
            <TouchableOpacity
              style={styles.selectedRoomCard}
              onPress={() => handleRoomPress(selectedMapRoom.id || selectedMapRoom._id)}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.selectedRoomTitle} numberOfLines={1}>
                  {selectedMapRoom.title}
                </Text>
                <Text style={styles.selectedRoomMeta} numberOfLines={1}>
                  {extractAreaLabel(selectedMapRoom)} • {formatCurrency(selectedMapRoom.price)}
                </Text>
              </View>
              <Text style={styles.selectedRoomCta}>Xem</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm theo địa điểm, giá..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
          placeholderTextColor={colors.textLight}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterChips}
        contentContainerStyle={styles.filterChipsContent}
      >
        {FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[styles.chip, activeFilter === filter.id && styles.chipActive]}
            onPress={() => setActiveFilter(filter.id)}
          >
            <Text style={[styles.chipText, activeFilter === filter.id && styles.chipTextActive]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {roomsError && (
        <TouchableOpacity style={styles.errorCard} onPress={() => actions?.fetchRooms?.()}>
          <Text style={styles.errorTitle}>Không thể tải dữ liệu</Text>
          <Text style={styles.errorMessage}>{roomsError}</Text>
          <Text style={styles.errorAction}>Chạm để thử lại</Text>
        </TouchableOpacity>
      )}

    </>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredRooms}
        renderItem={renderRoom}
        keyExtractor={keyExtractor}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            {roomsLoading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <>
                <Text style={styles.emptyTitle}>Chưa có phòng phù hợp</Text>
                <Text style={styles.emptySubtitle}>
                  Hãy thử thay đổi từ khóa hoặc bộ lọc để xem thêm phòng nhé.
                </Text>
              </>
            )}
          </View>
        )}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews
        refreshControl={(
          <RefreshControl
            refreshing={Boolean(roomsLoading)}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fonts.sizes.title,
    fontWeight: fonts.weights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: fonts.sizes.md,
    color: colors.textSecondary,
  },
  refreshPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  refreshPillText: {
    color: colors.text,
    fontWeight: fonts.weights.medium,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.screenPadding,
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
    fontSize: fonts.sizes.heading,
    fontWeight: fonts.weights.bold,
    color: colors.text,
    marginTop: spacing.xs,
  },
  statHint: {
    marginTop: spacing.xs,
    color: colors.textLight,
  },
  mapCard: {
    marginTop: spacing.lg,
    marginHorizontal: spacing.screenPadding,
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadius,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  mapActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  mapTitle: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.semiBold,
    color: colors.text,
  },
  mapSubtitle: {
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  mapAction: {
    color: colors.primary,
    fontWeight: fonts.weights.medium,
  },
  map: {
    width: '100%',
    height: 220,
  },
  markerBubble: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.borderRadius,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  markerText: {
    color: colors.text,
    fontSize: fonts.sizes.xs,
    fontWeight: fonts.weights.semiBold,
  },
  markerWrapper: {
    alignItems: 'center',
  },
  markerPointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.white,
    marginTop: -1,
  },
  selectedRoomCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  selectedRoomTitle: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.semiBold,
    color: colors.text,
  },
  selectedRoomMeta: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  selectedRoomCta: {
    color: colors.primary,
    fontWeight: fonts.weights.bold,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.screenPadding,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.borderRadius,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fonts.sizes.md,
    color: colors.text,
  },
  filterChips: {
    marginTop: spacing.md,
  },
  filterChipsContent: {
    paddingHorizontal: spacing.screenPadding,
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: fonts.sizes.sm,
    color: colors.text,
  },
  chipTextActive: {
    color: colors.white,
  },
  errorCard: {
    marginHorizontal: spacing.screenPadding,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: spacing.borderRadius,
    backgroundColor: '#FFF4F2',
    borderWidth: 1,
    borderColor: colors.error,
  },
  errorTitle: {
    color: colors.error,
    fontWeight: fonts.weights.semiBold,
  },
  errorMessage: {
    marginTop: spacing.xs,
    color: colors.text,
  },
  errorAction: {
    marginTop: spacing.sm,
    color: colors.primary,
    fontWeight: fonts.weights.medium,
  },
  listContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.xxl,
  },
  gridRow: {
    justifyContent: 'space-between',
    paddingBottom: spacing.md,
  },
  emptyState: {
    marginTop: spacing.xl,
    alignItems: 'center',
    paddingHorizontal: spacing.screenPadding,
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
});
