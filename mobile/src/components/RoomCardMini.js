import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 36) / 2; // 2 columns with padding

/**
 * RoomCardMini - Mini room card for grid layout
 * 
 * Props:
 * - room: { _id, title, price, area, address, images }
 * - onPress: Callback function
 */
export default function RoomCardMini({ room, onPress }) {
  const getImageUrl = () => {
    if (room.image) return room.image;
    if (room.images && room.images.length > 0) return room.images[0];
    return 'https://via.placeholder.com/200x120?text=No+Image';
  };

  const getDistrict = () => {
    if (room.district) return room.district;
    
    // Extract district from address
    if (room.address) {
      const districtMatch = room.address.match(/Q\.\s*\d+|Quận\s*\d+|Huyện\s*[^\,]+/i);
      return districtMatch ? districtMatch[0] : '';
    }
    
    return '';
  };

  const formatPrice = (price) => {
    if (!price) return '0đ';
    if (price >= 1000000) {
      return (price / 1000000).toFixed(1).replace('.0', '') + ' triệu';
    }
    return price.toLocaleString('vi-VN') + 'đ';
  };

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(room)}>
      <Image 
        source={{ uri: getImageUrl() }} 
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {room.title || 'Phòng trọ'}
        </Text>
        <Text style={styles.price}>
          {formatPrice(room.price)}/tháng
        </Text>
        <Text style={styles.meta}>
          {room.area || 0}m²
          {getDistrict() ? ` • ${getDistrict()}` : ''}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    margin: 6,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 100,
    backgroundColor: '#f0f0f0',
  },
  info: {
    padding: 10,
  },
  title: {
    fontWeight: '600',
    fontSize: 14,
    color: '#2d3436',
    lineHeight: 18,
    marginBottom: 4,
  },
  price: {
    color: '#FF3B30',
    fontWeight: '700',
    fontSize: 15,
    marginTop: 4,
    marginBottom: 2,
  },
  meta: {
    color: '#636e72',
    fontSize: 12,
    marginTop: 2,
  },
});
