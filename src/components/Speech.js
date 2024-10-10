import React, { useState, useEffect } from 'react';

// Speech component to handle text-to-speech functionality
const Speech = React.forwardRef((props, ref) => {
  const [voices, setVoices] = useState([]);

  // Fetch available voices when the component mounts
  useEffect(() => {
    const loadVoices = () => {
      const voicesList = window.speechSynthesis.getVoices();
      console.log('Available Voices:', voicesList); // Log the voices to see what is available
      if (voicesList.length > 0) {
        setVoices(voicesList);
      }
    };

    loadVoices();
    // Some browsers may not load voices immediately, so we need to listen for the voiceschanged event
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // Function to handle speaking the response with the selected voice
  const speak = (message) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 1; // Set the rate of speech (1 is normal speed)
      utterance.pitch = 1; // Set the pitch (1 is default pitch)

      // Prioritize voices: Microsoft Eric Online (Natural), then Google UK English Male
      const preferredVoice = 
        voices.find(voice => voice.name.includes("Microsoft Eric Online (Natural)")) ||
        voices.find(voice => voice.name.includes("Google UK English Male")) ||
        voices[0]; // Fallback to the first available voice
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
        console.log(`Selected voice: ${preferredVoice.name}`);
      } else {
        console.warn("No preferred voice found, using default voice.");
      }

      window.speechSynthesis.speak(utterance); // Trigger speech
    } else {
      console.error("SpeechSynthesis API is not supported in this browser.");
    }
  };

  // Expose the speak function to the parent via ref
  React.useImperativeHandle(ref, () => ({
    speak,
  }));

  return null; // This component doesn't need to render anything
});

export default Speech;
