import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, spacing, fonts } from '../constants';

export default function Button({ 
  title, 
  onPress, 
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
}) {
  const getButtonStyle = () => {
    const styles = [buttonStyles.base];
    
    // Variant
    if (variant === 'primary') styles.push(buttonStyles.primary);
    if (variant === 'secondary') styles.push(buttonStyles.secondary);
    if (variant === 'outline') styles.push(buttonStyles.outline);
    if (variant === 'ghost') styles.push(buttonStyles.ghost);
    
    // Size
    if (size === 'small') styles.push(buttonStyles.small);
    if (size === 'large') styles.push(buttonStyles.large);
    
    // States
    if (disabled) styles.push(buttonStyles.disabled);
    if (fullWidth) styles.push(buttonStyles.fullWidth);
    
    return styles;
  };

  const getTextStyle = () => {
    const styles = [buttonStyles.text];
    
    if (variant === 'primary') styles.push(buttonStyles.primaryText);
    if (variant === 'secondary') styles.push(buttonStyles.secondaryText);
    if (variant === 'outline') styles.push(buttonStyles.outlineText);
    if (variant === 'ghost') styles.push(buttonStyles.ghostText);
    
    if (size === 'small') styles.push(buttonStyles.smallText);
    if (size === 'large') styles.push(buttonStyles.largeText);
    
    return styles;
  };

  return (
    <TouchableOpacity
      style={[...getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.white : colors.primary} />
      ) : (
        <Text style={[...getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const buttonStyles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: spacing.borderRadius,
  },
  
  // Variants
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  
  // Sizes
  small: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  large: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  
  // States
  disabled: {
    opacity: 0.5,
  },
  fullWidth: {
    width: '100%',
  },
  
  // Text Styles
  text: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.semiBold,
  },
  primaryText: {
    color: colors.white,
  },
  secondaryText: {
    color: colors.white,
  },
  outlineText: {
    color: colors.primary,
  },
  ghostText: {
    color: colors.primary,
  },
  smallText: {
    fontSize: fonts.sizes.sm,
  },
  largeText: {
    fontSize: fonts.sizes.lg,
  },
});
