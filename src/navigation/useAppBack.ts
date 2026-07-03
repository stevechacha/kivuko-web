import { useCallback } from 'react';
import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from './types';
import { useSession } from '../context/SessionContext';

type Fallback = 'auto' | 'hub' | 'landing';

export function useAppBack(
  navigation: NavigationProp<RootStackParamList>,
  fallback: Fallback = 'auto',
) {
  const { participant } = useSession();

  const goBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    const target =
      fallback === 'landing' || (fallback === 'auto' && !participant)
        ? 'Landing'
        : 'HubDashboard';
    navigation.navigate(target);
  }, [navigation, participant, fallback]);

  return goBack;
}
