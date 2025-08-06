import React, { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const initializeChat = async () => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const welcomeMessage = {
        sender: 'bot',
        content: `Hello ${user?.name}! I'm your AI Career Counsellor. How can I help you today?`,
        timestamp: new Date().toISOString()
      };
      
      setSessionId('mock-session-id-12345');
      setMessages([welcomeMessage]);
    } catch (error) {
      console.error('Failed to initialize chat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (messageContent) => {
    if (!sessionId || !messageContent.trim()) return;

    try {
      // Add user message immediately
      const userMessage = {
        sender: 'user',
        content: messageContent,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMessage]);

      // Simulate API response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate mock bot response
      const botResponse = {
        sender: 'bot',
        content: generateMockResponse(messageContent),
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const generateMockResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('interest') || lowerMessage.includes('like')) {
      return "That's great! Understanding your interests is key to finding the right career path. Can you tell me more about what specifically interests you?";
    }
    
    if (lowerMessage.includes('skill') || lowerMessage.includes('good at')) {
      return "Excellent! Your skills are valuable assets. What are some things you feel you're particularly good at?";
    }
    
    if (lowerMessage.includes('career') || lowerMessage.includes('job')) {
      return "I'd love to help you explore career options! Based on what we discuss, I can suggest careers that match your profile. What type of work environment appeals to you?";
    }
    
    return "I understand. Let me help you explore your career options step by step. Would you like to start by telling me about your interests, or would you prefer to take a quick career assessment?";
  };

  const clearChat = () => {
    setMessages([]);
    setSessionId(null);
  };

  const value = {
    messages,
    sessionId,
    isLoading,
    sendMessage,
    initializeChat,
    clearChat
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
