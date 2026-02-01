import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RoomCard from '../../components/RoomCard';
import { getRecommendedRooms, getPublicRooms } from '../../api/rooms';
import { getRecentViews } from '../../api/viewlogs';
import { useAppContext } from '../../context/AppContext';

const { width } = Dimensions.get('window');

/**
 * HomeScreen - Màn hình trang chủ cho Student
 * Hiển thị: Search, Filters, Phòng đề xuất, Tin đã xem
 */
const HomeScreen = ({ navigation }) => {
  const { state, actions } = useAppContext();
  const { favoriteRoomIds = [] } = state;

  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Data
  const [recommendedRooms, setRecommendedRooms] = useState([]);
  const [recentViewRooms, setRecentViewRooms] = useState([]);
  
  // Filters
  const [selectedPriceFilter, setSelectedPriceFilter] = useState(null);
  const [selectedAreaFilter, setSelectedAreaFilter] = useState(null);

  // Price filters
  const priceFilters = [
    { id: 'all', label: 'Tất cả', min: null, max: null },
    { id: 'under2', label: 'Dưới 2 triệu', min: null, max: 2000000 },
    { id: '2to3', label: '2-3 triệu', min: 2000000, max: 3000000 },
    { id: '3to5', label: '3-5 triệu', min: 3000000, max: 5000000 },
    { id: 'over5', label: 'Trên 5 triệu', min: 5000000, max: null },
  ];

  // Area filters
  const areaFilters = [
    { id: 'all', label: 'Tất cả', min: null, max: null },
    { id: 'under20', label: '< 20m²', min: null, max: 20 },
    { id: '20to30', label: '20-30m²', min: 20, max: 30 },
    { id: '30to50', label: '30-50m²', min: 30, max: 50 },
    { id: 'over50', label: '> 50m²', min: 50, max: null },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadRecommendedRooms(),
        loadRecentViews(),
      ]);
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendedRooms = async () => {
    try {
      const rooms = await getRecommendedRooms(20);
      setRecommendedRooms(rooms || []);
    } catch (error) {
      console.error('Error loading recommended rooms:', error);
      setRecommendedRooms([]);
    }
  };

  const loadRecentViews = async () => {
    try {
      // Only load if user is logged in (student)
      if (state.user && state.user.role === 'student') {
        const views = await getRecentViews();
        // Extract rooms from view logs
        const rooms = views.map(v => v.room).filter(Boolean);
        setRecentViewRooms(rooms.slice(0, 10));
      }
    } catch (error) {
      console.error('Error loading recent views:', error);
      setRecentViewRooms([]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Handle search
  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    navigation.navigate('SearchResults', {
      query: searchQuery,
      priceFilter: selectedPriceFilter,
      areaFilter: selectedAreaFilter,
    });
  };

  // Handle filter change
  const handlePriceFilterChange = async (filter) => {
    setSelectedPriceFilter(filter);
    
    // Apply filter immediately
    if (filter.id !== 'all') {
      try {
        const params = {
          minPrice: filter.min,
          maxPrice: filter.max,
        };
        const { rooms } = await getPublicRooms(params);
        setRecommendedRooms(rooms || []);
      } catch (error) {
        console.error('Error filtering by price:', error);
      }
    } else {
      loadRecommendedRooms();
    }
  };

  const handleAreaFilterChange = async (filter) => {
    setSelectedAreaFilter(filter);
    
    if (filter.id !== 'all') {
      try {
        const params = {
          minArea: filter.min,
          maxArea: filter.max,
        };
        const { rooms } = await getPublicRooms(params);
        setRecommendedRooms(rooms || []);
      } catch (error) {
        console.error('Error filtering by area:', error);
      }
    } else {
      loadRecommendedRooms();
    }
  };

  // Navigate to room detail
  const handleRoomPress = (room) => {
    navigation.navigate('RoomDetail', { roomId: room._id || room.id });
  };

  // Toggle favorite
  const handleToggleFavorite = (room) => {
    const roomId = room._id || room.id;
    actions.toggleFavorite(roomId);
  };

  // Check if room is favorite
  const isFavorite = (room) => {
    const roomId = room._id || room.id;
    return favoriteRoomIds.includes(roomId);
  };

  // Render room card (2 columns)
  const renderRoomCard = ({ item }) => (
    <RoomCard
      room={item}
      onPress={handleRoomPress}
      onToggleFavorite={handleToggleFavorite}
      isFavorite={isFavorite(item)}
    />
  );

  // Render horizontal room card (for recent views)
  const renderHorizontalRoomCard = ({ item }) => (
    <TouchableOpacity
      style={styles.horizontalCard}
      onPress={() => handleRoomPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.horizontalImageContainer}>
        <Image
          source={{ uri: item.images?.[0] || 'https://via.placeholder.com/120x100' }}
          style={styles.horizontalImage}
          resizeMode="cover"
        />
      </View>
      <View style={styles.horizontalContent}>
        <Text style={styles.horizontalPrice} numberOfLines={1}>
          {item.price >= 1000000
            ? `${(item.price / 1000000).toFixed(1)} triệu`
            : `${item.price}K`}
          /tháng
        </Text>
        <Text style={styles.horizontalTitle} numberOfLines={2}>
          {item.title}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading && recommendedRooms.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Search */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm phòng trọ..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2196F3']} />
        }
      >
        {/* Price Filter Chips */}
        <View style={styles.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {priceFilters.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterChip,
                  selectedPriceFilter?.id === filter.id && styles.filterChipActive,
                ]}
                onPress={() => handlePriceFilterChange(filter)}
              >
                <Ionicons
                  name="cash-outline"
                  size={16}
                  color={selectedPriceFilter?.id === filter.id ? '#fff' : '#666'}
                />
                <Text
                  style={[
                    styles.filterChipText,
                    selectedPriceFilter?.id === filter.id && styles.filterChipTextActive,
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Area Filter Chips */}
        <View style={styles.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {areaFilters.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterChip,
                  selectedAreaFilter?.id === filter.id && styles.filterChipActive,
                ]}
                onPress={() => handleAreaFilterChange(filter)}
              >
                <Ionicons
                  name="resize-outline"
                  size={16}
                  color={selectedAreaFilter?.id === filter.id ? '#fff' : '#666'}
                />
                <Text
                  style={[
                    styles.filterChipText,
                    selectedAreaFilter?.id === filter.id && styles.filterChipTextActive,
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Recent Views Section - Horizontal Slider */}
        {recentViewRooms.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Tin đã xem</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={recentViewRooms}
              renderItem={renderHorizontalRoomCard}
              keyExtractor={(item, index) => `recent-${item._id || item.id || index}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </View>
        )}

        {/* Recommended Rooms Section - 2 Columns Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Bất động sản dành cho bạn</Text>
          </View>
          
          {recommendedRooms.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="home-outline" size={60} color="#ccc" />
              <Text style={styles.emptyText}>Chưa có phòng nào</Text>
            </View>
          ) : (
            <View style={styles.gridContainer}>
              {recommendedRooms.map((room, index) => (
                <View key={room._id || room.id || index} style={styles.gridItem}>
                  <RoomCard
                    room={room}
                    onPress={handleRoomPress}
                    onToggleFavorite={handleToggleFavorite}
                    isFavorite={isFavorite(room)}
                  />
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 45,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  filterSection: {
    paddingVertical: 10,
    paddingLeft: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filterChipActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  filterChipText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 5,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  section: {
    marginTop: 15,
    backgroundColor: '#fff',
    paddingVertical: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAll: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
  horizontalList: {
    paddingLeft: 15,
    paddingRight: 5,
  },
  horizontalCard: {
    width: 150,
    marginRight: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
  },
  horizontalImageContainer: {
    width: '100%',
    height: 100,
  },
  horizontalImage: {
    width: '100%',
    height: '100%',
  },
  horizontalContent: {
    padding: 8,
  },
  horizontalPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 3,
  },
  horizontalTitle: {
    fontSize: 12,
    color: '#333',
    lineHeight: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
  },
  gridItem: {
    width: '50%',
    paddingHorizontal: 5,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 14,
    color: '#999',
  },
});

export default HomeScreen;
