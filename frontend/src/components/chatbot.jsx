import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import "../styles/chatbotmodal.css";

const fast_url = import.meta.env.VITE_FAST_URL;

export default function ChatbotModal({ icon }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    const saved = sessionStorage.getItem("chat_history");
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    sessionStorage.setItem("chat_history", JSON.stringify(messages));
  }, [messages]);

  const toggleModal = () => setIsOpen((prev) => !prev);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    try {
      const { data } = await axios.post(`${fast_url}/chatbot`, {
        message: input,
      });

      const botMsg = { sender: "bot", text: data.reply };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errorMsg = { sender: "bot", text: "Error connecting to server." };
      setMessages((prev) => [...prev, errorMsg]);
      console.error(err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <>
      {/* Custom Robo Icon */}
      <div className="chatbot-toggle" onClick={toggleModal}>
        <img src={icon} alt="Chatbot" />
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="chatbot-modal">
          <div className="chatbot-header">
            <button className="close-btn" onClick={toggleModal}>
              ✖
            </button>
          </div>

          <div className="chatbot-body">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`chat-message ${
                  msg.sender === "user" ? "user" : "bot"
                }`}
              >
                {msg.sender === "bot" ? (
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                ) : (
                  msg.text
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="chatbot-footer">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message..."
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </>
  );
}
