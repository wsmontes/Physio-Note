import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VoiceRecorder from '../components/VoiceRecorder';
import { ToastProvider } from '../context/ToastContext';

describe('VoiceRecorder Component', () => {
  const mockOnRecordingComplete = vi.fn();

  const renderWithToast = (component) => {
    return render(
      <ToastProvider>
        {component}
      </ToastProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with initial state', () => {
    renderWithToast(<VoiceRecorder onRecordingComplete={mockOnRecordingComplete} />);
    
    expect(screen.getByText(/start recording/i)).toBeInTheDocument();
    expect(screen.getByText(/upload audio/i)).toBeInTheDocument();
  });

  it('should show recording state when start button is clicked', async () => {
    renderWithToast(<VoiceRecorder onRecordingComplete={mockOnRecordingComplete} />);
    
    const startButton = screen.getByRole('button', { name: /start recording/i });
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /stop recording/i })).toBeInTheDocument();
    });
  });

  it('should have file upload input', () => {
    renderWithToast(<VoiceRecorder onRecordingComplete={mockOnRecordingComplete} />);
    
    const uploadLabel = screen.getByText(/upload audio/i).closest('label');
    const fileInput = uploadLabel.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveAttribute('type', 'file');
    expect(fileInput).toHaveAttribute('accept', 'audio/*');
  });

  it('should display upload audio button', () => {
    renderWithToast(<VoiceRecorder onRecordingComplete={mockOnRecordingComplete} />);
    
    expect(screen.getByText(/upload audio/i)).toBeInTheDocument();
  });

  it('should handle file upload', async () => {
    renderWithToast(<VoiceRecorder onRecordingComplete={mockOnRecordingComplete} />);
    
    const file = new File(['audio content'], 'test.mp3', { type: 'audio/mp3' });
    const uploadLabel = screen.getByText(/upload audio/i).closest('label');
    const fileInput = uploadLabel.querySelector('input[type="file"]');

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockOnRecordingComplete).toHaveBeenCalledWith(file);
    });
  });

  it('should show start recording button', () => {
    renderWithToast(<VoiceRecorder onRecordingComplete={mockOnRecordingComplete} />);
    
    expect(screen.getByRole('button', { name: /start recording/i })).toBeInTheDocument();
  });
});
