import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import PatientDetail from './pages/PatientDetail';
import Sessions from './pages/Sessions';
import SessionDetail from './pages/SessionDetail';
import Notes from './pages/Notes';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } />
              
              <Route path="/patients" element={
                <PrivateRoute>
                  <Patients />
                </PrivateRoute>
              } />
              
              <Route path="/patients/:id" element={
                <PrivateRoute>
                  <PatientDetail />
                </PrivateRoute>
              } />
              
              <Route path="/sessions" element={
                <PrivateRoute>
                  <Sessions />
                </PrivateRoute>
              } />
              
              <Route path="/sessions/:id" element={
                <PrivateRoute>
                  <SessionDetail />
                </PrivateRoute>
              } />
              
              <Route path="/notes" element={
                <PrivateRoute>
                  <Notes />
                </PrivateRoute>
              } />
              
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
