import { render, screen, act } from '@testing-library/react';
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { EcoTrackProvider, useEcoTrack } from './EcoTrackContext';
import { useAuth } from './AuthContext';

// Mock the useAuth hook
vi.mock('./AuthContext', () => ({
  useAuth: vi.fn(),
}));

const TestComponent = () => {
  const { 
    activities, 
    challenges, 
    userChallenges, 
    addActivity, 
    joinChallenge, 
    completeChallenge 
  } = useEcoTrack();

  return (
    <div>
      <div data-testid="activity-count">{activities.length}</div>
      <div data-testid="challenge-count">{challenges.length}</div>
      <div data-testid="user-challenge-count">{userChallenges.length}</div>
      <button 
        onClick={() => addActivity({
          date: '2026-06-14',
          transport: { mode: 'car_petrol', distance: 100, emissions: 0 },
          electricity: { kwh: 10, emissions: 0 },
          water: { liters: 100, emissions: 0 },
          food: { dietType: 'mixed', emissions: 0 },
          waste: { weight: 5, recycled: 1, composted: 1, emissions: 0 }
        })}
        data-testid="add-activity-btn"
      >
        Add Activity
      </button>
      <button 
        onClick={() => joinChallenge('c1')}
        data-testid="join-challenge-btn"
      >
        Join Challenge
      </button>
      <button 
        onClick={() => completeChallenge('c1')}
        data-testid="complete-challenge-btn"
      >
        Complete Challenge
      </button>
    </div>
  );
};

describe('EcoTrackContext', () => {
  let mockUserProfile: any;
  let mockUpdateProfileData: any;

  beforeEach(() => {
    localStorage.clear();
    mockUserProfile = {
      userId: 'mock_user_123',
      name: 'Eco Pioneer',
      email: 'test@example.com',
      points: 150,
      carbonScore: 75,
      totalEmissions: 320,
      badges: [],
      goals: [],
    };
    mockUpdateProfileData = vi.fn();
    (useAuth as any).mockReturnValue({
      currentUser: { uid: 'mock_user_123', email: 'test@example.com' },
      userProfile: mockUserProfile,
      updateProfileData: mockUpdateProfileData,
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  test('provides initial data setup and presets', () => {
    render(
      <EcoTrackProvider>
        <TestComponent />
      </EcoTrackProvider>
    );

    expect(screen.getByTestId('challenge-count')).toHaveTextContent('5'); // 5 default preset challenges
    expect(screen.getByTestId('activity-count')).toHaveTextContent('0');
  });

  test('allows adding user activity with correct carbon calculation inputs', async () => {
    render(
      <EcoTrackProvider>
        <TestComponent />
      </EcoTrackProvider>
    );

    const btn = screen.getByTestId('add-activity-btn');
    await act(async () => {
      btn.click();
    });

    // Activity should be added
    expect(screen.getByTestId('activity-count')).toHaveTextContent('1');

    // Profile data should be updated with new emissions/scores
    expect(mockUpdateProfileData).toHaveBeenCalled();
  });

  test('allows joining and completing a preset challenge', async () => {
    render(
      <EcoTrackProvider>
        <TestComponent />
      </EcoTrackProvider>
    );

    const joinBtn = screen.getByTestId('join-challenge-btn');
    await act(async () => {
      joinBtn.click();
    });

    expect(screen.getByTestId('user-challenge-count')).toHaveTextContent('1');

    const completeBtn = screen.getByTestId('complete-challenge-btn');
    await act(async () => {
      completeBtn.click();
    });

    // Profile should receive rewards points (e.g. +100 for 'c1')
    expect(mockUpdateProfileData).toHaveBeenCalled();
  });
});
