const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Debug logger
function logDebug(message, data) {
  const logPath = path.join(__dirname, '../../openai-debug.log');
  const timestamp = new Date().toISOString();
  const logEntry = `\n\n[${timestamp}] ${message}\n${typeof data === 'object' ? JSON.stringify(data, null, 2) : data}\n`;
  fs.appendFileSync(logPath, logEntry);
  console.log(message, data);
}

/**
 * Transcribe audio file using Whisper
 * @param {Buffer} audioBuffer - Audio file buffer
 * @param {string} filename - Original filename
 * @returns {Promise<string>} Transcribed text
 */
const transcribeAudio = async (audioBuffer, filename) => {
  try {
    // Ensure filename has proper extension for OpenAI
    const ext = filename?.split('.').pop()?.toLowerCase();
    const validExtensions = ['mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm'];
    
    let finalFilename = filename;
    if (!ext || !validExtensions.includes(ext)) {
      finalFilename = 'audio.webm'; // Default to webm
    }

    // Create a File-like object that OpenAI SDK expects
    const file = new File([audioBuffer], finalFilename, {
      type: `audio/${ext || 'webm'}`
    });

    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: process.env.OPENAI_WHISPER_MODEL || 'whisper-1',
      language: 'en',
      response_format: 'text'
    });

    console.log('Whisper API response:', transcription);
    console.log('Response type:', typeof transcription);
    
    // When response_format is 'text', OpenAI returns a plain string, not an object
    return typeof transcription === 'string' ? transcription : transcription.text;
  } catch (error) {
    console.error('Whisper transcription error:', error);
    throw new Error('Failed to transcribe audio');
  }
};

/**
 * Generate structured SOAP note from transcription using GPT-5-nano
 * @param {string} transcription - Raw transcription text
 * @param {object} context - Additional context (patient history, previous notes)
 * @param {string} template - Template type (soap, progress, discharge)
 * @returns {Promise<object>} Structured note data
 */
const generateSOAPNote = async (transcription, context = {}, template = 'soap') => {
  try {
    const systemPrompt = getSystemPrompt(template);
    const userPrompt = buildUserPrompt(transcription, context);

    console.log('Generating SOAP note with prompt:', userPrompt.substring(0, 200));

    // Use Responses API for GPT-5 models
    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL || 'gpt-5-nano',
      input: [
        { role: 'developer', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      text: {
        verbosity: 'medium'
      }
    });

    // Extract text from response.output
    let noteContent = '';
    for (const item of response.output) {
      if (item.content) {
        for (const content of item.content) {
          if (content.text) {
            noteContent += content.text;
          }
        }
      }
    }

    logDebug('=====================================', '');
    logDebug('OPENAI RAW RESPONSE:', noteContent);
    logDebug('Response Length:', noteContent?.length);
    logDebug('Response Type:', typeof noteContent);
    logDebug('Full Response Object:', response);
    logDebug('=====================================', '');
    
    const parsedNote = parseNoteContent(noteContent, template);
    
    logDebug('PARSED NOTE STRUCTURE:', parsedNote);
    logDebug('=====================================', '');
    
    return parsedNote;
  } catch (error) {
    console.error('GPT-5-nano note generation error:', error);
    throw new Error('Failed to generate clinical note');
  }
};

/**
 * Generate exercise prescription from session details
 */
const generateExercisePrescription = async (sessionData, patientGoals) => {
  try {
    const prompt = `Based on the following physiotherapy session and patient goals, create a detailed home exercise program:

Session Details:
${JSON.stringify(sessionData, null, 2)}

Patient Goals:
${patientGoals}

Generate a home exercise program with:
1. Exercise name and type (strengthening/stretching/balance/aerobic/functional)
2. Sets, reps, duration
3. Clear patient instructions
4. Frequency (how often per day/week)
5. Progression criteria

Format as JSON array of exercises.`;

    // gpt-5-nano is a reasoning model - combine system and user prompts
    const combinedPrompt = `You are an expert physiotherapist creating evidence-based home exercise programs.\n\n${prompt}`;
    
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-5-nano',
      messages: [
        { role: 'user', content: combinedPrompt }
      ],
      max_tokens: 1500,
      temperature: 0.7
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('Exercise prescription error:', error);
    throw new Error('Failed to generate exercise prescription');
  }
};

