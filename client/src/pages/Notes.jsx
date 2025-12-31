import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  FiSearch, FiFilter, FiFileText, FiUser, FiCalendar, 
  FiChevronDown, FiChevronUp, FiExternalLink 
} from 'react-icons/fi';
import noteService from '../services/note.service';
import patientService from '../services/patient.service';
import sessionService from '../services/session.service';
import { useToast } from '../context/ToastContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';

const Notes = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const [notes, setNotes] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, soap, progress, discharge
  const [filterPatient, setFilterPatient] = useState('all');
  const [expandedNotes, setExpandedNotes] = useState(new Set());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [notesData, patientsData] = await Promise.all([
        noteService.getNotes(),
        patientService.getPatients()
      ]);
      
      setNotes(notesData);
      setPatients(patientsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(error.userMessage || 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const toggleNoteExpansion = (noteId) => {
    const newExpanded = new Set(expandedNotes);
    if (newExpanded.has(noteId)) {
      newExpanded.delete(noteId);
    } else {
      newExpanded.add(noteId);
    }
    setExpandedNotes(newExpanded);
  };

  const getPatientName = (patientIdOrObject) => {
    // Handle both populated object and ID string
    if (typeof patientIdOrObject === 'object' && patientIdOrObject !== null) {
      return `${patientIdOrObject.firstName} ${patientIdOrObject.lastName}`;
    }
    const patient = patients.find(p => p._id === patientIdOrObject);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';
  };

  const getNoteTypeColor = (type) => {
    const colors = {
      'soap': 'bg-blue-100 text-blue-700',
      'progress': 'bg-green-100 text-green-700',
      'discharge': 'bg-purple-100 text-purple-700',
      'initial': 'bg-yellow-100 text-yellow-700'
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  const filteredNotes = notes.filter(note => {
    // Search filter
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      note.content?.toLowerCase().includes(searchLower) ||
      note.title?.toLowerCase().includes(searchLower) ||
      getPatientName(note.patientId).toLowerCase().includes(searchLower);

    // Type filter
    const matchesType = filterType === 'all' || note.type === filterType;

    // Patient filter
    const matchesPatient = filterPatient === 'all' || 
      (typeof note.patientId === 'object' ? note.patientId._id : note.patientId) === filterPatient;

    return matchesSearch && matchesType && matchesPatient;
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Skeleton className="h-9 w-48 mb-2" />
            <Skeleton className="h-5 w-32" />
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                  <Skeleton className="h-6 w-64" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{t('notes.title')}</h1>
          <p className="text-gray-600 mt-1">
            {filteredNotes.length} {t('notes.notesFound')}
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
              <Input
                type="text"
                placeholder={t('notes.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Type Filter */}
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="all">{t('notes.filters.allTypes')}</option>
                <option value="soap">{t('notes.types.soap')}</option>
                <option value="progress">{t('notes.types.progress')}</option>
                <option value="discharge">{t('notes.types.discharge')}</option>
                <option value="initial">{t('notes.types.initial')}</option>
              </select>
            </div>

            {/* Patient Filter */}
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
              <select
                value={filterPatient}
                onChange={(e) => setFilterPatient(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="all">{t('notes.filters.allPatients')}</option>
                {patients.map(patient => (
                  <option key={patient._id} value={patient._id}>
                    {patient.firstName} {patient.lastName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes List */}
      {filteredNotes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FiFileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">{t('notes.noNotes')}</h3>
            <p className="text-gray-600">
              {searchTerm || filterType !== 'all' || filterPatient !== 'all'
                ? t('notes.tryAdjustFilters')
                : t('notes.startCreating')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredNotes.map((note) => {
            const isExpanded = expandedNotes.has(note._id);
            
            return (
              <Card key={note._id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  {/* Note Header */}
                  <div 
                    className="flex items-start justify-between cursor-pointer"
                    onClick={() => toggleNoteExpansion(note._id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge
                          variant={
                            note.type === 'soap' ? 'default' :
                            note.type === 'progress' ? 'success' :
                            note.type === 'discharge' ? 'secondary' :
                            'warning'
                          }
                        >
                          {note.type || t('notes.note')}
                        </Badge>
                      <span className="text-sm text-gray-600 flex items-center gap-1">
                        <FiCalendar className="w-4 h-4" />
                        {new Date(note.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold mb-1">
                      {note.title || 'Clinical Note'}
                    </h3>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <FiUser className="w-4 h-4" />
                        {getPatientName(note.patientId)}
                      </span>
                      {note.session && (
                        <Link
                          to={`/sessions/${note.session}`}
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FiExternalLink className="w-4 h-4" />
                          View Session
                        </Link>
                      )}
                    </div>
                  </div>
                  
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    {isExpanded ? (
                      <FiChevronUp className="w-5 h-5 text-gray-600" />
                    ) : (
                      <FiChevronDown className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                </div>

                {/* Note Content (Expanded) */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    {/* SOAP Sections - Parse from content */}
                    {note.type === 'soap' && note.content && (() => {
                      // Parse SOAP sections from content string
                      const parseSOAP = (content) => {
                        const sections = {
                          subjective: '',
                          objective: '',
                          assessment: '',
                          plan: ''
                        };
                        
                        const subjectiveMatch = content.match(/SUBJECTIVE:\s*([\s\S]*?)(?=\n\nOBJECTIVE:|$)/i);
                        const objectiveMatch = content.match(/OBJECTIVE:\s*([\s\S]*?)(?=\n\nASSESSMENT:|$)/i);
                        const assessmentMatch = content.match(/ASSESSMENT:\s*([\s\S]*?)(?=\n\nPLAN:|$)/i);
                        const planMatch = content.match(/PLAN:\s*([\s\S]*?)$/i);
                        
                        if (subjectiveMatch) sections.subjective = subjectiveMatch[1].trim();
                        if (objectiveMatch) sections.objective = objectiveMatch[1].trim();
                        if (assessmentMatch) sections.assessment = assessmentMatch[1].trim();
                        if (planMatch) sections.plan = planMatch[1].trim();
                        
                        return sections;
                      };
                      
                      const soap = parseSOAP(note.content);
                      
                      return (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {soap.subjective && (
                            <div className="p-4 bg-blue-50 rounded-lg">
                              <h4 className="font-semibold text-blue-900 mb-2">Subjective</h4>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">{soap.subjective}</p>
                            </div>
                          )}
                          {soap.objective && (
                            <div className="p-4 bg-green-50 rounded-lg">
                              <h4 className="font-semibold text-green-900 mb-2">Objective</h4>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">{soap.objective}</p>
                            </div>
                          )}
                          {soap.assessment && (
                            <div className="p-4 bg-yellow-50 rounded-lg">
                              <h4 className="font-semibold text-yellow-900 mb-2">Assessment</h4>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">{soap.assessment}</p>
                            </div>
                          )}
                          {soap.plan && (
                            <div className="p-4 bg-purple-50 rounded-lg">
                              <h4 className="font-semibold text-purple-900 mb-2">Plan</h4>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">{soap.plan}</p>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* General Content */}
                    {note.content && note.type !== 'soap' && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                      <span>Created: {new Date(note.createdAt).toLocaleString()}</span>
                      {note.updatedAt && note.updatedAt !== note.createdAt && (
                        <span>Updated: {new Date(note.updatedAt).toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notes;
