import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { colors, spacing, fonts } from '../../constants';
import { getCallLogs, markAllCallLogsAsRead } from '../../api/callLogs';

const fallbackAvatar = 'https://i.pravatar.cc/100?img=12';

const formatDate = (dateString) => {
  if (!dateString) return '---';
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes} - ${day}/${month}`;
};

const minutesAgo = (timestamp) => {
  if (!timestamp) return '---';
  const diff = Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000);
  if (diff < 1) return 'Vừa xong';
  if (diff < 60) return `${diff} phút trước`;
  const hours = Math.floor(diff / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
};

export default function CustomerScreen({ navigation }) {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedRoom, setSelectedRoom] = useState(null);

  const fetchCallLogs = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      
      const params = {};
      if (selectedFilter !== 'all') {
        params.filter = selectedFilter;
      }
      if (selectedRoom) {
        params.roomId = selectedRoom;
      }

      const response = await getCallLogs(params);
      
      const logsData = response?.logs || [];
      const roomsData = response?.rooms || [];
      const summaryData = response?.summary || {};

      setLogs(logsData);
      setFilteredLogs(logsData);
      setRooms(roomsData);
      setSummary(summaryData);
    } catch (error) {
      console.error('Error fetching call logs:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách cuộc gọi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedFilter, selectedRoom]);

  useEffect(() => {
    fetchCallLogs();
  }, [fetchCallLogs]);

  useEffect(() => {
    // Apply search filter
    if (!searchQuery.trim()) {
      setFilteredLogs(logs);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = logs.filter((log) => {
      const name = (log.studentName || '').toLowerCase();
      const phone = (log.phoneNumber || '').toLowerCase();
      const room = (log.roomTitle || '').toLowerCase();
      const email = (log.callerEmail || '').toLowerCase();

      return (
        name.includes(query) ||
        phone.includes(query) ||
        room.includes(query) ||
        email.includes(query)
      );
    });

    setFilteredLogs(filtered);
  }, [searchQuery, logs]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCallLogs(false);
  };

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    setSelectedRoom(null);
  };

  const handleRoomFilter = (roomId) => {
    if (selectedRoom === roomId) {
      setSelectedRoom(null);
      setSelectedFilter('all');
    } else {
      setSelectedRoom(roomId);
      setSelectedFilter('by-room');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllCallLogsAsRead();
      Alert.alert('Thành công', 'Đã đánh dấu tất cả là đã đọc');
      fetchCallLogs();
    } catch (error) {
      console.error('Error marking all as read:', error);
      Alert.alert('Lỗi', 'Không thể đánh dấu tất cả. Vui lòng thử lại.');
    }
  };

  const handleCallLogPress = (callLog) => {
    navigation.navigate('CallLogDetail', { callLog });
  };

  const renderCallLogItem = ({ item }) => {
    const avatar = item.studentAvatar || fallbackAvatar;
    const name = item.studentName || 'Sinh viên ẩn danh';
    const phone = item.phoneNumber || '---';
    const room = item.roomTitle || 'Tin đã xóa';
    const time = minutesAgo(item.createdAt);
    const isUnread = !item.isRead;

    return (
      <TouchableOpacity
        style={[styles.logItem, isUnread && styles.logItemUnread]}
        onPress={() => handleCallLogPress(item)}
      >
        <Image source={{ uri: avatar }} style={styles.avatar} />
        
        <View style={styles.logContent}>
          <View style={styles.logHeader}>
            <Text style={styles.logName}>{name}</Text>
            {isUnread && <View style={styles.unreadDot} />}
          </View>
          
          <Text style={styles.logPhone}>📞 {phone}</Text>
          <Text style={styles.logRoom}>🏠 {room}</Text>
          <Text style={styles.logTime}>🕐 {time}</Text>
        </View>

        <View style={styles.logActions}>
          <Text style={styles.chevron}>›</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderRoomFilter = ({ item }) => {
    const isSelected = selectedRoom === item.roomId;
    return (
      <TouchableOpacity
        style={[styles.roomChip, isSelected && styles.roomChipSelected]}
        onPress={() => handleRoomFilter(item.roomId)}
      >
        <Text style={[styles.roomChipText, isSelected && styles.roomChipTextSelected]}>
          {item.title || 'Tin đã xóa'}
        </Text>
        {item.unreadCalls > 0 && (
          <View style={styles.roomChipBadge}>
            <Text style={styles.roomChipBadgeText}>{item.unreadCalls}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📞</Text>
      <Text style={styles.emptyTitle}>Chưa có cuộc gọi nào</Text>
      <Text style={styles.emptyText}>
        Khi có khách hàng liên hệ, danh sách sẽ hiển thị tại đây
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Đang tải danh sách...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Stats */}
      <View style={styles.headerStats}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{summary.total || 0}</Text>
          <Text style={styles.statLabel}>Tổng cuộc gọi</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, styles.statValueUnread]}>
            {summary.unread || 0}
          </Text>
          <Text style={styles.statLabel}>Chưa đọc</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{summary.callsToday || 0}</Text>
          <Text style={styles.statLabel}>Hôm nay</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm theo tên, SĐT, email..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setSearchQuery('')}
          >
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedFilter === 'all' && !selectedRoom && styles.filterButtonActive,
          ]}
          onPress={() => handleFilterChange('all')}
        >
          <Text
            style={[
              styles.filterButtonText,
              selectedFilter === 'all' && !selectedRoom && styles.filterButtonTextActive,
            ]}
          >
            Tất cả
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedFilter === 'unread' && styles.filterButtonActive,
          ]}
          onPress={() => handleFilterChange('unread')}
        >
          <Text
            style={[
              styles.filterButtonText,
              selectedFilter === 'unread' && styles.filterButtonTextActive,
            ]}
          >
            Chưa đọc
          </Text>
          {summary.unread > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{summary.unread}</Text>
            </View>
          )}
        </TouchableOpacity>

        {summary.unread > 0 && (
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={handleMarkAllAsRead}
          >
            <Text style={styles.markAllButtonText}>✓ Đọc tất cả</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Room Filters */}
      {rooms.length > 0 && (
        <View style={styles.roomFiltersContainer}>
          <Text style={styles.roomFiltersTitle}>Lọc theo phòng:</Text>
          <FlatList
            horizontal
            data={rooms}
            renderItem={renderRoomFilter}
            keyExtractor={(item) => item.roomId?.toString() || Math.random().toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.roomFiltersList}
          />
        </View>
      )}

      {/* Call Logs List */}
      <FlatList
        data={filteredLogs}
        renderItem={renderCallLogItem}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
    fontSize: fonts.sizes.md,
  },
  headerStats: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.sm,
  },
  statValue: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weights.bold,
    color: colors.text,
  },
  statValueUnread: {
    color: colors.primary,
  },
  statLabel: {
    fontSize: fonts.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: colors.background,
    borderRadius: spacing.borderRadius,
    paddingHorizontal: spacing.md,
    fontSize: fonts.sizes.md,
    color: colors.text,
  },
  clearButton: {
    marginLeft: spacing.sm,
    padding: spacing.sm,
  },
  clearButtonText: {
    fontSize: fonts.sizes.lg,
    color: colors.textSecondary,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: fonts.sizes.sm,
    color: colors.text,
    fontWeight: fonts.weights.medium,
  },
  filterButtonTextActive: {
    color: colors.white,
  },
  filterBadge: {
    marginLeft: spacing.xs,
    backgroundColor: colors.error || '#f44336',
    borderRadius: 10,
    paddingHorizontal: spacing.xs,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: fonts.sizes.xs,
    color: colors.white,
    fontWeight: fonts.weights.bold,
  },
  markAllButton: {
    marginLeft: 'auto',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius,
    backgroundColor: colors.success || '#4CAF50',
  },
  markAllButtonText: {
    fontSize: fonts.sizes.sm,
    color: colors.white,
    fontWeight: fonts.weights.medium,
  },
  roomFiltersContainer: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.sm,
  },
  roomFiltersTitle: {
    fontSize: fonts.sizes.sm,
    color: colors.textSecondary,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  roomFiltersList: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  roomChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    marginRight: spacing.sm,
  },
  roomChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  roomChipText: {
    fontSize: fonts.sizes.sm,
    color: colors.text,
  },
  roomChipTextSelected: {
    color: colors.white,
    fontWeight: fonts.weights.medium,
  },
  roomChipBadge: {
    marginLeft: spacing.xs,
    backgroundColor: colors.error || '#f44336',
    borderRadius: 10,
    paddingHorizontal: spacing.xs,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roomChipBadgeText: {
    fontSize: fonts.sizes.xs,
    color: colors.white,
    fontWeight: fonts.weights.bold,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  logItem: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
  },
  logItemUnread: {
    backgroundColor: '#f0f8ff',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: spacing.md,
  },
  logContent: {
    flex: 1,
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  logName: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.semiBold,
    color: colors.text,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginLeft: spacing.xs,
  },
  logPhone: {
    fontSize: fonts.sizes.sm,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  logRoom: {
    fontSize: fonts.sizes.sm,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  logTime: {
    fontSize: fonts.sizes.xs,
    color: colors.textSecondary,
  },
  logActions: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: spacing.sm,
  },
  chevron: {
    fontSize: fonts.sizes.xl,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl * 2,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: fonts.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
