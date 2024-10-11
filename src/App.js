import React, { useState, useEffect } from "react";
import Avatar from "./components/Avatar";
import Chat from "./components/Chat";
import "./App.css";

const createNewMessageObject = (text, sender) => ({ text, sender });

function App() {
  const [messages, setMessages] = useState([]);
  const [lastMessageObject, setLastMessageObject] = useState(""); // To track the last message sent to the avatar

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
  const handleSendAvatarMessage = (message) => {
    const newMessageObject = createNewMessageObject(message, "Avatar");
    setMessages((prevMessages) => [...prevMessages, newMessageObject]);
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
        <Avatar chatMessageObject={lastMessageObject} onSendAvatarMessage={handleSendAvatarMessage} />
      </div>

      {/* Chat Section */}
      <div className="chat-section">
        <Chat messages={messages} onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}

export default App;
