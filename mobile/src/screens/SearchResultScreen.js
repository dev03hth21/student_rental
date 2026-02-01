import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RoomCard from '../components/RoomCardSearch';
import { searchRooms, addFavorite, removeFavorite } from '../api/room';

const PRICE_FILTERS = [
  { label: 'Dưới 3tr', min: 0, max: 3000000 },
  { label: '3-5tr', min: 3000000, max: 5000000 },
  { label: 'Trên 5tr', min: 5000000, max: 100000000 },
];
const AREA_FILTERS = [
  { label: '<20m²', min: 0, max: 20 },
  { label: '20-30m²', min: 20, max: 30 },
  { label: '>30m²', min: 30, max: 1000 },
];
const SORT_OPTIONS = [
  { label: 'Giá tăng', value: 'price_asc' },
  { label: 'Giá giảm', value: 'price_desc' },
  { label: 'Mới nhất', value: 'newest' },
];

const SearchResultScreen = ({ navigation, route }) => {
  const [keyword, setKeyword] = useState(route.params?.keyword || '');
  const [rooms, setRooms] = useState([]);
  const [priceFilter, setPriceFilter] = useState(null);
  const [areaFilter, setAreaFilter] = useState(null);
  const [sort, setSort] = useState('newest');
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchRooms(); }, [keyword, priceFilter, areaFilter, sort]);

  const fetchRooms = async () => {
    setLoading(true);
    const params = { keyword, sort };
    if (priceFilter) { params.minPrice = priceFilter.min; params.maxPrice = priceFilter.max; }
    if (areaFilter) { params.minArea = areaFilter.min; params.maxArea = areaFilter.max; }
    try {
      const data = await searchRooms(params);
      setRooms(data);
    } catch (e) {}
    setLoading(false);
  };

  const handleClear = () => setKeyword('');
  const handleRoomPress = (room) => navigation.navigate('RoomDetail', { roomId: room._id });
  const handleToggleFavorite = async (room) => {
    if (room.isFavorite) {
      await removeFavorite(room._id);
    } else {
      await addFavorite(room._id);
    }
    fetchRooms();
  };
  const handleCall = (room) => {
    if (room.ownerPhone) {
      Linking.openURL(`tel:${room.ownerPhone}`);
    }
  };

  return (
    <View style={styles.container}>
      {/* Ô tìm kiếm */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchBox}
          placeholder="Tìm kiếm phòng..."
          value={keyword}
          onChangeText={setKeyword}
          onSubmitEditing={fetchRooms}
        />
        {keyword.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
            <Ionicons name="close-circle" size={22} color="#636e72" />
          </TouchableOpacity>
        )}
      </View>

      {/* Bộ lọc giá */}
      <View style={styles.filterRow}>
        {PRICE_FILTERS.map(f => (
          <TouchableOpacity
            key={f.label}
            style={[styles.chip, priceFilter?.label === f.label && styles.chipActive]}
            onPress={() => setPriceFilter(priceFilter?.label === f.label ? null : f)}
          >
            <Text style={priceFilter?.label === f.label ? styles.chipTextActive : styles.chipText}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* Bộ lọc diện tích */}
      <View style={styles.filterRow}>
        {AREA_FILTERS.map(f => (
          <TouchableOpacity
            key={f.label}
            style={[styles.chip, areaFilter?.label === f.label && styles.chipActive]}
            onPress={() => setAreaFilter(areaFilter?.label === f.label ? null : f)}
          >
            <Text style={areaFilter?.label === f.label ? styles.chipTextActive : styles.chipText}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* Sắp xếp */}
      <View style={styles.sortRow}>
        {SORT_OPTIONS.map(opt => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.sortBtn, sort === opt.value && styles.sortBtnActive]}
            onPress={() => setSort(opt.value)}
          >
            <Text style={sort === opt.value ? styles.sortTextActive : styles.sortText}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Danh sách phòng */}
      <FlatList
        data={rooms}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <RoomCard
            room={item}
            onPress={handleRoomPress}
            onToggleFavorite={handleToggleFavorite}
            onCall={handleCall}
          />
        )}
        refreshing={loading}
        onRefresh={fetchRooms}
        contentContainerStyle={{ paddingBottom: 80 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa', padding: 12 },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  searchBox: { flex: 1, backgroundColor: '#fff', borderRadius: 8, padding: 12, fontSize: 16, borderWidth: 1, borderColor: '#dfe4ea' },
  clearBtn: { marginLeft: -32, zIndex: 1 },
  filterRow: { flexDirection: 'row', marginBottom: 6 },
  chip: { backgroundColor: '#f1f2f6', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 6, marginRight: 8 },
  chipActive: { backgroundColor: '#0984e3' },
  chipText: { color: '#636e72', fontWeight: '500' },
  chipTextActive: { color: '#fff', fontWeight: 'bold' },
  sortRow: { flexDirection: 'row', marginBottom: 10 },
  sortBtn: { backgroundColor: '#dfe6e9', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 5, marginRight: 8 },
  sortBtnActive: { backgroundColor: '#0984e3' },
  sortText: { color: '#636e72' },
  sortTextActive: { color: '#fff', fontWeight: 'bold' },
});

export default SearchResultScreen;
