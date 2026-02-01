import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function OwnerCard({ owner, onViewOtherRooms }) {
  const initials = owner.name ? owner.name[0].toUpperCase() : '?';
  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{owner.name}</Text>
        <Text style={styles.years}>Hoạt động: {owner.yearsActive} năm</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={onViewOtherRooms}>
        <Text style={styles.buttonText}>Xem tin đăng khác</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#0984e3', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  name: { fontWeight: 'bold', fontSize: 16 },
  years: { color: '#636e72', fontSize: 13 },
  button: { backgroundColor: '#dfe6e9', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  buttonText: { color: '#0984e3', fontWeight: 'bold' },
});
