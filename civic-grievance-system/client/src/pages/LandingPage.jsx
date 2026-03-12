import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiArrowRight, FiShield, FiBarChart2, FiMessageCircle,
  FiCheckCircle, FiZap, FiCpu, FiMapPin, FiTrendingUp,
  FiMic, FiSun, FiMoon, FiSearch, FiUploadCloud, FiMap,
  FiAlertOctagon, FiUser, FiBell, FiUsers, FiActivity,
  FiAlertCircle, FiPieChart
} from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

/* ─────────────────────────────────────────
   10 MAIN NAVIGATION FEATURES
───────────────────────────────────────── */
const NAV_BUTTONS = [
  {
    icon: FiBarChart2,
    label: 'Dashboard',
    description: 'City-wide complaint stats and analytics cards',
    to: '/login',
    gradient: 'from-blue-500 to-blue-700',
    shadow: 'shadow-blue-500/30',
    badge: null,
  },
  {
    icon: FiUploadCloud,
    label: 'Report Issue',
    description: 'Upload photo, describe and auto-capture location',
    to: '/register',
    gradient: 'from-green-500 to-emerald-600',
    shadow: 'shadow-green-500/30',
    badge: 'Primary',
  },
  {
    icon: FiSearch,
    label: 'Track Complaint',
    description: 'Enter your complaint ID and track status in real time',
    to: '/login',
    gradient: 'from-cyan-500 to-sky-600',
    shadow: 'shadow-cyan-500/30',
    badge: null,
  },
  {
    icon: FiMessageCircle,
    label: 'AI Assistant',
    description: 'Chatbot guides you through reporting and answers queries',
    to: '/login',
    gradient: 'from-violet-500 to-purple-700',
    shadow: 'shadow-violet-500/30',
    badge: 'AI',
  },
  {
    icon: FiMap,
    label: 'City Map',
    description: 'Live interactive map with color-coded issue markers',
    to: '/login',
    gradient: 'from-teal-500 to-green-600',
    shadow: 'shadow-teal-500/30',
    badge: 'Live',
  },
  {
    icon: FiBell,
    label: 'Notifications',
    description: 'Updates on complaint progress and government alerts',
    to: '/login',
    gradient: 'from-amber-500 to-orange-500',
    shadow: 'shadow-amber-500/30',
    badge: null,
  },
  {
    icon: FiUsers,
    label: 'Community Reports',
    description: "See others' complaints and vote for important issues",
    to: '/login',
    gradient: 'from-pink-500 to-rose-500',
    shadow: 'shadow-pink-500/30',
    badge: null,
  },
  {
    icon: FiAlertOctagon,
    label: 'Emergency Report',
    description: 'Quick-report urgent hazards: flooding, electrical, collapse',
    to: '/register',
    gradient: 'from-red-500 to-rose-700',
    shadow: 'shadow-red-500/30',
    badge: 'Urgent',
  },
  {
    icon: FiPieChart,
    label: 'Analytics',
    description: 'Hotspot maps, department performance and civic trends',
    to: '/login',
    gradient: 'from-indigo-500 to-blue-700',
    shadow: 'shadow-indigo-500/30',
    badge: null,
  },
  {
    icon: FiUser,
    label: 'User Profile',
    description: 'Complaint history, account details and settings',
    to: '/login',
    gradient: 'from-slate-500 to-gray-700',
    shadow: 'shadow-slate-500/30',
    badge: null,
  },
];

const STATS = [
  { value: '10K+', label: 'Complaints Resolved', icon: FiCheckCircle, lightColor: 'text-green-600', darkColor: 'text-green-400' },
  { value: '95%', label: 'Resolution Rate', icon: FiTrendingUp, lightColor: 'text-blue-600', darkColor: 'text-blue-400' },
  { value: '48h', label: 'Avg Response Time', icon: FiActivity, lightColor: 'text-amber-600', darkColor: 'text-amber-400' },
  { value: '50+', label: 'Departments Connected', icon: FiUsers, lightColor: 'text-purple-600', darkColor: 'text-purple-400' },
];

