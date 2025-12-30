import { useState, useRef } from 'react';
import { FiMic, FiSquare, FiUpload } from 'react-icons/fi';
import { useToast } from '../context/ToastContext';

const VoiceRecorder = ({ onRecordingComplete, onTranscriptionComplete }) => {
  const toast = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioURL, setAudioURL] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        
        if (onRecordingComplete) {
          // Create a File object with proper name and type
          const audioFile = new File([audioBlob], 'recording.webm', { 
            type: 'audio/webm' 
          });
          onRecordingComplete(audioFile, recordingTime);
        }

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Unable to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAudioURL(url);
      if (onRecordingComplete) {
        onRecordingComplete(file);
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="card space-y-4">
      <h3 className="text-lg font-semibold">Voice Recording</h3>
      
      <div className="flex items-center space-x-4">
        {!isRecording ? (
          <>
            <button
              onClick={startRecording}
              className="btn-primary flex items-center space-x-2"
              disabled={isProcessing}
            >
              <FiMic />
              <span>Start Recording</span>
            </button>
            
            <label className="btn-secondary flex items-center space-x-2 cursor-pointer">
              <FiUpload />
              <span>Upload Audio</span>
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isProcessing}
              />
            </label>
          </>
        ) : (
          <button
            onClick={stopRecording}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2"
          >
            <FiSquare />
            <span>Stop Recording</span>
          </button>
        )}
      </div>

      {isRecording && (
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
            <span className="text-red-600 font-semibold">Recording</span>
          </div>
          <span className="text-2xl font-mono">{formatTime(recordingTime)}</span>
        </div>
      )}

      {audioURL && (
        <div className="border-t pt-4">
          <p className="text-sm text-gray-600 mb-2">Preview:</p>
          <audio src={audioURL} controls className="w-full" />
        </div>
      )}

      {isProcessing && (
        <div className="flex items-center justify-center space-x-2 text-primary-600">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
          <span>Processing audio...</span>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;
