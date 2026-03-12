import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMic, FiMessageCircle, FiX, FiSend, FiZap, FiCpu, FiActivity } from 'react-icons/fi';

export default function AIAssistantPage() {
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hello! I'm your Voice4City AI Assistant. You can speak naturally to report issues, track complaints, or ask about city services. How can I assist you today?" }
  ]);
  const [inputText, setInputText] = useState('');

  const toggleListening = () => {
    setIsListening(!isListening);
    // In a real app, this would trigger Web Speech API
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    setMessages([...messages, { role: 'user', text: inputText }]);
    setInputText('');
    // Mock bot response
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'bot', text: "I've understood your query. I'm processing that information right now..." }]);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-gray-950 z-[60] flex flex-col items-center">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-blue-600/20 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />

      {/* Header */}
      <header className="relative w-full p-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <FiZap className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-white font-black text-xl tracking-tight leading-none">VoiceBot AI</h1>
            <p className="text-blue-400 text-[10px] font-bold uppercase tracking-widest mt-1">Immersive Mode</p>
          </div>
        </div>
        <button 
          onClick={() => window.history.back()}
          className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-colors"
        >
          <FiX size={20} />
        </button>
      </header>

      {/* Visualizer / Interaction Area */}
      <main className="flex-1 w-full max-w-4xl px-6 flex flex-col justify-center items-center relative gap-12">
        <motion.div 
          className="relative"
          animate={isListening ? { scale: [1, 1.1, 1] } : {}}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          {/* Pulsing rings */}
          {isListening && (
            <>
              <div className="absolute inset-0 bg-blue-500 rounded-full blur-3xl opacity-30 animate-pulse" />
              <div className="absolute -inset-8 border-2 border-blue-500/20 rounded-full animate-ping" />
              <div className="absolute -inset-16 border border-blue-500/10 rounded-full animate-ping [animation-delay:0.5s]" />
            </>
          )}

          <button 
            onClick={toggleListening}
            className={`relative w-40 h-40 rounded-full flex flex-col items-center justify-center transition-all duration-500 shadow-2xl
              ${isListening ? 'bg-white scale-110 shadow-blue-500/50' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/30'}`}
          >
            <FiMic size={48} className={isListening ? 'text-blue-600' : 'text-white'} />
            <p className={`text-[10px] font-black uppercase tracking-widest mt-3 ${isListening ? 'text-blue-600' : 'text-blue-100'}`}>
              {isListening ? 'Listening...' : 'Tap to Speak'}
            </p>
          </button>
        </motion.div>

        {/* Message Display */}
        <div className="w-full max-h-[30vh] overflow-y-auto space-y-4 px-4 scrollbar-hide">
          <AnimatePresence>
            {messages.slice(-2).map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-6 rounded-3xl max-w-xl mx-auto backdrop-blur-md
                  ${msg.role === 'bot' ? 'bg-white/10 border border-white/10 text-blue-100' : 'bg-blue-600 text-white ml-auto'}`}
              >
                <p className="text-center font-medium leading-relaxed uppercase text-xs tracking-wider opacity-60 mb-2">
                  {msg.role === 'bot' ? 'VoiceBot AI' : 'You'}
                </p>
                <p className="text-center text-lg md:text-xl font-bold">{msg.text}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>

      {/* Bottom Interface */}
      <footer className="w-full max-w-3xl p-8 z-10">
        <div className="bg-white/5 border border-white/10 p-2 rounded-[2rem] flex items-center shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-4 px-4">
            <FiMessageCircle className="text-blue-400" />
          </div>
          <input 
            type="text" 
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Type your civic grievance..." 
            className="flex-1 bg-transparent border-none outline-none text-white py-4 font-medium placeholder-white/30"
          />
          <button 
            onClick={handleSend}
            className="w-12 h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl flex items-center justify-center transition-all shadow-lg active:scale-95"
          >
            <FiSend />
          </button>
        </div>
        
        <div className="flex justify-center gap-8 mt-6">
          <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest">
            <FiCpu /> Neural Core Active
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest">
            <FiActivity /> 98% Accuracy
          </div>
        </div>
      </footer>
    </div>
  );
}
