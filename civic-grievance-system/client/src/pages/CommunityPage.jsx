import React from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiMessageSquare, FiThumbsUp, FiMapPin, FiClock } from 'react-icons/fi';

const COMMUNITY_POSTS = [
  {
    id: 1,
    user: 'Amit Sharma',
    avatar: 'A',
    location: 'Indiranagar',
    issue: 'Illegal Parking at Main Market',
    content: 'Multiple vehicles are parked illegally on the pedestrian walkway, making it impossible for elderly citizens to walk safely.',
    votes: 45,
    comments: 12,
    time: '3 hours ago',
    status: 'In Progress',
    color: 'blue'
  },
  {
    id: 2,
    user: 'Priya Verma',
    avatar: 'P',
    location: 'Koramangala',
    issue: 'Water Pipeline Leakage',
    content: 'Massive water leakage near the 80ft road intersection. Thousands of liters being wasted for the last 12 hours.',
    votes: 89,
    comments: 24,
    time: '5 hours ago',
    status: 'Critical',
    color: 'red'
  },
  {
    id: 3,
    user: 'Suresh Raina',
    avatar: 'S',
    location: 'HSR Layout',
    issue: 'Streetlight Not Working',
    content: 'Sector 2, Lane 4 has no working streetlights for the past week. Very unsafe for women and children at night.',
    votes: 32,
    comments: 8,
    time: 'yesterday',
    status: 'Assigned',
    color: 'amber'
  }
];

export default function CommunityPage() {
  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Community Reports</h1>
          <p className="text-gray-500 dark:text-gray-400">See what's happening in your neighborhood and support important issues.</p>
        </div>
        <div className="bg-pink-500/10 text-pink-500 p-4 rounded-3xl flex items-center gap-3">
          <FiUsers size={28} />
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-wider opacity-70">Active Citizens</p>
            <p className="text-xl font-black">2.4K</p>
          </div>
        </div>
      </div>

      <div className="grid gap-8">
        {COMMUNITY_POSTS.map((post, i) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all p-6 md:p-8"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center font-bold text-gray-600 dark:text-gray-300">
                {post.avatar}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 dark:text-white">{post.user}</h3>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><FiMapPin size={12} /> {post.location}</span>
                  <span className="flex items-center gap-1"><FiClock size={12} /> {post.time}</span>
                </div>
              </div>
              <span className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider
                ${post.color === 'red' ? 'bg-red-500/10 text-red-500' : 
                  post.color === 'blue' ? 'bg-blue-500/10 text-blue-500' : 
                  'bg-amber-500/10 text-amber-500'}`}>
                {post.status}
              </span>
            </div>

            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-3">{post.issue}</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              {post.content}
            </p>

            <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-6">
                <button className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-pink-500 transition-colors">
                  <FiThumbsUp size={18} /> {post.votes} Votes
                </button>
                <button className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-500 transition-colors">
                  <FiMessageSquare size={18} /> {post.comments} Comments
                </button>
              </div>
              <button className="text-sm font-bold text-primary-600 hover:text-primary-700">View Details</button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
