/**
 * Component Tests: ScoreCircle
 */
import { render, screen } from '@testing-library/react';
import ScoreCircle from '@/app/components/ScoreCircle';

const mockConfig = {
  min: 90,
  color: '#10b981',
  label: 'Exceptional',
  emoji: '🏆',
  message: 'Prompt Master!',
  bg: 'from-emerald-500/10',
};

describe('ScoreCircle Component', () => {
  it('renders score value', () => {
    render(<ScoreCircle score={85} grade="A" config={mockConfig} />);
    const scoreElements = screen.getAllByText('85');
    expect(scoreElements.length).toBeGreaterThan(0);
  });

  it('renders grade label', () => {
    render(<ScoreCircle score={92} grade="S" config={mockConfig} />);
    const gradeElements = screen.getAllByText(/Grade S/);
    expect(gradeElements.length).toBeGreaterThan(0);
  });

  it('renders PROMPT Score text', () => {
    render(<ScoreCircle score={75} grade="B" config={mockConfig} />);
    const labels = screen.getAllByText('PROMPT Score');
    expect(labels.length).toBeGreaterThan(0);
  });

  it('renders SVG with correct aria-label', () => {
    render(<ScoreCircle score={60} grade="C" config={mockConfig} />);
    const svgs = screen.getAllByRole('img');
    expect(svgs.some((svg) => svg.getAttribute('aria-label')?.includes('60'))).toBe(true);
  });

  it('renders both desktop and mobile sizes', () => {
    const { container } = render(<ScoreCircle score={88} grade="A" config={mockConfig} size={220} mobileSize={160} />);
    const desktopWrapper = container.querySelector('.hidden.sm\\:block');
    const mobileWrapper = container.querySelector('.block.sm\\:hidden');
    expect(desktopWrapper).toBeInTheDocument();
    expect(mobileWrapper).toBeInTheDocument();
  });

  it('applies config color to score text', () => {
    render(<ScoreCircle score={95} grade="S" config={mockConfig} />);
    const scoreElements = screen.getAllByText('95');
    expect(scoreElements.some((el) => el.style.color === 'rgb(16, 185, 129)')).toBe(true);
  });
});
