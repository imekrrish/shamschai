'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || 'Login failed. Check credentials.');
        setLoading(false);
        return;
      }

      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Network error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf7f1] flex flex-col items-center justify-center p-4 relative">
      <div className="w-full max-w-md relative z-10">
        {/* Brand Banner */}
        <div className="text-center mb-8">
          <h1><img src="/assets/shams/brand/shams-logo.png" alt="Sham's Masala Chai" className="h-44 w-auto mx-auto mb-4 bg-[#121110]" /></h1>
          <p className="text-sm text-[#65675f] mt-1 font-medium">Executive Admin & Operations Portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-[#e5dcd1] rounded-2xl p-8 shadow-card">
          <div className="flex items-center justify-between pb-5 mb-5 border-b border-[#f0eae1]">
            <div>
              <h2 className="text-xl font-serif font-bold text-[#171815]">Admin Sign In</h2>
              <p className="text-xs text-[#65675f] mt-0.5">Secure operations dashboard access</p>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-[#17382f] bg-[#e8efe9] border border-[#17382f]/20 px-2.5 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>TLS Secured</span>
            </div>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#65675f] mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8e8d87] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@shamschai.com"
                  className="w-full bg-[#faf7f1] border border-[#d8cfc2] focus:border-[#17382f] focus:ring-1 focus:ring-[#17382f] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#171815] placeholder-[#9c9b94] outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#65675f] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8e8d87] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#faf7f1] border border-[#d8cfc2] focus:border-[#17382f] focus:ring-1 focus:ring-[#17382f] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#171815] placeholder-[#9c9b94] outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-[#17382f] hover:bg-[#102820] text-[#faf7f1] font-bold text-sm shadow-md flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-4 h-4 text-[#c89b4b]" />
            </button>
          </form>

        </div>

        <p className="text-center text-xs text-[#8e8d87] mt-6">
          Sham’s Chai Management Console · Ready for Vercel Deployment
        </p>
      </div>
    </div>
  );
}
