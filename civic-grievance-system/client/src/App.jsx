import React, { useState } from 'react';
import { Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { FiHome, FiPlusCircle, FiMap, FiBarChart2, FiSearch, FiUsers, FiMessageCircle, FiMenu, FiX, FiLogOut, FiUser, FiSun, FiMoon } from 'react-icons/fi';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import ReportIssue from './pages/ReportIssue';
import MapView from './pages/MapView';
import Analytics from './pages/Analytics';
import TrackComplaint from './pages/TrackComplaint';
import ComplaintDetail from './pages/ComplaintDetail';
import AdminPanel from './pages/AdminPanel';
import Chatbot from './components/Chatbot';

function ProtectedRoute({ children, adminOnly = false }) {
  const { isLoggedIn, isAdmin, isOfficer } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin && !isOfficer) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}

function AppRoutes() {
  const location = useLocation();
  const { isLoggedIn } = useAuth();

  // Public pages (no header/footer shell)
  const isPublicPage = ['/', '/login', '/register'].includes(location.pathname);

  if (isPublicPage) {
    return (
      <Routes>
        <Route path="/" element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    );
  }

  return <AppShell />;
}

function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isLoggedIn, isAdmin, isOfficer } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const CITIZEN_NAV = [
    { path: '/dashboard', label: 'Dashboard', icon: FiHome },
    { path: '/report', label: 'Report Issue', icon: FiPlusCircle },
    { path: '/map', label: 'City Map', icon: FiMap },
    { path: '/track', label: 'Track Complaint', icon: FiSearch },
  ];

  const ADMIN_NAV = [
    { path: '/dashboard', label: 'Dashboard', icon: FiHome },
    { path: '/admin', label: 'Admin Panel', icon: FiUsers },
    { path: '/map', label: 'City Map', icon: FiMap },
    { path: '/analytics', label: 'Analytics', icon: FiBarChart2 },
    { path: '/report', label: 'Report Issue', icon: FiPlusCircle },
    { path: '/track', label: 'Track Complaint', icon: FiSearch },
  ];

  const NAV_ITEMS = (isAdmin || isOfficer) ? ADMIN_NAV : CITIZEN_NAV;

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowUserMenu(false);
  };

  const roleLabel = user?.role === 'admin' ? 'Administrator' : user?.role === 'officer' ? 'Officer' : 'Citizen';
  const roleBadgeColor = user?.role === 'admin' ? 'bg-red-100 text-red-700' : user?.role === 'officer' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center">
                <img src="/logo.svg" alt="CivicResolve Logo" className="w-10 h-12" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">CivicResolve</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 -mt-0.5">Smart Grievance Management</p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    location.pathname === item.path
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <item.icon size={16} />
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* User Menu + Mobile */}
            <div className="flex items-center gap-3">
              {/* Dark mode toggle */}
              <ThemeToggle />
              {/* User dropdown */}
              {isLoggedIn && (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium text-gray-900 dark:text-white leading-tight">{user?.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">{roleLabel}</p>
                    </div>
                  </button>

                  {showUserMenu && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setShowUserMenu(false)}></div>
                      <div className="absolute right-0 top-12 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-40 animate-fadeIn overflow-hidden">
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold">
                              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white text-sm">{user?.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                            </div>
                          </div>
                          <span className={`inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded-full ${roleBadgeColor}`}>
                            {roleLabel}
                          </span>
                          {user?.department && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">📌 {user.department}</p>
                          )}
                        </div>
                        <div className="p-2">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors font-medium"
                          >
                            <FiLogOut size={16} /> Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Mobile menu button */}
              <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 animate-fadeIn">
            {NAV_ITEMS.map(item => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium ${
                  location.pathname === item.path
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            ))}
            {isLoggedIn && (
              <button
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 mt-1 border-t border-gray-100 dark:border-gray-700 pt-3"
              >
                <FiLogOut size={18} /> Sign Out
              </button>
            )}
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Routes>
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/report" element={<ProtectedRoute><ReportIssue /></ProtectedRoute>} />
          <Route path="/map" element={<ProtectedRoute><MapView /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute adminOnly><Analytics /></ProtectedRoute>} />
          <Route path="/track" element={<ProtectedRoute><TrackComplaint /></ProtectedRoute>} />
          <Route path="/complaint/:id" element={<ProtectedRoute><ComplaintDetail /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>

      {/* Chatbot FAB */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 z-40 hover:scale-110"
        title="Chat with CivicBot"
      >
        <FiMessageCircle size={24} />
      </button>

      {/* Chatbot Panel */}
      {chatOpen && <Chatbot onClose={() => setChatOpen(false)} />}

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              © 2026 CivicResolve — AI-Powered Smart Civic Grievance Management System
            </div>
            <div className="flex gap-6 text-sm text-gray-500 dark:text-gray-400">
              <span>🌐 Multilingual Support</span>
              <span>🎙️ Voice Enabled</span>
              <span>🤖 AI Powered</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ThemeToggle() {
  const { darkMode, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
      title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
    </button>
  );
}
