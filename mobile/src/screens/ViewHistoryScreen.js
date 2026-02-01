import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RoomCardMini from '../components/RoomCardMini';
import { getRecentViews } from '../api/viewlogs';

/**
 * ViewHistoryScreen - Màn hình tin đã xem
 * 
 * Features:
 * - Grid 2 cột hiển thị phòng đã xem
 * - Pull to refresh
 * - Empty state
 * - Loading state
 * - Navigate to RoomDetail
 */
export default function ViewHistoryScreen({ navigation }) {
  const [viewLogs, setViewLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadViewHistory();
  }, []);

  const loadViewHistory = async () => {
    try {
      setLoading(true);
      const data = await getRecentViews();
      
      // Transform data: views array contains { id, room, viewedAt }
      const rooms = data
        .filter(item => item.room) // Only keep items with valid room
        .map(item => ({
          ...item.room,
          viewedAt: item.viewedAt, // Keep viewedAt for sorting
        }));
      
      setViewLogs(rooms);
    } catch (error) {
      console.error('Load view history error:', error);
      setViewLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadViewHistory();
    setRefreshing(false);
  }, []);

  const handleRoomPress = (room) => {
    navigation.navigate('HomeTab', {
      screen: 'RoomDetail',
      params: { roomId: room._id },
    });
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="time-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>Chưa có tin đã xem</Text>
      <Text style={styles.emptyText}>
        Các phòng bạn đã xem sẽ hiển thị ở đây
      </Text>
      <TouchableOpacity
        style={styles.exploreButton}
        onPress={() => navigation.navigate('HomeTab', { screen: 'HomeMain' })}
      >
        <Text style={styles.exploreButtonText}>Khám phá ngay</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tin đăng đã xem</Text>
      
      <FlatList
        data={viewLogs}
        numColumns={2}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <RoomCardMini room={item} onPress={handleRoomPress} />
        )}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={[
          styles.listContent,
          viewLogs.length === 0 && styles.listContentEmpty,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2d3436',
    textAlign: 'center',
    marginVertical: 16,
    paddingHorizontal: 16,
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
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 80,
  },
  listContentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
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
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  exploreButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
