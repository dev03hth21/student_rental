import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';

const RoomCard = ({ room, onPress, onToggleFavorite, onCall }) => (
  <TouchableOpacity style={styles.card} onPress={() => onPress(room)}>
    <Image source={{ uri: room.image || 'https://via.placeholder.com/150' }} style={styles.image} />
    <View style={styles.info}>
      <Text style={styles.title} numberOfLines={2}>{room.title}</Text>
      <Text style={styles.price}>{room.price.toLocaleString()}đ/tháng</Text>
      <Text style={styles.area}>{room.area}m² • {room.address}</Text>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => onToggleFavorite(room)}>
          <Ionicons name={room.isFavorite ? 'heart' : 'heart-outline'} size={22} color="#e74c3c" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onCall(room)} style={{ marginLeft: 16 }}>
          <FontAwesome name="phone" size={20} color="#0984e3" />
        </TouchableOpacity>
      </View>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 10, marginVertical: 6, elevation: 2, overflow: 'hidden' },
  image: { width: 100, height: 100, borderTopLeftRadius: 10, borderBottomLeftRadius: 10 },
  info: { flex: 1, padding: 10, justifyContent: 'center' },
  title: { fontWeight: 'bold', fontSize: 15, color: '#2d3436' },
  price: { color: '#e67e22', fontWeight: 'bold', marginTop: 2 },
  area: { color: '#636e72', fontSize: 13, marginTop: 2 },
  actions: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
});
export default RoomCard;
