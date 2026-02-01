import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, spacing, fonts } from '../../constants';
import { studentProfileMock } from '../../data/profileMock';

export default function ContractsScreen() {
  const contracts = studentProfileMock.contracts;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Hợp đồng thuê</Text>
      <Text style={styles.subtitle}>Xem file PDF, tình trạng và mốc gia hạn.</Text>
      {contracts.map((contract) => (
        <View key={contract.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.room}>{contract.room.title}</Text>
              <Text style={styles.address}>{contract.room.address}</Text>
            </View>
            <Text style={[styles.status, contract.status !== 'Đang hiệu lực' && styles.expired]}>
              {contract.status}
            </Text>
          </View>
          <Text style={styles.period}>Từ {contract.start} - đến {contract.end}</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryText}>Xem hợp đồng PDF</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton}>
              <Text style={styles.secondaryText}>Gia hạn</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.placeholder}>Bản ký điện tử & timeline nhắc nhở sẽ đặt tại đây.</Text>
        </View>
      ))}
      <Text style={styles.note}>* Chức năng sẽ kết nối Contract Service để tạo/ký và gửi thông báo.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.screenPadding },
  title: { fontSize: fonts.sizes.title, fontWeight: fonts.weights.bold, marginBottom: spacing.lg },
  subtitle: {
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: spacing.borderRadius,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  room: { fontSize: fonts.sizes.lg, fontWeight: fonts.weights.semiBold },
  address: { color: colors.textSecondary, marginTop: spacing.xs },
  period: { color: colors.textSecondary, marginBottom: spacing.md },
  status: { color: colors.secondary, fontWeight: fonts.weights.semiBold },
  expired: { color: colors.error },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius,
    alignItems: 'center',
  },
  primaryText: { color: colors.white, fontWeight: fonts.weights.semiBold },
  secondaryButton: {
    width: 120,
    borderRadius: spacing.borderRadius,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: { color: colors.primary, fontWeight: fonts.weights.semiBold },
  placeholder: {
    padding: spacing.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.divider,
    borderRadius: spacing.borderRadius,
    color: colors.textLight,
    textAlign: 'center',
  },
  note: { marginTop: spacing.lg, color: colors.textLight, fontStyle: 'italic' },
});
