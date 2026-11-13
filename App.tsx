import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/services/firebase';
import { getUserProfile } from './src/services/data';
import { UserProfile } from './src/types';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { CollectionScreen } from './src/screens/CollectionScreen';
import { AddMemoryScreen } from './src/screens/AddMemoryScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { colors } from './src/theme';

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  Dashboard: undefined;
  Memories: undefined;
  People: undefined;
  Routine: undefined;
  Medication: undefined;
  AddMemory: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigation() {
  const { profile, setProfile } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => onAuthStateChanged(auth, async (user) => {
    if (!user) {
      setProfile(null);
      setChecking(false);
      return;
    }
    try {
      let currentProfile = await getUserProfile(user.uid);
      for (let attempt = 0; !currentProfile && attempt < 4; attempt += 1) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        currentProfile = await getUserProfile(user.uid);
      }
      setProfile(currentProfile);
    } catch (error) {
      console.error('Unable to load account profile:', error);
      setProfile(null);
    } finally {
      setChecking(false);
    }
  }), [setProfile]);

  if (checking) {
    return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.ink,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
        }}
      >
        {profile ? (
          <>
            <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Memory Bank', headerBackVisible: false }} />
            <Stack.Screen name="Memories" component={CollectionScreen} options={{ title: 'Memory Gallery' }} />
            <Stack.Screen name="People" component={CollectionScreen} options={{ title: 'People I Know' }} />
            <Stack.Screen name="Routine" component={CollectionScreen} options={{ title: 'Daily Routine' }} />
            <Stack.Screen name="Medication" component={CollectionScreen} options={{ title: 'Medication Reminders' }} />
            <Stack.Screen name="AddMemory" component={AddMemoryScreen} options={{ title: 'Add a Memory' }} />
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile & Settings' }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Welcome back' }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Create account' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const authValue = useMemo(() => ({ profile, setProfile }), [profile]);
  return (
    <AuthProvider value={authValue}>
      <AppNavigation />
    </AuthProvider>
  );
}
