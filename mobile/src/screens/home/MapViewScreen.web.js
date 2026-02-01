import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MapViewScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bản đồ không hỗ trợ trên web preview</Text>
      <Text style={styles.subtitle}>Vui lòng chạy trên thiết bị hoặc emulator để xem bản đồ.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
  },
});
