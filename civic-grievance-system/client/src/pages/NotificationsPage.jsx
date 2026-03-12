import React from 'react';
import { motion } from 'framer-motion';
import { FiBell, FiCheckCircle, FiClock, FiAlertCircle, FiInfo } from 'react-icons/fi';

const NOTIFICATIONS = [
  {
    id: 1,
    title: 'Complaint Resolved',
    message: 'Your report regarding "Broken Streetlight on 5th Ave" has been marked as resolved.',
    time: '2 hours ago',
    type: 'success',
    icon: FiCheckCircle,
    color: 'text-green-500',
    bg: 'bg-green-500/10'
  },
  {
    id: 2,
    title: 'Officer Assigned',
    message: 'Officer Rajesh Kumar has been assigned to your grievance "Garbage Overflow near Park".',
    time: '5 hours ago',
    type: 'info',
    icon: FiClock,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10'
  },
  {
    id: 3,
    title: 'Urgent Alert',
    message: 'High flood warning issued for the Lowlands area. Please stay safe.',
    time: '1 day ago',
    type: 'warning',
    icon: FiAlertCircle,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10'
  },
  {
    id: 4,
    title: 'Welcome to Voice4City',
    message: 'Thank you for joining our mission to build a smarter city together.',
    time: '2 days ago',
    type: 'general',
    icon: FiInfo,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10'
  }
];

export default function NotificationsPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Notifications</h1>
          <p className="text-gray-500 dark:text-gray-400">Stay updated on your reports and city alerts</p>
        </div>
        <div className="bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 p-3 rounded-2xl">
          <FiBell size={24} />
        </div>
      </div>

      <div className="space-y-4">
        {NOTIFICATIONS.map((note, i) => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group relative bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
          >
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${note.color.replace('text', 'bg')}`} />
            
            <div className="flex gap-4">
              <div className={`w-12 h-12 ${note.bg} rounded-2xl flex items-center justify-center shrink-0`}>
                <note.icon className={note.color} size={22} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-gray-900 dark:text-white">{note.title}</h3>
                  <span className="text-xs text-gray-400">{note.time}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {note.message}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <button className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline">
          Mark all as read
        </button>
      </div>
    </div>
  );
}
