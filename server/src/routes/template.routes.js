const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const Template = require('../models/template.model');

// @route   GET /api/templates
// @desc    Get all templates for the user (own + public)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { type, specialty } = req.query;
    
    // Build query
    const query = {
      $or: [
        { userId: req.user._id },
        { isPublic: true }
      ]
    };
    
    // Add filters if provided
    if (type) {
      query.type = type;
    }
    if (specialty) {
      query.specialty = specialty;
    }
    
    const templates = await Template.find(query).sort({ createdAt: -1 });

    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: { message: 'Failed to fetch templates' } });
  }
});

// @route   GET /api/templates/:id
// @desc    Get single template
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({ error: { message: 'Template not found' } });
    }

    // Check if user has access (owner or public)
    if (template.userId.toString() !== req.user._id.toString() && !template.isPublic) {
      return res.status(403).json({ error: { message: 'Access denied' } });
    }

    res.json(template);
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ error: { message: 'Failed to fetch template' } });
  }
});

// @route   POST /api/templates
// @desc    Create new template
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const templateData = {
      ...req.body,
      userId: req.user._id
    };

    const template = await Template.create(templateData);
    res.status(201).json(template);
  } catch (error) {
    console.error('Error creating template:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: { 
          message: Object.values(error.errors).map(e => e.message).join(', '),
          code: 'VALIDATION_ERROR'
        } 
      });
    }
    
    res.status(500).json({ error: { message: 'Failed to create template' } });
  }
});

// @route   PUT /api/templates/:id
// @desc    Update template
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({ error: { message: 'Template not found' } });
    }

    // Only owner can update
    if (template.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: { message: 'Access denied' } });
    }

    const updatedTemplate = await Template.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedTemplate);
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ error: { message: 'Failed to update template' } });
  }
});

// @route   DELETE /api/templates/:id
// @desc    Delete template
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({ error: { message: 'Template not found' } });
    }

    // Only owner can delete
    if (template.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: { message: 'Access denied' } });
    }

    await Template.findByIdAndDelete(req.params.id);
    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ error: { message: 'Failed to delete template' } });
  }
});

// @route   POST /api/templates/:id/clone
// @desc    Clone a public template to user's own templates
// @access  Private
router.post('/:id/clone', protect, async (req, res) => {
  try {
    const sourceTemplate = await Template.findById(req.params.id);

    if (!sourceTemplate) {
      return res.status(404).json({ error: { message: 'Template not found' } });
    }

    if (!sourceTemplate.isPublic && sourceTemplate.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: { message: 'Cannot clone private template' } });
    }

    const clonedTemplate = await Template.create({
      name: `Copy of ${sourceTemplate.name}`,
      description: sourceTemplate.description,
      type: sourceTemplate.type,
      structure: sourceTemplate.structure,
      promptInstructions: sourceTemplate.promptInstructions,
      specialty: sourceTemplate.specialty,
      tags: sourceTemplate.tags,
      userId: req.user._id,
      isPublic: false
    });

    res.status(201).json(clonedTemplate);
  } catch (error) {
    console.error('Error cloning template:', error);
    res.status(500).json({ error: { message: 'Failed to clone template' } });
  }
});

module.exports = router;