export default function LandingPage() {
  const { darkMode } = useTheme();
  const [trackId, setTrackId] = useState('');
  const navigate = useNavigate();

  const handleTrack = () => {
    if (trackId.trim()) navigate('/login');
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>

      {/* ─── NAVBAR ─────────────────────────────────── */}
      <nav className={`fixed top-0 inset-x-0 z-50 backdrop-blur-xl border-b transition-colors duration-300
        ${darkMode ? 'bg-gray-950/80 border-white/5' : 'bg-white/80 border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <FiShield size={18} className="text-white" />
            </div>
            <div>
              <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>CivicResolve</span>
              <p className="text-[10px] text-gray-500 -mt-0.5">Smart Grievance Management</p>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-gray-500 hover:text-blue-600 transition-colors font-medium">Features</a>
            <a href="#how-steps" className="text-sm text-gray-500 hover:text-blue-600 transition-colors font-medium">How It Works</a>
            <a href="#stats" className="text-sm text-gray-500 hover:text-blue-600 transition-colors font-medium">Impact</a>
            <LandingThemeToggle />
            <Link to="/login" className="text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors">Sign In</Link>
            <Link to="/register" className="text-sm bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-semibold px-5 py-2 rounded-xl shadow-md hover:scale-105 transition-all">
              Get Started
            </Link>
          </div>

          <div className="md:hidden flex items-center gap-3">
            <LandingThemeToggle />
            <Link to="/login" className="text-sm text-blue-600 font-semibold">Sign In</Link>
            <Link to="/register" className="text-sm bg-blue-600 text-white font-semibold px-4 py-1.5 rounded-lg">Register</Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ───────────────────────────────────── */}
      <section className="relative pt-28 pb-12 overflow-hidden">
        {/* Background decoration */}
        <div className={`absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none ${darkMode ? 'bg-blue-600/20' : 'bg-blue-200/60'}`} />
        <div className={`absolute -bottom-20 -right-20 w-[400px] h-[400px] rounded-full blur-[120px] pointer-events-none ${darkMode ? 'bg-cyan-500/15' : 'bg-cyan-200/40'}`} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-12">
            {/* Badge */}
            <div className={`inline-flex items-center gap-2 border text-xs font-semibold px-4 py-2 rounded-full mb-6 backdrop-blur-sm
              ${darkMode ? 'bg-blue-500/10 border-blue-500/20 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
              <FiZap size={12} /> AI-Powered Civic Governance Platform
            </div>

            <h1 className={`text-5xl lg:text-7xl font-extrabold leading-tight mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Report. Track.{' '}
              <span className="bg-gradient-to-r from-blue-500 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                Resolve.
              </span>
            </h1>

            <p className={`text-lg max-w-2xl mx-auto mb-8 leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Empowering citizens to report urban civic issues and ensuring faster, transparent resolution by government authorities through AI-powered automation.
            </p>

            {/* Quick Actions Row */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <Link to="/register"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold px-7 py-3.5 rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 transition-all text-sm">
                <FiUploadCloud size={18} /> Report an Issue <FiArrowRight size={16} />
              </Link>

              <div className={`flex items-center gap-0 border rounded-2xl overflow-hidden max-w-xs w-full sm:w-auto
                ${darkMode ? 'bg-white/5 border-white/10 focus-within:border-blue-500/40' : 'bg-white border-gray-300 focus-within:border-blue-400 shadow-sm'}`}>
                <FiSearch size={16} className="text-gray-400 ml-4 shrink-0" />
                <input
                  type="text"
                  value={trackId}
                  onChange={e => setTrackId(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleTrack()}
                  placeholder="Track by Complaint ID..."
                  className={`flex-1 bg-transparent border-none text-sm px-3 py-3.5 outline-none
                    ${darkMode ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}`}
                />
                <button onClick={handleTrack}
                  className={`text-sm font-semibold px-4 py-3.5 border-l transition-colors
                    ${darkMode ? 'border-white/10 text-blue-400 hover:bg-white/10' : 'border-gray-200 text-blue-600 hover:bg-blue-50'}`}>
                  Track
                </button>
              </div>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-5 text-sm text-gray-500">
              <span className="flex items-center gap-1.5"><FiCheckCircle className="text-green-500" size={14} /> Free to use</span>
              <span className="flex items-center gap-1.5"><FiCheckCircle className="text-green-500" size={14} /> No app install</span>
              <span className="flex items-center gap-1.5"><FiCheckCircle className="text-green-500" size={14} /> Instant AI routing</span>
              <span className="flex items-center gap-1.5"><FiCheckCircle className="text-green-500" size={14} /> Voice enabled</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS BAR ──────────────────────────────── */}
      <section id="stats" className={`py-12 border-y transition-colors duration-300
        ${darkMode ? 'bg-white/3 border-white/5' : 'bg-white border-gray-100 shadow-sm'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((s, i) => (
              <div key={i} className="text-center group">
                <s.icon size={26} className={`mx-auto mb-3 group-hover:scale-110 transition-transform ${darkMode ? s.darkColor : s.lightColor}`} />
                <div className={`text-3xl font-extrabold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{s.value}</div>
                <div className="text-gray-500 text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 10 MAIN NAVIGATION BUTTONS ─────────────── */}
      <section id="features" className="py-20 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div className={`inline-flex items-center gap-2 border text-xs font-semibold px-4 py-2 rounded-full mb-5
              ${darkMode ? 'bg-blue-500/10 border-blue-500/20 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
              <FiCpu size={12} /> Platform Features
            </div>
            <h2 className={`text-4xl lg:text-5xl font-extrabold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Everything You Need in One Platform
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Click any feature below to get started — accessible to every citizen, anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {NAV_BUTTONS.map((btn, i) => (
              <Link
                key={i}
                to={btn.to}
                className={`group relative flex flex-col items-center text-center p-6 rounded-3xl border transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl cursor-pointer overflow-hidden
                  ${darkMode
                    ? 'bg-white/5 border-white/8 hover:border-white/20 hover:bg-white/10'
                    : 'bg-white border-gray-100 hover:border-blue-200 shadow-sm hover:shadow-blue-100'
                  }`}
              >
                {/* Gradient glow overlay on hover */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br ${btn.gradient} rounded-3xl`} />

                {/* Icon */}
                <div className={`relative w-16 h-16 bg-gradient-to-br ${btn.gradient} rounded-2xl flex items-center justify-center mb-4 shadow-lg ${btn.shadow} group-hover:scale-110 transition-transform duration-300`}>
                  <btn.icon size={28} className="text-white" />
                </div>

                {/* Badge */}
                {btn.badge && (
                  <span className={`absolute top-4 right-4 text-[10px] font-bold px-2 py-0.5 rounded-full text-white bg-gradient-to-r ${btn.gradient}`}>
                    {btn.badge}
                  </span>
                )}

                <h3 className={`font-bold text-base mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{btn.label}</h3>
                <p className={`text-xs leading-relaxed ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{btn.description}</p>

                {/* Arrow */}
                <div className={`mt-4 flex items-center gap-1 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0
                  bg-gradient-to-r ${btn.gradient} bg-clip-text text-transparent`}>
                  Open <FiArrowRight size={12} className="text-blue-500" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── DASHBOARD PREVIEW ──────────────────────── */}
      <section className={`py-20 transition-colors duration-300 ${darkMode ? 'bg-white/2 border-y border-white/5' : 'bg-gray-100 border-y border-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <div className={`inline-flex items-center gap-2 border text-xs font-semibold px-4 py-2 rounded-full mb-6
                ${darkMode ? 'bg-green-500/10 border-green-500/20 text-green-300' : 'bg-green-50 border-green-200 text-green-700'}`}>
                <FiBarChart2 size={12} /> Live Dashboard Overview
              </div>
              <h2 className={`text-3xl lg:text-4xl font-extrabold mb-5 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Track City Health with{' '}
                <span className="bg-gradient-to-r from-green-500 to-cyan-500 bg-clip-text text-transparent">
                  Real-Time Analytics
                </span>
              </h2>
              <p className={`text-base leading-relaxed mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Our intelligent dashboard gives city administrators and citizens a live view of complaint status, resolution rates, department performance, and geographic hotspots.
              </p>
              <div className="space-y-4">
                {['Total complaints overview with filtering', 'AI priority ranking — critical to low severity', 'Department-wise resolution rate analytics', 'Officer performance & turnaround tracking'].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <FiCheckCircle className="text-green-500 mt-0.5 shrink-0" size={18} />
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{item}</span>
                  </div>
                ))}
              </div>
              <Link to="/login" className="inline-flex items-center gap-2 mt-8 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold px-7 py-3 rounded-xl shadow-lg shadow-green-500/25 hover:scale-105 transition-all text-sm">
                View Dashboard <FiArrowRight />
              </Link>
            </div>

            {/* Dashboard Card */}
            <div className="relative">
              <div className={`absolute inset-0 rounded-3xl blur-2xl scale-105 ${darkMode ? 'bg-blue-500/10' : 'bg-blue-100'}`} />
              <div className={`relative rounded-3xl p-7 shadow-2xl border backdrop-blur-xl
                ${darkMode ? 'bg-gray-900/80 border-white/10' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center justify-between mb-6">
                  <span className={`text-sm font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>City Dashboard · Live</span>
                  <span className="flex items-center gap-1.5 text-xs text-green-500 font-medium">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Live
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[
                    { label: 'Total', value: '1,089', bg: darkMode ? 'bg-blue-500/15 border-blue-500/30' : 'bg-blue-50 border-blue-200', text: darkMode ? 'text-blue-300' : 'text-blue-700' },
                    { label: 'Resolved', value: '891', bg: darkMode ? 'bg-green-500/15 border-green-500/30' : 'bg-green-50 border-green-200', text: darkMode ? 'text-green-300' : 'text-green-700' },
                    { label: 'Pending', value: '198', bg: darkMode ? 'bg-amber-500/15 border-amber-500/30' : 'bg-amber-50 border-amber-200', text: darkMode ? 'text-amber-300' : 'text-amber-700' },
                  ].map(c => (
                    <div key={c.label} className={`${c.bg} border rounded-2xl p-4 text-center`}>
                      <div className={`text-2xl font-extrabold ${c.text}`}>{c.value}</div>
                      <div className="text-gray-500 text-xs mt-0.5">{c.label}</div>
                    </div>
                  ))}
                </div>

                {/* Mini bar chart */}
                <div className={`rounded-2xl p-4 mb-4 border ${darkMode ? 'bg-white/5 border-white/8' : 'bg-gray-50 border-gray-100'}`}>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-semibold text-gray-500">Monthly Resolved</span>
                    <span className="text-xs text-green-500 font-semibold">↑ 12%</span>
                  </div>
                  <div className="flex items-end gap-1.5 h-14">
                    {[35, 60, 45, 80, 55, 90, 65, 85, 55, 95, 70, 100].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t"
                        style={{
                          height: `${h}%`,
                          background: `linear-gradient(to top, #3b82f6, #22d3ee)`,
                          opacity: 0.4 + i * 0.05
                        }} />
                    ))}
                  </div>
                </div>

                {/* Recent */}
                <div className="space-y-2">
                  {[
                    { t: 'Pothole on MG Road', s: 'Critical', c: darkMode ? 'text-red-400' : 'text-red-600', bg: darkMode ? 'bg-red-500/10' : 'bg-red-50', dot: 'bg-red-500' },
                    { t: 'Garbage near Central Park', s: 'In Progress', c: darkMode ? 'text-amber-400' : 'text-amber-600', bg: darkMode ? 'bg-amber-500/10' : 'bg-amber-50', dot: 'bg-amber-500' },
                    { t: 'Broken Streetlight – HSR', s: 'Assigned', c: darkMode ? 'text-blue-400' : 'text-blue-600', bg: darkMode ? 'bg-blue-500/10' : 'bg-blue-50', dot: 'bg-blue-400' },
                  ].map((r, i) => (
                    <div key={i} className={`flex items-center gap-3 rounded-xl px-4 py-2.5 border
                      ${darkMode ? 'bg-white/5 border-white/8' : 'bg-gray-50 border-gray-100'}`}>
                      <div className={`w-2 h-2 rounded-full shrink-0 ${r.dot}`} />
                      <span className={`flex-1 text-sm truncate ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{r.t}</span>
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-lg ${r.bg} ${r.c}`}>{r.s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ───────────────────────────── */}
      <section id="how-steps" className="py-20 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto text-center mb-14">
          <h2 className={`text-4xl font-extrabold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            How It Works
          </h2>
          <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Four simple steps from reporting to citizen-verified resolution</p>
        </div>
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { step: '01', icon: '📝', title: 'Report the Issue', desc: 'Describe, upload photo and mark location on map.' },
            { step: '02', icon: '🤖', title: 'AI Routes It', desc: 'AI classifies and assigns to the right department.' },
            { step: '03', icon: '📊', title: 'Track Progress', desc: 'Real-time status updates as the issue is resolved.' },
            { step: '04', icon: '✅', title: 'Issue Resolved', desc: 'Verify the fix and provide feedback for accountability.' },
          ].map((s, i) => (
            <div key={i} className="relative text-center group">
              {i < 3 && (
                <div className={`hidden lg:block absolute top-10 left-[calc(50%+44px)] right-0 h-0.5
                  ${darkMode ? 'bg-gradient-to-r from-blue-500/40 to-transparent' : 'bg-gradient-to-r from-blue-300 to-transparent'}`} />
              )}
              <div className={`w-20 h-20 mx-auto mb-5 rounded-2xl flex items-center justify-center text-3xl border group-hover:scale-110 transition-all duration-300
                ${darkMode ? 'bg-blue-500/10 border-blue-500/20 group-hover:border-blue-400/50' : 'bg-blue-50 border-blue-200 group-hover:border-blue-400'}`}>
                {s.icon}
              </div>
              <div className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">Step {s.step}</div>
              <h3 className={`font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{s.title}</h3>
              <p className="text-sm text-gray-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA ────────────────────────────────────── */}
      <section className="py-24 relative overflow-hidden">
        <div className={`absolute inset-0 pointer-events-none ${darkMode ? 'bg-gradient-to-br from-blue-600/15 via-transparent to-cyan-600/10' : 'bg-gradient-to-br from-blue-50 via-white to-cyan-50'}`} />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-8 text-center">
          <h2 className={`text-4xl lg:text-5xl font-extrabold mb-5 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Ready to Make Your City Better?
          </h2>
          <p className={`text-lg mb-10 max-w-2xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Join thousands of citizens actively improving their urban environment. Report issues, track progress, and hold authorities accountable.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold px-10 py-4 rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 transition-all text-sm">
              Register as Citizen <FiArrowRight />
            </Link>
            <Link to="/login?role=admin"
              className={`inline-flex items-center gap-2 font-bold px-10 py-4 rounded-2xl border hover:scale-105 transition-all text-sm
                ${darkMode ? 'bg-white/5 border-white/20 text-white hover:bg-white/10' : 'bg-white border-gray-300 text-gray-800 hover:bg-gray-50 shadow-sm'}`}>
              <FiShield size={18} /> Admin / Officer Login
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─────────────────────────────────── */}
      <footer className={`border-t py-14 transition-colors duration-300
        ${darkMode ? 'bg-gray-950 border-white/5' : 'bg-gray-900 border-gray-800'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid md:grid-cols-4 gap-10 mb-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <FiShield size={18} className="text-white" />
                </div>
                <div>
                  <span className="text-lg font-bold text-white">CivicResolve</span>
                  <p className="text-[10px] text-gray-500 -mt-0.5">AI-Powered Civic Governance</p>
                </div>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed max-w-sm">
                Transforming traditional grievance reporting into an intelligent civic governance platform that promotes transparency and empowers citizens.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link to="/register" className="hover:text-white transition-colors">Report Issue</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Track Complaint</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">City Map</Link></li>
                <li><a href="#features" className="hover:text-white transition-colors">All Features</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm">For Officials</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link to="/login?role=admin" className="hover:text-white transition-colors">Admin Login</Link></li>
                <li><Link to="/login?role=officer" className="hover:text-white transition-colors">Officer Login</Link></li>
                <li><a href="#stats" className="hover:text-white transition-colors">Impact Stats</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600">© 2026 CivicResolve. All rights reserved.</p>
            <div className="flex flex-wrap gap-5 text-sm text-gray-600">
              <span>🌐 Multilingual</span>
              <span>🎙️ Voice Enabled</span>
              <span>🤖 AI Powered</span>
              <span>📍 GPS Integrated</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function LandingThemeToggle() {
  const { darkMode, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg transition-all ${darkMode ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
      title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
    </button>
  );
}
