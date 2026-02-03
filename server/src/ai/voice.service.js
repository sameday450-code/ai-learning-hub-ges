/**
 * Voice Service - ElevenLabs Text-to-Speech Integration
 * Natural voice responses with Ghanaian accent support
 */

import axios from 'axios';

/**
 * Convert text to speech using ElevenLabs API
 * @param {string} text - Text to convert to speech
 * @param {string} voiceId - ElevenLabs voice ID (optional)
 * @returns {Promise<Buffer>} Audio buffer
 */
export const textToSpeech = async (text, voiceId = null) => {
  try {
    const voice = voiceId || process.env.ELEVENLABS_VOICE_ID;
    
    if (!voice) {
      throw new Error('ElevenLabs voice ID not configured');
    }

    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice}`,
      {
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true
        }
      },
      {
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVENLABS_API_KEY
        },
        responseType: 'arraybuffer'
      }
    );

    return {
      success: true,
      audio: Buffer.from(response.data),
      format: 'audio/mpeg'
    };
  } catch (error) {
    console.error('ElevenLabs API Error:', error.response?.data || error.message);
    
    return {
      success: false,
      error: error.message,
      fallback: 'text-only'
    };
  }
};

/**
 * Get available voices from ElevenLabs
 */
export const getAvailableVoices = async () => {
  try {
    const response = await axios.get(
      'https://api.elevenlabs.io/v1/voices',
      {
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY
        }
      }
    );

    return {
      success: true,
      voices: response.data.voices
    };
  } catch (error) {
    console.error('Error fetching voices:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Optimize text for speech synthesis
 * Remove markdown, format numbers, etc.
 */
export const optimizeTextForSpeech = (text) => {
  let optimized = text;
  
  // Remove markdown formatting
  optimized = optimized.replace(/\*\*/g, '');
  optimized = optimized.replace(/\*/g, '');
  optimized = optimized.replace(/#/g, '');
  optimized = optimized.replace(/`/g, '');
  
  // Convert numbers to words for better pronunciation
  // (basic implementation - can be enhanced)
  
  // Break long sentences for better pacing
  optimized = optimized.replace(/\. /g, '. \n');
  
  // Limit length (ElevenLabs has character limits)
  if (optimized.length > 5000) {
    optimized = optimized.substring(0, 4997) + '...';
  }
  
  return optimized;
};

/**
 * Recommended voices for Ghanaian students
 */
export const RECOMMENDED_VOICES = {
  // These would be configured based on ElevenLabs available voices
  // that best suit Ghanaian/British English accent
  FEMALE_TEACHER: {
    name: 'Rachel',
    description: 'Clear, patient female teacher voice',
    accent: 'British English'
  },
  MALE_TEACHER: {
    name: 'Adam',
    description: 'Warm, encouraging male teacher voice',
    accent: 'British English'
  },
  FRIENDLY_ASSISTANT: {
    name: 'Bella',
    description: 'Young, friendly assistant voice',
    accent: 'British English'
  }
};
