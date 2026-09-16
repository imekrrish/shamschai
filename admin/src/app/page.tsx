'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminSidebar from '@/components/AdminSidebar';
import AdminHeader from '@/components/AdminHeader';
import { AnalyticsSummary, Order, Payment } from '@/lib/types';
import { 
  TrendingUp, 
  ShoppingBag, 
  CreditCard, 
  DollarSign, 
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Package, 
  Clock, 
  CheckCircle2, 
  Truck, 
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Database
} from 'lucide-react';

/**
 * A period-on-period change. Renders an em dash when there is no earlier
 * window to compare against, so the tile never implies growth it cannot show.
 */
function Delta({ value, suffix }: { value: number | null; suffix: string }) {
  if (value === null) {
    return (
      <div className="flex items-center gap-1.5 mt-1.5 text-xs text-[#8a8c83] font-medium">
        <Minus className="w-3.5 h-3.5" />
        <span>No prior period yet</span>
      </div>
    );
  }
  const up = value >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <div className={`flex items-center gap-1.5 mt-1.5 text-xs font-semibold ${up ? 'text-emerald-700' : 'text-[#a8442f]'}`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{up ? '+' : ''}{value}% {suffix}</span>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setRefreshing(true);
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
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const formatINR = (val: number) => {
    return '₹' + Number(val || 0).toLocaleString('en-IN');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">Delivered</span>;
      case 'SHIPPED':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">Shipped</span>;
      case 'PROCESSING':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">Processing</span>;
      case 'CONFIRMED':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200">Confirmed</span>;
      case 'PENDING':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-yellow-50 text-yellow-800 border border-yellow-200">Pending</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">Cancelled</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">Paid</span>;
      case 'PENDING':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">Pending</span>;
      case 'REFUNDED':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">Refunded</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen flex bg-[#faf7f1]">
      <AdminSidebar />

      <main className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="Executive Overview"
          subtitle="Real-time revenue, order fulfillment & payment settlements"
          onRefresh={fetchAnalytics}
          isRefreshing={refreshing}
        />

        <div className="p-8 space-y-8 flex-1 overflow-y-auto">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Revenue */}
            <div className="bg-white border border-[#e5dcd1] rounded-2xl p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#65675f]">Total Revenue</span>
                <div className="w-8 h-8 rounded-lg bg-[#e8efe9] text-[#17382f] flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-3xl font-serif font-bold text-[#171815]">
                  {loading ? '...' : formatINR(data?.totalRevenue || 0)}
                </div>
                <Delta value={data?.revenueGrowthMonth ?? null} suffix="vs last 30 days" />
              </div>
            </div>

            {/* Orders */}
            <div className="bg-white border border-[#e5dcd1] rounded-2xl p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#65675f]">Total Orders</span>
                <div className="w-8 h-8 rounded-lg bg-[#fdf2ec] text-[#9d542f] flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-3xl font-serif font-bold text-[#171815]">
                  {loading ? '...' : data?.totalOrders || 0}
                </div>
                <Delta value={data?.ordersGrowthMonth ?? null} suffix="vs last 30 days" />
              </div>
            </div>

            {/* Average Order Value */}
            <div className="bg-white border border-[#e5dcd1] rounded-2xl p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#65675f]">Average Order (AOV)</span>
                <div className="w-8 h-8 rounded-lg bg-[#fdf8eb] text-[#8f6820] flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-3xl font-serif font-bold text-[#171815]">
                  {loading ? '...' : formatINR(data?.averageOrderValue || 0)}
                </div>
                <Delta value={data?.aovGrowthMonth ?? null} suffix="vs last 30 days" />
              </div>
            </div>

            {/* Paid Rate */}
            <div className="bg-white border border-[#e5dcd1] rounded-2xl p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#65675f]">Payment Success</span>
                <div className="w-8 h-8 rounded-lg bg-[#e8efe9] text-[#17382f] flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-3xl font-serif font-bold text-[#171815]">
                  {loading ? '...' : `${data?.paidRatePercent || 92}%`}
                </div>
                <div className="flex items-center gap-1.5 mt-1.5 text-xs text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Settlements automated</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action / Operational Status Row */}
          <div className="p-5 rounded-2xl bg-white border border-[#e5dcd1] flex flex-wrap items-center justify-between gap-4 shadow-soft">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#17382f] flex items-center justify-center text-[#c89b4b] shadow-sm">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#171815]">Fulfillment & Dispatch Pipeline</p>
                <p className="text-xs text-[#65675f]">
                  {data?.orderStatusCounts?.PROCESSING || 0} Processing · {data?.orderStatusCounts?.CONFIRMED || 0} Confirmed · {data?.orderStatusCounts?.PENDING || 0} Awaiting Payment
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link 
                href="/products" 
                className="px-4 py-2 rounded-xl bg-[#f4eee3] hover:bg-[#eae2d3] border border-[#d8cfc2] text-xs font-bold text-[#171815] transition flex items-center gap-1.5"
              >
                <span>Edit Tea Prices</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#17382f]" />
              </Link>
              <Link 
                href="/orders" 
                className="px-4 py-2 rounded-xl bg-[#17382f] hover:bg-[#102820] text-xs font-bold text-[#faf7f1] transition flex items-center gap-1.5 shadow-sm"
              >
                <span>Process Orders</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#c89b4b]" />
              </Link>
            </div>
          </div>

          {/* Charts & Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 7-Day Revenue Trend Chart */}
            <div className="lg:col-span-2 bg-white border border-[#e5dcd1] rounded-2xl p-6 shadow-soft">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-serif font-bold text-[#171815]">7-Day Revenue Velocity</h2>
                  <p className="text-xs text-[#65675f]">Daily customer orders & gross INR intake</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#e8efe9] text-[#17382f] border border-[#17382f]/20">
                  Live Synchronized
                </span>
              </div>

              {/* Visual Bar Chart. A day with no revenue stays flat rather than
                  being padded to a minimum height that would imply takings. */}
              <div className="flex items-end justify-between gap-3 pt-6 px-2">
                {(() => {
                  const days = data?.dailyRevenue ?? [];
                  const peak = Math.max(0, ...days.map(d => d.amount));
                  return days.map((d, i) => {
                    const ratio = peak > 0 ? d.amount / peak : 0;
                    const label = new Date(d.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2 group min-w-0">
                        <span className={`text-[11px] font-mono tabular-nums ${d.amount > 0 ? 'text-[#171815] font-semibold' : 'text-[#a8a99f]'}`}>
                          {d.amount > 0 ? '₹' + Math.round(d.amount).toLocaleString('en-IN') : '—'}
                        </span>
                        <div className="w-full h-32 flex items-end">
                          <div
                            style={{ height: ratio > 0 ? `${Math.max(4, Math.round(ratio * 100))}%` : '2px' }}
                            title={`${label}: ₹${Math.round(d.amount).toLocaleString('en-IN')} · ${d.orders} order${d.orders === 1 ? '' : 's'}`}
                            className={`w-full rounded-t-md transition-all duration-300 ${
                              d.amount > 0
                                ? 'bg-gradient-to-t from-[#17382f] to-[#2b6152] group-hover:to-[#c89b4b]'
                                : 'bg-[#e5dcd1]'
                            }`}
                          />
                        </div>
                        <span className="text-[11px] font-semibold text-[#65675f] group-hover:text-[#171815] transition whitespace-nowrap">
                          {label}
                        </span>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Sales by Tea Blend */}
            <div className="bg-white border border-[#e5dcd1] rounded-2xl p-6 shadow-soft flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-serif font-bold text-[#171815]">Blend Distribution</h2>
                  <Link href="/products" className="text-xs text-[#17382f] font-bold hover:underline flex items-center gap-0.5">
                    Catalog
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
                <p className="text-xs text-[#65675f] mb-5">Volume split across handcrafted tea blends</p>

                <div className="space-y-4">
                  {data?.salesByBlend?.map((item, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#171815] truncate pr-2">{item.name}</span>
                        <span className="font-mono font-bold text-[#9d542f] shrink-0">{item.percentage}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#f4eee3] overflow-hidden">
                        <div
                          style={{ width: `${item.percentage}%` }}
                          className={`h-full rounded-full ${
                            idx === 0
                              ? 'bg-[#17382f]'
                              : idx === 1
                              ? 'bg-[#9d542f]'
                              : idx === 2
                              ? 'bg-[#c89b4b]'
                              : 'bg-[#a39682]'
                          }`}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#f0eae1] flex items-center justify-between text-xs text-[#65675f]">
                <span>Active SKUs: {data?.activeProducts || 5}</span>
                <span className="text-[#9d542f] font-bold">100% Estate Single-Origin</span>
              </div>
            </div>
          </div>

          {/* Recent Orders & Recent Payments 2-Column */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders Table */}
            <div className="bg-white border border-[#e5dcd1] rounded-2xl p-6 shadow-soft">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-xl font-serif font-bold text-[#171815]">Live Customer Orders</h2>
                  <p className="text-xs text-[#65675f]">Orders originating from storefront</p>
                </div>
                <Link 
                  href="/orders" 
                  className="text-xs font-bold text-[#17382f] hover:underline flex items-center gap-1 transition"
                >
                  <span>See All</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#e5dcd1] text-[#65675f] uppercase font-bold text-[10px]">
                      <th className="pb-3">Order #</th>
                      <th className="pb-3">Customer</th>
                      <th className="pb-3">Total</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0eae1]">
                    {data?.recentOrders?.map((order) => (
                      <tr key={order.id} className="hover:bg-[#faf7f1] transition">
                        <td className="py-3 font-mono font-bold text-[#171815]">
                          <Link href={`/orders`} className="hover:text-[#17382f]">
                            {order.orderNumber}
                          </Link>
                        </td>
                        <td className="py-3">
                          <p className="font-bold text-[#171815]">{order.customerName}</p>
                          <p className="text-[11px] text-[#65675f]">{order.shippingAddress.city}</p>
                        </td>
                        <td className="py-3 font-bold text-[#171815] font-mono">
                          {formatINR(order.totalAmount)}
                        </td>
                        <td className="py-3">
                          {getStatusBadge(order.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Payments Received */}
            <div className="bg-white border border-[#e5dcd1] rounded-2xl p-6 shadow-soft">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-xl font-serif font-bold text-[#171815]">Payments Received</h2>
                  <p className="text-xs text-[#65675f]">Gateway settlements & transaction tokens</p>
                </div>
                <Link 
                  href="/payments" 
                  className="text-xs font-bold text-[#17382f] hover:underline flex items-center gap-1 transition"
                >
                  <span>See All</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#e5dcd1] text-[#65675f] uppercase font-bold text-[10px]">
                      <th className="pb-3">Txn Ref</th>
                      <th className="pb-3">Provider</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3">State</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0eae1]">
                    {data?.recentPayments?.map((pay) => (
                      <tr key={pay.id} className="hover:bg-[#faf7f1] transition">
                        <td className="py-3">
                          <p className="font-mono font-bold text-[#171815]">{pay.transactionRef}</p>
                          <p className="text-[10px] text-[#65675f]">{pay.orderNumber}</p>
                        </td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#f4eee3] text-[#171815] border border-[#d8cfc2]">
                            {pay.provider}
                          </span>
                        </td>
                        <td className="py-3 font-bold text-[#171815] font-mono">
                          {formatINR(pay.amount)}
                        </td>
                        <td className="py-3">
                          {getPaymentBadge(pay.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
