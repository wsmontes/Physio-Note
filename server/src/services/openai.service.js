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

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-5-nano',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_completion_tokens: 2000
    });

    const noteContent = completion.choices[0].message.content;

    logDebug('=====================================', '');
    logDebug('OPENAI RAW RESPONSE:', noteContent);
    logDebug('Response Length:', noteContent?.length);
    logDebug('Response Type:', typeof noteContent);
    logDebug('Full Completion Object:', completion);
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

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-5-nano',
      messages: [
        { role: 'system', content: 'You are an expert physiotherapist creating evidence-based home exercise programs.' },
        { role: 'user', content: prompt }
      ],
      max_completion_tokens: 1500
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

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-5-nano',
      messages: [
        { role: 'system', content: 'You are a medical billing expert specializing in physiotherapy CPT codes.' },
        { role: 'user', content: prompt }
      ],
      max_completion_tokens: 800
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

module.exports = {
  transcribeAudio,
  generateSOAPNote,
  generateExercisePrescription,
  suggestBillingCodes
};
