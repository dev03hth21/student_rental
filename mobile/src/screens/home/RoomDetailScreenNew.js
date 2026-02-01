import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../../context/AppContext';
import RoomCarousel from '../../components/RoomCarousel';
import OwnerCard from '../../components/OwnerCard';
import { RoomCard } from '../../components';
import { getRoomDetail, recordRoomView, recordRoomCall, getRecommendedRooms } from '../../api/rooms';

const { width } = Dimensions.get('window');

/**
 * RoomDetailScreen - Chi tiết phòng trọ
 * 
 * Features:
 * - Image carousel with pagination
 * - Price, area, title, address
 * - "Xem trên bản đồ" button
 * - Description
 * - Owner card with avatar
 * - Recommended rooms list
 * - Favorite toggle button (heart)
 * - Call button (red) with hidden number
 * - Zalo button (left side)
 */
const RoomDetailScreen = ({ route, navigation }) => {
  const { roomId } = route.params || {};
  const { state, actions } = useAppContext();
  const { favoriteRoomIds = [] } = state;

  const [room, setRoom] = useState(null);
  const [recommendedRooms, setRecommendedRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCall, setLoadingCall] = useState(false);

  const isFavorite = favoriteRoomIds.includes(roomId);

  useEffect(() => {
    if (roomId) {
      loadRoomDetail();
      loadRecommendedRooms();
      recordView();
    }
  }, [roomId]);

  const normalizeRoom = (raw) => {
    if (!raw) return null;
    const images = Array.isArray(raw.images)
      ? raw.images
          .map((img) => (typeof img === 'string' ? img : img?.url || img?.secure_url || img?.path))
          .filter(Boolean)
      : [];

    return {
      ...raw,
      images,
      id: raw._id || raw.id,
    };
  };

  const loadRoomDetail = async () => {
    try {
      setLoading(true);
      const data = await getRoomDetail(roomId);
      setRoom(normalizeRoom(data));
    } catch (error) {
      console.error('Load room detail error:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin phòng');
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendedRooms = async () => {
    try {
      const data = await getRecommendedRooms(6);
      setRecommendedRooms(data);
    } catch (error) {
      console.error('Load recommended error:', error);
    }
  };

  const recordView = async () => {
    try {
      await recordRoomView(roomId);
    } catch (error) {
      console.error('Record view error:', error);
    }
  };

  const handleToggleFavorite = async () => {
    if (!actions.toggleFavorite) {
      Alert.alert('Lỗi', 'Chức năng yêu thích chưa khả dụng');
      return;
    }
    
    try {
      await actions.toggleFavorite(roomId);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật yêu thích');
    }
  };

  const handleCall = async () => {
    if (!room?.contactPhone) {
      Alert.alert('Thông báo', 'Không có số điện thoại liên hệ');
      return;
    }

    Alert.alert(
      'Gọi điện cho chủ trọ',
      `Bạn có muốn gọi đến số ${maskPhone(room.contactPhone)}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Gọi ngay',
          onPress: async () => {
            try {
              setLoadingCall(true);
              
              // Record call log
              await recordRoomCall(roomId);
              
              // Open dialer
              const phoneUrl = `tel:${room.contactPhone}`;
              const canOpen = await Linking.canOpenURL(phoneUrl);
              
              if (canOpen) {
                await Linking.openURL(phoneUrl);
              } else {
                Alert.alert('Lỗi', 'Không thể mở ứng dụng gọi điện');
              }
            } catch (error) {
              console.error('Call error:', error);
              Alert.alert('Lỗi', 'Không thể thực hiện cuộc gọi');
            } finally {
              setLoadingCall(false);
            }
          },
        },
      ]
    );
  };

  const handleZalo = () => {
    if (!room?.contactPhone) {
      Alert.alert('Thông báo', 'Không có số điện thoại Zalo');
      return;
    }

    // Open Zalo chat (format: https://zalo.me/phoneNumber)
    const zaloUrl = `https://zalo.me/${room.contactPhone}`;
    Linking.openURL(zaloUrl).catch(() => {
      Alert.alert('Lỗi', 'Không thể mở Zalo. Vui lòng cài đặt ứng dụng Zalo.');
    });
  };

  const handleViewOnMap = () => {
    if (!room?.location?.lat || !room?.location?.lng) {
      Alert.alert('Thông báo', 'Phòng chưa có tọa độ trên bản đồ');
      return;
    }

    navigation.navigate('MapViewScreen', {
      latitude: room.location.lat,
      longitude: room.location.lng,
      roomId: room._id,
    });
  };

  const handleViewOtherRooms = () => {
    const ownerId = room?.ownerId?._id || room?.ownerId;
    if (!ownerId) return;

    navigation.navigate('SearchResults', {
      ownerId,
      ownerName: room?.ownerId?.name,
      filterByOwnerOnly: true,
    });
  };

  const maskPhone = (phone) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length >= 7) {
      return cleaned.slice(0, 3) + ' xxx ' + cleaned.slice(-3);
    }
    return phone;
  };

  const formatPrice = (price) => {
    if (!price) return '0';
    if (price >= 1000000) {
      return (price / 1000000).toFixed(1).replace('.0', '') + ' triệu';
    }
    return price.toLocaleString('vi-VN');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF3B30" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  if (!room) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#999" />
        <Text style={styles.errorTitle}>Không tìm thấy phòng</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Carousel */}
        <RoomCarousel images={room.images || []} />

        {/* Main Content */}
        <View style={styles.content}>
          {/* Price & Area */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPrice(room.price)}đ/tháng</Text>
            <Text style={styles.area}>• {room.area || 0}m²</Text>
          </View>

          {/* Title */}
          <Text style={styles.title} numberOfLines={3}>
            {room.title}
          </Text>

          {/* Address */}
          <View style={styles.addressRow}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.address} numberOfLines={2}>
              {room.address}
            </Text>
          </View>

          {/* View on Map Button */}
          <TouchableOpacity
            style={styles.mapButton}
            onPress={handleViewOnMap}
          >
            <Ionicons name="map-outline" size={18} color="#007AFF" />
            <Text style={styles.mapButtonText}>Xem trên bản đồ</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.mapButton, { marginTop: 8 }]}
            onPress={() => navigation.navigate('ReportIssue', { room, roomId: room.id || room._id })}
          >
            <Ionicons name="warning-outline" size={18} color="#FF3B30" />
            <Text style={[styles.mapButtonText, { color: '#FF3B30' }]}>Báo cáo tin đăng</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Description Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mô tả chi tiết</Text>
            <Text style={styles.description}>{room.description}</Text>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Owner Card */}
          <OwnerCard
            owner={{
              name: room.ownerId?.name || 'Chủ trọ',
              phone: room.contactPhone,
              createdAt: room.ownerId?.createdAt,
            }}
            onViewOtherRooms={handleViewOtherRooms}
          />

          {/* Divider */}
          <View style={styles.divider} />

          {/* Recommended Rooms */}
          {recommendedRooms.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Phòng đề xuất</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.recommendedList}
              >
                {recommendedRooms.map((item, index) => (
                  <View key={item._id || item.id || index} style={styles.recommendedItem}>
                    <RoomCard
                      room={item}
                      onPress={() => {
                        // Navigate to another room detail
                        navigation.push('RoomDetail', { roomId: item._id });
                      }}
                    />
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View style={styles.bottomBar}>
        {/* Zalo Button */}
        <TouchableOpacity
          style={styles.zaloButton}
          onPress={handleZalo}
        >
          <Ionicons name="logo-wechat" size={24} color="#0068FF" />
        </TouchableOpacity>

        {/* Favorite Button */}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={handleToggleFavorite}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={28}
            color={isFavorite ? '#FF3B30' : '#999'}
          />
        </TouchableOpacity>

        {/* Call Button */}
        <TouchableOpacity
          style={styles.callButton}
          onPress={handleCall}
          disabled={loadingCall}
        >
          {loadingCall ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="call" size={20} color="#fff" />
              <Text style={styles.callButtonText}>
                {maskPhone(room.contactPhone)}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF3B30',
  },
  area: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
    marginLeft: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    lineHeight: 24,
    marginBottom: 8,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  address: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    lineHeight: 20,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f0f7ff',
    borderRadius: 8,
    marginTop: 4,
  },
  mapButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
    marginLeft: 6,
  },
  divider: {
    height: 8,
    backgroundColor: '#f0f0f0',
    marginHorizontal: -16,
    marginVertical: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  recommendedList: {
    paddingRight: 16,
  },
  recommendedItem: {
    width: (width - 48) / 2,
    marginRight: 12,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  zaloButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f7ff',
    borderRadius: 24,
    marginRight: 12,
  },
  favoriteButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 24,
    marginRight: 12,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    backgroundColor: '#FF3B30',
    borderRadius: 24,
    paddingHorizontal: 16,
  },
  callButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
});

export default RoomDetailScreen;
