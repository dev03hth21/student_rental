import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, fonts } from '../../constants';
import { useAppContext } from '../../context/AppContext';
import { updateMyProfile, uploadAvatar } from '../../api/account';

export default function EditProfileScreen({ navigation }) {
  const { state, actions } = useAppContext();
  const user = state.user || {};

  const [name, setName] = useState(user.name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [avatar, setAvatar] = useState(user.avatar || '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handlePickAvatar = useCallback(async () => {
    const imagesMediaType = ImagePicker.MediaType?.Images ?? ImagePicker.MediaTypeOptions.Images;
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Quyền truy cập', 'Vui lòng cho phép truy cập thư viện ảnh.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: imagesMediaType,
        quality: 0.8,
      });
      if (result.canceled || !result.assets?.length) return;

      setUploading(true);
      try {
        const uploaded = await uploadAvatar(result.assets[0]);
        if (uploaded?.avatar) {
          setAvatar(uploaded.avatar);
          actions.updateUserProfile?.({ avatar: uploaded.avatar });
          Alert.alert('Thành công', 'Đã cập nhật ảnh đại diện.');
        }
      } catch (error) {
        console.error('Upload avatar failed', error);
        const message = error?.response?.data?.message || 'Không thể tải ảnh lên. Vui lòng thử lại.';
        Alert.alert('Lỗi', message);
      } finally {
        setUploading(false);
      }
    } catch (error) {
      console.error('Pick avatar error', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh.');
    }
  }, [actions]);

  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập họ tên.');
      return;
    }

    setSaving(true);
    try {
      const payload = { name: name.trim(), phone: phone.trim(), avatar: avatar?.trim() || undefined };
      const updated = await updateMyProfile(payload);
      actions.updateUserProfile?.(updated);
      Alert.alert('Thành công', 'Đã lưu hồ sơ');
      navigation.goBack();
    } catch (error) {
      console.error('Update profile failed', error);
      const message = error?.response?.data?.message || 'Cập nhật thất bại. Vui lòng thử lại.';
      Alert.alert('Lỗi', message);
    } finally {
      setSaving(false);
    }
  }, [actions, avatar, name, navigation, phone]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.avatarWrap}>
        <Image
          source={{ uri: avatar || 'https://via.placeholder.com/120' }}
          style={styles.avatar}
        />
        <TouchableOpacity style={styles.avatarButton} onPress={handlePickAvatar} disabled={uploading}>
          {uploading ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <Text style={styles.avatarButtonText}>Đổi ảnh</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Họ tên</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Nhập họ tên"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Email</Text>
        <TextInput style={[styles.input, styles.inputDisabled]} value={user.email || ''} editable={false} />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Số điện thoại</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="Nhập số điện thoại"
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? <ActivityIndicator color={colors.white} /> : <Text style={styles.saveButtonText}>Lưu thay đổi</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.screenPadding },
  avatarWrap: { alignItems: 'center', marginBottom: spacing.xl },
  avatar: { width: 120, height: 120, borderRadius: 60, backgroundColor: colors.surface },
  avatarButton: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius,
  },
  avatarButtonText: { color: colors.white, fontWeight: fonts.weights.semiBold },
  field: { marginBottom: spacing.lg },
  label: { color: colors.textSecondary, marginBottom: spacing.xs, fontSize: fonts.sizes.sm },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.borderRadius,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fonts.sizes.md,
    color: colors.text,
  },
  inputDisabled: { backgroundColor: colors.surface, color: colors.textSecondary },
  actions: { marginTop: spacing.lg },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: spacing.borderRadius,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  saveButtonDisabled: { opacity: 0.7 },
  saveButtonText: { color: colors.white, fontSize: fonts.sizes.md, fontWeight: fonts.weights.bold },
});
