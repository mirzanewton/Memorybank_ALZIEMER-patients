import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { signOut } from 'firebase/auth';
import { RootStackParamList } from '../../App';
import { Button } from '../components/Button';
import { FormField } from '../components/FormField';
import { Notice } from '../components/Notice';
import { useAuth } from '../context/AuthContext';
import { auth } from '../services/firebase';
import { arrayRemove, arrayUnion, doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export function ProfileScreen(_: Props) {
  const { profile, setProfile } = useAuth();
  const [patientId, setPatientId] = useState(profile?.patientId || '');
  const [caregiverUid, setCaregiverUid] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function saveLink() {
    if (!profile || profile.role !== 'caregiver') return;
    setLoading(true); setError(''); setMessage('');
    try {
      const patientIdValue = patientId.trim() || undefined;
      await updateDoc(doc(db, 'users', profile.uid), { patientId: patientIdValue || null });
      setProfile({ ...profile, patientId: patientIdValue });
      setMessage(patientId.trim() ? 'Patient account linked.' : 'Patient link removed.');
    } catch (e) {
      console.error('Could not update patient link:', e);
      setError('Could not update the patient link. Check your connection and try again.');
    } finally { setLoading(false); }
  }

  async function logOut() {
    try { await signOut(auth); }
    catch (e) { console.error('Sign-out failed:', e); Alert.alert('Sign out failed', 'Please try again.'); }
  }

  async function authorizeCaregiver() {
    if (!profile || profile.role !== 'patient' || !caregiverUid.trim()) return;
    setLoading(true); setError(''); setMessage('');
    try {
      await updateDoc(doc(db, 'users', profile.uid), { caregiverIds: arrayUnion(caregiverUid.trim()) });
      setCaregiverUid('');
      setMessage('Caregiver authorized. They can now link to your account.');
    } catch (e) {
      console.error('Could not authorize caregiver:', e);
      setError('Could not authorize this caregiver. Check the account ID and try again.');
    } finally { setLoading(false); }
  }

  async function revokeCaregiver() {
    if (!profile || profile.role !== 'patient' || !caregiverUid.trim()) return;
    setLoading(true); setError(''); setMessage('');
    try {
      await updateDoc(doc(db, 'users', profile.uid), { caregiverIds: arrayRemove(caregiverUid.trim()) });
      setCaregiverUid('');
      setMessage('Caregiver access removed.');
    } catch (e) {
      console.error('Could not remove caregiver access:', e);
      setError('Could not remove caregiver access. Check the account ID and try again.');
    } finally { setLoading(false); }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.avatar}>{profile?.role === 'caregiver' ? '💙' : '🌷'}</Text>
      <Text style={styles.name}>{profile?.name}</Text>
      <Text style={styles.email}>{profile?.email}</Text>
      <Text style={styles.badge}>{profile?.role === 'caregiver' ? 'CAREGIVER ACCOUNT' : 'PATIENT ACCOUNT'}</Text>
      <View style={styles.card}>
        <Text style={styles.section}>Account information</Text>
        <Text style={styles.infoLabel}>Name</Text><Text style={styles.info}>{profile?.name}</Text>
        <Text style={styles.infoLabel}>Email</Text><Text style={styles.info}>{profile?.email}</Text>
        <Text style={styles.infoLabel}>Account type</Text><Text style={styles.info}>{profile?.role === 'caregiver' ? 'Caregiver' : 'Patient'}</Text>
      </View>
      {profile?.role === 'caregiver' ? <View style={styles.card}>
        <Text style={styles.section}>Patient account link</Text>
        {error ? <Notice message={error} /> : null}
        {message ? <Notice type="success" message={message} /> : null}
        <Text style={styles.helper}>Enter the patient's account UID to manage their memories and routines. They can find their UID in their account information.</Text>
        <FormField label="Patient account ID" value={patientId} onChangeText={setPatientId} autoCapitalize="none" />
        <Button title="Save patient link" onPress={saveLink} loading={loading} />
      </View> : null}
      {profile?.role === 'patient' ? <View style={styles.card}>
        <Text style={styles.section}>Caregiver access</Text>
        {error ? <Notice message={error} /> : null}
        {message ? <Notice type="success" message={message} /> : null}
        <Text style={styles.helper}>Enter a trusted caregiver’s account UID to authorize access to your memories and routines. They must also link your patient account from their own profile.</Text>
        <FormField label="Caregiver account ID" value={caregiverUid} onChangeText={setCaregiverUid} autoCapitalize="none" />
        <Button title="Authorize caregiver" onPress={authorizeCaregiver} loading={loading} />
        <Button title="Remove caregiver access" variant="quiet" onPress={revokeCaregiver} style={{ marginTop: 6 }} />
      </View> : null}
      <Text style={styles.disclaimer}>Memory Bank is a supportive organization tool, not a medical diagnostic or treatment system. Confirm medication information with a qualified healthcare professional.</Text>
      <Button title="Sign out" variant="secondary" onPress={logOut} style={{ marginTop: 10 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 22, paddingBottom: 35 },
  avatar: { alignSelf: 'center', fontSize: 51, width: 96, height: 96, textAlign: 'center', textAlignVertical: 'center', backgroundColor: colors.lavender, borderRadius: 48, overflow: 'hidden', marginTop: 9 },
  name: { color: colors.ink, fontSize: 24, fontWeight: '800', textAlign: 'center', marginTop: 13 },
  email: { color: colors.muted, fontSize: 15, textAlign: 'center', marginTop: 4 },
  badge: { color: colors.primaryDark, fontSize: 11, letterSpacing: 1.2, fontWeight: '800', textAlign: 'center', marginTop: 12, marginBottom: 21 },
  card: { backgroundColor: '#fff', borderColor: colors.border, borderWidth: 1, borderRadius: 18, padding: 17, marginBottom: 14 },
  section: { color: colors.ink, fontSize: 17, fontWeight: '800', marginBottom: 15 },
  infoLabel: { color: colors.muted, fontSize: 13, marginTop: 10 },
  info: { color: colors.ink, fontSize: 16, fontWeight: '600', marginTop: 3 },
  helper: { color: colors.muted, lineHeight: 20, fontSize: 14, marginBottom: 13 },
  disclaimer: { textAlign: 'center', color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 4, marginBottom: 13 },
});
