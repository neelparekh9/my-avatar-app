import React, { useState } from "react";
import { conversationMap } from "../Constants";  // Adjust path according to your project structure
import Speech from './Speech';  // Import the Speech component for text-to-speech

const InteractiveChat = ({ onSendAgentMessage, speechRef }) => {
  const [currentStep, setCurrentStep] = useState("initial");

  const handleUserSelection = (optionText) => {
    const currentOptions = conversationMap[currentStep];  // Get the current step options

    // Check if currentOptions is an array (e.g., for initial multiple choices)
    if (Array.isArray(currentOptions)) {
      // Find the selected option based on the user's choice
      const selectedOption = currentOptions.find(opt => opt.text === optionText);

      // If the selected option has a next step, move to it
      if (selectedOption && selectedOption.next) {
        setCurrentStep(selectedOption.next);  // Move to the next step using next value

        const nextStepDetails = conversationMap[selectedOption.next];  // Get the details of the next step

        // Send the agent's response and trigger animation
        onSendAgentMessage(nextStepDetails.agentResponse, nextStepDetails.animation);

        // Trigger speech synthesis if applicable
        if (speechRef && speechRef.current) {
          window.speechSynthesis.cancel();  // Cancel any ongoing speech
          speechRef.current.speak(nextStepDetails.agentResponse);  // Speak the current response
        }
      }
    } 
    // If the currentOptions is an object (e.g., after initial selection), handle it
    else if (currentOptions && currentOptions.nextOptions) {
      // Use next to transition to the next step
      const nextStep = currentOptions.next;

      if (nextStep) {
        setCurrentStep(nextStep);  // Update the current step
        const nextStepDetails = conversationMap[nextStep];  // Get the next step details

        // Send the agent's response and trigger animation
        onSendAgentMessage(nextStepDetails.agentResponse, nextStepDetails.animation);

        // Trigger speech synthesis if applicable
        if (speechRef && speechRef.current) {
          window.speechSynthesis.cancel();  // Cancel any ongoing speech
          speechRef.current.speak(nextStepDetails.agentResponse);  // Speak the current response
        }
      }
    }
  };

  const renderOptions = () => {
    const currentOptions = conversationMap[currentStep];

    // If currentOptions is an array, render the buttons for each option
    if (Array.isArray(currentOptions)) {
      return currentOptions.map((option, index) => (
        <button key={index} onClick={() => handleUserSelection(option.text)}>
          {option.text}
        </button>
      ));
    }

    // If it's an object with agentResponse and nextOptions, show them
    if (currentOptions && currentOptions.agentResponse && currentOptions.nextOptions) {
      return (
        <div>
          <p>{currentOptions.agentResponse}</p>
          {currentOptions.nextOptions.map((optionText, idx) => (
            <button key={idx} onClick={() => handleUserSelection(optionText)}>
              {optionText}
            </button>
          ))}
        </div>
      );
    }

    // Default fallback in case of errors
    return <p>{currentOptions?.agentResponse || "Conversation ended or configuration error."}</p>;
  };

  return (
    <div className="interactive-chat-section">
      {renderOptions()}
    </div>
  );
};

export default InteractiveChat;
