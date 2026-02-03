import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 safe-area-top">
      <div className="container-custom">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src="/logo1.png" alt="AI Learning Hub" className="h-10 sm:h-12" />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <Link to="/" className="text-gray-700 hover:text-primary-600 font-medium transition">
              Home
            </Link>
            <a href="#features" className="text-gray-700 hover:text-primary-600 font-medium transition">
              Features
            </a>
            {user ? (
              <>
                <Link to="/dashboard" className="text-gray-700 hover:text-primary-600 font-medium transition">
                  Dashboard
                </Link>
                <Link to="/progress" className="text-gray-700 hover:text-primary-600 font-medium transition">
                  Progress
                </Link>
                <button 
                  onClick={logout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition touch-target"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary-600 font-medium transition">
                  Login
                </Link>
                <Link to="/signup" className="btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 touch-target"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-3 sm:py-4 border-t animate-in slide-in-from-top-2">
            <div className="flex flex-col space-y-1">
              <Link to="/" className="text-gray-700 hover:text-primary-600 hover:bg-gray-50 font-medium py-3 px-2 rounded-lg transition touch-target" onClick={() => setIsOpen(false)}>
                Home
              </Link>
              <a href="#features" className="text-gray-700 hover:text-primary-600 hover:bg-gray-50 font-medium py-3 px-2 rounded-lg transition touch-target" onClick={() => setIsOpen(false)}>
                Features
              </a>
              {user ? (
                <>
                  <Link to="/dashboard" className="text-gray-700 hover:text-primary-600 hover:bg-gray-50 font-medium py-3 px-2 rounded-lg transition touch-target" onClick={() => setIsOpen(false)}>
                    Dashboard
                  </Link>
                  <Link to="/progress" className="text-gray-700 hover:text-primary-600 hover:bg-gray-50 font-medium py-3 px-2 rounded-lg transition touch-target" onClick={() => setIsOpen(false)}>
                    Progress
                  </Link>
                  <button 
                    onClick={() => { logout(); setIsOpen(false); }}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg transition text-left font-medium touch-target mt-2"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-700 hover:text-primary-600 hover:bg-gray-50 font-medium py-3 px-2 rounded-lg transition touch-target" onClick={() => setIsOpen(false)}>
                    Login
                  </Link>
                  <Link to="/signup" className="btn-primary text-center mt-2" onClick={() => setIsOpen(false)}>
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
