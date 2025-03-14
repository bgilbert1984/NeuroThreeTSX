import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Loader from './Loader';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>
  }
}));

describe('Loader Component', () => {
  it('renders with default message', () => {
    render(<Loader />);
    
    // Check if the default loading message is displayed
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    const customMessage = 'Custom loading message';
    render(<Loader message={customMessage} />);
    
    // Check if the custom message is displayed
    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });
});