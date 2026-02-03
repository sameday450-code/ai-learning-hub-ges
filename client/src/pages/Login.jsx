import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login, user, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  if (user) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  // Show loading spinner while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      console.log('Login successful:', result);
      // Use replace instead of push to prevent going back to login
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4 sm:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        {/* Premium Form Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10">
          <div className="text-center mb-6 sm:mb-8">
            <Link to="/" className="inline-block mb-4 sm:mb-6">
              <img src="/logo1.png" alt="AI Learning Hub" className="h-12 sm:h-14 mx-auto" />
            </Link>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mt-4 sm:mt-6 mb-2 sm:mb-3">Welcome Back!</h1>
            <p className="text-gray-600 text-sm sm:text-base md:text-lg">Continue your learning journey</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl mb-6 shadow-lg"
            >
              <div className="flex items-center space-x-2">
                <span className="text-xl">⚠️</span>
                <span className="font-medium">{error}</span>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all duration-300 bg-white text-sm sm:text-base"
                  placeholder="student@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all duration-300 bg-white text-sm sm:text-base"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs sm:text-sm">
              <label className="flex items-center group cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-2 border-gray-300 text-primary-600 focus:ring-2 focus:ring-primary-500 transition-all cursor-pointer" 
                />
                <span className="ml-1.5 sm:ml-2 text-gray-600 group-hover:text-gray-800 transition-colors">Remember me</span>
              </label>
              <a href="#" className="text-primary-600 hover:text-primary-700 font-semibold hover:underline transition-all">
                Forgot password?
              </a>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full py-3 sm:py-4 mt-2 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl font-semibold text-sm sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed relative overflow-hidden group touch-target"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10">
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Logging in...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <LogIn size={20} />
                    <span>Log In</span>
                  </div>
                )}
              </span>
            </motion.button>
          </form>

          <p className="text-center text-gray-600 mt-6 sm:mt-8 text-sm sm:text-base">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary-600 hover:text-primary-700 font-semibold hover:underline transition-all">
              Sign Up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
