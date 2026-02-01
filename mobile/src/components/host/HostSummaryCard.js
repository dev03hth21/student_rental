import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fonts } from '../../constants';

export default function HostSummaryCard({ label, value, caption, icon, variant = 'default' }) {
  return (
    <View style={[styles.card, variantStyles[variant]]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {caption ? <Text style={styles.caption}>{caption}</Text> : null}
    </View>
  );
}

const variantStyles = {
  default: {
    backgroundColor: colors.white,
    borderColor: colors.border,
  },
  accent: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  surface: {
    backgroundColor: colors.surface,
    borderColor: colors.surface,
  },
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 150,
    padding: spacing.md,
    borderRadius: spacing.borderRadius,
    borderWidth: 1,
    marginRight: spacing.sm,
  },
  icon: {
    fontSize: 26,
  },
  label: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: fonts.sizes.sm,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: fonts.sizes.heading,
    fontWeight: fonts.weights.bold,
    marginTop: spacing.xs,
    color: colors.text,
  },
  caption: {
    marginTop: spacing.xs,
    color: colors.textLight,
    fontSize: fonts.sizes.sm,
  },
});
