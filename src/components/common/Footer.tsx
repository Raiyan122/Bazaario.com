import React from 'react';
import { ShieldCheck, Truck, RefreshCw, CreditCard, Sparkles, Globe, HeartHandshake } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#F5F2ED] border-t border-[#E0D8CC] text-[#3D3D35] text-xs mt-16 font-['Georgia',serif]">
      {/* Trust Badges Bar */}
      <div className="border-b border-[#E0D8CC] bg-[#FDFCF8] py-6 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="flex flex-col items-center gap-1.5 p-4 rounded-2xl bg-white border border-[#E0D8CC] shadow-sm">
            <Truck className="w-6 h-6 text-[#5A5A40]" />
            <span className="font-serif font-bold text-[#5A5A40]">Free Express Delivery</span>
            <span className="text-[11px] text-[#A89F91]">On all marketplace orders over $50</span>
          </div>

          <div className="flex flex-col items-center gap-1.5 p-4 rounded-2xl bg-white border border-[#E0D8CC] shadow-sm">
            <RefreshCw className="w-6 h-6 text-[#6B705C]" />
            <span className="font-serif font-bold text-[#5A5A40]">14-Day Hassle-Free Returns</span>
            <span className="text-[11px] text-[#A89F91]">Instant refund to source or Wallet</span>
          </div>

          <div className="flex flex-col items-center gap-1.5 p-4 rounded-2xl bg-white border border-[#E0D8CC] shadow-sm">
            <ShieldCheck className="w-6 h-6 text-[#5A5A40]" />
            <span className="font-serif font-bold text-[#5A5A40]">Bazaario Buyer Protection</span>
            <span className="text-[11px] text-[#A89F91]">100% verified independent sellers</span>
          </div>

          <div className="flex flex-col items-center gap-1.5 p-4 rounded-2xl bg-white border border-[#E0D8CC] shadow-sm">
            <CreditCard className="w-6 h-6 text-[#6B705C]" />
            <span className="font-serif font-bold text-[#5A5A40]">Multi-Gateway &amp; COD</span>
            <span className="text-[11px] text-[#A89F91]">Stripe, Apple Pay, bKash &amp; COD</span>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8">
        {/* Col 1: Brand info */}
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#5A5A40] flex items-center justify-center text-white font-bold text-sm shadow-sm">
              B
            </div>
            <span className="text-base font-serif font-bold text-[#5A5A40] tracking-tight">Bazaario</span>
          </div>
          <p className="text-[#3D3D35] text-xs leading-relaxed max-w-sm font-sans">
            Bazaario is a premier multi-vendor e-commerce marketplace combining the selection density of global marketplaces with AI-powered discovery, instant visual inspection, and trusted local logistics.
          </p>
          <div className="flex items-center gap-2 pt-2 text-[11px] text-[#A89F91]">
            <Globe className="w-4 h-4 text-[#5A5A40]" />
            <span>Available in USA, EU, UK, Bangladesh, Pakistan &amp; Indonesia</span>
          </div>
        </div>

        {/* Col 2: Customer Care */}
        <div className="space-y-2">
          <h4 className="text-xs font-serif font-bold text-[#5A5A40] uppercase tracking-widest">Customer Care</h4>
          <ul className="space-y-1.5">
            <li><a href="#help" className="hover:text-[#5A5A40] transition">Help Center &amp; FAQs</a></li>
            <li><a href="#tracking" className="hover:text-[#5A5A40] transition">Order Tracking &amp; Invoices</a></li>
            <li><a href="#returns" className="hover:text-[#5A5A40] transition">14-Day Return Policy</a></li>
            <li><a href="#cod" className="hover:text-[#5A5A40] transition">Cash on Delivery (COD) Rules</a></li>
          </ul>
        </div>

        {/* Col 3: For Sellers */}
        <div className="space-y-2">
          <h4 className="text-xs font-serif font-bold text-[#5A5A40] uppercase tracking-widest">Sell on Bazaario</h4>
          <ul className="space-y-1.5">
            <li><a href="#sell" className="hover:text-[#5A5A40] transition">Vendor Registration</a></li>
            <li><a href="#ai-listing" className="hover:text-[#5A5A40] transition">AI Photo Listing Tool</a></li>
            <li><a href="#fees" className="hover:text-[#5A5A40] transition">Commission &amp; Subscription Tiers</a></li>
            <li><a href="#b2b" className="hover:text-[#5A5A40] transition">B2B Wholesale Portal</a></li>
          </ul>
        </div>

        {/* Col 4: AI Engine */}
        <div className="space-y-2">
          <h4 className="text-xs font-serif font-bold text-[#5A5A40] uppercase tracking-widest">Gemini AI Engine</h4>
          <ul className="space-y-1.5">
            <li className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span>Shopping Concierge</span>
            </li>
            <li className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#6B705C]" />
              <span>Visual Product Inspector</span>
            </li>
            <li className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span>Seller Strategy Consultant</span>
            </li>
            <li className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#6B705C]" />
              <span>Fast Support Triage</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Legal */}
      <div className="border-t border-[#E0D8CC] py-4 px-4 text-center text-[#A89F91] text-[11px] bg-[#FDFCF8]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 Bazaario Inc. All rights reserved. • Built with Google AI Studio &amp; Gemini 3 Series.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-[#3D3D35] cursor-pointer">Privacy Policy</span>
            <span className="hover:text-[#3D3D35] cursor-pointer">Terms of Service</span>
            <span className="hover:text-[#3D3D35] cursor-pointer">Trust &amp; Safety</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
