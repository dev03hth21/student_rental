import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Button, Input } from '../../components';
import { colors, spacing, fonts } from '../../constants';
import { resetPassword } from '../../services/auth';

export default function ResetPasswordCodeScreen({ navigation, route }) {
  const initialCode = (route.params?.code || '').trim();
  const initialEmail = route.params?.email || '';
  const [code, setCode] = useState(initialCode);
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      Alert.alert('Thiếu email', 'Vui lòng nhập lại email đã yêu cầu mã.');
      return;
    }
    if (code.length !== 6) {
      Alert.alert('Mã không hợp lệ', 'Nhập đủ 6 số mã xác thực.');
      return;
    }
    if (!password || password.length < 6) {
      Alert.alert('Mật khẩu yếu', 'Mật khẩu cần tối thiểu 6 ký tự.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Không khớp', 'Mật khẩu xác nhận không trùng khớp.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ token: code.trim(), password, email });
      Alert.alert('Thành công', 'Mật khẩu đã được đặt lại. Hãy đăng nhập.');
      navigation.navigate('Login');
    } catch (err) {
      console.error('Reset password error', err);
      Alert.alert('Lỗi', err.response?.data?.message || 'Không thể đặt lại mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.card}>
        <Text style={styles.title}>Đổi mật khẩu</Text>
        <Text style={styles.subtitle}>Mã 6 số đã xác thực từ email. Nhập email và đặt mật khẩu mới.</Text>

        <Input
          label="Email đăng ký"
          placeholder="ví dụ: banhocsinh@school.edu"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <Input
          label="Mật khẩu mới"
          placeholder="••••••"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Input
          label="Xác nhận mật khẩu"
          placeholder="••••••"
          secureTextEntry
          value={confirm}
          onChangeText={setConfirm}
        />

        <Button
          title="Đặt lại mật khẩu"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading || code.length !== 6}
          fullWidth
        />
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
});
