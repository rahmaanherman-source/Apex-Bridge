/**
 * AppNavigator — Root navigation architecture
 *
 * Flow Tabs provide the primary navigation — a spatial model where
 * frequently used areas drift toward center while inactive ones recede.
 *
 * "Instead of a horizontal row of diminishing rectangles, Flow Tabs utilize
 *  a radial navigation model that expands outward based on activity."
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { OnboardingScreen } from '../screens/OnboardingScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { EditorScreen } from '../screens/EditorScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { ThemesScreen } from '../screens/ThemesScreen';
import { VaultScreen } from '../screens/VaultScreen';
import { SyncHistoryScreen } from '../screens/SyncHistoryScreen';

import { useAuthStore } from '../store/authStore';
import { useTheme } from '../hooks/useTheme';
import { BreezeColors, type ThemeColors } from '../theme/colors';
import { Spacing, BorderRadius } from '../theme/spacing';
import { Typography } from '../theme/typography';
import { SpringSnappy } from '../theme/animations';
import type { RootStackParamList, MainTabParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// ── Flow Tab Bar ─────────────────────────────────────────────────────────────

interface FlowTabItem {
  name: keyof MainTabParamList;
  icon: string;
  label: string;
}

const FLOW_TAB_ITEMS: FlowTabItem[] = [
  { name: 'Home', icon: '🏠', label: 'Home' },
  { name: 'Explorer', icon: '📁', label: 'Files' },
  { name: 'SyncHistory', icon: '🔀', label: 'Sync' },
  { name: 'Settings', icon: '⚙️', label: 'Settings' },
];

interface FlowTabBarProps {
  state: any;
  navigation: any;
}

/** Custom Flow Tab Bar — the hallmark navigation of Apex Bridge */
function FlowTabBar({ state, navigation }: FlowTabBarProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.tabBar,
        {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      ]}
    >
      {FLOW_TAB_ITEMS.map((item, index) => {
        const isActive = state.index === index;
        return (
          <FlowTabItem
            key={item.name}
            item={item}
            isActive={isActive}
            colors={colors}
            onPress={() => {
              navigation.navigate(item.name);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          />
        );
      })}
    </View>
  );
}

interface FlowTabItemProps {
  item: FlowTabItem;
  isActive: boolean;
  colors: ThemeColors;
  onPress: () => void;
}

function FlowTabItem({ item, isActive, colors, onPress }: FlowTabItemProps) {
  const scale = useSharedValue(isActive ? 1 : 0.9);

  React.useEffect(() => {
    scale.value = withSpring(isActive ? 1 : 0.9, SpringSnappy);
  }, [isActive, scale]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.tabItem}
      activeOpacity={0.7}
    >
      <Animated.View
        style={[
          styles.tabIconContainer,
          isActive ? { backgroundColor: colors.tabActiveBackground } : null,
          animStyle,
        ]}
      >
        <Text style={[styles.tabIcon, isActive ? styles.tabIconActive : null]}>
          {item.icon}
        </Text>
      </Animated.View>
      <Text
        style={[
          styles.tabLabel,
          {
            color: isActive ? colors.tabActive : colors.tabInactive,
            fontWeight: isActive ? Typography.fontWeight.semibold : Typography.fontWeight.normal,
          },
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );
}

// ── Main Tab Navigator ───────────────────────────────────────────────────────

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <FlowTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Explorer" component={EditorScreen} />
      <Tab.Screen name="SyncHistory" component={SyncHistoryScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

// ── Root Navigator ───────────────────────────────────────────────────────────

export function AppNavigator() {
  const { hasCompletedOnboarding } = useAuthStore();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: BreezeColors.background },
        }}
        initialRouteName={hasCompletedOnboarding ? 'MainTabs' : 'Onboarding'}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen
          name="Editor"
          component={EditorScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="Vault"
          component={VaultScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="Themes"
          component={ThemesScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    height: Spacing.tabBarHeight,
    borderTopWidth: 1,
    paddingBottom: Spacing.md,
    paddingTop: Spacing.sm,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabIconContainer: {
    width: 40,
    height: 32,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 18,
  },
  tabIconActive: {
    // Slightly larger when active — the "breathe" mechanism
  },
  tabLabel: {
    fontSize: Typography.fontSize.xs,
    letterSpacing: Typography.letterSpacing.normal,
  },
});
