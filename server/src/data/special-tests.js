/**
 * Special Orthopedic Tests Library
 * Common clinical tests organized by body region
 * Based on evidence-based orthopedic examination standards
 */

const specialTests = [
  // SHOULDER TESTS
  {
    id: 'neers-test',
    name: "Neer's Test",
    bodyRegion: 'shoulder',
    specialty: 'orthopedic',
    purpose: 'Assess for subacromial impingement',
    procedure: 'Passively flex arm overhead while stabilizing scapula',
    positiveFindings: 'Pain in anterior or lateral shoulder',
    indicates: 'Subacromial impingement syndrome, rotator cuff tendinopathy',
    sensitivity: '79%',
    specificity: '53%'
  },
  {
    id: 'hawkins-kennedy',
    name: 'Hawkins-Kennedy Test',
    bodyRegion: 'shoulder',
    specialty: 'orthopedic',
    purpose: 'Assess for subacromial impingement',
    procedure: 'Shoulder at 90° flexion, forcibly internally rotate',
    positiveFindings: 'Pain in anterior or lateral shoulder',
    indicates: 'Subacromial impingement, rotator cuff tendinopathy',
    sensitivity: '79%',
    specificity: '59%'
  },
  {
    id: 'empty-can',
    name: 'Empty Can Test (Jobe\'s)',
    bodyRegion: 'shoulder',
    specialty: 'orthopedic',
    purpose: 'Assess supraspinatus muscle/tendon',
    procedure: 'Arms at 90° abduction, 30° forward flexion, thumbs down, resist downward force',
    positiveFindings: 'Pain or weakness',
    indicates: 'Supraspinatus tear or tendinopathy',
    sensitivity: '89%',
    specificity: '50%'
  },
  {
    id: 'drop-arm',
    name: 'Drop Arm Test',
    bodyRegion: 'shoulder',
    specialty: 'orthopedic',
    purpose: 'Assess for rotator cuff tear',
    procedure: 'Passively abduct arm to 90°, ask patient to slowly lower',
    positiveFindings: 'Unable to control descent, arm drops suddenly',
    indicates: 'Full-thickness rotator cuff tear',
    sensitivity: '27%',
    specificity: '88%'
  },
  {
    id: 'apprehension',
    name: 'Apprehension Test',
    bodyRegion: 'shoulder',
    specialty: 'orthopedic',
    purpose: 'Assess for anterior shoulder instability',
    procedure: 'Patient supine, shoulder 90° abduction/external rotation, apply anterior force',
    positiveFindings: 'Patient appears apprehensive, sensation of subluxation',
    indicates: 'Anterior glenohumeral instability',
    sensitivity: '72%',
    specificity: '96%'
  },
  
  // ELBOW TESTS
  {
    id: 'lateral-epicondylitis',
    name: 'Cozen\'s Test',
    bodyRegion: 'elbow',
    specialty: 'orthopedic',
    purpose: 'Assess for lateral epicondylitis',
    procedure: 'Resist wrist extension with elbow extended',
    positiveFindings: 'Pain at lateral epicondyle',
    indicates: 'Lateral epicondylitis (tennis elbow)',
    sensitivity: '88%',
    specificity: '50%'
  },
  {
    id: 'medial-epicondylitis',
    name: 'Golfer\'s Elbow Test',
    bodyRegion: 'elbow',
    specialty: 'orthopedic',
    purpose: 'Assess for medial epicondylitis',
    procedure: 'Resist wrist flexion with elbow extended',
    positiveFindings: 'Pain at medial epicondyle',
    indicates: 'Medial epicondylitis (golfer\'s elbow)',
    sensitivity: '88%',
    specificity: '48%'
  },
  
  // KNEE TESTS
  {
    id: 'lachman',
    name: 'Lachman Test',
    bodyRegion: 'knee',
    specialty: 'orthopedic',
    purpose: 'Assess ACL integrity',
    procedure: 'Knee at 20-30° flexion, stabilize femur, pull tibia anteriorly',
    positiveFindings: 'Excessive anterior translation, soft/absent end feel',
    indicates: 'Anterior cruciate ligament (ACL) tear',
    sensitivity: '85%',
    specificity: '94%'
  },
  {
    id: 'anterior-drawer',
    name: 'Anterior Drawer Test',
    bodyRegion: 'knee',
    specialty: 'orthopedic',
    purpose: 'Assess ACL integrity',
    procedure: 'Knee at 90° flexion, pull tibia anteriorly',
    positiveFindings: 'Excessive anterior translation compared to uninvolved side',
    indicates: 'ACL tear, anterolateral rotatory instability',
    sensitivity: '62%',
    specificity: '67%'
  },
  {
    id: 'posterior-drawer',
    name: 'Posterior Drawer Test',
    bodyRegion: 'knee',
    specialty: 'orthopedic',
    purpose: 'Assess PCL integrity',
    procedure: 'Knee at 90° flexion, push tibia posteriorly',
    positiveFindings: 'Excessive posterior translation',
    indicates: 'Posterior cruciate ligament (PCL) tear',
    sensitivity: '90%',
    specificity: '99%'
  },
  {
    id: 'mcmurray',
    name: 'McMurray Test',
    bodyRegion: 'knee',
    specialty: 'orthopedic',
    purpose: 'Assess for meniscal tear',
    procedure: 'Flex knee fully, rotate tibia internally/externally while extending knee',
    positiveFindings: 'Palpable/audible click with pain',
    indicates: 'Meniscal tear (medial or lateral)',
    sensitivity: '61%',
    specificity: '84%'
  },
  {
    id: 'valgus-stress',
    name: 'Valgus Stress Test',
    bodyRegion: 'knee',
    specialty: 'orthopedic',
    purpose: 'Assess MCL integrity',
    procedure: 'Apply valgus force at knee in 0° and 30° flexion',
    positiveFindings: 'Excessive medial joint opening, pain',
    indicates: 'Medial collateral ligament (MCL) sprain/tear',
    sensitivity: '91%',
    specificity: '89%'
  },
  {
    id: 'varus-stress',
    name: 'Varus Stress Test',
    bodyRegion: 'knee',
    specialty: 'orthopedic',
    purpose: 'Assess LCL integrity',
    procedure: 'Apply varus force at knee in 0° and 30° flexion',
    positiveFindings: 'Excessive lateral joint opening, pain',
    indicates: 'Lateral collateral ligament (LCL) sprain/tear',
    sensitivity: '25%',
    specificity: '88%'
  },
  
  // ANKLE TESTS
  {
    id: 'anterior-drawer-ankle',
    name: 'Anterior Drawer Test (Ankle)',
    bodyRegion: 'ankle',
    specialty: 'orthopedic',
    purpose: 'Assess ATFL integrity',
    procedure: 'Stabilize tibia, pull calcaneus anteriorly',
    positiveFindings: 'Excessive anterior translation, dimpling',
    indicates: 'Anterior talofibular ligament (ATFL) sprain',
    sensitivity: '58%',
    specificity: '83%'
  },
  {
    id: 'talar-tilt',
    name: 'Talar Tilt Test',
    bodyRegion: 'ankle',
    specialty: 'orthopedic',
    purpose: 'Assess CFL integrity',
    procedure: 'Invert calcaneus while stabilizing tibia',
    positiveFindings: 'Excessive inversion compared to uninvolved side',
    indicates: 'Calcaneofibular ligament (CFL) sprain',
    sensitivity: '50%',
    specificity: '88%'
  },
  {
    id: 'thompson',
    name: 'Thompson Test',
    bodyRegion: 'ankle',
    specialty: 'orthopedic',
    purpose: 'Assess Achilles tendon integrity',
    procedure: 'Patient prone, squeeze calf muscle',
    positiveFindings: 'No plantar flexion of foot',
    indicates: 'Achilles tendon rupture',
    sensitivity: '96%',
    specificity: '93%'
  },
  
  // HIP TESTS
  {
    id: 'thomas',
    name: 'Thomas Test',
    bodyRegion: 'hip',
    specialty: 'orthopedic',
    purpose: 'Assess hip flexor tightness',
    procedure: 'Patient supine at edge of table, pull one knee to chest, observe other leg',
    positiveFindings: 'Tested leg lifts off table or knee extends',
    indicates: 'Hip flexor contracture, iliopsoas tightness',
    sensitivity: '89%',
    specificity: '92%'
  },
  {
    id: 'faber',
    name: 'FABER Test (Patrick\'s)',
    bodyRegion: 'hip',
    specialty: 'orthopedic',
    purpose: 'Assess hip joint pathology or SI joint dysfunction',
    procedure: 'Flexion, Abduction, External Rotation of hip, apply overpressure',
    positiveFindings: 'Groin pain (hip), buttock pain (SI joint)',
    indicates: 'Hip joint pathology, SI joint dysfunction',
    sensitivity: '60%',
    specificity: '73%'
  },
  {
    id: 'trendelenburg',
    name: 'Trendelenburg Test',
    bodyRegion: 'hip',
    specialty: 'orthopedic',
    purpose: 'Assess hip abductor strength',
    procedure: 'Patient stands on one leg for 30 seconds',
    positiveFindings: 'Pelvis drops on non-weight bearing side',
    indicates: 'Hip abductor weakness (gluteus medius), superior gluteal nerve injury',
    sensitivity: '73%',
    specificity: '77%'
  },
  
  // SPINE TESTS
  {
    id: 'straight-leg-raise',
    name: 'Straight Leg Raise (SLR)',
    bodyRegion: 'lumbarSpine',
    specialty: 'orthopedic',
    purpose: 'Assess for lumbar radiculopathy',
    procedure: 'Patient supine, passively raise straight leg',
    positiveFindings: 'Radiating pain down leg below knee at <70°',
    indicates: 'Lumbar disc herniation, nerve root compression (L4-S1)',
    sensitivity: '91%',
    specificity: '26%'
  },
  {
    id: 'slump',
    name: 'Slump Test',
    bodyRegion: 'lumbarSpine',
    specialty: 'orthopedic',
    purpose: 'Assess for neural tension',
    procedure: 'Sequential: slump sitting, cervical flexion, knee extension, dorsiflexion',
    positiveFindings: 'Reproduction of symptoms, symptom relief with neck extension',
    indicates: 'Neural tension, radiculopathy',
    sensitivity: '84%',
    specificity: '83%'
  },
  {
    id: 'spurlings',
    name: 'Spurling\'s Test',
    bodyRegion: 'cervicalSpine',
    specialty: 'orthopedic',
    purpose: 'Assess for cervical radiculopathy',
    procedure: 'Extend and laterally flex neck, apply axial compression',
    positiveFindings: 'Radiating pain into arm',
    indicates: 'Cervical radiculopathy, foraminal stenosis',
    sensitivity: '50%',
    specificity: '93%'
  },
  {
    id: 'distraction',
    name: 'Cervical Distraction Test',
    bodyRegion: 'cervicalSpine',
    specialty: 'orthopedic',
    purpose: 'Assess for cervical radiculopathy',
    procedure: 'Apply gentle traction to head/neck',
    positiveFindings: 'Relief of arm symptoms',
    indicates: 'Cervical radiculopathy, foraminal compression',
    sensitivity: '40%',
    specificity: '100%'
  },
  
  // NEUROLOGICAL TESTS
  {
    id: 'babinski',
    name: 'Babinski Sign',
    bodyRegion: 'neurological',
    specialty: 'neurological',
    purpose: 'Assess for upper motor neuron lesion',
    procedure: 'Stroke lateral plantar surface of foot from heel to toes',
    positiveFindings: 'Extension of great toe, fanning of other toes',
    indicates: 'Upper motor neuron lesion, CNS pathology',
    sensitivity: '65%',
    specificity: '99%'
  },
  {
    id: 'romberg',
    name: 'Romberg Test',
    bodyRegion: 'neurological',
    specialty: 'neurological',
    purpose: 'Assess proprioception and vestibular function',
    procedure: 'Patient stands feet together, eyes closed for 30 seconds',
    positiveFindings: 'Loss of balance, increased sway',
    indicates: 'Proprioceptive deficit, vestibular dysfunction',
    sensitivity: '61%',
    specificity: '80%'
  }
];

