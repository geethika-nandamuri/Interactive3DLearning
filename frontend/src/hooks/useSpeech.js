import { useState, useEffect, useRef } from 'react';

export const useSpeech = () => {
  const [voices, setVoices] = useState([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRate] = useState(1);

  const utteranceRef = useRef(null);

  const loadVoices = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const allVoices = window.speechSynthesis.getVoices();
      setVoices(allVoices);
      if (allVoices.length > 0 && !selectedVoiceName) {
        // Default to a suitable English voice if available, otherwise first voice
        const englishVoice = allVoices.find(v => v.lang.startsWith('en-US')) || 
                             allVoices.find(v => v.lang.startsWith('en')) || 
                             allVoices[0];
        setSelectedVoiceName(englishVoice.name);
      }
    }
  };

  useEffect(() => {
    loadVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = (text) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    // Clean markdown bold, lists, and headers so they aren't read out phonetically
    const cleanText = text
      .replace(/[*#_`~]/g, '')
      .replace(/[-*]\s+/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utteranceRef.current = utterance;

    // Apply voice selection
    if (selectedVoiceName) {
      const voiceObj = voices.find(v => v.name === selectedVoiceName);
      if (voiceObj) utterance.voice = voiceObj;
    }

    // Apply speech rate
    utterance.rate = rate;

    // Event updates
    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const pause = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const resume = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  };

  const stop = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  return {
    voices,
    selectedVoiceName,
    setSelectedVoiceName,
    isPlaying,
    isPaused,
    rate,
    setRate,
    speak,
    pause,
    resume,
    stop
  };
};
