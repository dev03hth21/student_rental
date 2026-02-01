import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * RoomListCard Component
 * Card phòng dạng horizontal list (khác RoomCard dạng grid)
 * Dùng cho SearchResultsScreen
 * 
 * @param {Object} room - Thông tin phòng
 * @param {Function} onPress - Callback khi bấm card
 * @param {Function} onToggleFavorite - Callback khi bấm nút yêu thích
 * @param {Function} onCall - Callback khi bấm nút gọi
 * @param {Boolean} isFavorite - Trạng thái yêu thích
 */
const RoomListCard = ({ room, onPress, onToggleFavorite, onCall, isFavorite = false }) => {
  // Format giá VND
  const formatPrice = (price) => {
    if (!price) return 'Liên hệ';
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)} triệu/tháng`;
    }
    return `${(price / 1000).toFixed(0)}K/tháng`;
  };

  // Lấy ảnh đầu tiên
  const imageUrl = room.images && room.images.length > 0
    ? room.images[0]
    : room.image || 'https://via.placeholder.com/150x120?text=No+Image';

  // Địa chỉ rút gọn
  const getShortAddress = (address) => {
    if (!address) return room.district || 'Chưa rõ';
    const parts = address.split(',');
    if (parts.length >= 2) {
      // Lấy 2 phần cuối (quận + thành phố)
      return parts.slice(-2).join(',').trim();
    }
    return address.length > 40 ? address.substring(0, 40) + '...' : address;
  };

  // Format thời gian đăng
  const getTimeAgo = (createdAt) => {
    if (!createdAt) return '';
    
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now - created;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hôm nay';
    if (diffDays === 1) return 'Hôm qua';
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
    return `${Math.floor(diffDays / 30)} tháng trước`;
  };

  const handleFavorite = (e) => {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    onToggleFavorite && onToggleFavorite(room);
  };

  const handleCall = (e) => {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    
    // Gọi API ghi CallLog
    onCall && onCall(room);
    
    // Mở phone dialer
    if (room.contactPhone) {
      Linking.openURL(`tel:${room.contactPhone}`);
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress && onPress(room)}
      activeOpacity={0.7}
    >
      {/* Ảnh phòng */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
        
        {/* Badge VIP nếu có */}
        {room.isVip && (
          <View style={styles.vipBadge}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.vipText}>VIP</Text>
          </View>
        )}
      </View>

      {/* Nội dung */}
      <View style={styles.content}>
        {/* Giá */}
        <Text style={styles.price} numberOfLines={1}>
          {formatPrice(room.price)}
        </Text>

        {/* Tiêu đề */}
        <Text style={styles.title} numberOfLines={2}>
          {room.title || 'Phòng trọ'}
        </Text>

        {/* Diện tích & Địa chỉ */}
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="resize-outline" size={14} color="#666" />
            <Text style={styles.infoText}>{room.area || 0}m²</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="location-outline" size={14} color="#666" />
            <Text style={styles.infoText} numberOfLines={1}>
              {getShortAddress(room.address)}
            </Text>
          </View>
        </View>

        {/* Thời gian đăng */}
        {room.createdAt && (
          <Text style={styles.timeAgo}>{getTimeAgo(room.createdAt)}</Text>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {/* Nút yêu thích */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleFavorite}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={22}
            color={isFavorite ? '#FF3B30' : '#999'}
          />
        </TouchableOpacity>

        {/* Nút gọi điện */}
        <TouchableOpacity
          style={[styles.actionButton, styles.callButton]}
          onPress={handleCall}
          activeOpacity={0.7}
        >
          <Ionicons name="call" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 6,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    width: 120,
    height: 120,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  vipBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  vipText: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  content: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    lineHeight: 18,
    marginBottom: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    flex: 1,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 3,
  },
  timeAgo: {
    fontSize: 11,
    color: '#999',
  },
  actions: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  callButton: {
    backgroundColor: '#4CAF50',
    marginTop: 8,
  },
});

export default RoomListCard;
