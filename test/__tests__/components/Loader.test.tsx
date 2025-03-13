import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import Loader from '../../../src/components/Loader';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => React.createElement('div', props, children),
    p: ({ children, ...props }: any) => React.createElement('p', props, children)
  }
}));

describe('Loader Component', () => {
  it('renders with default message', () => {
    render(React.createElement(Loader));
    
    // Check if the default loading message is displayed
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    const customMessage = 'Custom loading message';
    render(React.createElement(Loader, { message: customMessage }));
    
    // Check if the custom message is displayed
    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });
});