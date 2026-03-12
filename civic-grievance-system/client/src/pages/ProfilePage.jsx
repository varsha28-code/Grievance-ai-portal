import React from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiMapPin, FiClock, FiShield, FiEdit3, FiLogOut, FiSettings, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 overflow-hidden shadow-xl mb-8">
        <div className="h-32 bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600" />
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <div className="w-24 h-24 rounded-3xl bg-white dark:bg-gray-900 p-1.5 shadow-xl">
              <div className="w-full h-full rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-3xl font-black">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
            </div>
            <button className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-5 py-2.5 rounded-xl text-xs font-bold transition-all">
              <FiEdit3 /> Edit Profile
            </button>
          </div>

          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-1">{user?.name}</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium flex items-center gap-2 mb-6 capitalize px-2">
            <FiShield className="text-primary-500" /> {user?.role} · Registered Citizen
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
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">#{user?.uid?.slice(-8).toUpperCase()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 p-8 shadow-sm">
            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-6 uppercase tracking-wider flex items-center gap-3">
              <FiCheckCircle className="text-green-500" /> Recent Activity
            </h3>
            <div className="space-y-6">
              {[
                { label: 'Grievance Reported', sub: 'Pothole Alert · #Ticket-8821', time: '2 days ago', icon: FiClock },
                { label: 'Feedback Submitted', sub: 'Resolution rating for Water Leakage', time: '5 days ago', icon: FiMessageSquare },
              ].map((act, i) => (
                <div key={i} className="flex gap-4 group cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 flex items-center justify-center text-gray-400 group-hover:text-primary-500 group-hover:bg-primary-50 transition-all">
                    <act.icon size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-primary-600">{act.label}</h4>
                    <p className="text-xs text-gray-500">{act.sub}</p>
                    <span className="text-[10px] text-gray-400 mt-1 block">{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
            <h3 className="text-sm font-black text-gray-900 dark:text-white mb-4 uppercase tracking-wider">Account Actions</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 text-sm font-bold text-gray-600 dark:text-gray-400 transition-colors">
                <FiSettings /> Settings
              </button>
              <button 
                onClick={logout}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 text-sm font-bold text-red-600 transition-colors"
              >
                <FiLogOut /> Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import { FiMessageSquare } from 'react-icons/fi';
