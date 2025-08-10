import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext.js';
import { apiConfig, apiCall } from '../../config/api.js';

const Chat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    initializeChatSession();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChatSession = async () => {
    try {
      console.log('🚀 Initializing chat session...');
      
      // Try to start real session first
      try {
        const response = await apiCall('/api/chat/start-session', {
          method: 'POST',
          body: JSON.stringify({
            userId: user?._id || 'demo-user',
            userName: user?.name || 'User'
          })
        });

        if (response.success) {
          setSessionId(response.sessionId);
          setIsConnected(true);
          console.log('✅ Chat session established:', response.sessionId);
        }
      } catch (error) {
        console.warn('Real chat unavailable, using demo mode');
        setSessionId('demo-session-' + Date.now());
        setIsConnected(false);
      }

      // Add welcome message
      setMessages([
        {
          id: 1,
          sender: 'ai',
          content: `Hello ${user?.name || 'there'}! 👋 I'm your AI Career Counselor. I'm here to help you with career guidance, job searching, skill development, and professional growth. What would you like to discuss today?`,
          timestamp: new Date(),
          type: 'welcome'
        }
      ]);
    } catch (error) {
      console.error('Failed to initialize chat session:', error);
      setMessages([
        {
          id: 1,
          sender: 'ai',
          content: 'Welcome to Career Counseling Chat! I\'m currently in demo mode, but I can still help you with career advice. What would you like to know?',
          timestamp: new Date(),
          type: 'error'
        }
      ]);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      if (isConnected) {
        // Try real API call
        const response = await apiCall('/api/chat/function-call', {
          method: 'POST',
          body: JSON.stringify({
            sessionId,
            message: inputMessage,
            userId: user?._id || 'demo-user'
          })
        });

        if (response.success) {
          const aiMessage = {
            id: Date.now() + 1,
            sender: 'ai',
            content: response.message,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, aiMessage]);
        }
      } else {
        // Demo responses
        await simulateAIResponse(inputMessage);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      await simulateAIResponse(inputMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const simulateAIResponse = async (userInput) => {
    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const responses = {
      career: "Based on your interests, I'd recommend exploring roles in software development, data analysis, or product management. What specific area interests you most?",
      job: "Job searching can be challenging! I suggest: 1) Tailoring your resume for each application, 2) Networking on LinkedIn, 3) Practicing interview skills. Which area would you like to focus on?",
      skills: "Developing skills is crucial for career growth. Based on current market trends, I recommend focusing on: technical skills (programming, data analysis), soft skills (communication, leadership), and industry-specific knowledge. What's your current skill level?",
      interview: "Interview preparation is key! Here are my top tips: 1) Research the company thoroughly, 2) Prepare STAR method examples, 3) Practice common questions, 4) Prepare thoughtful questions to ask. Would you like me to help you practice?",
      resume: "A strong resume should highlight your achievements with quantifiable results. Focus on: 1) Clear formatting, 2) Relevant keywords, 3) Action verbs, 4) Tailored content. Would you like me to review specific sections?",
      default: "That's a great question! As your AI career counselor, I can help with job searching, skill development, interview preparation, career planning, and resume optimization. What specific aspect would you like to explore?"
    };

    const input = userInput.toLowerCase();
    let response = responses.default;

    if (input.includes('career') || input.includes('path')) response = responses.career;
    else if (input.includes('job') || input.includes('work')) response = responses.job;
    else if (input.includes('skill') || input.includes('learn')) response = responses.skills;
    else if (input.includes('interview')) response = responses.interview;
    else if (input.includes('resume') || input.includes('cv')) response = responses.resume;

    const aiMessage = {
      id: Date.now() + 1,
      sender: 'ai',
      content: response,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, aiMessage]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    "Help me find a career path",
    "Review my resume",
    "Prepare for interviews",
    "Improve my skills",
    "Find job opportunities"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-xl">🤖</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Career Counselor</h1>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-orange-500'} animate-pulse`}></div>
                  <span className={`text-sm font-medium ${isConnected ? 'text-green-600' : 'text-orange-600'}`}>
                    {isConnected ? 'Connected' : 'Demo Mode'}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Session: {sessionId?.substring(0, 8)}...
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Chat Container */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Messages Area */}
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : message.type === 'welcome'
                    ? 'bg-gradient-to-r from-green-100 to-blue-100 text-gray-800 border border-green-200'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg max-w-xs">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length === 1 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-3">Quick questions to get started:</p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInputMessage(question);
                      setTimeout(() => sendMessage(), 100);
                    }}
                    className="px-3 py-1 text-xs bg-white border border-gray-300 rounded-full hover:bg-blue-50 hover:border-blue-300 transition-colors duration-200"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-6 border-t border-gray-200">
            <div className="flex space-x-4">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your career..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Send'
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">Press Enter to send • Shift+Enter for new line</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
