// navigation/types.ts
export type RootStackParamList = {
  Landing: undefined;
  Onboarding: undefined;
  HubDashboard: undefined;
  Matching: { name?: string; region?: 'bara' | 'visiwani' };
  MissionChat: { peerId?: string; userName?: string; missionId?: string };
  Certificate: { userName?: string; missionId?: string; verifyUrl?: string; certCode?: string };
  UnionMap: undefined;
  Academy: { tab?: 'army' | 'union' | 'patriot' };
  VerifyCertificate: { certCode: string };
  AdminDashboard: undefined;
};
