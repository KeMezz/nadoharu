import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from './page';

describe('홈 페이지', () => {
  it('제목과 설명을 렌더링한다', () => {
    render(<Home />);
    expect(screen.getByText('나도하루')).toBeInTheDocument();
    expect(screen.getByText('일상을 공유하고 공감하는 소셜 플랫폼')).toBeInTheDocument();
  });
});
