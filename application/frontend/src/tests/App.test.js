import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

test('renders welcome heading', () => {
    render(<App />);
    const headingElement = screen.getByText(/The Study Spot/i); // Or any text present in Welcome.js
    expect(headingElement).toBeInTheDocument();
});
