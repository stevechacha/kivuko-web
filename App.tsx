// App.tsx
import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './src/navigation/types';

import LandingScreen from './src/screens/LandingScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import HubDashboardScreen from './src/screens/HubDashboardScreen';
import MatchingScreen from './src/screens/MatchingScreen';
import MissionChatScreen from './src/screens/MissionChatScreen';
import CertificateScreen from './src/screens/CertificateScreen';
import UnionMapScreen from './src/screens/UnionMapScreen';
import AcademyScreen from './src/screens/AcademyScreen';
import VerifyCertificateScreen from './src/screens/VerifyCertificateScreen';
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';
import { SessionProvider } from './src/context/SessionContext';
import { linking } from './src/navigation/linking';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SessionProvider>
      <NavigationContainer linking={linking}>
      <Stack.Navigator
        initialRouteName="Landing"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Landing" component={LandingScreen} options={{ title: 'Kivuko la Muungano' }} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ title: 'Usajili' }} />
        <Stack.Screen name="HubDashboard" component={HubDashboardScreen} options={{ title: 'Dashibodi' }} />
        <Stack.Screen name="Matching" component={MatchingScreen} options={{ title: 'Uoanishaji' }} />
        <Stack.Screen name="MissionChat" component={MissionChatScreen} options={{ title: 'Dhamira' }} />
        <Stack.Screen name="Certificate" component={CertificateScreen} options={{ title: 'Cheti' }} />
        <Stack.Screen name="UnionMap" component={UnionMapScreen} options={{ title: 'Ramani' }} />
        <Stack.Screen name="Academy" component={AcademyScreen} options={{ title: 'Maktaba' }} />
        <Stack.Screen name="VerifyCertificate" component={VerifyCertificateScreen} options={{ title: 'Thibitisha' }} />
        <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: 'Admin' }} />
      </Stack.Navigator>
      </NavigationContainer>
    </SessionProvider>
  );
}
