import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, fonts } from '../../constants';
import { useAppContext } from '../../context/AppContext';
import { getMyProfile, updateMyProfile, uploadAvatar } from '../../api/account';

const avatarFallback = 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=500&q=60';

export default function OwnerAccountScreen({ navigation }) {
  const { state, actions } = useAppContext();
  const accountMenus = [
    { id: 'edit-info', label: 'Chỉnh sửa thông tin', icon: '✏️', navigateTo: 'OwnerEditInfo', isTab: false },
    { id: 'manage-rooms', label: 'Quản lý tin đăng', icon: '🗂️', navigateTo: 'OwnerListings', isTab: true },
    { id: 'customers', label: 'Quản lý khách hàng', icon: '👥', navigateTo: 'OwnerCustomers', isTab: true },
    { id: 'finance', label: 'Quản lý tài chính', icon: '💰', navigateTo: 'OwnerPayoutsPanel', isTab: false },
    { id: 'settings', label: 'Cài đặt', icon: '⚙️', navigateTo: 'OwnerAccountHome', isTab: false },
    { id: 'logout', label: 'Đăng xuất', icon: '🚪', action: 'logout' },
  ];
  const scrollRef = useRef(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const hasOwnerSession = state.isAuthenticated && Boolean(state.authTokens?.accessToken);
  const [formValues, setFormValues] = useState({
    name: state.user?.name || 'Chủ trọ',
    phone: state.user?.phone || '',
    avatar: state.user?.avatar || '',
  });
  const hasMounted = useRef(false);

  const derivedUser = {
    ...state.user,
    name: formValues.name || state.user?.name || 'Chủ trọ',
    phone: formValues.phone || state.user?.phone || '---',
    avatar: formValues.avatar || state.user?.avatar || avatarFallback,
  };

  const applyProfileToForm = useCallback((profile) => {
    setFormValues({
      name: profile?.name || 'Chủ trọ',
      phone: profile?.phone || '',
      avatar: profile?.avatar || '',
    });
  }, []);

  const loadProfile = useCallback(async () => {
    if (!hasOwnerSession) {
      return;
    }
    setProfileLoading(true);
    try {
      const data = await getMyProfile();
      applyProfileToForm(data);
      actions.updateUserProfile?.(data);
    } catch (error) {
      console.error('Không thể tải hồ sơ chủ trọ', error?.message || error);
    } finally {
      setProfileLoading(false);
    }
  }, [actions, applyProfileToForm, hasOwnerSession]);

  // Load data only once on mount
  useEffect(() => {
    if (hasMounted.current) return;
    hasMounted.current = true;
    
    if (!hasOwnerSession) {
      applyProfileToForm(state.user || {});
      return;
    }
    loadProfile();
  }, []);

  const handlePickAvatar = useCallback(async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Cần quyền truy cập', 'Vui lòng cấp quyền truy cập thư viện ảnh.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const selectedImage = result.assets[0];
      setAvatarLoading(true);

      try {
        const uploadResult = await uploadAvatar(selectedImage);
        const newAvatarUrl = uploadResult.avatar || uploadResult.url;
        
        setFormValues((prev) => ({ ...prev, avatar: newAvatarUrl }));
        actions.updateUserProfile?.({ avatar: newAvatarUrl });
        Alert.alert('Thành công', 'Đã cập nhật ảnh đại diện.');
      } catch (uploadError) {
        console.error('Upload error:', uploadError);
        Alert.alert('Lỗi', 'Không thể tải ảnh lên. Vui lòng thử lại.');
      } finally {
        setAvatarLoading(false);
      }
    } catch (error) {
      console.error('Pick avatar error:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh.');
    }
  }, [actions]);

  const handleLogout = useCallback(() => {
    actions.logout?.();
  }, [actions]);

  const handleManualSync = useCallback(() => {
    if (!hasOwnerSession) {
      Alert.alert('Yêu cầu đăng nhập', 'Hãy đăng nhập bằng tài khoản chủ trọ thật để đồng bộ từ server.');
      return;
    }
    loadProfile();
  }, [hasOwnerSession, loadProfile]);

  const handleMenuPress = useCallback((item) => {
    if (item?.action === 'logout') {
      handleLogout();
      return;
    }

    if (item?.navigateTo) {
      if (item.isTab) {
        navigation.getParent()?.navigate(item.navigateTo);
      } else {
        navigation.navigate(item.navigateTo);
      }
      return;
    }

    Alert.alert('Thông báo', 'Tính năng đang được phát triển.');
  }, [handleLogout, navigation]);

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.profileCard}>
        <View style={styles.profileRow}>
          <TouchableOpacity onPress={handlePickAvatar} disabled={avatarLoading}>
            <Image source={{ uri: derivedUser.avatar || avatarFallback }} style={styles.avatar} />
            {avatarLoading ? (
              <View style={styles.avatarOverlay}>
                <ActivityIndicator color={colors.white} size="small" />
              </View>
            ) : (
              <View style={styles.avatarEditBadge}>
                <Text style={styles.avatarEditIcon}>📷</Text>
              </View>
            )}
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text style={styles.eyebrow}>Tài khoản Verified</Text>
            <Text style={styles.name}>{derivedUser.name}</Text>
            <Text style={styles.meta}>UID: HOST-{(state.user?._id || 'A203').slice(-4)}</Text>
            <Text style={styles.meta}>SĐT: {derivedUser.phone || '---'}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.primaryButton, profileLoading && styles.primaryButtonDisabled]}
          onPress={handleManualSync}
          disabled={profileLoading}
        >
          {profileLoading ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={styles.primaryButtonText}>Đồng bộ từ server</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Quản lý tài khoản</Text>
        {accountMenus.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuRow}
            onPress={() => handleMenuPress(item)}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Text style={styles.menuChevron}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
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
    gap: spacing.lg,
  },
  profileCard: {
    backgroundColor: colors.text,
    borderRadius: spacing.borderRadius,
    padding: spacing.lg,
    gap: spacing.md,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  eyebrow: {
    color: colors.textLight,
    textTransform: 'uppercase',
    fontSize: fonts.sizes.sm,
  },
  name: {
    color: colors.white,
    fontSize: fonts.sizes.heading,
    fontWeight: fonts.weights.bold,
  },
  meta: {
    color: colors.textLight,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEditIcon: {
    fontSize: 12,
  },
  statRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statBox: {
    flex: 1,
    borderRadius: spacing.borderRadius,
    backgroundColor: 'rgba(255,255,255,0.12)',
    padding: spacing.md,
  },
  statLabel: {
    color: colors.textLight,
    fontSize: fonts.sizes.sm,
  },
  statValue: {
    marginTop: spacing.xs,
    color: colors.white,
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.semiBold,
  },
  primaryButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius,
    backgroundColor: colors.primary,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: colors.white,
    fontWeight: fonts.weights.semiBold,
  },
  formCard: {
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  formGroup: {
    gap: spacing.xs,
  },
  formLabel: {
    fontWeight: fonts.weights.medium,
    color: colors.text,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.borderRadius,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  saveButton: {
    borderRadius: spacing.borderRadius,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: colors.white,
    fontWeight: fonts.weights.semiBold,
  },
  balanceCard: {
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  sectionLabel: {
    color: colors.textSecondary,
    textTransform: 'uppercase',
    fontSize: fonts.sizes.sm,
  },
  balanceValue: {
    marginTop: spacing.xs,
    fontSize: fonts.sizes.heading,
    fontWeight: fonts.weights.bold,
  },
  balanceHint: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  secondaryButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius,
    borderWidth: 1,
    borderColor: colors.text,
  },
  secondaryButtonText: {
    fontWeight: fonts.weights.semiBold,
  },
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.semiBold,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  progressValue: {
    fontWeight: fonts.weights.semiBold,
  },
  helperText: {
    color: colors.textSecondary,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    gap: spacing.sm,
  },
  menuIcon: {
    fontSize: fonts.sizes.lg,
  },
  menuLabel: {
    flex: 1,
    fontSize: fonts.sizes.md,
  },
  menuChevron: {
    color: colors.textLight,
    fontSize: fonts.sizes.lg,
  },
  logoutButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logoutText: {
    fontWeight: fonts.weights.semiBold,
    color: colors.text,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadius * 2,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weights.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  currentBalanceBox: {
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  currentBalanceLabel: {
    color: colors.textSecondary,
    fontSize: fonts.sizes.sm,
  },
  currentBalanceValue: {
    fontSize: fonts.sizes.heading,
    fontWeight: fonts.weights.bold,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  inputLabel: {
    fontWeight: fonts.weights.medium,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  presetButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  presetButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '20',
  },
  presetButtonText: {
    color: colors.text,
    fontWeight: fonts.weights.medium,
  },
  presetButtonTextActive: {
    color: colors.primary,
  },
  amountInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.borderRadius,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    fontSize: fonts.sizes.lg,
    textAlign: 'center',
  },
  inputHint: {
    color: colors.textSecondary,
    fontSize: fonts.sizes.sm,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  cancelModalButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: spacing.borderRadius,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cancelModalButtonText: {
    color: colors.textSecondary,
    fontWeight: fonts.weights.medium,
  },
  confirmButton: {
    flex: 2,
    paddingVertical: spacing.md,
    borderRadius: spacing.borderRadius,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    color: colors.white,
    fontWeight: fonts.weights.semiBold,
  },
});
