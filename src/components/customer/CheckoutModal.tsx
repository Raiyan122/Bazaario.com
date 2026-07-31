import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CreditCard,
  Truck,
  MapPin,
  CheckCircle2,
  Lock,
  Smartphone,
  Wallet,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { formatPrice } from '../../utils/currency';
import { PaymentMethodType, Order } from '../../types';

export const CheckoutModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const {
    isCheckoutOpen,
    setCheckoutOpen,
    cart,
    products,
    currency,
    addresses,
    appliedCoupon,
    walletBalanceUSD,
    placeOrder,
  } = useMarketplace();

  const [selectedAddressId, setSelectedAddressId] = useState<string>(addresses[0]?.id || '');
  const [shippingCourier, setShippingCourier] = useState<string>('Bazaario Standard Delivery');
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethodType>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  if (!isCheckoutOpen) return null;

  const subtotalUSD = cart.reduce((sum, item) => sum + item.unitPriceUSD * item.quantity, 0);
  const discountUSD = appliedCoupon
    ? Number((subtotalUSD * (appliedCoupon.discountPercent / 100)).toFixed(2))
    : 0;
  const shippingUSD =
    shippingCourier === 'Bazaario Express Air'
      ? 8.99
      : subtotalUSD >= 50
      ? 0
      : 4.99;
  const totalUSD = Math.max(0, Number((subtotalUSD - discountUSD + shippingUSD).toFixed(2)));

  const handleConfirmOrder = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const order = placeOrder(
        selectedAddressId || addresses[0]?.id,
        selectedPayment,
        shippingCourier
      );
      setCompletedOrder(order);
      setIsProcessing(false);
    }, 1200);
  };

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId) || addresses[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3D3D35]/50 backdrop-blur-sm p-3 sm:p-6 animate-fadeIn font-['Georgia',serif]">
      <div className="relative w-full max-w-3xl max-h-[92vh] bg-white border border-[#E0D8CC] rounded-[32px] shadow-sm flex flex-col overflow-hidden text-[#3D3D35]">
        {/* Header */}
        <div className="bg-[#F5F2ED] border-b border-[#E0D8CC] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E0D8CC] text-[#5A5A40] border border-[#D4CDBC] flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-[#3D3D35]">
                {completedOrder ? 'Order Confirmed!' : 'Bazaario Secure Checkout'}
              </h3>
              <p className="text-xs text-[#A89F91]">
                {completedOrder
                  ? `Order #${completedOrder.id} successfully processed`
                  : '256-bit SSL encrypted multi-gateway payment'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setCheckoutOpen(false);
              onClose();
            }}
            className="p-2 text-[#A89F91] hover:text-[#3D3D35] hover:bg-[#E0D8CC]/50 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {completedOrder ? (
            /* Celebration Order Confirmation Receipt */
            <div className="flex flex-col items-center justify-center text-center p-6 space-y-5 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/40 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h2 className="text-2xl font-extrabold text-white">Thank you for your order!</h2>
                <p className="text-sm text-slate-300 mt-1">
                  We sent a confirmation email to <strong className="text-white">ayesha@example.com</strong>
                </p>
              </div>

              {/* Summary Card */}
              <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3 text-left">
                <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">Order Number</span>
                    <p className="text-sm font-bold text-orange-400">{completedOrder.id}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">Tracking No.</span>
                    <p className="text-sm font-mono font-bold text-slate-200">
                      {completedOrder.trackingNumber}
                    </p>
                  </div>
                </div>

                <div className="text-xs space-y-1.5 text-slate-300">
                  <div className="flex justify-between">
                    <span>Shipping To:</span>
                    <span className="font-semibold text-white">{completedOrder.shippingAddress.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Courier:</span>
                    <span className="font-semibold text-white">{completedOrder.courier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <span className="font-semibold text-white uppercase">{completedOrder.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Arrival:</span>
                    <span className="font-semibold text-emerald-400">{completedOrder.estimatedDelivery}</span>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-3 flex justify-between items-baseline text-sm font-extrabold">
                  <span className="text-slate-300">Total Paid</span>
                  <span className="text-lg text-emerald-400">
                    {formatPrice(completedOrder.totalUSD, currency)}
                  </span>
                </div>
              </div>

              {/* Next step buttons */}
              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                <button
                  onClick={() => {
                    setCheckoutOpen(false);
                    onClose();
                  }}
                  className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          ) : (
            /* Multi-step Checkout Forms */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Address & Shipping Method */}
              <div className="space-y-6">
                {/* 1. Address Picker */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-orange-400" />
                    1. Shipping Address
                  </h4>

                  <div className="space-y-2">
                    {addresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.id;
                      return (
                        <div
                          key={addr.id}
                          onClick={() => setSelectedAddressId(addr.id)}
                          className={`p-3.5 rounded-xl border cursor-pointer transition flex items-start justify-between ${
                            isSelected
                              ? 'bg-slate-800/90 border-orange-500 shadow-sm'
                              : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">{addr.label}</span>
                              {addr.isDefault && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 font-semibold">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-300 mt-1 font-semibold">{addr.fullName}</p>
                            <p className="text-xs text-slate-400">
                              {addr.street}, {addr.city} {addr.postalCode}
                            </p>
                          </div>

                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-1 ${
                              isSelected ? 'border-orange-500 bg-orange-500' : 'border-slate-600'
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Shipping Courier */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-orange-400" />
                    2. Delivery Courier
                  </h4>

                  <div className="space-y-2">
                    {[
                      {
                        name: 'Bazaario Standard Delivery',
                        time: '3 - 5 Business Days',
                        fee: subtotalUSD >= 50 ? 0 : 4.99,
                      },
                      {
                        name: 'Bazaario Express Air',
                        time: '1 - 2 Business Days',
                        fee: 8.99,
                      },
                      {
                        name: 'Standard Courier COD (Cash on Delivery)',
                        time: '3 - 5 Business Days',
                        fee: subtotalUSD >= 50 ? 0 : 4.99,
                      },
                    ].map((courier, idx) => {
                      const isSelected = shippingCourier === courier.name;
                      return (
                        <div
                          key={idx}
                          onClick={() => setShippingCourier(courier.name)}
                          className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition ${
                            isSelected
                              ? 'bg-slate-800/90 border-orange-500'
                              : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div>
                            <span className="text-xs font-bold text-white block">{courier.name}</span>
                            <span className="text-[11px] text-slate-400">{courier.time}</span>
                          </div>
                          <span className="text-xs font-bold text-emerald-400">
                            {courier.fee === 0 ? 'FREE' : formatPrice(courier.fee, currency)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Payment Method & Order Summary */}
              <div className="space-y-6">
                {/* 3. Payment Methods */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-orange-400" />
                    3. Select Payment Method
                  </h4>

                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      {
                        id: 'card' as PaymentMethodType,
                        label: 'Stripe Card',
                        sub: 'Visa, Master, Amex',
                        icon: <CreditCard className="w-4 h-4 text-indigo-400" />,
                      },
                      {
                        id: 'wallet' as PaymentMethodType,
                        label: 'Bazaario Wallet',
                        sub: `Bal: ${formatPrice(walletBalanceUSD, currency)}`,
                        icon: <Wallet className="w-4 h-4 text-emerald-400" />,
                      },
                      {
                        id: 'mobile_banking' as PaymentMethodType,
                        label: 'Mobile Banking',
                        sub: 'bKash, Easypaisa, GCash',
                        icon: <Smartphone className="w-4 h-4 text-purple-400" />,
                      },
                      {
                        id: 'cod' as PaymentMethodType,
                        label: 'Cash on Delivery',
                        sub: 'Pay courier on arrival',
                        icon: <ShieldCheck className="w-4 h-4 text-amber-400" />,
                      },
                    ].map((m) => {
                      const isSelected = selectedPayment === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setSelectedPayment(m.id)}
                          className={`p-3 rounded-xl border text-left flex flex-col justify-between transition ${
                            isSelected
                              ? 'bg-slate-800 border-orange-500 shadow-sm'
                              : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            {m.icon}
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-orange-400" />}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white block">{m.label}</span>
                            <span className="text-[10px] text-slate-400">{m.sub}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Payment specific helper preview */}
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-400">
                    {selectedPayment === 'card' && (
                      <div className="space-y-2">
                        <span className="text-slate-300 font-semibold block">Simulated Card Details:</span>
                        <div className="bg-slate-900 px-3 py-2 rounded-lg border border-slate-800 font-mono text-slate-200">
                          •••• •••• •••• 4242 (MM/YY: 12/28)
                        </div>
                      </div>
                    )}
                    {selectedPayment === 'wallet' && (
                      <p className="text-emerald-400 font-semibold">
                        Your Bazaario Wallet balance ({formatPrice(walletBalanceUSD, currency)}) is ready for one-tap payment.
                      </p>
                    )}
                    {selectedPayment === 'cod' && (
                      <p className="text-amber-400 font-semibold">
                        Cash on Delivery (COD) selected. Please have exact cash ready when the courier arrives.
                      </p>
                    )}
                    {selectedPayment === 'mobile_banking' && (
                      <p className="text-purple-300 font-semibold">
                        You will receive an OTP prompt from your mobile banking app (bKash / Easypaisa) to complete payment.
                      </p>
                    )}
                  </div>
                </div>

                {/* 4. Order Summary Card */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h5 className="text-xs font-bold text-white uppercase tracking-wider">
                    Order Summary ({cart.length} items)
                  </h5>

                  <div className="space-y-1.5 text-xs text-slate-400">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="text-white font-semibold">
                        {formatPrice(subtotalUSD, currency)}
                      </span>
                    </div>
                    {appliedCoupon && (
                      <div className="flex justify-between text-emerald-400">
                        <span>Discount ({appliedCoupon.code})</span>
                        <span>-{formatPrice(discountUSD, currency)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Shipping ({shippingCourier})</span>
                      <span className="text-white font-semibold">
                        {shippingUSD === 0 ? (
                          <span className="text-emerald-400 font-bold">FREE</span>
                        ) : (
                          formatPrice(shippingUSD, currency)
                        )}
                      </span>
                    </div>

                    <div className="border-t border-slate-800 pt-2.5 flex justify-between items-baseline text-sm font-extrabold">
                      <span className="text-white">Total Amount</span>
                      <span className="text-orange-400 text-lg">
                        {formatPrice(totalUSD, currency)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleConfirmOrder}
                    disabled={isProcessing}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-600/25 disabled:opacity-50 transition"
                  >
                    {isProcessing ? (
                      <span>Processing Encrypted Transaction...</span>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Pay &amp; Confirm Order ({formatPrice(totalUSD, currency)})</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
