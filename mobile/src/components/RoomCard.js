import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 32 - 12) / 2; // adjust for horizontal padding and gap

/**
 * RoomCard Component - Hiển thị card phòng dạng 2 cột
 */
const RoomCard = ({ room, onPress, onToggleFavorite, isFavorite }) => {
  // Format giá VND
  const formatPrice = (price) => {
    if (!price) return 'Liên hệ';
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)} triệu`;
    }
    return `${(price / 1000).toFixed(0)}K`;
  };

  // Lấy ảnh đầu tiên
  const imageCandidates = Array.isArray(room.images) ? room.images : [];
  const primaryImage = imageCandidates.find(Boolean);
  const imageUrl = primaryImage || room.thumbnail || room.image || 'https://via.placeholder.com/200x150?text=No+Image';

  const sourceLabel = (() => {
    if (!imageUrl) return 'No image';
    if (imageUrl.includes('res.cloudinary.com')) return 'Cloudinary';
    if (imageUrl.includes('/uploads') || imageUrl.includes('localhost:5000/uploads')) return 'Local';
    if (imageUrl.includes('placeholder.com')) return 'No image';
    return 'Remote';
  })();

  const isPlaceholder = sourceLabel === 'No image';

  // Địa chỉ rút gọn
  const getShortAddress = (address) => {
    if (!address) return room.district || 'Chưa rõ';
    const parts = address.split(',');
    if (parts.length >= 2) {
      return parts[parts.length - 2].trim();
    }
    return address.length > 25 ? address.substring(0, 25) + '...' : address;
  };

  const handleFavorite = (e) => {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    onToggleFavorite && onToggleFavorite(room);
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress && onPress(room)}
      activeOpacity={0.7}
    >
      {/* Ảnh */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />

        {/* Badge nguồn ảnh */}
        <View style={[styles.sourceBadge, isPlaceholder && styles.sourceBadgeMuted]}>
          <Text style={styles.sourceBadgeText}>{sourceLabel}</Text>
        </View>
        
        {/* Nút yêu thích */}
        <TouchableOpacity style={styles.heartButton} onPress={handleFavorite} activeOpacity={0.7}>
          <Ionicons
            name={isFavorite || room.isFavorite ? 'heart' : 'heart-outline'}
            size={20}
            color={isFavorite || room.isFavorite ? '#FF3B30' : '#fff'}
          />
        </TouchableOpacity>

        {/* Badge loại */}
        {room.type && (
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{room.type}</Text>
          </View>
        )}
      </View>

      {/* Nội dung */}
      <View style={styles.content}>
        <Text style={styles.price} numberOfLines={1}>
          {formatPrice(room.price)}/tháng
        </Text>
        <Text style={styles.title} numberOfLines={2}>
          {room.title || 'Phòng trọ'}
        </Text>
        <View style={styles.row}>
          <Ionicons name="resize-outline" size={12} color="#666" />
          <Text style={styles.info}>{room.area || 0}m²</Text>
        </View>
        <View style={styles.row}>
          <Ionicons name="location-outline" size={12} color="#666" />
          <Text style={styles.info} numberOfLines={1}>
            {getShortAddress(room.address)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: 130,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  heartButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  typeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  sourceBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  sourceBadgeMuted: {
    backgroundColor: 'rgba(120,120,120,0.7)',
  },
  sourceBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  content: {
    padding: 10,
  },
  price: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 3,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
    lineHeight: 17,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  info: {
    fontSize: 11,
    color: '#666',
    marginLeft: 3,
    flex: 1,
  },
});

export default RoomCard;
