import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors, spacing, fonts } from '../../constants';
import { HostRoomCard, HostSummaryCard, HostSearchBar } from '../../components';
import { hostStatsMock, hostFilters } from '../../data/hostDashboard';

const FILTERED_STATUS = {
  expired: 'Đã hết hạn',
  expiring: 'Sắp hết hạn',
  draft: 'Tin nháp',
};

export default function OwnerRoomsScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState(hostFilters[0].id);

  const summaryCards = [
    {
      label: 'Tin đang chạy',
      value: `${hostStatsMock.summary.totalRooms} tin`,
      caption: `${hostStatsMock.summary.pendingRooms} chờ duyệt`,
      icon: '🔥',
    },
    {
      label: 'Hiệu suất',
      value: '4.7/5',
      caption: 'Theo đánh giá sinh viên',
      icon: '📈',
    },
  ];

  const rooms = hostStatsMock.rooms;

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const matchSearch = room.title.toLowerCase().includes(search.toLowerCase());
      if (filter === 'all') return matchSearch;
      const statusLabel = FILTERED_STATUS[filter];
      return matchSearch && room.status === statusLabel;
    });
  }, [rooms, search, filter]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Quản lý tin đăng</Text>
        <TouchableOpacity onPress={() => navigation?.navigate?.('OwnerCreate')}>
          <Text style={styles.link}>+ Tạo tin mới</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.subtitle}>Theo dõi hạn đăng, giá trị phòng và chất lượng thông tin.</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.summaryRow}>
        {summaryCards.map((card) => (
          <HostSummaryCard key={card.label} {...card} />
        ))}
      </ScrollView>

      <HostSearchBar
        value={search}
        onChange={setSearch}
        placeholder="Tìm theo mã tin, tên phòng, địa chỉ..."
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {hostFilters.map((chip) => (
          <TouchableOpacity
            key={chip.id}
            style={[styles.filterChip, filter === chip.id && styles.filterChipActive]}
            onPress={() => setFilter(chip.id)}
          >
            <Text style={[styles.filterText, filter === chip.id && styles.filterTextActive]}>{chip.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.batchActions}>
        <TouchableOpacity style={styles.batchButton}>
          <Text style={styles.batchText}>Gia hạn nhanh</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.batchButton}>
          <Text style={styles.batchText}>Đẩy top 24h</Text>
        </TouchableOpacity>
      </View>

      {filteredRooms.map((room) => (
        <HostRoomCard
          key={room.id}
          room={room}
          onPrimaryAction={() => navigation?.navigate?.('OwnerCreate', { roomId: room.id })}
          onSecondaryAction={() => {}}
        />
      ))}

      <TouchableOpacity style={styles.fullButton}>
        <Text style={styles.fullButtonText}>Xem lịch sử cập nhật</Text>
      </TouchableOpacity>
      <Text style={styles.note}>
        * Khi backend kết nối, màn hình này sẽ đồng bộ trực tiếp với collection Rooms để thao tác thời gian thực.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.screenPadding,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: fonts.sizes.title,
    fontWeight: fonts.weights.bold,
  },
  subtitle: {
    color: colors.textSecondary,
  },
  link: {
    color: colors.primary,
    fontWeight: fonts.weights.medium,
  },
  summaryRow: {
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  filterRow: {
    marginTop: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.borderRadius,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    color: colors.text,
  },
  filterTextActive: {
    color: colors.white,
    fontWeight: fonts.weights.semiBold,
  },
  batchActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  batchButton: {
    flex: 1,
    borderRadius: spacing.borderRadius,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  batchText: {
    fontWeight: fonts.weights.medium,
  },
  fullButton: {
    marginTop: spacing.md,
    borderRadius: spacing.borderRadius,
    borderWidth: 1,
    borderColor: colors.text,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  fullButtonText: {
    fontWeight: fonts.weights.semiBold,
  },
  note: {
    color: colors.textLight,
    fontStyle: 'italic',
  },
});
