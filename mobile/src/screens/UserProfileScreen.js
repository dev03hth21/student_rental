import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import ListItem from '../components/ListItem';
import axios from 'axios';

// Mock user
const MOCK_USER = {
  name: 'Nguyễn Văn B',
  avatar: 'https://ui-avatars.com/api/?name=Nguyen+Van+B',
  role: 'student', // hoặc 'host'
};

const BACKEND_URL = 'http://localhost:5000/api';

export default function UserProfileScreen({ navigation }) {
  const [user, setUser] = useState(MOCK_USER);
  const [showModal, setShowModal] = useState(false);

  // const fetchUser = async () => {
  //   const res = await axios.get(`${BACKEND_URL}/users/me`);
  //   setUser(res.data.data);
  // };

  const handleLogout = () => {
    // Xoá token, chuyển về màn hình đăng nhập
    Alert.alert('Đăng xuất', 'Bạn đã đăng xuất!');
  };

  const handleDeleteAccount = async () => {
    setShowModal(false);
    // await axios.delete(`${BACKEND_URL}/users/me`);
    Alert.alert('Đã gửi yêu cầu xoá tài khoản!');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        <Text style={styles.name}>{user.name}</Text>
        {user.role === 'host' && (
          <TouchableOpacity style={styles.hostBtn} onPress={() => navigation.navigate('HostDashboardScreen')}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Chuyển sang đăng tin</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.list}>
        <ListItem icon="help-circle" label="Câu hỏi thường gặp" onPress={() => {}} />
        <ListItem icon="bug" label="Góp ý báo lỗi" onPress={() => {}} />
        <ListItem icon="information-circle" label="Về chúng tôi" onPress={() => {}} />
        <ListItem icon="document-text" label="Điều khoản thỏa thuận" onPress={() => {}} />
        <ListItem icon="shield-checkmark" label="Chính sách bảo mật" onPress={() => {}} />
        <ListItem icon="notifications" label="Cài đặt thông báo" onPress={() => {}} />
        <ListItem icon="trash" label="Yêu cầu xoá tài khoản" color="#e74c3c" onPress={() => setShowModal(true)} />
        <ListItem icon="log-out" label="Đăng xuất" color="#e74c3c" onPress={handleLogout} />
      </View>
      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalBox}>
            <Text style={{ fontSize: 17, fontWeight: 'bold', marginBottom: 12 }}>Xác nhận xoá tài khoản?</Text>
            <Text style={{ color: '#636e72', marginBottom: 18 }}>Bạn sẽ mất toàn bộ dữ liệu và không thể khôi phục.</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <TouchableOpacity onPress={() => setShowModal(false)} style={styles.modalBtn}>
                <Text style={{ color: '#636e72' }}>Huỷ</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDeleteAccount} style={[styles.modalBtn, { backgroundColor: '#e74c3c' }] }>
                <Text style={{ color: '#fff' }}>Xoá</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa' },
  header: { alignItems: 'center', paddingVertical: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 10 },
  name: { fontWeight: 'bold', fontSize: 20, color: '#2d3436', marginBottom: 8 },
  hostBtn: { backgroundColor: '#0984e3', borderRadius: 16, paddingHorizontal: 18, paddingVertical: 8, marginTop: 6 },
  list: { backgroundColor: '#fff', borderRadius: 16, marginHorizontal: 16, padding: 8, elevation: 2 },
  modalBg: { flex: 1, backgroundColor: '#0006', justifyContent: 'center', alignItems: 'center' },
  modalBox: { backgroundColor: '#fff', borderRadius: 16, padding: 24, width: 300 },
  modalBtn: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 8, marginLeft: 10 },
});
