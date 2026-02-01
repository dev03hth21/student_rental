import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Linking } from 'react-native';
import FavoriteCard from '../components/FavoriteCard';
import axios from 'axios';

// Mock data
const MOCK_FAVORITES = [
  {
    _id: '1',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
    price: 3500000,
    title: 'Căn hộ Vinhomes 2 phòng ngủ',
    address: 'Vinhomes Central Park, Q. Bình Thạnh',
    createdAt: '2025-12-01',
    ownerPhone: '0909123456',
  },
  {
    _id: '2',
    image: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd',
    price: 4200000,
    title: 'Phòng Q.3, gần ĐH Kinh tế',
    address: 'Q.3, TP.HCM',
    createdAt: '2025-12-03',
    ownerPhone: '0909888777',
  },
  // ... thêm phòng mẫu
];

const BACKEND_URL = 'http://localhost:5000/api';

export default function FavoriteScreen() {
  const [favorites, setFavorites] = useState(MOCK_FAVORITES);

  useEffect(() => {
    // const fetchFavorites = async () => {
    //   const res = await axios.get(`${BACKEND_URL}/favorites/me`);
    //   setFavorites(res.data.data);
    // };
    // fetchFavorites();
  }, []);

  const handleCall = (room) => {
    if (room.ownerPhone) {
      Linking.openURL(`tel:${room.ownerPhone}`);
    }
  };

  const handleRemove = async (room) => {
    // await axios.delete(`${BACKEND_URL}/favorites/${room._id}`);
    setFavorites(favorites.filter(f => f._id !== room._id));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tin đã lưu</Text>
      <FlatList
        data={favorites}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <FavoriteCard room={item} onCall={handleCall} onRemove={handleRemove} />
        )}
        contentContainerStyle={{ paddingBottom: 80 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa', padding: 12 },
  title: { fontSize: 20, fontWeight: 'bold', marginVertical: 12, color: '#2d3436', textAlign: 'center' },
});
