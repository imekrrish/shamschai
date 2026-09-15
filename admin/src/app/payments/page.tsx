'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import AdminHeader from '@/components/AdminHeader';
import { Payment, PaymentStatus } from '@/lib/types';
import { 
  CreditCard, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  RotateCcw, 
  ShieldCheck, 
  Copy,
  Check,
  Database
} from 'lucide-react';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState({
    totalCollected: 0,
    pendingAmount: 0,
    refundedAmount: 0,
    totalTransactions: 0
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [providerFilter, setProviderFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (providerFilter !== 'ALL') params.append('provider', providerFilter);
      if (search) params.append('search', search);

      const res = await fetch(`/api/payments?${params.toString()}`);
      if (res.status === 401) {
        window.location.href = '/login';
        return;
      }
      const json = await res.json();
      if (json.success) {
        setPayments(json.data);
        setSummary(json.summary);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [statusFilter, providerFilter, search]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUpdatePayment = async (id: string, newStatus: PaymentStatus) => {
    try {
      const res = await fetch('/api/payments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id, 
          status: newStatus,
          settlementStatus: newStatus === 'PAID' ? 'SETTLED' : newStatus === 'REFUNDED' ? 'REFUNDED' : 'PENDING_SETTLEMENT'
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchPayments();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const formatINR = (val: number) => {
    return '₹' + Number(val || 0).toLocaleString('en-IN');
  };

  const getStatusPill = (status: PaymentStatus) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>Captured & Paid</span>
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3" />
            <span>Awaiting Settlement</span>
          </span>
        );
      case 'REFUNDED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
            <RotateCcw className="w-3 h-3" />
            <span>Refund Processed</span>
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
            <AlertCircle className="w-3 h-3" />
            <span>Payment Failed</span>
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen flex bg-[#faf7f1]">
      <AdminSidebar />

      <main className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="Payments Received & Settlements"
          subtitle="Real-time transaction log, gateway verification & funds tracking"
          onRefresh={fetchPayments}
          isRefreshing={loading}
        />

        <div className="p-8 space-y-6 flex-1 overflow-y-auto">
          {/* Data Source Indicator */}
          <div className="p-3.5 rounded-xl bg-[#f4eee3] border border-[#e5dcd1] flex items-center justify-between text-xs text-[#65675f]">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-[#17382f]" />
              <span>
                <strong>Data Source:</strong> PostgreSQL table <code className="bg-white px-1.5 py-0.5 rounded border border-[#d8cfc2] font-mono text-[#17382f]">payments</code> joined with <code className="bg-white px-1.5 py-0.5 rounded border border-[#d8cfc2] font-mono text-[#17382f]">orders</code>.
              </span>
            </div>
            <span className="font-semibold text-[#17382f]">All Payments Verified</span>
          </div>

          {/* Financial Summary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Settled */}
            <div className="bg-white border border-[#e5dcd1] rounded-2xl p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#65675f]">Total Collected</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              </div>
              <p className="mt-2 text-3xl font-serif font-bold text-[#171815]">
                {formatINR(summary.totalCollected)}
              </p>
              <p className="text-xs text-emerald-700 mt-1 flex items-center gap-1 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified in bank escrow</span>
              </p>
            </div>

            {/* Pending In-Flight */}
            <div className="bg-white border border-[#e5dcd1] rounded-2xl p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#65675f]">Pending In-Flight</span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              </div>
              <p className="mt-2 text-3xl font-serif font-bold text-[#171815]">
                {formatINR(summary.pendingAmount)}
              </p>
              <p className="text-xs text-amber-700 mt-1 font-semibold">
                Settling in T+1 bank cycle
              </p>
            </div>

            {/* Total Refunded */}
            <div className="bg-white border border-[#e5dcd1] rounded-2xl p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#65675f]">Refunds Issued</span>
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              </div>
              <p className="mt-2 text-3xl font-serif font-bold text-[#171815]">
                {formatINR(summary.refundedAmount)}
              </p>
              <p className="text-xs text-[#65675f] mt-1 font-medium">
                Customer account credited
              </p>
            </div>

            {/* Total Transactions */}
            <div className="bg-white border border-[#e5dcd1] rounded-2xl p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#65675f]">Transactions</span>
                <CreditCard className="w-4 h-4 text-[#17382f]" />
              </div>
              <p className="mt-2 text-3xl font-serif font-bold text-[#171815]">
                {summary.totalTransactions}
              </p>
              <p className="text-xs text-[#65675f] mt-1 font-medium">
                Across UPI, Cards & Wallets
              </p>
            </div>
          </div>

          {/* Filter and Search Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#8e8d87] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search transaction ID, order #, customer name..."
                className="w-full bg-white border border-[#d8cfc2] focus:border-[#17382f] rounded-xl pl-10 pr-4 py-2 text-xs text-[#171815] placeholder-[#9c9b94] outline-none transition shadow-2xs"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Status Filter */}
              <div className="flex items-center gap-1 bg-white border border-[#e5dcd1] rounded-xl p-1 shadow-2xs">
                {['ALL', 'PAID', 'PENDING', 'REFUNDED'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                      statusFilter === s
                        ? 'bg-[#17382f] text-[#faf7f1]'
                        : 'text-[#65675f] hover:text-[#171815]'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Provider Filter */}
              <div className="flex items-center gap-1 bg-white border border-[#e5dcd1] rounded-xl p-1 shadow-2xs">
                {['ALL', 'RAZORPAY', 'PHONEPE', 'UPI'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setProviderFilter(p)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                      providerFilter === p
                        ? 'bg-[#f4eee3] text-[#171815] border border-[#d8cfc2]'
                        : 'text-[#65675f] hover:text-[#171815]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white border border-[#e5dcd1] rounded-2xl overflow-hidden shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#e5dcd1] bg-[#faf7f1] text-[#65675f] uppercase font-bold text-[10px]">
                    <th className="py-3.5 px-5">Transaction Reference</th>
                    <th className="py-3.5 px-4">Order Link</th>
                    <th className="py-3.5 px-4">Gateway</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Settlement State</th>
                    <th className="py-3.5 px-4">Paid Timestamp</th>
                    <th className="py-3.5 px-5 text-right">Reconcile</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0eae1]">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-[#faf7f1] transition">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#171815]">
                            {payment.transactionRef}
                          </span>
                          <button
                            onClick={() => copyToClipboard(payment.transactionRef)}
                            className="text-[#8e8d87] hover:text-[#171815] transition"
                            title="Copy Transaction ID"
                          >
                            {copiedId === payment.transactionRef ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-mono font-semibold text-[#65675f]">
                        {payment.orderNumber}
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#f4eee3] text-[#17382f] border border-[#d8cfc2]">
                          {payment.provider}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-bold text-[#171815]">{payment.customerName}</p>
                        <p className="text-[11px] text-[#65675f]">{payment.customerEmail}</p>
                      </td>
                      <td className="py-4 px-4 font-mono font-bold text-[#171815]">
                        {formatINR(payment.amount)}
                      </td>
                      <td className="py-4 px-4">
                        {getStatusPill(payment.status)}
                      </td>
                      <td className="py-4 px-4 text-[#65675f]">
                        {payment.paidAt ? (
                          new Date(payment.paidAt).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        ) : (
                          <span className="text-amber-700 font-semibold">Pending Capture</span>
                        )}
                      </td>
                      <td className="py-4 px-5 text-right">
                        {payment.status === 'PENDING' ? (
                          <button
                            onClick={() => handleUpdatePayment(payment.id, 'PAID')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-[11px] font-bold transition"
                          >
                            Verify & Settle
                          </button>
                        ) : payment.status === 'PAID' ? (
                          <button
                            onClick={() => handleUpdatePayment(payment.id, 'REFUNDED')}
                            className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 text-[10px] font-bold transition"
                          >
                            Issue Refund
                          </button>
                        ) : (
                          <span className="text-[11px] text-[#8e8d87] font-semibold">Settled</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {payments.length === 0 && !loading && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-[#8e8d87]">
                        No payment transactions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
