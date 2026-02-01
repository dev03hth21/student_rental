import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { colors, spacing, fonts } from '../../constants';

const mockConversations = [
  { id: 'cv-1', room: 'Căn hộ Q7 view sông', lastMessage: 'Chủ trọ: Mai 14h xem phòng được không em?', unread: 2 },
  { id: 'cv-2', room: 'Phòng mini Q10', lastMessage: 'Bạn: Em đã chuyển khoản giữ chỗ rồi nhé', unread: 0 },
];

export default function MessagesScreen({ navigation }) {
  const hasConversations = mockConversations.length > 0;

  const unreadCount = useMemo(
    () => mockConversations.filter((item) => item.unread > 0).length,
    []
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Tin nhắn</Text>
          <Text style={styles.subtitle}>{unreadCount} cuộc trò chuyện chưa đọc</Text>
        </View>
        <TouchableOpacity style={styles.newButton}>
          <Text style={styles.newButtonText}>Tạo cuộc trò chuyện</Text>
        </TouchableOpacity>
      </View>

      {hasConversations ? (
        <FlatList
          data={mockConversations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate('ChatDetail', {
                  conversation: item,
                })
              }
              style={[styles.conversationCard, item.unread > 0 && styles.conversationUnread]}
            >
              <Text style={styles.room}>{item.room}</Text>
              <Text style={styles.message} numberOfLines={2}>{item.lastMessage}</Text>
              {item.unread > 0 && <Text style={styles.badge}>{item.unread} tin mới</Text>}
              <Text style={styles.placeholder}>Nhấn để mở đoạn chat chi tiết.</Text>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Chưa có tin nhắn</Text>
          <Text style={styles.emptySubtitle}>Nhắn với chủ trọ sau khi quan tâm một phòng để bắt đầu cuộc trò chuyện.</Text>
          <TouchableOpacity style={styles.browseButton}>
            <Text style={styles.browseButtonText}>Khám phá phòng nổi bật</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.note}>
        * Giai đoạn tới sẽ bật realtime, gửi hình ảnh và voice note trực tiếp trong cuộc trò chuyện.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.screenPadding,
    backgroundColor: colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fonts.sizes.title,
    fontWeight: fonts.weights.bold,
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: fonts.sizes.md,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  newButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.borderRadius,
  },
  newButtonText: {
    color: colors.white,
    fontWeight: fonts.weights.semiBold,
  },
  conversationCard: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: spacing.borderRadius,
    borderWidth: 1,
    borderColor: colors.border,
  },
  conversationUnread: {
    borderColor: colors.primary,
  },
  room: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.semiBold,
    marginBottom: spacing.xs,
  },
  message: {
    color: colors.textSecondary,
  },
  badge: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    color: colors.white,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.borderRadius,
    fontSize: fonts.sizes.sm,
  },
  placeholder: {
    marginTop: spacing.sm,
    color: colors.textLight,
    fontStyle: 'italic',
    fontSize: fonts.sizes.sm,
  },
  separator: {
    height: spacing.md,
  },
  emptyState: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.bold,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  browseButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: spacing.borderRadius,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  browseButtonText: {
    color: colors.primary,
    fontWeight: fonts.weights.semiBold,
  },
  note: {
    marginTop: spacing.xl,
    color: colors.textLight,
    textAlign: 'center',
    fontSize: fonts.sizes.sm,
  },
});
