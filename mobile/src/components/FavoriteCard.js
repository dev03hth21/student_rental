import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 12 * 2 - 12) / 2; // padding 12 + gap 12 between columns

/**
 * FavoriteCard - Card for favorite room in list view
 * 
 * Props:
 * - room: Room object
 * - onPress: Navigate to detail
 * - onCall: Call owner
 * - onRemove: Remove from favorites
 */
export default function FavoriteCard({ room, onPress, onCall, onRemove }) {
  const formatPrice = (price) => {
    if (!price) return '0đ';
    if (price >= 1000000) {
      return (price / 1000000).toFixed(1).replace('.0', '') + ' triệu';
    }
    return price.toLocaleString('vi-VN') + 'đ';
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Vừa xong';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} ngày trước`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} tháng trước`;
    return `${Math.floor(months / 12)} năm trước`;
  };

  const getImageUrl = () => {
    if (room.image) return room.image;
    if (room.images && room.images.length > 0) return room.images[0];
    return 'https://via.placeholder.com/120x120?text=No+Image';
  };

  const handleRemove = () => {
    Alert.alert(
      'Bỏ lưu tin',
      'Bạn có chắc muốn xóa tin này khỏi danh sách yêu thích?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => onRemove && onRemove(room),
        },
      ]
    );
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress && onPress(room)}
      activeOpacity={0.8}
    >
      <View style={styles.imageWrapper}>
        <Image source={{ uri: getImageUrl() }} style={styles.image} resizeMode="cover" />

        {/* Heart overlay */}
        <TouchableOpacity style={styles.heartButton} onPress={handleRemove} activeOpacity={0.8}>
          <Ionicons name="heart" size={20} color="#FF3B30" />
        </TouchableOpacity>

        {/* Type badge */}
        {room.type ? (
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{room.type}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.info}>
        <Text style={styles.price}>{formatPrice(room.price)}/tháng</Text>
        <Text style={styles.title} numberOfLines={2}>
          {room.title || 'Phòng trọ'}
        </Text>

        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={14} color="#666" />
          <Text style={styles.address} numberOfLines={1}>
            {room.address || 'Chưa có địa chỉ'}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="resize-outline" size={14} color="#666" />
          <Text style={styles.metaText}>{room.area || 0}m²</Text>
          <View style={styles.dot} />
          <Ionicons name="time-outline" size={14} color="#666" />
          <Text style={styles.metaText}>{formatTimeAgo(room.createdAt)}</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity onPress={() => onCall && onCall(room)} style={styles.callButton}>
            <Ionicons name="call" size={16} color="#fff" />
            <Text style={styles.callButtonText}>Gọi</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onPress && onPress(room)}>
            <Text style={styles.detailLink}>Xem chi tiết</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e6e6e6',
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    height: 180,
    backgroundColor: '#f2f2f2',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  heartButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  typeBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  info: {
    padding: 12,
    gap: 6,
  },
  price: {
    color: '#FF3B30',
    fontWeight: '700',
    fontSize: 16,
  },
  title: {
    fontWeight: '600',
    fontSize: 15,
    color: '#2d3436',
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  address: {
    color: '#636e72',
    fontSize: 13,
    flex: 1,
  },
  metaText: {
    color: '#636e72',
    fontSize: 13,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#d1d1d6',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#34C759',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  callButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 6,
  },
  detailLink: {
    color: '#007AFF',
    fontWeight: '600',
  },
});
