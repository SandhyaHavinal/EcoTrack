import { render, screen, act } from '@testing-library/react';
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';

// Helper component to test useAuth hooks
const TestComponent = () => {
  const { currentUser, userProfile, loginWithEmail, signupWithEmail, logout } = useAuth();
  
  return (
    <div>
      <div data-testid="user-email">{currentUser?.email || 'none'}</div>
      <div data-testid="profile-name">{userProfile?.name || 'none'}</div>
      <button 
        onClick={() => signupWithEmail('test@example.com', 'password123', 'Eco Pioneer')}
        data-testid="signup-btn"
      >
        Sign Up
      </button>
      <button 
        onClick={() => loginWithEmail('test@example.com', 'password123')}
        data-testid="login-btn"
      >
        Log In
      </button>
      <button 
        onClick={() => logout()}
        data-testid="logout-btn"
      >
        Log Out
      </button>
    </div>
  );
};

describe('AuthContext (Offline Simulation Mode)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  test('provides initial unauthenticated state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('user-email')).toHaveTextContent('none');
    expect(screen.getByTestId('profile-name')).toHaveTextContent('none');
  });

  test('allows signing up with email and password in simulated mode', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const signupBtn = screen.getByTestId('signup-btn');
    await act(async () => {
      signupBtn.click();
    });

    expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    expect(screen.getByTestId('profile-name')).toHaveTextContent('Eco Pioneer');

    // Should store in localStorage
    const storedAuth = JSON.parse(localStorage.getItem('ecotrack_simulated_auth') || '[]');
    expect(storedAuth.length).toBe(1);
    expect(storedAuth[0].email).toBe('test@example.com');
    expect(storedAuth[0].name).toBe('Eco Pioneer');
  });

  test('allows logging in with simulated email/password credentials', async () => {
    // Seed localStorage with a mock user
    const mockUser = {
      uid: 'mock_123',
      email: 'test@example.com',
      password: 'password123',
      name: 'Eco Pioneer',
    };
    localStorage.setItem('ecotrack_simulated_auth', JSON.stringify([mockUser]));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginBtn = screen.getByTestId('login-btn');
    await act(async () => {
      loginBtn.click();
    });

    expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    expect(screen.getByTestId('profile-name')).toHaveTextContent('Eco Pioneer');
  });

  test('clears auth state on logout', async () => {
    // Seed current session
    localStorage.setItem('ecotrack_current_user', JSON.stringify({
      uid: 'mock_123',
      email: 'test@example.com',
      displayName: 'Eco Pioneer'
    }));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const logoutBtn = screen.getByTestId('logout-btn');
    await act(async () => {
      logoutBtn.click();
    });

    expect(screen.getByTestId('user-email')).toHaveTextContent('none');
    expect(screen.getByTestId('profile-name')).toHaveTextContent('none');
    expect(localStorage.getItem('ecotrack_current_user')).toBeNull();
  });
});
