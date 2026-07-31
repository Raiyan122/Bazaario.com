import React, { useState } from 'react';
import {
  X,
  Star,
  Heart,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Truck,
  RefreshCw,
  MessageCircle,
  Share2,
  Check,
  ThumbsUp,
  AlertCircle,
  Boxes,
} from 'lucide-react';
import { Product, ProductVariant, Review } from '../../types';
import { useMarketplace } from '../../context/MarketplaceContext';
import { formatPrice, calculateDiscountedPrice } from '../../utils/currency';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const {
    currency,
    sellers,
    addToCart,
    toggleWishlist,
    isInWishlist,
    openAIChatWithPrompt,
    addReviewToProduct,
    setCheckoutOpen,
  } = useMarketplace();

  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product.variants[0]
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');

  // Review Form State
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const isFavorited = isInWishlist(product.id);
  const basePrice = product.basePriceUSD + (selectedVariant?.priceDelta || 0);
  const finalPriceUSD = calculateDiscountedPrice(basePrice, product.discountPercent);

  const seller = sellers[product.sellerId] || {
    id: product.sellerId,
    businessName: product.sellerName,
    rating: 4.8,
    reviewsCount: 450,
    isVerified: true,
    responseTime: '< 30 mins',
    country: 'Global Seller',
    joinedYear: 2022,
    totalSales: 18000,
  };

  const handleAddToCart = () => {
    addToCart(product.id, selectedVariant?.id, selectedVariant?.name, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product.id, selectedVariant?.id, selectedVariant?.name, quantity);
    onClose();
    setCheckoutOpen(true);
  };

  const handleAskAI = () => {
    openAIChatWithPrompt(
      `Can you give me an honest recommendation on "${product.title}" (${product.category})? How does it compare in quality and value?`
    );
    onClose();
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    addReviewToProduct(product.id, {
      userId: 'usr_me',
      userName: 'Ayesha Rahman (You)',
      userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      rating: reviewRating,
      comment: reviewComment.trim(),
      verifiedPurchase: true,
      helpfulCount: 0,
    });
    setReviewComment('');
    setIsWritingReview(false);
    setActiveTab('reviews');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3D3D35]/50 backdrop-blur-sm p-3 sm:p-6 animate-fadeIn font-['Georgia',serif]">
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-white border border-[#E0D8CC] rounded-[32px] shadow-sm flex flex-col overflow-hidden text-[#3D3D35]">
        {/* Top Header */}
        <div className="bg-[#F5F2ED] border-b border-[#E0D8CC] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#A89F91]">
            <span className="uppercase tracking-wider font-semibold">{product.category}</span>
            <span>•</span>
            <span className="text-[#5A5A40] font-bold">{product.sellerName}</span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#A89F91] hover:text-[#3D3D35] hover:bg-[#E0D8CC]/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square w-full rounded-[24px] overflow-hidden bg-[#F5F2ED] border border-[#E0D8CC] flex items-center justify-center">
              <img
                src={product.images[selectedImageIdx] || product.images[0]}
                alt={product.title}
                className="w-full h-full object-cover"
              />

              {/* Wishlist Button */}
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md transition ${
                  isFavorited
                    ? 'bg-[#5A5A40] text-white shadow-sm'
                    : 'bg-white/90 text-[#5A5A40] hover:bg-white'
                }`}
                title="Add to Wishlist"
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-white' : ''}`} />
              </button>
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((imgUrl, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImageIdx(i)}
                    className={`aspect-square rounded-2xl overflow-hidden border-2 transition ${
                      selectedImageIdx === i
                        ? 'border-[#5A5A40] shadow-sm'
                        : 'border-[#E0D8CC] hover:border-[#A89F91]'
                    }`}
                  >
                    <img src={imgUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Seller Scorecard Card */}
            <div className="bg-[#FDFCF8] border border-[#E0D8CC] rounded-[24px] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#E0D8CC] border border-[#D4CDBC] flex items-center justify-center text-[#5A5A40] font-serif font-bold">
                    {seller.businessName[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-serif font-bold text-[#3D3D35]">{seller.businessName}</h4>
                      {seller.isVerified && (
                        <ShieldCheck className="w-4 h-4 text-[#6B705C] shrink-0" title="Verified Independent Seller" />
                      )}
                    </div>
                    <p className="text-xs text-[#A89F91]">
                      Joined {seller.joinedYear} • {seller.country}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1 text-[#5A5A40] font-bold text-xs justify-end">
                    <Star className="w-3.5 h-3.5 fill-[#8F6A48] text-[#8F6A48]" />
                    <span>{seller.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-[11px] text-[#A89F91]">{seller.reviewsCount} Seller Ratings</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#F5F2ED] text-center text-xs">
                <div>
                  <span className="text-[10px] text-[#A89F91] block">Response Time</span>
                  <span className="font-semibold text-[#5A5A40]">{seller.responseTime}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#A89F91] block">Shipment Speed</span>
                  <span className="font-semibold text-[#3D3D35]">24-48 Hours</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#A89F91] block">Total GMV</span>
                  <span className="font-semibold text-[#3D3D35]">{seller.totalSales.toLocaleString()}+ Sold</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Product Details & Purchase Actions */}
          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Title & Rating */}
              <div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#3D3D35] leading-tight">
                  {product.title}
                </h2>

                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1.5 text-[#5A5A40] font-bold text-sm">
                    <Star className="w-4 h-4 fill-[#8F6A48] text-[#8F6A48]" />
                    <span>{product.rating.toFixed(1)}</span>
                    <span className="text-[#A89F91] font-normal">({product.reviewCount} customer reviews)</span>
                  </div>

                  <button
                    onClick={handleAskAI}
                    className="text-xs text-[#5A5A40] hover:text-[#3D3D35] font-semibold flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Ask AI Concierge</span>
                  </button>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="bg-[#F5F2ED] p-5 rounded-[24px] border border-[#E0D8CC] flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-serif font-bold text-[#5A5A40]">
                      {formatPrice(finalPriceUSD, currency)}
                    </span>
                    {product.discountPercent && product.discountPercent > 0 && (
                      <span className="text-base text-[#A89F91] line-through">
                        {formatPrice(basePrice, currency)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#5A5A40] font-medium mt-0.5 flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5" />
                    Free 2-Day Express Shipping &amp; Cash on Delivery (COD) available
                  </p>
                </div>

                {product.isB2BEligible && (
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 bg-[#E0D8CC] text-[#3D3D35] border border-[#D4CDBC] px-3 py-1 rounded-full text-xs font-bold">
                      <Boxes className="w-3.5 h-3.5" />
                      B2B MOQ: {product.moq || 1}
                    </span>
                  </div>
                )}
              </div>

              {/* Variant Selector */}
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-[#A89F91] uppercase tracking-widest block">
                    Select Variant / Style:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v) => {
                      const isSelected = selectedVariant?.id === v.id;
                      return (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVariant(v)}
                          className={`px-4 py-2 rounded-full text-xs font-medium border transition ${
                            isSelected
                              ? 'bg-[#5A5A40] border-[#5A5A40] text-white shadow-sm'
                              : 'bg-white border-[#E0D8CC] text-[#3D3D35] hover:border-[#A89F91]'
                          }`}
                        >
                          {v.name}
                          {v.priceDelta > 0 ? ` (+${formatPrice(v.priceDelta, currency)})` : ''}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#A89F91] uppercase tracking-widest">
                  Quantity:
                </span>
                <div className="flex items-center bg-white border border-[#E0D8CC] rounded-full overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-4 py-2 text-[#3D3D35] hover:bg-[#F5F2ED] font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 font-bold text-sm text-[#3D3D35]">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-4 py-2 text-[#3D3D35] hover:bg-[#F5F2ED] font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleAddToCart}
                  className="py-3.5 rounded-full bg-white hover:bg-[#F5F2ED] text-[#3D3D35] font-serif font-bold text-sm flex items-center justify-center gap-2 border border-[#E0D8CC] shadow-sm transition"
                >
                  <ShoppingBag className="w-4 h-4 text-[#5A5A40]" />
                  <span>Add to Cart</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  className="py-3.5 rounded-full bg-[#5A5A40] hover:bg-[#484833] text-white font-serif font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition"
                >
                  <span>Buy Now</span>
                </button>
              </div>
            </div>

            {/* Tabs section (Description / Specs / Reviews) */}
            <div className="border-t border-[#E0D8CC] pt-4 space-y-4">
              <div className="flex items-center gap-2 border-b border-[#E0D8CC] pb-2">
                <button
                  onClick={() => setActiveTab('desc')}
                  className={`text-xs font-bold px-3.5 py-1.5 rounded-full transition ${
                    activeTab === 'desc' ? 'bg-[#5A5A40] text-white' : 'text-[#A89F91] hover:text-[#3D3D35]'
                  }`}
                >
                  Description
                </button>
                <button
                  onClick={() => setActiveTab('specs')}
                  className={`text-xs font-bold px-3.5 py-1.5 rounded-full transition ${
                    activeTab === 'specs' ? 'bg-[#5A5A40] text-white' : 'text-[#A89F91] hover:text-[#3D3D35]'
                  }`}
                >
                  Specifications
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`text-xs font-bold px-3.5 py-1.5 rounded-full transition ${
                    activeTab === 'reviews' ? 'bg-[#5A5A40] text-white' : 'text-[#A89F91] hover:text-[#3D3D35]'
                  }`}
                >
                  Reviews ({product.reviewCount})
                </button>
              </div>

              {activeTab === 'desc' && (
                <p className="text-xs text-[#3D3D35] leading-relaxed font-sans">{product.description}</p>
              )}

              {activeTab === 'specs' && (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {Object.entries(product.attributes).map(([key, val], idx) => (
                    <div
                      key={idx}
                      className="bg-[#FDFCF8] p-3 rounded-2xl border border-[#E0D8CC] flex flex-col"
                    >
                      <span className="text-[10px] text-[#A89F91] font-medium uppercase tracking-wider">{key}</span>
                      <span className="font-semibold text-[#3D3D35] mt-0.5">{val}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-4">
                  {/* Write review toggle */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-serif font-bold text-[#3D3D35]">
                      Verified Buyer Testimonials
                    </span>
                    <button
                      onClick={() => setIsWritingReview(!isWritingReview)}
                      className="text-xs text-[#5A5A40] font-bold hover:underline"
                    >
                      {isWritingReview ? 'Cancel Review' : '+ Write a Review'}
                    </button>
                  </div>

                  {isWritingReview && (
                    <form onSubmit={handleSubmitReview} className="bg-[#FDFCF8] p-4 rounded-2xl border border-[#E0D8CC] space-y-3">
                      <div>
                        <label className="text-[11px] text-[#A89F91] block mb-1">Your Rating:</label>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewRating(star)}
                              className="text-[#8F6A48]"
                            >
                              <Star
                                className={`w-5 h-5 ${star <= reviewRating ? 'fill-[#8F6A48]' : ''}`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] text-[#A89F91] block mb-1">Your Review:</label>
                        <textarea
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="How was your experience with this Bazaario item?"
                          className="w-full bg-white border border-[#E0D8CC] rounded-xl p-3 text-xs text-[#3D3D35] focus:outline-none focus:border-[#5A5A40]"
                          rows={3}
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#5A5A40] hover:bg-[#484833] text-white rounded-full text-xs font-bold"
                      >
                        Submit Verified Review
                      </button>
                    </form>
                  )}

                  {/* Reviews List */}
                  {product.reviews && product.reviews.length > 0 ? (
                    product.reviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="bg-[#FDFCF8] p-4 rounded-2xl border border-[#E0D8CC] space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={rev.userAvatar}
                              alt={rev.userName}
                              className="w-8 h-8 rounded-full object-cover border border-[#E0D8CC]"
                            />
                            <div>
                              <span className="text-xs font-serif font-bold text-[#3D3D35] flex items-center gap-1">
                                {rev.userName}
                                {rev.verifiedPurchase && (
                                  <span className="text-[10px] text-[#5A5A40] font-normal bg-[#E0D8CC] px-2 py-0.5 rounded-full">
                                    Verified Buyer
                                  </span>
                                )}
                              </span>
                              <div className="flex items-center gap-0.5 text-[#8F6A48] mt-0.5">
                                {Array.from({ length: rev.rating }).map((_, i) => (
                                  <Star key={i} className="w-3 h-3 fill-[#8F6A48]" />
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] text-[#A89F91]">{rev.date}</span>
                        </div>
                        <p className="text-xs text-[#3D3D35] leading-relaxed font-sans">{rev.comment}</p>
                        {rev.sellerResponse && (
                          <div className="bg-[#F5F2ED] p-3 rounded-xl border-l-2 border-[#5A5A40] text-[11px] text-[#3D3D35]">
                            <strong className="text-[#5A5A40] block mb-0.5">
                              {seller.businessName} Response:
                            </strong>
                            {rev.sellerResponse}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-[#A89F91] italic">
                      No reviews written yet. Be the first to review this product!
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
