import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiPhone, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register, isLoggedIn, user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn && user) navigate('/');
  }, [isLoggedIn, user, navigate]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      await register(form.email, form.password, {
        name: form.name,
        phone: form.phone,
        role: 'citizen'
      });
      // Navigation is handled automatically by the useEffect
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') setError('Email already in use.');
      else setError(err.message || 'Registration failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-civic-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-civic-700 to-civic-900 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-civic-600 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary-500 rounded-full blur-3xl opacity-20"></div>

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2 text-civic-300 text-sm mb-12 hover:text-white transition-colors">
            <FiArrowLeft size={16} /> Back to Home
          </Link>

          <Link to="/" className="flex items-center gap-3 mb-8 hover:opacity-80 transition-opacity">
            <img src="/logo.png" alt="Voice4City Logo" className="w-12 h-12 object-contain" />
            <div>
              <h1 className="text-2xl font-bold text-white">Voice4City</h1>
              <p className="text-civic-300 text-sm">Empowering Citizen Voices</p>
            </div>
          </Link>

          <h2 className="text-4xl font-extrabold text-white leading-tight mb-6">
            Join the movement<br />
            <span className="text-civic-300">for a smarter city.</span>
          </h2>
          <p className="text-civic-200 text-lg max-w-md">
            Register as a citizen to start reporting issues and contribute to the betterment of your community.
          </p>
        </div>

        <div className="relative z-10 space-y-3">
          {[
            'Report potholes, garbage, broken lights & more',
            'AI auto-classifies & routes to the right department',
            'Track progress in real-time with status updates',
            'Verify resolutions & hold authorities accountable',
            'Vote on issues to boost priority for your community',
          ].map((text, i) => (
            <div key={i} className="flex items-center gap-3 text-civic-200">
              <FiCheckCircle className="text-civic-400 flex-shrink-0" size={16} />
              <span className="text-sm">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md animate-fadeIn">
          <Link to="/" className="lg:hidden flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-6 hover:text-gray-700 dark:hover:text-gray-200">
            <FiArrowLeft size={16} /> Back to Home
          </Link>

          <div className="text-center mb-8">
            <div className="lg:hidden flex items-center justify-center gap-2 mb-4">
              <img src="/logo.png" alt="Voice4City Logo" className="w-10 h-10 object-contain" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Voice4City</h1>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Join Voice4City</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Register to start reporting civic issues</p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name *</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address *</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone Number</label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password *</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 characters"
                  className="input-field pl-10 pr-10"
                  required
                  minLength={6}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirm Password *</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            <div className="flex items-start gap-2">
              <input type="checkbox" required className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                I agree to the <a href="#" className="text-primary-600 dark:text-primary-400 hover:underline">Terms of Service</a> and <a href="#" className="text-primary-600 dark:text-primary-400 hover:underline">Privacy Policy</a>
              </span>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? '⏳ Creating account...' : (
                <>
                  <FiUser size={16} /> Create Account
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Already have an account? <Link to="/login" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 font-semibold">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
