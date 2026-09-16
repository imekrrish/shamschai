'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  CreditCard, 
  BarChart3, 
  Settings, 
  LogOut, 
  Database,
  ExternalLink
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/products', label: 'Products & Pricing', icon: Package },
  { href: '/orders', label: 'Live Orders', icon: ShoppingBag },
  { href: '/payments', label: 'Payments Received', icon: CreditCard },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/settings', label: 'Database & Settings', icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (e) {
      console.error(e);
      router.push('/login');
    }
  };

  return (
    <aside className="w-64 bg-[#f4eee3] border-r border-[#e5dcd1] flex flex-col justify-between shrink-0 h-screen sticky top-0">
      <div>
        {/* Brand Header */}
        <div className="h-20 flex items-center px-6 border-b border-[#e5dcd1] gap-3 bg-[#faf7f1]">
          <Link href="/" aria-label="Sham's Chai admin home" className="shrink-0">
            <img src="/assets/shams/brand/shams-logo.png" alt="Sham's Masala Chai" className="h-16 w-auto bg-[#121110]" />
          </Link>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#17382f]">Admin</span>
            <p className="text-[11px] text-[#65675f] font-medium">Estate Operations &amp; Control</p>
          </div>
        </div>

        {/* Database Source Pill */}
        <div className="px-4 py-3 border-b border-[#e5dcd1] bg-[#f9f5ed]">
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white border border-[#e5dcd1] shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span className="text-[11px] font-semibold text-[#17382f]">PostgreSQL Active</span>
            </div>
            <Database className="w-3.5 h-3.5 text-[#9d542f]" />
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#8e8d87]">
            Management
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#17382f] text-[#faf7f1] shadow-sm'
                    : 'text-[#4a4b45] hover:text-[#171815] hover:bg-[#e9e2d5]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#c89b4b]' : 'text-[#65675f]'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-[#e5dcd1] space-y-3 bg-[#faf7f1]">
        <div className="p-3 rounded-xl bg-white border border-[#e5dcd1] flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-[#17382f] flex items-center justify-center font-bold text-xs text-[#c89b4b]">
              SC
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-[#171815] truncate">Sham Admin</p>
              <p className="text-[10px] text-[#65675f] truncate font-mono">admin@shamschai.com</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-1.5 rounded-lg text-[#65675f] hover:text-rose-600 hover:bg-rose-50 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#8e8d87] px-1">
          <span>Vercel Deployable</span>
          <a 
            href="https://shamschai.com" 
            target="_blank" 
            rel="noreferrer" 
            className="flex items-center gap-1 text-[#17382f] font-semibold hover:underline"
          >
            <span>Live Site</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </aside>
  );
}
