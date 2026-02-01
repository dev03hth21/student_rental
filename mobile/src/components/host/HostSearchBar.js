import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { colors, spacing } from '../../constants';

export default function HostSearchBar({ value, placeholder, onChange }) {
  return (
    <View style={styles.wrapper}>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textLight}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.borderRadius,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
  },
  input: {
    height: 44,
    color: colors.text,
  },
});
