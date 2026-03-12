import React, { useState, useRef, useEffect } from 'react';
import { FiX, FiSend, FiMessageCircle } from 'react-icons/fi';
import { sendChatMessage } from '../api';

export default function Chatbot({ onClose }) {
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hello! 👋 I'm **VoiceBot**, your civic grievance assistant. How can I help you today?\n\nYou can:\n• Report a new complaint\n• Track an existing complaint\n• Learn about complaint categories\n• Get help with the platform" },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(['Report an issue', 'Track complaint', 'View categories', 'How escalation works']);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text) => {
    const msgText = text || input.trim();
    if (!msgText) return;

    setMessages(prev => [...prev, { role: 'user', text: msgText }]);
    setInput('');
    setLoading(true);

    try {
      const data = await sendChatMessage(msgText);
      setMessages(prev => [...prev, { role: 'bot', text: data.response }]);
      setSuggestions(data.suggestions || []);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: "Sorry, I'm having trouble connecting. Please try again." }]);
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Simple markdown bold
  const formatText = (text) => {
    return text.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line.split(/\*\*(.*?)\*\*/g).map((part, j) =>
          j % 2 === 1 ? <strong key={j}>{part}</strong> : part
        )}
        {i < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 flex flex-col animate-slideIn" style={{ height: '500px' }}>
      {/* Header */}
      <div className="bg-primary-600 text-white px-4 py-3 rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FiMessageCircle size={20} />
          <div>
            <h3 className="font-semibold text-sm">CivicBot</h3>
            <p className="text-xs text-primary-200">AI Complaint Assistant</p>
          </div>
        </div>
        <button onClick={onClose} className="hover:bg-primary-500 rounded-full p-1 transition-colors">
          <FiX size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
              msg.role === 'user'
                ? 'bg-primary-600 text-white rounded-br-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-md'
            }`}>
              {formatText(msg.text)}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-bl-md px-4 py-3 text-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="px-4 pb-2 flex flex-wrap gap-1.5">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => handleSend(s)}
              className="text-xs bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-3 py-1.5 rounded-full hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-3">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 text-sm border border-gray-300 dark:border-gray-600 rounded-full px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            disabled={loading}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="w-9 h-9 bg-primary-600 text-white rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            <FiSend size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
