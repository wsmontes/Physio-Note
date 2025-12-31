/**
 * Manual Muscle Testing (MMT) Reference
 * Muscle groups organized by body region with standard 0-5 grading scale
 * Based on Kendall's Muscle Testing and Function standards
 */

const mmtGrades = {
  '0': {
    label: '0 - No Contraction',
    description: 'No visible or palpable muscle contraction',
    percentage: 0
  },
  '1': {
    label: '1 - Trace',
    description: 'Visible or palpable contraction, no movement',
    percentage: 10
  },
  '2-': {
    label: '2- - Poor Minus',
    description: 'Partial ROM in gravity-eliminated position',
    percentage: 20
  },
  '2': {
    label: '2 - Poor',
    description: 'Complete ROM in gravity-eliminated position',
    percentage: 25
  },
  '2+': {
    label: '2+ - Poor Plus',
    description: 'Complete ROM gravity-eliminated, minimal ROM against gravity',
    percentage: 30
  },
  '3-': {
    label: '3- - Fair Minus',
    description: 'Partial ROM against gravity',
    percentage: 40
  },
  '3': {
    label: '3 - Fair',
    description: 'Complete ROM against gravity, no resistance',
    percentage: 50
  },
  '3+': {
    label: '3+ - Fair Plus',
    description: 'Complete ROM against gravity, minimal resistance',
    percentage: 60
  },
  '4-': {
    label: '4- - Good Minus',
    description: 'Complete ROM against gravity, less than moderate resistance',
    percentage: 70
  },
  '4': {
    label: '4 - Good',
    description: 'Complete ROM against gravity, moderate resistance',
    percentage: 75
  },
  '4+': {
    label: '4+ - Good Plus',
    description: 'Complete ROM against gravity, near maximal resistance',
    percentage: 85
  },
  '5': {
    label: '5 - Normal',
    description: 'Complete ROM against gravity, maximal resistance',
    percentage: 100
  }
};

const muscleGroups = {
  shoulder: {
    label: 'Shoulder',
    muscles: [
      { value: 'shoulderFlexors', label: 'Shoulder Flexors', primaryMuscle: 'Anterior Deltoid' },
      { value: 'shoulderExtensors', label: 'Shoulder Extensors', primaryMuscle: 'Latissimus Dorsi' },
      { value: 'shoulderAbductors', label: 'Shoulder Abductors', primaryMuscle: 'Middle Deltoid' },
      { value: 'shoulderAdductors', label: 'Shoulder Adductors', primaryMuscle: 'Pectoralis Major' },
      { value: 'shoulderInternalRotators', label: 'Shoulder Internal Rotators', primaryMuscle: 'Subscapularis' },
      { value: 'shoulderExternalRotators', label: 'Shoulder External Rotators', primaryMuscle: 'Infraspinatus' },
      { value: 'rotatorCuff', label: 'Rotator Cuff (composite)', primaryMuscle: 'SITS muscles' }
    ]
  },
  elbow: {
    label: 'Elbow',
    muscles: [
      { value: 'elbowFlexors', label: 'Elbow Flexors', primaryMuscle: 'Biceps Brachii' },
      { value: 'elbowExtensors', label: 'Elbow Extensors', primaryMuscle: 'Triceps Brachii' },
      { value: 'forearmPronators', label: 'Forearm Pronators', primaryMuscle: 'Pronator Teres' },
      { value: 'forearmSupinators', label: 'Forearm Supinators', primaryMuscle: 'Supinator' }
    ]
  },
  wrist: {
    label: 'Wrist & Hand',
    muscles: [
      { value: 'wristFlexors', label: 'Wrist Flexors', primaryMuscle: 'Flexor Carpi Radialis' },
      { value: 'wristExtensors', label: 'Wrist Extensors', primaryMuscle: 'Extensor Carpi Radialis' },
      { value: 'fingerFlexors', label: 'Finger Flexors', primaryMuscle: 'Flexor Digitorum' },
      { value: 'fingerExtensors', label: 'Finger Extensors', primaryMuscle: 'Extensor Digitorum' },
      { value: 'thumbOpposition', label: 'Thumb Opposition', primaryMuscle: 'Opponens Pollicis' },
      { value: 'grip', label: 'Grip Strength', primaryMuscle: 'Combined hand muscles' }
    ]
  },
  hip: {
    label: 'Hip',
    muscles: [
      { value: 'hipFlexors', label: 'Hip Flexors', primaryMuscle: 'Iliopsoas' },
      { value: 'hipExtensors', label: 'Hip Extensors', primaryMuscle: 'Gluteus Maximus' },
      { value: 'hipAbductors', label: 'Hip Abductors', primaryMuscle: 'Gluteus Medius' },
      { value: 'hipAdductors', label: 'Hip Adductors', primaryMuscle: 'Adductor Magnus' },
      { value: 'hipInternalRotators', label: 'Hip Internal Rotators', primaryMuscle: 'Tensor Fasciae Latae' },
      { value: 'hipExternalRotators', label: 'Hip External Rotators', primaryMuscle: 'Piriformis' }
    ]
  },
  knee: {
    label: 'Knee',
    muscles: [
      { value: 'kneeExtensors', label: 'Knee Extensors', primaryMuscle: 'Quadriceps' },
      { value: 'kneeFlexors', label: 'Knee Flexors', primaryMuscle: 'Hamstrings' }
    ]
  },
  ankle: {
    label: 'Ankle & Foot',
    muscles: [
      { value: 'anklePlantarflexors', label: 'Ankle Plantarflexors', primaryMuscle: 'Gastrocnemius/Soleus' },
      { value: 'ankleDorsiflexors', label: 'Ankle Dorsiflexors', primaryMuscle: 'Tibialis Anterior' },
      { value: 'footInverters', label: 'Foot Inverters', primaryMuscle: 'Tibialis Posterior' },
      { value: 'footEverters', label: 'Foot Everters', primaryMuscle: 'Peroneus Longus' }
    ]
  },
  neck: {
    label: 'Neck',
    muscles: [
      { value: 'neckFlexors', label: 'Neck Flexors', primaryMuscle: 'Sternocleidomastoid' },
      { value: 'neckExtensors', label: 'Neck Extensors', primaryMuscle: 'Cervical Extensors' },
      { value: 'neckLateralFlexors', label: 'Neck Lateral Flexors', primaryMuscle: 'Scalenes' },
      { value: 'neckRotators', label: 'Neck Rotators', primaryMuscle: 'Sternocleidomastoid' }
    ]
  },
  trunk: {
    label: 'Trunk',
    muscles: [
      { value: 'trunkFlexors', label: 'Trunk Flexors', primaryMuscle: 'Rectus Abdominis' },
      { value: 'trunkExtensors', label: 'Trunk Extensors', primaryMuscle: 'Erector Spinae' },
      { value: 'trunkLateralFlexors', label: 'Trunk Lateral Flexors', primaryMuscle: 'Obliques' },
      { value: 'trunkRotators', label: 'Trunk Rotators', primaryMuscle: 'Internal/External Obliques' },
      { value: 'coreStability', label: 'Core Stability', primaryMuscle: 'Transverse Abdominis' }
    ]
  }
};

