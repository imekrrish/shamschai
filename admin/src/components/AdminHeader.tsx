'use client';

import React, { useState, useEffect } from 'react';
import { Bell, RefreshCw, Database, Server } from 'lucide-react';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export default function AdminHeader({
  title,
  subtitle,
  onRefresh,
  isRefreshing = false
}: AdminHeaderProps) {
  const [dbInfo, setDbInfo] = useState<{ dataSource?: string; database?: string }>({});

  useEffect(() => {
    fetch('/api/system/status')
      .then(res => res.json())
      .then(data => {
        if (data.success) setDbInfo(data);
      })
      .catch(() => {});
  }, []);

  return (
    <header className="h-20 bg-[#faf7f1]/90 backdrop-blur-md border-b border-[#e5dcd1] px-8 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h1 className="text-2xl font-serif font-bold text-[#171815] tracking-tight flex items-center gap-3">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-[#65675f] mt-0.5">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-3.5">
        {/* Live Database Source Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-[#e5dcd1] text-xs shadow-2xs">
          <Database className="w-3.5 h-3.5 text-[#17382f]" />
          <span className="text-[#65675f]">Data Source:</span>
          <span className="font-semibold text-[#17382f] font-mono">
            {dbInfo.database ? `PostgreSQL (${dbInfo.database})` : 'PostgreSQL / Store'}
          </span>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg bg-white hover:bg-[#f4eee3] border border-[#e5dcd1] text-[#171815] transition flex items-center gap-1.5 text-xs font-semibold shadow-2xs"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#17382f] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">Refresh</span>
          </button>
        )}

        <div className="flex items-center gap-2 pl-2 border-l border-[#e5dcd1]">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#e8efe9] text-[#17382f] border border-[#17382f]/20">
            Admin Authenticated
          </span>
        </div>
      </div>
    </header>
  );
}
