import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiCalendar, FiFileText, FiTrendingUp } from 'react-icons/fi';
import patientService from '../services/patient.service';
import sessionService from '../services/session.service';
import noteService from '../services/note.service';

const Dashboard = () => {
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's an overview of your practice.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Patients</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalPatients}</p>
            </div>
            <div className="bg-primary-100 p-3 rounded-full">
              <FiUsers className="text-primary-600 text-2xl" />
            </div>
          </div>
          <Link to="/patients" className="text-primary-600 text-sm mt-4 inline-block hover:underline">
            View all patients →
          </Link>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Today's Sessions</p>
              <p className="text-3xl font-bold text-gray-900">{stats.todaySessions}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <FiCalendar className="text-green-600 text-2xl" />
            </div>
          </div>
          <Link to="/sessions" className="text-primary-600 text-sm mt-4 inline-block hover:underline">
            View all sessions →
          </Link>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Recent Notes</p>
              <p className="text-3xl font-bold text-gray-900">{stats.recentNotes}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <FiFileText className="text-purple-600 text-2xl" />
            </div>
          </div>
          <Link to="/notes" className="text-primary-600 text-sm mt-4 inline-block hover:underline">
            View all notes →
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        {recentActivity.length > 0 ? (
          <div className="space-y-3">
            {recentActivity.map((item, index) => (
              <div key={index} className="flex items-center justify-between border-b pb-3 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    item.type === 'session' ? 'bg-green-100' : 'bg-purple-100'
                  }`}>
                    {item.type === 'session' ? (
                      <FiCalendar className={item.type === 'session' ? 'text-green-600' : 'text-purple-600'} />
                    ) : (
                      <FiFileText className="text-purple-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">
                      {item.type === 'session' ? 'Session' : 'Note'} - {
                        item.data.patientId?.firstName && item.data.patientId?.lastName
                          ? `${item.data.patientId.firstName} ${item.data.patientId.lastName}`
                          : 'Patient'
                      }
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(item.date).toLocaleString()}
                    </p>
                  </div>
                </div>
                <Link
                  to={item.type === 'session' ? `/sessions/${item.data._id}` : `/notes`}
                  className="text-primary-600 hover:underline text-sm"
                >
                  View →
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No recent activity</p>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/patients" className="btn-primary text-center">
            Add New Patient
          </Link>
          <Link to="/sessions" className="btn-primary text-center">
            Schedule Session
          </Link>
          <Link to="/notes" className="btn-primary text-center">
            Create Note
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
