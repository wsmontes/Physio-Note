import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiCopy, FiGlobe, FiLock } from 'react-icons/fi';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, LoadingPage } from '../components/ui';
import templateService from '../services/template.service';
import { useToast } from '../context/ToastContext';
import TemplateEditor from '../components/templates/TemplateEditor';

const Templates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const toast = useToast();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const data = await templateService.getTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingTemplate(null);
    setShowEditor(true);
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setShowEditor(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      await templateService.deleteTemplate(id);
      toast.success('Template deleted successfully');
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  const handleClone = async (id) => {
    try {
      await templateService.cloneTemplate(id);
      toast.success('Template cloned successfully');
      fetchTemplates();
    } catch (error) {
      console.error('Error cloning template:', error);
      toast.error('Failed to clone template');
    }
  };

  const handleSave = async (templateData) => {
    try {
      if (editingTemplate) {
        await templateService.updateTemplate(editingTemplate._id, templateData);
        toast.success('Template updated successfully');
      } else {
        await templateService.createTemplate(templateData);
        toast.success('Template created successfully');
      }
      setShowEditor(false);
      setEditingTemplate(null);
      fetchTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    }
  };

  if (loading) {
    return <LoadingPage />;
  }

  if (showEditor) {
    return (
      <TemplateEditor
        template={editingTemplate}
        onSave={handleSave}
        onCancel={() => {
          setShowEditor(false);
          setEditingTemplate(null);
        }}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Note Templates</h1>
          <p className="mt-2 text-gray-600">
            Create and manage customizable note templates for your documentation
          </p>
        </div>
        <Button onClick={handleCreate} leftIcon={<FiPlus />} size="lg">
          New Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <p className="text-gray-500 mb-4">No templates yet</p>
              <Button onClick={handleCreate} leftIcon={<FiPlus />}>
                Create Your First Template
              </Button>
            </CardContent>
          </Card>
        ) : (
          templates.map((template) => (
            <Card key={template._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{template.name}</CardTitle>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={template.type === 'soap' ? 'default' : 'secondary'}>
                        {template.type.toUpperCase()}
                      </Badge>
                      <Badge variant="secondary">{template.specialty}</Badge>
                      {template.isPublic ? (
                        <FiGlobe className="h-4 w-4 text-blue-600" title="Public" />
                      ) : (
                        <FiLock className="h-4 w-4 text-gray-400" title="Private" />
                      )}
                    </div>
                  </div>
                </div>
                {template.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">{template.description}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {template.structure?.sections?.length || 0} sections
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleClone(template._id)}
                      title="Clone"
                    >
                      <FiCopy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(template)}
                      title="Edit"
                    >
                      <FiEdit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(template._id)}
                      title="Delete"
                    >
                      <FiTrash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Templates;
