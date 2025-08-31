import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders game app', () => {
  render(<App />);
  // Check that the game app renders (it should have a map container)
  const mapContainer = document.querySelector('.map-pan-container');
  expect(mapContainer).toBeInTheDocument();
});
