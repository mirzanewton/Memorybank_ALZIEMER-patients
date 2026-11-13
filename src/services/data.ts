import { User } from 'firebase/auth';
import {
  addDoc, collection, deleteDoc, doc, getDoc, getDocs, orderBy, query,
  serverTimestamp, setDoc, updateDoc,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from './firebase';
import { CareItem, CareItemUpdate, CollectionKind, UserProfile, UserRole } from '../types';

const collectionNames: Record<CollectionKind, string> = {
  memories: 'memories',
  people: 'people',
  routine: 'routines',
  medication: 'medications',
};

export async function saveUserProfile(user: User, name: string, role: UserRole, patientId?: string): Promise<UserProfile> {
  const linkedPatientId = patientId?.trim();
  const profile: UserProfile = {
    uid: user.uid, name: name.trim(), email: user.email ?? '', role,
    ...(linkedPatientId ? { patientId: linkedPatientId } : {}),
  };
  await setDoc(doc(db, 'users', user.uid), { ...profile, createdAt: serverTimestamp() });
  return profile;
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snapshot = await getDoc(doc(db, 'users', uid));
  if (!snapshot.exists()) return null;
  return snapshot.data() as UserProfile;
}

export function getPatientId(profile: UserProfile): string {
  return profile.role === 'caregiver' ? profile.patientId || profile.uid : profile.uid;
}

export async function listItems(patientId: string, kind: CollectionKind): Promise<CareItem[]> {
  const ref = collection(db, 'users', patientId, collectionNames[kind]);
  const result = await getDocs(query(ref, orderBy('createdAt', 'desc')));
  return result.docs.map((snapshot) => ({ id: snapshot.id, ...snapshot.data() } as CareItem));
}

export async function createItem(patientId: string, kind: CollectionKind, item: Omit<CareItem, 'id'>): Promise<void> {
  const cleanItem = Object.fromEntries(Object.entries(item).filter(([, value]) => value !== undefined));
  await addDoc(collection(db, 'users', patientId, collectionNames[kind]), { ...cleanItem, createdAt: serverTimestamp() });
}

export async function updateItem(patientId: string, kind: CollectionKind, itemId: string, fields: CareItemUpdate): Promise<void> {
  await updateDoc(doc(db, 'users', patientId, collectionNames[kind], itemId), fields);
}

export async function removeItem(patientId: string, kind: CollectionKind, itemId: string): Promise<void> {
  await deleteDoc(doc(db, 'users', patientId, collectionNames[kind], itemId));
}

export async function uploadImage(patientId: string, uri: string): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();
  const imageRef = ref(storage, `users/${patientId}/memories/${Date.now()}.jpg`);
  await uploadBytes(imageRef, blob);
  return getDownloadURL(imageRef);
}
