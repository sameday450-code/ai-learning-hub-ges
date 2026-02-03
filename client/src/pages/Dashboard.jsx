import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, MessageCircle, ChevronRight, Lightbulb, LogOut, BarChart3, Home, ChevronDown, Edit3, Check, Trash2, RefreshCw, Wifi, WifiOff, Clock, Volume2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { aiService, subjectService } from '../services/api.service';
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
      };

      // Update user message status to delivered
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id ? { ...msg, status: 'delivered' } : msg
      ));

      setLastQuestionId(response.questionId);
      setMessages(prev => [...prev, aiMessage]);
      
      // Clear pending question on success
      setPendingQuestion(null);
      localStorage.removeItem(STORAGE_KEYS.PENDING_QUESTION);
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
        text: `Hello ${user?.firstName}!\nHow can I help you today?`,
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
                        <span className="text-blue-600">AI is thinking...</span>
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
                        />
                        {!message.isUser && message.questionId && (
                          <VoiceButton 
                            questionId={message.questionId}
                            onPlay={handleVoicePlay}
                          />
                        )}
                      </div>
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

          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
