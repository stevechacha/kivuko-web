// App.tsx
import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './src/navigation/types';

import LandingScreen from './src/screens/LandingScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import MatchingScreen from './src/screens/MatchingScreen';
import MissionChatScreen from './src/screens/MissionChatScreen';
import CertificateScreen from './src/screens/CertificateScreen';
import UnionMapScreen from './src/screens/UnionMapScreen';
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
        <Stack.Screen name="Matching" component={MatchingScreen} options={{ title: 'Uoanishaji' }} />
        <Stack.Screen name="MissionChat" component={MissionChatScreen} options={{ title: 'Dhamira' }} />
        <Stack.Screen name="Certificate" component={CertificateScreen} options={{ title: 'Cheti' }} />
        <Stack.Screen name="UnionMap" component={UnionMapScreen} options={{ title: 'Ramani' }} />
      </Stack.Navigator>
      </NavigationContainer>
    </SessionProvider>
  );
}
