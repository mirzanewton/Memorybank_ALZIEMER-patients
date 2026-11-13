import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { RootStackParamList } from '../../App';
import { Button } from '../components/Button';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export function WelcomeScreen({ navigation }: Props) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.art}><Text style={styles.artIcon}>💜</Text><Text style={styles.smallIcon}>✦</Text></View>
      <Text style={styles.brand}>Memory Bank</Text>
      <Text style={styles.title}>A little help for{'\n'}the moments that matter.</Text>
      <Text style={styles.subtitle}>Keep familiar faces, daily routines and caring reminders close at hand.</Text>
      <Button title="Get started" onPress={() => navigation.navigate('Register')} style={styles.button} />
      <Button title="I already have an account" variant="secondary" onPress={() => navigation.navigate('Login')} />
      <Text style={styles.disclaimer}>A supportive tool for patients and caregivers. Not a medical device.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 28, paddingVertical: 36 },
  art: { height: 190, borderRadius: 36, backgroundColor: colors.lavender, alignItems: 'center', justifyContent: 'center', marginBottom: 26 },
  artIcon: { fontSize: 82 },
  smallIcon: { position: 'absolute', top: 38, right: 56, color: colors.primary, fontSize: 28 },
  brand: { color: colors.primary, fontWeight: '800', letterSpacing: 0.5, fontSize: 18, marginBottom: 15 },
  title: { color: colors.ink, fontSize: 32, lineHeight: 39, fontWeight: '800', marginBottom: 13 },
  subtitle: { color: colors.muted, fontSize: 17, lineHeight: 25, marginBottom: 27 },
  button: { marginBottom: 12 },
  disclaimer: { marginTop: 26, color: colors.muted, fontSize: 12, textAlign: 'center', lineHeight: 18 },
});
