const OpenAI = require('openai');
const icdAPI = require('./icd-api.service');
const pubmedAPI = require('./pubmed-api.service');
const Patient = require('../models/patient.model');
const Session = require('../models/session.model');
const Note = require('../models/note.model');

// Load clinical reference data
const romData = require('../data/rom-reference');
const mmtData = require('../data/mmt-reference');
const specialTestsData = require('../data/special-tests');
const cptCodesData = require('../data/cpt-codes');

/**
 * AI Agent Orchestrator for Physio-Note
 * Manages multi-step agentic workflows with tool use and deep reasoning
 */
class PhysioAIAgent {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    this.model = process.env.OPENAI_MODEL || 'gpt-5-nano';
    this.tools = this.defineTools();
  }

  /**
   * Define available tools for agent
   * These are the capabilities the AI can use to gather information
   */
  defineTools() {
    return [
      {
        name: 'search_diagnosis_codes',
        description: 'Search WHO ICD-11 for official diagnosis codes and detailed medical information. Use this to verify diagnoses, get contraindications, and ensure proper clinical coding.',
        parameters: {
          type: 'object',
          properties: {
            searchTerm: { 
              type: 'string', 
              description: 'Diagnosis or medical condition to search (e.g., "rotator cuff tear", "knee osteoarthritis")' 
            }
          },
          required: ['searchTerm']
        }
      },
      {
        name: 'get_research_evidence',
        description: 'Search PubMed for clinical research, systematic reviews, RCTs, and clinical guidelines. Use this to find evidence supporting treatment decisions.',
        parameters: {
          type: 'object',
          properties: {
            query: { 
              type: 'string', 
              description: 'Research query (e.g., "rotator cuff exercise therapy", "knee arthroscopy effectiveness")' 
            },
            studyTypes: { 
              type: 'array', 
              items: { 
                type: 'string',
                enum: ['systematic_review', 'rct', 'guideline'] 
              },
              description: 'Types of studies to prioritize. Defaults to all types.'
            },
            maxResults: {
              type: 'number',
              description: 'Maximum number of results to return (1-10). Defaults to 5.',
              minimum: 1,
              maximum: 10
            }
          },
          required: ['query']
        }
      },
      {
        name: 'get_clinical_reference',
        description: 'Get clinical reference data including normal ROM values, MMT grades, special tests, or CPT billing codes.',
        parameters: {
          type: 'object',
          properties: {
            dataType: { 
              type: 'string', 
              enum: ['rom', 'mmt', 'special_tests', 'cpt_codes'],
              description: 'Type of clinical reference data needed'
            },
            filter: { 
              type: 'object',
              description: 'Optional filter criteria (e.g., {joint: "shoulder"}, {region: "shoulder"}, {category: "evaluation"})'
            }
          },
          required: ['dataType']
        }
      },
      {
        name: 'validate_special_test',
        description: 'Get validation studies and diagnostic accuracy data for orthopedic special tests from PubMed.',
        parameters: {
          type: 'object',
          properties: {
            testName: { 
              type: 'string', 
              description: 'Name of the orthopedic special test (e.g., "Hawkins-Kennedy", "Lachman")' 
            },
            bodyRegion: { 
              type: 'string', 
              description: 'Anatomical region (e.g., "shoulder", "knee", "spine")' 
            }
          },
          required: ['testName']
        }
      },
      {
        name: 'get_patient_history',
        description: 'Retrieve patient demographic information, medical history, and previous treatment sessions.',
        parameters: {
          type: 'object',
          properties: {
            patientId: { 
              type: 'string', 
              description: 'MongoDB ObjectId of the patient' 
            },
            includeNotes: { 
              type: 'boolean', 
              description: 'Whether to include previous session notes. Defaults to true.' 
            },
            sessionLimit: {
              type: 'number',
              description: 'Number of previous sessions to retrieve (1-10). Defaults to 5.',
              minimum: 1,
              maximum: 10
            }
          },
          required: ['patientId']
        }
      },
      {
        name: 'get_diagnosis_evidence_summary',
        description: 'Get comprehensive evidence summary for a specific diagnosis including systematic reviews, RCTs, and clinical guidelines all in one call.',
        parameters: {
          type: 'object',
          properties: {
            diagnosis: {
              type: 'string',
              description: 'The medical diagnosis or condition'
            }
          },
          required: ['diagnosis']
        }
      }
    ];
  }

  /**
   * Execute agent workflow
   * Main entry point for agentic tasks
   * 
   * @param {string} task - Task type: 'generate_exercises', 'generate_soap_note', 'clinical_decision_support', 'suggest_billing'
   * @param {object} context - Task-specific context data
   * @returns {Promise<object>} Task result with metadata
   */
  async execute(task, context) {
    console.log(`[AI Agent] Starting task: ${task}`);
    console.log(`[AI Agent] Context:`, JSON.stringify(context, null, 2));

    const taskHandlers = {
      'generate_exercises': this.generateExercisesAgent.bind(this),
      'generate_soap_note': this.generateSOAPNoteAgent.bind(this),
      'clinical_decision_support': this.clinicalDecisionAgent.bind(this),
      'suggest_billing': this.suggestBillingAgent.bind(this)
    };

    const handler = taskHandlers[task];
    if (!handler) {
      throw new Error(`Unknown task: ${task}. Available tasks: ${Object.keys(taskHandlers).join(', ')}`);
    }

    const startTime = Date.now();
    try {
      const result = await handler(context);
      const duration = Date.now() - startTime;
      
      console.log(`[AI Agent] Task completed in ${duration}ms`);
      
      return {
        ...result,
        agentMetadata: {
          task,
          duration,
          model: this.model,
          completedAt: new Date()
        }
      };
    } catch (error) {
      console.error(`[AI Agent] Task failed:`, error);
      throw error;
    }
  }

  /**
   * Execute a tool call
   * Routes tool calls to appropriate service methods
   * 
   * @param {string} toolName - Name of the tool to execute
   * @param {object} parameters - Tool parameters
   * @returns {Promise<any>} Tool execution result
   */
  async executeTool(toolName, parameters) {
    console.log(`[AI Agent] Executing tool: ${toolName}`, parameters);

    try {
      switch (toolName) {
        case 'search_diagnosis_codes':
          return await icdAPI.search(parameters.searchTerm);
        
        case 'get_research_evidence':
          return await pubmedAPI.search(parameters.query, {
            studyTypes: parameters.studyTypes,
            maxResults: parameters.maxResults || 5
          });
        
        case 'get_clinical_reference':
          return await this.getClinicalReference(parameters.dataType, parameters.filter);
        
        case 'validate_special_test':
          return await pubmedAPI.validateSpecialTest(
            parameters.testName, 
            parameters.bodyRegion
          );
        
        case 'get_patient_history':
          return await this.getPatientHistory(
            parameters.patientId, 
            parameters.includeNotes !== false,
            parameters.sessionLimit || 5
          );
        
        case 'get_diagnosis_evidence_summary':
          return await pubmedAPI.getEvidenceSummary(parameters.diagnosis);
        
        default:
          throw new Error(`Unknown tool: ${toolName}`);
      }
    } catch (error) {
      console.error(`[AI Agent] Tool execution failed: ${toolName}`, error);
      // Return empty result instead of throwing to allow agent to continue
      return this.getEmptyToolResult(toolName);
    }
  }

  /**
   * Get empty/fallback result for failed tool calls
   */
  getEmptyToolResult(toolName) {
    const emptyResults = {
      'search_diagnosis_codes': [],
      'get_research_evidence': [],
      'get_clinical_reference': [],
      'validate_special_test': [],
      'get_patient_history': { patient: null, sessions: [], notes: [] },
      'get_diagnosis_evidence_summary': { systematicReviews: [], randomizedTrials: [], guidelines: [] }
    };
    
    return emptyResults[toolName] || null;
  }

  /**
   * Get clinical reference data with optional filtering
   * 
   * @param {string} dataType - Type of reference data: 'rom', 'mmt', 'special_tests', 'cpt_codes'
   * @param {object} filter - Optional filter criteria
   * @returns {Promise<array>} Filtered reference data
   */
  async getClinicalReference(dataType, filter = {}) {
    let data;
    
    switch (dataType) {
      case 'rom':
        // ROM data is an object keyed by joint name, convert to array
        const romRef = romData.romReference;
        if (filter.joint) {
          // Return specific joint data
          const joint = filter.joint.toLowerCase();
          data = romRef[joint] ? [{ joint: filter.joint, ...romRef[joint] }] : [];
        } else {
          // Return all joints as array
          data = Object.keys(romRef).map(joint => ({
            joint,
            ...romRef[joint]
          }));
        }
        break;
      
      case 'mmt':
        data = mmtData.muscleGroups;
        if (filter.region) {
          data = mmtData.getMusclesByRegion(filter.region);
        }
        break;
      
      case 'special_tests':
        data = specialTestsData.getAllTests();
        if (filter.region) {
          data = specialTestsData.getTestsByRegion(filter.region);
        }
        if (filter.name) {
          data = data.filter(item =>
            item.name.toLowerCase().includes(filter.name.toLowerCase())
          );
        }
        break;
      
      case 'cpt_codes':
        data = cptCodesData.getAllCodes();
        if (filter.category) {
          data = cptCodesData.getCodesByCategory(filter.category);
        }
        if (filter.timeBased !== undefined) {
          data = data.filter(item => item.timeBased === filter.timeBased);
        }
        break;
      
      default:
        throw new Error(`Unknown data type: ${dataType}`);
    }
    
    return data;
  }

  /**
   * Get patient history including demographics and previous sessions
   * 
   * @param {string} patientId - Patient MongoDB ObjectId
   * @param {boolean} includeNotes - Whether to include session notes
   * @param {number} sessionLimit - Number of previous sessions to retrieve
   * @returns {Promise<object>} Patient data with sessions and notes
   */
  async getPatientHistory(patientId, includeNotes = true, sessionLimit = 5) {
    try {
      // Get patient demographics
      const patient = await Patient.findById(patientId)
        .select('firstName lastName dateOfBirth gender phone email address medicalHistory')
        .lean();
      
      if (!patient) {
        return { patient: null, sessions: [], notes: [] };
      }

      // Get recent sessions
      const sessions = await Session.find({ patient: patientId })
        .sort({ date: -1 })
        .limit(sessionLimit)
        .select('date type duration chiefComplaint treatmentProvided exercises rangeOfMotion muscleStrength specialTests')
        .lean();

      // Get session notes if requested
      let notes = [];
      if (includeNotes && sessions.length > 0) {
        const sessionIds = sessions.map(s => s._id);
        notes = await Note.find({ session: { $in: sessionIds } })
          .sort({ createdAt: -1 })
          .select('session template content createdAt')
          .lean();
      }

      return {
        patient: {
          id: patient._id,
          name: `${patient.firstName} ${patient.lastName}`,
          age: patient.dateOfBirth ? this.calculateAge(patient.dateOfBirth) : null,
          gender: patient.gender,
          medicalHistory: patient.medicalHistory
        },
        sessions: sessions.map(s => ({
          id: s._id,
          date: s.date,
          type: s.type,
          duration: s.duration,
          chiefComplaint: s.chiefComplaint,
          treatmentProvided: s.treatmentProvided,
          exercises: s.exercises,
          rangeOfMotion: s.rangeOfMotion,
          muscleStrength: s.muscleStrength,
          specialTests: s.specialTests
        })),
        notes: notes.map(n => ({
          sessionId: n.session,
          template: n.template,
          content: n.content,
          date: n.createdAt
        }))
      };
    } catch (error) {
      console.error('[AI Agent] Error fetching patient history:', error);
      return { patient: null, sessions: [], notes: [] };
    }
  }

  /**
   * Calculate age from date of birth
   */
  calculateAge(dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * AGENT WORKFLOW: Generate Evidence-Based Exercise Program
   * 5-Phase agentic workflow with deep reasoning
   */
  async generateExercisesAgent(context) {
    const {
      patientId,
      diagnosis,
      impairments = [],
      goals = '',
      sessionData = {}
    } = context;

    console.log('[Exercise Agent] Starting 5-phase workflow');

    // ============================================
    // PHASE 1: PLANNING (Deep Reasoning)
    // ============================================
    console.log('[Exercise Agent] Phase 1: Planning');
    
    const planningPrompt = `You are an expert physiotherapist AI agent planning an evidence-based exercise program.

Patient Context:
- Diagnosis: ${diagnosis || 'Not specified'}
- Impairments: ${JSON.stringify(impairments)}
- Patient Goals: ${goals}
- Has Previous Sessions: ${patientId ? 'Yes' : 'No'}

DEEP THINKING REQUIRED:
1. What specific impairments need addressing? (strength, ROM, balance, function)
2. What research evidence do I need? (systematic reviews for this diagnosis)
3. What patient factors matter? (age, previous treatment response, barriers)
4. What safety considerations? (contraindications, precautions, red flags)
5. Which tools should I use to gather this information?

Create a detailed step-by-step plan for generating this exercise program.
For each step, specify:
- What information you need
- Which tool to use
- Why this information is important

Format as a numbered list of action steps.`;

    const planResponse = await this.openai.chat.completions.create({
      model: this.model,
      messages: [
        { 
          role: 'system', 
          content: 'You are an autonomous clinical AI agent that plans multi-step workflows. Think carefully and create comprehensive plans.' 
        },
        { role: 'user', content: planningPrompt }
      ],
      temperature: 0.3, // Lower temperature for planning
      max_tokens: 1000
    });

    const plan = planResponse.choices[0].message.content;
    console.log('[Exercise Agent] Generated Plan:', plan);

    // ============================================
    // PHASE 2: DATA GATHERING (Tool Use)
    // ============================================
    console.log('[Exercise Agent] Phase 2: Data Gathering');
    
    const gatheredData = {};

    // Get ICD-11 details for diagnosis (if specified)
    if (diagnosis) {
      gatheredData.diagnosisDetails = await this.executeTool('search_diagnosis_codes', {
        searchTerm: diagnosis
      });
    }

    // Get comprehensive research evidence
    if (diagnosis) {
      gatheredData.evidence = await this.executeTool('get_diagnosis_evidence_summary', {
        diagnosis: diagnosis
      });
    }

    // Get ROM reference data if ROM impairment mentioned
    if (impairments.some(imp => imp.toLowerCase().includes('rom') || imp.toLowerCase().includes('range'))) {
      const affectedJoint = sessionData.affectedJoint || this.extractJointFromDiagnosis(diagnosis);
      if (affectedJoint) {
        gatheredData.romReference = await this.executeTool('get_clinical_reference', {
          dataType: 'rom',
          filter: { joint: affectedJoint }
        });
      }
    }

    // Get patient history (if patient ID provided)
    if (patientId) {
      gatheredData.patientHistory = await this.executeTool('get_patient_history', {
        patientId: patientId,
        includeNotes: true,
        sessionLimit: 3
      });
    }

    console.log('[Exercise Agent] Data gathered:', Object.keys(gatheredData));

    // ============================================
    // PHASE 3: GENERATION (Synthesis)
    // ============================================
    console.log('[Exercise Agent] Phase 3: Generation');
    
    const generationPrompt = `Using ALL the gathered information, create a comprehensive, evidence-based exercise program.

DIAGNOSIS INFORMATION:
${JSON.stringify(gatheredData.diagnosisDetails, null, 2)}

RESEARCH EVIDENCE:
${JSON.stringify(gatheredData.evidence, null, 2)}

ROM REFERENCE DATA:
${JSON.stringify(gatheredData.romReference, null, 2)}

PATIENT HISTORY:
${JSON.stringify(gatheredData.patientHistory, null, 2)}

CURRENT IMPAIRMENTS:
${JSON.stringify(impairments, null, 2)}

PATIENT GOALS:
${goals}

Create a home exercise program with 5-8 exercises that:
1. Are evidence-based for this specific diagnosis
2. Address the identified impairments
3. Progress toward patient goals
4. Are appropriate for patient's current functional level
5. Include clear instructions for patient

For each exercise, provide:
- name: Exercise name
- type: (strengthening/stretching/balance/aerobic/functional)
- sets: Number of sets
- reps: Number of repetitions (or duration if time-based)
- duration: Hold time or duration (if applicable)
- instructions: Clear, patient-friendly instructions
- rationale: Why this exercise for this condition (clinical reasoning)
- evidence: PMID or study reference if available
- progressions: How to make it harder when ready

Return ONLY valid JSON in this exact format:
{
  "exercises": [
    {
      "name": "string",
      "type": "string",
      "sets": number,
      "reps": "string",
      "duration": "string",
      "instructions": "string",
      "rationale": "string",
      "evidence": "string",
      "progressions": "string"
    }
  ]
}`;

    const generationResponse = await this.openai.chat.completions.create({
      model: this.model,
      messages: [
        { 
          role: 'system', 
          content: 'You are an expert physiotherapist creating evidence-based exercise prescriptions. Always ground recommendations in research evidence. Return only valid JSON.' 
        },
        { role: 'user', content: generationPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    });

    const generatedContent = generationResponse.choices[0].message.content;
    let initialProgram;
    
    try {
      initialProgram = JSON.parse(generatedContent);
    } catch (parseError) {
      console.error('[Exercise Agent] JSON parse error:', parseError);
      // Extract JSON from response if wrapped in text
      const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        initialProgram = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse exercise program JSON');
      }
    }

    console.log('[Exercise Agent] Generated program:', initialProgram);

    // ============================================
    // PHASE 4: VALIDATION (Self-Review)
    // ============================================
    console.log('[Exercise Agent] Phase 4: Validation');
    
    const contraindications = gatheredData.diagnosisDetails?.[0]?.contraindications || 
                             gatheredData.diagnosisDetails?.[0]?.description || 
                             'Review standard precautions';

    const validationPrompt = `Review this exercise program for clinical safety and quality:

EXERCISE PROGRAM:
${JSON.stringify(initialProgram, null, 2)}

PATIENT DIAGNOSIS: ${diagnosis}
CONTRAINDICATIONS/PRECAUTIONS: ${contraindications}
PATIENT IMPAIRMENTS: ${JSON.stringify(impairments)}

CRITICAL SAFETY REVIEW:
1. Are there any contraindicated exercises for this diagnosis?
2. Is the dosage (sets/reps) appropriate for patient's current level?
3. Are progressions realistic and safe?
4. Is each exercise evidence-supported for this condition?
5. Are instructions clear enough for unsupervised home exercise?
6. Any missing crucial safety precautions?
7. Does the program address all identified impairments?

Respond with JSON:
{
  "isSafe": boolean (true if no safety concerns),
  "concerns": [array of any safety or quality concerns found],
  "recommendations": [array of specific improvements to make],
  "missingElements": [array of anything important that's missing],
  "approved": boolean (true if program is ready to use)
}`;

    const validationResponse = await this.openai.chat.completions.create({
      model: this.model,
      messages: [
        { 
          role: 'system', 
          content: 'You are a clinical safety reviewer ensuring exercise programs are safe, evidence-based, and appropriate. Be thorough and conservative.' 
        },
        { role: 'user', content: validationPrompt }
      ],
      temperature: 0.2, // Very conservative for safety
      max_tokens: 800,
      response_format: { type: 'json_object' }
    });

    const validation = JSON.parse(validationResponse.choices[0].message.content);
    console.log('[Exercise Agent] Validation result:', validation);

    // ============================================
    // PHASE 5: REFINEMENT (If Needed)
    // ============================================
    console.log('[Exercise Agent] Phase 5: Refinement');
    
    let finalProgram = initialProgram;

    if (!validation.approved || validation.concerns.length > 0) {
      console.log('[Exercise Agent] Refinement needed, iterating...');
      
      const refinementPrompt = `The initial exercise program has concerns. Create an improved version.

INITIAL PROGRAM:
${JSON.stringify(initialProgram, null, 2)}

CONCERNS IDENTIFIED:
${JSON.stringify(validation.concerns, null, 2)}

RECOMMENDATIONS:
${JSON.stringify(validation.recommendations, null, 2)}

MISSING ELEMENTS:
${JSON.stringify(validation.missingElements, null, 2)}

Create an improved exercise program that:
- Addresses ALL concerns
- Implements ALL recommendations
- Adds any missing elements
- Maintains clinical effectiveness
- Stays evidence-based

Use the same JSON format as before.`;

      const refinementResponse = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: 'You are an expert physiotherapist refining exercise programs to address safety and quality concerns.' },
          { role: 'user', content: refinementPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      });

      finalProgram = JSON.parse(refinementResponse.choices[0].message.content);
      console.log('[Exercise Agent] Refined program created');
    }

    // ============================================
    // RETURN COMPREHENSIVE RESULT
    // ============================================
    
    return {
      exercises: finalProgram.exercises || [],
      metadata: {
        evidenceSources: this.extractEvidenceSources(gatheredData.evidence),
        diagnosisCode: gatheredData.diagnosisDetails?.[0]?.code,
        diagnosisDescription: gatheredData.diagnosisDetails?.[0]?.description,
        validationStatus: validation.approved ? 'approved' : 'approved_with_modifications',
        concerns: validation.concerns || [],
        agentPlan: plan,
        dataGathered: Object.keys(gatheredData),
        phasesCompleted: ['planning', 'data_gathering', 'generation', 'validation', validation.approved ? null : 'refinement'].filter(Boolean),
        generatedAt: new Date()
      }
    };
  }

  /**
   * Extract evidence sources with PMIDs from research data
   */
  extractEvidenceSources(evidence) {
    if (!evidence) return [];
    
    const sources = [];
    
    ['systematicReviews', 'randomizedTrials', 'guidelines'].forEach(category => {
      if (evidence[category] && Array.isArray(evidence[category])) {
        evidence[category].forEach(study => {
          if (study.pmid) {
            sources.push({
              pmid: study.pmid,
              title: study.title,
              authors: study.authors,
              year: study.year,
              category: category
            });
          }
        });
      }
    });
    
    return sources.slice(0, 5); // Return top 5
  }

  /**
   * Extract joint name from diagnosis string
   */
  extractJointFromDiagnosis(diagnosis) {
    if (!diagnosis) return null;
    
    const joints = ['shoulder', 'elbow', 'wrist', 'hip', 'knee', 'ankle', 'spine', 'neck', 'back'];
    const lowerDiagnosis = diagnosis.toLowerCase();
    
    for (const joint of joints) {
      if (lowerDiagnosis.includes(joint)) {
        return joint;
      }
    }
    
    return null;
  }

  /**
   * AGENT WORKFLOW: Generate SOAP Note (Placeholder for Phase 2)
   */
  async generateSOAPNoteAgent(context) {
    // TODO: Implement in Phase 2
    throw new Error('SOAP Note Agent not yet implemented. Coming in Phase 2.');
  }

  /**
   * AGENT WORKFLOW: Clinical Decision Support (Placeholder for Phase 4)
   */
  async clinicalDecisionAgent(context) {
    // TODO: Implement in Phase 4
    throw new Error('Clinical Decision Support Agent not yet implemented. Coming in Phase 4.');
  }

  /**
   * AGENT WORKFLOW: Billing Code Suggestions (Placeholder)
   */
  async suggestBillingAgent(context) {
    // TODO: Implement later
    throw new Error('Billing Agent not yet implemented.');
  }
}

// Singleton instance
let agentInstance = null;

/**
 * Get or create agent instance
 */
function getAgent() {
  if (!agentInstance) {
    agentInstance = new PhysioAIAgent();
  }
  return agentInstance;
}

module.exports = {
  PhysioAIAgent,
  getAgent,
  // Export for testing
  _resetInstance: () => { agentInstance = null; }
};
