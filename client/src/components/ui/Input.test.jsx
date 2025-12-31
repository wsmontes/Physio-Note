import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../test/test-utils';
import userEvent from '@testing-library/user-event';
import { Input } from './Input';

describe('Input Component', () => {
  it('renders input with placeholder', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText(/enter text/i)).toBeInTheDocument();
  });

  it('handles value changes', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    
    render(<Input onChange={handleChange} />);
    const input = screen.getByRole('textbox');
    
    await user.type(input, 'test');
    expect(handleChange).toHaveBeenCalled();
    expect(input).toHaveValue('test');
  });

  it('shows error state', () => {
    const { container } = render(<Input error />);
    const wrapper = container.firstChild;
    const input = screen.getByRole('textbox');
    
    expect(input).toHaveClass('border-red-500', 'focus-visible:ring-red-500');
  });

  it('renders with left icon', () => {
    const Icon = () => <span data-testid="left-icon">🔍</span>;
    render(<Input leftIcon={<Icon />} />);
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
  });

  it('renders with right icon', () => {
    const Icon = () => <span data-testid="right-icon">✓</span>;
    render(<Input rightIcon={<Icon />} />);
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });

  it('disables input when disabled prop is true', () => {
    render(<Input disabled />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('disabled:opacity-50');
  });

  it('applies custom className', () => {
    render(<Input className="custom-class" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('custom-class');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<Input ref={ref} />);
    expect(ref).toHaveBeenCalled();
  });

  it('supports different input types', () => {
    const { rerender } = render(<Input type="email" />);
    let input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'email');

    rerender(<Input type="password" />);
    // Password inputs have different role
    const passwordInput = screen.getByDisplayValue('');
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('renders label when provided', () => {
    render(<Input label="Email Address" />);
    expect(screen.getByText(/email address/i)).toBeInTheDocument();
  });

  it('renders error message when provided', () => {
    render(<Input error errorMessage="This field is required" />);
    expect(screen.getByText(/this field is required/i)).toBeInTheDocument();
  });
});
