import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import EducationalHub from './EducationalHub';
import { useEcoTrack } from '../context/EcoTrackContext';

// Mock the useEcoTrack hook
vi.mock('../context/EcoTrackContext', () => ({
  useEcoTrack: vi.fn(),
}));

describe('EducationalHub Page', () => {
  const mockArticles = [
    {
      articleId: 'a1',
      title: 'Guide to Save Energy',
      summary: 'Learn simple ways to reduce your utility bills.',
      content: '### Save Energy\n1. Switch to LED\n2. Turn off standby.',
      category: 'guide',
      coverImage: 'https://example.com/image.jpg',
      author: 'Elena Rostova',
      createdAt: '2026-06-14T12:00:00Z',
    },
    {
      articleId: 'a2',
      title: 'Climate News Update',
      summary: 'Latest updates on climate change policies.',
      content: 'Major global carbon taxes introduced.',
      category: 'news',
      coverImage: 'https://example.com/image.jpg',
      author: 'Marcus Vance',
      createdAt: '2026-06-14T12:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.resetAllMocks();
    (useEcoTrack as any).mockReturnValue({
      articles: mockArticles,
    });
  });

  test('renders all articles initially', () => {
    render(<EducationalHub />);

    expect(screen.getByText('Guide to Save Energy')).toBeInTheDocument();
    expect(screen.getByText('Climate News Update')).toBeInTheDocument();
  });

  test('filters articles by search text', () => {
    render(<EducationalHub />);

    const searchInput = screen.getByPlaceholderText('Search articles...');
    fireEvent.change(searchInput, { target: { value: 'Energy' } });

    expect(screen.getByText('Guide to Save Energy')).toBeInTheDocument();
    expect(screen.queryByText('Climate News Update')).not.toBeInTheDocument();
  });

  test('filters articles by category pills', () => {
    render(<EducationalHub />);

    const newsPill = screen.getByRole('button', { name: 'News' });
    fireEvent.click(newsPill);

    expect(screen.queryByText('Guide to Save Energy')).not.toBeInTheDocument();
    expect(screen.getByText('Climate News Update')).toBeInTheDocument();
  });

  test('opens article detail view on click and goes back', () => {
    render(<EducationalHub />);

    const articleCard = screen.getByText('Guide to Save Energy');
    fireEvent.click(articleCard);

    // Should render the article content
    expect(screen.getByText('By Elena Rostova')).toBeInTheDocument();
    expect(screen.getByText('Save Energy')).toBeInTheDocument();

    // Click back button
    const backBtn = screen.getByRole('button', { name: 'Back to Eco Hub' });
    fireEvent.click(backBtn);

    // Should return to the grid view
    expect(screen.getByText('Guide to Save Energy')).toBeInTheDocument();
  });
});
