import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { RootStackParamList } from '../../App';
import { Button } from '../components/Button';
import { FormField } from '../components/FormField';
import { Notice } from '../components/Notice';
import { useAuth } from '../context/AuthContext';
import { createItem, getPatientId, uploadImage } from '../services/data';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AddMemory'>;

export function AddMemoryScreen({ navigation }: Props) {
  const { profile } = useAuth();
  const [title, setTitle] = useState('');
  const [relationship, setRelationship] = useState('');
  const [detail, setDetail] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function chooseImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return setError('Allow photo library access in device settings to choose a photo.');
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [4, 3], quality: 0.8 });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  }

  async function save() {
    setError('');
    if (!title.trim()) return setError('Add a name or title for this memory.');
    if (!profile) return setError('Sign in again before saving this memory.');
    setLoading(true);
    try {
      const patientId = getPatientId(profile);
      const imageUrl = imageUri ? await uploadImage(patientId, imageUri) : undefined;
      await createItem(patientId, 'memories', { title: title.trim(), relationship: relationship.trim(), detail: detail.trim(), imageUrl });
      Alert.alert('Memory saved', 'Your memory has been added to the gallery.');
      navigation.goBack();
    } catch (e) {
      console.error('Could not save memory:', e);
      setError('We could not save this memory. Check your connection and Firebase permissions, then try again.');
    } finally { setLoading(false); }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.intro}>Add a familiar face or a moment you would like to remember.</Text>
      {error ? <Notice message={error} /> : null}
      {imageUri ? <Image source={{ uri: imageUri }} style={styles.photo} /> : null}
      <Button title={imageUri ? 'Choose a different photo' : 'Choose a photo (optional)'} variant="secondary" onPress={chooseImage} style={{ marginBottom: 19 }} />
      <FormField label="Person or memory name" value={title} onChangeText={setTitle} placeholder="For example, Grandma Rose" />
      <FormField label="Relationship" value={relationship} onChangeText={setRelationship} placeholder="For example, my sister" />
      <FormField label="A few helpful details" value={detail} onChangeText={setDetail} placeholder="A short, kind reminder..." multiline />
      <Button title="Save memory" onPress={save} loading={loading} style={{ marginTop: 4 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 22, paddingBottom: 35 },
  intro: { color: colors.muted, fontSize: 16, lineHeight: 23, marginBottom: 20 },
  photo: { width: '100%', height: 220, borderRadius: 18, marginBottom: 14 },
});
