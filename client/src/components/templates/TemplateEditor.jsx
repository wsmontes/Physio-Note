import { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiArrowLeft, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Textarea } from '../ui';

const TemplateEditor = ({ template, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'soap',
    specialty: 'general',
    isPublic: false,
    promptInstructions: '',
    structure: {
      sections: []
    },
    tags: []
  });

  useEffect(() => {
    if (template) {
      setFormData({
        ...template,
        structure: template.structure || { sections: [] }
      });
    } else {
      // Default SOAP template
      setFormData(prev => ({
        ...prev,
        structure: {
          sections: [
            { name: 'subjective', label: 'Subjective', placeholder: 'Patient complaints, symptoms, history...', order: 1, required: true },
            { name: 'objective', label: 'Objective', placeholder: 'Clinical observations, measurements...', order: 2, required: true },
            { name: 'assessment', label: 'Assessment', placeholder: 'Clinical diagnosis, analysis...', order: 3, required: true },
            { name: 'plan', label: 'Plan', placeholder: 'Treatment plan, interventions...', order: 4, required: true }
          ]
        }
      }));
    }
  }, [template]);

  const addSection = () => {
    const newSection = {
      name: `section_${Date.now()}`,
      label: 'New Section',
      placeholder: '',
      order: formData.structure.sections.length + 1,
      required: false
    };
    setFormData({
      ...formData,
      structure: {
        sections: [...formData.structure.sections, newSection]
      }
    });
  };

  const removeSection = (index) => {
    const sections = formData.structure.sections.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      structure: { sections }
    });
  };

  const updateSection = (index, field, value) => {
    const sections = [...formData.structure.sections];
    sections[index] = { ...sections[index], [field]: value };
    setFormData({
      ...formData,
      structure: { sections }
    });
  };

  const moveSection = (index, direction) => {
    const sections = [...formData.structure.sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= sections.length) return;
    
    [sections[index], sections[targetIndex]] = [sections[targetIndex], sections[index]];
    
    // Update order
    sections.forEach((section, i) => {
      section.order = i + 1;
    });
    
    setFormData({
      ...formData,
      structure: { sections }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <FiArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {template ? 'Edit Template' : 'Create Template'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template Name *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Orthopedic SOAP Note"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this template..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm"
                >
                  <option value="soap">SOAP Note</option>
                  <option value="progress">Progress Note</option>
                  <option value="evaluation">Evaluation</option>
                  <option value="discharge">Discharge Summary</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialty
                </label>
                <select
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm"
                >
                  <option value="general">General</option>
                  <option value="orthopedic">Orthopedic</option>
                  <option value="sports">Sports</option>
                  <option value="neurological">Neurological</option>
                  <option value="pediatric">Pediatric</option>
                  <option value="geriatric">Geriatric</option>
                  <option value="cardiopulmonary">Cardiopulmonary</option>
                </select>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">
                  Make this template public (visible to all users)
                </span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* AI Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>AI Generation Instructions (Optional)</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.promptInstructions}
              onChange={(e) => setFormData({ ...formData, promptInstructions: e.target.value })}
              placeholder="Additional instructions for AI when generating notes with this template..."
              rows={3}
            />
            <p className="mt-2 text-xs text-gray-500">
              These instructions will be used by the AI when generating notes with this template
            </p>
          </CardContent>
        </Card>

        {/* Sections */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Template Sections</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addSection} leftIcon={<FiPlus />}>
                Add Section
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.structure.sections.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No sections yet. Add your first section.
              </p>
            ) : (
              formData.structure.sections.map((section, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Section {index + 1}</span>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => moveSection(index, 'up')}
                        disabled={index === 0}
                      >
                        <FiArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => moveSection(index, 'down')}
                        disabled={index === formData.structure.sections.length - 1}
                      >
                        <FiArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSection(index)}
                      >
                        <FiTrash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Label *
                      </label>
                      <Input
                        value={section.label}
                        onChange={(e) => updateSection(index, 'label', e.target.value)}
                        placeholder="Section label"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Field Name *
                      </label>
                      <Input
                        value={section.name}
                        onChange={(e) => updateSection(index, 'name', e.target.value)}
                        placeholder="field_name"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Placeholder Text
                    </label>
                    <Input
                      value={section.placeholder || ''}
                      onChange={(e) => updateSection(index, 'placeholder', e.target.value)}
                      placeholder="Placeholder text for this field..."
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={section.required}
                        onChange={(e) => updateSection(index, 'required', e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-xs text-gray-700">Required field</span>
                    </label>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" size="lg">
            {template ? 'Update Template' : 'Create Template'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TemplateEditor;
