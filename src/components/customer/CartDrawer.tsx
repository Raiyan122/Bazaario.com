import React, { useState } from 'react';
import {
  X,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Tag,
  CheckCircle,
  Truck,
  Sparkles,
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { formatPrice } from '../../utils/currency';
import { MOCK_COUPONS } from '../../data/mockCatalog';

export const CartDrawer: React.FC = () => {
  const {
    isCartDrawerOpen,
    setCartDrawerOpen,
    cart,
    products,
    currency,
    removeFromCart,
    updateCartQuantity,
    appliedCoupon,
    applyCouponCode,
    removeCoupon,
    setCheckoutOpen,
  } = useMarketplace();

  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ success?: boolean; text?: string }>({});

  if (!isCartDrawerOpen) return null;

  const subtotalUSD = cart.reduce((sum, item) => sum + item.unitPriceUSD * item.quantity, 0);
  const discountUSD = appliedCoupon
    ? Number((subtotalUSD * (appliedCoupon.discountPercent / 100)).toFixed(2))
    : 0;
  const shippingUSD = subtotalUSD > 50 ? 0 : subtotalUSD === 0 ? 0 : 4.99;
  const totalUSD = Math.max(0, Number((subtotalUSD - discountUSD + shippingUSD).toFixed(2)));

  const handleApplyPromo = (codeToApply?: string) => {
    const targetCode = codeToApply || couponInput;
    if (!targetCode.trim()) return;

    const res = applyCouponCode(targetCode);
    setCouponFeedback({ success: res.success, text: res.message });
    if (res.success) setCouponInput('');
    setTimeout(() => setCouponFeedback({}), 4000);
  };

  const handleProceed = () => {
    setCartDrawerOpen(false);
    setCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#3D3D35]/50 backdrop-blur-sm flex justify-end animate-fadeIn font-['Georgia',serif]">
      <div className="w-full max-w-md bg-white border-l border-[#E0D8CC] h-full flex flex-col shadow-sm text-[#3D3D35]">
        {/* Header */}
        <div className="p-5 border-b border-[#E0D8CC] flex items-center justify-between bg-[#F5F2ED]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E0D8CC] text-[#5A5A40] border border-[#D4CDBC] flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-[#3D3D35]">Your Shopping Cart</h3>
              <p className="text-xs text-[#A89F91]">
                {cart.length} item{cart.length === 1 ? '' : 's'} selected
              </p>
            </div>
          </div>

          <button
            onClick={() => setCartDrawerOpen(false)}
            className="p-2 text-[#A89F91] hover:text-[#3D3D35] hover:bg-[#E0D8CC]/50 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress bar */}
        <div className="bg-[#FDFCF8] px-5 py-3 border-b border-[#E0D8CC] text-xs">
          {subtotalUSD >= 50 ? (
            <p className="text-[#5A5A40] font-semibold flex items-center gap-1.5">
              <Truck className="w-4 h-4" />
              You unlocked Free Express Air Shipping!
            </p>
          ) : (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[#3D3D35]">
                <span>Free shipping over {formatPrice(50, currency)}</span>
                <span className="text-[#5A5A40] font-bold">
                  Add {formatPrice(50 - subtotalUSD, currency)} more
                </span>
              </div>
              <div className="w-full h-1.5 bg-[#E0D8CC] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#5A5A40] rounded-full"
                  style={{ width: `${Math.min(100, (subtotalUSD / 50) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-[#A89F91] space-y-3">
              <ShoppingBag className="w-12 h-12 opacity-30 text-[#6B705C]" />
              <p className="text-sm font-serif font-bold text-[#3D3D35]">Your cart is currently empty</p>
              <p className="text-xs max-w-xs font-sans">
                Explore our 50,000+ items across Electronics, Fashion, Home, and B2B Wholesale.
              </p>
            </div>
          ) : (
            cart.map((item) => {
              const product = products.find((p) => p.id === item.productId);
              if (!product) return null;

              return (
                <div
                  key={item.id}
                  className="bg-[#FDFCF8] border border-[#E0D8CC] rounded-[24px] p-3.5 flex gap-3.5 items-center shadow-sm"
                >
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="w-16 h-16 rounded-2xl object-cover bg-[#F5F2ED] border border-[#E0D8CC] shrink-0"
                  />

                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-serif font-bold text-[#3D3D35] truncate">{product.title}</h4>
                    {item.variantName && (
                      <p className="text-[11px] text-[#A89F91]">{item.variantName}</p>
                    )}

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs font-serif font-bold text-[#5A5A40]">
                        {formatPrice(item.unitPriceUSD, currency)}
                      </span>

                      {/* Quantity Selector */}
                      <div className="flex items-center gap-1 bg-white border border-[#E0D8CC] rounded-full px-2 py-0.5">
                        <button
                          onClick={() => updateCartQuantity(item.id, -1)}
                          className="px-1.5 text-[#A89F91] hover:text-[#3D3D35] font-bold"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold text-[#3D3D35] px-1.5">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.id, 1)}
                          className="px-1.5 text-[#A89F91] hover:text-[#3D3D35] font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-1.5 text-[#A89F91] hover:text-[#5A5A40] transition shrink-0"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Promo Code & Suggestion Chips */}
        {cart.length > 0 && (
          <div className="p-4 bg-[#F5F2ED] border-t border-[#E0D8CC] space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Tag className="w-3.5 h-3.5 text-[#A89F91] absolute left-3 top-3" />
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Promo code (e.g. WELCOME20)"
                  className="w-full bg-white border border-[#E0D8CC] rounded-full pl-9 pr-3 py-2 text-xs text-[#3D3D35] placeholder-[#A89F91] focus:outline-none focus:border-[#5A5A40]"
                />
              </div>
              <button
                onClick={() => handleApplyPromo()}
                className="px-4 py-2 bg-[#5A5A40] hover:bg-[#484833] text-white rounded-full text-xs font-medium transition"
              >
                Apply
              </button>
            </div>

            {/* Quick try chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {MOCK_COUPONS.map((c) => (
                <button
                  key={c.code}
                  onClick={() => handleApplyPromo(c.code)}
                  className="text-[10px] whitespace-nowrap px-2.5 py-1 rounded-full bg-white hover:bg-[#E0D8CC]/50 text-[#3D3D35] border border-[#E0D8CC] font-mono"
                >
                  {c.code} (-{c.discountPercent}%)
                </button>
              ))}
            </div>

            {/* Feedback message */}
            {couponFeedback.text && (
              <p
                className={`text-xs ${
                  couponFeedback.success ? 'text-[#5A5A40]' : 'text-[#8F6A48]'
                } font-semibold`}
              >
                {couponFeedback.text}
              </p>
            )}

            {/* Applied coupon pill */}
            {appliedCoupon && (
              <div className="flex items-center justify-between bg-white border border-[#E0D8CC] px-3 py-1.5 rounded-full text-xs shadow-sm">
                <span className="text-[#5A5A40] font-semibold">
                  Applied: {appliedCoupon.code} (-{appliedCoupon.discountPercent}%)
                </span>
                <button
                  onClick={removeCoupon}
                  className="text-[#A89F91] hover:text-[#3D3D35] font-bold text-xs"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer Summary & Checkout */}
        {cart.length > 0 && (
          <div className="p-5 bg-[#FDFCF8] border-t border-[#E0D8CC] space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-[#A89F91]">
                <span>Subtotal ({cart.length} items)</span>
                <span className="text-[#3D3D35] font-semibold">
                  {formatPrice(subtotalUSD, currency)}
                </span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-[#5A5A40]">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span>-{formatPrice(discountUSD, currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#A89F91]">
                <span>Shipping</span>
                <span>
                  {shippingUSD === 0 ? (
                    <span className="text-[#5A5A40] font-bold">FREE</span>
                  ) : (
                    formatPrice(shippingUSD, currency)
                  )}
                </span>
              </div>

              <div className="border-t border-[#E0D8CC] pt-2.5 flex justify-between items-baseline text-sm font-serif font-bold text-[#3D3D35]">
                <span>Total Amount</span>
                <span className="text-[#5A5A40] text-lg">
                  {formatPrice(totalUSD, currency)}
                </span>
              </div>
            </div>

            <button
              onClick={handleProceed}
              className="w-full py-3.5 rounded-full bg-[#5A5A40] hover:bg-[#484833] text-white font-serif font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition"
            >
              <span>Proceed to Secure Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
