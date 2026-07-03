import type { LinkingOptions } from '@react-navigation/native';
import type { RootStackParamList } from './types';

function getWebPrefix(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return 'https://kivuko-web-production.up.railway.app';
}

/** Clean path-only URLs — session data lives in sessionStorage, not the address bar. */
export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [getWebPrefix()],
  config: {
    screens: {
      Landing: '',
      Onboarding: 'usajili',
      Login: 'ingia',
      HubDashboard: 'dashibodi',
      Matching: 'uoanishaji',
      MissionChat: 'dhamira',
      CultureMission: 'utamaduni',
      VisionMission: 'maono',
      Certificate: 'cheti',
      UnionMap: 'ramani',
      Academy: {
        path: 'maktaba/:tab?',
        parse: {
          tab: (value: string) =>
            value === 'army' || value === 'patriot' ? value : 'union',
        },
      },
      VerifyCertificate: 'thibitisha/:certCode',
      AdminDashboard: 'admin',
      ChemshaBongo: 'chemsha-bongo',
      UnionTimeline: 'historia',
      GalaLeaderboard: 'gala',
      Omnichannel: 'njia-zote',
      JudgeTour: 'onyesho',
      ModeratorFlaggedContent: 'admin/ripoti',
      ElderContribution: 'wazee',
      ElderRadio: 'redio-wazee',
      OralHistoryArchive: 'hifadhi',
      InstitutionDashboard: 'chuo/:code',
      AiTutor: 'mwalimu-ai',
      MyRewards: 'zawadi',
      NationalImpact: 'athari',
      CertificateGallery: 'vyeti',
      PartnerDashboard: 'washirika',
      RadioPartner: 'redio',
      GalaCeremony: 'gala-moja',
    },
  },
};
