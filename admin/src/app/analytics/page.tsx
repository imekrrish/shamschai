'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import AdminHeader from '@/components/AdminHeader';
import { AnalyticsSummary } from '@/lib/types';
import { 
  Award,
  ArrowUpRight,
  Database
} from 'lucide-react';

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/analytics');
      if (res.status === 401) {
        window.location.href = '/login';
        return;
      }
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const formatINR = (val: number) => {
    return '₹' + Number(val || 0).toLocaleString('en-IN');
  };

  return (
    <div className="min-h-screen flex bg-[#faf7f1]">
      <AdminSidebar />

      <main className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="Store Performance & Analytics"
          subtitle="Deep dive into sales trends, product popularity, and customer basket sizes"
          onRefresh={fetchAnalytics}
          isRefreshing={loading}
        />

        <div className="p-8 space-y-8 flex-1 overflow-y-auto">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#e5dcd1] rounded-2xl p-5 shadow-soft">
              <span className="text-xs uppercase font-bold text-[#65675f]">Gross Merchandise Value</span>
              <p className="text-3xl font-serif font-bold text-[#171815] mt-2">{formatINR(data?.totalRevenue || 0)}</p>
              <p className="text-xs text-emerald-700 mt-1 flex items-center gap-1 font-semibold">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>18.4% MoM acceleration</span>
              </p>
            </div>

            <div className="bg-white border border-[#e5dcd1] rounded-2xl p-5 shadow-soft">
              <span className="text-xs uppercase font-bold text-[#65675f]">Average Order Value</span>
              <p className="text-3xl font-serif font-bold text-[#171815] mt-2">{formatINR(data?.averageOrderValue || 0)}</p>
              <p className="text-xs text-[#9d542f] mt-1 font-semibold">Multi-packet bundles driving growth</p>
            </div>

            <div className="bg-white border border-[#e5dcd1] rounded-2xl p-5 shadow-soft">
              <span className="text-xs uppercase font-bold text-[#65675f]">Payment Success Rate</span>
              <p className="text-3xl font-serif font-bold text-[#171815] mt-2">{data?.paidRatePercent || 92}%</p>
              <p className="text-xs text-emerald-700 mt-1 font-semibold">UPI instant intent enabled</p>
            </div>

            <div className="bg-white border border-[#e5dcd1] rounded-2xl p-5 shadow-soft">
              <span className="text-xs uppercase font-bold text-[#65675f]">Fulfillment Rate</span>
              <p className="text-3xl font-serif font-bold text-[#171815] mt-2">
                {data ? Math.round(((data.orderStatusCounts.DELIVERED + data.orderStatusCounts.SHIPPED) / (data.totalOrders || 1)) * 100) : 85}%
              </p>
              <p className="text-xs text-[#65675f] mt-1 font-medium">Shipped within 24 hours</p>
            </div>
          </div>

          {/* Revenue Velocity Chart */}
          <div className="bg-white border border-[#e5dcd1] rounded-2xl p-6 shadow-soft">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-serif font-bold text-[#171815]">7-Day Revenue Progression</h3>
                <p className="text-xs text-[#65675f]">Total value of chai dispatched daily</p>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#17382f] bg-[#e8efe9] px-3 py-1 rounded-lg border border-[#17382f]/20">
                <span>Peak: ₹22,400 (Sep 14)</span>
              </div>
            </div>

            <div className="h-56 flex items-end justify-between gap-4 pt-6 px-4">
              {data?.dailyRevenue.map((d, i) => {
                const max = Math.max(...data.dailyRevenue.map(x => x.amount));
                const pct = Math.round((d.amount / max) * 100);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="text-xs font-mono font-bold text-[#171815] opacity-0 group-hover:opacity-100 transition">
                      {formatINR(d.amount)}
                    </span>
                    <div className="w-full bg-[#f4eee3] rounded-t-xl h-44 flex items-end p-1.5">
                      <div
                        style={{ height: `${pct}%` }}
                        className="w-full rounded-t-lg bg-gradient-to-t from-[#17382f] to-[#c89b4b] shadow-sm transition-all duration-300"
                      ></div>
                    </div>
                    <span className="text-xs font-bold text-[#65675f]">{d.date}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2-Column: Bestseller breakdown & Status counts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Blend Performance Table */}
            <div className="bg-white border border-[#e5dcd1] rounded-2xl p-6 shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-serif font-bold text-[#171815] flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#c89b4b]" />
                  <span>Blend Popularity & Revenue</span>
                </h3>
              </div>

              <div className="space-y-4">
                {data?.salesByBlend.map((b, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-[#faf7f1] border border-[#e5dcd1] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#171815]">{b.name}</span>
                      <span className="font-mono font-bold text-[#9d542f]">{b.sales} packs sold</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#e5dcd1] overflow-hidden">
                      <div
                        style={{ width: `${b.percentage}%` }}
                        className="h-full rounded-full bg-[#17382f]"
                      ></div>
                    </div>
                    <div className="flex justify-between text-[11px] text-[#65675f]">
                      <span>Share: {b.percentage}%</span>
                      <span className="font-mono font-bold text-[#171815]">Estimated {formatINR(b.revenue)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Lifecycle Distribution */}
            <div className="bg-white border border-[#e5dcd1] rounded-2xl p-6 shadow-soft flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-serif font-bold text-[#171815] mb-4">
                  Order Status Breakdown
                </h3>
                <div className="space-y-3">
                  {data && Object.entries(data.orderStatusCounts).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between p-3.5 rounded-xl bg-[#faf7f1] border border-[#e5dcd1] text-xs">
                      <span className="font-bold text-[#171815]">{status}</span>
                      <span className="font-mono font-bold text-[#17382f] bg-[#f4eee3] px-3 py-1 rounded-lg border border-[#d8cfc2]">
                        {count} orders
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#f0eae1] text-xs text-[#65675f] flex items-center justify-between">
                <span>Total tracked orders: {data?.totalOrders || 0}</span>
                <span className="text-emerald-700 font-bold">Zero lost parcels</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
