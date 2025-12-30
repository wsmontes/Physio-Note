import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiCalendar, FiClock, FiUser, FiPlus } from 'react-icons/fi';
import sessionService from '../services/session.service';
import NewSessionModal from '../components/NewSessionModal';
import { format } from 'date-fns';

const Sessions = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, today, upcoming, completed
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const data = await sessionService.getSessions();
      setSessions(data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterSessions = (sessions) => {
    const today = new Date().toDateString();
    
    switch (filter) {
      case 'today':
        return sessions.filter(s => new Date(s.date).toDateString() === today);
      case 'upcoming':
        return sessions.filter(s => new Date(s.date) > new Date() && s.status === 'scheduled');
      case 'completed':
        return sessions.filter(s => s.status === 'completed');
      default:
        return sessions;
    }
  };

  const filteredSessions = filterSessions(sessions);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Sessions</h1>
        <button
          onClick={() => setShowNewSessionModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <FiPlus />
          <span>New Session</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex space-x-2">
        {['all', 'today', 'upcoming', 'completed'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg capitalize ${
              filter === f
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {filteredSessions.map((session) => (
          <Link
            key={session._id}
            to={`/sessions/${session._id}`}
            className="card hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <div className={`p-3 rounded-full ${
                  session.status === 'completed' ? 'bg-green-100' :
                  session.status === 'scheduled' ? 'bg-blue-100' :
                  session.status === 'in-progress' ? 'bg-yellow-100' :
                  'bg-gray-100'
                }`}>
                  <FiCalendar className={`text-xl ${
                    session.status === 'completed' ? 'text-green-600' :
                    session.status === 'scheduled' ? 'text-blue-600' :
                    session.status === 'in-progress' ? 'text-yellow-600' :
                    'text-gray-600'
                  }`} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <FiUser className="text-gray-500" />
                    <span className="font-semibold text-gray-900">
                      {session.patientId?.firstName} {session.patientId?.lastName}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <FiCalendar />
                      <span>{format(new Date(session.date), 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FiClock />
                      <span>{session.duration} min</span>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <span className="text-sm text-gray-700 capitalize">
                      {session.type.replace('-', ' ')}
                    </span>
                    {session.chiefComplaint && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {session.chiefComplaint}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <span className={`px-3 py-1 text-sm rounded-full capitalize ${
                session.status === 'completed' ? 'bg-green-100 text-green-800' :
                session.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                session.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {session.status}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {filteredSessions.length === 0 && (
        <div className="card text-center py-12">
          <FiCalendar className="mx-auto text-5xl text-gray-400 mb-4" />
          <p className="text-gray-600">
            No sessions found for this filter.
          </p>
        </div>
      )}

      {/* New Session Modal */}
      <NewSessionModal
        isOpen={showNewSessionModal}
        onClose={() => setShowNewSessionModal(false)}
        onSessionCreated={(newSession) => {
          fetchSessions(); // Refresh the list
          navigate(`/sessions/${newSession._id}`); // Navigate to new session
        }}
      />
    </div>
  );
};

export default Sessions;
