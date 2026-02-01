import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FavoriteCard from '../components/FavoriteCard';
import { getMyFavorites, removeFavoriteByRoom } from '../api/favorites';
import { recordRoomCall } from '../api/rooms';

/**
 * FavoritesScreenNew - Màn hình tin đã lưu
 * 
 * Features:
 * - List view với FavoriteCard
 * - Pull to refresh
 * - Remove from favorites
 * - Call owner
 * - Empty state
 * - Loading state
 */
const FavoritesScreenNew = ({ navigation }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const data = await getMyFavorites();
      
      // Transform data: favorites array contains { _id, userId, roomId, createdAt }
      const rooms = data
        .filter(item => item.roomId) // Only keep items with valid room
        .map(item => ({
          ...item.roomId, // Room data
          favoriteId: item._id, // Keep favorite ID for deletion
          favoritedAt: item.createdAt, // Keep favorite timestamp
        }));
      
      setFavorites(rooms);
    } catch (error) {
      console.error('Load favorites error:', error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  }, []);

  const handleRoomPress = (room) => {
    navigation.navigate('RoomDetail', { roomId: room._id });
  };
      <FlatList
        data={favorites}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <FavoriteCard
            room={item}
            onPress={handleRoomPress}
            onRemove={handleRemove}
            onCall={handleCall}
          />
        )}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={[
          styles.listContent,
          favorites.length === 0 && styles.listContentEmpty,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FF3B30']}
            tintColor="#FF3B30"
          />
        }
        showsVerticalScrollIndicator={false}
      />
      }
      return phone;
    };

    Alert.alert(
      'Gọi điện cho chủ trọ',
      `Bạn có muốn gọi đến số ${maskPhone(room.contactPhone)}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Gọi ngay',
          onPress: async () => {
            try {
              // Record call log
              await recordRoomCall(room._id);
              
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
            }
          },
        },
      ]
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="heart-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>Chưa có tin đã lưu</Text>
      <Text style={styles.emptyText}>
        Nhấn vào biểu tượng ❤️ để lưu các phòng yêu thích
      </Text>
      <TouchableOpacity
        style={styles.exploreButton}
        onPress={() => navigation.navigate('HomeScreen')}
      >
        <Text style={styles.exploreButtonText}>Tìm phòng ngay</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF3B30" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Tin đã lưu</Text>
        <Text style={styles.subtitle}>{favorites.length} phòng</Text>
      </View>

      {/* List */}
      <FlatList
        data={favorites}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <FavoriteCard
            room={item}
            onPress={handleRoomPress}
            onRemove={handleRemove}
            onCall={handleCall}
          />
        )}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={[
          styles.listContent,
          favorites.length === 0 && styles.listContentEmpty,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FF3B30']}
            tintColor="#FF3B30"
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f6fa',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  listContent: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    paddingBottom: 80,
  },
  listContentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  columnWrapper: {
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  exploreButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
  },
  exploreButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default FavoritesScreenNew;
