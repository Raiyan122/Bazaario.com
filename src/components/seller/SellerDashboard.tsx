import React, { useState } from 'react';
import {
  Store,
  Plus,
  Sparkles,
  Camera,
  DollarSign,
  Package,
  Star,
  TrendingUp,
  Trash2,
  Edit,
  CheckCircle2,
  Clock,
  Truck,
  AlertCircle,
  Tag,
  Boxes,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { Product, ProductCategory } from '../../types';
import { formatPrice } from '../../utils/currency';
import { CATEGORIES_LIST } from '../../data/mockCatalog';

export const SellerDashboard: React.FC = () => {
  const {
    products,
    addNewProduct,
    deleteProduct,
    orders,
    currency,
    openAIImageModal,
    openAIChatWithPrompt,
  } = useMarketplace();

  const [isNewListingOpen, setNewListingOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'listings' | 'orders' | 'strategy'>('listings');

  // Form State for new product
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Electronics & Gadgets');
  const [priceUSD, setPriceUSD] = useState<string>('89.99');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80'
  );
  const [isB2B, setIsB2B] = useState(false);
  const [moq, setMoq] = useState('10');
  const [tagsInput, setTagsInput] = useState('wireless, trending, fast-shipping');

  // Seller metrics
  const sellerProducts = products; // in demo, show vendor listings
  const totalGMV = sellerProducts.reduce((sum, p) => sum + p.basePriceUSD * 14, 0); // simulated sold items
  const avgRating =
    sellerProducts.reduce((sum, p) => sum + p.rating, 0) / (sellerProducts.length || 1);

  const [sellerPage, setSellerPage] = useState(1);
  const sellerItemsPerPage = 15;
  const sellerTotalPages = Math.max(1, Math.ceil(sellerProducts.length / sellerItemsPerPage));
  const paginatedSellerProducts = sellerProducts.slice(
    (sellerPage - 1) * sellerItemsPerPage,
    sellerPage * sellerItemsPerPage
  );

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !priceUSD) return;

    addNewProduct({
      title: title.trim(),
      category,
      basePriceUSD: parseFloat(priceUSD) || 49.99,
      description:
        description ||
        'Verified seller product listed on Bazaario Marketplace with fast global shipping.',
      images: [imageUrl],
      tags: tagsInput.split(',').map((t) => t.trim()),
      isB2BEligible: isB2B,
      moq: isB2B ? parseInt(moq) || 5 : undefined,
    });

    setNewListingOpen(false);
    setTitle('');
    setDescription('');
    alert('Listing published! It is now live in the Bazaario catalog.');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Top Welcome & KPI Header */}
      <div className="bg-[#F5F2ED] border border-[#E0D8CC] rounded-[32px] p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm text-[#3D3D35]">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-[#E0D8CC] text-[#5A5A40] border border-[#D4CDBC] px-3 py-1 rounded-full text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Verified Independent Seller Account</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#3D3D35]">
            Bazaario Vendor Portal &amp; AI Studio
          </h2>
          <p className="text-xs sm:text-sm text-[#A89F91] max-w-xl">
            Manage listings, track customer orders, and generate SEO titles &amp; pricing recommendations instantly with Gemini 3.1 Pro.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => openAIImageModal('seller_listing')}
            className="px-4 py-2.5 rounded-full bg-[#6B705C] hover:bg-[#5A5A40] text-white font-serif font-bold text-xs flex items-center gap-2 shadow-sm transition"
          >
            <Camera className="w-4 h-4" />
            <span>AI Photo Listing Tool</span>
          </button>

          <button
            onClick={() => setNewListingOpen(true)}
            className="px-4 py-2.5 rounded-full bg-[#5A5A40] hover:bg-[#484833] text-white font-serif font-bold text-xs flex items-center gap-2 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Product Listing</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E0D8CC] rounded-[24px] p-4 space-y-1 shadow-sm text-[#3D3D35]">
          <span className="text-[11px] font-semibold text-[#A89F91] uppercase tracking-wider">Estimated GMV</span>
          <div className="text-2xl font-serif font-bold text-[#3D3D35]">
            {formatPrice(totalGMV, currency)}
          </div>
          <span className="text-xs text-[#5A5A40] font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +18.4% this month
          </span>
        </div>

        <div className="bg-white border border-[#E0D8CC] rounded-[24px] p-4 space-y-1 shadow-sm text-[#3D3D35]">
          <span className="text-[11px] font-semibold text-[#A89F91] uppercase tracking-wider">Active Listings</span>
          <div className="text-2xl font-serif font-bold text-[#3D3D35]">{sellerProducts.length} items</div>
          <span className="text-xs text-[#A89F91]">All live on marketplace</span>
        </div>

        <div className="bg-white border border-[#E0D8CC] rounded-[24px] p-4 space-y-1 shadow-sm text-[#3D3D35]">
          <span className="text-[11px] font-semibold text-[#A89F91] uppercase tracking-wider">Vendor Rating</span>
          <div className="text-2xl font-serif font-bold text-[#8F6A48] flex items-center gap-1">
            <Star className="w-5 h-5 fill-[#8F6A48] text-[#8F6A48]" />
            <span>{avgRating.toFixed(1)}</span>
          </div>
          <span className="text-xs text-[#A89F91]">Based on verified reviews</span>
        </div>

        <div className="bg-white border border-[#E0D8CC] rounded-[24px] p-4 space-y-1 shadow-sm text-[#3D3D35]">
          <span className="text-[11px] font-semibold text-[#A89F91] uppercase tracking-wider">Response Time</span>
          <div className="text-2xl font-serif font-bold text-[#5A5A40]">&lt; 30 mins</div>
          <span className="text-xs text-[#A89F91]">Top 5% on Bazaario</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-3 border-b border-[#E0D8CC] pb-3">
        <button
          onClick={() => setActiveTab('listings')}
          className={`px-5 py-2 rounded-full text-xs font-serif font-bold transition ${
            activeTab === 'listings'
              ? 'bg-[#5A5A40] text-white shadow-sm'
              : 'bg-[#F5F2ED] text-[#A89F91] hover:text-[#3D3D35]'
          }`}
        >
          My Catalog Listings ({sellerProducts.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-5 py-2 rounded-full text-xs font-serif font-bold transition ${
            activeTab === 'orders'
              ? 'bg-[#5A5A40] text-white shadow-sm'
              : 'bg-[#F5F2ED] text-[#A89F91] hover:text-[#3D3D35]'
          }`}
        >
          Customer Order Queue ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('strategy')}
          className={`px-5 py-2 rounded-full text-xs font-serif font-bold transition flex items-center gap-1.5 ${
            activeTab === 'strategy'
              ? 'bg-[#6B705C] text-white shadow-sm'
              : 'bg-[#F5F2ED] text-[#A89F91] hover:text-[#3D3D35]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Seller Strategy Advisor</span>
        </button>
      </div>

      {/* Tab 1: Catalog Listings */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E0D8CC] rounded-[32px] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F2ED] text-[#5A5A40] uppercase font-serif font-bold border-b border-[#E0D8CC]">
                  <tr>
                    <th className="py-3.5 px-5">Product Name</th>
                    <th className="py-3.5 px-5">Category</th>
                    <th className="py-3.5 px-5">Price (USD)</th>
                    <th className="py-3.5 px-5">Rating</th>
                    <th className="py-3.5 px-5">Wholesale B2B</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E0D8CC] text-[#3D3D35]">
                  {paginatedSellerProducts.map((prod) => (
                    <tr key={prod.id} className="hover:bg-[#F5F2ED]/50 transition">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.images[0]}
                            alt={prod.title}
                            className="w-10 h-10 rounded-2xl object-cover bg-[#F5F2ED] border border-[#E0D8CC]"
                          />
                          <div>
                            <span className="font-serif font-bold text-[#3D3D35] block">{prod.title}</span>
                            <span className="text-[10px] text-[#A89F91]">ID: {prod.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-[#3D3D35] font-medium">{prod.category}</td>
                      <td className="py-3.5 px-5 font-serif font-bold text-[#5A5A40]">
                        {formatPrice(prod.basePriceUSD, currency)}
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="inline-flex items-center gap-1 font-bold text-[#8F6A48]">
                          <Star className="w-3 h-3 fill-[#8F6A48] text-[#8F6A48]" />
                          {prod.rating.toFixed(1)}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        {prod.isB2BEligible ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-[#E0D8CC] text-[#5A5A40] font-bold text-[10px]">
                            MOQ: {prod.moq}
                          </span>
                        ) : (
                          <span className="text-[#A89F91] text-[10px]">B2C Only</span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() =>
                              openAIChatWithPrompt(
                                `As a seller advisor, how can I optimize the SEO title and description for "${prod.title}" (${prod.category}) to rank higher?`
                              )
                            }
                            className="p-2 rounded-full bg-[#F5F2ED] hover:bg-[#E0D8CC] text-[#5A5A40] transition"
                            title="AI Listing SEO Booster"
                          >
                            <Sparkles className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteProduct(prod.id)}
                            className="p-2 rounded-full bg-[#F5F2ED] hover:bg-rose-100 text-[#A89F91] hover:text-rose-700 transition"
                            title="Delete Listing"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Seller Table Pagination */}
            {sellerTotalPages > 1 && (
              <div className="bg-[#F5F2ED] border-t border-[#E0D8CC] p-4 flex flex-wrap items-center justify-between gap-4">
                <span className="text-xs text-[#A89F91]">
                  Showing <strong className="text-[#3D3D35]">{(sellerPage - 1) * sellerItemsPerPage + 1}</strong>–
                  <strong className="text-[#3D3D35]">
                    {Math.min(sellerPage * sellerItemsPerPage, sellerProducts.length)}
                  </strong>{' '}
                  of <strong className="text-[#3D3D35]">{sellerProducts.length}</strong> listings
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSellerPage((p) => Math.max(1, p - 1))}
                    disabled={sellerPage === 1}
                    className="p-2 rounded-full border border-[#E0D8CC] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white text-[#3D3D35] transition"
                    title="Previous Page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <span className="text-xs font-serif font-bold text-[#3D3D35] px-3 py-1 bg-white rounded-full border border-[#E0D8CC]">
                    Page {sellerPage} of {sellerTotalPages}
                  </span>

                  <button
                    onClick={() => setSellerPage((p) => Math.min(sellerTotalPages, p + 1))}
                    disabled={sellerPage === sellerTotalPages}
                    className="p-2 rounded-full border border-[#E0D8CC] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white text-[#3D3D35] transition"
                    title="Next Page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Orders Queue */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white border border-[#E0D8CC] rounded-[32px] p-12 text-center text-[#A89F91] shadow-sm">
              <Package className="w-12 h-12 mx-auto opacity-30 mb-2 text-[#6B705C]" />
              <p className="text-sm font-serif font-bold text-[#3D3D35]">No orders waiting in queue</p>
            </div>
          ) : (
            orders.map((o) => (
              <div
                key={o.id}
                className="bg-white border border-[#E0D8CC] rounded-[32px] p-5 flex flex-wrap items-center justify-between gap-4 shadow-sm text-[#3D3D35]"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-serif font-bold text-[#3D3D35]">Order #{o.id}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-[#E0D8CC] text-[#5A5A40]">
                      {o.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#A89F91]">
                    Buyer: <strong className="text-[#3D3D35]">{o.shippingAddress.fullName}</strong> •{' '}
                    Courier: {o.courier}
                  </p>
                  <p className="text-xs text-[#5A5A40] font-bold">
                    Total Amount: {formatPrice(o.totalUSD, currency)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      alert(`Successfully marked Order #${o.id} as PACKED for shipment pickup.`)
                    }
                    className="px-4 py-2 rounded-full bg-[#F5F2ED] hover:bg-[#E0D8CC] text-[#3D3D35] text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <Package className="w-4 h-4 text-[#5A5A40]" />
                    <span>Mark Packed</span>
                  </button>
                  <button
                    onClick={() =>
                      alert(`Successfully marked Order #${o.id} as SHIPPED with tracking ${o.trackingNumber}.`)
                    }
                    className="px-4 py-2 rounded-full bg-[#5A5A40] hover:bg-[#484833] text-white text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <Truck className="w-4 h-4" />
                    <span>Ship Package</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: AI Seller Strategy Advisor */}
      {activeTab === 'strategy' && (
        <div className="bg-[#F5F2ED] border border-[#E0D8CC] rounded-[32px] p-6 sm:p-8 space-y-6 shadow-sm text-[#3D3D35]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#E0D8CC] text-[#5A5A40] border border-[#D4CDBC] flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-serif font-bold text-[#3D3D35]">
                Bazaario AI Seller Strategy Advisor
              </h3>
              <p className="text-xs text-[#A89F91]">
                Powered by <strong className="text-[#5A5A40]">gemini-3.1-pro-preview</strong> • Get instant pricing strategy, SEO title booster, and seasonal inventory advice.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              'How should I price my wireless earbuds to maximize profit on Bazaario?',
              'What are the top 5 high-demand categories to stock before holiday sales?',
              'How can I optimize my product titles and tags for better marketplace visibility?',
            ].map((question, i) => (
              <button
                key={i}
                onClick={() => openAIChatWithPrompt(question)}
                className="p-5 rounded-[24px] bg-white hover:bg-[#FDFCF8] border border-[#E0D8CC] hover:border-[#5A5A40] text-left text-xs font-semibold text-[#3D3D35] transition space-y-2 shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-[#5A5A40]" />
                <p className="line-clamp-2">{question}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Create New Product Modal */}
      {isNewListingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3D3D35]/50 backdrop-blur-sm p-3 sm:p-6 animate-fadeIn font-['Georgia',serif]">
          <div className="relative w-full max-w-2xl bg-white border border-[#E0D8CC] rounded-[32px] shadow-sm overflow-hidden text-[#3D3D35]">
            <div className="bg-[#F5F2ED] px-6 py-4 border-b border-[#E0D8CC] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Store className="w-5 h-5 text-[#5A5A40]" />
                <h3 className="text-base font-serif font-bold text-[#3D3D35]">Publish New Marketplace Listing</h3>
              </div>
              <button
                onClick={() => setNewListingOpen(false)}
                className="p-2 text-[#A89F91] hover:text-[#3D3D35] hover:bg-[#E0D8CC]/50 rounded-full transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto font-sans">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#3D3D35]">Product Title:</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Italian Full-Grain Leather Handbag"
                  className="w-full bg-white border border-[#E0D8CC] rounded-full px-4 py-2.5 text-xs text-[#3D3D35]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#3D3D35]">Category:</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-white border border-[#E0D8CC] rounded-full px-4 py-2.5 text-xs text-[#3D3D35]"
                  >
                    {CATEGORIES_LIST.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#3D3D35]">Base Price (USD):</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={priceUSD}
                    onChange={(e) => setPriceUSD(e.target.value)}
                    className="w-full bg-white border border-[#E0D8CC] rounded-full px-4 py-2.5 text-xs text-[#3D3D35]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#3D3D35]">Image URL:</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-white border border-[#E0D8CC] rounded-full px-4 py-2.5 text-xs text-[#3D3D35] font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#3D3D35]">Description:</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Product specifications, craftsmanship, and shipping details..."
                  className="w-full bg-white border border-[#E0D8CC] rounded-2xl px-4 py-2.5 text-xs text-[#3D3D35]"
                />
              </div>

              {/* B2B Wholesale Toggle */}
              <div className="bg-[#F5F2ED] p-4 rounded-2xl border border-[#E0D8CC] flex items-center justify-between">
                <div>
                  <span className="text-xs font-serif font-bold text-[#3D3D35] block">
                    Enable B2B Wholesale Tier
                  </span>
                  <span className="text-[11px] text-[#A89F91]">
                    Allow bulk orders with Minimum Order Quantity (MOQ)
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isB2B}
                  onChange={(e) => setIsB2B(e.target.checked)}
                  className="w-4 h-4 accent-[#5A5A40]"
                />
              </div>

              {isB2B && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#3D3D35]">
                    Minimum Order Quantity (MOQ):
                  </label>
                  <input
                    type="number"
                    value={moq}
                    onChange={(e) => setMoq(e.target.value)}
                    className="w-full bg-white border border-[#E0D8CC] rounded-full px-4 py-2.5 text-xs text-[#3D3D35]"
                  />
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setNewListingOpen(false);
                    openAIImageModal('seller_listing');
                  }}
                  className="flex-1 py-3 rounded-full bg-[#E0D8CC] text-[#5A5A40] font-serif font-bold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <Camera className="w-4 h-4" />
                  <span>Auto-Fill with Photo AI</span>
                </button>

                <button
                  type="submit"
                  className="flex-1 py-3 rounded-full bg-[#5A5A40] hover:bg-[#484833] text-white font-serif font-bold text-xs transition shadow-sm"
                >
                  Publish Listing Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
