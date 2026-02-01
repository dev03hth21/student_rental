import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Button, Input } from '../../components';
import Logo from '../../components/Logo';
import { colors, spacing, fonts } from '../../constants';
import { forgotPassword } from '../../services/auth';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendCode = () => {
    if (!email) {
      Alert.alert('Thiếu email', 'Vui lòng nhập email đăng ký.');
      return;
    }

    setLoading(true);
    forgotPassword(email)
      .then(() => {
        setCodeSent(true);
        Alert.alert('Đã gửi yêu cầu', 'Mã 6 số đã được gửi nếu email tồn tại.');
      })
      .catch((err) => {
        console.error('Forgot password error', err);
        const msg = err.response?.data?.message || 'Không thể gửi yêu cầu, vui lòng thử lại.';
        Alert.alert('Lỗi', msg);
      })
      .finally(() => setLoading(false));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <View style={styles.logoWrap}>
          <Logo size={110} />
        </View>
        <Text style={styles.title}>Khôi phục mật khẩu</Text>
        <Text style={styles.subtitle}>
          Nhập email đã đăng ký. Hệ thống sẽ gửi mã 6 số nếu email hợp lệ.
        </Text>

        <Input
          label="Email đăng ký"
          placeholder="ví dụ: banhocsinh@school.edu"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        {codeSent && (
          <Input
            label="Nhập mã 6 số từ email"
            placeholder="123456"
            keyboardType="number-pad"
            value={otp}
            onChangeText={(text) => setOtp(text.replace(/\D/g, '').slice(0, 6))}
          />
        )}

        {codeSent && (
          <Button
            title="Tiếp tục đặt mật khẩu"
            onPress={() => {
              if (otp.length !== 6) {
                Alert.alert('Mã không hợp lệ', 'Nhập đủ 6 số để tiếp tục.');
                return;
              }
              navigation.navigate('ResetPasswordCode', { code: otp.trim(), email });
            }}
            style={styles.primaryButton}
            fullWidth
          />
        )}

        <Button
          title={codeSent ? 'Gửi lại mã' : 'Gửi mã đặt lại'}
          onPress={handleSendCode}
          loading={loading}
          disabled={loading}
          style={styles.secondaryButton}
          fullWidth
        />

        <TouchableOpacity style={styles.backLogin} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Quay lại màn hình đăng nhập</Text>
        </TouchableOpacity>

        <View style={styles.hintBox}>
          <Text style={styles.hintTitle}>Gợi ý nhanh</Text>
          <Text style={styles.hintText}>• Kiểm tra hộp thư spam nếu chưa thấy email.</Text>
          <Text style={styles.hintText}>• Nếu mất quyền truy cập email, chọn phương thức số điện thoại.</Text>
          <Text style={styles.hintText}>• Liên hệ hỗ trợ khi cần cập nhật thông tin.</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.screenPadding,
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: spacing.borderRadius,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fonts.sizes.heading,
    fontWeight: fonts.weights.bold,
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  backLogin: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  backText: {
    color: colors.primary,
    fontWeight: fonts.weights.semiBold,
  },
  hintBox: {
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.divider,
    borderStyle: 'dashed',
    borderRadius: spacing.borderRadius,
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  hintTitle: {
    fontWeight: fonts.weights.semiBold,
    marginBottom: spacing.xs,
  },
  hintText: {
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  infoText: {
    marginBottom: spacing.md,
    color: colors.textSecondary,
  },
  primaryButton: {
    marginBottom: spacing.sm,
  },
  secondaryButton: {
    marginTop: spacing.sm,
  },
});
