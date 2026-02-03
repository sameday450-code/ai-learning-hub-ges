import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const VoiceButton = ({ questionId, onPlay, disabled }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const audioRef = useRef(null);
  const audioUrlRef = useRef(null);

  useEffect(() => {
    // Cleanup audio on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
    };
  }, []);

  const handleTogglePlay = async () => {
    if (disabled || isLoading) return;
    setError(false);

    if (isPlaying) {
      // Stop playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
      }
      return;
    }

    // Start playing
    setIsLoading(true);
    try {
      const audioBlob = await onPlay(questionId);
      
      // Cleanup previous audio URL
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
      
      const audioUrl = URL.createObjectURL(audioBlob);
      audioUrlRef.current = audioUrl;
      
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      audioRef.current = new Audio(audioUrl);
      
      audioRef.current.onended = () => {
        setIsPlaying(false);
      };
      
      audioRef.current.onerror = () => {
        setIsPlaying(false);
        setError(true);
        console.error('Audio playback error');
      };
      
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (error) {
      console.error('Voice playback error:', error);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleTogglePlay}
      disabled={disabled || isLoading}
      className={`p-2.5 rounded-xl transition-all shadow-md hover:shadow-lg flex-shrink-0 ${
        error
          ? 'bg-gradient-to-br from-red-100 to-red-200 text-red-600'
          : isPlaying
          ? 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
          : 'bg-gradient-to-br from-indigo-100 to-purple-100 hover:from-indigo-200 hover:to-purple-200 text-indigo-600'
      } ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={error ? 'Voice failed - click to retry' : isPlaying ? 'Stop voice' : 'Listen to answer'}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
      ) : error ? (
        <AlertCircle size={18} className="drop-shadow-sm" />
      ) : isPlaying ? (
        <VolumeX size={18} className="drop-shadow-sm" />
      ) : (
        <Volume2 size={18} className="drop-shadow-sm" />
      )}
    </motion.button>
  );
};

export default VoiceButton;
