import React, { useState, useEffect } from "react";
import Avatar from "./components/Avatar";
import Chat from "./components/Chat";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [lastMessage, setLastMessage] = useState(""); // To track the last message sent to the avatar

  // Function to send a message and update the message list
  const handleSendMessage = (message) => {
    const newMessage = { text: message, sender: "User" };
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    // Send the message to the avatar to trigger animations
    setLastMessage(message); // Update the last message for the avatar

    // Check if the message is a command for the avatar (optional, keeping your postMessage handling intact)
    if (message.startsWith("/avatar ")) {
      const command = message.replace("/avatar ", "");
      window.postMessage(command, "https://readyplayer.me");
    }
  };

  // Function to handle messages sent from the avatar
  const handleSendAvatarMessage = (message) => {
    const newMessage = { text: message, sender: "Avatar" };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  // Handle messages from the avatar (received via postMessage)
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.origin === "https://readyplayer.me") {
        const avatarMessage = event.data;

        const avatarResponse =
          typeof avatarMessage === "string"
            ? avatarMessage
            : avatarMessage.text;

        setMessages((prevMessages) => [
          ...prevMessages,
          { text: avatarResponse, sender: "Avatar" },
        ]);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <div className="container">
      {/* Avatar Section */}
      <div className="avatar-section">
        {/* Avatar Model */}
        <Avatar chatMessage={lastMessage} onSendAvatarMessage={handleSendAvatarMessage} />
      </div>

      {/* Chat Section */}
      <div className="chat-section">
        <Chat messages={messages} onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}

export default App;
