import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMic, FiMessageCircle, FiX, FiSend, FiZap, FiCpu, FiActivity, FiVolume2, FiVolumeX } from 'react-icons/fi';
import { sendChatMessage } from '../api';

export default function AIAssistantPage() {
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hello! I'm your Voice4City AI Assistant. You can speak naturally to report issues, track complaints, or ask about city services. How can I assist you today?" }
  ]);
  const [inputText, setInputText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(true);
  const [sending, setSending] = useState(false);
  const recognitionRef = useRef(null);
  const chatEndRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          submitQuery(transcript);
        }
      };
      recognition.onerror = (err) => {
        console.error("Speech recognition error:", err);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSpeaking]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const speakText = (text) => {
    if (!isSpeaking || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      // Remove simple markdown markers before speaking
      const cleaned = text
        .replace(/[*_#`~]/g, '')
        .replace(/•/g, ', ')
        .trim();
      const utterance = new SpeechSynthesisUtterance(cleaned);
      utterance.lang = 'en-IN';
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("Speech synthesis failed:", e);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please type your query.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      recognitionRef.current.start();
    }
  };

  const submitQuery = async (queryText) => {
    if (!queryText.trim()) return;
    
    // Add user message
    setMessages(prev => [...prev, { role: 'user', text: queryText }]);
    setInputText('');
    setSending(true);

    try {
      const data = await sendChatMessage(queryText);
      const botResponse = data.reply;
      
      setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
      speakText(botResponse);
    } catch (error) {
      console.error("Error communicating with AI chatbot:", error);
      const errMsg = "I encountered an error connecting to local city service modules. Please try again.";
      setMessages(prev => [...prev, { role: 'bot', text: errMsg }]);
      speakText(errMsg);
    } finally {
      setSending(false);
    }
  };

  const handleSend = () => {
    if (inputText.trim()) {
      submitQuery(inputText);
    }
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
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              const speakVal = !isSpeaking;
              setIsSpeaking(speakVal);
              if (!speakVal && window.speechSynthesis) window.speechSynthesis.cancel();
            }}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-colors"
            title={isSpeaking ? "Mute responses" : "Unmute responses"}
          >
            {isSpeaking ? <FiVolume2 size={20} /> : <FiVolumeX size={20} />}
          </button>
          <button 
            onClick={() => window.history.back()}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-colors"
            title="Go Back"
          >
            <FiX size={20} />
          </button>
        </div>
      </header>

      {/* Visualizer / Interaction Area */}
      <main className="flex-1 w-full max-w-4xl px-6 flex flex-col justify-center items-center relative gap-8 min-h-0">
        <motion.div 
          className="relative mt-4 shrink-0"
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
        <div className="w-full flex-1 overflow-y-auto space-y-4 px-4 scrollbar-hide py-4 min-h-0">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-6 rounded-3xl max-w-xl mx-auto backdrop-blur-md border ${
                  msg.role === 'bot' 
                    ? 'bg-white/5 border-white/5 text-blue-100' 
                    : 'bg-blue-600 border-blue-600 text-white ml-auto'
                }`}
              >
                <p className={`font-semibold leading-relaxed uppercase text-[10px] tracking-wider opacity-60 mb-2 ${
                  msg.role === 'bot' ? 'text-left' : 'text-right'
                }`}>
                  {msg.role === 'bot' ? 'VoiceBot AI' : 'You'}
                </p>
                <p className="text-left text-sm md:text-base font-bold whitespace-pre-line leading-relaxed">
                  {msg.text}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={chatEndRef} />
        </div>
      </main>

      {/* Bottom Interface */}
      <footer className="w-full max-w-3xl p-6 z-10 shrink-0">
        <div className="bg-white/5 border border-white/10 p-2 rounded-[2rem] flex items-center shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-4 px-4">
            <FiMessageCircle className="text-blue-400" />
          </div>
          <input 
            type="text" 
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Type your query or click mic..." 
            className="flex-1 bg-transparent border-none outline-none text-white py-3 font-medium placeholder-white/30 text-sm focus:ring-0"
            disabled={sending}
          />
          <button 
            onClick={handleSend}
            disabled={sending || !inputText.trim()}
            className="w-12 h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl flex items-center justify-center transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            <FiSend />
          </button>
        </div>
        
        <div className="flex justify-center gap-8 mt-4">
          <div className="flex items-center gap-2 text-[9px] font-bold text-white/40 uppercase tracking-widest">
            <FiCpu /> SQLite Chat Core Active
          </div>
          <div className="flex items-center gap-2 text-[9px] font-bold text-white/40 uppercase tracking-widest">
            <FiActivity /> Live Recognition
          </div>
        </div>
      </footer>
    </div>
  );
}
