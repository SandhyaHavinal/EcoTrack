import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import Calculator from './Calculator';
import { useEcoTrack } from '../context/EcoTrackContext';
import { useNavigate } from 'react-router-dom';

// Mock the contexts and router hooks
vi.mock('../context/EcoTrackContext', () => ({
  useEcoTrack: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}));

describe('Calculator Wizard Page', () => {
  const mockAddActivity = vi.fn();
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    (useEcoTrack as any).mockReturnValue({
      addActivity: mockAddActivity,
    });
    (useNavigate as any).mockReturnValue(mockNavigate);
  });

  test('renders step 1 (Transportation) initially', () => {
    render(<Calculator />);

    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument();
    expect(screen.getByText('Transportation Habits')).toBeInTheDocument();
    expect(screen.getByText('Petrol Car')).toBeInTheDocument();
  });

  test('navigates through the wizard steps', () => {
    render(<Calculator />);

    // Step 1: Transport
    const nextBtn = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextBtn);

    // Step 2: Energy & Water
    expect(screen.getByText('Step 2 of 3')).toBeInTheDocument();
    expect(screen.getByText('Electricity & Water Usage')).toBeInTheDocument();

    const prevBtn = screen.getByRole('button', { name: /back/i });
    fireEvent.click(prevBtn);

    // Back to Step 1
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument();
  });

  test('calculates running estimates and submits successfully', async () => {
    render(<Calculator />);

    // Step 1: Transport Next
    let nextBtn = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextBtn);

    // Step 2: Energy & Water Next
    nextBtn = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextBtn);

    // Step 3: Diet & Waste
    expect(screen.getByText('Step 3 of 3')).toBeInTheDocument();
    expect(screen.getByText('Dietary Habits & Waste')).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: /submit log/i });
    mockAddActivity.mockResolvedValueOnce({ activityId: 'mock_act_99' });

    await act(async () => {
      fireEvent.click(submitBtn);
    });

    // Should call addActivity hook
    expect(mockAddActivity).toHaveBeenCalled();

    // Success Screen step 4
    expect(screen.getByText('Activity Logged Successfully!')).toBeInTheDocument();
    
    // Clicking View Dashboard should navigate
    const dashboardBtn = screen.getByRole('button', { name: /view dashboard/i });
    fireEvent.click(dashboardBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
