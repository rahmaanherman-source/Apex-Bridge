/**
 * Auth Store — Zustand
 *
 * Manages GitHub authentication state.
 * The authentication flow feels like a handoff, not a login wall.
 * When the user connects, a bridge is built — local sanctuary to global repo.
 */

import { create } from 'zustand';

export interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatarUrl: string;
  bio: string | null;
  publicRepos: number;
}

export interface GitHubRepo {
  id: number;
  fullName: string;
  name: string;
  owner: string;
  description: string | null;
  defaultBranch: string;
  isPrivate: boolean;
  language: string | null;
  updatedAt: string;
  htmlUrl: string;
  cloneUrl: string;
}

interface AuthState {
  /** Whether the user has completed onboarding */
  hasCompletedOnboarding: boolean;
  /** Whether the user is authenticated with GitHub */
  isAuthenticated: boolean;
  /** Current GitHub user profile */
  user: GitHubUser | null;
  /** Connected repositories */
  repositories: GitHubRepo[];
  /** Currently active repository */
  activeRepository: GitHubRepo | null;
  /** Current branch name */
  currentBranch: string;
  /** Whether an auth flow is in progress */
  isAuthenticating: boolean;
  /** Authentication error message */
  authError: string | null;

  // ── Actions ────────────────────────────────────────────────────────────────
  completeOnboarding: () => void;
  setAuthenticated: (user: GitHubUser) => void;
  setRepositories: (repos: GitHubRepo[]) => void;
  setActiveRepository: (repo: GitHubRepo | null) => void;
  setCurrentBranch: (branch: string) => void;
  setAuthenticating: (loading: boolean) => void;
  setAuthError: (error: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  hasCompletedOnboarding: false,
  isAuthenticated: false,
  user: null,
  repositories: [],
  activeRepository: null,
  currentBranch: 'main',
  isAuthenticating: false,
  authError: null,

  completeOnboarding: () => set({ hasCompletedOnboarding: true }),

  setAuthenticated: (user) =>
    set({ isAuthenticated: true, user, authError: null, isAuthenticating: false }),

  setRepositories: (repositories) => set({ repositories }),

  setActiveRepository: (repo) =>
    set({
      activeRepository: repo,
      currentBranch: repo?.defaultBranch ?? 'main',
    }),

  setCurrentBranch: (branch) => set({ currentBranch: branch }),

  setAuthenticating: (loading) => set({ isAuthenticating: loading }),

  setAuthError: (error) =>
    set({ authError: error, isAuthenticating: false }),

  logout: () =>
    set({
      isAuthenticated: false,
      user: null,
      repositories: [],
      activeRepository: null,
      currentBranch: 'main',
      authError: null,
    }),
}));
