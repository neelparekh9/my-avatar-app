import React, { useState, useEffect, useRef } from "react";
import Avatar from "./components/Avatar";
import InteractiveChat from "./components/InteractiveChat"; // Import the new component
import Speech from "./components/Speech"; // Import the Speech component
import "./App.css";

const createNewMessageObject = (text, sender) => ({ text, sender });

function App() {
  const [messages, setMessages] = useState([]); // This will keep track of all chat messages
  const [lastMessageObject, setLastMessageObject] = useState(""); // To track the last message sent to the avatar
  const [currentAnimation, setCurrentAnimation] = useState("Idle"); // Track the current animation state
  const speechRef = useRef(); // Reference to the Speech component

  // Function to send a message and update the message list
  const handleSendMessage = (message) => {
    const newMessageObject = createNewMessageObject(message, "User");
    setMessages((prevMessages) => [...prevMessages, newMessageObject]);

    // Send the message to the avatar to trigger animations
    setLastMessageObject(newMessageObject); // Update the last message for the avatar

    // Check if the message is a command for the avatar (optional, keeping your postMessage handling intact)
    if (message.startsWith("/avatar ")) {
      const command = message.replace("/avatar ", "");
      window.postMessage(command, "https://readyplayer.me");
    }
  };

  // Function to handle messages sent from the avatar
  const handleSendAvatarMessage = (message, animation) => {
    const newMessageObject = createNewMessageObject(message, "Avatar");
    setMessages((prevMessages) => [...prevMessages, newMessageObject]); // Log agent message in the chat

    // Trigger speech when the avatar responds
    if (speechRef.current) {
      speechRef.current.speak(message);
    }

    // Trigger animation if provided
    if (animation) {
      setCurrentAnimation(animation); // Set the current animation for the Avatar component
    }
  };

  return (
    <div className="container">
      {/* Avatar and buttons section */}
      <div className="left-section">
        <div className="avatar-section">
          {/* Avatar Model */}
          <Avatar
            chatMessageObject={lastMessageObject}
            currentAnimation={currentAnimation} // Pass the current animation state to Avatar component
            onSendAvatarMessage={handleSendAvatarMessage}
          />
        </div>

        {/* Interactive Chat Section */}
        <div className="interactive-chat-section">
          <InteractiveChat onSendAgentMessage={handleSendAvatarMessage} speechRef={speechRef} />
        </div>
      </div>

      {/* Chat Section on the right */}
      <div className="chat-section">
        <div className="chat-box">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`chat-message ${message.sender === "User" ? "User" : "Avatar"}`}
            >
              {message.text}
            </div>
          ))}
        </div>
      </div>

      {/* Speech Component */}
      <Speech ref={speechRef} />
    </div>
  );
}

export default App;