/**
 * Get all body regions with test counts
 */
const getBodyRegions = () => {
  const regions = [...new Set(specialTests.map(test => test.bodyRegion))];
  return regions.map(region => ({
    value: region,
    label: formatRegionLabel(region),
    testCount: specialTests.filter(t => t.bodyRegion === region).length
  }));
};

/**
 * Get tests by body region
 */
const getTestsByRegion = (region) => {
  return specialTests.filter(test => test.bodyRegion === region);
};

/**
 * Search tests by name
 */
const searchTests = (query) => {
  const lowerQuery = query.toLowerCase();
  return specialTests.filter(test => 
    test.name.toLowerCase().includes(lowerQuery) ||
    test.purpose.toLowerCase().includes(lowerQuery) ||
    test.indicates.toLowerCase().includes(lowerQuery)
  );
};

/**
 * Get test by ID
 */
const getTestById = (id) => {
  return specialTests.find(test => test.id === id);
};

/**
 * Format region label for display
 */
const formatRegionLabel = (region) => {
  const labels = {
    shoulder: 'Shoulder',
    elbow: 'Elbow',
    wrist: 'Wrist & Hand',
    hip: 'Hip',
    knee: 'Knee',
    ankle: 'Ankle & Foot',
    cervicalSpine: 'Cervical Spine',
    thoracicSpine: 'Thoracic Spine',
    lumbarSpine: 'Lumbar Spine',
    neurological: 'Neurological'
  };
  return labels[region] || region;
};

/**
 * Get all tests (for initial load)
 */
const getAllTests = () => {
  return specialTests;
};

module.exports = {
  specialTests,
  getBodyRegions,
  getTestsByRegion,
  searchTests,
  getTestById,
  getAllTests,
  formatRegionLabel
};
