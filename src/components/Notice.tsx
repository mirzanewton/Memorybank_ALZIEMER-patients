import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export function Notice({ message, type = 'error' }: { message: string; type?: 'error' | 'success' }) {
  return <View accessibilityRole="alert" style={[styles.box, type === 'success' ? styles.success : styles.error]}>
    <Text style={[styles.text, type === 'success' ? styles.successText : styles.errorText]}>{message}</Text>
  </View>;
}

const styles = StyleSheet.create({
  box: { borderRadius: 12, padding: 13, marginBottom: 14 },
  error: { backgroundColor: '#FCEDEF' },
  success: { backgroundColor: '#E7F5EF' },
  text: { fontSize: 14 },
  errorText: { color: colors.danger },
  successText: { color: colors.success },
});
