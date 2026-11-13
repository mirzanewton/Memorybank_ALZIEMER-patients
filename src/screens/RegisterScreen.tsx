import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, Pressable, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { RootStackParamList } from '../../App';
import { Button } from '../components/Button';
import { FormField } from '../components/FormField';
import { Notice } from '../components/Notice';
import { useAuth } from '../context/AuthContext';
import { saveUserProfile } from '../services/data';
import { auth } from '../services/firebase';
import { UserRole } from '../types';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const { setProfile } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [role, setRole] = useState<UserRole>('caregiver');
  const [patientId, setPatientId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function register() {
    setError('');
    if (name.trim().length < 2) return setError('Please enter a name with at least 2 characters.');
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Enter a valid email address.');
    if (password.length < 6) return setError('Your password must be at least 6 characters.');
    if (password !== confirm) return setError('The passwords do not match.');
    setLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const saved = await saveUserProfile(credential.user, name, role, role === 'caregiver' ? patientId : undefined);
      setProfile(saved);
    } catch (e) {
      const code = (e as { code?: string }).code;
      setError(code === 'auth/email-already-in-use' ? 'An account already uses this email.' :
        code === 'auth/weak-password' ? 'Choose a stronger password.' : 'We could not create your account. Please try again.');
    } finally { setLoading(false); }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.copy}>Choose the account type that best describes you.</Text>
        {error ? <Notice message={error} /> : null}
        <View style={styles.roles}>
          {(['caregiver', 'patient'] as UserRole[]).map((value) => (
            <Pressable key={value} onPress={() => setRole(value)} style={[styles.role, role === value && styles.selected]}>
              <Text style={[styles.roleText, role === value && styles.selectedText]}>{value === 'caregiver' ? 'Caregiver' : 'Patient'}</Text>
            </Pressable>
          ))}
        </View>
        <FormField label="Your name" value={name} onChangeText={setName} autoCapitalize="words" />
        <FormField label="Email address" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <FormField label="Password (at least 6 characters)" value={password} onChangeText={setPassword} secureTextEntry />
        <FormField label="Confirm password" value={confirm} onChangeText={setConfirm} secureTextEntry />
        {role === 'caregiver' ? <FormField label="Patient account ID (optional)" value={patientId} onChangeText={setPatientId} autoCapitalize="none" /> : null}
        <Text style={styles.hint}>A caregiver can link a patient account by entering that account's UID. You can also add it later in profile settings.</Text>
        <Button title="Create account" onPress={register} loading={loading} style={{ marginTop: 15 }} />
        <Text style={styles.footer} onPress={() => navigation.navigate('Login')}>Already have an account? Sign in</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, paddingBottom: 34 },
  title: { color: colors.ink, fontSize: 29, fontWeight: '800', marginTop: 10, marginBottom: 8 },
  copy: { color: colors.muted, fontSize: 16, marginBottom: 20 },
  roles: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  role: { flex: 1, backgroundColor: '#fff', borderColor: colors.border, borderWidth: 1, borderRadius: 14, padding: 16, alignItems: 'center' },
  selected: { backgroundColor: colors.blueTint, borderColor: colors.primary },
  roleText: { color: colors.muted, fontSize: 16, fontWeight: '700' },
  selectedText: { color: colors.primaryDark },
  hint: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: -4 },
  footer: { color: colors.primaryDark, fontWeight: '700', textAlign: 'center', marginTop: 19, padding: 8 },
});
