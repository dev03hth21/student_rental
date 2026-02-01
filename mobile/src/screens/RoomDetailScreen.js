import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import RoomCarousel from '../components/RoomCarousel';
import OwnerCard from '../components/OwnerCard';
import RecommendList from '../components/RecommendList';
import axios from 'axios';

// Mock data
const MOCK_ROOM = {
  _id: '1',
  images: [
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
    'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd',
    'https://images.unsplash.com/photo-1465101046530-73398c7f28ca',
  ],
  price: 3500000,
  area: 25,
  title: 'Căn hộ Vinhomes 2 phòng ngủ, view đẹp',
  address: 'Vinhomes Central Park, Q. Bình Thạnh, TP.HCM',
  description: 'Căn hộ đầy đủ nội thất, gần trung tâm, an ninh 24/7, tiện ích cao cấp.',
  isFavorite: false,
  owner: { name: 'Nguyễn Văn A', yearsActive: 5, phone: '0909123456', zalo: 'https://zalo.me/0909123456' },
};
const MOCK_RECOMMEND = [
  { _id: '2', images: [MOCK_ROOM.images[1]], price: 4200000, title: 'Căn hộ Q.3', },
  { _id: '3', images: [MOCK_ROOM.images[2]], price: 2800000, title: 'Phòng Q.5', },
];

const BACKEND_URL = 'http://localhost:5000/api';

export default function RoomDetailScreen({ route, navigation }) {
  const [room, setRoom] = useState(MOCK_ROOM);
  const [recommend, setRecommend] = useState(MOCK_RECOMMEND);

  useEffect(() => {
    // const fetchRoom = async () => {
    //   const res = await axios.get(`${BACKEND_URL}/rooms/${route.params.roomId}`);
    //   setRoom(res.data.data);
    //   // Ghi lại viewlog
    //   await axios.post(`${BACKEND_URL}/viewlogs`, { roomId: route.params.roomId });
    //   // Lấy phòng đề xuất
    //   const rec = await axios.get(`${BACKEND_URL}/rooms/recommend`);
    //   setRecommend(rec.data.data);
    // };
    // fetchRoom();
  }, [route.params?.roomId]);

  const handleFavorite = async () => {
    if (room.isFavorite) {
      // await axios.delete(`${BACKEND_URL}/favorites/${room._id}`);
    } else {
      // await axios.post(`${BACKEND_URL}/favorites`, { roomId: room._id });
    }
    setRoom({ ...room, isFavorite: !room.isFavorite });
  };

  const handleCall = async () => {
    // await axios.post(`${BACKEND_URL}/calllogs`, { roomId: room._id });
    Linking.openURL(`tel:${room.owner.phone}`);
  };

  const handleZalo = () => {
    Linking.openURL(room.owner.zalo);
  };

  return (
    <ScrollView style={styles.container}>
      <RoomCarousel images={room.images} />
      <View style={styles.section}>
        <Text style={styles.price}>{room.price.toLocaleString()}đ/tháng</Text>
        <Text style={styles.area}>{room.area}m²</Text>
        <Text style={styles.title}>{room.title}</Text>
        <View style={styles.addressRow}>
          <Ionicons name='location' size={18} color='#636e72' />
          <Text style={styles.address}>{room.address}</Text>
        </View>
        <TouchableOpacity style={styles.mapBtn} onPress={() => navigation.navigate('MapViewScreen')}>
          <Ionicons name='map' size={18} color='#0984e3' />
          <Text style={styles.mapBtnText}>Xem trên bản đồ</Text>
        </TouchableOpacity>
        <Text style={styles.desc}>{room.description}</Text>
      </View>
      <OwnerCard owner={room.owner} onViewOtherRooms={() => navigation.navigate('SearchResultScreen', { owner: room.owner.name })} />
      <RecommendList rooms={recommend} onPress={r => navigation.push('RoomDetailScreen', { roomId: r._id })} />
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={handleZalo}>
          <FontAwesome name='wechat' size={22} color='#0984e3' />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={handleFavorite}>
          <Ionicons name={room.isFavorite ? 'heart' : 'heart-outline'} size={24} color='#e74c3c' />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#e74c3c' }]} onPress={handleCall}>
          <Ionicons name='call' size={22} color='#fff' />
          <Text style={{ color: '#fff', marginLeft: 6 }}>Gọi điện</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa' },
  section: { padding: 16 },
  price: { color: '#e74c3c', fontWeight: 'bold', fontSize: 22 },
  area: { color: '#e74c3c', fontWeight: 'bold', fontSize: 16, marginBottom: 6 },
  title: { fontWeight: 'bold', fontSize: 18, marginBottom: 4, color: '#2d3436' },
  addressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  address: { marginLeft: 6, color: '#636e72', fontSize: 15 },
  mapBtn: { flexDirection: 'row', alignItems: 'center', marginVertical: 6 },
  mapBtnText: { color: '#0984e3', marginLeft: 4, fontWeight: 'bold' },
  desc: { marginTop: 8, color: '#636e72', fontSize: 15 },
  actionRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: 16 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginHorizontal: 8, elevation: 2 },
});
