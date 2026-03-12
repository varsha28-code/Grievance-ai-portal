import React from 'react';
import { motion } from 'framer-motion';
import { FiAlertOctagon, FiCamera, FiMapPin, FiMic, FiSend } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

export default function EmergencyPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-red-600 rounded-[3rem] p-8 md:p-12 text-white shadow-2xl shadow-red-500/30 mb-8 overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <FiAlertOctagon size={200} />
        </div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
            <span className="w-2 h-2 bg-white rounded-full animate-ping" />
            Urgent Response Active
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">Emergency Report</h1>
          <p className="text-red-100 text-lg md:text-xl max-w-xl leading-relaxed">
            Report hazards that require immediate attention (Flooding, Electrical Fire, Building Collapse, Open Manholes).
          </p>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 p-8 shadow-sm">
          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <FiCamera className="text-red-500" /> Quick Snapshot
          </h3>
          <div className="aspect-video rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors cursor-pointer group">
            <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <FiCamera size={32} className="text-gray-400 group-hover:text-red-500" />
            </div>
            <p className="text-sm font-bold text-gray-500">Tap to Capture Hazard</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 p-8 shadow-sm">
          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <FiMic className="text-blue-500" /> Describe via Voice
          </h3>
          <button className="w-full py-12 rounded-3xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 flex flex-col items-center justify-center gap-4 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all group">
            <div className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-xl shadow-blue-500/40 group-hover:scale-110 transition-all">
              <FiMic size={32} />
            </div>
            <p className="text-sm font-bold text-blue-600 dark:text-blue-400">Press and Hold to Speak</p>
          </button>
        </div>
      </div>

      <div className="mt-8 bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 p-8 shadow-sm">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-400">
            <FiMapPin className="text-red-500" />
            <span className="text-sm font-medium">Auto-capturing GPS coordinates...</span>
          </div>
          <button 
            onClick={() => navigate('/report')}
            className="w-full py-5 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black text-lg flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
          >
            <FiSend /> Send SOS Dispatch
          </button>
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-gray-400 font-medium">
        * SOS dispatch triggers immediate notification to the Disaster Management Cell.
      </p>
    </div>
  );
}
