import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiCalendar, FiClock, FiUser, FiPlus } from 'react-icons/fi';
import sessionService from '../services/session.service';
import NewSessionModal from '../components/NewSessionModal';
import { format } from 'date-fns';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';

const Sessions = () => {
  const { t } = useTranslation();
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="flex space-x-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-10 w-24" />
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-64" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">{t('sessions.title')}</h1>
        <Button
          onClick={() => setShowNewSessionModal(true)}
          className="flex items-center space-x-2"
        >
          <FiPlus />
          <span>{t('sessions.newSession')}</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex space-x-2">
        {['all', 'today', 'upcoming', 'completed'].map((f) => (
          <Button
            key={f}
            onClick={() => setFilter(f)}
            variant={filter === f ? 'default' : 'secondary'}
            className="capitalize"
          >
            {t(`sessions.filters.${f}`)}
          </Button>
        ))}
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {filteredSessions.map((session) => (
          <Link
            key={session._id}
            to={`/sessions/${session._id}`}
          >
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="pt-6">
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
              
              <Badge
                variant={
                  session.status === 'completed' ? 'success' :
                  session.status === 'scheduled' ? 'default' :
                  session.status === 'in-progress' ? 'warning' :
                  'default'
                }
                className="capitalize"
              >
                {t(`sessions.statuses.${session.status.replace('-', '')}`)}
              </Badge>
            </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {filteredSessions.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FiCalendar className="mx-auto text-5xl text-gray-400 mb-4" />
            <p className="text-gray-600">
              {t('sessions.noSessions')}
            </p>
          </CardContent>
        </Card>
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
