import { User, Award, Target } from 'lucide-react';
import { motion } from 'framer-motion';

const ProfileCard = ({ user }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="backdrop-blur-xl bg-gradient-to-br from-white/80 to-indigo-50/50 rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300"
    >
      <div className="flex items-center space-x-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg ring-4 ring-white/50">
            {user.profileImage ? (
              <img 
                src={user.profileImage} 
                alt={`${user.firstName} ${user.lastName}`}
                className="w-full h-full rounded-2xl object-cover"
              />
            ) : (
              <span className="drop-shadow-md">{user.firstName?.charAt(0)}{user.lastName?.charAt(0)}</span>
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-md"></div>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            {user.firstName} {user.lastName}
          </h3>
          <p className="text-gray-600 text-sm font-medium mt-0.5">{user.className}</p>
          <p className="text-indigo-600 text-xs font-medium mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
            {user.email}
          </p>
        </div>
      </div>

      <div className="mt-5 pt-5 border-t border-gradient-to-r from-indigo-200 to-purple-200">
        <div className="grid grid-cols-2 gap-4">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="text-center p-4 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg cursor-default"
          >
            <div className="flex items-center justify-center mb-2">
              <Target className="text-white" size={18} />
            </div>
            <div className="text-2xl font-bold text-white drop-shadow-md">
              {user.stats?.questionsAsked || 0}
            </div>
            <div className="text-xs text-indigo-100 font-medium mt-1">Questions</div>
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="text-center p-4 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg cursor-default"
          >
            <div className="flex items-center justify-center mb-2">
              <Award className="text-white" size={18} />
            </div>
            <div className="text-2xl font-bold text-white drop-shadow-md">
              {user.stats?.accuracy || 0}%
            </div>
            <div className="text-xs text-emerald-100 font-medium mt-1">Accuracy</div>
          </motion.div>
        </div>
      </div>

      {/* Achievement Badge */}
      <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏆</span>
          <div className="flex-1">
            <p className="text-xs font-bold text-gray-700">Learning Streak</p>
            <p className="text-[10px] text-gray-500">Keep up the great work!</p>
          </div>
          <span className="text-sm font-bold text-orange-600">7 days</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileCard;
