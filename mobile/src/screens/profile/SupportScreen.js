import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Linking } from 'react-native';
import { colors, spacing, fonts } from '../../constants';

export default function SupportScreen() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const hotline = '19001234';
  const email = 'support@studentrent.com';
  const zalo = 'https://zalo.me/0123456789';

  const handleEmail = () => {
    const encodedSubject = encodeURIComponent(subject || 'Hỗ trợ / Phản hồi');
    const encodedBody = encodeURIComponent(message || 'Mô tả vấn đề của bạn...');
    const url = `mailto:${email}?subject=${encodedSubject}&body=${encodedBody}`;
    Linking.openURL(url).catch(() => Alert.alert('Lỗi', 'Không thể mở ứng dụng email.'));
  };

  const handleHotline = () => {
    const url = `tel:${hotline}`;
    Linking.openURL(url).catch(() => Alert.alert('Lỗi', 'Không thể gọi số hotline.'));
  };

  const handleZalo = () => {
    Linking.openURL(zalo).catch(() => Alert.alert('Lỗi', 'Không thể mở Zalo.'));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hỗ trợ & Phản hồi</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Gửi email nhanh</Text>
        <TextInput
          style={styles.input}
          placeholder="Tiêu đề"
          value={subject}
          onChangeText={setSubject}
        />
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Mô tả vấn đề hoặc góp ý..."
          value={message}
          onChangeText={setMessage}
          multiline
        />
        <TouchableOpacity style={styles.primaryButton} onPress={handleEmail}>
          <Text style={styles.primaryText}>Gửi phản hồi</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Liên hệ trực tiếp</Text>
        <TouchableOpacity style={styles.rowButton} onPress={handleHotline}>
          <Text style={styles.rowText}>📞 Gọi hotline ({hotline})</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.rowButton} onPress={handleZalo}>
          <Text style={styles.rowText}>💬 Chat Zalo CSKH</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>FAQ phổ biến</Text>
        <Text style={styles.text}>• Cách đặt phòng và đặt cọc online</Text>
        <Text style={styles.text}>• Xử lý tranh chấp và hoàn cọc</Text>
        <Text style={styles.text}>• Hướng dẫn chủ trọ đăng phòng</Text>
        <Text style={styles.placeholder}>Sẽ đồng bộ bài viết từ Help Center backend.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.screenPadding, backgroundColor: colors.background },
  title: { fontSize: fonts.sizes.title, fontWeight: fonts.weights.bold, marginBottom: spacing.lg },
  card: {
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadius,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  cardTitle: { fontWeight: fonts.weights.semiBold, marginBottom: spacing.sm, color: colors.text },
  text: { fontSize: fonts.sizes.md, color: colors.text, marginBottom: spacing.xs },
  placeholder: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    borderWidth: 1,
    borderRadius: spacing.borderRadius,
    borderColor: colors.divider,
    borderStyle: 'dashed',
    color: colors.textLight,
    fontStyle: 'italic',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.borderRadius,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
    color: colors.text,
    backgroundColor: colors.white,
  },
  textarea: { minHeight: 120, textAlignVertical: 'top' },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: spacing.borderRadius,
    alignItems: 'center',
  },
  primaryText: { color: colors.white, fontWeight: fonts.weights.semiBold },
  rowButton: {
    paddingVertical: spacing.sm,
  },
  rowText: { color: colors.primary, fontWeight: fonts.weights.semiBold },
});
