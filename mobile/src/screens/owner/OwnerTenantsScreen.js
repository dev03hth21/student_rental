import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing, fonts } from '../../constants';
import { ownerHubMock } from '../../data/profileMock';

export default function OwnerTenantsScreen() {
  const tenants = ownerHubMock.tenants;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Người thuê & hợp đồng</Text>
      <Text style={styles.subtitle}>Theo dõi ngày hết hạn và tình trạng thanh toán.</Text>
      {tenants.map((tenant) => (
        <View key={tenant.id} style={styles.card}>
          <Text style={styles.name}>{tenant.name}</Text>
          <Text style={styles.detail}>{tenant.room}</Text>
          <Text style={styles.detail}>Hết hạn: {tenant.contractEnd}</Text>
          <Text style={[styles.status, tenant.status !== 'Đang ở' && styles.alert]}>
            {tenant.status}
          </Text>
        </View>
      ))}
      <Text style={styles.note}>* Sẽ bổ sung bộ lọc trạng thái và gửi nhắc gia hạn tự động.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.screenPadding },
  title: { fontSize: fonts.sizes.title, fontWeight: fonts.weights.bold, marginBottom: spacing.xs },
  subtitle: { color: colors.textSecondary, marginBottom: spacing.lg },
  card: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: spacing.borderRadius,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  name: { fontSize: fonts.sizes.lg, fontWeight: fonts.weights.semiBold, marginBottom: spacing.xs },
  detail: { color: colors.textSecondary, marginBottom: spacing.xs },
  status: { color: colors.success, fontWeight: fonts.weights.semiBold },
  alert: { color: colors.warning },
  note: { marginTop: spacing.lg, color: colors.textLight, fontStyle: 'italic' },
});
