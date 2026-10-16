import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const [email, setEmail] = useState('admin@rpstorage.com');
  const [password, setPassword] = useState('Admin@RP2026!');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const fillCredentials = (userEmail, userPass) => {
    setEmail(userEmail);
    setPassword(userPass);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white border border-brand-border p-8 shadow-xl">
        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-brand-orange text-white flex items-center justify-center font-extrabold text-base rounded">
            RP
          </div>
          <div>
            <h1 className="text-lg font-bold text-neutral-900 tracking-tight leading-tight">
              RP Storage Solution
            </h1>
            <p className="text-xs text-neutral-500 font-mono uppercase tracking-wider">
              Management CMS & SEO System
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 rounded">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@rpstorage.com"
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-neutral-50 border border-neutral-300 focus:border-brand-orange focus:bg-white focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-neutral-50 border border-neutral-300 focus:border-brand-orange focus:bg-white focus:outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-brand-orange hover:bg-brand-orangeHover text-white py-3 text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
          >
            {submitting ? 'Verifying Credentials...' : 'Sign In To Workspace'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Quick Demo Switcher Buttons */}
        <div className="mt-8 pt-6 border-t border-neutral-200">
          <p className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider mb-2">
            One-Click Role Switcher (For Evaluation):
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillCredentials('admin@rpstorage.com', 'Admin@RP2026!')}
              className="p-2 text-[10px] bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-center font-semibold rounded"
            >
              Super Admin
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('seo@rpstorage.com', 'Seo@RP2026!')}
              className="p-2 text-[10px] bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-center font-semibold rounded"
            >
              SEO Lead
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('editor@rpstorage.com', 'Editor@RP2026!')}
              className="p-2 text-[10px] bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-center font-semibold rounded"
            >
              Content Editor
            </button>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-1.5 text-[11px] text-neutral-400 justify-center">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-orange" />
          <span>Role-Based Access Control Enforced</span>
        </div>
      </div>
    </div>
  );
};
