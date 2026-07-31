import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Trash2,
  Copy,
  Check,
  ShoppingBag,
  TrendingUp,
  Zap,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { ChatMessage, Product } from '../../types';
import { formatPrice } from '../../utils/currency';

type ChatMode = 'concierge' | 'seller_advisor' | 'fast_support';

interface RoleOption {
  mode: ChatMode;
  label: string;
  sublabel: string;
  model: string;
  icon: React.ReactNode;
  badgeColor: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    mode: 'concierge',
    label: 'Shopping Concierge',
    sublabel: 'General shopping, gifts & product specs',
    model: 'gemini-3.5-flash',
    icon: <ShoppingBag className="w-4 h-4 text-orange-400" />,
    badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  },
  {
    mode: 'seller_advisor',
    label: 'Seller Advisor',
    sublabel: 'Complex SEO, pricing strategy & market analysis',
    model: 'gemini-3.1-pro-preview',
    icon: <TrendingUp className="w-4 h-4 text-indigo-400" />,
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  },
  {
    mode: 'fast_support',
    label: 'Fast Support Triage',
    sublabel: 'Instant shipping, COD & return policy answers',
    model: 'gemini-3.1-flash-lite',
    icon: <Zap className="w-4 h-4 text-emerald-400" />,
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  },
];

