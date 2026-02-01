import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';

export default function RecommendList({ rooms, onPress }) {
  return (
    <View style={{ marginVertical: 10 }}>
      <Text style={styles.title}>Phòng đề xuất</Text>
      <FlatList
        horizontal
        data={rooms}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => onPress(item)}>
            <Image source={{ uri: item.images[0] }} style={styles.image} />
            <Text style={styles.price}>{item.price.toLocaleString()}đ/tháng</Text>
            <Text style={styles.roomTitle} numberOfLines={1}>{item.title}</Text>
          </TouchableOpacity>
        )}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontWeight: 'bold', fontSize: 16, marginBottom: 6 },
  card: { width: 120, marginRight: 10, backgroundColor: '#fff', borderRadius: 10, elevation: 2, padding: 6 },
  image: { width: '100%', height: 60, borderRadius: 8 },
  price: { color: '#e74c3c', fontWeight: 'bold', fontSize: 13, marginTop: 2 },
  roomTitle: { fontSize: 13, color: '#2d3436', marginTop: 2 },
});
