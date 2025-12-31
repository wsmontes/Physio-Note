/**
 * Pre-built Template Seeds for Public Library
 * These templates are created with a system user and marked as public
 */

const preBuiltTemplates = [
  {
    name: 'Standard SOAP Note',
    description: 'Classic SOAP format for general physiotherapy documentation',
    type: 'soap',
    specialty: 'general',
    isPublic: true,
    tags: ['soap', 'general', 'standard'],
    promptInstructions: 'Generate a standard SOAP note with clear sections for Subjective, Objective, Assessment, and Plan. Focus on clinical reasoning and treatment progression.',
    structure: {
      sections: [
        {
          name: 'subjective',
          label: 'Subjective',
          placeholder: "Patient's complaints, symptoms, and functional limitations...",
          order: 1,
          required: true
        },
        {
          name: 'objective',
          label: 'Objective',
          placeholder: 'Physical examination findings, measurements, observations...',
          order: 2,
          required: true
        },
        {
          name: 'assessment',
          label: 'Assessment',
          placeholder: 'Clinical assessment, diagnosis, progress toward goals...',
          order: 3,
          required: true
        },
        {
          name: 'plan',
          label: 'Plan',
          placeholder: 'Treatment plan, interventions, home exercise program, next steps...',
          order: 4,
          required: true
        }
      ]
    },
    rating: { average: 4.5, count: 127 },
    usageCount: 856
  },
  
  {
    name: 'Orthopedic Evaluation',
    description: 'Comprehensive template for orthopedic initial evaluations with detailed ROM and strength testing',
    type: 'evaluation',
    specialty: 'orthopedic',
    isPublic: true,
    tags: ['orthopedic', 'evaluation', 'musculoskeletal', 'rom', 'strength'],
    promptInstructions: 'Create a detailed orthopedic evaluation focusing on: chief complaint, mechanism of injury, pain characteristics (location, intensity, quality), range of motion measurements, strength testing (manual muscle testing grades), special tests, functional limitations, treatment goals, and initial treatment plan.',
    structure: {
      sections: [
        {
          name: 'chiefComplaint',
          label: 'Chief Complaint',
          placeholder: 'Primary reason for visit and mechanism of injury...',
          order: 1,
          required: true
        },
        {
          name: 'subjective',
          label: 'Subjective History',
          placeholder: 'Pain characteristics, functional limitations, previous treatments...',
          order: 2,
          required: true
        },
        {
          name: 'objective',
          label: 'Objective Findings',
          placeholder: 'Posture, ROM measurements, strength grades, special tests, palpation...',
          order: 3,
          required: true
        },
        {
          name: 'assessment',
          label: 'Assessment',
          placeholder: 'Diagnosis, impairments, functional limitations, prognosis...',
          order: 4,
          required: true
        },
        {
          name: 'plan',
          label: 'Treatment Plan',
          placeholder: 'Frequency, duration, interventions, goals, patient education...',
          order: 5,
          required: true
        }
      ]
    },
    rating: { average: 4.8, count: 89 },
    usageCount: 523
  },

  {
    name: 'Sports Medicine SOAP',
    description: 'Optimized for sports injuries with emphasis on functional testing and return-to-sport criteria',
    type: 'soap',
    specialty: 'sports',
    isPublic: true,
    tags: ['sports', 'athlete', 'performance', 'return-to-sport'],
    promptInstructions: 'Generate a sports-focused SOAP note emphasizing: injury mechanism, sport-specific demands, functional performance testing, power and agility assessments, return-to-sport criteria, and sport-specific exercise progression.',
    structure: {
      sections: [
        {
          name: 'subjective',
          label: 'Subjective',
          placeholder: 'Sport, position, injury mechanism, training status, competition schedule...',
          order: 1,
          required: true
        },
        {
          name: 'objective',
          label: 'Objective',
          placeholder: 'Functional tests, sport-specific movements, power/agility tests...',
          order: 2,
          required: true
        },
        {
          name: 'assessment',
          label: 'Assessment',
          placeholder: 'Injury status, functional level, return-to-sport readiness...',
          order: 3,
          required: true
        },
        {
          name: 'plan',
          label: 'Plan',
          placeholder: 'Progressive training plan, RTS criteria, performance goals...',
          order: 4,
          required: true
        }
      ]
    },
    rating: { average: 4.7, count: 64 },
    usageCount: 412
  },

  {
    name: 'Neurological Assessment',
    description: 'Specialized template for neurological conditions with emphasis on balance, coordination, and functional mobility',
    type: 'evaluation',
    specialty: 'neurological',
    isPublic: true,
    tags: ['neuro', 'stroke', 'balance', 'coordination', 'gait'],
    promptInstructions: 'Create a neurological assessment focusing on: mental status, cranial nerve screening, motor function (tone, strength, coordination), sensory testing, balance assessments (Berg Balance Scale, Tinetti), gait analysis, functional mobility (transfers, stairs), and safety awareness.',
    structure: {
      sections: [
        {
          name: 'subjective',
          label: 'Subjective',
          placeholder: 'Medical history, symptoms, functional limitations, fall history...',
          order: 1,
          required: true
        },
        {
          name: 'mentalStatus',
          label: 'Mental Status & Cognition',
          placeholder: 'Alertness, orientation, communication, cognition...',
          order: 2,
          required: true
        },
        {
          name: 'objective',
          label: 'Objective Findings',
          placeholder: 'Tone, strength, coordination, sensation, balance tests, gait pattern...',
          order: 3,
          required: true
        },
        {
          name: 'assessment',
          label: 'Assessment',
          placeholder: 'Neurological diagnosis, functional level, fall risk, prognosis...',
          order: 4,
          required: true
        },
        {
          name: 'plan',
          label: 'Plan',
          placeholder: 'Balance training, gait training, functional mobility, safety education...',
          order: 5,
          required: true
        }
      ]
    },
    rating: { average: 4.6, count: 52 },
    usageCount: 287
  },

  {
    name: 'Pediatric PT Note',
    description: 'Child-friendly documentation template focusing on developmental milestones and play-based interventions',
    type: 'soap',
    specialty: 'pediatric',
    isPublic: true,
    tags: ['pediatric', 'developmental', 'children', 'play-based'],
    promptInstructions: 'Generate a pediatric-focused note including: developmental milestones, age-appropriate functional skills, family concerns, play-based assessment observations, caregiver education, and family-centered goals.',
    structure: {
      sections: [
        {
          name: 'subjective',
          label: 'Subjective (Parent/Caregiver Report)',
          placeholder: 'Parental concerns, developmental history, functional activities at home...',
          order: 1,
          required: true
        },
        {
          name: 'objective',
          label: 'Objective (Play-Based Assessment)',
          placeholder: 'Gross motor skills, fine motor skills, developmental milestones observed...',
          order: 2,
          required: true
        },
        {
          name: 'assessment',
          label: 'Assessment',
          placeholder: 'Developmental level, areas of delay, progress toward milestones...',
          order: 3,
          required: true
        },
        {
          name: 'plan',
          label: 'Plan (Including Family Education)',
          placeholder: 'Play-based interventions, home activities, family education, goals...',
          order: 4,
          required: true
        }
      ]
    },
    rating: { average: 4.9, count: 71 },
    usageCount: 394
  },

  {
    name: 'Geriatric Assessment',
    description: 'Comprehensive template for older adults emphasizing fall prevention, functional mobility, and quality of life',
    type: 'evaluation',
    specialty: 'geriatric',
    isPublic: true,
    tags: ['geriatric', 'elderly', 'fall-prevention', 'mobility', 'adl'],
    promptInstructions: 'Create a geriatric assessment including: medical history review, medication review, fall history, functional mobility (TUG, 30-second sit-to-stand), balance assessment, ADL/IADL status, home safety, and quality of life considerations.',
    structure: {
      sections: [
        {
          name: 'subjective',
          label: 'Subjective',
          placeholder: 'Medical history, medications, fall history, functional concerns, living situation...',
          order: 1,
          required: true
        },
        {
          name: 'objective',
          label: 'Objective',
          placeholder: 'Functional mobility tests (TUG, Berg Balance), strength, gait, ADL performance...',
          order: 2,
          required: true
        },
        {
          name: 'assessment',
          label: 'Assessment',
          placeholder: 'Fall risk, functional mobility level, safety concerns, prognosis...',
          order: 3,
          required: true
        },
        {
          name: 'plan',
          label: 'Plan',
          placeholder: 'Fall prevention strategies, strengthening, balance training, home modifications...',
          order: 4,
          required: true
        }
      ]
    },
    rating: { average: 4.7, count: 83 },
    usageCount: 461
  },

  {
    name: 'Cardiopulmonary Note',
    description: 'Template for cardiac and pulmonary rehabilitation with vital signs monitoring',
    type: 'soap',
    specialty: 'cardiopulmonary',
    isPublic: true,
    tags: ['cardiac', 'pulmonary', 'vitals', 'endurance', 'rehabilitation'],
    promptInstructions: 'Generate a cardiopulmonary note including: vital signs at rest and with activity (HR, BP, SpO2, RPE), dyspnea scale, functional capacity, exercise tolerance, and progression of aerobic training.',
    structure: {
      sections: [
        {
          name: 'subjective',
          label: 'Subjective',
          placeholder: 'Symptoms, dyspnea level, fatigue, functional limitations...',
          order: 1,
          required: true
        },
        {
          name: 'vitals',
          label: 'Vital Signs',
          placeholder: 'HR, BP, SpO2, RR at rest and with activity, RPE, dyspnea scale...',
          order: 2,
          required: true
        },
        {
          name: 'objective',
          label: 'Objective',
          placeholder: 'Exercise tolerance, 6MWT, functional capacity, breath sounds...',
          order: 3,
          required: true
        },
        {
          name: 'assessment',
          label: 'Assessment',
          placeholder: 'Exercise tolerance, cardiac response, progress, safety considerations...',
          order: 4,
          required: true
        },
        {
          name: 'plan',
          label: 'Plan',
          placeholder: 'Aerobic training progression, breathing techniques, energy conservation...',
          order: 5,
          required: true
        }
      ]
    },
    rating: { average: 4.5, count: 48 },
    usageCount: 276
  },

  {
    name: 'Post-Surgical Rehab',
    description: 'Template for post-operative rehabilitation with protocol adherence and precautions',
    type: 'soap',
    specialty: 'orthopedic',
    isPublic: true,
    tags: ['post-surgical', 'post-op', 'protocol', 'precautions', 'rehabilitation'],
    promptInstructions: 'Create a post-surgical note emphasizing: surgical procedure and date, protocol adherence, precautions, wound status, pain management, ROM/strength progression relative to post-op timeline, and functional milestones.',
    structure: {
      sections: [
        {
          name: 'subjective',
          label: 'Subjective',
          placeholder: 'Surgery date and type, pain level, medication, compliance with precautions...',
          order: 1,
          required: true
        },
        {
          name: 'objective',
          label: 'Objective',
          placeholder: 'Incision status, edema, ROM measurements, strength, functional mobility...',
          order: 2,
          required: true
        },
        {
          name: 'assessment',
          label: 'Assessment',
          placeholder: 'Progress relative to post-op timeline, protocol adherence, complications...',
          order: 3,
          required: true
        },
        {
          name: 'plan',
          label: 'Plan',
          placeholder: 'Protocol progression, precautions, home exercise program, next milestones...',
          order: 4,
          required: true
        }
      ]
    },
    rating: { average: 4.8, count: 95 },
    usageCount: 612
  },

  {
    name: 'Chronic Pain Management',
    description: 'Biopsychosocial approach to chronic pain with emphasis on function and self-management',
    type: 'soap',
    specialty: 'general',
    isPublic: true,
    tags: ['chronic-pain', 'pain-management', 'biopsychosocial', 'self-management'],
    promptInstructions: 'Generate a pain management note using biopsychosocial framework: pain characteristics, functional impact, psychological factors, sleep quality, activity pacing, pain beliefs, self-management strategies, and functional goals rather than pain elimination.',
    structure: {
      sections: [
        {
          name: 'subjective',
          label: 'Subjective',
          placeholder: 'Pain description, functional impact, sleep, mood, coping strategies...',
          order: 1,
          required: true
        },
        {
          name: 'objective',
          label: 'Objective',
          placeholder: 'Functional performance, movement patterns, compensations, activity tolerance...',
          order: 2,
          required: true
        },
        {
          name: 'assessment',
          label: 'Assessment',
          placeholder: 'Functional limitations, contributing factors, self-management skills...',
          order: 3,
          required: true
        },
        {
          name: 'plan',
          label: 'Plan',
          placeholder: 'Pacing strategies, graded activity, pain education, self-management tools...',
          order: 4,
          required: true
        }
      ]
    },
    rating: { average: 4.6, count: 67 },
    usageCount: 381
  },

  {
    name: 'Lower Back Pain Evaluation',
    description: 'Evidence-based template for low back pain assessment with red flag screening',
    type: 'evaluation',
    specialty: 'orthopedic',
    isPublic: true,
    tags: ['back-pain', 'lumbar', 'spine', 'red-flags', 'evidence-based'],
    promptInstructions: 'Create a comprehensive low back pain evaluation including: red flag screening, pain pattern analysis, neurological screening, movement-based assessment, functional limitations (ODI/RMDQ), psychosocial factors (yellow flags), and evidence-based treatment planning.',
    structure: {
      sections: [
        {
          name: 'subjective',
          label: 'Subjective & Red Flags',
          placeholder: 'Pain history, red flag screening, functional impact, aggravating/easing factors...',
          order: 1,
          required: true
        },
        {
          name: 'objective',
          label: 'Objective',
          placeholder: 'Movement testing, neurological screen, special tests, functional activities...',
          order: 2,
          required: true
        },
        {
          name: 'assessment',
          label: 'Assessment',
          placeholder: 'Clinical impression, prognosis, yellow flags, barriers to recovery...',
          order: 3,
          required: true
        },
        {
          name: 'plan',
          label: 'Evidence-Based Plan',
          placeholder: 'Education, manual therapy, exercise prescription, activity modification...',
          order: 4,
          required: true
        }
      ]
    },
    rating: { average: 4.9, count: 142 },
    usageCount: 789
  },

  {
    name: 'Shoulder Dysfunction Protocol',
    description: 'Specialized template for shoulder rehabilitation with scapular assessment',
    type: 'soap',
    specialty: 'orthopedic',
    isPublic: true,
    tags: ['shoulder', 'rotator-cuff', 'scapular', 'overhead-athlete'],
    promptInstructions: 'Generate a shoulder-focused note including: mechanism of injury, overhead activities, scapular positioning and movement, rotator cuff testing, ROM in multiple planes, provocative tests, and progressive loading strategies.',
    structure: {
      sections: [
        {
          name: 'subjective',
          label: 'Subjective',
          placeholder: 'Injury mechanism, aggravating activities, sleep position, work/sport demands...',
          order: 1,
          required: true
        },
        {
          name: 'objective',
          label: 'Objective',
          placeholder: 'Scapular position/motion, ROM (flexion/abduction/ER/IR), strength, special tests...',
          order: 2,
          required: true
        },
        {
          name: 'assessment',
          label: 'Assessment',
          placeholder: 'Diagnosis, impairments, functional limitations, treatment phase...',
          order: 3,
          required: true
        },
        {
          name: 'plan',
          label: 'Plan',
          placeholder: 'Scapular stabilization, rotator cuff strengthening, progressive loading, functional training...',
          order: 4,
          required: true
        }
      ]
    },
    rating: { average: 4.7, count: 78 },
    usageCount: 445
  },

  {
    name: 'Vestibular Rehabilitation',
    description: 'Template for dizziness/vertigo with vestibular testing and gaze stabilization',
    type: 'evaluation',
    specialty: 'neurological',
    isPublic: true,
    tags: ['vestibular', 'dizziness', 'vertigo', 'balance', 'bppv'],
    promptInstructions: 'Create a vestibular assessment including: symptom characterization (vertigo vs. lightheadedness), motion sensitivity, Dix-Hallpike testing, gaze stability, dynamic visual acuity, balance testing, and canal repositioning maneuvers or adaptation exercises.',
    structure: {
      sections: [
        {
          name: 'subjective',
          label: 'Subjective',
          placeholder: 'Dizziness characteristics, triggers, fall history, motion sensitivity...',
          order: 1,
          required: true
        },
        {
          name: 'vestibularTesting',
          label: 'Vestibular Testing',
          placeholder: 'Dix-Hallpike, head impulse test, dynamic visual acuity, gaze stability...',
          order: 2,
          required: true
        },
        {
          name: 'objective',
          label: 'Objective',
          placeholder: 'Balance tests, gait, Romberg, functional mobility...',
          order: 3,
          required: true
        },
        {
          name: 'assessment',
          label: 'Assessment',
          placeholder: 'Vestibular diagnosis (BPPV, unilateral weakness, etc.), fall risk...',
          order: 4,
          required: true
        },
        {
          name: 'plan',
          label: 'Plan',
          placeholder: 'Canalith repositioning, gaze stabilization, habituation exercises, balance training...',
          order: 5,
          required: true
        }
      ]
    },
    rating: { average: 4.8, count: 56 },
    usageCount: 312
  },

  {
    name: 'Progress Note - Brief',
    description: 'Streamlined template for routine follow-up visits',
    type: 'progress',
    specialty: 'general',
    isPublic: true,
    tags: ['progress', 'follow-up', 'brief', 'quick'],
    promptInstructions: 'Create a concise progress note focusing on: changes since last visit, key objective findings, progress toward goals, and treatment provided today with plan for next visit.',
    structure: {
      sections: [
        {
          name: 'subjective',
          label: 'Subjective',
          placeholder: 'Changes since last visit, compliance, current symptoms...',
          order: 1,
          required: true
        },
        {
          name: 'objective',
          label: 'Objective',
          placeholder: 'Key measurements, functional performance...',
          order: 2,
          required: true
        },
        {
          name: 'assessment',
          label: 'Assessment',
          placeholder: 'Progress toward goals, response to treatment...',
          order: 3,
          required: true
        },
        {
          name: 'plan',
          label: 'Plan',
          placeholder: 'Today\'s treatment, HEP modifications, next visit plan...',
          order: 4,
          required: true
        }
      ]
    },
    rating: { average: 4.4, count: 203 },
    usageCount: 1247
  },

  {
    name: 'Discharge Summary',
    description: 'Comprehensive template for final visit with outcomes and home program',
    type: 'discharge',
    specialty: 'general',
    isPublic: true,
    tags: ['discharge', 'summary', 'outcomes', 'final'],
    promptInstructions: 'Create a discharge summary including: reason for discharge, summary of treatment course, initial vs. final objective measures, goal attainment, patient education provided, home exercise program, return-to-activity guidelines, and follow-up recommendations.',
    structure: {
      sections: [
        {
          name: 'dischargeSummary',
          label: 'Discharge Summary',
          placeholder: 'Reason for discharge, number of visits, treatment dates...',
          order: 1,
          required: true
        },
        {
          name: 'outcomes',
          label: 'Outcomes',
          placeholder: 'Initial vs. final measurements, goal achievement, functional improvements...',
          order: 2,
          required: true
        },
        {
          name: 'patientEducation',
          label: 'Patient Education',
          placeholder: 'Education provided, understanding demonstrated, self-management strategies...',
          order: 3,
          required: true
        },
        {
          name: 'homeProgram',
          label: 'Home Exercise Program',
          placeholder: 'Detailed HEP, frequency, progression guidelines...',
          order: 4,
          required: true
        },
        {
          name: 'recommendations',
          label: 'Recommendations',
          placeholder: 'Return to activity guidelines, follow-up recommendations, red flags...',
          order: 5,
          required: true
        }
      ]
    },
    rating: { average: 4.7, count: 114 },
    usageCount: 673
  },

  {
    name: 'Telehealth Visit Note',
    description: 'Optimized for virtual visits with focus on remote assessment and exercise instruction',
    type: 'soap',
    specialty: 'general',
    isPublic: true,
    tags: ['telehealth', 'virtual', 'remote', 'telemedicine'],
    promptInstructions: 'Generate a telehealth note including: video quality, patient setup, remote observation of movement patterns, verbal cueing effectiveness, demonstrated exercises with modifications, technology barriers, and patient engagement.',
    structure: {
      sections: [
        {
          name: 'subjective',
          label: 'Subjective',
          placeholder: 'Patient report, compliance with HEP, barriers to treatment at home...',
          order: 1,
          required: true
        },
        {
          name: 'objective',
          label: 'Objective (Remote Assessment)',
          placeholder: 'Visual observation, movement quality, demonstrated exercises, compensations noted...',
          order: 2,
          required: true
        },
        {
          name: 'assessment',
          label: 'Assessment',
          placeholder: 'Progress, response to remote instruction, appropriateness for telehealth...',
          order: 3,
          required: true
        },
        {
          name: 'plan',
          label: 'Plan',
          placeholder: 'Exercise progressions, video resources provided, next telehealth visit...',
          order: 4,
          required: true
        }
      ]
    },
    rating: { average: 4.3, count: 91 },
    usageCount: 528
  }
];

module.exports = preBuiltTemplates;
