/**
 * useGitHub — GitHub integration hook
 *
 * Authentication and sync operations.
 * The handshake between local sanctuary and the global repository.
 */

import { useState, useCallback } from 'react';
import { GitHubService } from '../services/GitHubService';
import { useAuthStore } from '../store/authStore';

export function useGitHub() {
  const {
    isAuthenticated,
    isAuthenticating,
    user,
    repositories,
    activeRepository,
    currentBranch,
    authError,
    setAuthenticated,
    setRepositories,
    setActiveRepository,
    setCurrentBranch,
    setAuthenticating,
    setAuthError,
    logout,
  } = useAuthStore();

  const [branches, setBranches] = useState<string[]>([]);

  /** Authenticates with a GitHub Personal Access Token */
  const authenticateWithToken = useCallback(
    async (token: string): Promise<boolean> => {
      setAuthenticating(true);
      setAuthError(null);

      try {
        const githubUser = await GitHubService.validateToken(token);
        await GitHubService.storeToken(token);
        setAuthenticated(githubUser);
        return true;
      } catch (error) {
        setAuthError(
          error instanceof Error ? error.message : 'Authentication failed',
        );
        return false;
      }
    },
    [setAuthenticated, setAuthenticating, setAuthError],
  );

  /** Fetches the authenticated user's repositories */
  const fetchRepositories = useCallback(async () => {
    try {
      const repos = await GitHubService.listRepositories();
      setRepositories(repos);
      return repos;
    } catch (error) {
      setAuthError(
        error instanceof Error ? error.message : 'Failed to fetch repositories',
      );
      return [];
    }
  }, [setRepositories, setAuthError]);

  /** Fetches branches for the active repository */
  const fetchBranches = useCallback(async () => {
    if (!activeRepository) return [];
    try {
      const branchList = await GitHubService.listBranches(
        activeRepository.owner,
        activeRepository.name,
      );
      setBranches(branchList);
      return branchList;
    } catch {
      return [];
    }
  }, [activeRepository]);

  return {
    isAuthenticated,
    isAuthenticating,
    user,
    repositories,
    activeRepository,
    currentBranch,
    authError,
    branches,
    authenticateWithToken,
    fetchRepositories,
    fetchBranches,
    setActiveRepository,
    setCurrentBranch,
    logout,
  };
}
