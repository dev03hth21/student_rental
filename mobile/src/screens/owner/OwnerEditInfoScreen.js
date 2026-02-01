import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, fonts } from '../../constants';
import { useAppContext } from '../../context/AppContext';
import { updateMyProfile, uploadIdCard } from '../../api/account';

export default function OwnerEditInfoScreen({ navigation }) {
  const { state, actions } = useAppContext();
  const { user } = state;

  const [formValues, setFormValues] = useState({
    name: user?.name || user?.fullName || 'Chủ trọ',
    phone: user?.phone || '',
    idCardNumber: user?.identityCardNumber || '',
    idCardImage: user?.identityCardImage || '',
  });

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setFormValues((prev) => ({
      ...prev,
      name: user?.name || user?.fullName || prev.name,
      phone: user?.phone || prev.phone,
      idCardNumber: user?.identityCardNumber || prev.idCardNumber,
      idCardImage: user?.identityCardImage || prev.idCardImage,
    }));
  }, [user]);

  const handleInputChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handlePickIdCard = useCallback(async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Cần quyền truy cập', 'Vui lòng cấp quyền truy cập thư viện ảnh.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.length) return;

      const image = result.assets[0];
      setUploading(true);
      try {
        const uploadResult = await uploadIdCard(image);
        const url = uploadResult.identityCardImage || uploadResult.url || uploadResult.avatar;
        setFormValues((prev) => ({ ...prev, idCardImage: url }));
        actions.updateUserProfile?.({ identityCardImage: url });
        Alert.alert('Thành công', 'Đã tải ảnh CCCD thành công.');
      } catch (error) {
        console.error('Upload ID card error:', error);
        Alert.alert('Lỗi', 'Không thể upload ảnh CCCD. Vui lòng thử lại.');
      } finally {
        setUploading(false);
      }
    } catch (error) {
      console.error('Pick ID card error:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh.');
    }
  }, [actions]);

  const handleSave = useCallback(async () => {
    if (!formValues.name?.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập họ tên.');
      return;
    }
    if (!formValues.phone?.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập số điện thoại.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formValues.name.trim(),
        phone: formValues.phone.trim(),
        identityCardNumber: formValues.idCardNumber?.trim(),
        identityCardImage: formValues.idCardImage?.trim(),
      };
      const data = await updateMyProfile(payload);
      actions.updateUserProfile?.(data);
      Alert.alert('Thành công', 'Đã lưu thông tin.');
      navigation.goBack();
    } catch (error) {
      console.error('Save edit info error:', error?.response?.data || error);
      const message = error?.response?.data?.message || 'Lưu thất bại. Vui lòng thử lại.';
      Alert.alert('Lỗi', message);
    } finally {
      setSaving(false);
    }
  }, [actions, formValues, navigation]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Chỉnh sửa thông tin</Text>
      <Text style={styles.subtitle}>Cập nhật họ tên, số điện thoại và thông tin CCCD.</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Họ tên</Text>
        <TextInput
          style={styles.input}
          value={formValues.name}
          onChangeText={(text) => handleInputChange('name', text)}
          placeholder="Nhập họ tên"
        />

        <Text style={styles.label}>Số điện thoại</Text>
        <TextInput
          style={styles.input}
          value={formValues.phone}
          onChangeText={(text) => handleInputChange('phone', text)}
          keyboardType="phone-pad"
          placeholder="090xxxxx"
        />

        <Text style={styles.label}>Số CCCD</Text>
        <TextInput
          style={styles.input}
          value={formValues.idCardNumber}
          onChangeText={(text) => handleInputChange('idCardNumber', text)}
          keyboardType="number-pad"
          placeholder="Nhập số CCCD"
        />

        <View style={styles.uploadRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Ảnh CCCD</Text>
            {formValues.idCardImage ? (
              <Image source={{ uri: formValues.idCardImage }} style={styles.preview} />
            ) : (
              <Text style={styles.hint}>Chưa có ảnh. Tải lên để xác minh.</Text>
            )}
          </View>
          <TouchableOpacity
            style={[styles.uploadButton, uploading && styles.buttonDisabled]}
            onPress={handlePickIdCard}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.uploadButtonText}>Tải ảnh</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
          )}
        </TouchableOpacity>
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
    gap: spacing.md,
  },
  title: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weights.bold,
    color: colors.text,
  },
  subtitle: {
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  label: {
    fontWeight: fonts.weights.medium,
    color: colors.text,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.borderRadius,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  uploadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  preview: {
    width: 120,
    height: 80,
    borderRadius: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  hint: {
    color: colors.textSecondary,
  },
  uploadButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius,
    backgroundColor: colors.primary,
  },
  uploadButtonText: {
    color: colors.white,
    fontWeight: fonts.weights.semiBold,
  },
  saveButton: {
    marginTop: spacing.sm,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: spacing.borderRadius,
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    color: colors.white,
    fontWeight: fonts.weights.semiBold,
    fontSize: fonts.sizes.md,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});
