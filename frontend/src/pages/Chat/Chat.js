import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';
import './Chat.css';

const Chat = () => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { user } = useAuth();
  const { messages, sendMessage, initializeChat, sessionId } = useChat();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    initializeChat();
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || isTyping) return;

    setIsTyping(true);
    await sendMessage(message);
    setMessage('');
    setIsTyping(false);
    inputRef.current?.focus();
  };

  const handleOptionClick = async (option) => {
    if (isTyping) return;
    setIsTyping(true);
    await sendMessage(option);
    setIsTyping(false);
  };

  const renderMessage = (msg, index) => {
    return (
      <div key={index} className={`message-wrapper ${msg.sender}`}>
        <div className="message-bubble">
          <p className="message-text">{msg.content}</p>
          <div className="message-time">
            {new Date(msg.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="chat-page">
      <div className="chat-container">
        <div className="chat-header">
          <div className="chat-header-content">
            <div className="counselor-info">
              <div className="counselor-avatar">🤖</div>
              <div className="counselor-details">
                <h3 className="counselor-name">AI Career Counsellor</h3>
                <p className="counselor-status">Online • Ready to help</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="messages-container">
          {messages.length === 0 && (
            <div className="welcome-section">
              <div className="welcome-avatar">🎯</div>
              <h4 className="welcome-title">Welcome, {user?.name}!</h4>
              <p className="welcome-description">
                I'm here to help you explore career paths. Let's start by getting to know you better!
              </p>
            </div>
          )}
          
          {messages.map((msg, index) => renderMessage(msg, index))}
          
          {isTyping && (
            <div className="message-wrapper bot">
              <div className="message-bubble typing-bubble">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span className="typing-text">AI Counsellor is typing...</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <div className="message-input-container">
          <form className="message-input-form" onSubmit={handleSendMessage}>
            <div className="input-wrapper">
              <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                disabled={isTyping}
                className="message-input"
              />
              <button 
                type="submit" 
                disabled={isTyping || !message.trim()}
                className="send-button"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
