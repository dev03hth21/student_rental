import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing, fonts } from '../../constants';
import { ownerHubMock } from '../../data/profileMock';

export default function OwnerDisputesScreen() {
  const disputes = ownerHubMock.disputes;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Trung tâm tranh chấp</Text>
      <Text style={styles.subtitle}>Ghi nhận tình trạng xử lý giữa sinh viên, chủ trọ và admin.</Text>
      {disputes.map((dispute) => (
        <View key={dispute.id} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.tenant}>{dispute.tenant}</Text>
            <Text style={[styles.status, dispute.status === 'Đã giải quyết' && styles.resolved]}>
              {dispute.status}
            </Text>
          </View>
          <Text style={styles.topic}>Chủ đề: {dispute.topic}</Text>
          <Text style={styles.detail}>Cập nhật cuối: {dispute.lastUpdate}</Text>
          <Text style={styles.placeholder}>Timeline trao đổi & upload chứng cứ sẽ xuất hiện ở đây.</Text>
        </View>
      ))}
      <Text style={styles.note}>* Kế hoạch: đồng bộ với đội ngũ admin, chat realtime và ký biên bản trực tuyến.</Text>
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
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  tenant: { fontSize: fonts.sizes.lg, fontWeight: fonts.weights.semiBold },
  status: { color: colors.warning, fontWeight: fonts.weights.semiBold },
  resolved: { color: colors.success },
  topic: { color: colors.text, marginBottom: spacing.xs },
  detail: { color: colors.textSecondary, marginBottom: spacing.sm },
  placeholder: {
    padding: spacing.sm,
    borderWidth: 1,
    borderRadius: spacing.borderRadius,
    borderColor: colors.divider,
    borderStyle: 'dashed',
    color: colors.textLight,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  note: { marginTop: spacing.lg, color: colors.textLight, fontStyle: 'italic' },
});
