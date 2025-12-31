/**
 * ICD-10-CM Diagnosis Codes Common in Physical Therapy
 * Source: WHO International Classification of Diseases, 10th Revision, Clinical Modification
 * 
 * NOTE: This is a curated subset of codes commonly used in outpatient PT practice.
 * For complete ICD-10-CM code set, refer to: https://www.cms.gov/medicare/coding/icd10
 * 
 * ICD-10 codes are updated annually (October 1). These codes are from the 2025 code set.
 * Always verify current codes before use in production.
 */

const icd10Codes = {
  // SHOULDER CONDITIONS (M25.51x, M75.xx)
  shoulder: [
    {
      code: 'M25.511',
      description: 'Pain in right shoulder',
      category: 'shoulder',
      laterality: 'right',
      commonTerms: ['shoulder pain']
    },
    {
      code: 'M25.512',
      description: 'Pain in left shoulder',
      category: 'shoulder',
      laterality: 'left',
      commonTerms: ['shoulder pain']
    },
    {
      code: 'M75.101',
      description: 'Unspecified rotator cuff tear or rupture of right shoulder, not specified as traumatic',
      category: 'shoulder',
      laterality: 'right',
      commonTerms: ['rotator cuff tear', 'RTC tear']
    },
    {
      code: 'M75.102',
      description: 'Unspecified rotator cuff tear or rupture of left shoulder, not specified as traumatic',
      category: 'shoulder',
      laterality: 'left',
      commonTerms: ['rotator cuff tear', 'RTC tear']
    },
    {
      code: 'M75.51',
      description: 'Bursitis of right shoulder',
      category: 'shoulder',
      laterality: 'right',
      commonTerms: ['bursitis', 'shoulder bursitis']
    },
    {
      code: 'M75.52',
      description: 'Bursitis of left shoulder',
      category: 'shoulder',
      laterality: 'left',
      commonTerms: ['bursitis', 'shoulder bursitis']
    },
    {
      code: 'M75.31',
      description: 'Calcific tendinitis of right shoulder',
      category: 'shoulder',
      laterality: 'right',
      commonTerms: ['calcific tendinitis', 'tendonitis']
    },
    {
      code: 'M75.32',
      description: 'Calcific tendinitis of left shoulder',
      category: 'shoulder',
      laterality: 'left',
      commonTerms: ['calcific tendinitis', 'tendonitis']
    },
    {
      code: 'S43.431A',
      description: 'Superior glenoid labrum lesion of right shoulder, initial encounter',
      category: 'shoulder',
      laterality: 'right',
      commonTerms: ['SLAP tear', 'labral tear']
    }
  ],

  // KNEE CONDITIONS (M17.xx, M23.xx, S83.xx)
  knee: [
    {
      code: 'M25.561',
      description: 'Pain in right knee',
      category: 'knee',
      laterality: 'right',
      commonTerms: ['knee pain']
    },
    {
      code: 'M25.562',
      description: 'Pain in left knee',
      category: 'knee',
      laterality: 'left',
      commonTerms: ['knee pain']
    },
    {
      code: 'M17.11',
      description: 'Unilateral primary osteoarthritis, right knee',
      category: 'knee',
      laterality: 'right',
      commonTerms: ['osteoarthritis', 'OA', 'arthritis']
    },
    {
      code: 'M17.12',
      description: 'Unilateral primary osteoarthritis, left knee',
      category: 'knee',
      laterality: 'left',
      commonTerms: ['osteoarthritis', 'OA', 'arthritis']
    },
    {
      code: 'M23.201',
      description: 'Derangement of unspecified meniscus due to old tear or injury, right knee',
      category: 'knee',
      laterality: 'right',
      commonTerms: ['meniscus tear', 'torn meniscus']
    },
    {
      code: 'M23.202',
      description: 'Derangement of unspecified meniscus due to old tear or injury, left knee',
      category: 'knee',
      laterality: 'left',
      commonTerms: ['meniscus tear', 'torn meniscus']
    },
    {
      code: 'S83.511A',
      description: 'Sprain of anterior cruciate ligament of right knee, initial encounter',
      category: 'knee',
      laterality: 'right',
      commonTerms: ['ACL sprain', 'ACL tear', 'ligament injury']
    },
    {
      code: 'S83.512A',
      description: 'Sprain of anterior cruciate ligament of left knee, initial encounter',
      category: 'knee',
      laterality: 'left',
      commonTerms: ['ACL sprain', 'ACL tear', 'ligament injury']
    },
    {
      code: 'M22.41',
      description: 'Chondromalacia patellae, right knee',
      category: 'knee',
      laterality: 'right',
      commonTerms: ['chondromalacia', 'patellofemoral pain']
    }
  ],

  // LOW BACK CONDITIONS (M54.5, M51.xx)
  lumbarSpine: [
    {
      code: 'M54.5',
      description: 'Low back pain',
      category: 'lumbarSpine',
      laterality: 'bilateral',
      commonTerms: ['LBP', 'back pain', 'lower back pain']
    },
    {
      code: 'M54.41',
      description: 'Lumbago with sciatica, right side',
      category: 'lumbarSpine',
      laterality: 'right',
      commonTerms: ['sciatica', 'radiculopathy', 'nerve pain']
    },
    {
      code: 'M54.42',
      description: 'Lumbago with sciatica, left side',
      category: 'lumbarSpine',
      laterality: 'left',
      commonTerms: ['sciatica', 'radiculopathy', 'nerve pain']
    },
    {
      code: 'M51.26',
      description: 'Other intervertebral disc displacement, lumbar region',
      category: 'lumbarSpine',
      laterality: 'bilateral',
      commonTerms: ['disc herniation', 'bulging disc', 'slipped disc']
    },
    {
      code: 'M51.36',
      description: 'Other intervertebral disc degeneration, lumbar region',
      category: 'lumbarSpine',
      laterality: 'bilateral',
      commonTerms: ['degenerative disc disease', 'DDD']
    },
    {
      code: 'M47.816',
      description: 'Spondylosis without myelopathy or radiculopathy, lumbar region',
      category: 'lumbarSpine',
      laterality: 'bilateral',
      commonTerms: ['spondylosis', 'spinal arthritis']
    }
  ],

  // NECK CONDITIONS (M54.2, M50.xx)
  cervicalSpine: [
    {
      code: 'M54.2',
      description: 'Cervicalgia',
      category: 'cervicalSpine',
      laterality: 'bilateral',
      commonTerms: ['neck pain', 'cervical pain']
    },
    {
      code: 'M50.20',
      description: 'Other cervical disc displacement, unspecified cervical region',
      category: 'cervicalSpine',
      laterality: 'bilateral',
      commonTerms: ['disc herniation', 'cervical disc']
    },
    {
      code: 'M50.30',
      description: 'Other cervical disc degeneration, unspecified cervical region',
      category: 'cervicalSpine',
      laterality: 'bilateral',
      commonTerms: ['degenerative disc disease', 'DDD']
    },
    {
      code: 'M53.0',
      description: 'Cervicocranial syndrome',
      category: 'cervicalSpine',
      laterality: 'bilateral',
      commonTerms: ['headaches', 'cervicogenic headache']
    }
  ],

  // ANKLE CONDITIONS (S93.xx, M25.57x)
  ankle: [
    {
      code: 'M25.571',
      description: 'Pain in right ankle and joints of right foot',
      category: 'ankle',
      laterality: 'right',
      commonTerms: ['ankle pain', 'foot pain']
    },
    {
      code: 'M25.572',
      description: 'Pain in left ankle and joints of left foot',
      category: 'ankle',
      laterality: 'left',
      commonTerms: ['ankle pain', 'foot pain']
    },
    {
      code: 'S93.401A',
      description: 'Sprain of unspecified ligament of right ankle, initial encounter',
      category: 'ankle',
      laterality: 'right',
      commonTerms: ['ankle sprain', 'sprained ankle']
    },
    {
      code: 'S93.402A',
      description: 'Sprain of unspecified ligament of left ankle, initial encounter',
      category: 'ankle',
      laterality: 'left',
      commonTerms: ['ankle sprain', 'sprained ankle']
    },
    {
      code: 'M72.2',
      description: 'Plantar fascial fibromatosis',
      category: 'ankle',
      laterality: 'bilateral',
      commonTerms: ['plantar fasciitis', 'heel pain']
    }
  ],

  // HIP CONDITIONS (M25.55x, M16.xx)
  hip: [
    {
      code: 'M25.551',
      description: 'Pain in right hip',
      category: 'hip',
      laterality: 'right',
      commonTerms: ['hip pain']
    },
    {
      code: 'M25.552',
      description: 'Pain in left hip',
      category: 'hip',
      laterality: 'left',
      commonTerms: ['hip pain']
    },
    {
      code: 'M16.11',
      description: 'Unilateral primary osteoarthritis, right hip',
      category: 'hip',
      laterality: 'right',
      commonTerms: ['hip osteoarthritis', 'hip arthritis', 'OA']
    },
    {
      code: 'M16.12',
      description: 'Unilateral primary osteoarthritis, left hip',
      category: 'hip',
      laterality: 'left',
      commonTerms: ['hip osteoarthritis', 'hip arthritis', 'OA']
    }
  ],

  // GENERAL CONDITIONS
  general: [
    {
      code: 'M62.81',
      description: 'Muscle weakness (generalized)',
      category: 'general',
      laterality: 'bilateral',
      commonTerms: ['weakness', 'muscle weakness']
    },
    {
      code: 'R26.81',
      description: 'Unsteadiness on feet',
      category: 'general',
      laterality: 'bilateral',
      commonTerms: ['balance problems', 'unsteady gait']
    },
    {
      code: 'R26.2',
      description: 'Difficulty in walking, not elsewhere classified',
      category: 'general',
      laterality: 'bilateral',
      commonTerms: ['gait abnormality', 'difficulty walking']
    },
    {
      code: 'Z96.641',
      description: 'Presence of right artificial hip joint',
      category: 'general',
      laterality: 'right',
      commonTerms: ['hip replacement', 'THR', 'total hip arthroplasty']
    },
    {
      code: 'Z96.651',
      description: 'Presence of right artificial knee joint',
      category: 'general',
      laterality: 'right',
      commonTerms: ['knee replacement', 'TKR', 'total knee arthroplasty']
    }
  ]
};

