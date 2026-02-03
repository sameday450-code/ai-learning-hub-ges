import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, GraduationCap, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const navigate = useNavigate();
  const { signup, user, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    className: '',
    phoneNumber: '',
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

  const classOptions = [
    'JHS 1', 'JHS 2', 'JHS 3',
    'SHS 1', 'SHS 2', 'SHS 3',
  ];

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

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const result = await signup(formData);
      console.log('Signup successful:', result);
      // Use replace instead of push to prevent going back to signup
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.response?.data?.message || err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        {/* Premium Form Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-8 md:p-10">
          <div className="text-center mb-5 sm:mb-8">
            <Link to="/" className="inline-block mb-4 sm:mb-6">
              <img src="/logo1.png" alt="AI Learning Hub" className="h-12 sm:h-14 mx-auto" />
            </Link>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mt-4 sm:mt-6 mb-2 sm:mb-3">Create Account</h1>
            <p className="text-gray-600 text-sm sm:text-base md:text-lg">Start your learning journey today</p>
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

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                  First Name
                </label>
                <div className="relative group">
                  <User className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full pl-8 sm:pl-10 pr-2 sm:pr-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all duration-300 bg-white text-sm sm:text-base"
                    placeholder="Kwame"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                  Last Name
                </label>
                <div className="relative group">
                  <User className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full pl-8 sm:pl-10 pr-2 sm:pr-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all duration-300 bg-white text-sm sm:text-base"
                    placeholder="Mensah"
                  />
                </div>
              </div>
            </div>

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
                Class Level
              </label>
              <div className="relative group">
                <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors w-4 h-4 sm:w-5 sm:h-5" />
                <select
                  name="className"
                  value={formData.className}
                  onChange={handleChange}
                  required
                  className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all duration-300 bg-white appearance-none cursor-pointer text-sm sm:text-base"
                >
                  <option value="">Select your class</option>
                  {classOptions.map((cls) => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                Phone Number (Optional)
              </label>
              <div className="relative group">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all duration-300 bg-white text-sm sm:text-base"
                  placeholder="024 123 4567"
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

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                Confirm Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all duration-300 bg-white text-sm sm:text-base"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full py-3 sm:py-4 mt-4 sm:mt-6 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl font-semibold text-sm sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed relative overflow-hidden group touch-target"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10">
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>Sign Up</span>
                    <span className="text-xl">→</span>
                  </div>
                )}
              </span>
            </motion.button>
          </form>

          <p className="text-center text-gray-600 mt-5 sm:mt-8 text-sm sm:text-base">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold hover:underline transition-all">
              Log In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
