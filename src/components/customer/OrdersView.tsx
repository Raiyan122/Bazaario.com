import React, { useState } from 'react';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  RotateCcw,
  FileText,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { formatPrice } from '../../utils/currency';
import { Order, OrderStatus } from '../../types';

export const OrdersView: React.FC = () => {
  const { orders, currency, requestOrderReturn, openAIChatWithPrompt } = useMarketplace();

  const [returningOrderId, setReturningOrderId] = useState<string | null>(null);
  const [returnReason, setReturnReason] = useState<string>('Size/fit did not match expectations');

  const stepList: { status: OrderStatus; label: string; icon: React.ReactNode }[] = [
    { status: 'pending', label: 'Order Placed', icon: <Clock className="w-4 h-4" /> },
    { status: 'packed', label: 'Packed by Seller', icon: <Package className="w-4 h-4" /> },
    { status: 'shipped', label: 'In Transit', icon: <Truck className="w-4 h-4" /> },
    { status: 'out_for_delivery', label: 'Out for Delivery', icon: <Truck className="w-4 h-4" /> },
    { status: 'delivered', label: 'Delivered', icon: <CheckCircle2 className="w-4 h-4" /> },
  ];

  const getStepIndex = (st: OrderStatus): number => {
    if (st === 'returned') return 4;
    const idx = stepList.findIndex((s) => s.status === st);
    return idx === -1 ? 1 : idx;
  };

  const handleReturnSubmit = (orderId: string) => {
    requestOrderReturn(orderId, returnReason);
    setReturningOrderId(null);
    alert(`Return requested for Order #${orderId}. Refund has been credited instantly to your Bazaario Wallet!`);
  };

  const handleDownloadInvoice = (order: Order) => {
    const lines = order.items.map((i) => ` - ${i.productTitle} (Qty: ${i.quantity}) - $${i.unitPriceUSD}`).join('\n');
    const invoiceText = `BAZAARIO MARKETPLACE - DIGITAL INVOICE
======================================
Order ID: #${order.id}
Tracking Number: ${order.trackingNumber}
Courier: ${order.courier}
Payment Method: ${order.paymentMethod.toUpperCase()}
Date: ${order.createdAt}
--------------------------------------
LINE ITEMS:
${lines}
--------------------------------------
Subtotal: $${order.subtotalUSD}
Discount: -$${order.discountUSD}
Shipping: $${order.shippingUSD}
TOTAL AMOUNT: $${order.totalUSD}

Buyer Protection & 14-Day Return Guarantee Included.`;

    const blob = new Blob([invoiceText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice_Bazaario_${order.id}.txt`;
    a.click();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="bg-[#F5F2ED] border border-[#E0D8CC] rounded-[24px] p-6 flex flex-wrap items-center justify-between gap-4 shadow-sm text-[#3D3D35]">
        <div>
          <h2 className="text-xl font-serif font-bold text-[#3D3D35] flex items-center gap-2">
            My Orders &amp; Live Courier Tracking
          </h2>
          <p className="text-xs text-[#A89F91] mt-1">
            Track real-time shipment status, download invoices, or initiate 14-day hassle-free returns.
          </p>
        </div>

        <button
          onClick={() =>
            openAIChatWithPrompt('What should I do if my courier delivery is delayed or I need to reschedule pickup?')
          }
          className="px-4 py-2.5 rounded-full bg-[#5A5A40] hover:bg-[#484833] text-white text-xs font-medium border border-[#5A5A40] flex items-center gap-1.5 transition shadow-sm"
        >
          <Sparkles className="w-4 h-4" />
          <span>Ask AI about Order Policy</span>
        </button>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {orders.length === 0 ? (
          <div className="bg-white border border-[#E0D8CC] rounded-[32px] p-12 text-center text-[#A89F91] space-y-3 shadow-sm">
            <Package className="w-12 h-12 mx-auto opacity-30 text-[#6B705C]" />
            <h4 className="text-base font-serif font-bold text-[#3D3D35]">No orders placed yet</h4>
            <p className="text-xs font-sans">Explore our catalog and place your first order with Bazaario!</p>
          </div>
        ) : (
          orders.map((order) => {
            const currentIdx = getStepIndex(order.status);
            const isReturned = order.status === 'returned';

            return (
              <div
                key={order.id}
                className="bg-white border border-[#E0D8CC] rounded-[24px] overflow-hidden shadow-sm text-[#3D3D35]"
              >
                {/* Order Top Bar */}
                <div className="bg-[#F5F2ED] px-6 py-4 border-b border-[#E0D8CC] flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div className="flex flex-wrap items-center gap-6">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                        Order ID
                      </span>
                      <span className="font-extrabold text-orange-400">{order.id}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                        Date Placed
                      </span>
                      <span className="text-slate-200">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                        Total Amount
                      </span>
                      <span className="font-extrabold text-white">
                        {formatPrice(order.totalUSD, currency)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownloadInvoice(order)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <FileText className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Invoice</span>
                    </button>

                    {!isReturned && (
                      <button
                        onClick={() => setReturningOrderId(order.id)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-600/20 text-slate-300 hover:text-rose-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Return / Refund</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress Bar Timeline */}
                <div className="p-6 border-b border-slate-800/80">
                  {isReturned ? (
                    <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 text-xs text-rose-300 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>
                          <strong>Return Approved &amp; Processed:</strong> Refund credited instantly to your Bazaario Wallet.
                        </span>
                      </div>
                      <span className="font-semibold text-rose-400">14-Day Guarantee</span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                        <span>Courier: {order.courier}</span>
                        <span className="font-mono text-orange-400">{order.trackingNumber}</span>
                      </div>

                      {/* Visual Steps */}
                      <div className="grid grid-cols-5 gap-2 relative">
                        {stepList.map((step, idx) => {
                          const isDone = idx <= currentIdx;
                          const isCurrent = idx === currentIdx;
                          return (
                            <div key={step.status} className="flex flex-col items-center text-center">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition ${
                                  isCurrent
                                    ? 'bg-orange-600 border-orange-400 text-white shadow-lg shadow-orange-500/30'
                                    : isDone
                                    ? 'bg-emerald-600 border-emerald-500 text-white'
                                    : 'bg-slate-900 border-slate-800 text-slate-600'
                                }`}
                              >
                                {step.icon}
                              </div>
                              <span
                                className={`text-[11px] mt-1.5 font-semibold leading-tight ${
                                  isCurrent ? 'text-orange-400' : isDone ? 'text-slate-200' : 'text-slate-500'
                                }`}
                              >
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="text-right text-xs text-emerald-400 font-semibold">
                        Estimated Arrival: {order.estimatedDelivery}
                      </div>
                    </div>
                  )}
                </div>

                {/* Items in this Order */}
                <div className="p-6 space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Package Contents ({order.items.length} item{order.items.length > 1 ? 's' : ''})
                  </h4>

                  <div className="space-y-3">
                    {order.items.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between bg-slate-950/60 p-3 rounded-xl border border-slate-800"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={item.productImage}
                            alt={item.productTitle}
                            className="w-12 h-12 rounded-lg object-cover bg-slate-800 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">{item.productTitle}</p>
                            {item.variantName && (
                              <p className="text-[11px] text-slate-400">{item.variantName}</p>
                            )}
                            <span className="text-[10px] text-indigo-400 font-semibold block mt-0.5">
                              Sold by {item.sellerName}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="text-xs font-bold text-white">
                            {formatPrice(item.unitPriceUSD * item.quantity, currency)}
                          </p>
                          <span className="text-[11px] text-slate-400">Qty: {item.quantity}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Return Request Modal for this order */}
                {returningOrderId === order.id && (
                  <div className="p-6 bg-slate-950 border-t border-slate-800 space-y-3 animate-fadeIn">
                    <h5 className="text-xs font-bold text-white uppercase tracking-wider">
                      Initiate 14-Day Hassle-Free Return &amp; Instant Refund
                    </h5>
                    <div className="space-y-2">
                      <label className="text-xs text-slate-400 block">Select Return Reason:</label>
                      <select
                        value={returnReason}
                        onChange={(e) => setReturnReason(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-100 rounded-xl px-3 py-2"
                      >
                        <option value="Size/fit did not match expectations">
                          Size/fit did not match expectations
                        </option>
                        <option value="Product changed my mind">Product changed my mind</option>
                        <option value="Package box was slightly damaged">
                          Package box was slightly damaged in transit
                        </option>
                        <option value="Want to exchange for another variant">
                          Want to exchange for another color/variant
                        </option>
                      </select>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => handleReturnSubmit(order.id)}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl"
                      >
                        Confirm Return &amp; Refund (${order.totalUSD})
                      </button>
                      <button
                        onClick={() => setReturningOrderId(null)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          }))}
        </div>
      </div>
    );
  };
