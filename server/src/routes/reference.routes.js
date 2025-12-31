const express = require('express');
const router = express.Router();
const { protect: auth } = require('../middleware/auth.middleware');

// Import reference data libraries with proper destructuring
const { romReference, getJoints, getMovements } = require('../data/rom-reference');
const { mmtGrades, muscleGroups, getRegions, getMusclesByRegion, getGrades, getTestPositions } = require('../data/mmt-reference');
const { specialTests, getBodyRegions, getTestsByRegion, getAllTests, getTestById, searchTests } = require('../data/special-tests');
const { cptCodes, modifiers, getAllCodes, getCodesByCategory, getCodeByNumber, getCommonCodes, searchCodes, calculate8MinuteRuleUnits, validateBilling } = require('../data/cpt-codes');
const icd10Codes = require('../data/icd10-codes');

/**
 * @route   GET /api/reference/rom
 * @desc    Get ROM reference data (joints and movements with normal ranges)
 * @access  Private
 */
router.get('/rom', auth, (req, res) => {
  try {
    res.json({
      joints: getJoints(),
      reference: romReference
    });
  } catch (error) {
    console.error('Error fetching ROM reference:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/reference/rom/:joint
 * @desc    Get movements for a specific joint
 * @access  Private
 */
router.get('/rom/:joint', auth, (req, res) => {
  try {
    const { joint } = req.params;
    const movements = getMovements(joint);
    
    if (!movements || movements.length === 0) {
      return res.status(404).json({ message: 'Joint not found' });
    }
    
    res.json({ joint, movements });
  } catch (error) {
    console.error('Error fetching joint movements:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/reference/mmt
 * @desc    Get MMT reference data (muscle groups and grading scale)
 * @access  Private
 */
router.get('/mmt', auth, (req, res) => {
  try {
    res.json({
      regions: getRegions(),
      grades: getGrades(),
      testPositions: getTestPositions(),
      muscleGroups: muscleGroups
    });
  } catch (error) {
    console.error('Error fetching MMT reference:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/reference/mmt/:region
 * @desc    Get muscles for a specific body region
 * @access  Private
 */
router.get('/mmt/:region', auth, (req, res) => {
  try {
    const { region } = req.params;
    const muscles = getMusclesByRegion(region);
    
    if (!muscles || muscles.length === 0) {
      return res.status(404).json({ message: 'Region not found' });
    }
    
    res.json({ region, muscles });
  } catch (error) {
    console.error('Error fetching muscles by region:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/reference/special-tests
 * @desc    Get all special tests or filter by body region
 * @access  Private
 * @query   region - Filter by body region (optional)
 * @query   search - Search by test name or description (optional)
 */
router.get('/special-tests', auth, (req, res) => {
  try {
    const { region, search } = req.query;
    
    let tests;
    if (search) {
      tests = searchTests(search);
    } else if (region) {
      tests = getTestsByRegion(region);
    } else {
      tests = getAllTests();
    }
    
    res.json({
      count: tests.length,
      bodyRegions: getBodyRegions(),
      tests
    });
  } catch (error) {
    console.error('Error fetching special tests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/reference/special-tests/:id
 * @desc    Get specific test by ID
 * @access  Private
 */
router.get('/special-tests/:id', auth, (req, res) => {
  try {
    const { id } = req.params;
    const test = getTestById(id);
    
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }
    
    res.json(test);
  } catch (error) {
    console.error('Error fetching test by ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/reference/cpt-codes
 * @desc    Get CPT codes for physical therapy
 * @access  Private
 * @query   category - Filter by category (evaluation, therapeutic, modalities, tests)
 * @query   search - Search by code or description
 * @query   common - Get only commonly used codes (optional)
 */
router.get('/cpt-codes', auth, (req, res) => {
  try {
    const { category, search, common } = req.query;
    
    let codes;
    if (common === 'true') {
      codes = getCommonCodes();
    } else if (search) {
      codes = searchCodes(search);
    } else if (category) {
      codes = getCodesByCategory(category);
    } else {
      codes = getAllCodes();
    }
    
    res.json({
      count: codes.length,
      categories: Object.keys(cptCodes),
      modifiers: modifiers,
      codes
    });
  } catch (error) {
    console.error('Error fetching CPT codes:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/reference/cpt-codes/:code
 * @desc    Get specific CPT code details
 * @access  Private
 */
router.get('/cpt-codes/:code', auth, (req, res) => {
  try {
    const { code } = req.params;
    const codeDetails = getCodeByNumber(code);
    
    if (!codeDetails) {
      return res.status(404).json({ message: 'CPT code not found' });
    }
    
    res.json(codeDetails);
  } catch (error) {
    console.error('Error fetching CPT code:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/reference/billing/calculate-units
 * @desc    Calculate billable units based on 8-minute rule
 * @access  Private
 */
router.post('/billing/calculate-units', auth, (req, res) => {
  try {
    const { minutes } = req.body;
    
    if (typeof minutes !== 'number' || minutes < 0) {
      return res.status(400).json({ message: 'Invalid minutes value' });
    }
    
    const units = calculate8MinuteRuleUnits(minutes);
    
    res.json({ minutes, units });
  } catch (error) {
    console.error('Error calculating units:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/reference/billing/validate
 * @desc    Validate billing entries (time vs units)
 * @access  Private
 */
router.post('/billing/validate', auth, (req, res) => {
  try {
    const { cptEntries } = req.body;
    
    if (!Array.isArray(cptEntries)) {
      return res.status(400).json({ message: 'cptEntries must be an array' });
    }
    
    const validation = validateBilling(cptEntries);
    
    res.json(validation);
  } catch (error) {
    console.error('Error validating billing:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/reference/icd10-codes
 * @desc    Get ICD-10 diagnosis codes
 * @access  Private
 * @query   category - Filter by body region
 * @query   search - Search by code or description
 * @query   common - Get only commonly used codes
 */
router.get('/icd10-codes', auth, (req, res) => {
  try {
    const { category, search, common } = req.query;
    
    let codes;
    if (common === 'true') {
      codes = icd10Codes.getCommonCodes();
    } else if (search) {
      codes = icd10Codes.searchCodes(search);
    } else if (category) {
      codes = icd10Codes.getCodesByCategory(category);
    } else {
      codes = icd10Codes.getAllCodes();
    }
    
    res.json({
      count: codes.length,
      categories: icd10Codes.getCategories(),
      codes
    });
  } catch (error) {
    console.error('Error fetching ICD-10 codes:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/reference/icd10-codes/:code
 * @desc    Get specific ICD-10 code details
 * @access  Private
 */
router.get('/icd10-codes/:code', auth, (req, res) => {
  try {
    const { code } = req.params;
    const codeDetails = icd10Codes.getCodeByNumber(code);
    
    if (!codeDetails) {
      return res.status(404).json({ message: 'ICD-10 code not found' });
    }
    
    res.json(codeDetails);
  } catch (error) {
    console.error('Error fetching ICD-10 code:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
