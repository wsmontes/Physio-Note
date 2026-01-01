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
    expect(screen.getByText(/00:00/i)).toBeInTheDocument();
  });

  it('should show recording state when start button is clicked', async () => {
    renderWithToast(<VoiceRecorder onRecordingComplete={mockOnRecordingComplete} />);
    
    const startButton = screen.getByRole('button', { name: /start recording/i });
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText(/recording/i)).toBeInTheDocument();
    });
  });

  it('should have file upload input', () => {
    renderWithToast(<VoiceRecorder onRecordingComplete={mockOnRecordingComplete} />);
    
    const fileInput = screen.getByLabelText(/upload audio file/i);
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveAttribute('type', 'file');
    expect(fileInput).toHaveAttribute('accept', '.mp3,.wav,.m4a,.webm');
  });

  it('should display supported formats', () => {
    renderWithToast(<VoiceRecorder onRecordingComplete={mockOnRecordingComplete} />);
    
    expect(screen.getByText(/supported formats/i)).toBeInTheDocument();
    expect(screen.getByText(/mp3, wav, m4a, webm/i)).toBeInTheDocument();
  });

  it('should handle file upload', async () => {
    renderWithToast(<VoiceRecorder onRecordingComplete={mockOnRecordingComplete} />);
    
    const file = new File(['audio content'], 'test.mp3', { type: 'audio/mp3' });
    const fileInput = screen.getByLabelText(/upload audio file/i);

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockOnRecordingComplete).toHaveBeenCalled();
    });
  });

  it('should show max file size warning', () => {
    renderWithToast(<VoiceRecorder onRecordingComplete={mockOnRecordingComplete} />);
    
    expect(screen.getByText(/max size: 25mb/i)).toBeInTheDocument();
  });
});
