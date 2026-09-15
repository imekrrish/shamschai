'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import AdminHeader from '@/components/AdminHeader';
import { Order, OrderStatus } from '@/lib/types';
import { 
  ShoppingBag, 
  Search, 
  Eye, 
  MapPin, 
  Phone, 
  Mail, 
  X, 
  ChevronRight,
  Database,
  Info
} from 'lucide-react';

const STATUS_FILTERS = [
  'ALL', 
  'PENDING', 
  'CONFIRMED', 
  'PROCESSING', 
  'SHIPPED', 
  'DELIVERED', 
  'CANCELLED'
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeFilter !== 'ALL') params.append('status', activeFilter);
      if (searchTerm) params.append('search', searchTerm);

      const res = await fetch(`/api/orders?${params.toString()}`);
      if (res.status === 401) {
        window.location.href = '/login';
        return;
      }
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [activeFilter, searchTerm]);

  const updateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      setUpdatingId(orderId);
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setOrders(prev => prev.map(o => o.id === orderId ? data.data : o));
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(data.data);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  const formatINR = (val: number) => {
    return '₹' + Number(val || 0).toLocaleString('en-IN');
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">Delivered</span>;
      case 'SHIPPED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">In Transit</span>;
      case 'PROCESSING':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">Processing</span>;
      case 'CONFIRMED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200">Confirmed</span>;
      case 'PENDING':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-50 text-yellow-800 border border-yellow-200">Payment Pending</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">Cancelled</span>;
    }
  };

  return (
    <div className="min-h-screen flex bg-[#faf7f1]">
      <AdminSidebar />

      <main className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="Orders Fulfillment Management"
          subtitle="Review live customer orders, update tracking states, and handle fulfillment"
          onRefresh={fetchOrders}
          isRefreshing={loading}
        />

        <div className="p-8 space-y-6 flex-1 overflow-y-auto">
          {/* Origin Banner */}
          <div className="p-3.5 rounded-xl bg-[#f4eee3] border border-[#e5dcd1] flex items-center justify-between text-xs text-[#65675f]">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-[#17382f]" />
              <span>
                <strong>Data Source:</strong> PostgreSQL table <code className="bg-white px-1.5 py-0.5 rounded border border-[#d8cfc2] font-mono text-[#17382f]">orders</code> and <code className="bg-white px-1.5 py-0.5 rounded border border-[#d8cfc2] font-mono text-[#17382f]">order_items</code>.
              </span>
            </div>
            <span className="font-semibold text-[#17382f]">Total Tracked: {orders.length}</span>
          </div>

          {/* Controls: Search & Status Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#8e8d87] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search order #, customer name, phone, city..."
                className="w-full bg-white border border-[#d8cfc2] focus:border-[#17382f] rounded-xl pl-10 pr-4 py-2 text-xs text-[#171815] placeholder-[#9c9b94] outline-none transition shadow-2xs"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {STATUS_FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                    activeFilter === f
                      ? 'bg-[#17382f] text-[#faf7f1] shadow-2xs'
                      : 'bg-white text-[#65675f] hover:text-[#171815] hover:bg-[#f4eee3] border border-[#e5dcd1]'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white border border-[#e5dcd1] rounded-2xl overflow-hidden shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#e5dcd1] bg-[#faf7f1] text-[#65675f] uppercase font-bold text-[10px]">
                    <th className="py-3.5 px-5">Order ID</th>
                    <th className="py-3.5 px-4">Date & Time</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Items</th>
                    <th className="py-3.5 px-4">Total</th>
                    <th className="py-3.5 px-4">Payment</th>
                    <th className="py-3.5 px-4">Fulfillment Status</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0eae1]">
                  {orders.map((order) => {
                    return (
                      <tr key={order.id} className="hover:bg-[#faf7f1] transition">
                        <td className="py-4 px-5">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="font-mono font-bold text-[#171815] hover:text-[#17382f] transition flex items-center gap-1"
                          >
                            <span>{order.orderNumber}</span>
                            <ChevronRight className="w-3 h-3 opacity-60 text-[#17382f]" />
                          </button>
                        </td>
                        <td className="py-4 px-4 text-[#65675f]">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-bold text-[#171815]">{order.customerName}</p>
                          <p className="text-[11px] text-[#65675f]">{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                        </td>
                        <td className="py-4 px-4">
                          <div className="space-y-0.5">
                            {order.items.map((it, i) => (
                              <p key={i} className="text-[#4a4b45] truncate max-w-[180px]">
                                {it.quantity}x {it.title} ({it.size})
                              </p>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 px-4 font-mono font-bold text-[#171815]">
                          {formatINR(order.totalAmount)}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                            order.paymentStatus === 'PAID'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                            {order.paymentStatus} · {order.paymentMethod}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          {getStatusBadge(order.status)}
                        </td>
                        <td className="py-4 px-5 text-right">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="px-3 py-1.5 rounded-lg bg-[#f4eee3] hover:bg-[#eae2d3] border border-[#d8cfc2] text-[#171815] transition flex items-center gap-1.5 ml-auto font-bold text-xs"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#17382f]" />
                            <span>Inspect</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {orders.length === 0 && !loading && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-[#8e8d87]">
                        No orders found matching criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Order Details Drawer / Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="bg-white border border-[#e5dcd1] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-card overflow-hidden">
              {/* Modal Header */}
              <div className="p-6 border-b border-[#f0eae1] flex items-center justify-between bg-[#faf7f1]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#17382f] text-[#c89b4b] flex items-center justify-center shadow-xs">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-serif font-bold text-[#171815]">Order {selectedOrder.orderNumber}</h3>
                      {getStatusBadge(selectedOrder.status)}
                    </div>
                    <p className="text-xs text-[#65675f]">
                      Placed on {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 rounded-lg text-[#8e8d87] hover:text-[#171815] transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6 overflow-y-auto flex-1">
                {/* Status Updater Buttons */}
                <div className="bg-[#faf7f1] border border-[#e5dcd1] rounded-xl p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#65675f] mb-2.5">
                    Update Fulfillment Lifecycle
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => updateStatus(selectedOrder.id, 'CONFIRMED')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        selectedOrder.status === 'CONFIRMED'
                          ? 'bg-purple-100 text-purple-900 border border-purple-300'
                          : 'bg-white text-[#4a4b45] hover:bg-[#f4eee3] border border-[#d8cfc2]'
                      }`}
                    >
                      Confirm Order
                    </button>
                    <button
                      onClick={() => updateStatus(selectedOrder.id, 'PROCESSING')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        selectedOrder.status === 'PROCESSING'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-white text-[#4a4b45] hover:bg-[#f4eee3] border border-[#d8cfc2]'
                      }`}
                    >
                      Pack / Processing
                    </button>
                    <button
                      onClick={() => updateStatus(selectedOrder.id, 'SHIPPED')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        selectedOrder.status === 'SHIPPED'
                          ? 'bg-blue-100 text-blue-900 border border-blue-300'
                          : 'bg-white text-[#4a4b45] hover:bg-[#f4eee3] border border-[#d8cfc2]'
                      }`}
                    >
                      Mark Shipped
                    </button>
                    <button
                      onClick={() => updateStatus(selectedOrder.id, 'DELIVERED')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        selectedOrder.status === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-white text-[#4a4b45] hover:bg-[#f4eee3] border border-[#d8cfc2]'
                      }`}
                    >
                      Mark Delivered
                    </button>
                    <button
                      onClick={() => updateStatus(selectedOrder.id, 'CANCELLED')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        selectedOrder.status === 'CANCELLED'
                          ? 'bg-rose-100 text-rose-900 border border-rose-300'
                          : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-200'
                      }`}
                    >
                      Cancel & Refund
                    </button>
                  </div>
                </div>

                {/* Items Ordered Table */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#65675f] mb-3">
                    Items In Package
                  </p>
                  <div className="bg-[#faf7f1] border border-[#e5dcd1] rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#f4eee3] text-[#65675f] uppercase text-[10px] font-bold">
                        <tr>
                          <th className="py-2.5 px-4">Item</th>
                          <th className="py-2.5 px-3">Size</th>
                          <th className="py-2.5 px-3">Price</th>
                          <th className="py-2.5 px-3">Qty</th>
                          <th className="py-2.5 px-4 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e5dcd1]">
                        {selectedOrder.items.map((it, idx) => (
                          <tr key={idx}>
                            <td className="py-3 px-4 font-bold text-[#171815]">{it.title}</td>
                            <td className="py-3 px-3 font-mono font-bold text-[#9d542f]">{it.size}</td>
                            <td className="py-3 px-3 font-mono text-[#65675f]">{formatINR(it.unitPrice)}</td>
                            <td className="py-3 px-3 font-mono font-bold text-[#171815]">{it.quantity}</td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-[#171815]">{formatINR(it.subtotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Financial calculation */}
                  <div className="mt-3 p-4 bg-[#f4eee3] rounded-xl text-xs space-y-1.5 text-[#65675f] border border-[#e5dcd1]">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-mono font-bold text-[#171815]">{formatINR(selectedOrder.subtotal)}</span>
                    </div>
                    {selectedOrder.discount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-bold">
                        <span>Discount Voucher:</span>
                        <span className="font-mono">-{formatINR(selectedOrder.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Shipping Fee:</span>
                      <span className="font-mono font-bold text-[#171815]">{selectedOrder.shippingFee === 0 ? 'FREE' : formatINR(selectedOrder.shippingFee)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-[#d8cfc2] font-bold text-sm text-[#171815]">
                      <span>Grand Total:</span>
                      <span className="font-mono text-[#9d542f] text-base">{formatINR(selectedOrder.totalAmount)}</span>
                    </div>
                  </div>
                </div>

                {/* Customer & Shipping Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-[#faf7f1] border border-[#e5dcd1] rounded-xl space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#65675f]">Customer Details</p>
                    <p className="text-sm font-bold text-[#171815]">{selectedOrder.customerName}</p>
                    <p className="text-xs text-[#65675f] flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#17382f]" />
                      <span>{selectedOrder.customerEmail}</span>
                    </p>
                    <p className="text-xs text-[#65675f] flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#17382f]" />
                      <span>{selectedOrder.customerPhone}</span>
                    </p>
                  </div>

                  <div className="p-4 bg-[#faf7f1] border border-[#e5dcd1] rounded-xl space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#65675f]">Shipping Destination</p>
                    <p className="text-xs text-[#171815] flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#9d542f] shrink-0 mt-0.5" />
                      <span>
                        {selectedOrder.shippingAddress.streetAddress},<br />
                        {selectedOrder.shippingAddress.landmark && <>{selectedOrder.shippingAddress.landmark},<br /></>}
                        {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.postalCode}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
