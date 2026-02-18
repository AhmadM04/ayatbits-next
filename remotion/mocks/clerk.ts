/**
 * Mock for @clerk/nextjs — stubs for auth components and hooks.
 * These are not needed in a Remotion video render.
 */
import React from 'react';

// Components
export const SignOutButton = ({ children }: { children: React.ReactNode }) => children;
export const SignInButton = ({ children }: { children: React.ReactNode }) => children;
export const SignUpButton = ({ children }: { children: React.ReactNode }) => children;
export const ClerkProvider = ({ children }: { children: React.ReactNode }) => children;
export const UserButton = () => null;
export const SignIn = () => null;
export const SignUp = () => null;

// Hooks
export function useAuth() {
  return {
    isLoaded: true,
    isSignedIn: true,
    userId: 'mock-user-id',
    sessionId: 'mock-session-id',
    getToken: async () => 'mock-token',
  };
}

export function useUser() {
  return {
    isLoaded: true,
    isSignedIn: true,
    user: {
      id: 'mock-user-id',
      firstName: 'Aisha',
      lastName: 'User',
      fullName: 'Aisha User',
      emailAddresses: [],
      imageUrl: '',
    },
  };
}

export function useClerk() {
  return {
    signOut: async () => {},
    openSignIn: () => {},
    openSignUp: () => {},
  };
}

// Server-side mocks
export async function currentUser() {
  return { id: 'mock-user-id', firstName: 'Aisha' };
}

export function auth() {
  return { userId: 'mock-user-id' };
}

