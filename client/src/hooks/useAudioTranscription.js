import { useState, useCallback } from 'react';
import aiService from '../services/ai.service';
import { useToast } from '../context/ToastContext';

/**
 * Custom hook for managing audio transcription and AI processing
 */
export function useAudioTranscription() {
  const [audioTranscription, setAudioTranscription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const toast = useToast();

  const transcribeAudio = useCallback(async (audioBlob, duration) => {
    try {
      setIsProcessing(true);
      
      const loadingToast = toast.loading('Transcribing audio...');
      
      // Transcribe audio
      const result = await aiService.transcribeAudio(audioBlob, duration);
      const transcriptionText = (typeof result === 'object' && result.transcription) 
        ? String(result.transcription) 
        : (typeof result === 'string' ? result : '');
      
      toast.dismiss(loadingToast);
      
      if (!transcriptionText) {
        toast.error('Transcription resulted in empty text');
        return null;
      }
      
      setAudioTranscription(transcriptionText);
      toast.success('Audio transcribed successfully');
      
      return transcriptionText;
    } catch (error) {
      console.error('Transcription error:', error);
      toast.error(error.userMessage || 'Failed to transcribe audio');
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);

  const generateSOAPNote = useCallback(async (transcription) => {
    try {
      setIsProcessing(true);
      
      const loadingToast = toast.loading('Generating SOAP note...');
      
      const soapData = await aiService.generateSOAPNote(transcription);
      
      toast.dismiss(loadingToast);
      toast.success('SOAP note generated successfully');
      
      return soapData;
    } catch (error) {
      console.error('SOAP generation error:', error);
      toast.error(error.userMessage || 'Failed to generate SOAP note');
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);

  const extractPhysioData = useCallback(async (transcription) => {
    try {
      setIsProcessing(true);
      
      const loadingToast = toast.loading('Extracting physiotherapy data...');
      
      // Call new AI extraction endpoint
      const result = await aiService.extractPhysiotherapyData(transcription);
      const extractedData = result.physioData || result;
      
      toast.dismiss(loadingToast);
      
      if (extractedData.rangeOfMotion?.length > 0 || extractedData.painScale?.current) {
        toast.success('Physiotherapy data extracted successfully');
      }
      
      return extractedData;
    } catch (error) {
      console.error('Data extraction error:', error);
      toast.error(error.userMessage || 'Failed to extract data');
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);

  const processRecording = useCallback(async (audioBlob, duration) => {
    try {
      setIsProcessing(true);
      
      // Step 1: Transcribe
      const transcription = await transcribeAudio(audioBlob, duration);
      if (!transcription) return null;
      
      // Step 2: Generate SOAP note
      const soapData = await generateSOAPNote(transcription);
      
      // Step 3: Extract physio data
      const physioData = await extractPhysioData(transcription);
      
      return {
        transcription,
        soapData,
        physioData,
      };
    } catch (error) {
      console.error('Processing error:', error);
      toast.error('Failed to process recording');
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [transcribeAudio, generateSOAPNote, extractPhysioData, toast]);

  return {
    audioTranscription,
    setAudioTranscription,
    isProcessing,
    transcribeAudio,
    generateSOAPNote,
    extractPhysioData,
    processRecording,
  };
}
