import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, fonts } from '../../constants';

export default function HostSuggestionTabs({
  tabs = [],
  activeTab,
  onChange,
  items = [],
}) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.tabRow}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabChip, activeTab === tab && styles.tabChipActive]}
            onPress={() => onChange(tab)}
          >
            <Text style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.list}>
        {items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <View style={styles.bullet} />
            <Text style={styles.itemText}>{item.message}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: spacing.md,
  },
  tabRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tabChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.borderRadius,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  tabChipActive: {
    backgroundColor: colors.text,
    borderColor: colors.text,
  },
  tabLabel: {
    fontSize: fonts.sizes.sm,
    color: colors.text,
    fontWeight: fonts.weights.medium,
  },
  tabLabelActive: {
    color: colors.white,
  },
  list: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  bullet: {
    width: 8,
    height: 8,
    marginTop: spacing.xs,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  itemText: {
    flex: 1,
    color: colors.text,
    fontSize: fonts.sizes.md,
  },
});
