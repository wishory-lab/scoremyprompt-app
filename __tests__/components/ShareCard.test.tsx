/**
 * Component Tests: ShareCard
 */
import { render, screen, fireEvent } from '@testing-library/react';
import ShareCard from '@/app/components/ShareCard';

// Mock canvas context
const mockGetContext = jest.fn();
const mockToDataURL = jest.fn(() => 'data:image/png;base64,mockdata');

HTMLCanvasElement.prototype.getContext = mockGetContext as unknown as typeof HTMLCanvasElement.prototype.getContext;
HTMLCanvasElement.prototype.toDataURL = mockToDataURL;

describe('ShareCard Component', () => {
  const defaultProps = {
    score: 85,
    grade: 'A' as const,
    gradeLabel: 'Excellent',
    jobRole: 'Marketing',
    percentile: 90,
    dimensions: {
      precision: { score: 18 },
      role: { score: 14 },
      outputFormat: { score: 12 },
      missionContext: { score: 17 },
      promptStructure: { score: 13 },
      tailoring: { score: 11 },
    },
  };

  beforeEach(() => {
    mockGetContext.mockReturnValue({
      createLinearGradient: jest.fn(() => ({ addColorStop: jest.fn() })),
      fillRect: jest.fn(),
      strokeRect: jest.fn(),
      beginPath: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      stroke: jest.fn(),
      fillText: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      quadraticCurveTo: jest.fn(),
      closePath: jest.fn(),
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
      font: '',
      textAlign: '',
      textBaseline: '',
    });
  });

  it('renders download button', () => {
    render(<ShareCard {...defaultProps} />);
    expect(screen.getByLabelText('Download share card image')).toBeInTheDocument();
  });

  it('shows default text', () => {
    render(<ShareCard {...defaultProps} />);
    expect(screen.getByText('Download Share Card')).toBeInTheDocument();
  });

  it('has hidden canvas element', () => {
    const { container } = render(<ShareCard {...defaultProps} />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
    expect(canvas?.style.display).toBe('none');
  });

  it('generates card on click', () => {
    // Mock createElement for the download link
    const mockClick = jest.fn();
    const originalCreateElement = document.createElement.bind(document);
    jest.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'a') {
        const link = originalCreateElement('a');
        link.click = mockClick;
        return link;
      }
      return originalCreateElement(tag);
    });

    render(<ShareCard {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('Download share card image'));

    expect(mockGetContext).toHaveBeenCalledWith('2d');
    expect(mockClick).toHaveBeenCalled();

    (document.createElement as jest.Mock).mockRestore();
  });

  it('button is accessible', () => {
    render(<ShareCard {...defaultProps} />);
    const btn = screen.getByLabelText('Download share card image');
    expect(btn.tagName).toBe('BUTTON');
  });
});
