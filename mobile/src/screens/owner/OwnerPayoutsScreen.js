import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
} from 'react-native';
import { colors, spacing, fonts } from '../../constants';
import { getWalletBalance, topUpWallet, getTransactions } from '../../api/wallet';

const TOPUP_PRESETS = [50000, 100000, 200000, 500000];

const formatCurrency = (amount) => {
  return Math.abs(amount).toLocaleString('vi-VN') + ' đ';
};

const formatDate = (dateString) => {
  if (!dateString) return '---';
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes} ${day}/${month}/${year}`;
};

const getTransactionIcon = (type) => {
  switch (type) {
    case 'topup':
      return '💳';
    case 'posting_fee':
      return '📝';
    case 'refund':
      return '↩️';
    default:
      return '💰';
  }
};

const getTransactionLabel = (type) => {
  switch (type) {
    case 'topup':
      return 'Nạp tiền';
    case 'posting_fee':
      return 'Phí đăng tin';
    case 'refund':
      return 'Hoàn tiền';
    default:
      return 'Giao dịch';
  }
};

export default function OwnerPayoutsScreen() {
  const [balance, setBalance] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [topUpLoading, setTopUpLoading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [balanceData, transData] = await Promise.all([
        getWalletBalance(),
        getTransactions(),
      ]);
      setBalance(balanceData.balance || 0);
      setTransactions(transData.transactions || []);
    } catch (error) {
      console.error('Error loading finance data:', error);
    } finally {
      setBalanceLoading(false);
      setTransactionsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleTopUp = async () => {
    const amount = parseInt(topUpAmount.replace(/[^\d]/g, ''), 10);
    if (!amount || amount < 10000) {
      Alert.alert('Lỗi', 'Số tiền nạp tối thiểu là 10,000 VND');
      return;
    }
    if (amount > 10000000) {
      Alert.alert('Lỗi', 'Số tiền nạp tối đa là 10,000,000 VND');
      return;
    }

    setTopUpLoading(true);
    try {
      const result = await topUpWallet(amount);
      setBalance(result.balance);
      setShowTopUpModal(false);
      setTopUpAmount('');
      Alert.alert('Thành công', `Đã nạp ${amount.toLocaleString('vi-VN')} VND vào tài khoản.`);
      loadData();
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể nạp tiền';
      Alert.alert('Lỗi', message);
    } finally {
      setTopUpLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>SỐ DƯ TÀI KHOẢN</Text>
        {balanceLoading ? (
          <ActivityIndicator color={colors.white} style={{ marginVertical: spacing.md }} />
        ) : (
          <Text style={styles.balanceValue}>{formatCurrency(balance)}</Text>
        )}
        <Text style={styles.balanceHint}>Dùng để đăng tin, đẩy tin, gia hạn</Text>
        <TouchableOpacity style={styles.topUpButton} onPress={() => setShowTopUpModal(true)}>
          <Text style={styles.topUpButtonText}>+ Nạp tiền</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>📊</Text>
          <Text style={styles.statValue}>{transactions.length}</Text>
          <Text style={styles.statLabel}>Giao dịch</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>💳</Text>
          <Text style={styles.statValue}>
            {transactions.filter((t) => t.type === 'topup').length}
          </Text>
          <Text style={styles.statLabel}>Lần nạp</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>📝</Text>
          <Text style={styles.statValue}>
            {transactions.filter((t) => t.type === 'posting_fee').length}
          </Text>
          <Text style={styles.statLabel}>Đăng tin</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lịch sử giao dịch</Text>
        
        {transactionsLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.lg }} />
        ) : transactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>Chưa có giao dịch nào</Text>
            <Text style={styles.emptyHint}>Nạp tiền để bắt đầu đăng tin</Text>
          </View>
        ) : (
          transactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionCard}>
              <View style={styles.transactionIcon}>
                <Text style={styles.transactionIconText}>
                  {getTransactionIcon(transaction.type)}
                </Text>
              </View>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionType}>
                  {getTransactionLabel(transaction.type)}
                </Text>
                <Text style={styles.transactionDesc}>
                  {transaction.description}
                  {transaction.roomTitle ? ` - ${transaction.roomTitle}` : ''}
                </Text>
                <Text style={styles.transactionDate}>{formatDate(transaction.createdAt)}</Text>
              </View>
              <View style={styles.transactionAmount}>
                <Text
                  style={[
                    styles.amountText,
                    transaction.amount > 0 ? styles.amountPositive : styles.amountNegative,
                  ]}
                >
                  {transaction.amount > 0 ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </Text>
                <Text style={styles.balanceAfterText}>
                  Còn: {formatCurrency(transaction.balanceAfter)}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      <Modal
        visible={showTopUpModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTopUpModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nạp tiền vào tài khoản</Text>

            <View style={styles.currentBalanceBox}>
              <Text style={styles.currentBalanceLabel}>Số dư hiện tại</Text>
              <Text style={styles.currentBalanceValue}>{formatCurrency(balance)}</Text>
            </View>

            <Text style={styles.inputLabel}>Chọn mệnh giá</Text>
            <View style={styles.presetGrid}>
              {TOPUP_PRESETS.map((preset) => (
                <TouchableOpacity
                  key={preset}
                  style={[
                    styles.presetButton,
                    topUpAmount === String(preset) && styles.presetButtonActive,
                  ]}
                  onPress={() => setTopUpAmount(String(preset))}
                >
                  <Text
                    style={[
                      styles.presetButtonText,
                      topUpAmount === String(preset) && styles.presetButtonTextActive,
                    ]}
                  >
                    {preset.toLocaleString('vi-VN')}đ
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Hoặc nhập số tiền khác</Text>
            <TextInput
              style={styles.amountInput}
              value={topUpAmount}
              onChangeText={setTopUpAmount}
              placeholder="Nhập số tiền (VND)"
              keyboardType="numeric"
            />
            <Text style={styles.inputHint}>Tối thiểu 10,000 VND - Tối đa 10,000,000 VND</Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelModalButton}
                onPress={() => {
                  setShowTopUpModal(false);
                  setTopUpAmount('');
                }}
              >
                <Text style={styles.cancelModalButtonText}>Huỷ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, topUpLoading && styles.confirmButtonDisabled]}
                onPress={handleTopUp}
                disabled={topUpLoading}
              >
                {topUpLoading ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <Text style={styles.confirmButtonText}>Xác nhận nạp tiền</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.screenPadding, paddingBottom: spacing.xl * 2 },
  balanceCard: {
    backgroundColor: colors.primary,
    borderRadius: spacing.borderRadius * 2,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: fonts.sizes.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  balanceValue: {
    color: colors.white,
    fontSize: 36,
    fontWeight: fonts.weights.bold,
    marginVertical: spacing.sm,
  },
  balanceHint: { color: 'rgba(255,255,255,0.7)', fontSize: fonts.sizes.sm, marginBottom: spacing.md },
  topUpButton: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius,
  },
  topUpButtonText: { color: colors.primary, fontWeight: fonts.weights.bold, fontSize: fonts.sizes.md },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadius,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statIcon: { fontSize: 24, marginBottom: spacing.xs },
  statValue: { fontSize: fonts.sizes.lg, fontWeight: fonts.weights.bold, color: colors.text },
  statLabel: { fontSize: fonts.sizes.xs, color: colors.textSecondary, marginTop: spacing.xs / 2 },
  section: {
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadius,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: { fontSize: fonts.sizes.lg, fontWeight: fonts.weights.bold, marginBottom: spacing.md, color: colors.text },
  emptyState: { alignItems: 'center', paddingVertical: spacing.xl },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyText: { fontSize: fonts.sizes.md, color: colors.textSecondary, fontWeight: fonts.weights.medium },
  emptyHint: { fontSize: fonts.sizes.sm, color: colors.textLight, marginTop: spacing.xs },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  transactionIconText: { fontSize: 20 },
  transactionInfo: { flex: 1 },
  transactionType: { fontSize: fonts.sizes.md, fontWeight: fonts.weights.semiBold, color: colors.text },
  transactionDesc: { fontSize: fonts.sizes.sm, color: colors.textSecondary, marginTop: 2 },
  transactionDate: { fontSize: fonts.sizes.xs, color: colors.textLight, marginTop: 2 },
  transactionAmount: { alignItems: 'flex-end' },
  amountText: { fontSize: fonts.sizes.md, fontWeight: fonts.weights.bold },
  amountPositive: { color: '#4CAF50' },
  amountNegative: { color: '#F44336' },
  balanceAfterText: { fontSize: fonts.sizes.xs, color: colors.textLight, marginTop: 2 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadius * 2,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weights.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  currentBalanceBox: {
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  currentBalanceLabel: { color: colors.textSecondary, fontSize: fonts.sizes.sm },
  currentBalanceValue: {
    fontSize: fonts.sizes.heading,
    fontWeight: fonts.weights.bold,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  inputLabel: { fontWeight: fonts.weights.medium, color: colors.text, marginBottom: spacing.sm },
  presetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  presetButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  presetButtonActive: { borderColor: colors.primary, backgroundColor: colors.primary + '20' },
  presetButtonText: { color: colors.text, fontWeight: fonts.weights.medium },
  presetButtonTextActive: { color: colors.primary },
  amountInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.borderRadius,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    fontSize: fonts.sizes.lg,
    textAlign: 'center',
  },
  inputHint: {
    color: colors.textSecondary,
    fontSize: fonts.sizes.sm,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  modalActions: { flexDirection: 'row', gap: spacing.sm },
  cancelModalButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: spacing.borderRadius,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cancelModalButtonText: { color: colors.textSecondary, fontWeight: fonts.weights.medium },
  confirmButton: {
    flex: 2,
    paddingVertical: spacing.md,
    borderRadius: spacing.borderRadius,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  confirmButtonDisabled: { opacity: 0.6 },
  confirmButtonText: { color: colors.white, fontWeight: fonts.weights.semiBold },
});
