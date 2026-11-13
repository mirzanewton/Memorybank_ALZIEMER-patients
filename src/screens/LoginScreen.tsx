import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { RootStackParamList } from '../../App';
import { Button } from '../components/Button';
import { FormField } from '../components/FormField';
import { Notice } from '../components/Notice';
import { auth } from '../services/firebase';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function login() {
    setError('');
    if (!/^\S+@\S+\.\S+$/.test(email.trim()) || !password) return setError('Enter a valid email address and password.');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (e) {
      setError(authMessage(e));
    } finally { setLoading(false); }
  }

  async function resetPassword() {
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Enter your email address above to reset your password.');
    try {
      await sendPasswordResetEmail(auth, email.trim());
      Alert.alert('Check your email', 'We sent you a password reset link.');
      setError('');
    } catch (e) { setError(authMessage(e)); }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.copy}>Sign in to your Memory Bank account.</Text>
        {error ? <Notice message={error} /> : null}
        <FormField label="Email address" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <FormField label="Password" value={password} onChangeText={setPassword} secureTextEntry />
        <Button title="Sign in" onPress={login} loading={loading} style={{ marginTop: 4 }} />
        <Button title="Forgot password?" variant="quiet" onPress={resetPassword} style={{ marginTop: 8 }} />
        <Text style={styles.footer} onPress={() => navigation.navigate('Register')}>New to Memory Bank? Create an account</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function authMessage(error: unknown): string {
  const code = (error as { code?: string }).code;
  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') return 'The email or password is not correct.';
  if (code === 'auth/too-many-requests') return 'Too many attempts. Please wait a moment and try again.';
  return 'We could not sign you in. Check your connection and try again.';
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  title: { color: colors.ink, fontSize: 30, fontWeight: '800', marginBottom: 8 },
  copy: { color: colors.muted, fontSize: 16, marginBottom: 27 },
  footer: { color: colors.primaryDark, fontWeight: '700', textAlign: 'center', marginTop: 18, padding: 10, fontSize: 15 },
});
