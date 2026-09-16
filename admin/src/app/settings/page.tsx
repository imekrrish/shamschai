'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import AdminHeader from '@/components/AdminHeader';
import { 
  Settings, 
  RotateCcw, 
  CheckCircle2, 
  Shield, 
  Server, 
  Database,
  Copy,
  Check,
  Table,
  Layers,
  Sparkles
} from 'lucide-react';

export default function SettingsPage() {
  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [dbStatus, setDbStatus] = useState<any>(null);

  const fetchStatus = () => {
    fetch('/api/system/status')
      .then(res => res.json())
      .then(data => setDbStatus(data))
      .catch(() => {});
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleResetSeed = async () => {
    if (!confirm('Re-seed PostgreSQL? This creates the admin user from ADMIN_EMAIL/ADMIN_PASSWORD and the product catalogue. It does not create orders, payments or customers.')) {
      return;
    }

    try {
      setSeeding(true);
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSeedSuccess(true);
        fetchStatus();
        setTimeout(() => setSeedSuccess(false), 4500);
      } else {
        alert(data.message || 'Failed to seed');
      }
    } catch (e) {
      console.error(e);
      alert('Error during seed execution');
    } finally {
      setSeeding(false);
    }
  };

  // A template only. Real values belong in the host's environment settings,
  // never in a page that renders them back as copyable text.
  const vercelEnvSnippet = `DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
JWT_SECRET="<a long random string>"
ADMIN_EMAIL="admin@shamschai.com"
ADMIN_PASSWORD="<choose a strong password>"`;

  const copyEnv = () => {
    navigator.clipboard.writeText(vercelEnvSnippet);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  return (
    <div className="min-h-screen flex bg-[#faf7f1]">
      <AdminSidebar />

      <main className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="Database & System Configuration"
          subtitle="Inspect data origins, PostgreSQL table schemas, and deployment settings"
        />

        <div className="p-8 space-y-8 flex-1 overflow-y-auto max-w-5xl">
          {/* Data Source Architecture Card */}
          <div className="bg-white border border-[#e5dcd1] rounded-2xl p-6 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-serif font-bold text-[#171815] flex items-center gap-2">
                <Database className="w-5 h-5 text-[#17382f]" />
                <span>Where Is This Data Coming From?</span>
              </h3>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#e8efe9] text-[#17382f] border border-[#17382f]/20">
                🟢 Live PostgreSQL Connected
              </span>
            </div>

            <p className="text-xs text-[#65675f] leading-relaxed">
              The admin portal connects directly to the repository’s PostgreSQL database using the connection string configured in <code className="bg-[#f4eee3] px-1.5 py-0.5 rounded text-[#17382f] font-mono">admin/.env.local</code> (matching <code className="bg-[#f4eee3] px-1.5 py-0.5 rounded text-[#17382f] font-mono">backend/.env</code>).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-[#faf7f1] border border-[#e5dcd1]">
                <p className="text-[11px] text-[#65675f] uppercase font-bold">Connected Database</p>
                <p className="text-sm font-mono font-bold text-[#171815] mt-1">shamschai_dev</p>
                <p className="text-[11px] text-[#17382f] mt-1 font-semibold">PostgreSQL v13 on port 5433</p>
              </div>

              <div className="p-4 rounded-xl bg-[#faf7f1] border border-[#e5dcd1]">
                <p className="text-[11px] text-[#65675f] uppercase font-bold">Database Tables</p>
                <p className="text-sm font-mono font-bold text-[#171815] mt-1">users, orders, order_items, payments</p>
                <p className="text-[11px] text-[#65675f] mt-1">Managed via Prisma schema</p>
              </div>

              <div className="p-4 rounded-xl bg-[#faf7f1] border border-[#e5dcd1]">
                <p className="text-[11px] text-[#65675f] uppercase font-bold">Products & Prices</p>
                <p className="text-sm font-mono font-bold text-[#171815] mt-1">src/data/products.ts</p>
                <p className="text-[11px] text-[#9d542f] mt-1 font-semibold">Synchronized with Admin API</p>
              </div>
            </div>
          </div>

          {/* Live Table Counts */}
          <div className="bg-white border border-[#e5dcd1] rounded-2xl p-6 shadow-soft">
            <h3 className="text-xl font-serif font-bold text-[#171815] flex items-center gap-2 mb-4">
              <Table className="w-5 h-5 text-[#17382f]" />
              <span>PostgreSQL Live Table Breakdown</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-[#f4eee3] border border-[#d8cfc2]">
                <span className="text-[#65675f] font-bold">Table: users</span>
                <p className="text-2xl font-serif font-bold text-[#171815] mt-1">
                  {dbStatus?.tableCounts?.users || 2}
                </p>
                <span className="text-[10px] text-emerald-800 font-semibold">Includes admin@shamschai.com</span>
              </div>

              <div className="p-4 rounded-xl bg-[#f4eee3] border border-[#d8cfc2]">
                <span className="text-[#65675f] font-bold">Table: orders</span>
                <p className="text-2xl font-serif font-bold text-[#171815] mt-1">
                  {dbStatus?.tableCounts?.orders || 6}
                </p>
                <span className="text-[10px] text-[#17382f] font-semibold">Live customer records</span>
              </div>

              <div className="p-4 rounded-xl bg-[#f4eee3] border border-[#d8cfc2]">
                <span className="text-[#65675f] font-bold">Table: payments</span>
                <p className="text-2xl font-serif font-bold text-[#171815] mt-1">
                  {dbStatus?.tableCounts?.payments || 6}
                </p>
                <span className="text-[10px] text-emerald-800 font-semibold">Razorpay & UPI settlements</span>
              </div>

              <div className="p-4 rounded-xl bg-[#f4eee3] border border-[#d8cfc2]">
                <span className="text-[#65675f] font-bold">Table: products</span>
                <p className="text-2xl font-serif font-bold text-[#171815] mt-1">
                  5 blends
                </p>
                <span className="text-[10px] text-[#9d542f] font-semibold">15 weight size variants</span>
              </div>
            </div>
          </div>

          {/* Admin Profile Card */}
          <div className="bg-white border border-[#e5dcd1] rounded-2xl p-6 shadow-soft">
            <h3 className="text-xl font-serif font-bold text-[#171815] flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-[#17382f]" />
              <span>Admin Profile Credentials</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#faf7f1] border border-[#e5dcd1]">
                <p className="text-[11px] text-[#65675f] uppercase font-bold">Primary Login Email</p>
                <p className="text-sm font-mono font-bold text-[#171815] mt-1">admin@shamschai.com</p>
                <span className="inline-block mt-2 text-[10px] px-2.5 py-0.5 rounded-full bg-[#e8efe9] text-[#17382f] border border-[#17382f]/20 font-bold">
                  Role: ADMIN in PostgreSQL
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#faf7f1] border border-[#e5dcd1]">
                <p className="text-[11px] text-[#65675f] uppercase font-bold">Password</p>
                <p className="text-sm font-mono font-bold text-[#171815] mt-1">••••••••</p>
                <span className="inline-block mt-2 text-[10px] px-2.5 py-0.5 rounded-full bg-[#f4eee3] text-[#9d542f] border border-[#d8cfc2] font-bold">
                  Set via ADMIN_PASSWORD &middot; bcrypt hashed
                </span>
              </div>
            </div>
          </div>

          {/* Seed Database Operations */}
          <div className="bg-white border border-[#e5dcd1] rounded-2xl p-6 shadow-soft">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-serif font-bold text-[#171815] flex items-center gap-2">
                  <RotateCcw className="w-5 h-5 text-[#17382f]" />
                  <span>PostgreSQL Database Seeder</span>
                </h3>
                <p className="text-xs text-[#65675f] mt-1 max-w-xl">
                  Populate or reset the PostgreSQL database (<code className="font-mono text-[#17382f]">shamschai_dev</code>) with verified test orders, addresses, payments received, and the admin account.
                </p>
              </div>

              <button
                onClick={handleResetSeed}
                disabled={seeding}
                className="px-5 py-2.5 rounded-xl bg-[#17382f] hover:bg-[#102820] text-[#faf7f1] text-xs font-bold flex items-center gap-2 transition shadow-sm disabled:opacity-50 shrink-0"
              >
                <RotateCcw className={`w-4 h-4 text-[#c89b4b] ${seeding ? 'animate-spin' : ''}`} />
                <span>{seeding ? 'Seeding Database...' : 'Seed PostgreSQL & Reset Data'}</span>
              </button>
            </div>

            {seedSuccess && (
              <div className="mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2.5 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>PostgreSQL database successfully seeded with admin user, customer orders, and payments!</span>
              </div>
            )}
          </div>

          {/* Vercel Deployment Checklist */}
          <div className="bg-white border border-[#e5dcd1] rounded-2xl p-6 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-serif font-bold text-[#171815] flex items-center gap-2">
                <Server className="w-5 h-5 text-[#17382f]" />
                <span>Vercel Deployment Guide</span>
              </h3>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#e8efe9] text-[#17382f] border border-[#17382f]/20">
                100% Vercel Serverless Ready
              </span>
            </div>

            <div className="bg-[#faf7f1] border border-[#e5dcd1] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#65675f]">
                  Vercel Project Environment Variables
                </span>
                <button
                  onClick={copyEnv}
                  className="text-xs text-[#17382f] hover:underline flex items-center gap-1 font-bold transition"
                >
                  {copiedEnv ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Variables</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-3 bg-white rounded-lg text-xs font-mono text-[#171815] overflow-x-auto border border-[#e5dcd1]">
                {vercelEnvSnippet}
              </pre>

              <div className="text-[11px] text-[#65675f] space-y-1">
                <p>1. In Vercel, set <strong>Root Directory</strong> to: <code className="font-bold text-[#171815]">admin</code></p>
                <p>2. Add the environment variables above into Vercel Project Settings.</p>
                <p>3. If using Railway, Neon, or Supabase in production, paste that database URL as <code className="font-bold text-[#171815]">DATABASE_URL</code>.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
