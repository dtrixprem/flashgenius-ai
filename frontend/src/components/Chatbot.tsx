'use client';

import { useState, useRef, useEffect } from 'react';
import { chatAPI } from '@/lib/api';
import { useTheme } from '@/hooks/useTheme';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Chatbot({ isOpen, onClose }: ChatbotProps) {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hi! I\'m your FlashGenius AI assistant. I can help you with study techniques, flashcard strategies, and learning tips. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [serviceStatus, setServiceStatus] = useState<'available' | 'unavailable' | 'checking'>('checking');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      checkServiceStatus();
    }
  }, [isOpen]);

  const checkServiceStatus = async () => {
    try {
      const response = await chatAPI.checkHealth();
      setServiceStatus(response.data.data.configured ? 'available' : 'unavailable');
    } catch (error) {
      setServiceStatus('unavailable');
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await chatAPI.sendMessage(inputMessage.trim(), messages);
      
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.data.data.message,
        timestamp: new Date(response.data.data.timestamp)
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Chat error:', error);
      
      let errorMessage = 'Sorry, I encountered an error. Please try again.';
      
      if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error.response?.status === 503) {
        errorMessage = 'AI chat service is temporarily unavailable. Please try again later.';
      } else if (error.response?.status === 429) {
        errorMessage = 'Too many requests. Please wait a moment before trying again.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Please log in to use the chat feature.';
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid message format. Please try rephrasing your question.';
      } else if (!navigator.onLine) {
        errorMessage = 'No internet connection. Please check your network and try again.';
      }

      const errorResponse: ChatMessage = {
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-80 h-96 bg-secondary border border-gray-600 rounded-xl shadow-2xl flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-600">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-accent-gradient rounded-full flex items-center justify-center">
            <span className="text-sm">🤖</span>
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm font-sans">AI Assistant</h3>
            <p className="text-xs text-white/75 font-mono">FlashGenius AI</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white/75 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg text-sm ${
                message.role === 'user'
                  ? 'bg-accent-gradient text-dominant font-sans'
                  : 'bg-dominant text-white border border-gray-600 font-mono'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              <p className={`text-xs mt-1 opacity-75 ${
                message.role === 'user' ? 'text-dominant/75' : 'text-white/50'
              }`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-dominant text-white border border-gray-600 p-3 rounded-lg text-sm font-mono">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-accent-start rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-accent-start rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-accent-start rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-600">
        <div className="flex space-x-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={serviceStatus === 'available' ? "Ask me about study techniques..." : serviceStatus === 'checking' ? "Checking service..." : "Service unavailable"}
            className="flex-1 bg-dominant text-white border border-gray-600 rounded-lg px-3 py-2 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-accent-start"
            rows={1}
            disabled={isLoading || serviceStatus !== 'available'}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading || serviceStatus !== 'available'}
            className="bg-accent-gradient text-dominant px-3 py-2 rounded-lg text-sm font-semibold font-sans disabled:opacity-50 hover:opacity-90 transition-all"
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}