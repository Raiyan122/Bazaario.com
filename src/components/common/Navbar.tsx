import React, { useState } from 'react';
import {
  Search,
  ShoppingBag,
  Heart,
  Wallet,
  Sparkles,
  Camera,
  Store,
  ShieldCheck,
  User,
  ChevronDown,
  Menu,
  X,
  Globe,
  Inbox,
  LogOut,
  Key,
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { AppRole, CurrencyCode } from '../../types';
import { SUPPORTED_CURRENCIES, formatPrice } from '../../utils/currency';
import { CATEGORIES_LIST } from '../../data/mockCatalog';
import { EmailOutboxModal } from '../auth/AuthPages';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
}) => {
  const {
    role,
    setRole,
    currency,
    setCurrency,
    cart,
    wishlistIds,
    walletBalanceUSD,
    setAIChatOpen,
    openAIImageModal,
    setCartDrawerOpen,
    user,
    logout,
  } = useMarketplace();

  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCurrencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [isEmailOutboxOpen, setEmailOutboxOpen] = useState(false);
  const [isAccountMenuOpen, setAccountMenuOpen] = useState(false);

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const rolesList: { role: AppRole; label: string; icon: React.ReactNode }[] = [
    { role: 'customer', label: 'Shopper Portal', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
    { role: 'seller', label: 'Vendor Dashboard', icon: <Store className="w-3.5 h-3.5" /> },
    { role: 'admin', label: 'Admin Governance', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FDFCF8]/95 backdrop-blur-md border-b border-[#E0D8CC]">
      {/* Top Banner - PRD Highlights & Role Switcher */}
      <div className="bg-[#F5F2ED] border-b border-[#E0D8CC] px-4 py-1.5 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[#5A5A40]">
            <span className="inline-flex items-center gap-1 font-semibold text-[#5A5A40]">
              <Sparkles className="w-3.5 h-3.5" />
              Bazaario AI Engine:
            </span>
            <span className="hidden sm:inline text-[#3D3D35]">
              Powered by <strong className="text-[#5A5A40]">gemini-3.1-pro-preview</strong> &amp;{' '}
              <strong className="text-[#5A5A40]">gemini-3.5-flash</strong> • Free Shipping over $50
            </span>
          </div>

          {/* Role Switcher & Currency */}
          <div className="flex items-center gap-3">
            {/* Persona Switcher */}
            <div className="flex items-center bg-[#FDFCF8] rounded-full p-0.5 border border-[#E0D8CC]">
              {rolesList.map((r) => {
                const isActive = role === r.role;
                return (
                  <button
                    key={r.role}
                    onClick={() => {
                      setRole(r.role);
                      if (r.role === 'customer' && activeTab !== 'home') setActiveTab('home');
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold transition ${
                      isActive
                        ? 'bg-[#5A5A40] text-white shadow-sm'
                        : 'text-[#A89F91] hover:text-[#3D3D35]'
                    }`}
                  >
                    {r.icon}
                    <span>{r.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Currency Switcher */}
            <div className="relative">
              <button
                onClick={() => setCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                className="flex items-center gap-1 text-[#3D3D35] hover:text-[#5A5A40] px-2.5 py-1 rounded-full bg-[#E0D8CC]/50 text-xs font-semibold"
              >
                <Globe className="w-3.5 h-3.5 text-[#5A5A40]" />
                <span>{currency} ({SUPPORTED_CURRENCIES[currency].symbol})</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {isCurrencyDropdownOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white border border-[#E0D8CC] rounded-2xl shadow-xl py-1 z-50">
                  {(Object.keys(SUPPORTED_CURRENCIES) as CurrencyCode[]).map((code) => {
                    const info = SUPPORTED_CURRENCIES[code];
                    return (
                      <button
                        key={code}
                        onClick={() => {
                          setCurrency(code);
                          setCurrencyDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-[#F5F2ED] ${
                          currency === code ? 'text-[#5A5A40] font-bold bg-[#FDFCF8]' : 'text-[#3D3D35]'
                        }`}
                      >
                        <span>{info.name}</span>
                        <span className="font-mono">{code} ({info.symbol})</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Primary Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        {/* Logo */}
        <div
          onClick={() => {
            if (role === 'customer') setActiveTab('home');
          }}
          className="flex items-center gap-2.5 cursor-pointer shrink-0"
        >
          <div className="w-11 h-11 relative flex items-center justify-center rounded-2xl bg-white border border-[#E0D8CC] p-1 shadow-sm hover:scale-105 transition-transform">
            <span className="w-full h-full flex items-center justify-center">
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full drop-shadow-sm"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="bazaarioBagGrad" x1="15" y1="20" x2="85" y2="80" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#FF6B00" />
                    <stop offset="45%" stopColor="#FF0055" />
                    <stop offset="75%" stopColor="#6D28D9" />
                    <stop offset="100%" stopColor="#1E1B4B" />
                  </linearGradient>
                  <linearGradient id="bazaarioHandle" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#FF8A00" />
                    <stop offset="100%" stopColor="#FF5E00" />
                  </linearGradient>
                </defs>
                {/* Shopping bag handle */}
                <path
                  d="M36 26 C36 10, 64 10, 64 26"
                  stroke="url(#bazaarioHandle)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* Handle eyelet rings */}
                <circle cx="36" cy="27" r="4" fill="#FFFFFF" stroke="#FF6B00" strokeWidth="2.5" />
                <circle cx="64" cy="27" r="4" fill="#FFFFFF" stroke="#FF5E00" strokeWidth="2.5" />
                {/* B Upper body & Lower loop shopping bag shape */}
                <path
                  d="M26 25 C26 23, 28 22, 31 22 L63 22 C79 22, 85 36, 74 46 C87 53, 86 75, 67 78 L31 78 C25 78, 22 73, 24 67 L31 35 C32 30, 26 28, 26 25 Z"
                  fill="url(#bazaarioBagGrad)"
                />
                {/* B Inner upper cutout */}
                <path
                  d="M41 34 L59 34 C66 34, 67 43, 59 44 L39 44 Z"
                  fill="#FFFFFF"
                />
                {/* B Inner lower cutout / cart handle accent */}
                <path
                  d="M41 54 L65 54 C74 54, 74 67, 64 67 L47 67 Z"
                  fill="#FFFFFF"
                />
                {/* Shopping cart white tray line */}
                <path
                  d="M22 47 L28 68 L53 68"
                  stroke="#FFFFFF"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                {/* Cart Wheels */}
                <circle cx="36" cy="86" r="5.5" fill="#1E1B4B" />
                <circle cx="56" cy="86" r="5.5" fill="#1E1B4B" />
              </svg>
            </span>
          </div>
          <div>
            <h1 className="text-xl font-serif font-bold text-[#5A5A40] tracking-tight flex items-center gap-1.5">
              Bazaario
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F5F2ED] text-[#5A5A40] font-medium border border-[#E0D8CC] uppercase tracking-widest">
                {role}
              </span>
            </h1>
            <p className="text-[10px] text-[#A89F91] hidden sm:block font-sans">
              Global AI Multi-Vendor Marketplace
            </p>
          </div>
        </div>

        {/* Search Bar with AI Photo Button (Customer Mode Only) */}
        {role === 'customer' && (
          <div className="flex-1 max-w-2xl hidden md:flex items-center gap-2">
            <div className="relative flex-1 flex items-center">
              <Search className="w-4 h-4 text-[#A89F91] absolute left-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 50,000+ items, electronics, fashion, B2B wholesale..."
                className="w-full bg-white border border-[#E0D8CC] text-[#3D3D35] placeholder-[#A89F91] rounded-full pl-10 pr-24 py-2 text-sm focus:outline-none focus:border-[#5A5A40] transition"
              />

              {/* AI Visual Search Button */}
              <button
                onClick={() => openAIImageModal('visual_search')}
                className="absolute right-1.5 bg-[#F5F2ED] hover:bg-[#E0D8CC] text-[#5A5A40] px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 border border-[#E0D8CC] transition"
                title="AI Photo Search (gemini-3.1-pro-preview)"
              >
                <Camera className="w-3.5 h-3.5 text-[#6B705C]" />
                <span className="hidden lg:inline">Photo Search</span>
              </button>
            </div>

            {/* AI Shopping Concierge Trigger */}
            <button
              onClick={() => setAIChatOpen(true)}
              className="px-4 py-2 rounded-full bg-[#6B705C] hover:bg-[#5A5A40] text-white font-medium text-xs flex items-center gap-1.5 shadow-sm transition shrink-0"
              title="Open Bazaario AI Concierge"
            >
              <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '6s' }} />
              <span>AI Concierge</span>
            </button>
          </div>
        )}

        {/* Action Icons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Developer Email Outbox Preview */}
          <button
            onClick={() => setEmailOutboxOpen(true)}
            className="px-2.5 py-1.5 rounded-full bg-[#E0D8CC]/50 hover:bg-[#E0D8CC] text-[#5A5A40] text-xs font-semibold flex items-center gap-1 transition"
            title="View Sent Bazaario Emails (Verification & Reset links)"
          >
            <Inbox className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Emails</span>
          </button>

          {/* User Account / Identity Dropdown */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setAccountMenuOpen(!isAccountMenuOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition ${
                  activeTab.startsWith('auth_')
                    ? 'bg-[#5A5A40] border-[#5A5A40] text-white'
                    : 'bg-white border-[#E0D8CC] text-[#3D3D35] hover:bg-[#F5F2ED]'
                }`}
              >
                <img
                  src={
                    user.profile_photo ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                  }
                  alt={user.name}
                  className="w-4 h-4 rounded-full object-cover"
                />
                <span className="max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {isAccountMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E0D8CC] rounded-2xl shadow-xl py-2 z-50 animate-fadeIn">
                  <div className="px-4 py-2.5 border-b border-[#E0D8CC]/60">
                    <p className="text-xs font-bold text-[#3D3D35] truncate">
                      {user.full_name || user.name}
                    </p>
                    <p className="text-[10px] text-[#A89F91] truncate">{user.email}</p>
                    <div className="mt-1 flex items-center gap-1">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-[#F5F2ED] text-[#5A5A40]">
                        {user.role}
                      </span>
                      {user.email_verified && (
                        <span className="text-[9px] text-emerald-600 font-semibold">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setAccountMenuOpen(false);
                      setActiveTab('auth_profile');
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-[#3D3D35] hover:bg-[#F5F2ED] flex items-center gap-2"
                  >
                    <User className="w-3.5 h-3.5 text-[#6B705C]" />
                    <span>Profile &amp; Security</span>
                  </button>

                  <button
                    onClick={() => {
                      setAccountMenuOpen(false);
                      setActiveTab('auth_change_password');
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-[#3D3D35] hover:bg-[#F5F2ED] flex items-center gap-2"
                  >
                    <Key className="w-3.5 h-3.5 text-[#6B705C]" />
                    <span>Change Password</span>
                  </button>

                  <div className="border-t border-[#E0D8CC]/60 my-1" />

                  <button
                    onClick={() => {
                      setAccountMenuOpen(false);
                      logout();
                      setActiveTab('auth_login');
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveTab('auth_login')}
                className="px-3 py-1.5 rounded-full bg-white hover:bg-[#F5F2ED] border border-[#E0D8CC] text-[#3D3D35] text-xs font-semibold transition"
              >
                Sign In
              </button>
              <button
                onClick={() => setActiveTab('auth_register')}
                className="px-3.5 py-1.5 rounded-full bg-[#5A5A40] hover:bg-[#484833] text-white text-xs font-semibold shadow-sm transition"
              >
                Register
              </button>
            </div>
          )}

          {role === 'customer' ? (
            <>
              {/* Wallet Balance Badge */}
              <button
                onClick={() => setActiveTab('wallet')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-full bg-white border border-[#E0D8CC] hover:bg-[#F5F2ED] text-[#3D3D35] text-xs font-medium transition"
              >
                <Wallet className="w-4 h-4 text-[#5A5A40]" />
                <span>{formatPrice(walletBalanceUSD, currency)}</span>
              </button>

              {/* Wishlist */}
              <button
                onClick={() => setActiveTab('wishlist')}
                className="relative p-2.5 rounded-full bg-white hover:bg-[#F5F2ED] border border-[#E0D8CC] text-[#5A5A40] transition"
                title="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistIds.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#5A5A40] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlistIds.length}
                  </span>
                )}
              </button>

              {/* Orders */}
              <button
                onClick={() => setActiveTab('orders')}
                className={`hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-xs font-medium transition ${
                  activeTab === 'orders'
                    ? 'bg-[#5A5A40] border-[#5A5A40] text-white'
                    : 'bg-white border-[#E0D8CC] text-[#3D3D35] hover:bg-[#F5F2ED]'
                }`}
              >
                <span>My Orders</span>
              </button>

              {/* Shopping Cart Button */}
              <button
                onClick={() => setCartDrawerOpen(true)}
                className="relative px-4 py-2 rounded-full bg-[#5A5A40] hover:bg-[#484833] text-white font-medium text-xs flex items-center gap-2 shadow-sm transition"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline">Cart</span>
                {cartItemCount > 0 && (
                  <span className="bg-[#FDFCF8] text-[#5A5A40] font-bold text-[11px] px-2 py-0.5 rounded-full">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </>
          ) : role === 'seller' ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openAIImageModal('seller_listing')}
                className="px-4 py-2 rounded-full bg-[#6B705C] hover:bg-[#5A5A40] text-white font-medium text-xs flex items-center gap-1.5 shadow-sm transition"
              >
                <Camera className="w-4 h-4" />
                <span>AI Photo Listing Tool</span>
              </button>
              <button
                onClick={() => setAIChatOpen(true)}
                className="px-3.5 py-2 rounded-full bg-white hover:bg-[#F5F2ED] text-[#3D3D35] text-xs font-medium border border-[#E0D8CC] flex items-center gap-1.5 transition"
              >
                <Sparkles className="w-4 h-4 text-[#6B705C]" />
                <span>Seller Strategy Advisor</span>
              </button>
            </div>
          ) : (
            <span className="text-xs font-medium text-[#A89F91] font-serif italic">
              Admin Trust &amp; Safety Console
            </span>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-full bg-white border border-[#E0D8CC] text-[#3D3D35] hover:bg-[#F5F2ED]"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Search & Navigation Drawer */}
      {isMobileMenuOpen && role === 'customer' && (
        <div className="md:hidden bg-[#FDFCF8] border-t border-[#E0D8CC] p-4 space-y-3 animate-fadeIn">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-[#A89F91] absolute left-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Bazaario items..."
              className="w-full bg-white border border-[#E0D8CC] text-[#3D3D35] rounded-full pl-9 pr-24 py-2 text-sm"
            />
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openAIImageModal('visual_search');
              }}
              className="absolute right-1.5 bg-[#F5F2ED] text-[#5A5A40] px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 border border-[#E0D8CC]"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Photo</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                setActiveTab('orders');
                setMobileMenuOpen(false);
              }}
              className="px-3 py-2 rounded-full bg-white border border-[#E0D8CC] text-xs font-medium text-[#3D3D35] text-center"
            >
              My Orders
            </button>
            <button
              onClick={() => {
                setActiveTab('wallet');
                setMobileMenuOpen(false);
              }}
              className="px-3 py-2 rounded-full bg-white border border-[#E0D8CC] text-xs font-medium text-[#3D3D35] text-center"
            >
              Wallet
            </button>
            <button
              onClick={() => {
                setAIChatOpen(true);
                setMobileMenuOpen(false);
              }}
              className="px-3 py-2 rounded-full bg-[#6B705C] text-white text-xs font-medium text-center flex items-center justify-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI Concierge
            </button>
          </div>
        </div>
      )}

      {/* Developer Email Outbox Preview Modal for AI Studio */}
      <EmailOutboxModal
        isOpen={isEmailOutboxOpen}
        onClose={() => setEmailOutboxOpen(false)}
        onSelectLink={(link, token) => {
          setEmailOutboxOpen(false);
          if (link.includes('reset-password')) {
            setActiveTab(`auth_reset_password?token=${token}`);
          } else if (link.includes('verify-email')) {
            setActiveTab(`auth_verify_email?token=${token}`);
          }
        }}
      />
    </header>
  );
};

