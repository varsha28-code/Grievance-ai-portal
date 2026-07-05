import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiShield, FiLogOut, FiSettings, FiCheckCircle, FiClock, FiPlusCircle, FiActivity } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { fetchComplaints } from '../api';
import { Link } from 'react-router-dom';

const STATUS_LABELS = {
  registered: 'Registered',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  reopened: 'Reopened',
  verified: 'Verified',
};

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserActivity() {
      try {
        setLoading(true);
        const res = await fetchComplaints({ limit: 100 });
        const allComplaints = res.complaints || [];
        const mine = allComplaints.filter(c => c.citizen_email === user?.email);
        
        const list = [];
        mine.forEach(c => {
          list.push({
            label: 'Reported Grievance',
            sub: `${c.title} · ${c.ticket_id}`,
            time: new Date(c.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
            icon: FiPlusCircle,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
            link: `/complaint/${c.id}`
          });

          if (c.status !== 'registered') {
            list.push({
              label: `Status Updated: ${STATUS_LABELS[c.status] || c.status}`,
              sub: `Grievance ticket "${c.title}" status changed to ${STATUS_LABELS[c.status] || c.status}`,
              time: new Date(c.updated_at || c.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
              icon: c.status === 'resolved' ? FiCheckCircle : FiClock,
              color: c.status === 'resolved' ? 'text-green-500' : 'text-purple-500',
              bg: c.status === 'resolved' ? 'bg-green-500/10' : 'bg-purple-500/10',
              link: `/complaint/${c.id}`
            });
          }
        });

        // Sort by time
        const sorted = list.sort((a, b) => new Date(b.time) - new Date(a.time));
        setActivities(sorted.slice(0, 10)); // Top 10 activities
      } catch (error) {
        console.error("Error loading profile activities:", error);
      } finally {
        setLoading(false);
      }
    }

    if (user) loadUserActivity();
  }, [user]);

  const roleLabel = user?.role === 'admin' ? 'Administrator' : user?.role === 'officer' ? 'Officer' : 'Citizen';

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 overflow-hidden shadow-xl mb-8">
        <div className="h-32 bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600" />
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <div className="w-24 h-24 rounded-3xl bg-white dark:bg-gray-900 p-1.5 shadow-xl">
              <div className="w-full h-full rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-3xl font-black">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-1">{user?.name}</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium flex items-center gap-2 mb-6 capitalize px-2">
            <FiShield className="text-primary-500" /> {roleLabel} · Registered City Member
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
              <FiMail className="text-blue-500" />
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">Email</p>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
              <FiUser className="text-purple-500" />
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">User ID</p>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">#{user?.uid?.slice(-8).toUpperCase() || 'UNKNOWN'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 p-8 shadow-sm">
            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-6 uppercase tracking-wider flex items-center gap-3">
              <FiActivity className="text-primary-500 animate-pulse" /> Recent Portal Activity
            </h3>
            
            {loading ? (
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
                No recent activity logged. Use the portal to report and track issues.
              </div>
            ) : (
              <div className="space-y-6">
                {activities.map((act, i) => {
                  const Icon = act.icon;
                  const CardWrapper = act.link ? Link : 'div';
                  return (
                    <CardWrapper key={i} to={act.link || '#'} className={`flex gap-4 group ${act.link ? 'cursor-pointer' : ''}`}>
                      <div className={`w-10 h-10 rounded-xl ${act.bg} flex items-center justify-center ${act.color} group-hover:scale-110 transition-transform`}>
                        <Icon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-primary-600 truncate">{act.label}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{act.sub}</p>
                        <span className="text-[10px] text-gray-400 mt-1 block">{act.time}</span>
                      </div>
                    </CardWrapper>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Account Actions */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
            <h3 className="text-sm font-black text-gray-900 dark:text-white mb-4 uppercase tracking-wider">Account Actions</h3>
            <div className="space-y-2">
              <button 
                onClick={logout}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-bold text-red-600 transition-colors"
              >
                <FiLogOut /> Logout Session
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
