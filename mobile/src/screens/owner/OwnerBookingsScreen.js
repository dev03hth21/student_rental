import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, fonts } from '../../constants';
import { HostCallLogItem, HostSearchBar } from '../../components';
import { callFilterTabs } from '../../data/hostDashboard';
import { getCallLogs, markAllCallLogsAsRead } from '../../api/callLogs';

const minutesAgo = (timestamp) => {
  if (!timestamp) return 0;
  const diff = Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000);
  return diff > 0 ? diff : 1;
};

const defaultSummary = {
  callsToday: 0,
  total: 0,
  unread: 0,
};

export default function OwnerBookingsScreen() {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState(callFilterTabs[0].id);
  const [callLogs, setCallLogs] = useState([]);
  const [roomFilters, setRoomFilters] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [summary, setSummary] = useState(defaultSummary);
  const [loading, setLoading] = useState(false);
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [error, setError] = useState(null);

  const fetchCallLogs = useCallback(async () => {
    if (activeTab === 'by-room' && !selectedRoomId) {
      return;
    }

    setLoading(true);
    try {
      const params = { filter: activeTab };
      if (activeTab === 'by-room' && selectedRoomId) {
        params.roomId = selectedRoomId;
      }

      const data = await getCallLogs(params);
      setCallLogs(data?.logs || []);
      setRoomFilters(data?.rooms || []);
      setSummary((prev) => ({ ...prev, ...(data?.summary || {}) }));
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Không thể tải nhật ký cuộc gọi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedRoomId]);

  useEffect(() => {
    fetchCallLogs();
  }, [fetchCallLogs]);

  useEffect(() => {
    if (activeTab === 'by-room' && !selectedRoomId && roomFilters.length > 0) {
      setSelectedRoomId(roomFilters[0].roomId);
    }
  }, [activeTab, roomFilters, selectedRoomId]);

  // handleFilter is triggered when user taps the filter chips
  const handleFilter = useCallback(
    (filterType) => {
      setActiveTab(filterType);
      if (filterType !== 'by-room') {
        setSelectedRoomId(null);
      } else if (!selectedRoomId && roomFilters.length > 0) {
        setSelectedRoomId(roomFilters[0].roomId);
      }
    },
    [roomFilters, selectedRoomId]
  );

  const handleCallLog = useCallback(
    (log) => {
      if (!log?.id) return;
      // Navigate to detail screen
      navigation.navigate('CallLogDetail', { callLog: log });
    },
    [navigation]
  );

  const handleMarkAllRead = useCallback(async () => {
    if ((summary.unread || 0) === 0) {
      Alert.alert('Không có cuộc gọi mới', 'Bạn đã xem hết tất cả cuộc gọi.');
      return;
    }

    try {
      setBulkUpdating(true);
      await markAllCallLogsAsRead();
      const readTimestamp = new Date().toISOString();
      setCallLogs((prev) => prev.map((log) => ({ ...log, isRead: true, readAt: readTimestamp })));
      setSummary((prev) => ({ ...prev, unread: 0 }));
      Alert.alert('Hoàn tất', 'Toàn bộ cuộc gọi đã được đánh dấu đã đọc.');
    } catch (err) {
      console.error(err);
      Alert.alert('Cập nhật thất bại', 'Không thể đánh dấu tất cả cuộc gọi đã đọc.');
    } finally {
      setBulkUpdating(false);
    }
  }, [summary.unread]);

  const decoratedLogs = useMemo(
    () =>
      callLogs.map((log) => ({
        ...log,
        id: log.id || log._id,
        name: log.studentName || 'Sinh viên ẩn danh',
        phone: log.phoneNumber,
        room: log.roomTitle,
        minutesAgo: minutesAgo(log.createdAt),
        count: log.roomCallCount || 1,
        avatar: log.studentAvatar,
      })),
    [callLogs]
  );

  const filteredLogs = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return decoratedLogs;
    return decoratedLogs.filter((log) =>
      `${log.name} ${log.phone} ${log.room}`.toLowerCase().includes(keyword)
    );
  }, [decoratedLogs, search]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Nhật ký cuộc gọi</Text>
      <Text style={styles.subtitle}>Theo dõi liên hệ từ sinh viên và phản hồi trong vòng 5 phút.</Text>

      <View style={styles.summaryCard}>
        <View>
          <Text style={styles.summaryLabel}>Cuộc gọi 24h qua</Text>
          <Text style={styles.summaryValue}>{summary.callsToday || 0}</Text>
        </View>
        <TouchableOpacity>
          <Text style={styles.summaryAction}>Xem biểu đồ</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.secondaryButton, bulkUpdating && styles.secondaryButtonDisabled]}
        onPress={handleMarkAllRead}
        disabled={bulkUpdating}
      >
        {bulkUpdating ? (
          <ActivityIndicator size="small" color={colors.white} />
        ) : (
          <Text style={styles.secondaryButtonText}>Đánh dấu tất cả đã đọc</Text>
        )}
      </TouchableOpacity>

      <HostSearchBar
        value={search}
        onChange={setSearch}
        placeholder="Tìm theo tên, số điện thoại, phòng..."
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabRow}>
        {callFilterTabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tabChip, activeTab === tab.id && styles.tabChipActive]}
            onPress={() => handleFilter(tab.id)}
          >
            <Text style={[styles.tabLabel, activeTab === tab.id && styles.tabLabelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {activeTab === 'by-room' && roomFilters.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabRow}>
          {roomFilters.map((room) => (
            <TouchableOpacity
              key={room.roomId || room.title}
              style={[
                styles.roomChip,
                selectedRoomId === room.roomId && styles.roomChipActive,
              ]}
              onPress={() => setSelectedRoomId(room.roomId)}
            >
              <Text
                style={[
                  styles.tabLabel,
                  selectedRoomId === room.roomId && styles.tabLabelActive,
                ]}
              >
                {room.title} ({room.totalCalls})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {loading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}

      {!loading && filteredLogs.length === 0 && !error && (
        <Text style={styles.emptyText}>Chưa có cuộc gọi nào phù hợp.</Text>
      )}

      {filteredLogs.map((log) => (
        <HostCallLogItem key={log.id} log={log} onCallPress={handleCallLog} />
      ))}

      <TouchableOpacity style={styles.fullButton}>
        <Text style={styles.fullButtonText}>Xuất file excel</Text>
      </TouchableOpacity>
      <Text style={styles.note}>* Khi kết nối Realtime DB/Firebase, màn hình này sẽ cập nhật ngay khi có cuộc gọi mới.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.screenPadding,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  title: {
    fontSize: fonts.sizes.title,
    fontWeight: fonts.weights.bold,
  },
  subtitle: {
    color: colors.textSecondary,
  },
  summaryCard: {
    marginTop: spacing.md,
    padding: spacing.lg,
    borderRadius: spacing.borderRadius,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    color: colors.textSecondary,
    textTransform: 'uppercase',
    fontSize: fonts.sizes.sm,
  },
  summaryValue: {
    fontSize: fonts.sizes.heading,
    fontWeight: fonts.weights.bold,
    marginTop: spacing.xs,
  },
  summaryAction: {
    color: colors.primary,
    fontWeight: fonts.weights.medium,
  },
  secondaryButton: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonDisabled: {
    opacity: 0.7,
  },
  secondaryButtonText: {
    color: colors.white,
    fontWeight: fonts.weights.semiBold,
  },
  tabRow: {
    marginTop: spacing.sm,
  },
  tabChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.borderRadius,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
  },
  tabChipActive: {
    backgroundColor: colors.text,
    borderColor: colors.text,
  },
  tabLabel: {
    fontWeight: fonts.weights.medium,
  },
  tabLabelActive: {
    color: colors.white,
  },
  roomChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.borderRadius,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  roomChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.md,
  },
  loadingText: {
    color: colors.textSecondary,
  },
  errorText: {
    color: colors.error || '#D32F2F',
    marginTop: spacing.sm,
  },
  emptyText: {
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginVertical: spacing.md,
  },
  fullButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: spacing.borderRadius,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  fullButtonText: {
    color: colors.primary,
    fontWeight: fonts.weights.semiBold,
  },
  note: {
    color: colors.textLight,
    fontStyle: 'italic',
  },
});
