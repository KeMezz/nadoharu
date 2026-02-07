import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from './page';

describe('Home', () => {
  it('renders the home page with title', () => {
    render(<Home />);
    expect(screen.getByText('나도하루')).toBeDefined();
    expect(screen.getByText('일상을 공유하고 공감하는 소셜 플랫폼')).toBeDefined();
  });
});
