import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Input, Button } from '../../../components';
import { colors, spacing, fonts } from '../../../constants';
import { useCreatePost } from '../../../context/CreatePostContext';
import { createRoomBasic, updateRoomBasic } from '../../../api/rooms';

const ROOM_TYPES = [
  { label: 'Studio', value: 'studio' },
  { label: 'Chung cư mini', value: 'mini-apartment' },
  { label: 'Nhà nguyên căn', value: 'whole-house' },
  { label: 'Ký túc xá', value: 'dorm' },
  { label: 'Phòng ghép', value: 'shared-room' },
];

const MIN_DESCRIPTION_LENGTH = 50;

const numberize = (value) => {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value);
};

const parsePrice = (value) => {
  if (value === null || value === undefined) {
    return NaN;
  }
  const normalized = String(value).replace(/[^\d]/g, '');
  return normalized ? Number(normalized) : NaN;
};

const parseArea = (value) => {
  if (value === null || value === undefined) {
    return NaN;
  }
  const normalized = String(value).replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : NaN;
};

export default function BasicInfoStep({ onNext }) {
  const { data, setBasicInfo, setRoomId } = useCreatePost();
  const [form, setForm] = useState({
    type: data.type || ROOM_TYPES[0].value,
    title: data.title || '',
    description: data.description || '',
    price: numberize(data.price),
    area: numberize(data.area),
    address: data.address || '',
    contactPhone: data.contactPhone || '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Sync form with data when data changes (e.g., when editing existing room)
  useEffect(() => {
    if (data.roomId) {
      setForm({
        type: data.type || ROOM_TYPES[0].value,
        title: data.title || '',
        description: data.description || '',
        price: numberize(data.price),
        area: numberize(data.area),
        address: data.address || '',
        contactPhone: data.contactPhone || '',
      });
    }
  }, [data.roomId, data.type, data.title, data.description, data.price, data.area, data.address, data.contactPhone]);

  const selectedLabel = useMemo(() => ROOM_TYPES.find((item) => item.value === form.type)?.label, [form.type]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.title?.trim()) {
      nextErrors.title = 'Tiêu đề không được để trống';
    }

    if (!form.description?.trim() || form.description.trim().length < MIN_DESCRIPTION_LENGTH) {
      nextErrors.description = `Mô tả tối thiểu ${MIN_DESCRIPTION_LENGTH} ký tự`;
    }

    if (!form.address?.trim()) {
      nextErrors.address = 'Vui lòng nhập địa chỉ cụ thể';
    }

    const parsedPrice = parsePrice(form.price);
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      nextErrors.price = 'Giá phải là số dương';
    }

    const parsedArea = parseArea(form.area);
    if (!Number.isFinite(parsedArea) || parsedArea <= 5) {
      nextErrors.area = 'Diện tích phải lớn hơn 5m²';
    }

    if (!form.contactPhone?.trim()) {
      nextErrors.contactPhone = 'Số điện thoại liên hệ là bắt buộc';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng kiểm tra lại các trường được đánh dấu.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        type: form.type,
        title: form.title.trim(),
        description: form.description.trim(),
        price: parsePrice(form.price),
        area: parseArea(form.area),
        address: form.address.trim(),
        contactPhone: form.contactPhone.trim(),
      };

      const room = data.roomId
        ? await updateRoomBasic(data.roomId, payload)
        : await createRoomBasic(payload);

      const roomId = room?._id || room?.id;
      if (!roomId) {
        throw new Error('Không xác định được ID phòng sau khi lưu');
      }

      setRoomId(roomId);
      setBasicInfo({
        roomId,
        ...payload,
      });
      onNext?.();
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'Không thể lưu thông tin';
      Alert.alert('Lưu thất bại', message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>1. Chọn loại tin & mô tả phòng</Text>
      <Text style={styles.subtitle}>
        Hãy mô tả khác biệt lớn nhất của phòng để được duyệt nhanh hơn. Thông tin rõ ràng giúp tăng tỉ lệ đặt lịch.
      </Text>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Loại phòng</Text>
        <View style={styles.typeChips}>
          {ROOM_TYPES.map((item) => (
            <TouchableOpacity
              key={item.value}
              style={[styles.typeChip, form.type === item.value && styles.typeChipActive]}
              onPress={() => handleChange('type', item.value)}
            >
              <Text style={[styles.typeChipText, form.type === item.value && styles.typeChipTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Input
        label="Tiêu đề tin đăng"
        placeholder={`Ví dụ: ${selectedLabel || 'Phòng'} 25m² full nội thất`}
        value={form.title}
        onChangeText={(text) => handleChange('title', text)}
        error={errors.title}
      />

      <Input
        label="Giá thuê (VND)"
        placeholder="4.500.000"
        keyboardType="numeric"
        value={form.price}
        onChangeText={(text) => handleChange('price', text)}
        error={errors.price}
      />

      <Input
        label="Diện tích (m²)"
        placeholder="20"
        keyboardType="numeric"
        value={form.area}
        onChangeText={(text) => handleChange('area', text)}
        error={errors.area}
      />

      <Input
        label="Địa chỉ chính xác"
        placeholder="Số nhà, đường, phường, quận"
        value={form.address}
        onChangeText={(text) => handleChange('address', text)}
        error={errors.address}
      />

      <Input
        label="Mô tả chi tiết"
        placeholder="Tình trạng nội thất, ưu đãi, tiện ích xung quanh..."
        value={form.description}
        onChangeText={(text) => handleChange('description', text)}
        error={errors.description}
        multiline
        numberOfLines={5}
      />

      <Text style={styles.helperText}>Bạn càng viết cụ thể, tin càng dễ lên trang đầu. Đừng quên ghi chú phí dịch vụ nếu có.</Text>

      <Input
        label="Số điện thoại liên hệ"
        placeholder="0912 345 678"
        keyboardType="phone-pad"
        value={form.contactPhone}
        onChangeText={(text) => handleChange('contactPhone', text)}
        error={errors.contactPhone}
      />

      <Button title="Lưu & sang bước 2" onPress={handleSave} loading={saving} fullWidth style={styles.cta} />
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
    borderRadius: spacing.borderRadius,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionLabel: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.semiBold,
    marginBottom: spacing.md,
    color: colors.text,
  },
  typeChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  typeChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.borderRadius,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  typeChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  typeChipText: {
    fontSize: fonts.sizes.sm,
    color: colors.textSecondary,
  },
  typeChipTextActive: {
    color: colors.white,
    fontWeight: fonts.weights.semiBold,
  },
  helperText: {
    fontSize: fonts.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  cta: {
    marginTop: spacing.lg,
  },
});
