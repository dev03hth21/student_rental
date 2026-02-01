import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, Image } from 'react-native';
import MapView, { Marker, Callout, UrlTile } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const MAPTILER_KEY = 'YOUR_MAPTILER_KEY'; // Thay bằng key thật
const BACKEND_URL = 'http://localhost:5000/api';
const INIT_REGION = {
  latitude: 10.7769,
  longitude: 106.7009,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function MapViewScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [rooms, setRooms] = useState([]);
  const [region, setRegion] = useState(INIT_REGION);
  const mapRef = useRef();

  useEffect(() => {
    fetchRooms(region);
  }, [region]);

  const fetchRooms = async (reg) => {
    try {
      const res = await axios.get(`${BACKEND_URL}/rooms?lat=${reg.latitude}&lng=${reg.longitude}&radius=5`);
      setRooms(res.data.data || []);
      if (mapRef.current && rooms.length > 0) {
        // Tự động zoom theo danh sách phòng
        const coords = rooms.map(r => ({ latitude: r.lat, longitude: r.lng }));
        mapRef.current.fitToCoordinates(coords, { edgePadding: { top: 50, right: 50, bottom: 50, left: 50 }, animated: true });
      }
    } catch (e) {}
  };

  const handleMarkerPress = (room) => {
    // Có thể dùng cho analytics hoặc highlight marker
  };

  const handlePopupPress = (room) => {
    navigation.navigate('RoomDetail', { roomId: room._id });
  };

  const handleListToggle = () => {
    navigation.navigate('SearchResultScreen');
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Thanh tìm kiếm + filter */}
      <View style={styles.topBar}>
        <TextInput
          style={styles.searchBox}
          placeholder="Tìm kiếm vị trí, phòng..."
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={() => {/* Có thể tích hợp filter */}}
        />
      </View>
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation
      >
        <UrlTile urlTemplate={`https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`} />
        {rooms.map(room => (
          <Marker
            key={room._id}
            coordinate={{ latitude: room.lat, longitude: room.lng }}
            pinColor={room.isVIP ? '#e67e22' : '#0984e3'}
            onPress={() => handleMarkerPress(room)}
          >
            <View style={styles.markerLabel}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>{room.price.toLocaleString()}đ/tháng</Text>
            </View>
            <Callout tooltip onPress={() => handlePopupPress(room)}>
              <View style={styles.popup}>
                <Image source={{ uri: room.image || 'https://via.placeholder.com/80' }} style={styles.popupImg} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.popupPrice}>{room.price.toLocaleString()}đ/tháng</Text>
                  <Text style={styles.popupTitle} numberOfLines={1}>{room.title}</Text>
                </View>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
      {/* Button nổi chuyển List/Map */}
      <TouchableOpacity style={styles.fab} onPress={handleListToggle}>
        <Ionicons name="list" size={28} color="#fff" />
        <Text style={{ color: '#fff', marginLeft: 6 }}>Danh sách</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: { position: 'absolute', top: 10, left: 10, right: 10, zIndex: 2, backgroundColor: '#fff', borderRadius: 10, padding: 8, elevation: 2 },
  searchBox: { backgroundColor: '#f1f2f6', borderRadius: 8, padding: 10, fontSize: 16 },
  markerLabel: { backgroundColor: '#636e72', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  popup: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, padding: 8, minWidth: 180, elevation: 3 },
  popupImg: { width: 60, height: 60, borderRadius: 8, marginRight: 8 },
  popupPrice: { fontWeight: 'bold', color: '#e67e22', fontSize: 15 },
  popupTitle: { fontSize: 14, color: '#2d3436', marginTop: 2 },
  fab: { position: 'absolute', bottom: 30, right: 20, flexDirection: 'row', alignItems: 'center', backgroundColor: '#0984e3', borderRadius: 24, paddingHorizontal: 18, paddingVertical: 10, elevation: 4 },
});