const testPositions = [
  { value: 'supine', label: 'Supine' },
  { value: 'prone', label: 'Prone' },
  { value: 'sidelying', label: 'Sidelying' },
  { value: 'sitting', label: 'Sitting' },
  { value: 'standing', label: 'Standing' },
  { value: 'gravityEliminated', label: 'Gravity Eliminated' }
];

/**
 * Get all muscle group regions
 */
const getRegions = () => {
  return Object.keys(muscleGroups).map(key => ({
    value: key,
    label: muscleGroups[key].label
  }));
};

/**
 * Get muscles for a specific region
 */
const getMusclesByRegion = (region) => {
  if (!muscleGroups[region]) return [];
  return muscleGroups[region].muscles;
};

/**
 * Get all available MMT grades
 */
const getGrades = () => {
  return Object.keys(mmtGrades).map(key => ({
    value: key,
    label: mmtGrades[key].label,
    description: mmtGrades[key].description,
    percentage: mmtGrades[key].percentage
  }));
};

/**
 * Get test positions
 */
const getTestPositions = () => {
  return testPositions;
};

/**
 * Interpret MMT grade for clinical significance
 */
const interpretGrade = (grade) => {
  const gradeData = mmtGrades[grade];
  if (!gradeData) return null;
  
  let interpretation = {
    functional: '',
    clinical: '',
    severity: ''
  };
  
  if (grade === '5' || grade === '4+' || grade === '4') {
    interpretation.functional = 'Functional strength for most activities';
    interpretation.clinical = 'Minimal to no strength deficit';
    interpretation.severity = 'none';
  } else if (grade === '4-' || grade === '3+' || grade === '3') {
    interpretation.functional = 'Functional for light activities, may fatigue with resistance';
    interpretation.clinical = 'Mild to moderate strength deficit';
    interpretation.severity = 'mild';
  } else if (grade === '3-' || grade === '2+' || grade === '2') {
    interpretation.functional = 'Limited functional capacity, difficulty with ADLs';
    interpretation.clinical = 'Moderate to severe strength deficit';
    interpretation.severity = 'moderate';
  } else {
    interpretation.functional = 'Non-functional, requires maximum assistance';
    interpretation.clinical = 'Severe strength deficit';
    interpretation.severity = 'severe';
  }
  
  return interpretation;
};

module.exports = {
  mmtGrades,
  muscleGroups,
  testPositions,
  getRegions,
  getMusclesByRegion,
  getGrades,
  getTestPositions,
  interpretGrade
};
