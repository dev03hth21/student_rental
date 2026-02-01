import React, { useState, useEffect, useCallback } from 'react';
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
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RoomListCard from '../../components/RoomListCard';
import { getPublicRooms } from '../../api/rooms';
import { useAppContext } from '../../context/AppContext';

/**
 * SearchResultsScreen - Màn hình kết quả tìm kiếm
 * 
 * Features:
 * - Search bar với clear button
 * - Filter chips (Price, Area)
 * - Sort options (Price asc/desc, Newest)
 * - List view với RoomListCard
 * - Favorite & Call actions
 */
const SearchResultsScreen = ({ route, navigation }) => {
  const { state, actions } = useAppContext();
  const { favoriteRoomIds = [] } = state;

  // Params từ navigation
  const initialQuery = route.params?.query || '';
  const initialPriceFilter = route.params?.priceFilter || null;
  const initialAreaFilter = route.params?.areaFilter || null;

  // State
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filters
  const [selectedPriceFilter, setSelectedPriceFilter] = useState(initialPriceFilter);
  const [selectedAreaFilter, setSelectedAreaFilter] = useState(initialAreaFilter);
  const [sortOption, setSortOption] = useState('newest');
  const [showSortModal, setShowSortModal] = useState(false);

  // Filter definitions
  const priceFilters = [
    { id: 'all', label: 'Tất cả', min: null, max: null },
    { id: 'under2', label: 'Dưới 2 triệu', min: null, max: 2000000 },
    { id: '2to3', label: '2-3 triệu', min: 2000000, max: 3000000 },
    { id: '3to5', label: '3-5 triệu', min: 3000000, max: 5000000 },
    { id: 'over5', label: 'Trên 5 triệu', min: 5000000, max: null },
  ];

  const areaFilters = [
    { id: 'all', label: 'Tất cả', min: null, max: null },
    { id: 'under20', label: '< 20m²', min: null, max: 20 },
    { id: '20to30', label: '20-30m²', min: 20, max: 30 },
    { id: '30to50', label: '30-50m²', min: 30, max: 50 },
    { id: 'over50', label: '> 50m²', min: 50, max: null },
  ];

  const sortOptions = [
    { id: 'newest', label: 'Mới nhất', value: '-createdAt' },
    { id: 'price_asc', label: 'Giá tăng dần', value: 'price' },
    { id: 'price_desc', label: 'Giá giảm dần', value: '-price' },
    { id: 'area_desc', label: 'Diện tích lớn', value: '-area' },
  ];

  useEffect(() => {
    searchRooms();
  }, [searchQuery, selectedPriceFilter, selectedAreaFilter, sortOption]);

  const searchRooms = async () => {
    setLoading(true);
    try {
      const params = {
        keyword: searchQuery || undefined,
        minPrice: selectedPriceFilter?.min || undefined,
        maxPrice: selectedPriceFilter?.max || undefined,
        minArea: selectedAreaFilter?.min || undefined,
        maxArea: selectedAreaFilter?.max || undefined,
        sort: sortOptions.find(opt => opt.id === sortOption)?.value || '-createdAt',
        limit: 50,
      };

      const { rooms: fetchedRooms } = await getPublicRooms(params);
      setRooms(fetchedRooms || []);
    } catch (error) {
      console.error('Error searching rooms:', error);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await searchRooms();
    setRefreshing(false);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handlePriceFilterChange = (filter) => {
    setSelectedPriceFilter(filter.id === 'all' ? null : filter);
  };

  const handleAreaFilterChange = (filter) => {
    setSelectedAreaFilter(filter.id === 'all' ? null : filter);
  };

  const handleSortChange = (option) => {
    setSortOption(option.id);
    setShowSortModal(false);
  };

  const handleRoomPress = (room) => {
    navigation.navigate('RoomDetail', { roomId: room._id || room.id });
  };

  const handleToggleFavorite = (room) => {
    const roomId = room._id || room.id;
    actions.toggleFavorite(roomId);
  };

  const handleCall = (room) => {
    // TODO: Implement call functionality
    console.log('Calling room:', room._id);
  };

  const isFavorite = (room) => {
    const roomId = room._id || room.id;
    return favoriteRoomIds.includes(roomId);
  };

  const renderRoomCard = ({ item }) => (
    <RoomListCard
      room={item}
      onPress={handleRoomPress}
      onToggleFavorite={handleToggleFavorite}
      onCall={handleCall}
      isFavorite={isFavorite(item)}
    />
  );

  const renderHeader = () => (
    <View>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm phòng trọ..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Price Filter Chips */}
      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {priceFilters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterChip,
                (selectedPriceFilter?.id === filter.id || (!selectedPriceFilter && filter.id === 'all')) &&
                  styles.filterChipActive,
              ]}
              onPress={() => handlePriceFilterChange(filter)}
            >
              <Ionicons
                name="cash-outline"
                size={16}
                color={
                  selectedPriceFilter?.id === filter.id || (!selectedPriceFilter && filter.id === 'all')
                    ? '#fff'
                    : '#666'
                }
              />
              <Text
                style={[
                  styles.filterChipText,
                  (selectedPriceFilter?.id === filter.id || (!selectedPriceFilter && filter.id === 'all')) &&
                    styles.filterChipTextActive,
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
                (selectedAreaFilter?.id === filter.id || (!selectedAreaFilter && filter.id === 'all')) &&
                  styles.filterChipActive,
              ]}
              onPress={() => handleAreaFilterChange(filter)}
            >
              <Ionicons
                name="resize-outline"
                size={16}
                color={
                  selectedAreaFilter?.id === filter.id || (!selectedAreaFilter && filter.id === 'all')
                    ? '#fff'
                    : '#666'
                }
              />
              <Text
                style={[
                  styles.filterChipText,
                  (selectedAreaFilter?.id === filter.id || (!selectedAreaFilter && filter.id === 'all')) &&
                    styles.filterChipTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Sort & Result Count */}
      <View style={styles.resultHeader}>
        <Text style={styles.resultCount}>
          {rooms.length} kết quả
        </Text>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setShowSortModal(true)}
        >
          <Ionicons name="swap-vertical-outline" size={18} color="#2196F3" />
          <Text style={styles.sortButtonText}>
            {sortOptions.find(opt => opt.id === sortOption)?.label}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="search-outline" size={60} color="#ccc" />
      <Text style={styles.emptyText}>Không tìm thấy kết quả</Text>
      <Text style={styles.emptySubtext}>
        Hãy thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc
      </Text>
    </View>
  );

  if (loading && rooms.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Đang tìm kiếm...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={rooms}
        renderItem={renderRoomCard}
        keyExtractor={(item, index) => item._id || item.id || `room-${index}`}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2196F3']} />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Sort Modal */}
      <Modal
        visible={showSortModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSortModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSortModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sắp xếp theo</Text>
              <TouchableOpacity onPress={() => setShowSortModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.sortOption}
                onPress={() => handleSortChange(option)}
              >
                <Text
                  style={[
                    styles.sortOptionText,
                    sortOption === option.id && styles.sortOptionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
                {sortOption === option.id && (
                  <Ionicons name="checkmark" size={24} color="#2196F3" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginTop: 15,
    marginBottom: 10,
    paddingHorizontal: 12,
    height: 45,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  filterSection: {
    paddingVertical: 8,
    paddingLeft: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resultCount: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  sortButtonText: {
    fontSize: 13,
    color: '#2196F3',
    marginLeft: 4,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sortOptionText: {
    fontSize: 15,
    color: '#333',
  },
  sortOptionTextActive: {
    color: '#2196F3',
    fontWeight: '600',
  },
});

export default SearchResultsScreen;
