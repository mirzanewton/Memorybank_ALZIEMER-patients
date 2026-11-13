import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors } from '../theme';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'quiet';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({ title, onPress, variant = 'primary', loading, disabled, style }: Props) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} disabled={disabled || loading}
      style={({ pressed }) => [styles.base, styles[variant], pressed && styles.pressed, (disabled || loading) && styles.disabled, style]}>
      {loading ? <ActivityIndicator color={variant === 'primary' ? '#fff' : colors.primary} /> :
        <Text style={[styles.text, variant === 'primary' ? styles.primaryText : styles.otherText]}>{title}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { minHeight: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.blueTint },
  quiet: { backgroundColor: 'transparent' },
  text: { fontSize: 17, fontWeight: '700' },
  primaryText: { color: '#FFFFFF' },
  otherText: { color: colors.primaryDark },
  pressed: { opacity: 0.82 },
  disabled: { opacity: 0.6 },
});
