// navigation/types.ts
// Route params are intentionally minimal — mission/user state is in SessionContext.
export type RootStackParamList = {
  Landing: undefined;
  Onboarding: undefined;
  Login: undefined;
  HubDashboard: undefined;
  Matching: undefined;
  MissionChat: undefined;
  CultureMission: undefined;
  VisionMission: undefined;
  Certificate: undefined;
  UnionMap: undefined;
  Academy: { tab?: 'army' | 'union' | 'patriot' };
  VerifyCertificate: { certCode: string };
  AdminDashboard: undefined;
  ChemshaBongo: undefined;
  UnionTimeline: undefined;
  GalaLeaderboard: undefined;
  Omnichannel: undefined;
  JudgeTour: undefined;
};
