import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

// Mock the supabase client
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      onAuthStateChange: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn(),
    },
  },
}));

describe('useAuth Hook', () => {
  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with loading state', () => {
    const mockUnsubscribe = jest.fn();
    (supabase.auth.onAuthStateChange as jest.Mock).mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should set user when session exists', async () => {
    const mockUnsubscribe = jest.fn();
    let authCallback: ((event: string, session: any) => void) | null = null;

    (supabase.auth.onAuthStateChange as jest.Mock).mockImplementation((callback) => {
      authCallback = callback;
      return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
    });

    const { result } = renderHook(() => useAuth());

    // Simulate auth state change with user
    act(() => {
      authCallback?.('SIGNED_IN', { user: mockUser, session: {} });
    });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.loading).toBe(false);
    });
  });

  it('should clear user when session is null', async () => {
    const mockUnsubscribe = jest.fn();
    let authCallback: ((event: string, session: any) => void) | null = null;

    (supabase.auth.onAuthStateChange as jest.Mock).mockImplementation((callback) => {
      authCallback = callback;
      return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
    });

    const { result } = renderHook(() => useAuth());

    // First set a user
    act(() => {
      authCallback?.('SIGNED_IN', { user: mockUser, session: {} });
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    // Then clear the session
    act(() => {
      authCallback?.('SIGNED_OUT', { user: null, session: null });
    });

    await waitFor(() => {
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.loading).toBe(false);
    });
  });

  it('should handle sign out', async () => {
    const mockUnsubscribe = jest.fn();
    (supabase.auth.onAuthStateChange as jest.Mock).mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    });
    (supabase.auth.signOut as jest.Mock).mockResolvedValue({ error: null });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signOut();
    });

    expect(supabase.auth.signOut).toHaveBeenCalled();
  });

  it('should handle sign out error', async () => {
    const mockUnsubscribe = jest.fn();
    const mockError = new Error('Sign out failed');
    
    (supabase.auth.onAuthStateChange as jest.Mock).mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    });
    (supabase.auth.signOut as jest.Mock).mockResolvedValue({ error: mockError });

    const { result } = renderHook(() => useAuth());

    // Should not throw error
    await act(async () => {
      await expect(result.current.signOut()).resolves.not.toThrow();
    });

    expect(supabase.auth.signOut).toHaveBeenCalled();
  });

  it('should cleanup subscription on unmount', () => {
    const mockUnsubscribe = jest.fn();
    
    (supabase.auth.onAuthStateChange as jest.Mock).mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    });

    const { unmount } = renderHook(() => useAuth());

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it('should handle TOKEN_REFRESHED event', async () => {
    const mockUnsubscribe = jest.fn();
    let authCallback: ((event: string, session: any) => void) | null = null;

    (supabase.auth.onAuthStateChange as jest.Mock).mockImplementation((callback) => {
      authCallback = callback;
      return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
    });

    const { result } = renderHook(() => useAuth());

    // Simulate token refresh
    act(() => {
      authCallback?.('TOKEN_REFRESHED', { user: mockUser, session: {} });
    });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  it('should handle USER_UPDATED event', async () => {
    const mockUnsubscribe = jest.fn();
    let authCallback: ((event: string, session: any) => void) | null = null;
    const updatedUser = { ...mockUser, email: 'updated@example.com' };

    (supabase.auth.onAuthStateChange as jest.Mock).mockImplementation((callback) => {
      authCallback = callback;
      return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
    });

    const { result } = renderHook(() => useAuth());

    // Simulate user update
    act(() => {
      authCallback?.('USER_UPDATED', { user: updatedUser, session: {} });
    });

    await waitFor(() => {
      expect(result.current.user).toEqual(updatedUser);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  it('should handle PASSWORD_RECOVERY event', async () => {
    const mockUnsubscribe = jest.fn();
    let authCallback: ((event: string, session: any) => void) | null = null;

    (supabase.auth.onAuthStateChange as jest.Mock).mockImplementation((callback) => {
      authCallback = callback;
      return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
    });

    const { result } = renderHook(() => useAuth());

    // Simulate password recovery (should keep user signed in)
    act(() => {
      authCallback?.('PASSWORD_RECOVERY', { user: mockUser, session: {} });
    });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });
});