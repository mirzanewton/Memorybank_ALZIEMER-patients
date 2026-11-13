import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { RootStackParamList } from '../../App';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

const tiles: { route: keyof RootStackParamList; icon: string; title: string; subtitle: string; tone: string }[] = [
  { route: 'Memories', icon: '📷', title: 'Memory Gallery', subtitle: 'Favourite moments', tone: colors.lavender },
  { route: 'People', icon: '👋', title: 'People I Know', subtitle: 'Familiar faces', tone: colors.blueTint },
  { route: 'Routine', icon: '☀️', title: 'Daily Routine', subtitle: 'What comes next', tone: '#EDF6F1' },
  { route: 'Medication', icon: '⏰', title: 'Medication', subtitle: 'Caregiver-entered reminders', tone: '#FFF3E8' },
];

export function DashboardScreen({ navigation }: Props) {
  const { profile } = useAuth();
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.greeting}>
        <Text style={styles.eyebrow}>{profile?.role === 'caregiver' ? 'CAREGIVER HOME' : 'YOUR MEMORY BANK'}</Text>
        <Text style={styles.title}>Hello, {profile?.name || 'friend'} 👋</Text>
        <Text style={styles.subtitle}>One step at a time. Your day is here.</Text>
      </View>
      <View style={styles.banner}>
        <Text style={styles.bannerIcon}>💙</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.bannerTitle}>A familiar place</Text>
          <Text style={styles.bannerBody}>Photos, people and simple plans—all in one calm space.</Text>
        </View>
      </View>
      <Text style={styles.section}>What would you like to do?</Text>
      <View style={styles.grid}>
        {tiles.map((tile) => (
          <View key={tile.route} style={[styles.tile, { backgroundColor: tile.tone }]}>
            <Text style={styles.icon}>{tile.icon}</Text>
            <Text style={styles.tileTitle}>{tile.title}</Text>
            <Text style={styles.tileSub}>{tile.subtitle}</Text>
            <Text onPress={() => navigation.navigate(tile.route as never)} style={styles.open}>Open ›</Text>
          </View>
        ))}
      </View>
      <Button title="＋  Add a memory" variant="secondary" onPress={() => navigation.navigate('AddMemory')} style={{ marginTop: 2 }} />
      <Button title="Profile and settings" variant="quiet" onPress={() => navigation.navigate('Profile')} style={{ marginTop: 4 }} />
      <Text style={styles.disclaimer}>Medication schedules must be entered or confirmed by a caregiver or healthcare professional. Memory Bank does not provide medical advice.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 21, paddingBottom: 34 },
  greeting: { marginTop: 8, marginBottom: 20 },
  eyebrow: { color: colors.primary, fontWeight: '800', fontSize: 11, letterSpacing: 1.4, marginBottom: 9 },
  title: { color: colors.ink, fontWeight: '800', fontSize: 28 },
  subtitle: { color: colors.muted, fontSize: 16, marginTop: 6 },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#fff', padding: 17, borderRadius: 19, marginBottom: 25, borderWidth: 1, borderColor: colors.border },
  bannerIcon: { fontSize: 35 },
  bannerTitle: { color: colors.ink, fontSize: 17, fontWeight: '700', marginBottom: 4 },
  bannerBody: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  section: { fontSize: 18, fontWeight: '800', color: colors.ink, marginBottom: 13 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 18 },
  tile: { width: '48%', minHeight: 169, borderRadius: 20, padding: 15, flexGrow: 1 },
  icon: { fontSize: 28, marginBottom: 9 },
  tileTitle: { color: colors.ink, fontWeight: '800', fontSize: 16 },
  tileSub: { color: colors.muted, fontSize: 13, marginTop: 4 },
  open: { color: colors.primaryDark, fontSize: 14, fontWeight: '800', marginTop: 'auto', paddingTop: 14 },
  disclaimer: { textAlign: 'center', color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 16, paddingHorizontal: 8 },
});
