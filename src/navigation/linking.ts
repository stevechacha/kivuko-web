import type { LinkingOptions } from '@react-navigation/native';
import type { RootStackParamList } from './types';

function getWebPrefix(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return 'https://kivuko-web-production.up.railway.app';
}

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [getWebPrefix()],
  config: {
    screens: {
      Landing: '',
      Onboarding: 'usajili',
      Matching: {
        path: 'uoanishaji',
        parse: {
          name: String,
          region: (value: string) => (value === 'visiwani' ? 'visiwani' : 'bara'),
        },
      },
      MissionChat: {
        path: 'dhamira',
        parse: {
          peerId: String,
          userName: String,
          missionId: String,
        },
      },
      Certificate: {
        path: 'cheti',
        parse: {
          userName: String,
          missionId: String,
          verifyUrl: String,
          certCode: String,
        },
      },
      UnionMap: 'ramani',
    },
  },
};
