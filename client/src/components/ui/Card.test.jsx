import { describe, it, expect } from 'vitest';
import { render, screen } from '../../test/test-utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './Card';

describe('Card Components', () => {
  describe('Card', () => {
    it('renders card with children', () => {
      render(<Card>Card content</Card>);
      expect(screen.getByText(/card content/i)).toBeInTheDocument();
    });

    it('applies default styles', () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.querySelector('div[class*="rounded-xl"]');
      expect(card).toHaveClass('rounded-xl', 'border', 'bg-white', 'shadow-sm');
    });

    it('applies custom className', () => {
      const { container } = render(<Card className="custom-class">Content</Card>);
      const card = container.querySelector('.custom-class');
      expect(card).toHaveClass('custom-class');
    });
  });

  describe('CardHeader', () => {
    it('renders header with children', () => {
      render(<CardHeader>Header content</CardHeader>);
      expect(screen.getByText(/header content/i)).toBeInTheDocument();
    });

    it('applies default styles', () => {
      const { container } = render(<CardHeader>Content</CardHeader>);
      const header = container.querySelector('div[class*="flex-col"]');
      expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'p-6');
    });
  });

  describe('CardTitle', () => {
    it('renders title with children', () => {
      render(<CardTitle>Title text</CardTitle>);
      expect(screen.getByText(/title text/i)).toBeInTheDocument();
    });

    it('renders as h3 by default', () => {
      render(<CardTitle>Title</CardTitle>);
      const title = screen.getByText(/title/i);
      expect(title.tagName).toBe('H3');
    });

    it('applies default styles', () => {
      render(<CardTitle>Title</CardTitle>);
      const title = screen.getByText(/title/i);
      expect(title).toHaveClass('text-xl', 'font-semibold', 'leading-none', 'tracking-tight');
    });
  });

  describe('CardDescription', () => {
    it('renders description with children', () => {
      render(<CardDescription>Description text</CardDescription>);
      expect(screen.getByText(/description text/i)).toBeInTheDocument();
    });

    it('renders as p by default', () => {
      render(<CardDescription>Description</CardDescription>);
      const description = screen.getByText(/description/i);
      expect(description.tagName).toBe('P');
    });

    it('applies default styles', () => {
      render(<CardDescription>Description</CardDescription>);
      const description = screen.getByText(/description/i);
      expect(description).toHaveClass('text-sm', 'text-gray-600');
    });
  });

  describe('CardContent', () => {
    it('renders content with children', () => {
      render(<CardContent>Content text</CardContent>);
      expect(screen.getByText(/content text/i)).toBeInTheDocument();
    });

    it('applies default styles', () => {
      const { container } = render(<CardContent>Content</CardContent>);
      const content = container.querySelector('div[class*="pt-0"]');
      expect(content).toHaveClass('p-6', 'pt-0');
    });
  });

  describe('CardFooter', () => {
    it('renders footer with children', () => {
      render(<CardFooter>Footer content</CardFooter>);
      expect(screen.getByText(/footer content/i)).toBeInTheDocument();
    });

    it('applies default styles', () => {
      const { container } = render(<CardFooter>Content</CardFooter>);
      const footer = container.querySelector('div[class*="items-center"]');
      expect(footer).toHaveClass('flex', 'items-center', 'p-6', 'pt-0');
    });
  });

  describe('Full Card Composition', () => {
    it('renders complete card with all components', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card description</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Card content goes here</p>
          </CardContent>
          <CardFooter>
            <button>Action</button>
          </CardFooter>
        </Card>
      );

      expect(screen.getByText(/card title/i)).toBeInTheDocument();
      expect(screen.getByText(/card description/i)).toBeInTheDocument();
      expect(screen.getByText(/card content goes here/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /action/i })).toBeInTheDocument();
    });
  });
});
