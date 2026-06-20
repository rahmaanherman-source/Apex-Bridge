/**
 * Navigation Types — Type-safe route parameters
 */

export type RootStackParamList = {
  Welcome: undefined;
  Onboarding: undefined;
  MainTabs: { screen?: keyof MainTabParamList } | undefined;
  Editor: undefined;
  Vault: undefined;
  Themes: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Explorer: undefined;
  SyncHistory: undefined;
  Settings: undefined;
};
