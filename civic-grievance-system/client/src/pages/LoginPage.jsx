import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiArrowLeft, FiUsers } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, isLoggedIn, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [selectedRole, setSelectedRole] = useState(
    searchParams.get('role') === 'admin' || searchParams.get('role') === 'officer' ? 'admin' : 'citizen'
  );
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn && user) {
      navigate(user.role === 'citizen' ? '/' : '/admin');
    }
  }, [isLoggedIn, user, navigate]);

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
      await login(form.email, form.password);
    } catch (err) {
      if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password'
      ) {
        setError('Invalid email or password.');
      } else {
        setError(err.message || 'Unable to connect to server. Please try again.');
      }
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
    setSelectedRole(role);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-civic-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex">

      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-700 to-primary-900 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-civic-500 rounded-full blur-3xl opacity-20"></div>

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 mb-12 group">
            <FiArrowLeft className="text-primary-300 group-hover:text-white transition-colors" />
            <span className="text-primary-300 text-sm group-hover:text-white transition-colors">Back to Home</span>
          </Link>

          <Link to="/" className="flex items-center gap-3 mb-8 hover:opacity-80 transition-opacity">
            <div className="w-12 h-14 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center">
              <img src="/logo.svg" alt="CivicResolve Logo" className="w-10 h-12 brightness-0 invert" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">CivicResolve</h1>
              <p className="text-primary-300 text-sm">Smart Grievance Management</p>
            </div>
          </Link>

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
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">AI</div>
            <div>
              <p className="text-white font-medium text-sm">AI-Powered Classification</p>
              <p className="text-xs">Complaints auto-routed to the right department</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-primary-200">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">RT</div>
            <div>
              <p className="text-white font-medium text-sm">Real-Time Tracking</p>
              <p className="text-xs">Monitor progress from submission to resolution</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-primary-200">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">MAP</div>
            <div>
              <p className="text-white font-medium text-sm">Map-Based Dashboard</p>
              <p className="text-xs">Visualize all city issues on an interactive map</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">

          <Link to="/" className="lg:hidden flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-6 hover:text-gray-700 dark:hover:text-gray-200">
            <FiArrowLeft size={16} /> Back to Home
          </Link>

          <div className="text-center mb-8">
            <div className="lg:hidden flex items-center justify-center gap-2 mb-4">
              <img src="/logo.svg" alt="CivicResolve Logo" className="w-8 h-10" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">CivicResolve</h1>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome Back</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Sign in to your CivicResolve account</p>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Login as</label>
            <div className="relative">
              <FiUsers className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
              >
                <option value="citizen">Citizen</option>
                <option value="officer">Officer</option>
                <option value="admin">Administrator</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
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
                  placeholder={selectedRole === 'citizen' ? 'you@example.com' : 'officer@municipal.gov'}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <span className="text-gray-600 dark:text-gray-300">Remember me</span>
              </label>
              <a href="/forgot-password" onClick={e => { e.preventDefault(); window.location.href='/forgot-password'; }} className="text-primary-600 dark:text-primary-400 hover:text-primary-700 font-medium">Forgot password?</a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg text-base"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <FiUser size={18} />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
            <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-3">Quick Demo Access</p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('citizen')}
                className="w-full text-left text-sm bg-white dark:bg-gray-700 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 py-2 px-3 rounded-md hover:bg-blue-50 dark:hover:bg-gray-600 transition-all duration-200 font-medium flex items-center gap-3"
              >
                <span>User</span>
                <div>
                  <div className="font-semibold">Citizen Demo</div>
                  <div className="text-xs opacity-75">citizen@example.com</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('officer')}
                className="w-full text-left text-sm bg-white dark:bg-gray-700 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 py-2 px-3 rounded-md hover:bg-blue-50 dark:hover:bg-gray-600 transition-all duration-200 font-medium flex items-center gap-3"
              >
                <span>Ofcr</span>
                <div>
                  <div className="font-semibold">Officer Demo</div>
                  <div className="text-xs opacity-75">rajesh@municipal.gov</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                className="w-full text-left text-sm bg-white dark:bg-gray-700 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 py-2 px-3 rounded-md hover:bg-blue-50 dark:hover:bg-gray-600 transition-all duration-200 font-medium flex items-center gap-3"
              >
                <span>Admn</span>
                <div>
                  <div className="font-semibold">Admin Demo</div>
                  <div className="text-xs opacity-75">admin@municipal.gov</div>
                </div>
              </button>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            {"Don't have an account?"}{' '}
            <Link to="/register" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 font-semibold">
              Register here
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}