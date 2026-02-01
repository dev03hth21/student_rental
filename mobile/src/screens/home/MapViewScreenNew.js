import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import MapView, { Marker, Callout, UrlTile, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { getPublicRooms } from '../api/rooms';
import { useAppContext } from '../context/AppContext';

const { width, height } = Dimensions.get('window');

// MapTiler API Key (replace with your actual key)
const MAPTILER_KEY = 'get_your_own_key_from_maptiler.com';

// Vị trí mặc định: TP.HCM
const DEFAULT_REGION = {
  latitude: 10.7769,
  longitude: 106.7009,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

/**
 * MapViewScreen - Hiển thị phòng trên bản đồ
 * 
 * Features:
 * - MapTiler custom tiles
 * - Custom markers với giá
 * - VIP markers (màu khác)
 * - Popup khi click marker
 * - Search bar
 * - Filter chips
 * - Toggle List/Map view
 * - Auto zoom to fit all markers
 */
const MapViewScreen = ({ navigation, route }) => {
  const { state, actions } = useAppContext();
  const { favoriteRoomIds = [] } = state;
  
  const mapRef = useRef(null);
  const [region, setRegion] = useState(DEFAULT_REGION);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);
  
  // Filters từ route params
  const initialPriceFilter = route.params?.priceFilter || null;
  const initialAreaFilter = route.params?.areaFilter || null;
  
  const [selectedPriceFilter, setSelectedPriceFilter] = useState(initialPriceFilter);
  const [selectedAreaFilter, setSelectedAreaFilter] = useState(initialAreaFilter);

  // Price filters
  const priceFilters = [
    { id: 'all', label: 'Giá', min: null, max: null },
    { id: 'under2', label: '< 2tr', min: null, max: 2000000 },
    { id: '2to3', label: '2-3tr', min: 2000000, max: 3000000 },
    { id: '3to5', label: '3-5tr', min: 3000000, max: 5000000 },
    { id: 'over5', label: '> 5tr', min: 5000000, max: null },
  ];

  // Area filters
  const areaFilters = [
    { id: 'all', label: 'Diện tích', min: null, max: null },
    { id: 'under20', label: '< 20m²', min: null, max: 20 },
    { id: '20to30', label: '20-30m²', min: 20, max: 30 },
    { id: 'over30', label: '> 30m²', min: 30, max: null },
  ];

  useEffect(() => {
    loadRooms();
  }, [selectedPriceFilter, selectedAreaFilter]);

  const loadRooms = async () => {
    setLoading(true);
    try {
      const params = {
        minPrice: selectedPriceFilter?.min || undefined,
        maxPrice: selectedPriceFilter?.max || undefined,
        minArea: selectedAreaFilter?.min || undefined,
        maxArea: selectedAreaFilter?.max || undefined,
        keyword: searchQuery || undefined,
        limit: 200, // Load nhiều phòng cho map
      };

      const { rooms: fetchedRooms } = await getPublicRooms(params);
      
      // Filter rooms có location
      const roomsWithLocation = (fetchedRooms || []).filter(
        room => room.location?.lat && room.location?.lng
      );
      
      setRooms(roomsWithLocation);

      // Auto fit map to markers
      if (roomsWithLocation.length > 0 && mapRef.current) {
        const coordinates = roomsWithLocation.map(room => ({
          latitude: room.location.lat,
          longitude: room.location.lng,
        }));
        
        setTimeout(() => {
          mapRef.current?.fitToCoordinates(coordinates, {
            edgePadding: { top: 100, right: 50, bottom: 200, left: 50 },
            animated: true,
          });
        }, 500);
      }
    } catch (error) {
      console.error('Error loading rooms for map:', error);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadRooms();
  };

  const handleMarkerPress = (room) => {
    setSelectedRoom(room);
    
    // Center map on marker
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: room.location.lat,
        longitude: room.location.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 500);
    }
  };

  const handlePopupPress = (room) => {
    navigation.navigate('RoomDetail', { roomId: room._id || room.id });
  };

  const handleToggleView = () => {
    navigation.navigate('SearchResults', {
      priceFilter: selectedPriceFilter,
      areaFilter: selectedAreaFilter,
      query: searchQuery,
    });
  };

  const formatPrice = (price) => {
    if (!price) return 'Liên hệ';
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}tr`;
    }
    return `${(price / 1000).toFixed(0)}K`;
  };

  // Custom Marker Component
  const renderMarker = (room) => {
    const isVip = room.isVip || false;
    const isFavorite = favoriteRoomIds.includes(room._id || room.id);

    return (
      <Marker
        key={room._id || room.id}
        coordinate={{
          latitude: room.location.lat,
          longitude: room.location.lng,
        }}
        onPress={() => handleMarkerPress(room)}
      >
        {/* Custom Marker View */}
        <View style={[styles.markerContainer, isVip && styles.markerVip]}>
          <Text style={styles.markerText}>{formatPrice(room.price)}</Text>
          {isVip && <Ionicons name="star" size={10} color="#FFD700" style={styles.markerStar} />}
        </View>

        {/* Callout Popup */}
        <Callout tooltip onPress={() => handlePopupPress(room)}>
          <View style={styles.calloutContainer}>
            <Image
              source={{ uri: room.images?.[0] || 'https://via.placeholder.com/80x60' }}
              style={styles.calloutImage}
              resizeMode="cover"
            />
            <View style={styles.calloutContent}>
              <Text style={styles.calloutPrice}>{formatPrice(room.price)}/tháng</Text>
              <Text style={styles.calloutTitle} numberOfLines={2}>
                {room.title || 'Phòng trọ'}
              </Text>
              <View style={styles.calloutInfo}>
                <Ionicons name="resize-outline" size={12} color="#666" />
                <Text style={styles.calloutInfoText}>{room.area || 0}m²</Text>
              </View>
            </View>
            {isFavorite && (
              <Ionicons name="heart" size={16} color="#FF3B30" style={styles.calloutHeart} />
            )}
          </View>
        </Callout>
      </Marker>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header with Search */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm vị trí..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchQuery(''); loadRooms(); }}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}
        >
          {priceFilters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterChip,
                selectedPriceFilter?.id === filter.id && styles.filterChipActive,
              ]}
              onPress={() => {
                setSelectedPriceFilter(filter.id === 'all' ? null : filter);
              }}
            >
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
          
          <View style={styles.filterDivider} />
          
          {areaFilters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterChip,
                selectedAreaFilter?.id === filter.id && styles.filterChipActive,
              ]}
              onPress={() => {
                setSelectedAreaFilter(filter.id === 'all' ? null : filter);
              }}
            >
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

      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        provider={PROVIDER_GOOGLE}
        showsUserLocation
        showsMyLocationButton={false}
        onRegionChangeComplete={setRegion}
      >
        {/* MapTiler Tiles */}
        <UrlTile
          urlTemplate={`https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`}
          maximumZ={19}
          flipY={false}
        />

        {/* Room Markers */}
        {rooms.map(renderMarker)}
      </MapView>

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2196F3" />
        </View>
      )}

      {/* Room Count Badge */}
      <View style={styles.countBadge}>
        <Ionicons name="home" size={16} color="#fff" />
        <Text style={styles.countText}>{rooms.length} phòng</Text>
      </View>

      {/* Floating Controls: locate right, list center-bottom near nav */}
      <TouchableOpacity
        style={styles.locationButton}
        onPress={() => mapRef.current?.animateToRegion(DEFAULT_REGION, 500)}
      >
        <Ionicons name="locate" size={24} color="#2196F3" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.toggleButton} onPress={handleToggleView}>
        <Ionicons name="list" size={20} color="#fff" />
        <Text style={styles.toggleText}>Danh sách</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    marginHorizontal: 15,
    paddingHorizontal: 12,
    height: 45,
    borderRadius: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  filterScroll: {
    marginTop: 10,
  },
  filterContent: {
    paddingHorizontal: 15,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 16,
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
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  filterDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#ddd',
    marginHorizontal: 8,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  markerVip: {
    backgroundColor: '#FF9800',
  },
  markerText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  markerStar: {
    marginLeft: 4,
  },
  calloutContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    width: 250,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  calloutImage: {
    width: 80,
    height: 60,
    borderRadius: 8,
  },
  calloutContent: {
    flex: 1,
    marginLeft: 10,
  },
  calloutPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 4,
  },
  calloutTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    lineHeight: 16,
  },
  calloutInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calloutInfoText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 3,
  },
  calloutHeart: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  loadingOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 20,
    borderRadius: 10,
  },
  countBadge: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 160 : 150,
    right: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  countText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  locationButton: {
    position: 'absolute',
    bottom: 80,
    right: 15,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  toggleButton: {
    position: 'absolute',
    bottom: 24,
    left: '50%',
    transform: [{ translateX: -70 }],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  toggleText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
});

export default MapViewScreen;