export const AIChatModal: React.FC = () => {
  const {
    isAIChatOpen,
    setAIChatOpen,
    aiChatInitialPrompt,
    products,
    currency,
    setSelectedProductModal,
    addToCart,
  } = useMarketplace();

  const [mode, setMode] = useState<ChatMode>('concierge');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      role: 'assistant',
      text: "Hello! I am your **Bazaario AI Assistant**. I can help you discover top-rated marketplace deals, compare specifications, or advise sellers on SEO and pricing strategy. What would you like to explore today?",
      timestamp: 'Just now',
      modelUsed: 'gemini-3.5-flash',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const threadEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (isAIChatOpen) {
      setTimeout(() => {
        threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages, isAIChatOpen, isLoading]);

  // Handle initial prompt if triggered from outside
  useEffect(() => {
    if (aiChatInitialPrompt && isAIChatOpen) {
      handleSendMessage(aiChatInitialPrompt);
    }
  }, [aiChatInitialPrompt]);

  if (!isAIChatOpen) return null;

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputText.trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}_u`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    if (!customPrompt) setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, text: m.text })),
          mode,
          userContext: { currency },
        }),
      });

      const data = await response.json();
      const replyText = data.text || 'I am ready to help you with Bazaario!';
      const modelUsed = data.modelUsed || ROLE_OPTIONS.find((r) => r.mode === mode)?.model;

      // Identify if reply mentions any product titles so we can show interactive product chips
      const matchedProducts = products.filter(
        (p) =>
          replyText.toLowerCase().includes(p.title.toLowerCase().slice(0, 15)) ||
          replyText.toLowerCase().includes(p.slug.split('-')[0])
      );

      const assistantMsg: ChatMessage = {
        id: `msg_${Date.now()}_a`,
        role: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed,
        suggestedProducts: matchedProducts.length > 0 ? matchedProducts.slice(0, 3) : undefined,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg: ChatMessage = {
        id: `msg_${Date.now()}_err`,
        role: 'assistant',
        text: "I apologize, but I encountered a network error. Let me know if you'd like to retry!",
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `msg_welcome_${Date.now()}`,
        role: 'assistant',
        text: "Conversation cleared. How can I assist you on **Bazaario** today?",
        timestamp: 'Just now',
        modelUsed: ROLE_OPTIONS.find((r) => r.mode === mode)?.model,
      },
    ]);
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const currentRoleObj = ROLE_OPTIONS.find((r) => r.mode === mode) || ROLE_OPTIONS[0];

  const suggestedChips =
    mode === 'seller_advisor'
      ? [
          'Write SEO title & tags for a wireless mechanical keyboard',
          'How do flash sale discounts impact seller GMV?',
          'Tips to reduce order return rates in apparel',
        ]
      : mode === 'fast_support'
      ? [
          'What is the 14-day return policy?',
          'What is the maximum Cash on Delivery (COD) order amount?',
          'How does Bazaario Buyer Protection work?',
        ]
      : [
          'Recommend noise-canceling headphones under $150',
          'Which smartwatch has the best battery life?',
          'What are the best handcrafted items for home decor?',
        ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3D3D35]/50 backdrop-blur-sm p-3 sm:p-6 animate-fadeIn font-['Georgia',serif]">
      <div className="relative w-full max-w-4xl h-[88vh] bg-white border border-[#E0D8CC] rounded-[32px] shadow-sm flex flex-col overflow-hidden text-[#3D3D35]">
        {/* Header with Role / Model Switcher */}
        <div className="bg-[#F5F2ED] border-b border-[#E0D8CC] px-4 py-3 sm:px-6 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#E0D8CC] text-[#5A5A40] border border-[#D4CDBC] flex items-center justify-center shadow-sm">
                <Sparkles className="w-5 h-5 text-[#5A5A40] animate-pulse" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-serif font-bold text-[#3D3D35] flex items-center gap-2">
                  Bazaario AI Assistant
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full border border-[#D4CDBC] bg-white font-sans font-semibold text-[#5A5A40]">
                    {currentRoleObj.model}
                  </span>
                </h3>
                <p className="text-xs text-[#A89F91]">
                  Multi-turn marketplace intelligence powered by Gemini
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleClearHistory}
                title="Clear Conversation"
                className="p-2 rounded-full text-[#A89F91] hover:text-red-700 hover:bg-[#E0D8CC]/50 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setAIChatOpen(false)}
                className="p-2 rounded-full text-[#A89F91] hover:text-[#3D3D35] hover:bg-[#E0D8CC]/50 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Role selector bar */}
          <div className="grid grid-cols-3 gap-1.5 bg-white p-1 rounded-2xl border border-[#E0D8CC]">
            {ROLE_OPTIONS.map((opt) => {
              const isActive = mode === opt.mode;
              return (
                <button
                  key={opt.mode}
                  onClick={() => setMode(opt.mode)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-left transition ${
                    isActive
                      ? 'bg-[#5A5A40] text-white shadow-sm font-serif'
                      : 'text-[#A89F91] hover:text-[#3D3D35] hover:bg-[#F5F2ED]/50 font-sans'
                  }`}
                >
                  <div className="shrink-0">{opt.icon}</div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold truncate">{opt.label}</div>
                    <div className="text-[10px] opacity-80 truncate hidden sm:block">
                      {opt.sublabel}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Chat Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 font-sans">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start`}
              >
                <div
                  className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center shadow-sm ${
                    isUser
                      ? 'bg-[#5A5A40] text-white'
                      : 'bg-[#E0D8CC] text-[#5A5A40] border border-[#D4CDBC]'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 ${
                    isUser
                      ? 'bg-[#5A5A40] text-white rounded-tr-none'
                      : 'bg-[#FDFCF8] text-[#3D3D35] border border-[#E0D8CC] rounded-tl-none shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <span className="text-[11px] font-semibold opacity-75">
                      {isUser ? 'You' : `${currentRoleObj.label} (${msg.modelUsed || currentRoleObj.model})`}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] opacity-60">{msg.timestamp}</span>
                      {!isUser && (
                        <button
                          onClick={() => handleCopyText(msg.id, msg.text)}
                          className="text-[#A89F91] hover:text-[#3D3D35] transition"
                          title="Copy response"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-[#5A5A40]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Message body with line breaks */}
                  <div className="text-sm leading-relaxed whitespace-pre-line space-y-2 font-sans">
                    {msg.text}
                  </div>

                  {/* Clickable Recommended Product Cards if present */}
                  {msg.suggestedProducts && msg.suggestedProducts.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-[#E0D8CC] space-y-2">
                      <p className="text-xs font-serif font-bold text-[#5A5A40] flex items-center gap-1.5">
                        <ShoppingBag className="w-3.5 h-3.5" />
                        Featured Bazaario Items:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {msg.suggestedProducts.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => {
                              setSelectedProductModal(p);
                              setAIChatOpen(false);
                            }}
                            className="group cursor-pointer bg-white hover:bg-[#F5F2ED]/50 border border-[#E0D8CC] hover:border-[#5A5A40] rounded-2xl p-2.5 flex items-center gap-3 transition shadow-sm"
                          >
                            <img
                              src={p.images[0]}
                              alt={p.title}
                              className="w-11 h-11 rounded-xl object-cover shrink-0 bg-[#F5F2ED] border border-[#E0D8CC]"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-serif font-bold text-[#3D3D35] truncate group-hover:text-[#5A5A40] transition">
                                {p.title}
                              </p>
                              <p className="text-xs font-bold text-[#5A5A40]">
                                {formatPrice(p.basePriceUSD, currency)}
                              </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-[#A89F91] group-hover:text-[#5A5A40] transition" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-[#E0D8CC] text-[#5A5A40] border border-[#D4CDBC] flex items-center justify-center">
                <Bot className="w-4 h-4 animate-bounce" />
              </div>
              <div className="bg-[#FDFCF8] border border-[#E0D8CC] rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-[#5A5A40] animate-ping" />
                <span className="text-xs text-[#A89F91]">
                  {currentRoleObj.label} is analyzing ({currentRoleObj.model})...
                </span>
              </div>
            </div>
          )}

          <div ref={threadEndRef} />
        </div>

        {/* Suggestion Prompt Chips */}
        <div className="px-4 py-2.5 border-t border-[#E0D8CC] bg-[#F5F2ED] flex items-center gap-2 overflow-x-auto no-scrollbar font-sans">
          <span className="text-[11px] font-semibold text-[#A89F91] shrink-0">Try asking:</span>
          {suggestedChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(chip)}
              className="text-xs whitespace-nowrap px-3.5 py-1.5 rounded-full bg-white hover:bg-[#E0D8CC]/60 text-[#3D3D35] border border-[#E0D8CC] transition shadow-sm"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Footer */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="bg-[#FDFCF8] p-3 sm:p-4 border-t border-[#E0D8CC] flex items-center gap-2 font-sans"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Ask ${currentRoleObj.label} anything about Bazaario (${currentRoleObj.model})...`}
            className="flex-1 bg-white text-[#3D3D35] placeholder-[#A89F91] rounded-full px-5 py-3 text-sm border border-[#E0D8CC] focus:outline-none focus:border-[#5A5A40] transition"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="px-6 py-3 rounded-full bg-[#5A5A40] hover:bg-[#484833] disabled:opacity-50 disabled:cursor-not-allowed text-white font-serif font-bold text-sm flex items-center gap-2 shadow-sm transition"
          >
            <span>Send</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
