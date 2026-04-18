/**
 * Component Tests: DimensionBar
 */
import { render, screen } from '@testing-library/react';
import DimensionBar from '@/app/components/DimensionBar';

const mockMeta = { label: 'Precision', letter: 'P', maxScore: 20 };
const mockData = { score: 16, maxScore: 20, feedback: 'Good specificity in your prompt.' };

describe('DimensionBar Component', () => {
  it('renders dimension label and score', () => {
    render(<DimensionBar dimKey="precision" data={mockData} meta={mockMeta} />);
    expect(screen.getByText('Precision')).toBeInTheDocument();
    expect(screen.getByText('16/20')).toBeInTheDocument();
  });

  it('renders dimension letter badge', () => {
    render(<DimensionBar dimKey="precision" data={mockData} meta={mockMeta} />);
    expect(screen.getByText('P')).toBeInTheDocument();
  });

  it('renders feedback text', () => {
    render(<DimensionBar dimKey="precision" data={mockData} meta={mockMeta} />);
    expect(screen.getByText('Good specificity in your prompt.')).toBeInTheDocument();
  });

  it('renders progress bar with correct aria attributes', () => {
    render(<DimensionBar dimKey="precision" data={mockData} meta={mockMeta} />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '16');
    expect(progressbar).toHaveAttribute('aria-valuemax', '20');
    expect(progressbar).toHaveAttribute('aria-label', 'Precision: 16 out of 20');
  });

  it('applies blur when blurred prop is true', () => {
    const { container } = render(
      <DimensionBar dimKey="precision" data={mockData} meta={mockMeta} blurred={true} />
    );
    const blurredElements = container.querySelectorAll('.blur-sm');
    expect(blurredElements.length).toBeGreaterThan(0);
  });

  it('returns null when data or meta is undefined', () => {
    const { container: noData } = render(
      <DimensionBar dimKey="precision" data={undefined} meta={mockMeta} />
    );
    expect(noData.firstChild).toBeNull();

    const { container: noMeta } = render(
      <DimensionBar dimKey="precision" data={mockData} meta={undefined} />
    );
    expect(noMeta.firstChild).toBeNull();
  });

  it('shows emotional hint for low scores', () => {
    const lowData = { score: 8, maxScore: 20, feedback: 'Needs work.' };
    const feedback = { low: 'Try adding more detail', high: 'Excellent!' };
    render(<DimensionBar dimKey="precision" data={lowData} meta={mockMeta} feedback={feedback} />);
    expect(screen.getByText('Try adding more detail')).toBeInTheDocument();
  });

  it('shows emotional hint for high scores', () => {
    const highData = { score: 18, maxScore: 20, feedback: 'Great job!' };
    const feedback = { low: 'Needs work', high: 'Excellent work!' };
    render(<DimensionBar dimKey="precision" data={highData} meta={mockMeta} feedback={feedback} />);
    expect(screen.getByText('Excellent work!')).toBeInTheDocument();
  });

  it('applies color based on score percentage', () => {
    // High score (85%+) should be green
    const { container } = render(
      <DimensionBar dimKey="precision" data={{ score: 18, maxScore: 20, feedback: 'Great' }} meta={mockMeta} />
    );
    const badge = container.querySelector('span.w-7');
    expect((badge as HTMLElement)?.style.color).toBe('rgb(16, 185, 129)'); // emerald #10b981
  });
});
