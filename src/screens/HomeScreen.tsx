/**
 * HomeScreen — The Apex Breeze dashboard
 *
 * Shows recent projects, quick actions, and GitHub connection status.
 * The place you drift in to each morning.
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../hooks/useTheme';
import { useAuthStore } from '../store/authStore';
import { useFileSystem } from '../hooks/useFileSystem';
import { BreezeCard } from '../components/common/BreezeCard';
import { BreezeButton } from '../components/common/BreezeButton';
import { createWelcomeProject } from '../utils/fileUtils';
import { SpringBreeze, staggerDelay } from '../theme/animations';
import { Spacing, BorderRadius } from '../theme/spacing';
import { Typography } from '../theme/typography';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

interface HomeScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

const QUICK_ACTIONS = [
  { id: 'new', icon: '📄', label: 'New File', color: '#64b5f6' },
  { id: 'open', icon: '📂', label: 'Open Project', color: '#a5d6a7' },
  { id: 'github', icon: '🔗', label: 'Connect GitHub', color: '#ffcc80' },
  { id: 'vault', icon: '🔐', label: 'Manage Vault', color: '#f48fb1' },
];

export function HomeScreen({ navigation }: HomeScreenProps) {
  const { colors } = useTheme();
  const { user, isAuthenticated, activeRepository } = useAuthStore();
  const { setFiles, setRepositoryName } = useFileSystem();

  const handleQuickAction = useCallback(
    (actionId: string) => {
      switch (actionId) {
        case 'new':
        case 'open':
          // Create a welcome project and navigate to editor
          const project = createWelcomeProject();
          setFiles([project]);
          setRepositoryName(project.name);
          navigation.navigate('Editor');
          break;
        case 'github':
          navigation.navigate('MainTabs', { screen: 'SyncHistory' });
          break;
        case 'vault':
          navigation.navigate('Vault');
          break;
      }
    },
    [navigation, setFiles, setRepositoryName],
  );

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header gradient */}
        <LinearGradient
          colors={[colors.gradientMid, 'transparent']}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />

        {/* Greeting */}
        <View style={styles.greeting}>
          <Text style={[styles.greetingText, { color: colors.textSecondary }]}>
            {getGreeting()}
            {user?.name ? `, ${user.name.split(' ')[0]}` : ''}
          </Text>
          <Text style={[styles.brandText, { color: colors.textPrimary }]}>
            Apex Breeze 🌬️
          </Text>
          <Text style={[styles.quoteText, { color: colors.textTertiary }]}>
            {"Drift in, breathe easy."}
          </Text>
        </View>

        {/* GitHub status card */}
        <BreezeCard style={styles.statusCard} animated>
          <View style={styles.statusRow}>
            <Text style={styles.statusIcon}>{isAuthenticated ? '🟢' : '⚪'}</Text>
            <View style={styles.statusInfo}>
              <Text style={[styles.statusTitle, { color: colors.textPrimary }]}>
                {isAuthenticated ? 'Connected to GitHub' : 'Not connected'}
              </Text>
              <Text style={[styles.statusSubtitle, { color: colors.textSecondary }]}>
                {isAuthenticated
                  ? activeRepository
                    ? `Active: ${activeRepository.name}`
                    : `Signed in as @${user?.login}`
                  : 'Add your token to sync with GitHub'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('Vault')}
              style={[styles.statusAction, { backgroundColor: colors.glassLight }]}
            >
              <Text style={[styles.statusActionText, { color: colors.accent }]}>
                {isAuthenticated ? 'Manage' : 'Connect'}
              </Text>
            </TouchableOpacity>
          </View>
        </BreezeCard>

        {/* Quick actions */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          Quick Actions
        </Text>
        <View style={styles.quickActionsGrid}>
          {QUICK_ACTIONS.map((action, index) => (
            <QuickActionCard
              key={action.id}
              icon={action.icon}
              label={action.label}
              color={action.color}
              index={index}
              onPress={() => handleQuickAction(action.id)}
            />
          ))}
        </View>

        {/* Recent files placeholder */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          Recent Projects
        </Text>
        <BreezeCard style={styles.emptyCard} animated>
          <Text style={styles.emptyIcon}>📂</Text>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
            No recent projects yet
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Open a project to see it here
          </Text>
          <BreezeButton
            label="Start a Project"
            onPress={() => handleQuickAction('new')}
            variant="secondary"
            size="md"
            style={styles.emptyButton}
          />
        </BreezeCard>

        {/* Identity quote */}
        <View style={styles.identityQuote}>
          <Text style={[styles.identityText, { color: colors.textTertiary }]}>
            {'"Apex Breeze is that quiet shift in the air that reminds you there\'s still time."'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface QuickActionCardProps {
  icon: string;
  label: string;
  color: string;
  index: number;
  onPress: () => void;
}

function QuickActionCard({ icon, label, color, index, onPress }: QuickActionCardProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    const delay = staggerDelay(index);
    setTimeout(() => {
      scale.value = withSpring(1, SpringBreeze);
      opacity.value = withSpring(1, SpringBreeze);
    }, delay);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.quickActionWrapper, animStyle]}>
      <TouchableOpacity
        onPress={onPress}
        style={[
          styles.quickAction,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
        activeOpacity={0.7}
      >
        <View style={[styles.quickActionIconBg, { backgroundColor: `${color}20` }]}>
          <Text style={styles.quickActionIcon}>{icon}</Text>
        </View>
        <Text style={[styles.quickActionLabel, { color: colors.textPrimary }]}>
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: Spacing['7xl'],
    gap: Spacing['2xl'],
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  greeting: {
    paddingTop: Spacing['4xl'],
    gap: Spacing.sm,
  },
  greetingText: {
    fontSize: Typography.fontSize.base,
    letterSpacing: Typography.letterSpacing.wide,
  },
  brandText: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: Typography.letterSpacing.tight,
  },
  quoteText: {
    fontSize: Typography.fontSize.sm,
    fontStyle: 'italic',
    letterSpacing: Typography.letterSpacing.wide,
  },
  statusCard: {
    marginTop: Spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  statusIcon: { fontSize: 16 },
  statusInfo: { flex: 1 },
  statusTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
  statusSubtitle: { fontSize: Typography.fontSize.sm, marginTop: 2 },
  statusAction: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  statusActionText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: Typography.letterSpacing.widest,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.lg,
  },
  quickActionWrapper: {
    width: '46%',
  },
  quickAction: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.lg,
  },
  quickActionIconBg: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionIcon: { fontSize: 24 },
  quickActionLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    textAlign: 'center',
  },
  emptyCard: {
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing['4xl'],
  },
  emptyIcon: { fontSize: 40 },
  emptyTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
  emptySubtitle: { fontSize: Typography.fontSize.sm },
  emptyButton: { marginTop: Spacing.md },
  identityQuote: {
    paddingVertical: Spacing['3xl'],
    paddingHorizontal: Spacing.md,
  },
  identityText: {
    fontSize: Typography.fontSize.sm,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: Typography.fontSize.sm * 1.8,
    letterSpacing: Typography.letterSpacing.normal,
  },
});
