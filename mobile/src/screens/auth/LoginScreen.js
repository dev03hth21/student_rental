import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Button, Input } from '../../components';
import Logo from '../../components/Logo';
import { colors, spacing, fonts } from '../../constants';
import { useAppContext } from '../../context/AppContext';
import { login as loginApi } from '../../services/auth';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const { actions } = useAppContext();

  const handleLogin = async () => {
    // Validation
    const newErrors = {};
    if (!email) newErrors.email = 'Email không được để trống';
    if (!password) newErrors.password = 'Mật khẩu không được để trống';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setServerError('');
    setLoading(true);

    try {
      const response = await loginApi({ email, password });

      const user = response?.data?.user || response?.user;
      const token = response?.data?.tokens?.accessToken || response?.token;
      const expiresIn = response?.data?.expiresIn || response?.expiresIn;

      if (!user || !token) {
        throw new Error(response?.message || 'Đăng nhập thất bại');
      }

      actions.authenticate({
        user,
        tokens: {
          accessToken: token,
          expiresIn,
        },
      });
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Không thể đăng nhập. Vui lòng thử lại.';
      setServerError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Logo size={140} />
          <Text style={styles.title}>Đăng nhập</Text>
          <Text style={styles.subtitle}>Chào mừng bạn trở lại!</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.roleContainer}>
            <TouchableOpacity
              style={[styles.roleButton, role === 'student' && styles.roleButtonActive]}
              onPress={() => {
                setRole('student');
                setServerError('');
              }}
            >
              <Text style={[styles.roleText, role === 'student' && styles.roleTextActive]}>
                Sinh viên
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleButton, role === 'owner' && styles.roleButtonActive]}
              onPress={() => {
                setRole('owner');
                setServerError('');
              }}
            >
              <Text style={[styles.roleText, role === 'owner' && styles.roleTextActive]}>
                Chủ trọ
              </Text>
            </TouchableOpacity>
          </View>
          <Input
            label="Email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setErrors({ ...errors, email: '' });
              setServerError('');
            }}
            placeholder="Nhập email của bạn"
            keyboardType="email-address"
            error={errors.email}
          />

          <Input
            label="Mật khẩu"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setErrors({ ...errors, password: '' });
              setServerError('');
            }}
            placeholder="Nhập mật khẩu"
            secureTextEntry
            error={errors.password}
          />

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
          </TouchableOpacity>

          <Button
            title="Đăng nhập"
            onPress={handleLogin}
            loading={loading}
            fullWidth
          />
          {serverError ? (
            <Text style={styles.errorText}>{serverError}</Text>
          ) : null}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Chưa có tài khoản? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.linkText}>Đăng ký ngay</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.screenPadding,
  },
  header: {
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: fonts.sizes.title,
    fontWeight: fonts.weights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fonts.sizes.md,
    color: colors.textSecondary,
  },
  form: {
    marginBottom: spacing.lg,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  roleButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.borderRadius,
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  roleButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  roleText: {
    fontSize: fonts.sizes.md,
    color: colors.text,
    fontWeight: fonts.weights.medium,
  },
  roleTextActive: {
    color: colors.white,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
  },
  forgotPasswordText: {
    fontSize: fonts.sizes.sm,
    color: colors.primary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: fonts.sizes.md,
    color: colors.textSecondary,
  },
  linkText: {
    fontSize: fonts.sizes.md,
    color: colors.primary,
    fontWeight: fonts.weights.semiBold,
  },
  errorText: {
    marginTop: spacing.sm,
    color: colors.error,
    textAlign: 'center',
    fontSize: fonts.sizes.sm,
  },
});
