import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Image, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { RootStackParamList } from '../../App';
import { Button } from '../components/Button';
import { FormField } from '../components/FormField';
import { Notice } from '../components/Notice';
import { useAuth } from '../context/AuthContext';
import { cancelReminder, scheduleReminder } from '../services/notifications';
import { createItem, getPatientId, listItems, removeItem, updateItem, uploadImage } from '../services/data';
import { CareItem, CareItemUpdate, CollectionKind } from '../types';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Memories' | 'People' | 'Routine' | 'Medication'>;
type RouteName = Props['route']['name'];

const kinds: Record<RouteName, CollectionKind> = { Memories: 'memories', People: 'people', Routine: 'routine', Medication: 'medication' };
const messages: Record<CollectionKind, string> = {
  memories: 'A gentle collection of favourite moments and familiar faces.',
  people: 'Names and relationships can make familiar faces easier to recognise.',
  routine: 'A simple list of activities to help make the day feel familiar.',
  medication: 'Reminders reflect schedules entered by a caregiver or healthcare professional.',
};

export function CollectionScreen({ route, navigation }: Props) {
  const { profile } = useAuth();
  const kind = kinds[route.name];
  const [items, setItems] = useState<CareItem[]>([]);
  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');
  const [time, setTime] = useState('');
  const [relationship, setRelationship] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageUri, setImageUri] = useState('');
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!profile) return;
    try { setItems(await listItems(getPatientId(profile), kind)); }
    catch (e) { console.error(`Unable to load ${kind}:`, e); setError('Could not load this list. Check your connection and Firebase rules.'); }
  }, [profile, kind]);

  useEffect(() => { void load(); }, [load]);

  async function addItem() {
    setError('');
    if (!title.trim()) return setError(kind === 'medication' ? 'Enter a medicine name.' : 'Enter a name for this item.');
    if (kind === 'routine' && !time.trim()) return setError('Add a time for this activity, such as 09:00.');
    setLoading(true);
    let notificationId: string | undefined;
    let previousNotificationId: string | null | undefined;
    try {
      if (!profile) throw new Error('Please sign in again.');
      const patientId = getPatientId(profile);
      let imageUrl = currentImageUrl;
      if (imageUri) {
        if (kind === 'people' || kind === 'memories') {
          imageUrl = await uploadImage(patientId, imageUri);
          setCurrentImageUrl(imageUrl);
        }
      }
      if (kind === 'medication') {
        if (editingId) {
          const previous = items.find((item) => item.id === editingId);
          previousNotificationId = previous?.notificationId;
        }
        notificationId = await scheduleReminder(title.trim(), detail.trim(), time.trim());
      }
      const fields: CareItemUpdate = {
        title: title.trim(),
        detail: detail.trim(),
        time: time.trim(),
      };
      if (kind === 'people' || kind === 'memories') {
        fields.relationship = relationship.trim();
        fields.imageUrl = imageUrl || null;
      }
      if (kind === 'medication') fields.notificationId = notificationId || null;
      if (editingId) {
        await updateItem(patientId, kind, editingId, fields);
      } else {
        const newItem: Omit<CareItem, 'id'> = {
          title: title.trim(),
          detail: detail.trim(),
          time: time.trim(),
          completed: false,
        };
        if (fields.relationship !== undefined) newItem.relationship = fields.relationship;
        if (fields.imageUrl !== undefined) newItem.imageUrl = fields.imageUrl;
        if (fields.notificationId !== undefined) newItem.notificationId = fields.notificationId;
        await createItem(patientId, kind, newItem);
      }
      if (kind === 'medication' && editingId) await cancelReminder(previousNotificationId);
      setTitle(''); setDetail(''); setTime(''); setRelationship(''); setEditingId(null); setImageUri(''); setCurrentImageUrl('');
      await load();
    } catch (e) {
      if (notificationId) await cancelReminder(notificationId);
      console.error(`Unable to add ${kind} item:`, e);
      setError(e instanceof Error ? e.message : 'Could not save this item. Please try again.');
    } finally { setLoading(false); }
  }

  async function chooseImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return setError('Allow photo library access in device settings to choose a photo.');
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [4, 3], quality: 0.8 });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  }

  function startEditing(item: CareItem) {
    setEditingId(item.id);
    setTitle(item.title);
    setDetail(item.detail || '');
    setTime(item.time || '');
    setRelationship(item.relationship || '');
    setCurrentImageUrl(item.imageUrl || '');
    setImageUri('');
    setError('');
  }

  async function toggle(item: CareItem) {
    if (!profile) return;
    try {
      await updateItem(getPatientId(profile), kind, item.id, { completed: !item.completed });
      setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, completed: !entry.completed } : entry));
    } catch (e) { console.error('Could not update item:', e); setError('Could not update this item. Please try again.'); }
  }

  function confirmDelete(item: CareItem) {
    Alert.alert('Remove item?', `Remove "${item.title}" from this list?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => { void deleteItem(item); } },
    ]);
  }

  async function deleteItem(item: CareItem) {
    if (!profile) return;
    try {
      if (kind === 'medication') await cancelReminder(item.notificationId);
      await removeItem(getPatientId(profile), kind, item.id);
      setItems((current) => current.filter((entry) => entry.id !== item.id));
    } catch (e) { console.error('Could not remove item:', e); setError('Could not remove this item. Please try again.'); }
  }

  const addMemory = kind === 'memories';
  const allowsCompletion = kind === 'routine' || kind === 'medication';
  const canManage = kind !== 'medication' || profile?.role === 'caregiver';
  const ordered = kind === 'routine' || kind === 'medication'
    ? [...items].sort((a, b) => (a.time || '').localeCompare(b.time || ''))
    : items;

  return (
    <ScrollView contentContainerStyle={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}>
      <Text style={styles.intro}>{messages[kind]}</Text>
      {kind === 'medication' ? <Text style={styles.caution}>Please use only a schedule confirmed by a caregiver or healthcare professional. This app does not give medication advice.</Text> : null}
      {kind === 'medication' && !canManage ? <Text style={styles.patientNote}>Your caregiver manages this schedule. You can mark a reminder as completed below.</Text> : null}
      {error ? <Notice message={error} /> : null}
      {addMemory && !editingId ? <Button title="＋  Add a memory" onPress={() => navigation.navigate('AddMemory')} style={{ marginBottom: 18 }} /> : kind === 'medication' && !canManage ? null : (
        <View style={styles.form}>
          <Text style={styles.formTitle}>{editingId ? 'Update details' : kind === 'medication' ? 'Add medicine schedule' : kind === 'routine' ? 'Add an activity' : kind === 'people' ? 'Add a person' : 'Edit memory'}</Text>
          {(kind === 'people' || kind === 'memories') ? <>
            {currentImageUrl || imageUri ? <Image source={{ uri: imageUri || currentImageUrl }} style={styles.formImage} /> : null}
            <Button title={imageUri || currentImageUrl ? 'Choose a different photo' : 'Choose a photo (optional)'} variant="secondary" onPress={chooseImage} style={{ marginBottom: 14 }} />
            {currentImageUrl ? <Text onPress={() => { setCurrentImageUrl(''); setImageUri(''); }} style={styles.removePhoto}>Remove photo</Text> : null}
          </> : null}
          <FormField label={kind === 'medication' ? 'Medicine name' : kind === 'routine' ? 'Activity' : kind === 'memories' ? 'Memory name' : 'Person’s name'} value={title} onChangeText={setTitle} placeholder={kind === 'routine' ? 'For example, breakfast' : undefined} />
          {kind === 'people' || kind === 'memories' ? <FormField label="Relationship" value={relationship} onChangeText={setRelationship} placeholder="For example, daughter" /> : null}
          {kind === 'routine' || kind === 'medication' ? <FormField label={kind === 'routine' ? 'Time (24-hour clock)' : 'Reminder time (24-hour clock)'} value={time} onChangeText={setTime} placeholder="08:30" keyboardType="numbers-and-punctuation" /> : null}
          <FormField label={kind === 'medication' ? 'Caregiver notes (optional)' : 'Helpful details (optional)'} value={detail} onChangeText={setDetail} placeholder="A short note..." multiline={kind === 'memories'} />
          <Button title={editingId ? 'Save changes' : 'Save to list'} onPress={addItem} loading={loading} />
          {editingId ? <Button title="Cancel editing" variant="quiet" onPress={() => { setEditingId(null); setTitle(''); setDetail(''); setTime(''); setRelationship(''); setImageUri(''); setCurrentImageUrl(''); }} /> : null}
        </View>
      )}
      <Text style={styles.listTitle}>{kind === 'medication' ? 'Upcoming reminders' : kind === 'routine' ? 'Today’s routine' : kind === 'people' ? 'Familiar people' : 'Saved memories'}</Text>
      {ordered.length === 0 ? <View style={styles.empty}><Text style={styles.emptyIcon}>{kind === 'memories' ? '🌷' : kind === 'people' ? '👋' : kind === 'routine' ? '☀️' : '⏰'}</Text><Text style={styles.emptyTitle}>Nothing here yet</Text><Text style={styles.emptyText}>Add an item above to get started.</Text></View> : null}
      {ordered.map((item) => (
        <View key={item.id} style={styles.card}>
          {item.imageUrl ? <Image source={{ uri: item.imageUrl }} style={styles.image} /> : null}
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, item.completed && styles.completed]}>{item.title}</Text>
            {item.relationship ? <Text style={styles.cardDetail}>{item.relationship}</Text> : null}
            {item.time ? <Text style={styles.time}>◷  {item.time}</Text> : null}
            {item.detail ? <Text style={styles.cardDetail}>{item.detail}</Text> : null}
            {canManage ? <Text onPress={() => startEditing(item)} style={styles.action}>Edit details</Text> : null}
            {allowsCompletion ? <Text onPress={() => void toggle(item)} style={styles.action}>{item.completed ? '✓ Completed · Mark pending' : '○ Mark as completed'}</Text> : null}
            {canManage ? <Text onPress={() => confirmDelete(item)} style={styles.remove}>Remove</Text> : null}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 36 },
  intro: { color: colors.muted, fontSize: 16, lineHeight: 23, marginBottom: 16 },
  caution: { backgroundColor: '#FFF3E8', color: '#805526', padding: 13, borderRadius: 12, fontSize: 13, lineHeight: 19, marginBottom: 15 },
  patientNote: { backgroundColor: colors.blueTint, color: colors.primaryDark, padding: 13, borderRadius: 12, fontSize: 14, lineHeight: 20, marginBottom: 15 },
  form: { backgroundColor: '#fff', borderColor: colors.border, borderWidth: 1, borderRadius: 19, padding: 16, marginBottom: 22 },
  formTitle: { color: colors.ink, fontSize: 17, fontWeight: '800', marginBottom: 15 },
  listTitle: { color: colors.ink, fontSize: 19, fontWeight: '800', marginBottom: 13 },
  empty: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 18, padding: 25, marginBottom: 15 },
  emptyIcon: { fontSize: 36, marginBottom: 8 },
  emptyTitle: { color: colors.ink, fontSize: 17, fontWeight: '800' },
  emptyText: { color: colors.muted, fontSize: 14, marginTop: 5 },
  card: { flexDirection: 'row', gap: 13, backgroundColor: '#fff', borderRadius: 17, borderColor: colors.border, borderWidth: 1, padding: 15, marginBottom: 11 },
  image: { width: 82, height: 82, borderRadius: 13 },
  formImage: { width: '100%', height: 170, borderRadius: 13, marginBottom: 12 },
  removePhoto: { color: colors.danger, fontWeight: '700', fontSize: 13, marginTop: -7, marginBottom: 14 },
  cardTitle: { color: colors.ink, fontSize: 17, fontWeight: '800', marginBottom: 5 },
  completed: { textDecorationLine: 'line-through', color: colors.muted },
  cardDetail: { color: colors.muted, fontSize: 14, lineHeight: 20, marginTop: 3 },
  time: { color: colors.primaryDark, fontWeight: '700', fontSize: 14, marginTop: 3 },
  action: { color: colors.success, fontWeight: '700', fontSize: 14, marginTop: 11, paddingVertical: 3 },
  remove: { color: colors.danger, fontWeight: '700', fontSize: 13, marginTop: 8, paddingVertical: 3 },
});
