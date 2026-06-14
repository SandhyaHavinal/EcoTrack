import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import Challenges from './Challenges';
import { useAuth } from '../context/AuthContext';
import { useEcoTrack } from '../context/EcoTrackContext';

// Mock context hooks
vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../context/EcoTrackContext', () => ({
  useEcoTrack: vi.fn(),
}));

describe('Challenges and Gamification Page', () => {
  const mockJoinChallenge = vi.fn();
  const mockCompleteChallenge = vi.fn();
  const mockAddUserGoal = vi.fn();

  const mockUserProfile = {
    userId: 'mock_user_123',
    name: 'Eco Pioneer',
    points: 750, // Level 2 (750 / 500 = 1 + 1)
    badges: [
      { id: 'welcome', title: 'Eco Beginner', description: 'Started the journey', earnedAt: '2026-06-14', icon: '🌱' }
    ],
    goals: [
      { id: 'g1', category: 'transport', target: 20, current: 5, status: 'active', deadline: '2026-07-14' }
    ]
  };

  const mockChallenges = [
    { challengeId: 'c1', title: 'No Car Day', description: 'Leave car home', category: 'transport', rewardPoints: 100, durationDays: 1, icon: '🚲', status: 'active' }
  ];

  beforeEach(() => {
    vi.resetAllMocks();
    (useAuth as any).mockReturnValue({
      userProfile: mockUserProfile,
    });
    (useEcoTrack as any).mockReturnValue({
      challenges: mockChallenges,
      userChallenges: [],
      joinChallenge: mockJoinChallenge,
      completeChallenge: mockCompleteChallenge,
      addUserGoal: mockAddUserGoal,
      updateGoalStatus: vi.fn(),
    });
  });

  test('calculates and renders user levels and points correctly', () => {
    render(<Challenges />);

    expect(screen.getByText('Level')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // 750 points is Level 2
    expect(screen.getByText('750 lifetime carbon points')).toBeInTheDocument();
    expect(screen.getByText('Eco Beginner')).toBeInTheDocument();
  });

  test('allows joining a listed challenge', async () => {
    render(<Challenges />);

    const joinBtn = screen.getByRole('button', { name: /join challenge/i });
    await act(async () => {
      fireEvent.click(joinBtn);
    });

    expect(mockJoinChallenge).toHaveBeenCalledWith('c1');
  });

  test('allows submitting a custom carbon reduction goal', async () => {
    render(<Challenges />);

    // Click Set New Goal to show modal/form
    const showGoalFormBtn = screen.getByRole('button', { name: /set new goal/i });
    fireEvent.click(showGoalFormBtn);

    // Goal input values
    const categorySelect = screen.getByLabelText('Category');
    const targetInput = screen.getByLabelText('Reduction Target (kg)');
    const deadlineInput = screen.getByLabelText('Deadline');
    const submitBtn = screen.getByRole('button', { name: /create goal/i });

    fireEvent.change(categorySelect, { target: { value: 'electricity' } });
    fireEvent.change(targetInput, { target: { value: '30' } });
    fireEvent.change(deadlineInput, { target: { value: '2026-08-14' } });

    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(mockAddUserGoal).toHaveBeenCalledWith({
      category: 'electricity',
      target: 30,
      deadline: '2026-08-14'
    });
  });
});
