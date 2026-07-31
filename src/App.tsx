/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MarketplaceProvider, useMarketplace } from './context/MarketplaceContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { AIChatModal } from './components/common/AIChatModal';
import { AIImageAnalyzerModal } from './components/common/AIImageAnalyzerModal';
import { CartDrawer } from './components/customer/CartDrawer';
import { CheckoutModal } from './components/customer/CheckoutModal';
import { ProductDetailModal } from './components/customer/ProductDetailModal';
import { CustomerHome } from './components/customer/CustomerHome';
import { OrdersView } from './components/customer/OrdersView';
import { WalletView } from './components/customer/WalletView';
import { ProductCard } from './components/customer/ProductCard';
import { SellerDashboard } from './components/seller/SellerDashboard';
import { AdminConsole } from './components/admin/AdminConsole';
import { AuthContainer, AuthViewType } from './components/auth/AuthPages';
import { Heart, Search } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { role, wishlistIds, products, setSelectedProductModal, selectedProductModal } =
    useMarketplace();

  const [activeTab, setActiveTab] = useState<string>('home');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const wishlistProducts = products.filter((p) => wishlistIds.includes(p.id));

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#3D3D35] flex flex-col font-['Georgia',serif] selection:bg-[#5A5A40] selection:text-white">
      {/* Header Navigation & Role Switcher */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      {/* Main Page View based on selected AppRole or Auth View */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 pt-6">
        {activeTab.startsWith('auth_') ? (
          (() => {
            const [base, query] = activeTab.replace('auth_', '').split('?');
            const params = new URLSearchParams(query || '');
            const token = params.get('token') || '';
            return (
              <AuthContainer
                initialView={base as AuthViewType}
                tokenParam={token}
                onNavigateHome={() => setActiveTab('home')}
              />
            );
          })()
        ) : role === 'customer' ? (
          <>
            {activeTab === 'home' && (
              <CustomerHome
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
            )}

            {activeTab === 'orders' && <OrdersView />}

            {activeTab === 'wallet' && <WalletView />}

            {activeTab === 'wishlist' && (
              <div className="space-y-6 pb-16">
                <div className="bg-white border border-[#E0D8CC] rounded-[24px] p-6 flex items-center justify-between shadow-sm">
                  <div>
                    <h2 className="text-xl font-serif font-bold text-[#5A5A40] flex items-center gap-2">
                      <Heart className="w-5 h-5 text-[#6B705C] fill-[#6B705C]" />
                      My Wishlist &amp; Saved Items ({wishlistProducts.length})
                    </h2>
                    <p className="text-xs text-[#A89F91] mt-1">
                      Save products for price alerts or bundle orders with Bazaario Wallet.
                    </p>
                  </div>
                </div>

                {wishlistProducts.length === 0 ? (
                  <div className="bg-white border border-[#E0D8CC] rounded-[24px] p-12 text-center text-[#A89F91] space-y-3 shadow-sm">
                    <Heart className="w-12 h-12 mx-auto opacity-30 text-[#6B705C]" />
                    <p className="text-sm font-medium text-[#5A5A40]">Your wishlist is currently empty</p>
                    <button
                      onClick={() => setActiveTab('home')}
                      className="px-5 py-2.5 bg-[#5A5A40] hover:bg-[#484833] text-white rounded-full text-xs font-medium transition-colors"
                    >
                      Browse Catalog
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {wishlistProducts.map((prod) => (
                      <ProductCard
                        key={prod.id}
                        product={prod}
                        onSelectProduct={setSelectedProductModal}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        ) : role === 'seller' ? (
          <SellerDashboard />
        ) : (
          <AdminConsole />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Global Modals & Slide-out Drawers */}
      <AIChatModal />
      <AIImageAnalyzerModal />
      <CartDrawer />
      <CheckoutModal onClose={() => {}} />

      {selectedProductModal && (
        <ProductDetailModal
          product={selectedProductModal}
          onClose={() => setSelectedProductModal(null)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <MarketplaceProvider>
      <MainAppContent />
    </MarketplaceProvider>
  );
}

