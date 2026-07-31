import React from 'react';
import { Star, Heart, ShoppingBag, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { Product } from '../../types';
import { useMarketplace } from '../../context/MarketplaceContext';
import { formatPrice, calculateDiscountedPrice } from '../../utils/currency';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelectProduct }) => {
  const { currency, addToCart, toggleWishlist, isInWishlist } = useMarketplace();

  const isFavorited = isInWishlist(product.id);
  const finalPriceUSD = calculateDiscountedPrice(product.basePriceUSD, product.discountPercent);

  return (
    <div
      onClick={() => onSelectProduct(product)}
      className="group relative bg-white border border-[#E0D8CC] hover:border-[#5A5A40] rounded-[24px] overflow-hidden flex flex-col justify-between cursor-pointer transition duration-300 shadow-sm hover:shadow-md"
    >
      {/* Top Image Box */}
      <div className="relative aspect-square w-full bg-[#F5F2ED] overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          {product.isFlashSale && (
            <span className="inline-flex items-center gap-1 bg-[#5A5A40] text-white text-[10px] font-serif font-bold px-3 py-0.5 rounded-full shadow-sm">
              <Zap className="w-3 h-3 fill-white" />
              FLASH SALE
            </span>
          )}
          {product.discountPercent && product.discountPercent > 0 && (
            <span className="bg-[#6B705C] text-white text-[10px] font-bold px-3 py-0.5 rounded-full shadow-sm">
              -{product.discountPercent}% OFF
            </span>
          )}
          {product.isB2BEligible && (
            <span className="bg-[#E0D8CC] text-[#3D3D35] text-[10px] font-bold px-3 py-0.5 rounded-full shadow-sm">
              B2B WHOLESALE
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition ${
            isFavorited
              ? 'bg-[#5A5A40] text-white shadow-sm'
              : 'bg-white/90 text-[#5A5A40] hover:bg-white'
          }`}
          title="Add to Wishlist"
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-white' : ''}`} />
        </button>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Category & Seller */}
          <div className="flex items-center justify-between text-[11px] text-[#A89F91] mb-1.5">
            <span className="truncate max-w-[130px] font-medium uppercase tracking-wider">{product.category}</span>
            <span className="flex items-center gap-1 text-[#5A5A40] font-medium truncate max-w-[120px]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#6B705C] shrink-0" />
              {product.sellerName}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-sm font-serif font-bold text-[#3D3D35] group-hover:text-[#5A5A40] line-clamp-2 leading-snug transition">
            {product.title}
          </h3>
        </div>

        {/* Rating & Price bar */}
        <div className="pt-3 border-t border-[#F5F2ED] flex items-end justify-between">
          <div>
            <div className="flex items-center gap-1 text-[#5A5A40] text-xs font-bold mb-1">
              <Star className="w-3.5 h-3.5 fill-[#8F6A48] text-[#8F6A48]" />
              <span>{product.rating.toFixed(1)}</span>
              <span className="text-[#A89F91] font-normal">({product.reviewCount})</span>
            </div>

            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-serif font-bold text-[#5A5A40]">
                {formatPrice(finalPriceUSD, currency)}
              </span>
              {product.discountPercent && product.discountPercent > 0 && (
                <span className="text-xs text-[#A89F91] line-through">
                  {formatPrice(product.basePriceUSD, currency)}
                </span>
              )}
            </div>
          </div>

          {/* Quick Add to Cart Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product.id, product.variants[0]?.id, product.variants[0]?.name, 1);
            }}
            className="p-2.5 rounded-full bg-[#5A5A40] hover:bg-[#484833] text-white transition shadow-sm"
            title="Quick Add to Cart"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
