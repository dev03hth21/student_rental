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
import { register as registerApi } from '../../services/auth';
import { useAppContext } from '../../context/AppContext';

export default function RegisterScreen({ navigation }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [role, setRole] = useState('student'); // student or owner
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { actions } = useAppContext();

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: '' });
    setServerError('');
    setSuccessMessage('');
  };

  const handleRegister = async () => {
    // Validation
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Họ tên không được để trống';
    if (!formData.email) newErrors.email = 'Email không được để trống';
    if (!formData.phone) newErrors.phone = 'Số điện thoại không được để trống';
    if (!formData.password) newErrors.password = 'Mật khẩu không được để trống';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setServerError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const response = await registerApi({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: role === 'owner' ? 'owner' : 'student',
      });

      const payload = response?.data || response;
      const user = payload?.user || payload?.data?.user;
      const tokens = payload?.tokens || payload?.data?.tokens;

      if (user && tokens?.accessToken) {
        await actions.authenticate({ user, tokens });
        setSuccessMessage('Đăng ký & đăng nhập thành công');
        setTimeout(() => navigation.navigate('HomeTab'), 800);
      } else {
        setSuccessMessage('Đăng ký thành công. Vui lòng đăng nhập.');
        setTimeout(() => navigation.navigate('Login'), 800);
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Không thể đăng ký. Vui lòng thử lại.';
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
          <Logo size={120} />
          <Text style={styles.title}>Đăng ký</Text>
          <Text style={styles.subtitle}>Tạo tài khoản mới</Text>
        </View>

        {/* Role Selection */}
        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={[styles.roleButton, role === 'student' && styles.roleButtonActive]}
            onPress={() => {
              setRole('student');
              setServerError('');
              setSuccessMessage('');
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
              setSuccessMessage('');
            }}
          >
            <Text style={[styles.roleText, role === 'owner' && styles.roleTextActive]}>
              Chủ trọ
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <Input
            label="Họ và tên"
            value={formData.name}
            onChangeText={(text) => updateField('name', text)}
            placeholder="Nhập họ và tên"
            error={errors.name}
          />

          <Input
            label="Email"
            value={formData.email}
            onChangeText={(text) => updateField('email', text)}
            placeholder="Nhập email"
            keyboardType="email-address"
            error={errors.email}
          />

          <Input
            label="Số điện thoại"
            value={formData.phone}
            onChangeText={(text) => updateField('phone', text)}
            placeholder="Nhập số điện thoại"
            keyboardType="phone-pad"
            error={errors.phone}
          />

          <Input
            label="Mật khẩu"
            value={formData.password}
            onChangeText={(text) => updateField('password', text)}
            placeholder="Nhập mật khẩu"
            secureTextEntry
            error={errors.password}
          />

          <Input
            label="Xác nhận mật khẩu"
            value={formData.confirmPassword}
            onChangeText={(text) => updateField('confirmPassword', text)}
            placeholder="Nhập lại mật khẩu"
            secureTextEntry
            error={errors.confirmPassword}
          />

          <Button
            title="Đăng ký"
            onPress={handleRegister}
            loading={loading}
            fullWidth
          />
          {serverError ? (
            <Text style={styles.errorText}>{serverError}</Text>
          ) : null}
          {successMessage ? (
            <Text style={styles.successText}>{successMessage}</Text>
          ) : null}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Đã có tài khoản? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>Đăng nhập</Text>
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
    padding: spacing.screenPadding,
    paddingTop: spacing.xl,
  },
  header: {
    marginBottom: spacing.lg,
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
  roleContainer: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    gap: spacing.md,
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
    fontWeight: fonts.weights.semiBold,
    color: colors.text,
  },
  roleTextActive: {
    color: colors.white,
  },
  form: {
    marginBottom: spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
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
  successText: {
    marginTop: spacing.xs,
    color: colors.success,
    textAlign: 'center',
    fontSize: fonts.sizes.sm,
  },
});
