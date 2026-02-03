import { motion } from 'framer-motion';
import { User, Bot, Sparkles, AlertCircle, Info, Check, CheckCheck } from 'lucide-react';

const ChatBubble = ({ message, isUser, isTyping, isError, isNotification, status }) => {
  if (isTyping) {
    return (
      <div className="flex items-start space-x-2 sm:space-x-3 mb-3 sm:mb-4">
        <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg">
          <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
        <div className="bg-gray-100 border border-gray-200 rounded-xl sm:rounded-2xl rounded-bl-sm px-3 py-2.5 sm:px-5 sm:py-4 shadow-sm">
          <div className="flex space-x-2 items-center">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400 animate-pulse" />
            <span className="text-sm text-gray-500 mr-2">SamTeck is thinking</span>
            <div className="flex space-x-1 sm:space-x-1.5">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-400 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Notification message style
  if (isNotification) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center mb-3 sm:mb-4 w-full"
      >
        <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-lg px-4 py-2 text-sm flex items-center gap-2 shadow-sm">
          <Info size={16} />
          {message}
        </div>
      </motion.div>
    );
  }

  // Error message style
  if (isError) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start space-x-2 sm:space-x-3 mb-3 sm:mb-4 w-full"
      >
        <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-lg">
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl sm:rounded-2xl rounded-bl-sm px-3 py-2.5 sm:px-5 sm:py-3.5 shadow-sm max-w-[85%] sm:max-w-[80%]">
          <div className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base">{message}</div>
        </div>
      </motion.div>
    );
  }

  // Status icon for user messages
  const getStatusIcon = () => {
    if (!isUser) return null;
    switch (status) {
      case 'sending':
        return <div className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin" />;
      case 'sent':
        return <Check size={12} className="text-white/70" />;
      case 'delivered':
        return <CheckCheck size={12} className="text-white" />;
      case 'failed':
        return <AlertCircle size={12} className="text-red-300" />;
      default:
        return <Check size={12} className="text-white/70" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex items-start space-x-2 sm:space-x-3 mb-3 sm:mb-4 ${isUser ? 'flex-row-reverse space-x-reverse' : ''} w-full`}
    >
      {/* Avatar */}
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-lg ${
          isUser 
            ? 'bg-gradient-to-br from-blue-500 to-blue-700' 
            : 'bg-gradient-to-br from-blue-400 to-blue-600'
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        ) : (
          <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        )}
      </motion.div>

      {/* Message */}
      <div className={`relative group max-w-[85%] sm:max-w-[80%] ${
        isUser 
          ? `bg-gradient-to-r ${status === 'failed' ? 'from-red-400 to-red-500' : 'from-blue-500 to-blue-600'} text-white rounded-xl sm:rounded-2xl rounded-br-sm px-3 py-2.5 sm:px-5 sm:py-3.5 shadow-lg` 
          : 'bg-gray-100 border border-gray-200 text-gray-800 rounded-xl sm:rounded-2xl rounded-bl-sm shadow-sm'
      }`}>
        {isUser ? (
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base flex-1">{message}</div>
            <div className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
              {getStatusIcon()}
            </div>
          </div>
        ) : (
          <div className="px-3 py-2.5 sm:px-5 sm:py-3.5">
            <div className="font-semibold text-gray-800 mb-1.5 sm:mb-2 text-sm sm:text-base">
              {typeof message === 'string' && message.includes('!') ? (
                <span className="text-blue-600">{message.split('\n')[0]}</span>
              ) : null}
            </div>
            <div className="whitespace-pre-wrap leading-relaxed text-gray-700 text-sm sm:text-base">
              {typeof message === 'string' ? (
                message.split('\n').slice(message.includes('!') ? 1 : 0).map((line, i) => {
                  // Check if line starts with "Step" for special formatting
                  if (line.trim().toLowerCase().startsWith('step')) {
                    return (
                      <div key={i} className="my-2 sm:my-3 p-2 sm:p-3 bg-white rounded-lg sm:rounded-xl border border-gray-100 shadow-sm">
                        <span className="font-semibold text-blue-600 text-xs sm:text-sm">{line.split(':')[0]}:</span>
                        <span className="text-gray-700 text-xs sm:text-sm">{line.split(':').slice(1).join(':')}</span>
                      </div>
                    );
                  }
                  // Format numbered lists
                  if (/^\d+\./.test(line.trim())) {
                    return (
                      <div key={i} className="my-1 flex items-start gap-2">
                        <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                          {line.trim().match(/^\d+/)[0]}
                        </span>
                        <span>{line.replace(/^\d+\.\s*/, '')}</span>
                      </div>
                    );
                  }
                  // Format bullet points
                  if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
                    return (
                      <div key={i} className="my-1 flex items-start gap-2 pl-2">
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0 mt-2"></span>
                        <span>{line.replace(/^[•-]\s*/, '')}</span>
                      </div>
                    );
                  }
                  return <div key={i} className={line.trim() === '' ? 'h-2' : ''}>{line}</div>;
                })
              ) : (
                message
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ChatBubble;
