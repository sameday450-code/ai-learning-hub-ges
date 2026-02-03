import { motion } from 'framer-motion';

const SubjectCard = ({ subject, onClick, isSelected }) => {
  // Subject icons and colors
  const subjectStyles = {
    MATHEMATICS: { icon: '🔢', color: 'bg-blue-500', gradient: 'from-blue-400 to-blue-600' },
    ENGLISH: { icon: '📚', color: 'bg-green-500', gradient: 'from-green-400 to-green-600' },
    'SOCIAL STUDIES': { icon: '🌍', color: 'bg-purple-500', gradient: 'from-purple-400 to-purple-600' },
    HISTORY: { icon: '📜', color: 'bg-amber-500', gradient: 'from-amber-400 to-amber-600' },
    'CREATIVE ARTS': { icon: '🎨', color: 'bg-pink-500', gradient: 'from-pink-400 to-pink-600' },
    COMPUTING: { icon: '💻', color: 'bg-indigo-500', gradient: 'from-indigo-400 to-indigo-600' },
    SCIENCE: { icon: '🔬', color: 'bg-teal-500', gradient: 'from-teal-400 to-teal-600' },
    ECONOMICS: { icon: '💰', color: 'bg-emerald-500', gradient: 'from-emerald-400 to-emerald-600' },
  };

  const style = subjectStyles[subject.name.toUpperCase()] || subjectStyles.MATHEMATICS;

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -3 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`cursor-pointer rounded-xl p-5 transition-all duration-300 relative overflow-hidden group ${
        isSelected 
          ? `bg-gradient-to-br ${style.gradient} text-white shadow-2xl ring-2 ring-offset-2 ring-indigo-400` 
          : 'bg-white/90 backdrop-blur-sm hover:shadow-xl border border-gray-100 hover:border-indigo-200'
      }`}
    >
      {/* Animated background on hover */}
      {!isSelected && (
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      )}
      
      <div className="relative flex items-center space-x-4">
        <div className={`text-4xl transform transition-transform group-hover:scale-110 ${isSelected ? 'drop-shadow-lg' : 'opacity-80'}`}>
          {style.icon}
        </div>
        <div className="flex-1">
          <h3 className={`font-bold text-base ${isSelected ? 'text-white' : 'text-gray-800'}`}>
            {subject.name}
          </h3>
          <p className={`text-xs mt-1 ${isSelected ? 'text-white/90' : 'text-gray-500'}`}>
            {subject.level} · {subject.code}
          </p>
        </div>
        {isSelected && (
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
            </div>
          </div>
        )}
      </div>
      {subject.description && (
        <p className={`relative mt-3 text-xs leading-relaxed ${isSelected ? 'text-white/90' : 'text-gray-600'}`}>
          {subject.description}
        </p>
      )}
    </motion.div>
  );
};

export default SubjectCard;
