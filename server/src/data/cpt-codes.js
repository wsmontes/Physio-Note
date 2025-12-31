/**
 * CPT (Current Procedural Terminology) Codes for Physical Therapy
 * Source: American Medical Association (AMA) CPT® Code Set
 * These are the official 2025 codes commonly used in physical therapy practice
 * 
 * NOTE: This is a subset of commonly used codes. Full CPT code set requires AMA license.
 * CPT codes are copyrighted by the American Medical Association.
 * For complete and current codes, refer to the official AMA CPT code book.
 */

const cptCodes = {
  // EVALUATION CODES (97161-97164)
  evaluation: [
    {
      code: '97161',
      description: 'Physical therapy evaluation: low complexity',
      category: 'evaluation',
      timeBased: false,
      typicalTime: 20,
      requiresSupervision: false,
      notes: 'Low complexity: 1-2 body regions, stable condition, minimal functional deficits'
    },
    {
      code: '97162',
      description: 'Physical therapy evaluation: moderate complexity',
      category: 'evaluation',
      timeBased: false,
      typicalTime: 30,
      requiresSupervision: false,
      notes: 'Moderate complexity: 3+ body regions or unstable condition, moderate functional deficits'
    },
    {
      code: '97163',
      description: 'Physical therapy evaluation: high complexity',
      category: 'evaluation',
      timeBased: false,
      typicalTime: 45,
      requiresSupervision: false,
      notes: 'High complexity: multiple regions, unstable/progressive condition, significant functional deficits'
    },
    {
      code: '97164',
      description: 'Physical therapy re-evaluation',
      category: 'evaluation',
      timeBased: false,
      typicalTime: 20,
      requiresSupervision: false,
      notes: 'Reassessment of patient status, modification of plan of care'
    }
  ],

  // THERAPEUTIC PROCEDURES (97110-97546)
  therapeutic: [
    {
      code: '97110',
      description: 'Therapeutic exercises',
      category: 'therapeutic',
      timeBased: true,
      unitTime: 15, // 8-minute rule applies
      requiresSupervision: false,
      notes: 'Exercises to develop strength, endurance, ROM, flexibility'
    },
    {
      code: '97112',
      description: 'Neuromuscular reeducation',
      category: 'therapeutic',
      timeBased: true,
      unitTime: 15,
      requiresSupervision: false,
      notes: 'Movement, balance, coordination, posture, proprioception training'
    },
    {
      code: '97116',
      description: 'Gait training',
      category: 'therapeutic',
      timeBased: true,
      unitTime: 15,
      requiresSupervision: false,
      notes: 'Gait training therapy (includes stair climbing)'
    },
    {
      code: '97140',
      description: 'Manual therapy techniques',
      category: 'therapeutic',
      timeBased: true,
      unitTime: 15,
      requiresSupervision: false,
      notes: 'Manual therapy (e.g., mobilization/manipulation, manual lymphatic drainage, manual traction), one or more regions'
    },
    {
      code: '97530',
      description: 'Therapeutic activities',
      category: 'therapeutic',
      timeBased: true,
      unitTime: 15,
      requiresSupervision: false,
      notes: 'Dynamic activities to improve functional performance'
    },
    {
      code: '97535',
      description: 'Self-care/home management training',
      category: 'therapeutic',
      timeBased: true,
      unitTime: 15,
      requiresSupervision: false,
      notes: 'ADL training, compensatory techniques, safety procedures'
    }
  ],

  // MODALITIES (97010-97039)
  modalities: [
    {
      code: '97010',
      description: 'Hot or cold packs',
      category: 'modality-untimed',
      timeBased: false,
      requiresSupervision: true,
      notes: 'Application of a modality (not requiring constant attendance)'
    },
    {
      code: '97012',
      description: 'Mechanical traction',
      category: 'modality-untimed',
      timeBased: false,
      requiresSupervision: true,
      notes: 'Application of a modality (not requiring constant attendance)'
    },
    {
      code: '97014',
      description: 'Electrical stimulation (unattended)',
      category: 'modality-untimed',
      timeBased: false,
      requiresSupervision: true,
      notes: 'Application of a modality (not requiring constant attendance)'
    },
    {
      code: '97016',
      description: 'Vasopneumatic devices',
      category: 'modality-untimed',
      timeBased: false,
      requiresSupervision: true,
      notes: 'Application of a modality (not requiring constant attendance)'
    },
    {
      code: '97032',
      description: 'Electrical stimulation (manual)',
      category: 'modality-timed',
      timeBased: true,
      unitTime: 15,
      requiresSupervision: false,
      notes: 'Application of a modality to one or more areas; electrical stimulation (manual), each 15 minutes'
    },
    {
      code: '97033',
      description: 'Iontophoresis',
      category: 'modality-timed',
      timeBased: true,
      unitTime: 15,
      requiresSupervision: false,
      notes: 'Application of a modality to one or more areas; iontophoresis, each 15 minutes'
    },
    {
      code: '97034',
      description: 'Contrast baths',
      category: 'modality-timed',
      timeBased: true,
      unitTime: 15,
      requiresSupervision: false,
      notes: 'Application of a modality to one or more areas; contrast baths, each 15 minutes'
    },
    {
      code: '97035',
      description: 'Ultrasound',
      category: 'modality-timed',
      timeBased: true,
      unitTime: 15,
      requiresSupervision: false,
      notes: 'Application of a modality to one or more areas; ultrasound, each 15 minutes'
    },
    {
      code: '97039',
      description: 'Unlisted modality',
      category: 'modality-untimed',
      timeBased: false,
      requiresSupervision: true,
      notes: 'Specify the modality in documentation'
    }
  ],

  // TESTS AND MEASUREMENTS (97750-97755)
  tests: [
    {
      code: '97750',
      description: 'Physical performance test or measurement',
      category: 'test',
      timeBased: true,
      unitTime: 15,
      requiresSupervision: false,
      notes: 'With written report, each 15 minutes'
    },
    {
      code: '97755',
      description: 'Assistive technology assessment',
      category: 'test',
      timeBased: false,
      requiresSupervision: false,
      notes: 'Direct one-on-one contact, with written report, each 15 minutes'
    }
  ]
};

