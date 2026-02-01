// Deprecated screen placeholder for removed advanced filters.
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fonts } from '../../constants';

export default function FilterModalScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bộ lọc nâng cao đã được gỡ bỏ.</Text>
      <Text style={styles.subtitle}>Màn hình này không còn được sử dụng.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  title: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.semiBold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  bottomResetText: {
    color: colors.text,
    fontWeight: fonts.weights.semiBold,
  },
});
