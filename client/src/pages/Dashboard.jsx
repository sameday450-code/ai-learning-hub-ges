import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, MessageCircle, ChevronRight, Lightbulb, LogOut, BarChart3, Home, ChevronDown, Edit3, Check, Trash2, RefreshCw, Wifi, WifiOff, Clock, Volume2, TrendingUp, Target, BookOpen, Award, Flame, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { aiService, subjectService, progressService } from '../services/api.service';
import ChatBubble from '../components/ChatBubble';
import VoiceButton from '../components/VoiceButton';

// Storage keys for persistence
const STORAGE_KEYS = {
  MESSAGES: 'ai_hub_messages',
  SELECTED_SUBJECT: 'ai_hub_selected_subject',
  PENDING_QUESTION: 'ai_hub_pending_question',
};

// Helper to format time
const formatTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};

// Helper to format relative time
const formatRelativeTime = (date) => {
  if (!date) return '';
  const now = new Date();
  const d = new Date(date);
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(() => {
    // Restore selected subject from localStorage
    const saved = localStorage.getItem(STORAGE_KEYS.SELECTED_SUBJECT);
    return saved ? JSON.parse(saved) : null;
  });
  const [messages, setMessages] = useState(() => {
    // Restore messages from localStorage
    const saved = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    return saved ? JSON.parse(saved) : [];
  });
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [lastQuestionId, setLastQuestionId] = useState(null);
  const [pendingQuestion, setPendingQuestion] = useState(() => {
    // Check if there was a pending question before refresh
    const saved = localStorage.getItem(STORAGE_KEYS.PENDING_QUESTION);
    return saved ? JSON.parse(saved) : null;
  });
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSubjectsLoading, setIsSubjectsLoading] = useState(true);
  const [responseTime, setResponseTime] = useState(null);
  const [showTimestamps, setShowTimestamps] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  // Progress tracking state
  const [progressData, setProgressData] = useState(null);
  const [subjectProgress, setSubjectProgress] = useState(null);
  const [isProgressLoading, setIsProgressLoading] = useState(false);
  const [showFeedback, setShowFeedback] = useState(null);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const startTimeRef = useRef(null);

  // Subject icons and colors for the grid
  const subjectStyles = {
    'MATHEMATICS': { icon: '➕✖️➗', bg: 'from-blue-500 to-blue-600' },
    'ENGLISH': { icon: 'ABC', bg: 'from-indigo-500 to-indigo-600' },
    'SOCIAL STUDIES': { icon: '🌍', bg: 'from-green-500 to-green-600' },
    'HISTORY': { icon: '📜', bg: 'from-amber-500 to-amber-600' },
    'CREATIVE ARTS': { icon: '🎨', bg: 'from-pink-500 to-pink-600' },
    'COMPUTING': { icon: '</>', bg: 'from-slate-600 to-slate-700' },
    'SCIENCE': { icon: '🔬', bg: 'from-teal-500 to-teal-600' },
    'ECONOMICS': { icon: '💰', bg: 'from-emerald-500 to-emerald-600' },
  };

  // Online/Offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Focus input when subject is selected
  useEffect(() => {
    if (selectedSubject && inputRef.current) {
      inputRef.current.focus();
    }
  }, [selectedSubject]);

  // Keyboard shortcut for sending message (Enter) and new line (Shift+Enter)
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputMessage.trim() && selectedSubject && !isTyping && !pendingQuestion) {
        handleSendMessage(e);
      }
    }
  }, [inputMessage, selectedSubject, isTyping, pendingQuestion]);

  useEffect(() => {
    loadSubjects();
    loadProgressData();
    // Only set welcome message if no messages exist
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          text: `Hello ${user?.firstName}!\nHow can I help you today?`,
          isUser: false,
          timestamp: new Date(),
        }
      ]);
    }
  }, [user]);

  // Load progress data
  const loadProgressData = async () => {
    setIsProgressLoading(true);
    try {
      const data = await progressService.getDetailedStats();
      setProgressData(data);
    } catch (error) {
      console.error('Failed to load progress:', error);
    } finally {
      setIsProgressLoading(false);
    }
  };

  // Load subject-specific progress when subject is selected
  const loadSubjectProgress = async (subjectId) => {
    try {
      const data = await progressService.getSubjectProgress(subjectId);
      setSubjectProgress(data);
    } catch (error) {
      console.error('Failed to load subject progress:', error);
      setSubjectProgress(null);
    }
  };

  // Submit feedback on answer
  const handleFeedback = async (questionId, isCorrect) => {
    try {
      await progressService.submitFeedback(questionId, isCorrect);
      setShowFeedback(null);
      // Reload progress data after feedback
      loadProgressData();
      if (selectedSubject) {
        loadSubjectProgress(selectedSubject.id);
      }
      // Show confirmation
      const feedbackMessage = {
        id: `feedback-${Date.now()}`,
        text: isCorrect 
          ? '✅ Great! Your progress has been recorded.' 
          : '📝 Got it! Keep practicing to improve.',
        isUser: false,
        timestamp: new Date(),
        isNotification: true,
      };
      setMessages(prev => [...prev, feedbackMessage]);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    }
  }, [messages]);

  // Save selected subject to localStorage
  useEffect(() => {
    if (selectedSubject) {
      localStorage.setItem(STORAGE_KEYS.SELECTED_SUBJECT, JSON.stringify(selectedSubject));
    }
  }, [selectedSubject]);

  // Handle pending question on page load (retry after refresh)
  useEffect(() => {
    if (pendingQuestion && selectedSubject && !isTyping) {
      retryPendingQuestion();
    }
  }, [pendingQuestion, selectedSubject]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const retryPendingQuestion = async () => {
    if (!pendingQuestion) return;
    
    setIsTyping(true);
    startTimeRef.current = Date.now();
    
    try {
      const response = await aiService.askQuestion(pendingQuestion.text, pendingQuestion.subjectId);
      
      const endTime = Date.now();
      setResponseTime(((endTime - startTimeRef.current) / 1000).toFixed(1));
      
      const aiMessage = {
        id: `ai-${Date.now()}`,
        text: response.response,
        isUser: false,
        timestamp: new Date(),
        questionId: response.questionId,
        responseTime: ((endTime - startTimeRef.current) / 1000).toFixed(1),
        mathData: response.mathData || null,
      };

      setLastQuestionId(response.questionId);
      setMessages(prev => [...prev, aiMessage]);
      setRetryCount(0);
      
      // Clear pending question
      setPendingQuestion(null);
      localStorage.removeItem(STORAGE_KEYS.PENDING_QUESTION);
    } catch (error) {
      console.error('AI Error (retry):', error);
      setRetryCount(prev => prev + 1);
      
      const errorMessage = {
        id: `error-${Date.now()}`,
        text: retryCount < 2 
          ? 'Connection issue. Retrying...' 
          : 'Sorry, I encountered an error. Please try again or rephrase your question.',
        isUser: false,
        timestamp: new Date(),
        isError: true,
      };
      setMessages(prev => [...prev, errorMessage]);
      
      // Auto-retry up to 2 times
      if (retryCount < 2) {
        setTimeout(() => retryPendingQuestion(), 2000);
        return;
      }
      
      // Clear pending question on error
      setPendingQuestion(null);
      localStorage.removeItem(STORAGE_KEYS.PENDING_QUESTION);
    } finally {
      setIsTyping(false);
    }
  };

  const loadSubjects = async () => {
    setIsSubjectsLoading(true);
    try {
      const data = await subjectService.getAllSubjects();
      console.log('Loaded subjects data:', data);
      const subjectsList = data?.subjects || data?.data?.subjects || [];
      console.log('Subjects list:', subjectsList);
      setSubjects(subjectsList);
    } catch (error) {
      console.error('Failed to load subjects:', error);
      // Fallback subjects for demo
      setSubjects([
        { id: '1', name: 'Mathematics', code: 'MATH', level: 'JHS' },
        { id: '2', name: 'English', code: 'ENG', level: 'JHS' },
        { id: '3', name: 'Social Studies', code: 'SS', level: 'JHS' },
        { id: '4', name: 'History', code: 'HIST', level: 'JHS' },
        { id: '5', name: 'Creative Arts', code: 'CA', level: 'JHS' },
        { id: '6', name: 'Computing', code: 'ICT', level: 'JHS' },
      ]);
    } finally {
      setIsSubjectsLoading(false);
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject);
    // Clear response time when switching subjects
    setResponseTime(null);
    // Load progress for selected subject
    loadSubjectProgress(subject.id);
    setMessages(prev => [
      ...prev,
      {
        id: `subject-${subject.id}-${Date.now()}`,
        text: `Great! I'm ready to help you with ${subject.name}. What would you like to know?`,
        isUser: false,
        timestamp: new Date(),
      }
    ]);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || !selectedSubject) {
      if (!selectedSubject) {
        // Show a toast-like notification instead of alert
        const notification = {
          id: `notification-${Date.now()}`,
          text: '👆 Please select a subject first to ask a question.',
          isUser: false,
          timestamp: new Date(),
          isNotification: true,
        };
        setMessages(prev => [...prev, notification]);
      }
      return;
    }

    // Check if online
    if (!isOnline) {
      const offlineMessage = {
        id: `offline-${Date.now()}`,
        text: '📡 You appear to be offline. Please check your connection and try again.',
        isUser: false,
        timestamp: new Date(),
        isError: true,
      };
      setMessages(prev => [...prev, offlineMessage]);
      return;
    }

    const questionText = inputMessage.trim();
    
    const userMessage = {
      id: `user-${Date.now()}`,
      text: questionText,
      isUser: true,
      timestamp: new Date(),
      status: 'sent',
    };

    // Add user message immediately and save to storage
    setMessages(prev => {
      const newMessages = [...prev, userMessage];
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(newMessages));
      return newMessages;
    });
    setInputMessage('');
    setIsTyping(true);
    setRetryCount(0);
    startTimeRef.current = Date.now();

    // Save pending question in case of refresh
    const pending = { text: questionText, subjectId: selectedSubject.id };
    setPendingQuestion(pending);
    localStorage.setItem(STORAGE_KEYS.PENDING_QUESTION, JSON.stringify(pending));

    try {
      const response = await aiService.askQuestion(questionText, selectedSubject.id);
      
      const endTime = Date.now();
      const timeTaken = ((endTime - startTimeRef.current) / 1000).toFixed(1);
      setResponseTime(timeTaken);
      
      const aiMessage = {
        id: `ai-${Date.now()}`,
        text: response.response,
        isUser: false,
        timestamp: new Date(),
        questionId: response.questionId,
        responseTime: timeTaken,
        difficulty: response.difficulty,
        mathData: response.mathData || null,
      };

      // Update user message status to delivered
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id ? { ...msg, status: 'delivered' } : msg
      ));

      setLastQuestionId(response.questionId);
      setMessages(prev => [...prev, aiMessage]);
      // Show feedback option for the new question
      setShowFeedback(response.questionId);
      
      // Clear pending question on success
      setPendingQuestion(null);
      localStorage.removeItem(STORAGE_KEYS.PENDING_QUESTION);
      
      // Refresh progress data after new question
      loadProgressData();
      if (selectedSubject) {
        loadSubjectProgress(selectedSubject.id);
      }
    } catch (error) {
      console.error('AI Error:', error);
      
      // Update user message status to failed
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id ? { ...msg, status: 'failed' } : msg
      ));
      
      const errorMessage = {
        id: `error-${Date.now()}`,
        text: error.response?.status === 429 
          ? '⏳ Too many requests. Please wait a moment before trying again.'
          : 'Sorry, I encountered an error. Please try again or rephrase your question.',
        isUser: false,
        timestamp: new Date(),
        isError: true,
      };
      setMessages(prev => [...prev, errorMessage]);
      
      // Clear pending question on error
      setPendingQuestion(null);
      localStorage.removeItem(STORAGE_KEYS.PENDING_QUESTION);
    } finally {
      setIsTyping(false);
    }
  };

  // Function to clear chat history
  const clearChatHistory = () => {
    localStorage.removeItem(STORAGE_KEYS.MESSAGES);
    localStorage.removeItem(STORAGE_KEYS.PENDING_QUESTION);
    setMessages([
      {
        id: 'welcome',
        text: `Hello Student ${user?.firstName}!\nHow can I help you today?`,
        isUser: false,
        timestamp: new Date(),
      }
    ]);
  };

  const handleVoicePlay = async (questionId) => {
    return await aiService.getVoiceResponse(questionId);
  };

  const getSubjectStyle = (subjectName) => {
    const upperName = subjectName?.toUpperCase() || '';
    return subjectStyles[upperName] || { icon: '📚', bg: 'from-gray-500 to-gray-600' };
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image with Gradient Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(37, 99, 235, 0.85) 50%, rgba(99, 102, 241, 0.9) 100%), url('/bg.png')`,
        }}
      />
      
      {/* Animated Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-white/10 rounded-full mix-blend-overlay filter blur-3xl animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-blue-300/20 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-indigo-300/20 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Top Navigation */}
      <nav className="relative z-50 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 shadow-xl safe-area-top">
        <div className="container-custom">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <img src="/logo1.png" alt="AI Learning Hub" className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl shadow-lg" />
              <div className="flex items-center">
                <span className="text-base sm:text-xl font-bold text-white">AI Learning Hub</span>
                <span className="text-white/80 text-sm ml-2 hidden lg:inline">| Learn Smarter with</span>
                <span className="text-yellow-300 text-sm ml-1 font-medium hidden lg:inline">Ghanaian Syllabus</span>
              </div>
            </div>

            {/* Nav Links - Desktop */}
            <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
              <Link to="/" className="text-white hover:text-yellow-300 transition font-medium flex items-center gap-1">
                Home
              </Link>
              <Link to="/progress" className="text-white hover:text-yellow-300 transition font-medium flex items-center gap-1">
                My Progress
                <ChevronDown size={16} />
              </Link>
              <button 
                onClick={logout}
                className="text-white hover:text-yellow-300 transition font-medium"
              >
                Logout
              </button>
            </div>
            
            {/* Mobile Nav Links */}
            <div className="flex md:hidden items-center space-x-2">
              <Link to="/" className="text-white p-2 rounded-lg hover:bg-white/10 transition touch-target">
                <Home size={20} />
              </Link>
              <Link to="/progress" className="text-white p-2 rounded-lg hover:bg-white/10 transition touch-target">
                <BarChart3 size={20} />
              </Link>
              <button 
                onClick={logout}
                className="text-white p-2 rounded-lg hover:bg-white/10 transition touch-target"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container-custom py-3 sm:py-6 relative z-10">
        <div className="flex flex-col lg:grid lg:grid-cols-5 gap-4 sm:gap-6">
          
          {/* Mobile: Show subject grid first */}
          <div className="lg:hidden">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-xl p-4"
            >
              <h3 className="font-bold text-base text-gray-800 mb-3 flex items-center gap-2">
                Choose a Subject:
                {isSubjectsLoading && <RefreshCw size={14} className="animate-spin text-blue-500" />}
              </h3>
              {isSubjectsLoading ? (
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="aspect-square rounded-xl bg-gray-200 animate-pulse" />
                  ))}
                </div>
              ) : subjects.length === 0 ? (
                <div className="text-center py-4">
                  <div className="text-3xl mb-2">📚</div>
                  <p className="text-gray-500 text-sm">No subjects available</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {subjects.slice(0, 6).map((subject) => {
                    const style = getSubjectStyle(subject.name);
                    const isSelected = selectedSubject?.id === subject.id;
                    
                    return (
                      <motion.button
                        key={`mobile-${subject.id}`}
                        onClick={() => handleSubjectSelect(subject)}
                        whileTap={{ scale: 0.95 }}
                        className={`relative rounded-xl p-2 flex flex-col items-center justify-center aspect-square transition-all touch-target ${
                          isSelected 
                            ? 'ring-3 ring-blue-400 ring-offset-1' 
                            : ''
                        }`}
                      >
                        <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${style.bg} shadow-md`}></div>
                        <div className="relative z-10 text-center">
                          <div className="text-xl mb-1 filter drop-shadow-md">
                            {subject.name.toUpperCase() === 'MATHEMATICS' && <span className="text-white text-sm font-bold">+×÷</span>}
                            {subject.name.toUpperCase() === 'ENGLISH' && <span className="bg-indigo-700/50 rounded px-1 py-0.5 text-white text-xs font-bold">ABC</span>}
                            {subject.name.toUpperCase() === 'SOCIAL STUDIES' && <span className="text-xl">🌍</span>}
                            {subject.name.toUpperCase() === 'HISTORY' && <span className="text-xl">📜</span>}
                            {subject.name.toUpperCase() === 'CREATIVE ARTS' && <span className="text-xl">🎨</span>}
                            {subject.name.toUpperCase() === 'COMPUTING' && <span className="bg-slate-800/50 rounded px-1 py-0.5 text-white text-xs font-mono">{'</>'}</span>}
                            {subject.name.toUpperCase() === 'SCIENCE' && <span className="text-xl">🔬</span>}
                            {subject.name.toUpperCase() === 'ECONOMICS' && <span className="text-xl">💰</span>}
                            {!['MATHEMATICS', 'ENGLISH', 'SOCIAL STUDIES', 'HISTORY', 'CREATIVE ARTS', 'COMPUTING', 'SCIENCE', 'ECONOMICS'].includes(subject.name.toUpperCase()) && <span className="text-xl">📚</span>}
                          </div>
                          <span className="text-white text-[9px] sm:text-[10px] font-semibold drop-shadow-md leading-tight block truncate w-full">
                            {subject.name}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-md">
                            <Check size={10} className="text-blue-500" />
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </motion.div>

            {/* Mobile Progress Quick Stats */}
            {progressData && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-xl p-3 mt-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                    <TrendingUp size={14} className="text-blue-500" />
                    Quick Stats
                  </h4>
                  <Link to="/progress" className="text-blue-500 text-xs font-medium">
                    View Details →
                  </Link>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-blue-50 rounded-lg p-2 text-center">
                    <p className="text-lg font-bold text-blue-600">{progressData.insights?.questionsThisWeek || 0}</p>
                    <p className="text-[10px] text-blue-500">This Week</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2 text-center">
                    <p className="text-lg font-bold text-green-600">{(progressData.insights?.averageAccuracy || 0).toFixed(0)}%</p>
                    <p className="text-[10px] text-green-500">Accuracy</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-2 text-center">
                    <p className="text-lg font-bold text-purple-600">{progressData.insights?.totalSubjects || 0}</p>
                    <p className="text-[10px] text-purple-500">Subjects</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
          
          {/* Left Panel - Chat Area */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden h-[60vh] sm:h-[65vh] lg:h-[calc(100vh-130px)]"
            >
              {/* Chat Header */}
              <div className="p-3 sm:p-6 border-b border-gray-100 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg sm:text-2xl font-bold text-gray-800">Hello {user?.firstName}!</h1>
                    {/* Online status indicator */}
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                      isOnline ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
                      <span className="hidden sm:inline">{isOnline ? 'Online' : 'Offline'}</span>
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm sm:text-base">
                    {isTyping || pendingQuestion ? (
                      <span className="flex items-center gap-2">
                        <RefreshCw size={14} className="animate-spin text-blue-500" />
                        <span className="text-blue-600">Samteck is thinking...</span>
                      </span>
                    ) : selectedSubject ? (
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                        Ready to help with <span className="font-medium text-blue-600">{selectedSubject.name}</span>
                        {responseTime && (
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock size={10} />
                            Last response: {responseTime}s
                          </span>
                        )}
                      </span>
                    ) : (
                      'Select a subject to get started'
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  {/* Toggle timestamps */}
                  <button 
                    onClick={() => setShowTimestamps(!showTimestamps)}
                    className={`p-2 rounded-lg transition touch-target ${
                      showTimestamps ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                    }`}
                    title="Toggle timestamps"
                  >
                    <Clock size={18} />
                  </button>
                  {messages.length > 1 && (
                    <button 
                      onClick={clearChatHistory}
                      className="text-gray-400 hover:text-red-500 transition p-2 touch-target"
                      title="Clear chat history"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>

              {/* Chat Messages */}
              <div className="h-[calc(100%-140px)] sm:h-[calc(100%-200px)] overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4 scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent">
                <AnimatePresence>
                  {messages.map((message) => (
                    <div key={message.id} className="group">
                      <div className="flex items-start gap-1.5 sm:gap-2">
                        <ChatBubble 
                          message={message.text}
                          isUser={message.isUser}
                          isError={message.isError}
                          isNotification={message.isNotification}
                          status={message.status}
                          mathData={message.mathData}
                        />
                        {!message.isUser && message.questionId && (
                          <VoiceButton 
                            questionId={message.questionId}
                            onPlay={handleVoicePlay}
                          />
                        )}
                      </div>
                      {/* Feedback buttons for AI responses */}
                      {!message.isUser && message.questionId && showFeedback === message.questionId && (
                        <motion.div 
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="ml-12 mt-2 flex items-center gap-2"
                        >
                          <span className="text-xs text-gray-500">Was this helpful?</span>
                          <button
                            onClick={() => handleFeedback(message.questionId, true)}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 text-xs transition"
                          >
                            <ThumbsUp size={12} />
                            Yes
                          </button>
                          <button
                            onClick={() => handleFeedback(message.questionId, false)}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs transition"
                          >
                            <ThumbsDown size={12} />
                            No
                          </button>
                          <button
                            onClick={() => setShowFeedback(null)}
                            className="text-gray-400 hover:text-gray-600 text-xs ml-1"
                          >
                            Skip
                          </button>
                        </motion.div>
                      )}
                      {/* Timestamp */}
                      {showTimestamps && message.timestamp && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className={`text-[10px] text-gray-400 mt-1 ${message.isUser ? 'text-right mr-12' : 'ml-12'}`}
                        >
                          {formatTime(message.timestamp)}
                          {message.responseTime && ` • ${message.responseTime}s`}
                        </motion.div>
                      )}
                    </div>
                  ))}
                  {(isTyping || pendingQuestion) && <ChatBubble isTyping={true} />}
                </AnimatePresence>
                <div ref={chatEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-2 sm:p-4 border-t border-gray-100 bg-gray-50/80 safe-area-bottom">
                {/* Subject hint when none selected */}
                {!selectedSubject && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-2 text-center text-sm text-amber-600 bg-amber-50 rounded-lg py-2 px-3 flex items-center justify-center gap-2"
                  >
                    <Lightbulb size={16} />
                    Select a subject above to start asking questions
                  </motion.div>
                )}
                
                <form onSubmit={handleSendMessage} className="flex items-center gap-2 sm:gap-3">
                  <button 
                    type="button"
                    className="p-2.5 sm:p-3 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition shadow-sm touch-target flex-shrink-0"
                  >
                    <Mic size={18} className="sm:w-[22px] sm:h-[22px]" />
                  </button>
                  <div className="flex-1 relative min-w-0">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={
                        !isOnline ? "You're offline..." :
                        pendingQuestion ? "Waiting for response..." : 
                        !selectedSubject ? "Select a subject first..." :
                        "Ask a question..."
                      }
                      className={`w-full px-3 py-3 sm:px-5 sm:py-4 bg-white border rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm text-gray-800 placeholder-gray-400 pr-10 sm:pr-12 text-sm sm:text-base ${
                        !isOnline ? 'border-red-200 bg-red-50' : 
                        !selectedSubject ? 'border-amber-200' : 'border-gray-200'
                      }`}
                      disabled={!selectedSubject || isTyping || pendingQuestion || !isOnline}
                    />
                    {isTyping || pendingQuestion ? (
                      <RefreshCw className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-blue-400 animate-spin" size={18} />
                    ) : (
                      <Send className={`absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 ${inputMessage.trim() ? 'text-blue-500' : 'text-blue-300'}`} size={18} />
                    )}
                  </div>
                  <motion.button
                    type="submit"
                    disabled={!selectedSubject || isTyping || pendingQuestion || !inputMessage.trim() || !isOnline}
                    whileTap={{ scale: 0.98 }}
                    className={`font-semibold px-4 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed touch-target flex-shrink-0 text-sm sm:text-base ${
                      inputMessage.trim() && selectedSubject && isOnline
                        ? 'bg-blue-500 hover:bg-blue-600 text-white'
                        : 'bg-gray-300 text-gray-500'
                    }`}
                  >
                    {isTyping || pendingQuestion ? (
                      <RefreshCw size={18} className="animate-spin" />
                    ) : (
                      <>
                        <span className="hidden sm:inline">Send</span>
                        <Send size={18} className="sm:hidden" />
                      </>
                    )}
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </div>

          {/* Right Panel */}
          <div className="hidden lg:block lg:col-span-2 space-y-5 order-1 lg:order-2">
            
            {/* Profile Card */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-3xl shadow-xl p-5"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center overflow-hidden ring-4 ring-blue-100">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt={user.firstName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white text-xl font-bold">{user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-gray-800 truncate">{user?.firstName} {user?.lastName}</h3>
                  <p className="text-gray-500 text-sm truncate">{user?.className || 'Junior High - Form 2'}</p>
                </div>
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-1 shadow-md flex-shrink-0">
                  Edit Profile
                </button>
              </div>
            </motion.div>

            {/* Subject Grid */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl shadow-xl p-5"
            >
              <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                Choose a Subject:
                {isSubjectsLoading && <RefreshCw size={16} className="animate-spin text-blue-500" />}
              </h3>
              {isSubjectsLoading ? (
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="aspect-square rounded-2xl bg-gray-200 animate-pulse" />
                  ))}
                </div>
              ) : subjects.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">📚</div>
                  <p className="text-gray-500">No subjects available</p>
                  <button 
                    onClick={loadSubjects}
                    className="mt-3 text-blue-500 hover:text-blue-600 text-sm flex items-center gap-1 mx-auto"
                  >
                    <RefreshCw size={14} /> Retry
                  </button>
                </div>
              ) : (
              <div className="grid grid-cols-3 gap-3">
                {subjects.slice(0, 6).map((subject) => {
                  const style = getSubjectStyle(subject.name);
                  const isSelected = selectedSubject?.id === subject.id;
                  
                  return (
                    <motion.button
                      key={subject.id}
                      onClick={() => handleSubjectSelect(subject)}
                      whileHover={{ scale: 1.05, y: -3 }}
                      whileTap={{ scale: 0.95 }}
                      className={`relative rounded-2xl p-3 flex flex-col items-center justify-center aspect-square transition-all ${
                        isSelected 
                          ? 'ring-4 ring-blue-400 ring-offset-2' 
                          : ''
                      }`}
                    >
                      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${style.bg} shadow-lg`}></div>
                      <div className="relative z-10 text-center">
                        <div className="text-3xl mb-2 filter drop-shadow-md">
                          {subject.name.toUpperCase() === 'MATHEMATICS' && (
                            <div className="text-white text-xl font-bold leading-tight">
                              <div className="flex items-center justify-center gap-1">
                                <span>+</span>
                                <span>×</span>
                              </div>
                              <div className="flex items-center justify-center gap-1">
                                <span>÷</span>
                                <span>=</span>
                              </div>
                            </div>
                          )}
                          {subject.name.toUpperCase() === 'ENGLISH' && (
                            <div className="bg-indigo-700/50 rounded-lg px-2 py-1 text-white text-lg font-bold">
                              ABC
                            </div>
                          )}
                          {subject.name.toUpperCase() === 'SOCIAL STUDIES' && <span className="text-3xl">🌍</span>}
                          {subject.name.toUpperCase() === 'HISTORY' && <span className="text-3xl">📜</span>}
                          {subject.name.toUpperCase() === 'CREATIVE ARTS' && <span className="text-3xl">🎨</span>}
                          {subject.name.toUpperCase() === 'COMPUTING' && (
                            <div className="bg-slate-800/50 rounded-lg px-2 py-1 text-white text-lg font-mono">
                              {'</>'}
                            </div>
                          )}
                          {subject.name.toUpperCase() === 'SCIENCE' && <span className="text-3xl">🔬</span>}
                          {subject.name.toUpperCase() === 'ECONOMICS' && <span className="text-3xl">💰</span>}
                          {!['MATHEMATICS', 'ENGLISH', 'SOCIAL STUDIES', 'HISTORY', 'CREATIVE ARTS', 'COMPUTING', 'SCIENCE', 'ECONOMICS'].includes(subject.name.toUpperCase()) && <span className="text-3xl">📚</span>}
                        </div>
                        <span className="text-white text-[11px] font-semibold drop-shadow-md leading-tight block">
                          {subject.name}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md">
                          <Check size={12} className="text-blue-500" />
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
              )}
            </motion.div>

            {/* Voice/Text Chat Buttons */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 gap-3"
            >
              <button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl transition-all touch-target">
                <div className="w-6 h-6 sm:w-7 sm:h-7 bg-white/20 rounded-full flex items-center justify-center">
                  <Mic size={14} className="sm:w-4 sm:h-4" />
                </div>
                <span className="text-xs sm:text-sm">Voice Chat</span>
                <ChevronRight size={14} className="hidden sm:block" />
              </button>
              <button className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl transition-all touch-target">
                <div className="w-6 h-6 sm:w-7 sm:h-7 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle size={14} className="sm:w-4 sm:h-4" />
                </div>
                <span className="text-xs sm:text-sm">Text Chat</span>
                <ChevronRight size={14} className="hidden sm:block" />
              </button>
            </motion.div>

            {/* Help Card */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-3xl shadow-xl p-5"
            >
              <div className="flex items-center gap-3">
                <div className="text-3xl">💡</div>
                <div className="flex-1">
                  <span className="font-bold text-gray-800">Need Help?</span>
                  <span className="text-gray-500 ml-1 text-sm">Click here for</span>
                  <Link to="#" className="text-blue-500 hover:text-blue-600 font-medium ml-1 text-sm">
                    Study Tips
                  </Link>
                </div>
                <ChevronRight className="text-gray-400" size={20} />
              </div>
            </motion.div>

            {/* Learning Progress Summary */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-3xl shadow-xl p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                  <TrendingUp size={20} className="text-blue-500" />
                  My Progress
                </h3>
                <Link 
                  to="/progress" 
                  className="text-blue-500 hover:text-blue-600 text-sm font-medium flex items-center gap-1"
                >
                  View All
                  <ChevronRight size={14} />
                </Link>
              </div>
              
              {isProgressLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 rounded-xl bg-gray-100 animate-pulse" />
                  ))}
                </div>
              ) : progressData ? (
                <div className="space-y-3">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <BookOpen size={14} className="text-blue-500" />
                        <span className="text-xs text-blue-600">Questions</span>
                      </div>
                      <p className="text-xl font-bold text-blue-700">
                        {progressData.insights?.questionsThisWeek || 0}
                        <span className="text-xs font-normal text-blue-500 ml-1">this week</span>
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Target size={14} className="text-green-500" />
                        <span className="text-xs text-green-600">Accuracy</span>
                      </div>
                      <p className="text-xl font-bold text-green-700">
                        {(progressData.insights?.averageAccuracy || 0).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                  
                  {/* Most Practiced Subject */}
                  {progressData.insights?.mostPracticedSubject && (
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Award size={14} className="text-purple-500" />
                        <span className="text-xs text-purple-600">Top Subject</span>
                      </div>
                      <p className="text-sm font-bold text-purple-700">
                        {progressData.insights.mostPracticedSubject}
                      </p>
                    </div>
                  )}

                  {/* Recent Activity */}
                  {progressData.recentQuestions?.length > 0 && (
                    <div className="mt-3">
                      <h4 className="text-xs font-semibold text-gray-500 mb-2">Recent Activity</h4>
                      <div className="space-y-2 max-h-24 overflow-y-auto">
                        {progressData.recentQuestions.slice(0, 3).map((q, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs">
                            <div className={`w-2 h-2 rounded-full ${
                              q.isCorrect === true ? 'bg-green-400' : 
                              q.isCorrect === false ? 'bg-red-400' : 'bg-gray-300'
                            }`}></div>
                            <span className="text-gray-600 truncate flex-1">
                              {q.questionText?.substring(0, 30)}...
                            </span>
                            <span className="text-gray-400 text-[10px]">
                              {q.subject?.code || 'N/A'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-3xl mb-2">📊</div>
                  <p className="text-gray-500 text-sm">Start learning to track progress</p>
                </div>
              )}
            </motion.div>

            {/* Subject Progress (when subject selected) */}
            {selectedSubject && subjectProgress?.progress && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-3xl shadow-xl p-5"
              >
                <h3 className="font-bold text-base text-gray-800 mb-3 flex items-center gap-2">
                  📈 {selectedSubject.name} Progress
                </h3>
                <div className="space-y-3">
                  {/* Accuracy Ring */}
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16">
                      <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                        <circle
                          cx="18"
                          cy="18"
                          r="15.9155"
                          fill="transparent"
                          stroke="#e5e7eb"
                          strokeWidth="3"
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r="15.9155"
                          fill="transparent"
                          stroke={
                            subjectProgress.progress.accuracyScore >= 80 ? '#10b981' :
                            subjectProgress.progress.accuracyScore >= 60 ? '#f59e0b' : '#ef4444'
                          }
                          strokeWidth="3"
                          strokeDasharray={`${subjectProgress.progress.accuracyScore} 100`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold text-gray-700">
                          {subjectProgress.progress.accuracyScore.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold text-gray-800">{subjectProgress.progress.questionsAsked}</span> questions asked
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold text-green-600">{subjectProgress.progress.correctAnswers}</span> correct answers
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Last practiced: {formatRelativeTime(subjectProgress.progress.lastPracticed)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Recent Questions for this subject */}
                  {subjectProgress.recentQuestions?.length > 0 && (
                    <div className="border-t pt-3">
                      <h4 className="text-xs font-semibold text-gray-500 mb-2">Recent Questions</h4>
                      <div className="space-y-1.5">
                        {subjectProgress.recentQuestions.slice(0, 3).map((q, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs">
                            <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                              q.isCorrect === true ? 'bg-green-400' : 
                              q.isCorrect === false ? 'bg-red-400' : 'bg-gray-300'
                            }`}></div>
                            <span className="text-gray-600 line-clamp-2">
                              {q.questionText}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