/**
 * Suggest billing codes based on session content
 */
const suggestBillingCodes = async (sessionData) => {
  try {
    const prompt = `Based on this physiotherapy session, suggest appropriate CPT billing codes:

Session Type: ${sessionData.type}
Duration: ${sessionData.duration} minutes
Treatments: ${JSON.stringify(sessionData.treatments)}
Modalities: ${JSON.stringify(sessionData.modalitiesUsed || [])}

Provide billing codes in JSON format with: code, description, and recommended units.`;

    // gpt-5-nano is a reasoning model - combine system and user prompts
    const combinedPrompt = `You are a medical billing expert specializing in physiotherapy CPT codes.\n\n${prompt}`;
    
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-5-nano',
      messages: [
        { role: 'user', content: combinedPrompt }
      ],
      max_tokens: 800,
      temperature: 0.5
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('Billing code suggestion error:', error);
    throw new Error('Failed to suggest billing codes');
  }
};

// Helper functions
function getSystemPrompt(template) {
  const prompts = {
    soap: `You are an expert physiotherapist creating clinical SOAP notes. Extract information from the transcription and structure it into these four sections:

Subjective:
[Patient's complaints, symptoms, history]

Objective:
[Physical findings, tests, measurements (ROM, strength, gait, posture)]

Assessment:
[Clinical impression, progress, functional status]

Plan:
[Treatment plan, exercises, follow-up, patient education]

Be precise, use medical terminology, and maintain professional clinical documentation standards. Always include all four sections even if some are brief.`,
    
    progress: `You are an expert physiotherapist documenting patient progress. Focus on:
- Changes since last visit
- Current functional status
- Goal achievement
- Treatment response
- Next steps

Use objective measures and functional outcomes.`,
    
    discharge: `You are an expert physiotherapist creating discharge summaries. Include:
- Initial presentation and diagnosis
- Treatment provided over course of care
- Outcomes achieved
- Current functional status
- Home program recommendations
- Follow-up instructions

Provide a comprehensive summary of the episode of care.`
  };

  return prompts[template] || prompts.soap;
}

function buildUserPrompt(transcription, context) {
  let prompt = `Transcription of clinical session:\n\n${transcription}\n\n`;
  
  if (context.patientHistory) {
    prompt += `\nPatient History:\n${context.patientHistory}\n`;
  }
  
  if (context.previousNotes) {
    prompt += `\nPrevious Session Notes:\n${context.previousNotes}\n`;
  }
  
  prompt += `\nGenerate a structured clinical note from this information.`;
  
  return prompt;
}

function parseNoteContent(content, template) {
  // Parse the AI-generated content into structured format
  const sections = {
    subjective: '',
    objective: '',
    assessment: '',
    plan: ''
  };

  if (!content || content.trim() === '') {
    console.warn('Empty content received from OpenAI');
    return {
      template,
      content: sections,
      rawContent: content,
      generatedAt: new Date()
    };
  }

  // Try to parse as sections
  const lines = content.split('\n');
  let currentSection = null;

  lines.forEach(line => {
    const lower = line.toLowerCase().trim();
    
    // Check for section headers (with or without colon)
    if (lower.startsWith('subjective') || lower === 's:') {
      currentSection = 'subjective';
      // Don't skip the line - extract text after colon if present
      const colonIndex = line.indexOf(':');
      if (colonIndex > -1 && line.length > colonIndex + 1) {
        sections[currentSection] += line.substring(colonIndex + 1).trim() + '\n';
      }
    } else if (lower.startsWith('objective') || lower === 'o:') {
      currentSection = 'objective';
      const colonIndex = line.indexOf(':');
      if (colonIndex > -1 && line.length > colonIndex + 1) {
        sections[currentSection] += line.substring(colonIndex + 1).trim() + '\n';
      }
    } else if (lower.startsWith('assessment') || lower === 'a:') {
      currentSection = 'assessment';
      const colonIndex = line.indexOf(':');
      if (colonIndex > -1 && line.length > colonIndex + 1) {
        sections[currentSection] += line.substring(colonIndex + 1).trim() + '\n';
      }
    } else if (lower.startsWith('plan') || lower === 'p:') {
      currentSection = 'plan';
      const colonIndex = line.indexOf(':');
      if (colonIndex > -1 && line.length > colonIndex + 1) {
        sections[currentSection] += line.substring(colonIndex + 1).trim() + '\n';
      }
    } else if (currentSection && line.trim()) {
      // Add content to current section
      sections[currentSection] += line.trim() + '\n';
    }
  });

  // Trim all sections
  Object.keys(sections).forEach(key => {
    sections[key] = sections[key].trim();
  });

  return {
    template,
    content: sections,
    rawContent: content,
    generatedAt: new Date()
  };
}

