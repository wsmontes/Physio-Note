/**
 * EvidencePanel Component Tests
 * Tests rendering and data handling for research evidence display
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import EvidencePanel from '../../components/clinical/EvidencePanel';

describe('EvidencePanel', () => {
  const mockMetadata = {
    evidenceSources: [
      {
        pmid: '12345678',
        title: 'Exercise for Rotator Cuff Syndrome: A Systematic Review',
        authors: ['Smith J', 'Jones A', 'Brown B'],
        year: 2023,
        category: 'systematicReviews'
      },
      {
        pmid: '87654321',
        title: 'Randomized Trial of PT for Shoulder Pain',
        authors: 'Doe J',
        year: 2024,
        category: 'randomizedTrials'
      }
    ],
    diagnosisCode: 'M75.1',
    diagnosisDescription: 'Rotator cuff syndrome',
    validationStatus: 'approved'
  };

  it('should render evidence sources', () => {
    render(<EvidencePanel metadata={mockMetadata} />);

    expect(screen.getByText(/evidence sources/i)).toBeInTheDocument();
    expect(screen.getByText(/Exercise for Rotator Cuff/i)).toBeInTheDocument();
    expect(screen.getByText(/Randomized Trial/i)).toBeInTheDocument();
  });

  it('should render study type badges', () => {
    render(<EvidencePanel metadata={mockMetadata} />);

    expect(screen.getByText('Systematic Review')).toBeInTheDocument();
    expect(screen.getByText('RCT')).toBeInTheDocument();
  });

  it('should render PubMed links', () => {
    render(<EvidencePanel metadata={mockMetadata} />);

    const links = screen.getAllByRole('link');
    expect(links[0]).toHaveAttribute('href', 'https://pubmed.ncbi.nlm.nih.gov/12345678/');
    expect(links[0]).toHaveAttribute('target', '_blank');
    expect(links[0]).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should render diagnosis information', () => {
    render(<EvidencePanel metadata={mockMetadata} />);

    expect(screen.getByText(/M75.1/)).toBeInTheDocument();
    expect(screen.getByText(/Rotator cuff syndrome/)).toBeInTheDocument();
  });

  it('should handle array of authors', () => {
    render(<EvidencePanel metadata={mockMetadata} />);

    expect(screen.getByText(/Smith J, Jones A, Brown B/)).toBeInTheDocument();
  });

  it('should handle string author', () => {
    render(<EvidencePanel metadata={mockMetadata} />);

    expect(screen.getByText(/Doe J/)).toBeInTheDocument();
  });

  it('should not render when no evidence sources', () => {
    const { container } = render(
      <EvidencePanel metadata={{ evidenceSources: [] }} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should not render when metadata is undefined', () => {
    const { container } = render(<EvidencePanel metadata={undefined} />);

    expect(container.firstChild).toBeNull();
  });

  it('should handle missing optional fields gracefully', () => {
    const minimalMetadata = {
      evidenceSources: [
        {
          pmid: '11111111',
          title: 'Test Article'
          // No authors, year, or category
        }
      ]
    };

    render(<EvidencePanel metadata={minimalMetadata} />);

    expect(screen.getByText('Test Article')).toBeInTheDocument();
    expect(screen.getByText(/PMID: 11111111/)).toBeInTheDocument();
  });

  it('should apply correct badge colors for study types', () => {
    render(<EvidencePanel metadata={mockMetadata} />);

    const systematicReviewBadge = screen.getByText('Systematic Review');
    expect(systematicReviewBadge).toHaveClass('bg-blue-100', 'text-blue-800');

    const rctBadge = screen.getByText('RCT');
    expect(rctBadge).toHaveClass('bg-green-100', 'text-green-800');
  });

  it('should render validation status', () => {
    render(<EvidencePanel metadata={mockMetadata} />);

    expect(screen.getByText(/validation/i)).toBeInTheDocument();
    expect(screen.getByText(/approved/i)).toBeInTheDocument();
  });

  it('should handle non-string titles', () => {
    const metadataWithObjectTitle = {
      evidenceSources: [
        {
          pmid: '99999',
          title: { nested: 'Invalid title format' },
          authors: 'Test'
        }
      ]
    };

    // Should not crash, converts to string
    render(<EvidencePanel metadata={metadataWithObjectTitle} />);

    expect(screen.getByText(/Object object|Invalid/i)).toBeInTheDocument();
  });

  it('should truncate long author lists', () => {
    const longAuthorList = {
      evidenceSources: [
        {
          pmid: '123',
          title: 'Test',
          authors: Array.from({ length: 20 }, (_, i) => `Author${i}`).join(', ')
        }
      ]
    };

    const { container } = render(<EvidencePanel metadata={longAuthorList} />);

    // Check for line-clamp class
    const authorText = container.querySelector('.line-clamp-1');
    expect(authorText).toBeInTheDocument();
  });
});
