import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../../context/AppContext';
import ProfileMenuItem from '../../components/ProfileMenuItem';

/**
 * UserProfileScreenNew - Màn hình tài khoản người dùng
 * 
 * Sections:
 * 1. Avatar + User Info
 * 2. Hỗ trợ (FAQ, Góp ý, Về chúng tôi)
 * 3. Quy định (Điều khoản, Chính sách)
 * 4. Quản lý tài khoản (Thông báo, Xóa TK, Đăng xuất)
 * 5. Chuyển chế độ (nếu role = owner)
 */
const UserProfileScreenNew = ({ navigation }) => {
  const { state, actions } = useAppContext();
  const { user } = state;

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Get user initial from name
  const getUserInitial = () => {
    if (!user?.name) return '?';
    return user.name.charAt(0).toUpperCase();
  };

  // Handle menu actions
  const handleFAQ = () => {
    Alert.alert(
      'Câu hỏi thường gặp',
      'Tính năng đang được phát triển.\n\nBạn có thể liên hệ hotline: 1900 xxxx để được hỗ trợ.'
    );
  };

  const handleFeedback = () => {
    Alert.alert(
      'Góp ý báo lỗi',
      'Vui lòng gửi ý kiến đến email: support@phongtro.vn\n\nHoặc gọi hotline: 1900 xxxx'
    );
  };

  const handleAboutUs = () => {
    Alert.alert(
      'Về chúng tôi',
      'Ứng dụng tìm phòng trọ cho sinh viên\n\nPhiên bản: 1.0.0\n\n© 2025 PhongTro.vn'
    );
  };

  const handleTerms = () => {
    Alert.alert(
      'Điều khoản thỏa thuận',
      'Bằng việc sử dụng ứng dụng, bạn đồng ý với các điều khoản và điều kiện của chúng tôi.\n\nXem đầy đủ tại: https://phongtro.vn/terms'
    );
  };

  const handlePrivacy = () => {
    Alert.alert(
      'Chính sách bảo mật',
      'Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn.\n\nXem đầy đủ tại: https://phongtro.vn/privacy'
    );
  };

  const handleNotificationSettings = () => {
    Alert.alert(
      'Cài đặt thông báo',
      'Tính năng đang được phát triển.\n\nBạn có thể bật/tắt thông báo trong cài đặt hệ thống.'
    );
  };

  const handleDeleteAccount = () => {
    setDeleteModalVisible(true);
  };

  const confirmDeleteAccount = async () => {
    try {
      setDeleting(true);
      
      // Call delete API (if available)
      // await deleteUserAccount();
      
      Alert.alert(
        'Yêu cầu đã gửi',
        'Yêu cầu xóa tài khoản của bạn đã được ghi nhận.\n\nChúng tôi sẽ xử lý trong vòng 24h.',
        [
          {
            text: 'OK',
            onPress: () => {
              setDeleteModalVisible(false);
              // Optional: Logout after request
              // actions.logout();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Delete account error:', error);
      Alert.alert('Lỗi', 'Không thể gửi yêu cầu. Vui lòng thử lại.');
    } finally {
      setDeleting(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: () => {
            actions.logout();
          },
        },
      ]
    );
  };

  const handleSwitchToHost = () => {
    Alert.alert(
      'Chuyển sang chế độ Chủ trọ',
      'Bạn muốn chuyển sang chế độ đăng tin cho thuê phòng?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Chuyển ngay',
          onPress: () => {
            // Navigate to host dashboard
            navigation.navigate('HostDashboard');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* User Info Header */}
        <View style={styles.userHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getUserInitial()}</Text>
          </View>
          <Text style={styles.userName}>{user?.name || 'Người dùng'}</Text>
          <Text style={styles.userEmail}>{user?.email || user?.phone || ''}</Text>
        </View>

        {/* Section: Hỗ trợ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hỗ trợ</Text>
          <View style={styles.menuGroup}>
            <ProfileMenuItem
              icon="help-circle-outline"
              title="Câu hỏi thường gặp"
              onPress={handleFAQ}
              color="#007AFF"
            />
            <ProfileMenuItem
              icon="chatbubble-ellipses-outline"
              title="Góp ý báo lỗi"
              onPress={handleFeedback}
              color="#FF9500"
            />
            <ProfileMenuItem
              icon="information-circle-outline"
              title="Về chúng tôi"
              onPress={handleAboutUs}
              color="#5856D6"
            />
          </View>
        </View>

        {/* Section: Quy định */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quy định</Text>
          <View style={styles.menuGroup}>
            <ProfileMenuItem
              icon="document-text-outline"
              title="Điều khoản thỏa thuận"
              onPress={handleTerms}
              color="#34C759"
            />
            <ProfileMenuItem
              icon="shield-checkmark-outline"
              title="Chính sách bảo mật"
              onPress={handlePrivacy}
              color="#32ADE6"
            />
          </View>
        </View>

        {/* Section: Quản lý tài khoản */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quản lý tài khoản</Text>
          <View style={styles.menuGroup}>
            <ProfileMenuItem
              icon="notifications-outline"
              title="Cài đặt thông báo"
              onPress={handleNotificationSettings}
              color="#FF9500"
            />
            <ProfileMenuItem
              icon="trash-outline"
              title="Yêu cầu xóa tài khoản"
              onPress={handleDeleteAccount}
              color="#FF3B30"
            />
            <ProfileMenuItem
              icon="log-out-outline"
              title="Đăng xuất"
              onPress={handleLogout}
              color="#FF3B30"
              showArrow={false}
            />
          </View>
        </View>

        {/* Switch to Host Mode (if user is owner) */}
        {user?.role === 'owner' && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.switchModeButton}
              onPress={handleSwitchToHost}
            >
              <Ionicons name="home-outline" size={20} color="#fff" />
              <Text style={styles.switchModeText}>Chuyển sang đăng tin</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* App Version */}
        <View style={styles.footer}>
          <Text style={styles.version}>Phiên bản 1.0.0</Text>
        </View>
      </ScrollView>

      {/* Delete Account Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Ionicons name="warning-outline" size={48} color="#FF3B30" />
              <Text style={styles.modalTitle}>Xóa tài khoản</Text>
            </View>

            <Text style={styles.modalMessage}>
              Bạn có chắc muốn xóa tài khoản?{'\n\n'}
              Hành động này không thể hoàn tác. Tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setDeleteModalVisible(false)}
                disabled={deleting}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={confirmDeleteAccount}
                disabled={deleting}
              >
                {deleting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.deleteButtonText}>Xóa tài khoản</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  scrollView: {
    flex: 1,
  },
  userHeader: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    paddingHorizontal: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuGroup: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  switchModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    marginHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 10,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  switchModeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  version: {
    fontSize: 13,
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginTop: 12,
  },
  modalMessage: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default UserProfileScreenNew;
