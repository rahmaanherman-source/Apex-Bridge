/**
 * SyncHistoryScreen — GitHub sync timeline
 *
 * "Sync History shouldn't just be a log; it should be a timeline of progress,
 *  a narrative of the work being done."
 *
 * Merge conflicts are conversations. Every commit is a small act of hope.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { useGitHub } from '../hooks/useGitHub';
import { GitHubService } from '../services/GitHubService';
import { SyncService, type SyncProgress } from '../services/SyncService';
import { BreezeCard } from '../components/common/BreezeCard';
import { BreezeButton } from '../components/common/BreezeButton';
import { LoadingIndicator } from '../components/common/LoadingIndicator';
import {
  formatRelativeTime,
  formatSyncSummary,
  getSyncStatusColor,
  getSyncTypeIcon,
  type SyncRecord,
} from '../utils/gitUtils';
import { Spacing, BorderRadius } from '../theme/spacing';
import { Typography } from '../theme/typography';

export function SyncHistoryScreen() {
  const { colors } = useTheme();
  const { isAuthenticated, activeRepository, currentBranch } = useGitHub();
  const [history, setHistory] = useState<SyncRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    const records = await GitHubService.getSyncHistory();
    setHistory(records);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handlePull = useCallback(async () => {
    if (!activeRepository) {
      Alert.alert('No Repository', 'Please connect to a GitHub repository first.');
      return;
    }

    setIsSyncing(true);
    try {
      await SyncService.pull(activeRepository, currentBranch, (progress) => {
        setSyncProgress(progress);
      });
      await loadHistory();
    } catch (error) {
      Alert.alert('Pull Failed', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsSyncing(false);
      setSyncProgress(null);
    }
  }, [activeRepository, currentBranch, loadHistory]);

  const handleClearHistory = useCallback(() => {
    Alert.alert(
      'Clear History',
      'Clear all sync history? The actual repository is not affected.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await GitHubService.clearSyncHistory();
            setHistory([]);
          },
        },
      ],
    );
  }, []);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Sync</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textTertiary }]}>
            {activeRepository ? `${activeRepository.fullName} · ${currentBranch}` : 'Not connected'}
          </Text>
        </View>
        {history.length > 0 && (
          <TouchableOpacity onPress={handleClearHistory}>
            <Text style={[styles.clearButton, { color: colors.textTertiary }]}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Sync actions */}
        {isAuthenticated && (
          <BreezeCard style={styles.syncActions}>
            <Text style={[styles.syncActionsTitle, { color: colors.textPrimary }]}>
              Sync with GitHub
            </Text>
            {activeRepository && (
              <Text style={[styles.syncActionsRepo, { color: colors.textSecondary }]}>
                {activeRepository.fullName} · {currentBranch}
              </Text>
            )}

            {/* Progress indicator */}
            {syncProgress && (
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        backgroundColor: colors.accent,
                        width: `${syncProgress.progress}%` as any,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                  {syncProgress.message}
                </Text>
              </View>
            )}

            <View style={styles.syncButtons}>
              <BreezeButton
                label="⬇️ Pull"
                onPress={handlePull}
                variant="secondary"
                size="md"
                isLoading={isSyncing && syncProgress?.operation === 'pull'}
                disabled={isSyncing || !activeRepository}
                style={styles.syncButton}
              />
              <BreezeButton
                label="⬆️ Push"
                onPress={() =>
                  Alert.alert('Push', 'Select files to push in the editor view.')
                }
                variant="secondary"
                size="md"
                disabled={isSyncing || !activeRepository}
                style={styles.syncButton}
              />
            </View>
          </BreezeCard>
        )}

        {!isAuthenticated && (
          <BreezeCard style={styles.authPrompt}>
            <Text style={styles.authPromptIcon}>🔗</Text>
            <Text style={[styles.authPromptTitle, { color: colors.textPrimary }]}>
              Connect to GitHub
            </Text>
            <Text style={[styles.authPromptDesc, { color: colors.textSecondary }]}>
              Add your GitHub token in the Vault to enable sync operations.
            </Text>
          </BreezeCard>
        )}

        {/* History timeline */}
        <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>
          Timeline
        </Text>

        {isLoading && <LoadingIndicator message="Loading history..." />}

        {!isLoading && history.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🕐</Text>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              No sync history yet
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Every sync will be recorded here as a chapter in your story
            </Text>
          </View>
        )}

        {history.map((record, index) => (
          <SyncRecordCard
            key={record.id}
            record={record}
            colors={colors}
            isFirst={index === 0}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function SyncRecordCard({
  record,
  colors,
  isFirst,
}: {
  record: SyncRecord;
  colors: any;
  isFirst: boolean;
}) {
  const statusColor = getSyncStatusColor(record.status);

  return (
    <View style={styles.recordWrapper}>
      {/* Timeline connector */}
      <View style={styles.timeline}>
        <View style={[styles.timelineDot, { backgroundColor: statusColor }]} />
        <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
      </View>

      <View style={[styles.recordCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.recordHeader}>
          <Text style={styles.recordIcon}>{getSyncTypeIcon(record.type)}</Text>
          <View style={styles.recordInfo}>
            <Text style={[styles.recordTitle, { color: colors.textPrimary }]}>
              {formatSyncSummary(record)}
            </Text>
            <Text style={[styles.recordTime, { color: colors.textTertiary }]}>
              {formatRelativeTime(record.timestamp)}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
            <Text style={[styles.statusBadgeText, { color: statusColor }]}>
              {record.status}
            </Text>
          </View>
        </View>
        {record.message && (
          <Text style={[styles.recordMessage, { color: colors.textSecondary }]}>
            {record.message}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing['3xl'],
    paddingBottom: Spacing.xl,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.xs,
    marginTop: Spacing.xs,
    fontFamily: 'SpaceMono',
  },
  clearButton: {
    fontSize: Typography.fontSize.sm,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: Spacing['7xl'],
    gap: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  syncActions: {
    gap: Spacing.lg,
  },
  syncActionsTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  syncActionsRepo: {
    fontSize: Typography.fontSize.sm,
    fontFamily: 'SpaceMono',
  },
  progressContainer: {
    gap: Spacing.sm,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: Typography.fontSize.xs,
  },
  syncButtons: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  syncButton: {
    flex: 1,
  },
  authPrompt: {
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing['3xl'],
  },
  authPromptIcon: { fontSize: 32 },
  authPromptTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
  authPromptDesc: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
    lineHeight: Typography.fontSize.sm * 1.6,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: Typography.letterSpacing.widest,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['4xl'],
    gap: Spacing.md,
  },
  emptyIcon: { fontSize: 40 },
  emptyTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
  emptySubtitle: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
    paddingHorizontal: Spacing['3xl'],
  },
  recordWrapper: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  timeline: {
    alignItems: 'center',
    width: 20,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 14,
  },
  timelineLine: {
    flex: 1,
    width: 1,
    marginTop: 4,
  },
  recordCard: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.xl,
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  recordIcon: { fontSize: 16 },
  recordInfo: { flex: 1 },
  recordTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  recordTime: {
    fontSize: Typography.fontSize.xs,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  statusBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
  },
  recordMessage: {
    fontSize: Typography.fontSize.xs,
    lineHeight: Typography.fontSize.xs * 1.5,
    fontFamily: 'SpaceMono',
  },
});
