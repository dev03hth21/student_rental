import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Button } from '../../../components';
import { colors, spacing, fonts } from '../../../constants';
import { useCreatePost } from '../../../context/CreatePostContext';
import { uploadRoomImages } from '../../../api/rooms';

const MIN_REQUIRED_IMAGES = 3;
const MAX_LOCAL_SELECTION = 10;

export default function MediaStep({ onNext, onBack }) {
  const { data, setImages } = useCreatePost();
  const [selected, setSelected] = useState([]);
  const [uploading, setUploading] = useState(false);

  const canContinue = useMemo(() => data.images.length >= MIN_REQUIRED_IMAGES, [data.images.length]);

  const ensureRoomId = () => {
    if (!data.roomId) {
      Alert.alert('Chưa có tin nháp', 'Hãy hoàn thành bước Thông tin trước khi tải ảnh.');
      return false;
    }
    return true;
  };

  const handleChooseImages = async () => {
    if (!ensureRoomId()) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Thiếu quyền truy cập', 'Ứng dụng cần quyền để đọc thư viện ảnh của bạn.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.85,
      selectionLimit: MAX_LOCAL_SELECTION,
    });

    if (result.canceled) {
      return;
    }

    const assets = result.assets || [];
    setSelected((prev) => {
      const next = [...prev, ...assets];
      return next.slice(0, MAX_LOCAL_SELECTION);
    });
  };

  const handleRemoveLocal = (index) => {
    setSelected((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleUpload = async () => {
    if (!ensureRoomId()) return;
    if (!selected.length) {
      Alert.alert('Thiếu ảnh', 'Hãy chọn ít nhất 1 ảnh trước khi tải lên.');
      return;
    }

    setUploading(true);
    try {
      const room = await uploadRoomImages(data.roomId, selected, { replace: true });
      setImages(room.images || []);
      setSelected([]);
      Alert.alert('Đã đồng bộ ảnh', 'Bạn có thể tiếp tục sang bước định vị.');
      onNext?.();
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'Không thể tải ảnh';
      Alert.alert('Tải ảnh thất bại', message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>2. Ảnh & media</Text>
      <Text style={styles.subtitle}>
        Tối thiểu {MIN_REQUIRED_IMAGES} ảnh rõ nét ở các góc khác nhau. Ưu tiên ảnh có ánh sáng tự nhiên và thể hiện tiện ích nổi bật.
      </Text>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.sectionLabel}>Ảnh đang chọn ({selected.length})</Text>
          <TouchableOpacity onPress={handleChooseImages} style={styles.addButton}>
            <Text style={styles.addButtonText}>+ Thêm ảnh</Text>
          </TouchableOpacity>
        </View>
        {selected.length === 0 ? (
          <Text style={styles.emptyState}>Chưa chọn ảnh nào. Nhấn "+ Thêm ảnh" để bắt đầu.</Text>
        ) : (
          <View style={styles.grid}>
            {selected.map((asset, index) => (
              <View key={asset.assetId || asset.uri} style={styles.thumbnailWrap}>
                <Image source={{ uri: asset.uri }} style={styles.thumbnail} />
                <TouchableOpacity style={styles.removeBadge} onPress={() => handleRemoveLocal(index)}>
                  <Text style={styles.removeBadgeText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
        {selected.length > 0 && (
          <Button
            title="Tải ảnh lên"
            onPress={handleUpload}
            loading={uploading}
            fullWidth
            style={styles.uploadButton}
          />
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Ảnh đã tải lên ({data.images.length})</Text>
        {data.images.length === 0 ? (
          <Text style={styles.emptyState}>Tin của bạn chưa có ảnh nào trên server.</Text>
        ) : (
          <View style={styles.grid}>
            {data.images.map((uri) => (
              <Image key={uri} source={{ uri }} style={styles.thumbnail} />
            ))}
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <Button title="Quay lại" variant="ghost" onPress={onBack} style={styles.flexButton} />
        <Button
          title="Sang bước 3"
          onPress={onNext}
          variant="secondary"
          disabled={!canContinue}
          style={styles.flexButton}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  title: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fonts.sizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.borderRadius,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionLabel: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.semiBold,
    color: colors.text,
  },
  addButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.borderRadius,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  addButtonText: {
    color: colors.primary,
    fontWeight: fonts.weights.medium,
  },
  emptyState: {
    color: colors.textSecondary,
    fontSize: fonts.sizes.sm,
  },
  uploadButton: {
    marginTop: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  thumbnailWrap: {
    position: 'relative',
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  thumbnail: {
    width: 96,
    height: 96,
    borderRadius: spacing.borderRadius,
  },
  removeBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBadgeText: {
    color: colors.white,
    fontWeight: fonts.weights.bold,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  flexButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
});
