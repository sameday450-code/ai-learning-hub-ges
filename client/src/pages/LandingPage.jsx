import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Brain, Mic, TrendingUp, Award, Users, CheckCircle, Download } from 'lucide-react';
import Navbar from '../components/Navbar';

const LandingPage = () => {
  const features = [
    {
      icon: <Brain className="w-12 h-12 text-primary-600" />,
      title: 'AI Homework Solver',
      description: 'Get step-by-step solutions to your homework questions, aligned with GES syllabus'
    },
    {
      icon: <Mic className="w-12 h-12 text-purple-600" />,
      title: 'Voice Learning Assistant',
      description: 'Listen to explanations in natural voice with Ghanaian accent support'
    },
    {
      icon: <TrendingUp className="w-12 h-12 text-green-600" />,
      title: 'Progress Tracking',
      description: 'Monitor your learning journey with detailed analytics and insights'
    },
    {
      icon: <Award className="w-12 h-12 text-amber-600" />,
      title: 'BECE & WASSCE Prep',
      description: 'Focused preparation for your exams with past question practice'
    },
  ];

  const subjects = [
    { name: 'Mathematics', icon: '🔢', color: 'bg-blue-500' },
    { name: 'English', icon: '📚', color: 'bg-green-500' },
    { name: 'Social Studies', icon: '🌍', color: 'bg-purple-500' },
    { name: 'History', icon: '📜', color: 'bg-amber-500' },
    { name: 'Creative Arts', icon: '🎨', color: 'bg-pink-500' },
    { name: 'Computing', icon: '💻', color: 'bg-indigo-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section 
        className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-purple-800 text-white overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(37, 99, 235, 0.9), rgba(91, 33, 182, 0.9)), url('./bg.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="container-custom py-12 sm:py-16 md:py-20 lg:py-32">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-10 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="z-10 text-center md:text-left"
            >
              {/* Premium Badge */}
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 mb-4 sm:mb-6"
              >
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-xs sm:text-sm font-medium text-white/90">100% Free • Aligned with GES Curriculum</span>
              </motion.div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold mb-4 sm:mb-6 leading-[1.1] tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-gray-100">
                  Learn Smarter with AI
                </span>
                <span className="block mt-2 bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 via-yellow-200 to-amber-300 drop-shadow-lg">
                  Aligned to Ghanaian Syllabus
                </span>
              </h1>
              
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-10 text-white/90 leading-relaxed max-w-xl mx-auto md:mx-0 font-light">
                Get homework help with <span className="font-semibold text-white">step-by-step explanations</span> and
                <span className="font-semibold text-white"> real-time feedback</span> from your AI tutor
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-10 justify-center md:justify-start">
                <Link 
                  to="/signup" 
                  className="inline-flex items-center justify-center gap-2 bg-white text-primary-600 hover:bg-yellow-300 hover:text-primary-700 font-bold py-3 px-6 sm:py-4 sm:px-8 rounded-xl shadow-2xl transition-all duration-200 transform hover:scale-105 hover:-translate-y-1 text-sm sm:text-base touch-target"
                >
                  Get Started Free
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                
                <a 
                  href="#features" 
                  className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm border-2 border-white/80 hover:bg-white hover:border-white text-white hover:text-primary-700 font-bold py-3 px-6 sm:py-4 sm:px-8 rounded-xl transition-all duration-200 text-sm sm:text-base touch-target"
                >
                  Learn More
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </a>
              </div>

              {/* Trust Indicators */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="mt-6 sm:mt-10 flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-6 text-xs sm:text-sm text-white/70"
              >
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                  <span>BECE & WASSCE Ready</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                  <span>Voice Learning Support</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                  <span>24/7 AI Tutor</span>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden md:flex justify-center items-center relative z-10"
            >
              <div className="relative">
                {/* Decorative gradient circle */}
                <div className="absolute -inset-8 bg-gradient-to-r from-yellow-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
                
                {/* Mobile phone mockup */}
                <div className="relative transform hover:scale-105 transition-transform duration-300">
                  <img 
                    src="/mobile-view.png" 
                    alt="AI Learning Hub Mobile App" 
                    className="w-auto h-[600px] max-h-[70vh] object-contain filter drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Wave Separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path fill="#f9fafb" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,138.7C960,139,1056,117,1152,101.3C1248,85,1344,75,1392,69.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-16 md:py-20 bg-gray-50">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-12 md:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">Why Choose AI Learning Hub?</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600">
              Everything you need to excel in your studies
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card text-center"
              >
                <div className="flex justify-center mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-2 sm:mb-3">{feature.title}</h3>
                <p className="text-gray-600 text-xs sm:text-sm md:text-base">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Subjects Section */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-12 md:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">Subjects We Cover</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600">
              Comprehensive coverage of JHS & SHS curriculum
            </p>
          </motion.div>

          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
            {subjects.map((subject, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={`${subject.color} rounded-xl p-3 sm:p-4 md:p-6 text-white text-center shadow-lg cursor-pointer touch-target`}
              >
                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-1 sm:mb-2 md:mb-3">{subject.icon}</div>
                <h3 className="font-bold text-[10px] sm:text-xs md:text-sm">{subject.name}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-primary-600 to-purple-700 text-white">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
              Ready to Transform Your Learning?
            </h2>
            <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-gray-100 px-4">
              Join thousands of Ghanaian students already learning smarter with AI
            </p>
            <Link to="/signup" className="inline-block bg-white text-primary-600 hover:bg-gray-100 font-bold py-3 px-8 sm:py-4 sm:px-12 rounded-lg shadow-lg transition-all transform hover:scale-105 text-sm sm:text-base touch-target">
              Start Learning Free
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-10 md:py-12">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="col-span-2 md:col-span-1">
              <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">AI Learning Hub</h3>
              <p className="text-gray-400 text-xs sm:text-sm">
                Empowering Ghanaian students with AI-powered education
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Quick Links</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Subjects</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Support</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition">FAQ</a></li>
              </ul>
            </div>
            <div className="hidden md:block">
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Legal</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-gray-400">
            <p>&copy; 2026 AI Learning Hub. All rights reserved. Made for Ghanaian students | By SamTeck</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
