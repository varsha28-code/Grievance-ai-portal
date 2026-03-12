import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiShield, FiUser, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState(searchParams.get('role') === 'admin' || searchParams.get('role') === 'officer' ? 'admin' : 'citizen');
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn) navigate('/dashboard');
  }, [isLoggedIn]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, role: activeTab === 'admin' ? undefined : 'citizen' }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid credentials');
        setLoading(false);
        return;
      }

      login(data.user);
      navigate(data.user.role === 'citizen' ? '/dashboard' : '/admin');
    } catch (err) {
      setError('Unable to connect to server. Please try again.');
    }
    setLoading(false);
  };

  const handleDemoLogin = (role) => {
    const demoAccounts = {
      citizen: { email: 'citizen@example.com', password: 'citizen123' },
      officer: { email: 'rajesh@municipal.gov', password: 'officer123' },
      admin: { email: 'admin@municipal.gov', password: 'admin123' },
    };
    setForm(demoAccounts[role]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-civic-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-700 to-primary-900 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-civic-500 rounded-full blur-3xl opacity-20"></div>

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 mb-12 group">
            <FiArrowLeft className="text-primary-300 group-hover:text-white transition-colors" />
            <span className="text-primary-300 text-sm group-hover:text-white transition-colors">Back to Home</span>
          </Link>

          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-14 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center">
              <img src="/logo.svg" alt="CivicResolve Logo" className="w-10 h-12 brightness-0 invert" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">CivicResolve</h1>
              <p className="text-primary-300 text-sm">Smart Grievance Management</p>
            </div>
          </div>

          <h2 className="text-4xl font-extrabold text-white leading-tight mb-6">
            Your voice matters.<br />
            <span className="text-primary-300">Your city listens.</span>
          </h2>
          <p className="text-primary-200 text-lg max-w-md">
            Sign in to report civic issues, track complaints, and participate in making your city better.
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3 text-primary-200">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">🤖</div>
            <div>
              <p className="text-white font-medium text-sm">AI-Powered Classification</p>
              <p className="text-xs">Complaints auto-routed to the right department</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-primary-200">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">📊</div>
            <div>
              <p className="text-white font-medium text-sm">Real-Time Tracking</p>
              <p className="text-xs">Monitor progress from submission to resolution</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-primary-200">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">🗺️</div>
            <div>
              <p className="text-white font-medium text-sm">Map-Based Dashboard</p>
              <p className="text-xs">Visualize all city issues on an interactive map</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md animate-fadeIn">
          {/* Mobile back link */}
          <Link to="/" className="lg:hidden flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-6 hover:text-gray-700 dark:hover:text-gray-200">
            <FiArrowLeft size={16} /> Back to Home
          </Link>

          <div className="text-center mb-8">
            <div className="lg:hidden flex items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 flex items-center justify-center">
                <img src="/logo.svg" alt="CivicResolve Logo" className="w-8 h-10" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">CivicResolve</h1>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome Back</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Sign in to your account to continue</p>
          </div>

          {/* Role Tabs */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-6">
            <button
              onClick={() => setActiveTab('citizen')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${
                activeTab === 'citizen' ? 'bg-white dark:bg-gray-700 text-primary-700 dark:text-primary-300 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <FiUser size={16} /> Citizen
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${
                activeTab === 'admin' ? 'bg-white dark:bg-gray-700 text-primary-700 dark:text-primary-300 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <FiShield size={16} /> Admin / Officer
            </button>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder={activeTab === 'citizen' ? 'you@example.com' : 'officer@municipal.gov'}
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="input-field pl-10 pr-10"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <span className="text-gray-600 dark:text-gray-300">Remember me</span>
              </label>
              <a href="#" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 font-medium">Forgot password?</a>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? '⏳ Signing in...' : (
                <>
                  {activeTab === 'citizen' ? <FiUser size={16} /> : <FiShield size={16} />}
                  Sign In as {activeTab === 'citizen' ? 'Citizen' : 'Admin / Officer'}
                </>
              )}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
            <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-3">🧪 Demo Accounts (click to fill):</p>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => handleDemoLogin('citizen')} className="text-xs bg-white dark:bg-gray-700 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 py-1.5 px-2 rounded-md hover:bg-blue-100 dark:hover:bg-gray-600 transition-colors font-medium">
                👤 Citizen
              </button>
              <button onClick={() => handleDemoLogin('officer')} className="text-xs bg-white dark:bg-gray-700 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 py-1.5 px-2 rounded-md hover:bg-blue-100 dark:hover:bg-gray-600 transition-colors font-medium">
                👷 Officer
              </button>
              <button onClick={() => handleDemoLogin('admin')} className="text-xs bg-white dark:bg-gray-700 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 py-1.5 px-2 rounded-md hover:bg-blue-100 dark:hover:bg-gray-600 transition-colors font-medium">
                🛡️ Admin
              </button>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Don't have an account? <Link to="/register" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 font-semibold">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
