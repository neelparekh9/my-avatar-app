import React, { useEffect, useRef, useState } from "react";

const Chat = ({ messages, onSendMessage }) => {
  const [inputValue, setInputValue] = useState("");

  const chatBoxRef = useRef(null);

  useEffect(() => {
    // Whenever the messages change, scroll to the bottom of the chat box
    if(chatBoxRef.current) {
      //scroll down smoothly
      chatBoxRef.current.scrollTo({
        top: chatBoxRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages])

  const handleSend = () => {
    if (inputValue.trim() === "") return;
    onSendMessage(inputValue);
    setInputValue("");
  };

  return (
    <div className="chat-section">
      <div ref={chatBoxRef} className="chat-box">
        {messages.map((message, index) => (
          <div key={index} className={`chat-message ${message.sender}`}>
            <span>{message.text}</span>
          </div>
        ))}
      </div>

      <div className="input-section">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type a message..."
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleSend();
            }
          }}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
