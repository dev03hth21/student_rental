import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing, fonts } from '../../constants';
import { markCallLogAsRead } from '../../api/callLogs';
import { getRoomDetail } from '../../api/rooms';

const fallbackAvatar = 'https://i.pravatar.cc/100?img=12';

const formatDate = (dateString) => {
  if (!dateString) return '---';
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes} - ${day}/${month}/${year}`;
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

export default function CallLogDetailScreen({ route, navigation }) {
  const { callLog } = route.params || {};
  const [isMarking, setIsMarking] = useState(false);
  const [isRead, setIsRead] = useState(callLog?.isRead ?? false);
  const [roomDetailTitle, setRoomDetailTitle] = useState(callLog?.room || callLog?.roomTitle || 'Tin đã xóa');
  const [roomDetailLoading, setRoomDetailLoading] = useState(false);

  const name = callLog?.name || callLog?.studentName || 'Sinh viên ẩn danh';
  const phone = callLog?.phone || callLog?.phoneNumber || '';
  const email = callLog?.callerEmail || callLog?.email || '---';
  const roomId = callLog?.roomId;
  const avatar = callLog?.avatar || callLog?.studentAvatar || fallbackAvatar;
  const callCount = callLog?.count || callLog?.roomCallCount || 1;
  const createdAt = callLog?.createdAt;
  const readAt = callLog?.readAt;

  useEffect(() => {
    const loadRoomMeta = async () => {
      if (!roomId) return;
      try {
        setRoomDetailLoading(true);
        const data = await getRoomDetail(roomId);
        const title = data?.title || data?.room?.title || data?.name;
        setRoomDetailTitle(title || roomDetailTitle);
      } catch (err) {
        // ignore detail errors, fall back to existing title
      } finally {
        setRoomDetailLoading(false);
      }
    };
    loadRoomMeta();
  }, [roomId]);

  // Mark as read when opening detail
  useEffect(() => {
    const markRead = async () => {
      if (!callLog?.id || isRead) return;
      try {
        setIsMarking(true);
        await markCallLogAsRead(callLog.id);
        setIsRead(true);
      } catch (err) {
        console.warn('Failed to mark call log as read:', err);
      } finally {
        setIsMarking(false);
      }
    };
    markRead();
  }, [callLog?.id, isRead]);

  const handleCall = useCallback(async () => {
    const sanitizedPhone = phone.replace(/[^0-9+]/g, '');
    if (!sanitizedPhone) {
      Alert.alert('Không có số điện thoại', 'Không tìm thấy số điện thoại để gọi.');
      return;
    }

    const telUrl = `tel:${sanitizedPhone}`;
    try {
      const supported = await Linking.canOpenURL(telUrl);
      if (!supported) {
        Alert.alert('Thiết bị không hỗ trợ', 'Không thể mở ứng dụng gọi điện.');
      } else {
        await Linking.openURL(telUrl);
      }
    } catch (err) {
      Alert.alert('Lỗi gọi điện', 'Không thể mở ứng dụng gọi điện.');
      console.warn('Error opening phone app:', err);
    }
  }, [phone]);

  const handleViewRoom = useCallback(() => {
    if (roomId) {
      // Jump to Owner Listings tab and open detail stack
      navigation.getParent()?.navigate('OwnerListings', {
        screen: 'OwnerListingDetail',
        params: { roomId, returnTo: 'OwnerCustomers' },
      });
    } else {
      Alert.alert('Không tìm thấy tin', 'Tin đăng có thể đã bị xóa.');
    }
  }, [navigation, roomId]);

  if (!callLog) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Không tìm thấy thông tin cuộc gọi</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Card */}
      <View style={styles.headerCard}>
        <Image source={{ uri: avatar }} style={styles.avatar} />
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.phone}>{phone || '---'}</Text>
        <View style={styles.statusRow}>
          {isRead ? (
            <View style={styles.readBadge}>
              <Text style={styles.readBadgeText}>Đã xem</Text>
            </View>
          ) : (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>Chưa xem</Text>
            </View>
          )}
          {isMarking && <ActivityIndicator size="small" color={colors.primary} />}
        </View>
      </View>

      {/* Info Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📞 Số điện thoại</Text>
          <Text style={styles.infoValue}>{phone || '---'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>✉️ Email</Text>
          <Text style={styles.infoValue}>{email}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>🏠 Phòng quan tâm</Text>
          <TouchableOpacity onPress={handleViewRoom}>
            <Text style={[styles.infoValue, styles.linkValue]}>
              {roomDetailLoading ? 'Đang tải...' : roomDetailTitle}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📊 Số lần liên hệ</Text>
          <Text style={styles.infoValue}>{callCount} lần</Text>
        </View>
      </View>

      {/* Time Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thời gian</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>🕐 Thời gian gọi</Text>
          <Text style={styles.infoValue}>{formatDate(createdAt)}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>⏱️ Thời gian trước</Text>
          <Text style={styles.infoValue}>{minutesAgo(createdAt)}</Text>
        </View>

        {readAt && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>✓ Đã xem lúc</Text>
            <Text style={styles.infoValue}>{formatDate(readAt)}</Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <TouchableOpacity style={styles.callButton} onPress={handleCall}>
        <Text style={styles.callButtonIcon}>📞</Text>
        <Text style={styles.callButtonText}>Gọi lại</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={handleViewRoom}>
        <Text style={styles.secondaryButtonText}>Xem tin đăng</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backLinkButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backLinkText}>← Quay lại danh sách</Text>
      </TouchableOpacity>
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
    paddingBottom: spacing.xl * 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: fonts.sizes.md,
    marginBottom: spacing.lg,
  },
  backButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: spacing.borderRadius,
  },
  backButtonText: {
    color: colors.white,
    fontWeight: fonts.weights.semiBold,
  },
  headerCard: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadius,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: spacing.md,
  },
  name: {
    fontSize: fonts.sizes.heading,
    fontWeight: fonts.weights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  phone: {
    fontSize: fonts.sizes.lg,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  readBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.success || '#4CAF50',
    borderRadius: spacing.borderRadius,
  },
  readBadgeText: {
    color: colors.white,
    fontWeight: fonts.weights.medium,
    fontSize: fonts.sizes.sm,
  },
  unreadBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primary,
    borderRadius: spacing.borderRadius,
  },
  unreadBadgeText: {
    color: colors.white,
    fontWeight: fonts.weights.medium,
    fontSize: fonts.sizes.sm,
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    color: colors.textSecondary,
    fontSize: fonts.sizes.sm,
  },
  infoValue: {
    color: colors.text,
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.medium,
    maxWidth: '60%',
    textAlign: 'right',
  },
  linkValue: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: spacing.borderRadius,
    marginBottom: spacing.md,
  },
  callButtonIcon: {
    fontSize: 20,
  },
  callButtonText: {
    color: colors.white,
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.bold,
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: spacing.borderRadius,
    borderWidth: 1,
    borderColor: colors.primary,
    marginBottom: spacing.md,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.semiBold,
  },
  backLinkButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  backLinkText: {
    color: colors.textSecondary,
    fontSize: fonts.sizes.sm,
  },
});
