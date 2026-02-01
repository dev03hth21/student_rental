import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Button from '../../components/Button';
import { colors, spacing, fonts } from '../../constants';
import { useAppContext } from '../../context/AppContext';

export default function ProfileScreen({ navigation }) {
  const { state, actions } = useAppContext();
  const {
    user,
    favoriteRooms = [],
    bookingRequests = [],
    recentRoomItems = [],
  } = state;

  const pendingBookings = useMemo(
    () => bookingRequests.filter((request) => request.status === 'pending').length,
    [bookingRequests]
  );

  const menuItems = useMemo(
    () => [
      {
        id: 'notifications',
        title: 'Thông báo',
        icon: '\u{1F514}',
        target: 'Notifications',
      },
      {
        id: 'favorites',
        title: 'Phòng yêu thích',
        icon: '\u2764\uFE0F',
      },
      {
        id: 'viewed',
        title: 'Tin đã xem',
        icon: '\u23F3',
        target: 'ViewHistory',
      },
      {
        id: 'support',
        title: 'Hỗ trợ & phản hồi',
        icon: '\u{1F198}',
        target: 'Support',
      },
      {
        id: 'settings',
        title: 'Cài đặt tài khoản',
        icon: '\u2699\uFE0F',
        target: 'Settings',
      },
    ],
    []
  );

  const handleMenuPress = (item) => {
    if (item.id === 'favorites') {
      navigation.getParent()?.navigate('FavoritesTab');
      return;
    }

    if (item.target) {
      navigation.navigate(item.target);
    }
  };

  const handleLogout = () => {
    actions.logout();
  };

  if (!user) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>Không tìm thấy phiên đăng nhập</Text>
        <Text style={styles.emptySubtitle}>
          Vui lòng đăng nhập lại để tiếp tục sử dụng ứng dụng.
        </Text>
        <Button title="Đăng nhập lại" onPress={handleLogout} fullWidth />
      </View>
    );
  }

  const avatarUri = user.avatar || 'https://via.placeholder.com/120';
  const roleLabel = user.role === 'student' ? 'Sinh viên' : 'Chủ trọ';
  const roleEmoji = user.role === 'student' ? '\u{1F468}\u{200D}\u{1F393}' : '\u{1F3E0}';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.profileHeader}>
        <Image source={{ uri: avatarUri }} style={styles.avatar} />
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        {user.phone ? <Text style={styles.email}>{user.phone}</Text> : null}

        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>
            {`${roleEmoji} ${roleLabel}`}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Text style={styles.editButtonText}>Chỉnh sửa hồ sơ</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.menuGrid}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuCard}
            onPress={() => handleMenuPress(item)}
            activeOpacity={0.85}
          >
            <Text style={styles.menuEmoji}>{item.icon}</Text>
            <Text style={styles.menuCardTitle}>{item.title}</Text>
            {item.badge ? (
              <View style={styles.menuBadge}>
                <Text style={styles.menuBadgeText}>{item.badge}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.logoutContainer}>
        <Button title="Đăng xuất" onPress={handleLogout} variant="outline" fullWidth />
      </View>

      <Text style={styles.version}>Phiên bản 1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingBottom: spacing.xxl,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.screenPadding,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  name: {
    fontSize: fonts.sizes.heading,
    fontWeight: fonts.weights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  email: {
    fontSize: fonts.sizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  roleBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  roleText: {
    fontSize: fonts.sizes.sm,
    color: colors.text,
  },
  editButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius,
  },
  editButtonText: {
    color: colors.white,
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.semiBold,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: spacing.screenPadding,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadius,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weights.bold,
    color: colors.text,
  },
  statLabel: {
    marginTop: spacing.xs,
    fontSize: fonts.sizes.sm,
    color: colors.textSecondary,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  menuCard: {
    width: '47%',
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadius,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 120,
    justifyContent: 'space-between',
  },
  menuEmoji: {
    fontSize: fonts.sizes.xxl,
  },
  menuCardTitle: {
    marginTop: spacing.sm,
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.semiBold,
    color: colors.text,
  },
  menuBadge: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  menuBadgeText: {
    color: colors.white,
    fontSize: fonts.sizes.xs,
    fontWeight: fonts.weights.bold,
  },
  logoutContainer: {
    padding: spacing.screenPadding,
    marginTop: spacing.lg,
  },
  version: {
    textAlign: 'center',
    fontSize: fonts.sizes.sm,
    color: colors.textLight,
    marginVertical: spacing.lg,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.screenPadding,
    backgroundColor: colors.background,
    gap: spacing.md,
  },
  emptyTitle: {
    fontSize: fonts.sizes.heading,
    color: colors.text,
    fontWeight: fonts.weights.bold,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: fonts.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
