import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors } from '../theme';

interface Props extends TextInputProps { label: string }

export function FormField({ label, ...props }: Props) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput placeholderTextColor="#8A94A8" {...props} style={[styles.input, props.multiline && styles.multiline, props.style]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: { color: colors.ink, fontWeight: '700', fontSize: 15, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, minHeight: 52, paddingHorizontal: 15, color: colors.ink, backgroundColor: '#FFFFFF', fontSize: 16 },
  multiline: { minHeight: 94, paddingTop: 13, textAlignVertical: 'top' },
});
