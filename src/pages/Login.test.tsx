import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import Login from './Login';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Mock context hooks
vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}));

describe('Login Page Component', () => {
  const mockLoginWithEmail = vi.fn();
  const mockSignupWithEmail = vi.fn();
  const mockLoginWithGoogle = vi.fn();
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    (useAuth as any).mockReturnValue({
      loginWithEmail: mockLoginWithEmail,
      signupWithEmail: mockSignupWithEmail,
      loginWithGoogle: mockLoginWithGoogle,
    });
    (useNavigate as any).mockReturnValue(mockNavigate);
  });

  test('renders login tab by default', () => {
    render(<Login />);

    // Get the first button named 'Sign In' (the tab)
    const signInTab = screen.getAllByRole('button', { name: 'Sign In' })[0];
    expect(signInTab).toHaveClass('bg-emerald-500');
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/full name/i)).not.toBeInTheDocument();
  });

  test('switches to sign up tab on click', () => {
    render(<Login />);

    const signupTab = screen.getByRole('button', { name: 'Sign Up' });
    fireEvent.click(signupTab);

    expect(signupTab).toHaveClass('bg-emerald-500');
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
  });

  test('submits login credentials correctly', async () => {
    render(<Login />);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    // The submit button is the second button with name 'Sign In' (the first is the tab button)
    const submitBtn = screen.getAllByRole('button', { name: 'Sign In' }).find(
      btn => btn.getAttribute('type') === 'submit'
    ) as HTMLElement;

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    mockLoginWithEmail.mockResolvedValueOnce({ uid: 'mock_uid_123' });

    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(mockLoginWithEmail).toHaveBeenCalledWith('user@example.com', 'password123');
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('submits signup credentials correctly', async () => {
    render(<Login />);

    // Switch to sign up
    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitBtn = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(nameInput, { target: { value: 'Eco Pioneer' } });
    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    mockSignupWithEmail.mockResolvedValueOnce({ uid: 'mock_uid_123' });

    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(mockSignupWithEmail).toHaveBeenCalledWith('user@example.com', 'password123', 'Eco Pioneer');
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('handles Google Sign-in action', async () => {
    render(<Login />);

    const googleBtn = screen.getByRole('button', { name: /google account/i });
    mockLoginWithGoogle.mockResolvedValueOnce({ uid: 'google_uid_999' });

    await act(async () => {
      fireEvent.click(googleBtn);
    });

    expect(mockLoginWithGoogle).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
