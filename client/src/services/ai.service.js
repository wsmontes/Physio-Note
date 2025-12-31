import axiosInstance from './axios.config';

// Transcribe audio file
export const transcribeAudio = async (audioFile, duration) => {
  const formData = new FormData();
  formData.append('audio', audioFile);
  if (duration) formData.append('duration', duration);

  const response = await axiosInstance.post('ai/transcribe', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 45000 // 45 seconds for audio transcription
  });
  return response.data;
};

// Generate SOAP note from transcription
export const generateNote = async (transcription, context = {}, template = 'soap') => {
  const response = await axiosInstance.post('ai/generate-note', {
    transcription,
    context,
    template
  }, {
    timeout: 60000 // 60 seconds for note generation
  });
  return response.data;
};

// Generate exercise program
export const generateExerciseProgram = async (sessionData, patientGoals) => {
  const response = await axiosInstance.post('ai/exercise-program', {
    sessionData,
    patientGoals
  }, {
    timeout: 45000 // 45 seconds for exercise generation
  });
  return response.data;
};

// Suggest billing codes
export const suggestBillingCodes = async (sessionData) => {
  const response = await axiosInstance.post('ai/billing-codes', {
    sessionData
  }, {
    timeout: 30000 // 30 seconds for billing codes
  });
  return response.data;
};

// Combined: transcribe and generate note
export const transcribeAndGenerate = async (audioFile, context = {}, template = 'soap') => {
  const formData = new FormData();
  formData.append('audio', audioFile);
  formData.append('context', JSON.stringify(context));
  formData.append('template', template);

  const response = await axiosInstance.post('ai/transcribe-and-generate', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 90000 // 90 seconds for combined operation
  });
  return response.data;
};

export default {
  transcribeAudio,
  generateNote,
  generateExerciseProgram,
  suggestBillingCodes,
  transcribeAndGenerate
};
