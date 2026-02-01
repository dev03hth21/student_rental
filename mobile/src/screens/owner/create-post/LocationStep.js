import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import { Button, Input } from '../../../components';
import { colors, spacing, fonts, MAPTILER_TILE_URL } from '../../../constants';
import { useCreatePost } from '../../../context/CreatePostContext';
import { submitRoomForReview, updateRoomLocationMeta } from '../../../api/rooms';
import { getWalletBalance, payPostingFee } from '../../../api/wallet';
import { useNavigation } from '@react-navigation/native';

const DEFAULT_REGION = {
  latitude: 10.8231,
  longitude: 106.6297,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const POSTING_FEE = 50000;

export default function LocationStep({ onBack, onReset }) {
  const navigation = useNavigation();
  const { data, setLocation, reset, setPostingPaid } = useCreatePost();
  const isEditMode = data.mode === 'edit';
  const needsPayment = !data.postingPaid;
  const [address, setAddress] = useState(data.locationAddress || data.address || '');
  const [savingLocation, setSavingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const initialCoordinate = useMemo(() => {
    if (data.location?.lat && data.location?.lng) {
      return { latitude: data.location.lat, longitude: data.location.lng };
    }
    return null;
  }, [data.location]);

  const [selectedCoord, setSelectedCoord] = useState(initialCoordinate);

  const currentRegion = useMemo(() => {
    if (selectedCoord) {
      return {
        ...DEFAULT_REGION,
        latitude: selectedCoord.latitude,
        longitude: selectedCoord.longitude,
      };
    }
    return DEFAULT_REGION;
  }, [selectedCoord]);

  const ensureReady = () => {
    if (!data.roomId) {
      Alert.alert('Thiếu thông tin', 'Bạn cần hoàn thành bước 1 trước.');
      return false;
    }

    if (!data.images || data.images.length < 3) {
      Alert.alert('Thiếu ảnh', 'Hãy tải tối thiểu 3 ảnh trước khi ghim vị trí.');
      return false;
    }

    return true;
  };

  const persistLocation = async () => {
    if (!ensureReady()) return false;
    if (!selectedCoord) {
      Alert.alert('Chưa chọn toạ độ', 'Nhấn giữ lên bản đồ để đặt ghim.');
      return false;
    }

    const trimmedAddress = address?.trim() || data.address;
    const payload = {
      location: { lat: selectedCoord.latitude, lng: selectedCoord.longitude },
      address: trimmedAddress,
    };

    const hasExistingLocation =
      data.location &&
      Math.abs(data.location.lat - payload.location.lat) < 1e-5 &&
      Math.abs(data.location.lng - payload.location.lng) < 1e-5 &&
      (data.locationAddress || data.address || '') === trimmedAddress;

    if (hasExistingLocation) {
      return true;
    }

    const room = await updateRoomLocationMeta(data.roomId, payload);
    setLocation({ location: room.location, address: trimmedAddress });
    return true;
  };

  const handleSaveLocation = async () => {
    setSavingLocation(true);
    try {
      const ok = await persistLocation();
      if (ok) {
        Alert.alert('Đã lưu vị trí', 'Bạn có thể gửi duyệt ngay bây giờ.');
      }
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'Không thể lưu vị trí';
      Alert.alert('Lỗi', message);
    } finally {
      setSavingLocation(false);
    }
  };

  const submitAndReturn = async () => {
    await submitRoomForReview(data.roomId);
    Alert.alert('Hoàn thành', 'Tin đã được gửi duyệt.', [
      {
        text: 'Đóng',
        onPress: () => {
          reset();
          onReset?.();
          navigation.getParent()?.navigate('OwnerListings', { screen: 'OwnerListingsHome' });
        },
      },
    ]);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const ok = await persistLocation();
      if (!ok) return;
      await submitAndReturn();
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'Không thể gửi duyệt tin';
      Alert.alert('Lỗi', message);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayAndSubmit = async () => {
    setSubmitting(true);
    try {
      const ok = await persistLocation();
      if (!ok) return;

      const balanceResp = await getWalletBalance();
      const currentBalance = balanceResp?.balance ?? 0;
      const remaining = currentBalance - POSTING_FEE;

      const showTopUp = () =>
        Alert.alert(
          'Số dư không đủ',
          `Phí đăng tin 50,000đ. Số dư hiện tại ${currentBalance.toLocaleString('vi-VN')} đ. Nạp thêm để tiếp tục.`,
          [
            { text: 'Đóng', style: 'cancel' },
            { text: 'Nạp ngay', onPress: () => navigation.navigate('OwnerPayoutsPanel') },
          ]
        );

      if (remaining < 0) {
        showTopUp();
        return;
      }

      Alert.alert(
        'Xác nhận thanh toán',
        `Phí đăng tin: 50,000đ\nSố dư hiện tại: ${currentBalance.toLocaleString('vi-VN')} đ\nSau khi trừ phí: ${remaining.toLocaleString('vi-VN')} đ`,
        [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Chấp nhận',
            onPress: async () => {
              try {
                await payPostingFee(data.roomId);
                setPostingPaid(true);
                await submitAndReturn();
              } catch (err) {
                const msg = err?.response?.data?.message || err?.message || 'Thanh toán thất bại';
                Alert.alert('Lỗi', msg);
              }
            },
          },
        ]
      );
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'Không thể thanh toán/gửi duyệt tin';
      Alert.alert('Lỗi', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>3. Đặt ghim bản đồ & gửi duyệt</Text>
      <Text style={styles.subtitle}>
        Nhấn giữ trên bản đồ để đặt ghim tại vị trí chính xác nhất. Ưu tiên ghim ngay trước cửa toà nhà.
      </Text>

      <View style={styles.mapWrapper}>
        <MapView style={styles.map} initialRegion={currentRegion} onLongPress={(event) => setSelectedCoord(event.nativeEvent.coordinate)}>
          <UrlTile urlTemplate={MAPTILER_TILE_URL} maximumZ={19} flipY={false} />
          {selectedCoord && <Marker coordinate={selectedCoord} title="Vị trí phòng" description={address || data.address} />}
        </MapView>
        {!selectedCoord && <Text style={styles.mapHint}>Nhấn giữ 2 giây vào điểm bất kỳ để đặt ghim.</Text>}
      </View>

      <Input label="Địa chỉ hiển thị" value={address} onChangeText={setAddress} placeholder="Ví dụ: 12/5 Nguyễn Văn Bảo, Gò Vấp" />

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Tóm tắt tin đăng</Text>
        <InfoRow label="Loại" value={data.type || 'Chưa chọn'} />
        <InfoRow label="Tiêu đề" value={data.title || 'Chưa có'} />
        <InfoRow label="Giá" value={data.price ? `${data.price} VND/tháng` : 'Chưa có'} />
        <InfoRow label="Diện tích" value={data.area ? `${data.area} m²` : 'Chưa có'} />
        <InfoRow label="Ảnh" value={`${data.images.length} ảnh`} />
      </View>

      <View style={styles.actions}>
        <Button title="Quay lại" variant="ghost" onPress={onBack} style={styles.flexButton} />
        <Button title="Lưu vị trí" variant="outline" onPress={handleSaveLocation} loading={savingLocation} style={styles.flexButton} />
        {needsPayment ? (
          <Button
            title="Thanh toán & gửi duyệt"
            onPress={handlePayAndSubmit}
            loading={submitting}
            style={styles.flexButton}
          />
        ) : (
          <Button title="Hoàn thành" onPress={handleSubmit} loading={submitting} style={styles.flexButton} />
        )}
      </View>
    </ScrollView>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
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
  mapWrapper: {
    borderRadius: spacing.borderRadius,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  map: {
    width: '100%',
    height: 280,
  },
  mapHint: {
    padding: spacing.sm,
    textAlign: 'center',
    color: colors.textSecondary,
    backgroundColor: colors.surface,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.lg,
  },
  summaryTitle: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.semiBold,
    marginBottom: spacing.sm,
    color: colors.text,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  infoLabel: {
    color: colors.textSecondary,
  },
  infoValue: {
    color: colors.text,
    fontWeight: fonts.weights.medium,
    textAlign: 'right',
    flex: 1,
    marginLeft: spacing.sm,
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
