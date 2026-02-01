// screens/HomeRecommendScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import RoomCard from '../components/RoomCard';
import { getRecommendedRooms, getViewedRooms, getFilteredRooms } from '../api/room';
// import { mockRooms, mockViewedRooms } from '../constants/mockData'; // Dùng khi chưa có backend

const FILTERS = [
  { key: 'price', label: 'Giá' },
  { key: 'area', label: 'Diện tích' },
  { key: 'utilities', label: 'Tiện ích' },
];

const HomeRecommendScreen = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [viewed, setViewed] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  // Lấy dữ liệu khi vào màn hình
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // const rec = mockRooms; const viewed = mockViewedRooms; const filtered = mockRooms;
      const rec = await getRecommendedRooms();
      const viewed = await getViewedRooms();
      const filtered = await getFilteredRooms({});
      setRecommended(rec);
      setViewed(viewed);
      setRooms(filtered);
    } catch (e) {
      // Xử lý lỗi
    }
    setLoading(false);
  };

  const handleRoomPress = (room) => {
    navigation.navigate('RoomDetail', { roomId: room._id });
  };

  const handleToggleFavorite = (room) => {
    // Gọi API lưu/bỏ lưu, cập nhật state
  };

  const renderFilterChip = (filter) => (
    <TouchableOpacity
      key={filter.key}
      style={[styles.chip, activeFilter === filter.key && styles.chipActive]}
      onPress={() => setActiveFilter(filter.key)}
    >
      <Text style={activeFilter === filter.key ? styles.chipTextActive : styles.chipText}>
        {filter.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Ô tìm kiếm */}
      <TextInput
        style={styles.searchBox}
        placeholder="Chung cư Vinhomes 2 ngủ…"
        value={search}
        onChangeText={setSearch}
        onSubmitEditing={() => {/* Gọi API tìm kiếm */}}
      />

      {/* Bộ lọc dạng chip */}
      <View style={styles.filterRow}>
        {FILTERS.map(renderFilterChip)}
      </View>

      {/* Section: Bất động sản dành cho bạn */}
      <Text style={styles.sectionTitle}>Bất động sản dành cho bạn</Text>
      <FlatList
        data={recommended}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <RoomCard room={item} onPress={handleRoomPress} onToggleFavorite={handleToggleFavorite} />
        )}
        style={{ marginBottom: 10 }}
      />

      {/* Section: Tin đã xem */}
      <Text style={styles.sectionTitle}>Tin đã xem</Text>
      <FlatList
        data={viewed}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <RoomCard room={item} onPress={handleRoomPress} onToggleFavorite={handleToggleFavorite} />
        )}
        style={{ marginBottom: 10 }}
      />

      {/* Danh sách phòng dạng 2 cột */}
      <Text style={styles.sectionTitle}>Danh sách phòng</Text>
      <FlatList
        data={rooms}
        numColumns={2}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <RoomCard room={item} onPress={handleRoomPress} onToggleFavorite={handleToggleFavorite} />
        )}
        contentContainerStyle={{ paddingBottom: 80 }}
        scrollEnabled={false}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa', padding: 12 },
  searchBox: {
    backgroundColor: '#fff', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 10,
    borderWidth: 1, borderColor: '#dfe4ea',
  },
  filterRow: { flexDirection: 'row', marginBottom: 10 },
  chip: {
    backgroundColor: '#f1f2f6', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 6, marginRight: 8,
  },
  chipActive: { backgroundColor: '#0984e3' },
  chipText: { color: '#636e72', fontWeight: '500' },
  chipTextActive: { color: '#fff', fontWeight: 'bold' },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', marginVertical: 8, color: '#2d3436' },
});

export default HomeRecommendScreen;
