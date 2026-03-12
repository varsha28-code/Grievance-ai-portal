import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiShield, FiArrowLeft, FiActivity, FiBell } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

export default function AdminLoginPage() {
  const { login, isLoggedIn, user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn && user) {
      if (user.role === 'admin' || user.role === 'officer') {
        navigate('/admin');
      } else {
        navigate('/');
      }
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
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid staff credentials.');
      } else {
        setError(err.message || 'Connection error. Please contact IT support.');
      }
    }
    setLoading(false);
  };

  const handleDemoLogin = (role) => {
    const demoAccounts = {
      officer: { email: 'rajesh@municipal.gov', password: 'officer123' },
      admin: { email: 'admin@municipal.gov', password: 'admin123' },
    };
    setForm(demoAccounts[role]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex">
      {/* Left Panel - Staff Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-800 to-slate-950 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-500 rounded-full blur-3xl opacity-10"></div>

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 mb-12 group">
            <FiArrowLeft className="text-slate-400 group-hover:text-white transition-colors" />
            <span className="text-slate-400 text-sm group-hover:text-white transition-colors">Back to Public Portal</span>
          </Link>

          <Link to="/" className="flex items-center gap-3 mb-8 hover:opacity-80 transition-opacity">
            <img src="/logo.png" alt="Voice4City Logo" className="w-12 h-12 object-contain" />
            <div>
              <h1 className="text-2xl font-bold text-white uppercase tracking-wider">Voice4City</h1>
              <p className="text-blue-400 text-xs font-semibold tracking-widest">ADMINISTRATION CONSOLE</p>
            </div>
          </Link>

          <h2 className="text-4xl font-extrabold text-white leading-tight mb-6">
            Municipal Operations<br />
            <span className="text-blue-400">& Governance Center.</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-md">
            Management portal for department officers and municipal administrators to monitor community grievances and city performance.
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3 text-slate-400">
            <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center border border-white/10 text-blue-400"><FiActivity /></div>
            <div>
              <p className="text-white font-medium text-sm">Real-Time Oversight</p>
              <p className="text-xs">Live monitoring of department efficiency</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center border border-white/10 text-emerald-400"><FiShield /></div>
            <div>
              <p className="text-white font-medium text-sm">Secure Access</p>
              <p className="text-xs">Encrypted protocol for municipal staff</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Staff Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md animate-fadeIn">
          {/* Mobile back link */}
          <Link to="/" className="lg:hidden flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-6 hover:text-gray-700 dark:hover:text-gray-200">
            <FiArrowLeft size={16} /> Public Portal
          </Link>

          <div className="text-center mb-8">
            <div className="lg:hidden flex items-center justify-center gap-2 mb-4">
              <img src="/logo.png" alt="Voice4City Logo" className="w-10 h-10 object-contain" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Voice4City Staff</h1>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Staff Authentication</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Authorized personnel only</p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Staff Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="name@municipal.gov"
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Security Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input-field pl-10 pr-10"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
              {loading ? '🔐 Authenticating...' : (
                <>
                  <FiShield size={20} />
                  Staff Sign In
                </>
              )}
            </button>
          </form>

          {/* Quick Access Tokens */}
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
            <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-3 text-center">Quick Access Tokens</p>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => handleDemoLogin('officer')}
                className="flex items-center justify-center gap-2 py-2 px-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 hover:border-blue-500 hover:text-blue-600 transition-all"
              >
                👷 Officer Account
              </button>
              <button 
                onClick={() => handleDemoLogin('admin')}
                className="flex items-center justify-center gap-2 py-2 px-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 hover:border-blue-500 hover:text-blue-600 transition-all"
              >
                🛡️ Admin Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
