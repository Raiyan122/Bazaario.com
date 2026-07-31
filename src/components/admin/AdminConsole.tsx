import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Users,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Sparkles,
  Lock,
  Store,
  MessageSquareWarning,
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { formatPrice } from '../../utils/currency';

export const AdminConsole: React.FC = () => {
  const { products, sellers, currency, openAIChatWithPrompt } = useMarketplace();

  const [activeTab, setActiveTab] = useState<'overview' | 'vendors' | 'triage'>('overview');
  const [disputeTickets, setDisputeTickets] = useState([
    {
      id: 'DISP-1049',
      buyerName: 'David K.',
      sellerName: 'Nordic Audio Official',
      reason: 'Shipping delay over 5 business days',
      amountUSD: 129.99,
      status: 'open',
      aiResolution: 'Recommend instant 15% wallet credit or automatic courier expedite check.',
    },
    {
      id: 'DISP-1048',
      buyerName: 'Farhana R.',
      sellerName: 'Florence Leather Studio',
      reason: 'Question regarding leather authenticity certificate',
      amountUSD: 199.99,
      status: 'resolved',
      aiResolution: 'Certificate verified by Florence artisan badge ID #FL-889.',
    },
  ]);

  const totalMarketplaceGMV = 145800; // simulated platform GMV
  const activeSellersCount = Object.keys(sellers).length;

  const handleResolveTicket = (id: string) => {
    setDisputeTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'resolved' } : t))
    );
    alert(`Ticket #${id} resolved successfully.`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Top Banner */}
      <div className="bg-[#F5F2ED] border border-[#E0D8CC] rounded-[32px] p-6 sm:p-8 flex flex-wrap items-center justify-between gap-6 shadow-sm text-[#3D3D35]">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-[#E0D8CC] text-[#5A5A40] border border-[#D4CDBC] px-3 py-1 rounded-full text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Marketplace Governance &amp; Escrow Control</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#3D3D35]">
            Admin Trust &amp; Safety Console
          </h2>
          <p className="text-xs sm:text-sm text-[#A89F91] max-w-xl">
            Monitor multi-vendor transactions, audit independent seller ratings, and triage customer disputes instantly with <strong className="text-[#5A5A40]">gemini-3.1-flash-lite</strong>.
          </p>
        </div>

        <button
          onClick={() =>
            openAIChatWithPrompt(
              'What are the best automated fraud detection rules for high-value e-commerce marketplace orders?'
            )
          }
          className="px-5 py-3 rounded-full bg-[#5A5A40] hover:bg-[#484833] text-white font-serif font-bold text-xs flex items-center gap-2 shadow-sm transition"
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Governance Audit</span>
        </button>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E0D8CC] rounded-[24px] p-4 space-y-1 shadow-sm text-[#3D3D35]">
          <span className="text-[11px] font-semibold text-[#A89F91] uppercase tracking-wider">Platform GMV (30d)</span>
          <div className="text-2xl font-serif font-bold text-[#3D3D35]">
            {formatPrice(totalMarketplaceGMV, currency)}
          </div>
          <span className="text-xs text-[#5A5A40] font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +24.2% YoY Growth
          </span>
        </div>

        <div className="bg-white border border-[#E0D8CC] rounded-[24px] p-4 space-y-1 shadow-sm text-[#3D3D35]">
          <span className="text-[11px] font-semibold text-[#A89F91] uppercase tracking-wider">Verified Vendors</span>
          <div className="text-2xl font-serif font-bold text-[#3D3D35]">{activeSellersCount} brands</div>
          <span className="text-xs text-[#5A5A40] font-semibold">100% KYC Approved</span>
        </div>

        <div className="bg-white border border-[#E0D8CC] rounded-[24px] p-4 space-y-1 shadow-sm text-[#3D3D35]">
          <span className="text-[11px] font-semibold text-[#A89F91] uppercase tracking-wider">Open Disputes</span>
          <div className="text-2xl font-serif font-bold text-[#8F6A48]">
            {disputeTickets.filter((t) => t.status === 'open').length} tickets
          </div>
          <span className="text-xs text-[#A89F91]">Avg resolution &lt; 2 hours</span>
        </div>

        <div className="bg-white border border-[#E0D8CC] rounded-[24px] p-4 space-y-1 shadow-sm text-[#3D3D35]">
          <span className="text-[11px] font-semibold text-[#A89F91] uppercase tracking-wider">Escrow Safety Rating</span>
          <div className="text-2xl font-serif font-bold text-[#5A5A40]">99.98%</div>
          <span className="text-xs text-[#A89F91]">Stripe &amp; Multi-Gateway SSL</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-3 border-b border-[#E0D8CC] pb-3">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-5 py-2 rounded-full text-xs font-serif font-bold transition ${
            activeTab === 'overview'
              ? 'bg-[#5A5A40] text-white shadow-sm'
              : 'bg-[#F5F2ED] text-[#A89F91] hover:text-[#3D3D35]'
          }`}
        >
          Marketplace Overview
        </button>
        <button
          onClick={() => setActiveTab('vendors')}
          className={`px-5 py-2 rounded-full text-xs font-serif font-bold transition ${
            activeTab === 'vendors'
              ? 'bg-[#5A5A40] text-white shadow-sm'
              : 'bg-[#F5F2ED] text-[#A89F91] hover:text-[#3D3D35]'
          }`}
        >
          Vendor Directory ({activeSellersCount})
        </button>
        <button
          onClick={() => setActiveTab('triage')}
          className={`px-5 py-2 rounded-full text-xs font-serif font-bold transition flex items-center gap-1.5 ${
            activeTab === 'triage'
              ? 'bg-[#6B705C] text-white shadow-sm'
              : 'bg-[#F5F2ED] text-[#A89F91] hover:text-[#3D3D35]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Support Triage Queue</span>
        </button>
      </div>

      {/* Tab 1: Marketplace Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-[#E0D8CC] rounded-[32px] p-6 space-y-4 shadow-sm text-[#3D3D35]">
            <h3 className="text-base font-serif font-bold text-[#3D3D35] flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#5A5A40]" />
              Escrow &amp; Commission Settlement
            </h3>
            <p className="text-xs text-[#A89F91] leading-relaxed">
              Bazaario Marketplace holds buyer payments in escrow until 48 hours after courier delivery confirmation. Sellers receive automated payouts minus standard platform commission (5% B2C, 3% B2B).
            </p>
            <div className="bg-[#F5F2ED] p-4 rounded-2xl border border-[#E0D8CC] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#A89F91]">Escrow Pending Release:</span>
                <span className="font-serif font-bold text-[#3D3D35]">{formatPrice(12450, currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A89F91]">Today&apos;s Commission Revenue:</span>
                <span className="font-serif font-bold text-[#5A5A40]">{formatPrice(842.5, currency)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#E0D8CC] rounded-[32px] p-6 space-y-4 shadow-sm text-[#3D3D35]">
            <h3 className="text-base font-serif font-bold text-[#3D3D35] flex items-center gap-2">
              <Store className="w-4 h-4 text-[#5A5A40]" />
              Catalog Integrity &amp; Quality Checks
            </h3>
            <p className="text-xs text-[#A89F91] leading-relaxed">
              All product photos are scanned via <strong className="text-[#5A5A40]">gemini-3.1-pro-preview</strong> to ensure no counterfeit branding, high visual quality scores (&gt;80/100), and accurate category tags.
            </p>
            <div className="bg-[#F5F2ED] p-4 rounded-2xl border border-[#E0D8CC] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#A89F91]">Verified Catalog Items:</span>
                <span className="font-serif font-bold text-[#3D3D35]">{products.length} active listings</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A89F91]">Average Product Quality Score:</span>
                <span className="font-serif font-bold text-[#5A5A40]">92 / 100</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Vendor Directory */}
      {activeTab === 'vendors' && (
        <div className="bg-white border border-[#E0D8CC] rounded-[32px] overflow-hidden shadow-sm text-[#3D3D35]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F2ED] text-[#5A5A40] uppercase font-serif font-bold border-b border-[#E0D8CC]">
              <tr>
                <th className="py-3.5 px-5">Business Name</th>
                <th className="py-3.5 px-5">Country</th>
                <th className="py-3.5 px-5">Rating</th>
                <th className="py-3.5 px-5">Total Sales</th>
                <th className="py-3.5 px-5">Verification</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0D8CC]">
              {Object.values(sellers).map((s: any) => (
                <tr key={s.id} className="hover:bg-[#F5F2ED]/50 transition">
                  <td className="py-3.5 px-5 font-serif font-bold text-[#3D3D35]">{s.businessName}</td>
                  <td className="py-3.5 px-5 text-[#3D3D35]">{s.country}</td>
                  <td className="py-3.5 px-5 font-bold text-[#8F6A48]">
                    ★ {s.rating.toFixed(1)} ({s.reviewsCount})
                  </td>
                  <td className="py-3.5 px-5 text-[#3D3D35]">{s.totalSales.toLocaleString()}+ Sold</td>
                  <td className="py-3.5 px-5">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#E0D8CC] text-[#5A5A40] font-bold text-[10px]">
                      Verified KYC
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <button
                      onClick={() =>
                        alert(`Audit passed for seller "${s.businessName}". Escrow standing is 100% compliant.`)
                      }
                      className="px-3.5 py-1.5 rounded-full bg-[#F5F2ED] hover:bg-[#E0D8CC] text-[#3D3D35] text-xs font-semibold transition"
                    >
                      Audit Seller
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: AI Support Triage Queue */}
      {activeTab === 'triage' && (
        <div className="space-y-4">
          <div className="bg-[#F5F2ED] border border-[#E0D8CC] rounded-[24px] p-5 flex items-center justify-between text-[#3D3D35]">
            <div>
              <h4 className="text-sm font-serif font-bold text-[#3D3D35] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#5A5A40]" />
                Automated Dispute Triage (gemini-3.1-flash-lite)
              </h4>
              <p className="text-xs text-[#A89F91] mt-0.5">
                Low-latency triage suggestions automatically inspect buyer return reasons &amp; courier proof of delivery.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {disputeTickets.map((t) => (
              <div
                key={t.id}
                className="bg-white border border-[#E0D8CC] rounded-[32px] p-5 flex flex-wrap items-center justify-between gap-4 shadow-sm text-[#3D3D35]"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-serif font-bold text-[#3D3D35]">{t.id}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        t.status === 'open'
                          ? 'bg-[#E0D8CC] text-[#8F6A48]'
                          : 'bg-[#E0D8CC] text-[#5A5A40]'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#3D3D35]">
                    Buyer: <strong>{t.buyerName}</strong> • Seller: <strong>{t.sellerName}</strong> •{' '}
                    Amount: {formatPrice(t.amountUSD, currency)}
                  </p>
                  <p className="text-xs text-[#8F6A48] font-semibold">Reason: &ldquo;{t.reason}&rdquo;</p>
                  <div className="bg-[#F5F2ED] p-3 rounded-2xl border border-[#E0D8CC] text-xs text-[#3D3D35] mt-2">
                    <strong className="text-[#5A5A40] block mb-0.5">
                      gemini-3.1-flash-lite Triage Recommendation:
                    </strong>
                    {t.aiResolution}
                  </div>
                </div>

                {t.status === 'open' ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleResolveTicket(t.id)}
                      className="px-4 py-2 rounded-full bg-[#5A5A40] hover:bg-[#484833] text-white text-xs font-serif font-bold flex items-center gap-1 transition shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve AI Resolution</span>
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-[#5A5A40] font-bold">Resolved &amp; Closed</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
