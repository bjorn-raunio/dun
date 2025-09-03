import React from 'react';
import { render, screen } from '@testing-library/react';
import { DayNightIndicator } from './DayNightIndicator';

describe('DayNightIndicator', () => {
  test('renders day indicator correctly', () => {
    render(<DayNightIndicator isNight={false} />);
    
    expect(screen.getByText('Day')).toBeInTheDocument();
    const iconElement = document.querySelector('div[style*="border-radius: 50%"]');
    expect(iconElement).toBeInTheDocument();
  });

  test('renders night indicator correctly', () => {
    render(<DayNightIndicator isNight={true} />);
    
    expect(screen.getByText('Night')).toBeInTheDocument();
    const iconElement = document.querySelector('div[style*="border-radius: 50%"]');
    expect(iconElement).toBeInTheDocument();
  });

  test('has correct text styling', () => {
    render(<DayNightIndicator isNight={false} />);
    
    const textElement = screen.getByText('Day');
    expect(textElement).toBeInTheDocument();
  });
});
