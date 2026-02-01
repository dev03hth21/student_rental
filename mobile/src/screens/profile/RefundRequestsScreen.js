import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing, fonts } from '../../constants';
import { studentProfileMock } from '../../data/profileMock';

const STATUS_COLORS = {
  'Chờ duyệt chủ nhà': colors.warning,
  'Đang xử lý admin': colors.info,
  'Đã hoàn tiền': colors.secondary,
};

export default function RefundRequestsScreen() {
  const refunds = studentProfileMock.refunds;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Yêu cầu hoàn cọc</Text>
      <Text style={styles.subtitle}>Theo dõi tiến độ xử lý cọc và biên bản bàn giao.</Text>
      {refunds.map((refund) => (
        <View key={refund.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.room}>{refund.room.title}</Text>
              <Text style={styles.address}>{refund.room.address}</Text>
            </View>
            <Text style={[styles.status, { color: STATUS_COLORS[refund.status] || colors.text }]}>
              {refund.status}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Số tiền đề nghị:</Text>
            <Text style={styles.metaValue}>{refund.amount}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Ngày gửi:</Text>
            <Text style={styles.metaValue}>{refund.createdAt}</Text>
          </View>
          <Text style={styles.placeholder}>Timeline trao đổi & upload chứng cứ sẽ xuất hiện ở đây.</Text>
        </View>
      ))}
      <Text style={styles.note}>
        * Sẽ bổ sung quy trình phê duyệt 3 bước (student → owner → admin) và thông báo realtime.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.screenPadding },
  title: { fontSize: fonts.sizes.title, fontWeight: fonts.weights.bold, marginBottom: spacing.lg },
  subtitle: { color: colors.textSecondary, marginBottom: spacing.lg },
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
  address: { color: colors.textSecondary },
  status: { fontWeight: fonts.weights.semiBold },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: spacing.xs,
  },
  metaLabel: { color: colors.textSecondary },
  metaValue: { color: colors.text, fontWeight: fonts.weights.medium },
  placeholder: {
    marginTop: spacing.md,
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
