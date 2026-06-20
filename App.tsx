/**
 * Apex Breeze — Main Application Entry
 *
 * "Apex Breeze is that quiet shift in the air that reminds you there's still time.
 *  Drift in, breathe easy, and let your ideas move freely forward—
 *  where hope moves with you."
 *
 * Architecture:
 *  ┌──────────────────────────────────────────────────────┐
 *  │  App.tsx                                             │
 *  │  ├── WelcomeAnimation (first launch only)            │
 *  │  └── AppNavigator                                    │
 *  │       ├── OnboardingScreen (first-use guided flow)   │
 *  │       └── MainTabs (Flow Tabs navigation)            │
 *  │            ├── HomeScreen                            │
 *  │            ├── EditorScreen (+ FileExplorer)         │
 *  │            ├── SyncHistoryScreen                     │
 *  │            └── SettingsScreen                        │
 *  └──────────────────────────────────────────────────────┘
 *
 * State: Zustand stores (editorStore, fileStore, authStore, themeStore)
 * Security: AES-256 vault via VaultService + expo-secure-store
 * Offline: StorageService + AutosaveService
 * Sync: GitHubService + SyncService
 */

import React, { useState, useEffect, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet, View } from 'react-native';

import { AppNavigator } from './src/navigation/AppNavigator';
import { WelcomeAnimation } from './src/components/onboarding/WelcomeAnimation';
import { VaultService } from './src/services/VaultService';
import { StorageService } from './src/services/StorageService';
import { useAuthStore } from './src/store/authStore';
import { useEditorStore } from './src/store/editorStore';
import { useThemeStore } from './src/store/themeStore';
import { BreezeColors } from './src/theme/colors';

// Keep the splash screen visible while we initialize
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [showWelcomeAnimation, setShowWelcomeAnimation] = useState(false);

  const { completeOnboarding } = useAuthStore();
  const { setFontSize, setWordWrap, setShowLineNumbers, setAutosave } = useEditorStore();
  const { setTheme } = useThemeStore();

  const initialize = useCallback(async () => {
    try {
      // 1. Load fonts
      await Font.loadAsync({
        SpaceMono: require('./assets/fonts/SpaceMono-Regular.ttf'),
      }).catch(() => {
        // Font loading is non-critical — fallback to system monospace
        console.warn('[App] SpaceMono font not found, using system fallback');
      });

      // 2. Initialize the vault
      await VaultService.initialize();

      // 3. Load saved settings
      const settings = await StorageService.getSettings();
      setFontSize(settings.fontSize);
      setWordWrap(settings.wordWrap);
      setShowLineNumbers(settings.showLineNumbers);
      setAutosave(settings.autosaveEnabled);
      setTheme(settings.activeTheme as any);

      // 4. Restore onboarding state
      if (settings.hasCompletedOnboarding) {
        completeOnboarding();
      }

      // 5. Determine if this is the very first launch
      const firstLaunch = await StorageService.get('first_launch_complete');
      if (!firstLaunch) {
        setShowWelcomeAnimation(true);
        await StorageService.set('first_launch_complete', 'true');
      } else {
        setIsReady(true);
      }
    } catch (error) {
      console.error('[App] Initialization error:', error);
      // Graceful degradation — proceed without saved state
      setIsReady(true);
    } finally {
      await SplashScreen.hideAsync();
    }
  }, [completeOnboarding, setFontSize, setWordWrap, setShowLineNumbers, setAutosave, setTheme]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleWelcomeComplete = useCallback(() => {
    setShowWelcomeAnimation(false);
    setIsReady(true);
  }, []);

  if (!isReady && !showWelcomeAnimation) {
    // Still loading — splash screen is visible
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor={BreezeColors.background} />

        {showWelcomeAnimation ? (
          <WelcomeAnimation onComplete={handleWelcomeComplete} />
        ) : (
          <AppNavigator />
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BreezeColors.background,
  },
});
