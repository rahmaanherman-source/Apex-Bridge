/**
 * VaultScreen — The AES-256 Token Vault
 *
 * "Security framed not as a bureaucratic hurdle, but as a fortress of trust."
 * GitHub tokens and credentials are stored here, encrypted at rest.
 * The vault is where your keys live — safe, sovereign, yours.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  Modal,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../hooks/useTheme';
import { useVault } from '../hooks/useVault';
import { useGitHub } from '../hooks/useGitHub';
import { BreezeCard } from '../components/common/BreezeCard';
import { BreezeButton } from '../components/common/BreezeButton';
import { LoadingIndicator } from '../components/common/LoadingIndicator';
import { Spacing, BorderRadius } from '../theme/spacing';
import { Typography } from '../theme/typography';
import type { VaultEntry } from '../services/VaultService';

export function VaultScreen() {
  const { colors } = useTheme();
  const { entries, isLoading, error, storeSecret, deleteEntry } = useVault();
  const { authenticateWithToken, isAuthenticating, authError } = useGitHub();
  const [showAddModal, setShowAddModal] = useState(false);

  const handleDelete = useCallback(
    (entry: VaultEntry) => {
      Alert.alert(
        'Delete Entry',
        `Delete "${entry.label}"? This cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              await deleteEntry(entry.id);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            },
          },
        ],
      );
    },
    [deleteEntry],
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>🔐 Vault</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textTertiary }]}>
            AES-256 encrypted credentials
          </Text>
        </View>
        <BreezeButton
          label="+ Add Token"
          onPress={() => setShowAddModal(true)}
          variant="secondary"
          size="sm"
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Security note */}
        <BreezeCard style={styles.securityNote}>
          <Text style={styles.lockIcon}>🛡️</Text>
          <View style={styles.securityInfo}>
            <Text style={[styles.securityTitle, { color: colors.textPrimary }]}>
              Your secrets are protected
            </Text>
            <Text style={[styles.securityDesc, { color: colors.textSecondary }]}>
              All tokens are encrypted with AES-256 and stored in your device's secure enclave.
              They never leave your device in plaintext.
            </Text>
          </View>
        </BreezeCard>

        {/* Loading */}
        {isLoading && (
          <LoadingIndicator message="Opening vault..." />
        )}

        {/* Error */}
        {error && (
          <BreezeCard>
            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          </BreezeCard>
        )}

        {/* Entries */}
        {!isLoading && entries.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔑</Text>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              No stored tokens yet
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Add your GitHub Personal Access Token to enable sync
            </Text>
          </View>
        )}

        {entries.map((entry) => (
          <BreezeCard key={entry.id} style={styles.entryCard} animated>
            <View style={styles.entryRow}>
              <View style={[styles.entryIcon, { backgroundColor: colors.glassLight }]}>
                <Text style={styles.entryIconText}>
                  {entry.service === 'github' ? '🐙' : '🔑'}
                </Text>
              </View>
              <View style={styles.entryInfo}>
                <Text style={[styles.entryLabel, { color: colors.textPrimary }]}>
                  {entry.label}
                </Text>
                <Text style={[styles.entryService, { color: colors.textSecondary }]}>
                  {entry.service} · Added {new Date(entry.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleDelete(entry)}
                style={styles.deleteButton}
              >
                <Text style={[styles.deleteIcon, { color: colors.rose }]}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </BreezeCard>
        ))}
      </ScrollView>

      {/* Add Token Modal */}
      <AddTokenModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={storeSecret}
        onGitHubAuth={authenticateWithToken}
        isAuthenticating={isAuthenticating}
        authError={authError}
        colors={colors}
      />
    </SafeAreaView>
  );
}

// ── Add Token Modal ──────────────────────────────────────────────────────────

interface AddTokenModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (label: string, service: string, secret: string) => Promise<any>;
  onGitHubAuth: (token: string) => Promise<boolean>;
  isAuthenticating: boolean;
  authError: string | null;
  colors: any;
}

function AddTokenModal({
  visible,
  onClose,
  onAdd,
  onGitHubAuth,
  isAuthenticating,
  authError,
  colors,
}: AddTokenModalProps) {
  const [label, setLabel] = useState('GitHub Personal Access Token');
  const [service, setService] = useState('github');
  const [token, setToken] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = useCallback(async () => {
    if (!token.trim()) return;
    setIsSaving(true);

    // If it's a GitHub token, validate it first
    if (service === 'github') {
      const success = await onGitHubAuth(token.trim());
      if (!success) {
        setIsSaving(false);
        return;
      }
    }

    await onAdd(label, service, token.trim());
    setIsSaving(false);
    setToken('');
    onClose();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [token, service, label, onAdd, onGitHubAuth, onClose]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
          <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
            Add Credential
          </Text>

          <View style={styles.modalField}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Label</Text>
            <TextInput
              value={label}
              onChangeText={setLabel}
              style={[styles.fieldInput, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.surface }]}
              placeholderTextColor={colors.textPlaceholder}
            />
          </View>

          <View style={styles.modalField}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Service</Text>
            <TextInput
              value={service}
              onChangeText={setService}
              style={[styles.fieldInput, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.surface }]}
              placeholder="github"
              placeholderTextColor={colors.textPlaceholder}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.modalField}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Token</Text>
            <TextInput
              value={token}
              onChangeText={setToken}
              secureTextEntry
              style={[styles.fieldInput, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.surface }]}
              placeholder="ghp_••••••••••••"
              placeholderTextColor={colors.textPlaceholder}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {authError && (
            <Text style={[styles.authError, { color: colors.error }]}>{authError}</Text>
          )}

          <View style={styles.modalActions}>
            <BreezeButton label="Cancel" onPress={onClose} variant="ghost" size="md" />
            <BreezeButton
              label="Save Securely"
              onPress={handleSave}
              variant="primary"
              size="md"
              isLoading={isSaving || isAuthenticating}
              disabled={!token.trim()}
            />
          </View>
        </View>
      </View>
    </Modal>
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
    letterSpacing: Typography.letterSpacing.wide,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: Spacing['7xl'],
    gap: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.lg,
  },
  lockIcon: { fontSize: 24 },
  securityInfo: { flex: 1 },
  securityTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.xs,
  },
  securityDesc: {
    fontSize: Typography.fontSize.sm,
    lineHeight: Typography.fontSize.sm * 1.6,
  },
  errorText: {
    fontSize: Typography.fontSize.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['5xl'],
    gap: Spacing.md,
  },
  emptyIcon: { fontSize: 48 },
  emptyTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
  emptySubtitle: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
    paddingHorizontal: Spacing['3xl'],
  },
  entryCard: {
    padding: Spacing.xl,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  entryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  entryIconText: { fontSize: 20 },
  entryInfo: { flex: 1 },
  entryLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
  entryService: { fontSize: Typography.fontSize.sm, marginTop: 2 },
  deleteButton: { padding: Spacing.md },
  deleteIcon: { fontSize: 18 },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    borderWidth: 1,
    padding: Spacing['3xl'],
    gap: Spacing.xl,
    paddingBottom: Spacing['5xl'],
  },
  modalTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
  },
  modalField: { gap: Spacing.sm },
  fieldLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    letterSpacing: Typography.letterSpacing.wide,
  },
  fieldInput: {
    fontSize: Typography.fontSize.base,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  authError: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginTop: Spacing.md,
  },
});