/**
 * Get all ICD-10 codes as flat array
 */
const getAllCodes = () => {
  const allCodes = [];
  Object.keys(icd10Codes).forEach(category => {
    allCodes.push(...icd10Codes[category]);
  });
  return allCodes;
};

/**
 * Get codes by category
 */
const getCodesByCategory = (category) => {
  return icd10Codes[category] || [];
};

/**
 * Search codes by description or code
 */
const searchCodes = (query) => {
  const lowerQuery = query.toLowerCase();
  return getAllCodes().filter(code =>
    code.code.toLowerCase().includes(lowerQuery) ||
    code.description.toLowerCase().includes(lowerQuery) ||
    code.commonTerms.some(term => term.toLowerCase().includes(lowerQuery))
  );
};

/**
 * Get code details by code number
 */
const getCodeByNumber = (codeNumber) => {
  return getAllCodes().find(code => code.code === codeNumber);
};

/**
 * Get commonly used PT diagnosis codes (top 20)
 */
const getCommonCodes = () => {
  return [
    'M54.5',   // Low back pain (most common)
    'M25.511', // Right shoulder pain
    'M25.512', // Left shoulder pain
    'M25.561', // Right knee pain
    'M25.562', // Left knee pain
    'M54.2',   // Neck pain
    'M17.11',  // Right knee OA
    'M17.12',  // Left knee OA
    'S93.401A', // Right ankle sprain
    'S93.402A', // Left ankle sprain
    'M75.101', // Right rotator cuff tear
    'M54.41',  // Sciatica, right
    'M72.2',   // Plantar fasciitis
    'M25.571', // Right ankle pain
    'M25.551', // Right hip pain
    'M62.81',  // Muscle weakness
    'R26.81',  // Unsteadiness
    'M51.26',  // Lumbar disc displacement
    'M23.201', // Right meniscus tear
    'M16.11'   // Right hip OA
  ].map(getCodeByNumber).filter(Boolean);
};

/**
 * Get body region categories
 */
const getCategories = () => {
  return Object.keys(icd10Codes).map(key => ({
    value: key,
    label: formatCategoryLabel(key),
    codeCount: icd10Codes[key].length
  }));
};

/**
 * Format category label for display
 */
const formatCategoryLabel = (category) => {
  const labels = {
    shoulder: 'Shoulder',
    knee: 'Knee',
    lumbarSpine: 'Lumbar Spine (Low Back)',
    cervicalSpine: 'Cervical Spine (Neck)',
    ankle: 'Ankle & Foot',
    hip: 'Hip',
    general: 'General/Other'
  };
  return labels[category] || category;
};

module.exports = {
  icd10Codes,
  getAllCodes,
  getCodesByCategory,
  searchCodes,
  getCodeByNumber,
  getCommonCodes,
  getCategories,
  formatCategoryLabel
};
