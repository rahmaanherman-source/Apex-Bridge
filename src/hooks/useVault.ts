/**
 * useVault — Credential vault hook
 *
 * Access and manage the AES-256 token vault.
 * Security framed not as a hurdle, but as a fortress of trust.
 */

import { useState, useCallback, useEffect } from 'react';
import { VaultService, type VaultEntry } from '../services/VaultService';

export function useVault() {
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEntries = useCallback(async () => {
    setIsLoading(true);
    try {
      await VaultService.initialize();
      const list = await VaultService.listEntries();
      setEntries(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load vault');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const storeSecret = useCallback(
    async (label: string, service: string, secret: string): Promise<VaultEntry | null> => {
      try {
        const entry = await VaultService.storeSecret(label, service, secret);
        await loadEntries();
        return entry;
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to store secret');
        return null;
      }
    },
    [loadEntries],
  );

  const deleteEntry = useCallback(
    async (id: string) => {
      try {
        await VaultService.deleteEntry(id);
        await loadEntries();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to delete entry');
      }
    },
    [loadEntries],
  );

  return {
    entries,
    isLoading,
    error,
    storeSecret,
    deleteEntry,
    refresh: loadEntries,
  };
}
