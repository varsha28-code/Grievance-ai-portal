import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiBell, FiCheckCircle, FiClock, FiAlertCircle, FiInfo } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { fetchComplaints } from '../api';
import { Link } from 'react-router-dom';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNotifications() {
      try {
        setLoading(true);
        const res = await fetchComplaints({ limit: 100 });
        const allComplaints = res.complaints || [];
        
        // Filter citizen complaints by their email
        const myComplaints = allComplaints.filter(c => c.citizen_email === user?.email);
        
        const list = [];
        
        // Add a general welcome notification for everyone
        list.push({
          id: 'welcome',
          title: 'Welcome to Voice4City',
          message: 'Thank you for joining our mission to build a smarter, safer, and cleaner city together.',
          time: user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Recently',
          type: 'general',
          icon: FiInfo,
          color: 'text-purple-500',
          bg: 'bg-purple-500/10'
        });

        myComplaints.forEach(c => {
          // 1. Complaint Registered Notification
          list.push({
            id: c.id + '-registered',
            title: 'Complaint Registered',
            message: `Your report regarding "${c.title}" was successfully registered. Ticket ID: ${c.ticket_id}.`,
            time: new Date(c.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
            type: 'info',
            icon: FiInfo,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
            link: `/complaint/${c.id}`
          });

          // 2. Status Specific Notification if advanced
          if (c.status !== 'registered') {
            const statusLabels = {
              assigned: 'Officer Assigned',
              in_progress: 'Investigation In Progress',
              resolved: 'Complaint Resolved',
              reopened: 'Complaint Reopened',
              verified: 'Resolution Verified'
            };

            const statusMsgs = {
              assigned: `An officer has been assigned to your complaint "${c.title}" and is reviewing it.`,
              in_progress: `Maintenance crews are actively working on resolving your complaint "${c.title}".`,
              resolved: `Your report regarding "${c.title}" has been marked as resolved by municipal officers. Please verify.`,
              reopened: `Your complaint "${c.title}" has been reopened for further investigation.`,
              verified: `You have verified the fix for complaint "${c.title}". The ticket is now closed.`
            };

            list.push({
              id: c.id + '-' + c.status,
              title: statusLabels[c.status] || 'Status Updated',
              message: statusMsgs[c.status] || `Your complaint status has been updated to "${c.status.replace('_', ' ')}".`,
              time: new Date(c.updated_at || c.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
              type: c.status === 'resolved' ? 'success' : c.status === 'reopened' ? 'warning' : 'info',
              icon: c.status === 'resolved' ? FiCheckCircle : c.status === 'reopened' ? FiAlertCircle : FiClock,
              color: c.status === 'resolved' ? 'text-green-500' : c.status === 'reopened' ? 'text-amber-500' : 'text-indigo-500',
              bg: c.status === 'resolved' ? 'bg-green-500/10' : c.status === 'reopened' ? 'bg-amber-500/10' : 'bg-indigo-500/10',
              link: `/complaint/${c.id}`
            });
          }
        });

        // Sort notifications so that the latest ones appear first
        // We place welcome note at the bottom
        const sorted = list.sort((a, b) => {
          if (a.id === 'welcome') return 1;
          if (b.id === 'welcome') return -1;
          return new Date(b.time) - new Date(a.time);
        });

        setNotifications(sorted);
      } catch (err) {
        console.error("Error generating notifications:", err);
      } finally {
        setLoading(false);
      }
    }

    loadNotifications();
  }, [user]);

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

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="card text-center py-12 text-gray-500">
          <p>No notifications found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((note, i) => {
            const Icon = note.icon;
            const CardWrapper = note.link ? Link : 'div';
            return (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.05, 0.3) }}
              >
                <CardWrapper
                  to={note.link || '#'}
                  className={`group block relative bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all ${note.link ? 'cursor-pointer' : ''} overflow-hidden`}
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${note.color.replace('text', 'bg')}`} />
                  
                  <div className="flex gap-4 animate-fadeIn">
                    <div className={`w-12 h-12 ${note.bg} rounded-2xl flex items-center justify-center shrink-0`}>
                      <Icon className={note.color} size={22} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1 gap-4">
                        <h3 className="font-bold text-gray-900 dark:text-white truncate">{note.title}</h3>
                        <span className="text-xs text-gray-400 shrink-0">{note.time}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {note.message}
                      </p>
                    </div>
                  </div>
                </CardWrapper>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
