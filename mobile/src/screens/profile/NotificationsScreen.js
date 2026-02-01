import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, fonts } from '../../constants';
import { fetchNotifications, markAllNotificationsRead, markNotificationRead } from '../../api/notifications';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchNotifications();
      setNotifications(result.notifications || []);
    } catch (error) {
      console.error('Load notifications error', error);
      Alert.alert('Lỗi', 'Không tải được danh sách thông báo');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [loadNotifications])
  );

  const unread = useMemo(() => notifications.filter((n) => !n.isRead), [notifications]);
  const read = useMemo(() => notifications.filter((n) => n.isRead), [notifications]);

  const markAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, readAt: n.readAt || new Date().toISOString() })));
    } catch (error) {
      console.error('Mark all read error', error);
      Alert.alert('Lỗi', 'Không thể đánh dấu đã đọc');
    }
  };

  const markOneRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true, readAt: n.readAt || new Date().toISOString() } : n)));
    } catch (error) {
      console.error('Mark read error', error);
    }
  };

  const renderSection = (title, data, isUnread) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {data.map((notification) => (
        <TouchableOpacity
          key={notification._id}
          activeOpacity={0.8}
          onPress={() => (isUnread ? markOneRead(notification._id) : undefined)}
        >
          <View style={[styles.card, isUnread && styles.unreadCard]}>
            <View style={styles.cardHeader}>
              <Text style={styles.message}>{notification.title}</Text>
              <Text style={styles.time}>{new Date(notification.createdAt).toLocaleString('vi-VN')}</Text>
            </View>
            <Text style={styles.detail}>{notification.message}</Text>
            {isUnread && <Text style={styles.badge}>Mới</Text>}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={loadNotifications} />}
    >
      <View style={styles.headerRow}>
        <Text style={styles.title}>Thông báo</Text>
        {unread.length > 0 ? (
          <TouchableOpacity onPress={markAllRead}>
            <Text style={styles.markAll}>Đánh dấu đã đọc</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {renderSection('Chưa đọc', unread, true)}
      {renderSection('Đã đọc', read, false)}
      {notifications.length === 0 && !loading ? (
        <Text style={styles.note}>Bạn chưa có thông báo nào.</Text>
      ) : (
        <Text style={styles.note}>Kéo xuống để làm mới danh sách.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.screenPadding, backgroundColor: colors.background },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  title: { fontSize: fonts.sizes.title, fontWeight: fonts.weights.bold },
  markAll: { color: colors.primary, fontWeight: fonts.weights.semiBold },
  section: { marginBottom: spacing.lg },
  sectionTitle: { fontWeight: fonts.weights.semiBold, marginBottom: spacing.sm, color: colors.textSecondary },
  card: {
    padding: spacing.md,
    borderRadius: spacing.borderRadius,
    backgroundColor: colors.white,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  unreadCard: { borderColor: colors.primary, backgroundColor: colors.surface },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  message: { fontSize: fonts.sizes.md, color: colors.text, flex: 1, marginRight: spacing.sm },
  time: { fontSize: fonts.sizes.sm, color: colors.textSecondary },
  detail: { color: colors.textSecondary },
  badge: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    color: colors.white,
    paddingHorizontal: spacing.sm,
    borderRadius: spacing.borderRadius,
  },
  note: { marginTop: spacing.lg, color: colors.textLight, fontStyle: 'italic' },
});
