import React from 'react';
import {
  Wallet,
  PlusCircle,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  Gift,
  CreditCard,
  History,
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { formatPrice } from '../../utils/currency';

export const WalletView: React.FC = () => {
  const { walletBalanceUSD, topUpWallet, currency } = useMarketplace();

  const transactions = [
    {
      id: 'tx_881',
      title: 'Top-up via Apple Pay',
      type: 'credit' as const,
      amountUSD: 100,
      date: 'July 28, 2026',
    },
    {
      id: 'tx_880',
      title: 'Order Refund - #BZ-98842',
      type: 'credit' as const,
      amountUSD: 49.99,
      date: 'July 26, 2026',
    },
    {
      id: 'tx_879',
      title: 'Purchase - SonicPro Wireless Headphones',
      type: 'debit' as const,
      amountUSD: 129.99,
      date: 'July 22, 2026',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Top Banner */}
      <div className="bg-[#F5F2ED] border border-[#E0D8CC] rounded-[24px] p-6 shadow-sm text-[#3D3D35]">
        <h2 className="text-xl font-serif font-bold text-[#3D3D35]">Bazaario Wallet &amp; Instant Cash Credit</h2>
        <p className="text-xs text-[#A89F91] mt-1">
          Use wallet funds for 1-click checkout across all international Bazaario sellers with zero currency conversion fees.
        </p>
      </div>

      {/* Wallet Card & Rewards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Main Wallet Balance Card */}
        <div className="bg-[#6B705C] border border-[#5A5A40] rounded-[32px] p-6 flex flex-col justify-between space-y-6 shadow-sm text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 text-white border border-white/20 flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Available Balance
                </span>
                <span className="text-xs text-white/80">Multi-currency enabled</span>
              </div>
            </div>

            <ShieldCheck className="w-6 h-6 text-white/90" />
          </div>

          <div>
            <div className="text-4xl font-serif font-bold text-white tracking-tight">
              {formatPrice(walletBalanceUSD, currency)}
            </div>
            <p className="text-xs text-white/80 mt-1">
              Equivalent to ${walletBalanceUSD.toFixed(2)} USD
            </p>
          </div>

          {/* Top Up Buttons */}
          <div className="border-t border-white/20 pt-4">
            <span className="text-[11px] font-semibold text-white/90 uppercase block mb-2">
              Instant Top-Up (Demo Mode Credit):
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[50, 100, 250].map((amount) => (
                <button
                  key={amount}
                  onClick={() => topUpWallet(amount)}
                  className="py-2.5 rounded-full bg-[#5A5A40] hover:bg-[#484833] text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>+{formatPrice(amount, currency)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reward Points Card */}
        <div className="bg-white border border-[#E0D8CC] rounded-[32px] p-6 flex flex-col justify-between space-y-6 shadow-sm text-[#3D3D35]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#E0D8CC] text-[#5A5A40] border border-[#D4CDBC] flex items-center justify-center">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider block">
                  Bazaario Loyalty Rewards
                </span>
                <span className="text-xs text-[#A89F91]">Earn points on every delivery</span>
              </div>
            </div>
          </div>

          <div>
            <div className="text-3xl font-serif font-bold text-[#3D3D35]">1,450 pts</div>
            <p className="text-xs text-[#A89F91] mt-1">
              Value: approx. {formatPrice(14.5, currency)} discount on next order
            </p>
          </div>

          <div className="bg-[#F5F2ED] p-4 rounded-2xl border border-[#E0D8CC] text-xs text-[#3D3D35]">
            <strong className="text-[#5A5A40] block mb-0.5">How points work:</strong>
            You earn 10 points for every $1 spent on Bazaario Marketplace. Redeem points anytime at checkout or convert them to your Bazaario Wallet balance.
          </div>
        </div>
      </div>

      {/* Transaction Ledger */}
      <div className="bg-white border border-[#E0D8CC] rounded-[32px] p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 border-b border-[#E0D8CC] pb-3">
          <History className="w-4 h-4 text-[#5A5A40]" />
          <h3 className="text-base font-serif font-bold text-[#3D3D35]">Recent Wallet Activity</h3>
        </div>

        <div className="space-y-3">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="bg-[#FDFCF8] p-4 rounded-2xl border border-[#E0D8CC] flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center ${
                    tx.type === 'credit'
                      ? 'bg-[#E0D8CC] text-[#5A5A40] border border-[#D4CDBC]'
                      : 'bg-[#F5F2ED] text-[#8F6A48] border border-[#E0D8CC]'
                  }`}
                >
                  {tx.type === 'credit' ? (
                    <ArrowDownLeft className="w-4 h-4" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-serif font-bold text-[#3D3D35]">{tx.title}</h4>
                  <span className="text-[10px] text-[#A89F91]">{tx.date}</span>
                </div>
              </div>

              <div
                className={`text-sm font-serif font-bold ${
                  tx.type === 'credit' ? 'text-[#5A5A40]' : 'text-[#3D3D35]'
                }`}
              >
                {tx.type === 'credit' ? '+' : '-'}
                {formatPrice(tx.amountUSD, currency)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
