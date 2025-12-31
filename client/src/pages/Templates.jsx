import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiPlus, FiEdit2, FiTrash2, FiCopy, FiGlobe, FiLock } from 'react-icons/fi';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, LoadingPage } from '../components/ui';
import { useTemplates, useCreateTemplate, useUpdateTemplate, useDeleteTemplate, useCloneTemplate } from '../hooks';
import { useToast } from '../context/ToastContext';
import TemplateEditor from '../components/templates/TemplateEditor';

const Templates = () => {
  const { t } = useTranslation();
  const { data: templates = [], isLoading } = useTemplates();
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();
  const deleteTemplate = useDeleteTemplate();
  const cloneTemplate = useCloneTemplate();
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const toast = useToast();

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
    deleteTemplate.mutate(id);
  };

  const handleClone = async (id) => {
    cloneTemplate.mutate(id);
  };

  const handleSave = async (templateData) => {
    if (editingTemplate) {
      updateTemplate.mutate(
        { id: editingTemplate._id, data: templateData },
        {
          onSuccess: () => {
            setShowEditor(false);
            setEditingTemplate(null);
          }
        }
      );
    } else {
      createTemplate.mutate(templateData, {
        onSuccess: () => {
          setShowEditor(false);
          setEditingTemplate(null);
        }
      });
    }
  };

  if (isLoading) {
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
          <h1 className="text-3xl font-bold text-gray-900">{t('templates.title')}</h1>
          <p className="mt-2 text-gray-600">
            {t('templates.fields.description')}
          </p>
        </div>
        <Button onClick={handleCreate} leftIcon={<FiPlus />} size="lg">
          {t('templates.newTemplate')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <p className="text-gray-500 mb-4">{t('templates.noTemplates')}</p>
              <Button onClick={handleCreate} leftIcon={<FiPlus />}>
                {t('templates.newTemplate')}
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
                        {t(`templates.types.${template.type}`)}
                      </Badge>
                      <Badge variant="secondary">{t(`templates.specialties.${template.specialty}`)}</Badge>
                      {template.isPublic ? (
                        <FiGlobe className="h-4 w-4 text-blue-600" title={t('templates.publicTemplates')} />
                      ) : (
                        <FiLock className="h-4 w-4 text-gray-400" title={t('templates.myTemplates')} />
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
                    {template.structure?.sections?.length || 0} {t('templates.fields.sections').toLowerCase()}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleClone(template._id)}
                      title={t('actions.clone')}
                    >
                      <FiCopy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(template)}
                      title={t('actions.edit')}
                    >
                      <FiEdit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(template._id)}
                      title={t('actions.delete')}
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
