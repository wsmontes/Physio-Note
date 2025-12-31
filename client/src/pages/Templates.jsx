import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FiPlus, FiEdit2, FiTrash2, FiCopy, FiGlobe, FiLock, FiSearch, FiStar } from 'react-icons/fi';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, LoadingPage, Input } from '../components/ui';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showPublicOnly, setShowPublicOnly] = useState(false);
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

  // Filter and search templates
  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesSpecialty = filterSpecialty === 'all' || template.specialty === filterSpecialty;
      const matchesType = filterType === 'all' || template.type === filterType;
      const matchesPublic = !showPublicOnly || template.isPublic;

      return matchesSearch && matchesSpecialty && matchesType && matchesPublic;
    });
  }, [templates, searchTerm, filterSpecialty, filterType, showPublicOnly]);

  // Sort by rating and usage
  const sortedTemplates = useMemo(() => {
    return [...filteredTemplates].sort((a, b) => {
      // Public templates first
      if (a.isPublic && !b.isPublic) return -1;
      if (!a.isPublic && b.isPublic) return 1;
      
      // Then by rating
      const ratingDiff = (b.rating?.average || 0) - (a.rating?.average || 0);
      if (ratingDiff !== 0) return ratingDiff;
      
      // Then by usage
      return (b.usageCount || 0) - (a.usageCount || 0);
    });
  }, [filteredTemplates]);

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

      {/* Search and Filters */}
      <Card>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <Input
                leftIcon={<FiSearch />}
                placeholder={t('actions.search') + ' ' + t('templates.title').toLowerCase() + '...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Specialty Filter */}
            <select
              value={filterSpecialty}
              onChange={(e) => setFilterSpecialty(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">{t('templates.filters.allSpecialties')}</option>
              <option value="general">{t('templates.specialties.general')}</option>
              <option value="orthopedic">{t('templates.specialties.orthopedic')}</option>
              <option value="sports">{t('templates.specialties.sports')}</option>
              <option value="neurological">{t('templates.specialties.neurological')}</option>
              <option value="pediatric">{t('templates.specialties.pediatric')}</option>
              <option value="geriatric">{t('templates.specialties.geriatric')}</option>
              <option value="cardiopulmonary">{t('templates.specialties.cardiopulmonary')}</option>
            </select>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">{t('notes.filters.allTypes')}</option>
              <option value="soap">{t('templates.types.soap')}</option>
              <option value="evaluation">{t('templates.types.evaluation')}</option>
              <option value="progress">{t('templates.types.progress')}</option>
              <option value="discharge">{t('templates.types.discharge')}</option>
              <option value="custom">{t('templates.types.custom')}</option>
            </select>
          </div>

          {/* Public Only Toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="publicOnly"
              checked={showPublicOnly}
              onChange={(e) => setShowPublicOnly(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label htmlFor="publicOnly" className="text-sm text-gray-700">
              {t('templates.filters.publicOnly')}
            </label>
            <span className="text-xs text-gray-500 ml-2">
              ({sortedTemplates.length} {sortedTemplates.length === 1 ? t('templates.template') : t('templates.title').toLowerCase()})
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedTemplates.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <p className="text-gray-500 mb-4">{t('templates.noTemplates')}</p>
              <Button onClick={handleCreate} leftIcon={<FiPlus />}>
                {t('templates.newTemplate')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          sortedTemplates.map((template) => (
            <Card key={template._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{template.name}</CardTitle>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
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
                    
                    {/* Rating and Usage */}
                    {template.rating && template.rating.average > 0 && (
                      <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <FiStar className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{template.rating.average.toFixed(1)}</span>
                          <span className="text-gray-400">({template.rating.count})</span>
                        </div>
                        {template.usageCount > 0 && (
                          <span className="text-gray-500">
                            {t('templates.usageCount', { count: template.usageCount })}
                          </span>
                        )}
                      </div>
                    )}
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
