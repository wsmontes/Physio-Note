/**
 * Range of Motion (ROM) Reference Values
 * Normal ROM ranges for common joints and movements in degrees
 * Based on American Academy of Orthopedic Surgeons (AAOS) standards
 */

const romReference = {
  shoulder: {
    label: 'Shoulder',
    movements: {
      flexion: { label: 'Flexion', normal: 180, unit: '°' },
      extension: { label: 'Extension', normal: 60, unit: '°' },
      abduction: { label: 'Abduction', normal: 180, unit: '°' },
      adduction: { label: 'Adduction', normal: 50, unit: '°' },
      internalRotation: { label: 'Internal Rotation', normal: 70, unit: '°' },
      externalRotation: { label: 'External Rotation', normal: 90, unit: '°' }
    }
  },
  elbow: {
    label: 'Elbow',
    movements: {
      flexion: { label: 'Flexion', normal: 150, unit: '°' },
      extension: { label: 'Extension', normal: 0, unit: '°' },
      pronation: { label: 'Pronation', normal: 80, unit: '°' },
      supination: { label: 'Supination', normal: 80, unit: '°' }
    }
  },
  wrist: {
    label: 'Wrist',
    movements: {
      flexion: { label: 'Flexion', normal: 80, unit: '°' },
      extension: { label: 'Extension', normal: 70, unit: '°' },
      ulnarDeviation: { label: 'Ulnar Deviation', normal: 30, unit: '°' },
      radialDeviation: { label: 'Radial Deviation', normal: 20, unit: '°' }
    }
  },
  hip: {
    label: 'Hip',
    movements: {
      flexion: { label: 'Flexion', normal: 120, unit: '°' },
      extension: { label: 'Extension', normal: 30, unit: '°' },
      abduction: { label: 'Abduction', normal: 45, unit: '°' },
      adduction: { label: 'Adduction', normal: 30, unit: '°' },
      internalRotation: { label: 'Internal Rotation', normal: 45, unit: '°' },
      externalRotation: { label: 'External Rotation', normal: 45, unit: '°' }
    }
  },
  knee: {
    label: 'Knee',
    movements: {
      flexion: { label: 'Flexion', normal: 135, unit: '°' },
      extension: { label: 'Extension', normal: 0, unit: '°' }
    }
  },
  ankle: {
    label: 'Ankle',
    movements: {
      plantarflexion: { label: 'Plantarflexion', normal: 50, unit: '°' },
      dorsiflexion: { label: 'Dorsiflexion', normal: 20, unit: '°' },
      inversion: { label: 'Inversion', normal: 35, unit: '°' },
      eversion: { label: 'Eversion', normal: 15, unit: '°' }
    }
  },
  cervicalSpine: {
    label: 'Cervical Spine',
    movements: {
      flexion: { label: 'Flexion', normal: 50, unit: '°' },
      extension: { label: 'Extension', normal: 60, unit: '°' },
      lateralFlexionRight: { label: 'Lateral Flexion (R)', normal: 45, unit: '°' },
      lateralFlexionLeft: { label: 'Lateral Flexion (L)', normal: 45, unit: '°' },
      rotationRight: { label: 'Rotation (R)', normal: 80, unit: '°' },
      rotationLeft: { label: 'Rotation (L)', normal: 80, unit: '°' }
    }
  },
  lumbarSpine: {
    label: 'Lumbar Spine',
    movements: {
      flexion: { label: 'Flexion', normal: 60, unit: '°' },
      extension: { label: 'Extension', normal: 25, unit: '°' },
      lateralFlexionRight: { label: 'Lateral Flexion (R)', normal: 25, unit: '°' },
      lateralFlexionLeft: { label: 'Lateral Flexion (L)', normal: 25, unit: '°' },
      rotationRight: { label: 'Rotation (R)', normal: 30, unit: '°' },
      rotationLeft: { label: 'Rotation (L)', normal: 30, unit: '°' }
    }
  },
  thoracicSpine: {
    label: 'Thoracic Spine',
    movements: {
      flexion: { label: 'Flexion', normal: 40, unit: '°' },
      extension: { label: 'Extension', normal: 25, unit: '°' },
      lateralFlexionRight: { label: 'Lateral Flexion (R)', normal: 30, unit: '°' },
      lateralFlexionLeft: { label: 'Lateral Flexion (L)', normal: 30, unit: '°' },
      rotationRight: { label: 'Rotation (R)', normal: 35, unit: '°' },
      rotationLeft: { label: 'Rotation (L)', normal: 35, unit: '°' }
    }
  }
};

/**
 * Get all available joints
 */
const getJoints = () => {
  return Object.keys(romReference).map(key => ({
    value: key,
    label: romReference[key].label
  }));
};

/**
 * Get movements for a specific joint
 */
const getMovements = (joint) => {
  if (!romReference[joint]) return [];
  
  const movements = romReference[joint].movements;
  return Object.keys(movements).map(key => ({
    value: key,
    label: movements[key].label,
    normal: movements[key].normal,
    unit: movements[key].unit
  }));
};

/**
 * Get normal range for a specific joint and movement
 */
const getNormalRange = (joint, movement) => {
  if (!romReference[joint] || !romReference[joint].movements[movement]) {
    return null;
  }
  return romReference[joint].movements[movement].normal;
};

/**
 * Calculate percentage of normal ROM
 */
const calculatePercentage = (measured, normal) => {
  if (!normal || normal === 0) return 0;
  return Math.round((measured / normal) * 100);
};

/**
 * Get ROM deficit classification
 */
const getDeficitLevel = (percentage) => {
  if (percentage >= 90) return { level: 'normal', label: 'WNL (Within Normal Limits)', color: 'green' };
  if (percentage >= 75) return { level: 'mild', label: 'Mild Limitation', color: 'yellow' };
  if (percentage >= 50) return { level: 'moderate', label: 'Moderate Limitation', color: 'orange' };
  return { level: 'severe', label: 'Severe Limitation', color: 'red' };
};

module.exports = {
  romReference,
  getJoints,
  getMovements,
  getNormalRange,
  calculatePercentage,
  getDeficitLevel
};
