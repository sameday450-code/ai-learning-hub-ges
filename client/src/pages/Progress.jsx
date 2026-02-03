import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, BookOpen, Target, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { progressService } from '../services/api.service';
import { useAuth } from '../context/AuthContext';

const Progress = () => {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const data = await progressService.getMyProgress();
      setProgressData(data);
    } catch (error) {
      console.error('Failed to load progress:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const subjectColors = [
    '#3b82f6', // blue
    '#10b981', // green
    '#8b5cf6', // purple
    '#f59e0b', // amber
    '#ec4899', // pink
    '#6366f1', // indigo
  ];

  // Prepare chart data
  const subjectStats = progressData?.subjectProgress || [];
  const totalQuestions = progressData?.overall?.totalQuestions || 0;
  const overallAccuracy = progressData?.overall?.accuracy || 0;
  const totalTime = progressData?.overall?.totalTime || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="container-custom py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link 
                to="/dashboard" 
                className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition touch-target"
              >
                <ArrowLeft size={20} className="sm:w-6 sm:h-6" />
              </Link>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">My Progress</h1>
                <p className="text-gray-600 text-xs sm:text-sm md:text-base mt-0.5 sm:mt-1">Track your learning journey</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center">
              <img src="/logo1.png" alt="AI Learning Hub" className="h-10 sm:h-12" />
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-4 sm:py-6 md:py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-[10px] sm:text-xs md:text-sm mb-0.5 sm:mb-1">Total Questions</p>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">{totalQuestions}</h3>
              </div>
              <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-blue-200" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card bg-gradient-to-br from-green-500 to-green-600 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-[10px] sm:text-xs md:text-sm mb-0.5 sm:mb-1">Accuracy</p>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">{overallAccuracy.toFixed(1)}%</h3>
              </div>
              <Target className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-green-200" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-[10px] sm:text-xs md:text-sm mb-0.5 sm:mb-1">Time Spent</p>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">{totalTime}h</h3>
              </div>
              <Clock className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-purple-200" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card bg-gradient-to-br from-amber-500 to-amber-600 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-[10px] sm:text-xs md:text-sm mb-0.5 sm:mb-1">Active Subjects</p>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">{subjectStats.length}</h3>
              </div>
              <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-amber-200" />
            </div>
          </motion.div>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Questions by Subject */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card"
          >
            <h3 className="font-bold text-base sm:text-lg md:text-xl text-gray-800 mb-4 sm:mb-6">Questions by Subject</h3>
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
              <BarChart data={subjectStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subjectName" tick={{ fontSize: 10 }} interval={0} angle={-45} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="questionsAsked" fill="#3b82f6" name="Questions Asked" />
                <Bar dataKey="correctAnswers" fill="#10b981" name="Correct Answers" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Accuracy by Subject */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="card"
          >
            <h3 className="font-bold text-base sm:text-lg md:text-xl text-gray-800 mb-4 sm:mb-6">Accuracy Distribution</h3>
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
              <PieChart>
                <Pie
                  data={subjectStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ subjectName, accuracyScore }) => `${subjectName?.substring(0, 4) || ''}: ${accuracyScore?.toFixed(0) || 0}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="accuracyScore"
                >
                  {subjectStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={subjectColors[index % subjectColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Subject Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="card"
        >
          <h3 className="font-bold text-base sm:text-lg md:text-xl text-gray-800 mb-4 sm:mb-6">Subject Performance Details</h3>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle px-4 sm:px-0">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Subject</th>
                    <th className="text-center py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Questions</th>
                    <th className="text-center py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Correct</th>
                    <th className="text-center py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Accuracy</th>
                    <th className="text-center py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Time</th>
                    <th className="text-center py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Last Practice</th>
                  </tr>
                </thead>
                <tbody>
                  {subjectStats.map((subject, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="py-2 sm:py-3 px-2 sm:px-4">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <div 
                            className="w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: subjectColors[index % subjectColors.length] }}
                          ></div>
                          <span className="font-medium text-gray-800 text-xs sm:text-sm">{subject.subjectName}</span>
                        </div>
                      </td>
                      <td className="text-center py-2 sm:py-3 px-2 sm:px-4 text-gray-600 text-xs sm:text-sm">{subject.questionsAsked}</td>
                      <td className="text-center py-2 sm:py-3 px-2 sm:px-4 text-green-600 font-semibold text-xs sm:text-sm">{subject.correctAnswers}</td>
                      <td className="text-center py-2 sm:py-3 px-2 sm:px-4">
                        <span className={`font-semibold text-xs sm:text-sm ${
                          subject.accuracyScore >= 80 ? 'text-green-600' :
                          subject.accuracyScore >= 60 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {subject.accuracyScore.toFixed(1)}%
                        </span>
                      </td>
                      <td className="text-center py-2 sm:py-3 px-2 sm:px-4 text-gray-600 text-xs sm:text-sm">{subject.timeSpent}h</td>
                      <td className="text-center py-2 sm:py-3 px-2 sm:px-4 text-gray-500 text-[10px] sm:text-xs">
                        {new Date(subject.lastPracticed).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* Motivational Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="card bg-gradient-to-br from-primary-600 to-purple-700 text-white text-center mt-6 sm:mt-8"
        >
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3">Keep Up the Great Work, {user?.firstName}! 🎉</h3>
          <p className="text-sm sm:text-base md:text-lg text-gray-100 mb-3 sm:mb-4">
            You're making excellent progress. Stay consistent and you'll achieve your goals!
          </p>
          <Link to="/dashboard" className="inline-block bg-white text-primary-600 hover:bg-gray-100 font-bold py-2.5 px-6 sm:py-3 sm:px-8 rounded-lg transition-all transform hover:scale-105 text-sm sm:text-base touch-target">
            Continue Learning
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Progress;