/**
 * Common PT Modifiers
 */
const modifiers = [
  {
    code: 'GP',
    description: 'Services delivered under outpatient physical therapy plan of care',
    usage: 'Required for Medicare Part B physical therapy claims'
  },
  {
    code: '59',
    description: 'Distinct procedural service',
    usage: 'Used to indicate procedures that are not normally performed together'
  },
  {
    code: 'KX',
    description: 'Requirements specified in medical policy have been met',
    usage: 'Used when therapy cap threshold is exceeded'
  },
  {
    code: '97',
    description: 'Rehabilitative services',
    usage: 'Distinguishes from habilitative services'
  }
];

/**
 * Get all CPT codes as flat array
 */
const getAllCodes = () => {
  return [
    ...cptCodes.evaluation,
    ...cptCodes.therapeutic,
    ...cptCodes.modalities,
    ...cptCodes.tests
  ];
};

/**
 * Get codes by category
 */
const getCodesByCategory = (category) => {
  return cptCodes[category] || [];
};

/**
 * Search codes by description or code
 */
const searchCodes = (query) => {
  const lowerQuery = query.toLowerCase();
  return getAllCodes().filter(code =>
    code.code.includes(query) ||
    code.description.toLowerCase().includes(lowerQuery)
  );
};

/**
 * Get code details by code number
 */
const getCodeByNumber = (codeNumber) => {
  return getAllCodes().find(code => code.code === codeNumber);
};

/**
 * Get commonly used PT codes (top 10)
 */
const getCommonCodes = () => {
  return [
    getCodeByNumber('97110'), // Therapeutic exercises - most common
    getCodeByNumber('97140'), // Manual therapy
    getCodeByNumber('97112'), // Neuromuscular reeducation
    getCodeByNumber('97530'), // Therapeutic activities
    getCodeByNumber('97035'), // Ultrasound
    getCodeByNumber('97010'), // Hot/cold packs
    getCodeByNumber('97116'), // Gait training
    getCodeByNumber('97161'), // Eval low complexity
    getCodeByNumber('97162'), // Eval moderate complexity
    getCodeByNumber('97164')  // Re-evaluation
  ].filter(Boolean);
};

/**
 * Calculate billable units based on 8-minute rule
 * Medicare's 8-minute rule (midpoint):
 * 8-22 min = 1 unit
 * 23-37 min = 2 units
 * 38-52 min = 3 units
 * 53-67 min = 4 units
 */
const calculate8MinuteRuleUnits = (minutes) => {
  if (minutes < 8) return 0;
  if (minutes <= 22) return 1;
  if (minutes <= 37) return 2;
  if (minutes <= 52) return 3;
  if (minutes <= 67) return 4;
  if (minutes <= 82) return 5;
  if (minutes <= 97) return 6;
  // Continue pattern: add 1 unit per 15-minute interval after first unit
  return Math.floor((minutes - 8) / 15) + 1;
};

/**
 * Validate billing units match actual time
 */
const validateBilling = (cptEntries) => {
  const errors = [];
  const warnings = [];
  
  let totalTimeBasedMinutes = 0;
  let totalClaimedUnits = 0;
  
  cptEntries.forEach(entry => {
    const codeDetails = getCodeByNumber(entry.code);
    
    if (!codeDetails) {
      errors.push(`Invalid CPT code: ${entry.code}`);
      return;
    }
    
    if (codeDetails.timeBased) {
      totalTimeBasedMinutes += entry.minutes || 0;
      totalClaimedUnits += entry.units || 0;
    }
  });
  
  const calculatedUnits = calculate8MinuteRuleUnits(totalTimeBasedMinutes);
  
  if (totalClaimedUnits > calculatedUnits) {
    errors.push(`Claimed ${totalClaimedUnits} units but only ${totalTimeBasedMinutes} minutes documented. Maximum allowable: ${calculatedUnits} units.`);
  } else if (totalClaimedUnits < calculatedUnits) {
    warnings.push(`You may be under-billing. ${totalTimeBasedMinutes} minutes supports ${calculatedUnits} units, but only ${totalClaimedUnits} claimed.`);
  }
  
  return { valid: errors.length === 0, errors, warnings };
};

module.exports = {
  cptCodes,
  modifiers,
  getAllCodes,
  getCodesByCategory,
  searchCodes,
  getCodeByNumber,
  getCommonCodes,
  calculate8MinuteRuleUnits,
  validateBilling
};