/**
 * Extract physiotherapy-specific data from transcription
 * @param {string} transcription - Raw transcription text
 * @returns {Promise<object>} Extracted physiotherapy data
 */
const extractPhysiotherapyData = async (transcription) => {
  try {
    const systemPrompt = `You are an AI assistant specialized in extracting physiotherapy-specific data from clinical transcriptions.

Extract the following information from the transcription and return it in JSON format:
1. Pain assessment (current, best, worst pain levels on 0-10 scale, location)
2. Range of Motion measurements (joint, movement, degrees)
3. Strength testing results (muscle/group, grade 0-5)
4. Exercises mentioned or prescribed
5. Modalities used (e.g., ultrasound, TENS, heat, ice)
6. Billing codes mentioned or implied (CPT codes)

Return ONLY valid JSON with this exact structure:
{
  "painScale": {
    "current": number (0-10) or null,
    "best": number (0-10) or null,
    "worst": number (0-10) or null,
    "location": string or null
  },
  "rangeOfMotion": [
    {
      "joint": string,
      "movement": string,
      "degrees": string
    }
  ],
  "strengthTest": [
    {
      "muscle": string,
      "grade": string
    }
  ],
  "exercises": [
    {
      "name": string,
      "sets": number or null,
      "reps": number or null,
      "duration": string or null,
      "instructions": string or null
    }
  ],
  "modalitiesUsed": [string],
  "billingCodes": [
    {
      "code": string,
      "description": string
    }
  ]
}

If information is not found, use empty arrays or null values. Be precise with numbers.`;

    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL || 'gpt-5-nano',
      input: [
        { role: 'developer', content: systemPrompt },
        { role: 'user', content: `Extract physiotherapy data from this transcription:\n\n${transcription}` }
      ],
      text: {
        verbosity: 'low'
      }
    });

    // Extract text from response
    let extractedText = '';
    for (const item of response.output) {
      if (item.content) {
        for (const content of item.content) {
          if (content.text) {
            extractedText += content.text;
          }
        }
      }
    }

    logDebug('Physio Data Extraction Response:', extractedText);

    // Parse JSON from response
    const jsonMatch = extractedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn('No JSON found in extraction response');
      return getEmptyPhysioData();
    }

    const physioData = JSON.parse(jsonMatch[0]);
    
    // Validate and clean data
    return {
      painScale: physioData.painScale || { current: null, best: null, worst: null, location: null },
      rangeOfMotion: Array.isArray(physioData.rangeOfMotion) ? physioData.rangeOfMotion : [],
      strengthTest: Array.isArray(physioData.strengthTest) ? physioData.strengthTest : [],
      exercises: Array.isArray(physioData.exercises) ? physioData.exercises : [],
      modalitiesUsed: Array.isArray(physioData.modalitiesUsed) ? physioData.modalitiesUsed : [],
      billingCodes: Array.isArray(physioData.billingCodes) ? physioData.billingCodes : [],
    };
  } catch (error) {
    console.error('Physio data extraction error:', error);
    // Return empty structure instead of throwing
    return getEmptyPhysioData();
  }
};

/**
 * Get empty physiotherapy data structure
 */
function getEmptyPhysioData() {
  return {
    painScale: { current: null, best: null, worst: null, location: null },
    rangeOfMotion: [],
    strengthTest: [],
    exercises: [],
    modalitiesUsed: [],
    billingCodes: [],
  };
}

module.exports = {
  transcribeAudio,
  generateSOAPNote,
  generateExercisePrescription,
  suggestBillingCodes,
  extractPhysiotherapyData
};
