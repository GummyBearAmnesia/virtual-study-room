import React from 'react';
import { render, screen } from '@testing-library/react';
import UserBadges from '../UserBadges';

describe('UserBadges', () => {
  const mockProps = {
    userId: 'test-user-123',
    userBadges: ['badge_1', 'badge_2', 'badge_3']
  };

  test('renders user badges', () => {
    render(<UserBadges {...mockProps} />);
    const badges = screen.getAllByRole('img');
    expect(badges.length).toBeGreaterThan(0);
  });

  test('handles empty badge list', () => {
    render(<UserBadges userId="test-user-123" userBadges={[]} />);
    const badges = screen.getAllByRole('img');
    expect(badges.length).toBe(8);
    const earnedBadges = screen.queryAllByText(/Earned:/);
    expect(earnedBadges.length).toBe(0); //no badges should be marked as earned
  });

  test('handles null badge list', () => {
    render(<UserBadges userId="test-user-123" userBadges={null} />);
    const badges = screen.getAllByRole('img');
    expect(badges.length).toBe(8);
    const earnedBadges = screen.queryAllByText(/Earned:/);
    expect(earnedBadges.length).toBe(0); //no badges should be marked as earned
  });

  test('handles undefined badge list', () => {
    render(<UserBadges userId="test-user-123" userBadges={undefined} />);
    const badges = screen.getAllByRole('img');
    expect(badges.length).toBe(8);
    const earnedBadges = screen.queryAllByText(/Earned:/);
    expect(earnedBadges.length).toBe(0); //no badges should be marked as earned
  });

  test('displays earned date when badge is earned', () => {
    const earnedDate = '2023-03-14T00:00:00.000Z';
    const formattedDate = new Date(earnedDate).toLocaleDateString();
    const earnedBadge = { reward_number: 1, date_earned: earnedDate };

    render(<UserBadges userId="test-user-123" userBadges={[earnedBadge]} />);
    expect(screen.getByText(`Earned: ${formattedDate}`)).toBeInTheDocument();
  });

  test('does not display earned date for badge that is not earned', () => {
    const userBadges = [
      { reward_number: 2, date_earned: '2023-02-15T00:00:00.000Z' },
      { reward_number: 3, date_earned: '2023-03-01T00:00:00.000Z' },
    ];
  
    render(<UserBadges userId="test-user-123" userBadges={userBadges} />);

    const earnedLabels = screen.queryAllByText(/Earned:/);
    expect(earnedLabels).toHaveLength(2);

    const formattedDate = new Date('2023-02-15T00:00:00.000Z').toLocaleDateString();
    expect(screen.getByText(`Earned: ${formattedDate}`)).toBeInTheDocument();
  });

});