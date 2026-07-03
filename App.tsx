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
import CultureMissionScreen from './src/screens/CultureMissionScreen';
import VisionMissionScreen from './src/screens/VisionMissionScreen';
import CertificateScreen from './src/screens/CertificateScreen';
import UnionMapScreen from './src/screens/UnionMapScreen';
import AcademyScreen from './src/screens/AcademyScreen';
import VerifyCertificateScreen from './src/screens/VerifyCertificateScreen';
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';
import ChemshaBongoScreen from './src/screens/ChemshaBongoScreen';
import UnionTimelineScreen from './src/screens/UnionTimelineScreen';
import GalaLeaderboardScreen from './src/screens/GalaLeaderboardScreen';
import OmnichannelScreen from './src/screens/OmnichannelScreen';
import { SessionProvider } from './src/context/SessionContext';
import { linking } from './src/navigation/linking';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SessionProvider>
      <NavigationContainer linking={linking}>
        <Stack.Navigator initialRouteName="Landing" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Landing" component={LandingScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Login" component={OnboardingScreen} />
          <Stack.Screen name="HubDashboard" component={HubDashboardScreen} />
          <Stack.Screen name="Matching" component={MatchingScreen} />
          <Stack.Screen name="MissionChat" component={MissionChatScreen} />
          <Stack.Screen name="CultureMission" component={CultureMissionScreen} />
          <Stack.Screen name="VisionMission" component={VisionMissionScreen} />
          <Stack.Screen name="Certificate" component={CertificateScreen} />
          <Stack.Screen name="UnionMap" component={UnionMapScreen} />
          <Stack.Screen name="Academy" component={AcademyScreen} />
          <Stack.Screen name="VerifyCertificate" component={VerifyCertificateScreen} />
          <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
          <Stack.Screen name="ChemshaBongo" component={ChemshaBongoScreen} />
          <Stack.Screen name="UnionTimeline" component={UnionTimelineScreen} />
          <Stack.Screen name="GalaLeaderboard" component={GalaLeaderboardScreen} />
          <Stack.Screen name="Omnichannel" component={OmnichannelScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SessionProvider>
  );
}
