export type UserRole = 'patient' | 'caregiver';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  patientId?: string;
  caregiverIds?: string[];
}

export type CollectionKind = 'memories' | 'people' | 'routine' | 'medication';

export interface CareItem {
  id: string;
  title: string;
  detail?: string;
  relationship?: string;
  time?: string;
  imageUrl?: string | null;
  completed?: boolean;
  notificationId?: string | null;
  createdAt?: unknown;
}

export type CareItemUpdate = Partial<Pick<CareItem,
  'title' | 'detail' | 'relationship' | 'time' | 'imageUrl' | 'completed' | 'notificationId'
>>;

export type RootStackScreenProps<T extends keyof import('../App').RootStackParamList> =
  import('@react-navigation/native-stack').NativeStackScreenProps<import('../App').RootStackParamList, T>;
