import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Zap,
  ShieldCheck,
  Truck,
  ChevronRight,
  ChevronLeft,
  Filter,
  ArrowUpDown,
  Search,
  Tag,
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { ProductCard } from './ProductCard';
import { CATEGORIES_LIST } from '../../data/mockCatalog';
import { Product } from '../../types';

interface CustomerHomeProps {
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const CustomerHome: React.FC<CustomerHomeProps> = ({
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
}) => {
  const { products, setSelectedProductModal, setAIChatOpen, openAIChatWithPrompt, currency } =
    useMarketplace();

  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'rating'>('featured');
  const [filterFlashSaleOnly, setFilterFlashSaleOnly] = useState(false);
  const [filterB2BOnly, setFilterB2BOnly] = useState(false);

  // Filtered & Sorted products
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      !selectedCategory || selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFlashSale = !filterFlashSaleOnly || p.isFlashSale;
    const matchesB2B = !filterB2BOnly || p.isB2BEligible;

    return matchesCategory && matchesSearch && matchesFlashSale && matchesB2B;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price_asc') return a.basePriceUSD - b.basePriceUSD;
    if (sortBy === 'price_desc') return b.basePriceUSD - a.basePriceUSD;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0; // featured
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, filterFlashSaleOnly, filterB2BOnly, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / itemsPerPage));
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // AI recommendations (top rated items)
  const aiRecommendedProducts = products
    .filter((p) => p.rating >= 4.8)
    .slice(0, 4);

  return (
    <div className="space-y-10 pb-16">
      {/* 1. Hero Banner Section */}
      <div className="relative rounded-[32px] overflow-hidden bg-[#6B705C] border border-[#E0D8CC] shadow-sm text-[#FDFCF8]">
        <div className="relative max-w-7xl mx-auto px-8 py-12 sm:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 bg-[#FDFCF8]/10 text-[#FDFCF8] border border-[#FDFCF8]/20 px-3.5 py-1 rounded-full text-xs font-medium tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI-Powered Multi-Vendor Discovery</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-serif font-light text-[#FDFCF8] leading-tight tracking-tight">
              The Smarter Way to Shop &amp; Source <span className="font-serif italic text-[#E0D8CC]">Global Brands</span>
            </h2>

            <p className="text-sm sm:text-base text-[#FDFCF8]/90 max-w-xl leading-relaxed font-sans">
              Explore 50,000+ verified items across Electronics, Fashion, Artisanal Home Decor, and B2B Wholesale. Backed by Gemini 3 series for instant concierge styling and photo search.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => openAIChatWithPrompt('What are the best trending deals on Bazaario right now?')}
                className="px-6 py-3 rounded-full bg-[#5A5A40] hover:bg-[#484833] text-white font-medium text-xs sm:text-sm flex items-center gap-2 shadow-sm transition"
              >
                <Sparkles className="w-4 h-4" />
                <span>Ask AI Concierge for Deals</span>
              </button>

              <button
                onClick={() => {
                  setFilterFlashSaleOnly(true);
                  const flashSection = document.getElementById('catalog-grid');
                  flashSection?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-5 py-3 rounded-full bg-[#FDFCF8]/10 hover:bg-[#FDFCF8]/20 text-[#FDFCF8] font-medium text-xs sm:text-sm flex items-center gap-2 border border-[#FDFCF8]/20 transition"
              >
                <Zap className="w-4 h-4 text-[#E0D8CC]" />
                <span>Weekend Flash Sale</span>
              </button>
            </div>
          </div>

          {/* Right Hero Card / Highlight */}
          <div className="lg:col-span-5 hidden sm:grid grid-cols-2 gap-4">
            {products.slice(0, 2).map((prod) => (
              <div
                key={prod.id}
                onClick={() => setSelectedProductModal(prod)}
                className="group cursor-pointer bg-[#FDFCF8] text-[#3D3D35] hover:bg-white border border-[#E0D8CC] hover:border-[#5A5A40] rounded-[24px] p-4 flex flex-col justify-between transition duration-300 shadow-sm"
              >
                <div className="aspect-square rounded-2xl overflow-hidden bg-[#F5F2ED] mb-3">
                  <img
                    src={prod.images[0]}
                    alt={prod.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-[#A89F91] font-semibold uppercase tracking-wider">
                    {prod.category}
                  </span>
                  <h4 className="text-xs font-serif font-bold text-[#3D3D35] truncate mt-0.5">{prod.title}</h4>
                  <span className="text-sm font-serif font-bold text-[#5A5A40] block mt-1">
                    ${prod.basePriceUSD}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. AI Personalized Recommendations Section */}
      <div className="bg-[#F5F2ED] border border-[#E0D8CC] rounded-[32px] p-8 space-y-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E0D8CC] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E0D8CC] text-[#5A5A40] border border-[#D4CDBC] flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-serif italic text-[#3D3D35]">AI Personalized Picks for You</h3>
              <p className="text-xs text-[#A89F91]">
                Curated by Bazaario Collaborative Filtering &amp; Gemini Embedding Match
              </p>
            </div>
          </div>

          <button
            onClick={() => openAIChatWithPrompt('Why were these items recommended for me and how can I get a bundle discount?')}
            className="text-xs font-bold text-[#5A5A40] hover:text-[#3D3D35] flex items-center gap-1 transition"
          >
            <span>Explain these recommendations</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {aiRecommendedProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} onSelectProduct={setSelectedProductModal} />
          ))}
        </div>
      </div>

      {/* 3. Category Carousel & Quick Filters */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-serif italic text-[#3D3D35]">Browse by Category</h3>
          <button
            onClick={() => setSelectedCategory('All')}
            className="text-xs text-[#5A5A40] hover:text-[#3D3D35] font-semibold"
          >
            View All Categories
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`p-4 rounded-[24px] border text-left transition flex flex-col justify-between h-24 ${
              !selectedCategory || selectedCategory === 'All'
                ? 'bg-[#5A5A40] border-[#5A5A40] text-white shadow-sm'
                : 'bg-white border-[#E0D8CC] text-[#3D3D35] hover:border-[#5A5A40] hover:bg-[#F5F2ED]'
            }`}
          >
            <span className="text-xs font-serif font-bold">All Products</span>
            <span className="text-[11px] opacity-80">{products.length} items</span>
          </button>

          {CATEGORIES_LIST.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const cnt = products.filter((p) => p.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`p-4 rounded-[24px] border text-left transition flex flex-col justify-between h-24 ${
                  isSelected
                    ? 'bg-[#5A5A40] border-[#5A5A40] text-white shadow-sm'
                    : 'bg-white border-[#E0D8CC] text-[#3D3D35] hover:border-[#5A5A40] hover:bg-[#F5F2ED]'
                }`}
              >
                <span className="text-xs font-serif font-bold leading-tight">{cat.label}</span>
                <span className="text-[11px] opacity-80">{cnt} items</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Filter & Sort Bar */}
      <div
        id="catalog-grid"
        className="bg-white border border-[#E0D8CC] rounded-[24px] p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm"
      >
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterFlashSaleOnly(!filterFlashSaleOnly)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1.5 transition ${
              filterFlashSaleOnly
                ? 'bg-[#5A5A40] border-[#5A5A40] text-white'
                : 'bg-[#FDFCF8] border-[#E0D8CC] text-[#A89F91] hover:text-[#3D3D35]'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Flash Sale Only</span>
          </button>

          <button
            onClick={() => setFilterB2BOnly(!filterB2BOnly)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1.5 transition ${
              filterB2BOnly
                ? 'bg-[#6B705C] border-[#6B705C] text-white'
                : 'bg-[#FDFCF8] border-[#E0D8CC] text-[#A89F91] hover:text-[#3D3D35]'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>B2B Wholesale Only</span>
          </button>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#A89F91] font-semibold">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#FDFCF8] border border-[#E0D8CC] text-[#3D3D35] text-xs rounded-full px-4 py-1.5 focus:outline-none focus:border-[#5A5A40]"
          >
            <option value="featured">Featured Deals</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top Rated Seller</option>
          </select>
        </div>
      </div>

      {/* 5. Main Catalog Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-serif italic text-[#3D3D35]">
            {selectedCategory && selectedCategory !== 'All'
              ? `${selectedCategory} (${sortedProducts.length})`
              : `All Marketplace Products (${sortedProducts.length})`}
          </h3>
          <span className="text-xs text-[#A89F91]">
            Showing verified seller items with Buyer Protection
          </span>
        </div>

        {sortedProducts.length === 0 ? (
          <div className="bg-white border border-[#E0D8CC] rounded-[32px] p-12 text-center text-[#A89F91] space-y-3 shadow-sm">
            <Search className="w-12 h-12 mx-auto opacity-30 text-[#6B705C]" />
            <h4 className="text-base font-serif font-bold text-[#3D3D35]">No products match your filters</h4>
            <p className="text-xs max-w-sm mx-auto">
              Try clearing your flash sale or B2B filter, or search for another keyword.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
                setFilterFlashSaleOnly(false);
                setFilterB2BOnly(false);
              }}
              className="px-5 py-2.5 rounded-full bg-[#5A5A40] text-white text-xs font-medium"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {paginatedProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} onSelectProduct={setSelectedProductModal} />
              ))}
            </div>

            {/* Pagination Bar */}
            {totalPages > 1 && (
              <div className="bg-white border border-[#E0D8CC] rounded-[24px] p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
                <span className="text-xs text-[#A89F91]">
                  Showing <strong className="text-[#3D3D35]">{(currentPage - 1) * itemsPerPage + 1}</strong>–
                  <strong className="text-[#3D3D35]">
                    {Math.min(currentPage * itemsPerPage, sortedProducts.length)}
                  </strong>{' '}
                  of <strong className="text-[#3D3D35]">{sortedProducts.length}</strong> products
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setCurrentPage((p) => Math.max(1, p - 1));
                      const el = document.getElementById('catalog-grid');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    disabled={currentPage === 1}
                    className="p-2 rounded-full border border-[#E0D8CC] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F5F2ED] text-[#3D3D35] transition"
                    title="Previous Page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1">
                    <span className="text-xs font-serif font-bold text-[#3D3D35] px-4 py-1.5 bg-[#F5F2ED] rounded-full border border-[#E0D8CC]">
                      Page {currentPage} of {totalPages}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setCurrentPage((p) => Math.min(totalPages, p + 1));
                      const el = document.getElementById('catalog-grid');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-full border border-[#E0D8CC] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F5F2ED] text-[#3D3D35] transition"
                    title="Next Page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
