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

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SessionProvider>
      <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Landing"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Landing" component={LandingScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Matching" component={MatchingScreen} />
        <Stack.Screen name="MissionChat" component={MissionChatScreen} />
        <Stack.Screen name="Certificate" component={CertificateScreen} />
        <Stack.Screen name="UnionMap" component={UnionMapScreen} />
      </Stack.Navigator>
      </NavigationContainer>
    </SessionProvider>
  );
}
