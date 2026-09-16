'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import AdminHeader from '@/components/AdminHeader';
import { Product, Variant } from '@/lib/types';
import { 
  Package, 
  Save, 
  Plus, 
  Trash2, 
  CheckCircle2,
  Coffee,
  X,
  Database,
  Info
} from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New product state
  const [newName, setNewName] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newCategory, setNewCategory] = useState('Signature Blends');
  const [newPrice200, setNewPrice200] = useState('349');
  const [newPrice500, setNewPrice500] = useState('799');
  const [newPrice1000, setNewPrice1000] = useState('1499');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products');
      if (res.status === 401) {
        window.location.href = '/login';
        return;
      }
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handlePriceChange = (productId: string, variantIndex: number, newPrice: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== productId) return p;
      const nextVariants = [...p.variants];
      nextVariants[variantIndex] = {
        ...nextVariants[variantIndex],
        price: Number(newPrice) || 0
      };
      return { ...p, variants: nextVariants };
    }));
  };

  const handleVariantStockToggle = (productId: string, variantIndex: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== productId) return p;
      const nextVariants = [...p.variants];
      nextVariants[variantIndex] = {
        ...nextVariants[variantIndex],
        stock: !nextVariants[variantIndex].stock
      };
      return { ...p, variants: nextVariants };
    }));
  };

  const handleOverallStockToggle = (productId: string) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== productId) return p;
      return { ...p, stock: !p.stock };
    }));
  };

  const saveProductChanges = async (product: Product) => {
    try {
      setSavingId(product.id);
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });

      const data = await res.json();
      if (data.success) {
        showToast(`Prices & inventory updated for "${product.name}"`);
      } else {
        alert(data.message || 'Failed to update');
      }
    } catch (e) {
      console.error(e);
      alert('Error updating product');
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}" from store inventory?`)) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setProducts(prev => prev.filter(p => p.id !== id));
        showToast(`Product "${name}" removed`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      const variants: Variant[] = [
        { weight: '200 g', price: Number(newPrice200) || 349, sku: `SH-${newName.slice(0, 4).toUpperCase()}-200`, stock: true },
        { weight: '500 g', price: Number(newPrice500) || 799, sku: `SH-${newName.slice(0, 4).toUpperCase()}-500`, stock: true },
        { weight: '1000 g', price: Number(newPrice1000) || 1499, sku: `SH-${newName.slice(0, 4).toUpperCase()}-1000`, stock: true }
      ];

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          subtitle: newSubtitle || 'Aromatic Handcrafted Blend',
          description: 'Finest artisanal spices curated for authentic flavor.',
          category: newCategory,
          variants,
          flavourNotes: ['ROBUST', 'SPICED', 'RICH'],
          ingredients: ['Estate Black Tea', 'Whole Cardamom', 'Spices'],
          stock: true,
          featured: true
        })
      });

      const data = await res.json();
      if (data.success) {
        setProducts(prev => [data.data, ...prev]);
        setShowAddModal(false);
        setNewName('');
        setNewSubtitle('');
        showToast(`Published blend "${newName}"`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#faf7f1]">
      <AdminSidebar />

      <main className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="Products & Pricing Management"
          subtitle="Pack sizes, pricing and availability — saved straight to Postgres"
          onRefresh={fetchProducts}
          isRefreshing={loading}
        />

        {/* Toast feedback */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#17382f] text-[#faf7f1] px-4 py-3 rounded-xl shadow-elevated flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle2 className="w-5 h-5 text-[#c89b4b]" />
            <span className="text-xs font-bold">{toastMessage}</span>
          </div>
        )}

        <div className="p-8 space-y-6 flex-1 overflow-y-auto">
          {/* Data Origin Info Banner */}
          <div className="p-4 rounded-xl bg-[#f4eee3] border border-[#e5dcd1] flex items-center justify-between gap-3 text-xs text-[#65675f]">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-[#17382f] shrink-0" />
              <span>
                <strong>Data Source:</strong> The <code className="bg-white px-1.5 py-0.5 rounded border border-[#d8cfc2] font-mono text-[#17382f]">products</code> table in Postgres. The storefront reads the same rows, so a saved price is live immediately — nothing is bundled into the site.
              </span>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl bg-[#17382f] hover:bg-[#102820] text-[#faf7f1] text-xs font-bold shadow-sm flex items-center gap-2 transition shrink-0"
            >
              <Plus className="w-4 h-4 text-[#c89b4b]" />
              <span>Add New Blend</span>
            </button>
          </div>

          {/* Products List Cards */}
          <div className="space-y-6">
            {products.map((product) => {
              const isSaving = savingId === product.id;

              return (
                <div 
                  key={product.id}
                  className="bg-white border border-[#e5dcd1] rounded-2xl p-6 shadow-soft transition hover:border-[#17382f]/30"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6 border-b border-[#f0eae1]">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-[#f4eee3] border border-[#e5dcd1] flex items-center justify-center shrink-0 text-[#9d542f] shadow-xs">
                        <Coffee className="w-7 h-7" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h2 className="text-2xl font-serif font-bold text-[#171815]">{product.name}</h2>
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#f4eee3] text-[#17382f] border border-[#d8cfc2]">
                            {product.category}
                          </span>
                          {product.stock ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              Active in Store
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                              Disabled
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#65675f] mt-1 italic font-serif">{product.subtitle}</p>
                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                          {product.flavourNotes?.map((note, nIdx) => (
                            <span key={nIdx} className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#faf7f1] text-[#65675f] border border-[#e5dcd1]">
                              {note}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Stock switch & Save button */}
                    <div className="flex items-center gap-3 self-end lg:self-start">
                      <button
                        onClick={() => handleOverallStockToggle(product.id)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition ${
                          product.stock
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
                        }`}
                      >
                        {product.stock ? 'In Stock' : 'Out of Stock'}
                      </button>

                      <button
                        onClick={() => saveProductChanges(product)}
                        disabled={isSaving}
                        className="px-4 py-1.5 rounded-xl bg-[#17382f] hover:bg-[#102820] text-[#faf7f1] text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50 shadow-sm"
                      >
                        {isSaving ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-3.5 h-3.5 text-[#c89b4b]" />
                            <span>Save Prices</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        className="p-2 rounded-xl text-[#8e8d87] hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Variants & Pricing Grid */}
                  <div className="mt-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#65675f] mb-3">
                      Package Weights & Customer Pricing (INR ₹)
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {product.variants?.map((variant, vIdx) => (
                        <div 
                          key={vIdx}
                          className="bg-[#faf7f1] border border-[#e5dcd1] rounded-xl p-4 flex flex-col justify-between"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-[#171815] bg-[#f4eee3] px-2.5 py-0.5 rounded border border-[#d8cfc2]">
                              {variant.weight}
                            </span>
                            <span className="text-[11px] text-[#8e8d87] font-mono">
                              {variant.sku}
                            </span>
                          </div>

                          {/* Editable Price */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] text-[#65675f] uppercase font-bold">
                              Selling Price (₹)
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#9d542f] font-bold">
                                ₹
                              </span>
                              <input
                                type="number"
                                min="0"
                                step="1"
                                value={variant.price}
                                onChange={(e) => handlePriceChange(product.id, vIdx, Number(e.target.value))}
                                className="w-full bg-white border border-[#d8cfc2] focus:border-[#17382f] rounded-lg pl-7 pr-3 py-2 text-sm font-mono font-bold text-[#171815] outline-none transition"
                              />
                            </div>
                          </div>

                          {/* Variant Stock Toggle */}
                          <div className="mt-3 pt-3 border-t border-[#e5dcd1] flex items-center justify-between">
                            <span className="text-xs text-[#65675f]">Availability</span>
                            <button
                              onClick={() => handleVariantStockToggle(product.id, vIdx)}
                              className={`text-[11px] font-bold px-2.5 py-0.5 rounded transition ${
                                variant.stock
                                  ? 'text-emerald-800 bg-emerald-50 border border-emerald-200'
                                  : 'text-rose-800 bg-rose-50 border border-rose-200'
                              }`}
                            >
                              {variant.stock ? 'Available' : 'Sold Out'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Add Product Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="bg-white border border-[#e5dcd1] rounded-2xl p-6 w-full max-w-lg shadow-card">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#f0eae1]">
                <h3 className="text-xl font-serif font-bold text-[#171815]">Create New Tea Blend</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 rounded-lg text-[#8e8d87] hover:text-[#171815]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddProduct} className="space-y-4">
                <div>
                  <label className="block text-xs text-[#65675f] uppercase font-bold mb-1">
                    Blend Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Saffron Gold Estate Reserve"
                    className="w-full bg-[#faf7f1] border border-[#d8cfc2] rounded-xl px-3.5 py-2 text-sm text-[#171815] outline-none focus:border-[#17382f]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#65675f] uppercase font-bold mb-1">
                    Subtitle / Tasting Notes
                  </label>
                  <input
                    type="text"
                    value={newSubtitle}
                    onChange={(e) => setNewSubtitle(e.target.value)}
                    placeholder="e.g. Rare Saffron Threads · Golden Liquor · Sweet"
                    className="w-full bg-[#faf7f1] border border-[#d8cfc2] rounded-xl px-3.5 py-2 text-sm text-[#171815] outline-none focus:border-[#17382f]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#65675f] uppercase font-bold mb-1">
                      200 g Price (₹)
                    </label>
                    <input
                      type="number"
                      value={newPrice200}
                      onChange={(e) => setNewPrice200(e.target.value)}
                      className="w-full bg-[#faf7f1] border border-[#d8cfc2] rounded-xl px-3 py-2 text-sm text-[#171815] font-mono outline-none focus:border-[#17382f]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#65675f] uppercase font-bold mb-1">
                      500 g Price (₹)
                    </label>
                    <input
                      type="number"
                      value={newPrice500}
                      onChange={(e) => setNewPrice500(e.target.value)}
                      className="w-full bg-[#faf7f1] border border-[#d8cfc2] rounded-xl px-3 py-2 text-sm text-[#171815] font-mono outline-none focus:border-[#17382f]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#65675f] uppercase font-bold mb-1">
                      1000 g Price (₹)
                    </label>
                    <input
                      type="number"
                      value={newPrice1000}
                      onChange={(e) => setNewPrice1000(e.target.value)}
                      className="w-full bg-[#faf7f1] border border-[#d8cfc2] rounded-xl px-3 py-2 text-sm text-[#171815] font-mono outline-none focus:border-[#17382f]"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-[#f0eae1] flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl bg-[#f4eee3] text-xs font-bold text-[#65675f] hover:text-[#171815] transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#17382f] hover:bg-[#102820] text-xs font-bold text-[#faf7f1] transition shadow-sm"
                  >
                    Publish Blend
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
