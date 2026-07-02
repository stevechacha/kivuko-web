// navigation/types.ts
export type RootStackParamList = {
  Landing: undefined;
  Onboarding: undefined;
  Matching: { name: string; region: 'bara' | 'visiwani' };
  MissionChat: { peerId: string; userName: string; missionId: string };
  Certificate: { userName: string; missionId: string; verifyUrl?: string; certCode?: string };
  UnionMap: undefined;
};
