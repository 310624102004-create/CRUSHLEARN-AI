import { Link, useNavigate } from 'react-router-dom';
import { AuthService } from '../utils/auth';

const Navbar = () => {
  const navigate = useNavigate();
  const user = AuthService.getCurrentUser();

  const handleLogout = () => {
    AuthService.logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-xl font-bold text-gray-900">
              CrushLearn <span className="text-primary-600">AI</span>
            </span>
          </Link>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/skill-passport"
                  className="hidden sm:block text-gray-700 hover:text-primary-600 font-medium transition"
                >
                  Skill Passport
                </Link>
                
                <Link to="/profile" className="flex items-center space-x-3 hover:opacity-80 transition">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-700 font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
