import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiSearch, FiFilter, FiFileText, FiUser, FiCalendar, 
  FiChevronDown, FiChevronUp, FiExternalLink 
} from 'react-icons/fi';
import noteService from '../services/note.service';
import patientService from '../services/patient.service';
import sessionService from '../services/session.service';
import { useToast } from '../context/ToastContext';

const Notes = () => {
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

  const getPatientName = (patientId) => {
    const patient = patients.find(p => p._id === patientId);
    return patient ? patient.name : 'Unknown Patient';
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
      getPatientName(note.patient).toLowerCase().includes(searchLower);

    // Type filter
    const matchesType = filterType === 'all' || note.type === filterType;

    // Patient filter
    const matchesPatient = filterPatient === 'all' || note.patient === filterPatient;

    return matchesSearch && matchesType && matchesPatient;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading notes...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Clinical Notes</h1>
          <p className="text-gray-600 mt-1">{filteredNotes.length} notes found</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Types</option>
              <option value="soap">SOAP Notes</option>
              <option value="progress">Progress Notes</option>
              <option value="discharge">Discharge Notes</option>
              <option value="initial">Initial Evaluation</option>
            </select>
          </div>

          {/* Patient Filter */}
          <div className="relative">
            <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={filterPatient}
              onChange={(e) => setFilterPatient(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Patients</option>
              {patients.map(patient => (
                <option key={patient._id} value={patient._id}>
                  {patient.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Notes List */}
      {filteredNotes.length === 0 ? (
        <div className="card text-center py-12">
          <FiFileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No notes found</h3>
          <p className="text-gray-600">
            {searchTerm || filterType !== 'all' || filterPatient !== 'all'
              ? 'Try adjusting your filters'
              : 'Start by creating a new session with documentation'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotes.map((note) => {
            const isExpanded = expandedNotes.has(note._id);
            
            return (
              <div key={note._id} className="card hover:shadow-lg transition-shadow">
                {/* Note Header */}
                <div 
                  className="flex items-start justify-between cursor-pointer"
                  onClick={() => toggleNoteExpansion(note._id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getNoteTypeColor(note.type)}`}>
                        {note.type || 'Note'}
                      </span>
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
                        {getPatientName(note.patient)}
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
                    {/* SOAP Sections */}
                    {note.type === 'soap' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {note.subjective && (
                          <div className="p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-semibold text-blue-900 mb-2">Subjective</h4>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.subjective}</p>
                          </div>
                        )}
                        {note.objective && (
                          <div className="p-4 bg-green-50 rounded-lg">
                            <h4 className="font-semibold text-green-900 mb-2">Objective</h4>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.objective}</p>
                          </div>
                        )}
                        {note.assessment && (
                          <div className="p-4 bg-yellow-50 rounded-lg">
                            <h4 className="font-semibold text-yellow-900 mb-2">Assessment</h4>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.assessment}</p>
                          </div>
                        )}
                        {note.plan && (
                          <div className="p-4 bg-purple-50 rounded-lg">
                            <h4 className="font-semibold text-purple-900 mb-2">Plan</h4>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.plan}</p>
                          </div>
                        )}
                      </div>
                    )}

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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notes;
