import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiUsers, FiCalendar, FiFileText, FiTrendingUp } from 'react-icons/fi';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { Badge } from '../components/ui/Badge';
import patientService from '../services/patient.service';
import sessionService from '../services/session.service';
import noteService from '../services/note.service';

const Dashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalPatients: 0,
    todaySessions: 0,
    recentNotes: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [patients, sessions, notes] = await Promise.all([
          patientService.getPatients(),
          sessionService.getSessions(),
          noteService.getNotes()
        ]);

        setStats({
          totalPatients: patients.length,
          todaySessions: sessions.filter(s => {
            const today = new Date().toDateString();
            return new Date(s.date).toDateString() === today;
          }).length,
          recentNotes: notes.slice(0, 5).length
        });

        // Combine recent activity
        const activity = [
          ...sessions.slice(0, 3).map(s => ({
            type: 'session',
            data: s,
            date: s.date
          })),
          ...notes.slice(0, 3).map(n => ({
            type: 'note',
            data: n,
            date: n.createdAt
          }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

        setRecentActivity(activity);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-6 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('navigation.dashboard')}</h1>
        <p className="text-gray-600 mt-1">{t('dashboard.welcome')}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">{t('dashboard.stats.totalPatients')}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalPatients}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <FiUsers className="text-blue-600 text-2xl" />
              </div>
            </div>
            <Link to="/patients">
              <Button variant="ghost" className="w-full mt-4 justify-start px-0">
                {t('dashboard.viewAll', { item: t('navigation.patients') })} →
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">{t('dashboard.stats.todaySessions')}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.todaySessions}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <FiCalendar className="text-green-600 text-2xl" />
              </div>
            </div>
            <Link to="/sessions">
              <Button variant="ghost" className="w-full mt-4 justify-start px-0">
                {t('dashboard.viewAll', { item: t('navigation.sessions') })} →
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">{t('dashboard.stats.recentNotes')}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.recentNotes}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <FiFileText className="text-purple-600 text-2xl" />
              </div>
            </div>
            <Link to="/notes">
              <Button variant="ghost" className="w-full mt-4 justify-start px-0">
                {t('dashboard.viewAll', { item: t('navigation.notes') })} →
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.recentActivity')}</CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((item, index) => (
                <div key={index} className="flex items-center justify-between pb-4 border-b last:border-b-0 last:pb-0">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      item.type === 'session' ? 'bg-green-100' : 'bg-purple-100'
                    }`}>
                      {item.type === 'session' ? (
                        <FiCalendar className="text-green-600" />
                      ) : (
                        <FiFileText className="text-purple-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        <Badge variant={item.type === 'session' ? 'success' : 'default'} className="mr-2">
                          {item.type === 'session' ? t('navigation.session') : t('navigation.note')}
                        </Badge>
                        {item.data.patientId?.firstName && item.data.patientId?.lastName
                          ? `${item.data.patientId.firstName} ${item.data.patientId.lastName}`
                          : t('patient.patient')}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(item.date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Link to={item.type === 'session' ? `/sessions/${item.data._id}` : `/notes`}>
                    <Button variant="ghost" size="sm">
                      {t('actions.view')} →
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">{t('dashboard.noActivity')}</p>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.quickActions')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/patients">
              <Button className="w-full">
                <FiUsers className="mr-2" />
                {t('dashboard.actions.addPatient')}
              </Button>
            </Link>
            <Link to="/sessions">
              <Button className="w-full">
                <FiCalendar className="mr-2" />
                {t('dashboard.actions.scheduleSession')}
              </Button>
            </Link>
            <Link to="/notes">
              <Button className="w-full">
                <FiFileText className="mr-2" />
                {t('dashboard.actions.createNote')}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
