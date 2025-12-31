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

// ============================================
// AGENTIC AI - Evidence-Based Generation
// ============================================

/**
 * Agent-based exercise generation with evidence integration
 * Uses multi-step workflow: planning, data gathering, generation, validation, refinement
 * 
 * @param {object} context - Exercise generation context
 * @param {string} context.patientId - Patient MongoDB ID
 * @param {string} context.diagnosis - Primary diagnosis
 * @param {array} context.impairments - List of impairments (e.g., ["ROM deficit", "weakness"])
 * @param {string} context.goals - Patient goals
 * @param {object} context.sessionData - Current session data
 * @returns {Promise<object>} Returns {sessionId, promise} where promise resolves to exercise program
 */
export const generateExerciseProgramAgent = async (context) => {
  // Start the agent generation (returns immediately with sessionId)
  const response = await axiosInstance.post('ai/agent/generate-exercises', context, {
    timeout: 5000 // 5 seconds for initial response
  });
  
  const { sessionId } = response.data;
  
  // Return sessionId and a promise that will resolve when the agent completes
  // The UI will track progress via Server-Sent Events
  return {
    sessionId,
    promise: new Promise((resolve, reject) => {
      // This promise will be resolved by the AIProgressModal when it receives the 'complete' event
      // For now, just setup the structure - the modal will handle the actual resolution
      window._agentPromises = window._agentPromises || {};
      window._agentPromises[sessionId] = { resolve, reject };
    })
  };
};

/**
 * Agent-based SOAP note with diagnosis verification (Coming in Phase 2)
 * 
 * @param {object} context - SOAP note context
 * @param {string} context.transcription - Session transcription
 * @param {string} context.patientId - Patient MongoDB ID
 * @param {string} context.templateType - Template type (soap, progress, discharge)
 * @returns {Promise<object>} SOAP note with verified diagnoses and evidence
 */
export const generateSOAPNoteAgent = async (context) => {
  const response = await axiosInstance.post('ai/agent/soap-note', context, {
    timeout: 120000 // 2 minutes
  });
  return response.data;
};

/**
 *generateExerciseProgramAgent,
  generateSOAPNoteAgent,
  getClinicalRecommendation,
   Clinical decision support with evidence (Coming in Phase 4)
 * 
 * @param {object} context - Clinical question context
 * @param {string} context.diagnosis - Patient diagnosis
 * @param {object} context.symptoms - Current symptoms
 * @param {object} context.testResults - Test results so far
 * @param {string} context.questionType - Question (e.g., "What special tests should I perform?")
 * @returns {Promise<object>} Evidence-based recommendation
 */
export const getClinicalRecommendation = async (context) => {
  const response = await axiosInstance.post('ai/agent/clinical-decision', context, {
    timeout: 90000 // 90 seconds
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

// Extract physiotherapy-specific data from transcription
export const extractPhysiotherapyData = async (transcription) => {
  const response = await axiosInstance.post('ai/extract-physio-data', {
    transcription
  }, {
    timeout: 45000 // 45 seconds for data extraction
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
  generateExerciseProgramAgent,
  generateSOAPNoteAgent,
  getClinicalRecommendation,
  suggestBillingCodes,
  extractPhysiotherapyData,
  transcribeAndGenerate
};
