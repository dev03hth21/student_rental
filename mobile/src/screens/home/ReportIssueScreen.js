import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Button, Input } from '../../components';
import { colors, spacing, fonts } from '../../constants';
import { createReport } from '../../api/reports';

const REASONS = [
  'Thông tin sai lệch',
  'Giá thuê không đúng',
  'Có dấu hiệu lừa đảo',
  'Phòng đã cho thuê nhưng vẫn đăng',
  'Khác',
];

export default function ReportIssueScreen({ route, navigation }) {
  const room = route?.params?.room || {
    title: 'Phòng trọ',
    owner: '',
    _id: route?.params?.roomId,
  };
  const [reason, setReason] = useState(REASONS[0]);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [attachment, setAttachment] = useState(null);

  const pickAttachment = async () => {
    const imagesMediaType = ImagePicker.MediaType?.Images ?? ImagePicker.MediaTypeOptions.Images;
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Cần quyền truy cập', 'Vui lòng cấp quyền truy cập thư viện ảnh để đính kèm minh chứng.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: imagesMediaType,
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.length) {
      const asset = result.assets[0];
      setAttachment({
        uri: asset.uri,
        fileName: asset.fileName || asset.name,
        mimeType: asset.mimeType || asset.type,
      });
    }
  };

  const handleSubmit = async () => {
    const roomIdToSend = room?._id || room?.id || route?.params?.roomId;
    if (!roomIdToSend) {
      Alert.alert('Thiếu thông tin', 'Không xác định được phòng để báo cáo.');
      return;
    }
    const fullReason = description?.trim()
      ? `${reason}: ${description.trim()}`
      : reason;

    setLoading(true);
    try {
      await createReport({ roomId: roomIdToSend, reason: fullReason, attachment });
      Alert.alert('Đã gửi', 'Báo cáo của bạn đã được ghi nhận. Chúng tôi sẽ xử lý trong 1-2 ngày.', [
        {
          text: 'Đóng',
          onPress: () => navigation?.goBack?.(),
        },
      ]);
    } catch (error) {
      console.error('Report failed', error);
      const message = error?.response?.data?.message || 'Gửi báo cáo thất bại. Vui lòng thử lại.';
      Alert.alert('Lỗi', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: spacing.xl }}>
      <View style={styles.headerCard}>
        <Text style={styles.label}>Báo cáo phòng</Text>
        <Text style={styles.roomTitle}>{room.title}</Text>
        <Text style={styles.meta}>Chủ phòng: {room.owner}</Text>
        <Text style={styles.hint}>Vui lòng mô tả chi tiết để đội ngũ duyệt tin xử lý nhanh.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nguyên nhân</Text>
        {REASONS.map((item) => (
          <TouchableOpacity
            key={item}
            style={[styles.reasonRow, reason === item && styles.reasonRowActive]}
            onPress={() => setReason(item)}
          >
            <Text style={styles.reasonText}>{item}</Text>
            <Text style={styles.reasonMarker}>{reason === item ? '●' : '○'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Input
          label="Mô tả chi tiết"
          placeholder="Ví dụ: Chủ phòng yêu cầu thêm phí không thông báo trong tin đăng..."
          multiline
          value={description}
          onChangeText={setDescription}
        />
        <View style={styles.attachmentBox}>
          <Text style={styles.attachmentTitle}>Đính kèm minh chứng</Text>
          <Text style={styles.attachmentText}>
            Thêm ảnh chụp hóa đơn, tin nhắn, hoặc hình ảnh liên quan. Không bắt buộc nhưng giúp xử lý nhanh hơn.
          </Text>
          {attachment ? (
            <View style={styles.previewRow}>
              <Image source={{ uri: attachment.uri }} style={styles.previewImage} />
              <View style={{ flex: 1 }}>
                <Text numberOfLines={2} style={styles.fileName}>
                  {attachment.fileName || 'Hình ảnh minh chứng'}
                </Text>
                <TouchableOpacity onPress={() => setAttachment(null)}>
                  <Text style={styles.removeText}>Gỡ đính kèm</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
          <Button
            title={attachment ? 'Đổi ảnh khác' : 'Chọn ảnh minh chứng'}
            variant="outline"
            onPress={pickAttachment}
            style={styles.attachmentButton}
          />
        </View>
      </View>

      <Button title={loading ? 'Đang gửi...' : 'Gửi báo cáo'} fullWidth onPress={handleSubmit} disabled={loading} />
      <Text style={styles.notice}>
        * Thời gian phản hồi dự kiến 1-2 ngày làm việc. Bạn có thể theo dõi trạng thái trong mục Hỗ trợ & phản hồi.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.screenPadding,
    backgroundColor: colors.background,
  },
  headerCard: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: spacing.borderRadius,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  label: {
    color: colors.textLight,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  roomTitle: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.semiBold,
  },
  meta: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  hint: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.semiBold,
    marginBottom: spacing.sm,
  },
  reasonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.borderRadius,
    padding: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.white,
  },
  reasonRowActive: {
    borderColor: colors.primary,
  },
  reasonText: {
    flex: 1,
    marginRight: spacing.sm,
    color: colors.text,
  },
  reasonMarker: {
    color: colors.primary,
    fontWeight: fonts.weights.bold,
  },
  attachmentBox: {
    marginTop: spacing.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: spacing.borderRadius,
    borderColor: colors.divider,
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  attachmentTitle: {
    fontWeight: fonts.weights.medium,
    marginBottom: spacing.xs,
  },
  attachmentText: {
    color: colors.textSecondary,
  },
  attachmentButton: {
    marginTop: spacing.sm,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  previewImage: {
    width: 64,
    height: 64,
    borderRadius: spacing.xs,
    marginRight: spacing.sm,
    backgroundColor: colors.border,
  },
  fileName: {
    fontWeight: fonts.weights.medium,
    color: colors.text,
  },
  removeText: {
    marginTop: spacing.xs,
    color: colors.danger || '#d9534f',
  },
  notice: {
    marginTop: spacing.md,
    color: colors.textLight,
    fontStyle: 'italic',
  },
});
