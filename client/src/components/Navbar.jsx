import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiLogOut } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary-600">Physio-Note</span>
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center space-x-6">
              <Link to="/dashboard" className="text-gray-700 hover:text-primary-600 transition-colors">
                Dashboard
              </Link>
              <Link to="/patients" className="text-gray-700 hover:text-primary-600 transition-colors">
                Patients
              </Link>
              <Link to="/sessions" className="text-gray-700 hover:text-primary-600 transition-colors">
                Sessions
              </Link>
              <Link to="/notes" className="text-gray-700 hover:text-primary-600 transition-colors">
                Notes
              </Link>
              
              <div className="flex items-center space-x-4 border-l pl-6">
                <div className="flex items-center space-x-2">
                  <FiUser className="text-gray-600" />
                  <span className="text-sm text-gray-700">
                    {user?.firstName} {user?.lastName}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition-colors"
                >
                  <FiLogOut />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-700 hover:text-primary-600 transition-colors">
                Login
              </Link>
              <Link to="/register" className="btn-primary">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
