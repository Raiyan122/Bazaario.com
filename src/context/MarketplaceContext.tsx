import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Product,
  CartItem,
  AppRole,
  CurrencyCode,
  Order,
  Address,
  Coupon,
  WalletTransaction,
  Seller,
  Review,
  AuthUser,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_ADDRESSES,
  INITIAL_WALLET_TRANSACTIONS,
  MOCK_COUPONS,
  MOCK_SELLERS,
} from '../data/mockCatalog';
import { calculateDiscountedPrice } from '../utils/currency';

interface MarketplaceContextType {
  role: AppRole;
  setRole: (role: AppRole) => void;
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  products: Product[];
  sellers: Record<string, Seller>;
  cart: CartItem[];
  wishlistIds: string[];
  orders: Order[];
  addresses: Address[];
  walletBalanceUSD: number;
  walletHistory: WalletTransaction[];
  appliedCoupon: Coupon | null;
  rewardPoints: number;

  // Authentication & Profile
  user: AuthUser | null;
  authLoading: boolean;
  login: (credentials: { identifier?: string; email?: string; username?: string; password?: string }) => Promise<{ success: boolean; error?: string; verificationPreview?: any }>;
  register: (data: any) => Promise<{ success: boolean; error?: string; verificationPreview?: any }>;
  verifyEmail: (token: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  changePassword: (data: { currentPassword: string; newPassword: string; confirmPassword?: string }) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: Partial<AuthUser>) => Promise<{ success: boolean; error?: string; verificationPreview?: any }>;
  demoLogin: (role: AppRole) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
  
  // Cart Actions
  addToCart: (productId: string, variantId?: string, variantName?: string, qty?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, delta: number) => void;
  clearCart: () => void;
  applyCouponCode: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  
  // Wishlist Actions
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  
  // Order Actions
  placeOrder: (
    addressId: string,
    paymentMethod: 'card' | 'wallet' | 'cod' | 'mobile_banking',
    courier: string
  ) => Order;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  requestOrderReturn: (orderId: string, reason: string) => void;
  
  // Wallet Actions
  topUpWallet: (amountUSD: number, description?: string) => void;
  
  // Seller Actions
  addNewProduct: (productData: Partial<Product>) => Product;
  bulkAddProducts: (newProducts: Product[]) => void;
  updateSellerCommission: (sellerId: string, newRate: number) => void;
  addReviewToProduct: (productId: string, review: Omit<Review, 'id' | 'date'>) => void;

  // AI Modal Toggles
  isAIChatOpen: boolean;
  setAIChatOpen: (open: boolean) => void;
  aiChatInitialPrompt: string;
  openAIChatWithPrompt: (prompt: string) => void;
  isAIImageModalOpen: boolean;
  setAIImageModalOpen: (open: boolean) => void;
  aiImageModalMode: 'visual_search' | 'seller_listing';
  openAIImageModal: (mode?: 'visual_search' | 'seller_listing') => void;
  
  // UI Drawers & Modals
  isCartDrawerOpen: boolean;
  setCartDrawerOpen: (open: boolean) => void;
  selectedProductModal: Product | null;
  setSelectedProductModal: (prod: Product | null) => void;
  isCheckoutOpen: boolean;
  setCheckoutOpen: (open: boolean) => void;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export const MarketplaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<AppRole>('customer');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem('bazaario_token') || '';
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}`, 'x-auth-token': token } : {}),
    };
  };

  const refreshUser = useCallback(async () => {
    try {
      setAuthLoading(true);
      const res = await fetch('/api/auth/me', {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          setRole(data.user.role || 'customer');
          return;
        }
      }
      // If no valid session, initialize with customer demo user so AI studio preview works by default
      const demoRes = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'customer' }),
      });
      if (demoRes.ok) {
        const demoData = await demoRes.json();
        if (demoData.token) localStorage.setItem('bazaario_token', demoData.token);
        if (demoData.user) {
          setUser(demoData.user);
          setRole('customer');
        }
      }
    } catch (err) {
      console.error('Failed to fetch auth me:', err);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (credentials: { identifier?: string; email?: string; username?: string; password?: string }) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed', verificationPreview: data.verificationPreview };
      }
      if (data.token) localStorage.setItem('bazaario_token', data.token);
      if (data.user) {
        setUser(data.user);
        setRole(data.user.role);
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const register = async (formData: any) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed' };
      }
      return { success: true, verificationPreview: data.verificationPreview };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Verification failed' };
      }
      if (data.token) localStorage.setItem('bazaario_token', data.token);
      if (data.user) {
        setUser(data.user);
        setRole(data.user.role);
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', headers: getAuthHeaders() });
    } catch (e) {
      console.error(e);
    }
    localStorage.removeItem('bazaario_token');
    setUser(null);
    setRole('customer');
  };

  const changePassword = async (pwdData: { currentPassword: string; newPassword: string; confirmPassword?: string }) => {
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(pwdData),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Password change failed' };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const updateProfile = async (profileData: Partial<AuthUser>) => {
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(profileData),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Profile update failed' };
      }
      if (data.user) {
        setUser(data.user);
      }
      return { success: true, verificationPreview: data.verificationPreview };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const demoLogin = async (targetRole: AppRole) => {
    try {
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: targetRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Demo login failed' };
      }
      if (data.token) localStorage.setItem('bazaario_token', data.token);
      if (data.user) {
        setUser(data.user);
        setRole(data.user.role);
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [sellers, setSellers] = useState<Record<string, Seller>>(MOCK_SELLERS);
  const [cart, setCart] = useState<CartItem[]>([
    {
      id: 'cart_init_1',
      productId: 'prod_anc_headphones',
      variantId: 'var_head_black',
      variantName: 'Matte Obsidian Black',
      quantity: 1,
      unitPriceUSD: 106.59,
    },
  ]);
  const [wishlistIds, setWishlistIds] = useState<string[]>(['prod_leather_backpack', 'prod_espresso_machine']);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [addresses, setAddresses] = useState<Address[]>(INITIAL_ADDRESSES);
  const [walletBalanceUSD, setWalletBalanceUSD] = useState<number>(195.0);
  const [walletHistory, setWalletHistory] = useState<WalletTransaction[]>(INITIAL_WALLET_TRANSACTIONS);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [rewardPoints, setRewardPoints] = useState<number>(640); // 1 pt per dollar

  // AI Modals state
  const [isAIChatOpen, setAIChatOpen] = useState(false);
  const [aiChatInitialPrompt, setAiChatInitialPrompt] = useState('');
  const [isAIImageModalOpen, setAIImageModalOpen] = useState(false);
  const [aiImageModalMode, setAiImageModalMode] = useState<'visual_search' | 'seller_listing'>('visual_search');

  // UI Drawers state
  const [isCartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [selectedProductModal, setSelectedProductModal] = useState<Product | null>(null);
  const [isCheckoutOpen, setCheckoutOpen] = useState(false);

  const openAIChatWithPrompt = (prompt: string) => {
    setAiChatInitialPrompt(prompt);
    setAIChatOpen(true);
  };

  const openAIImageModal = (mode: 'visual_search' | 'seller_listing' = 'visual_search') => {
    setAiImageModalMode(mode);
    setAIImageModalOpen(true);
  };

  const addToCart = (productId: string, variantId?: string, variantName?: string, qty = 1) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const unitPriceUSD = calculateDiscountedPrice(prod.basePriceUSD, prod.discountPercent);
    const existingIndex = cart.findIndex(
      (item) => item.productId === productId && item.variantId === variantId
    );

    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += qty;
      setCart(updated);
    } else {
      const newItem: CartItem = {
        id: `cart_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        productId,
        variantId,
        variantName,
        quantity: qty,
        unitPriceUSD,
      };
      setCart((prev) => [...prev, newItem]);
    }
    setCartDrawerOpen(true);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const updateCartQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === cartItemId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const applyCouponCode = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    const found = MOCK_COUPONS.find((c) => c.code === cleanCode);
    if (!found) {
      return { success: false, message: 'Invalid coupon code. Try WELCOME20 or FLASHSALE' };
    }
    setAppliedCoupon(found);
    return { success: true, message: `Applied code ${found.code} - ${found.discountPercent}% OFF!` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const toggleWishlist = (productId: string) => {
    setWishlistIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const isInWishlist = (productId: string) => wishlistIds.includes(productId);

  const placeOrder = (
    addressId: string,
    paymentMethod: 'card' | 'wallet' | 'cod' | 'mobile_banking',
    courier: string
  ): Order => {
    const selectedAddress = addresses.find((a) => a.id === addressId) || addresses[0];
    const subtotalUSD = cart.reduce((acc, item) => acc + item.unitPriceUSD * item.quantity, 0);
    const discountUSD = appliedCoupon ? Number((subtotalUSD * (appliedCoupon.discountPercent / 100)).toFixed(2)) : 0;
    const shippingUSD = subtotalUSD > 50 ? 0 : 4.99;
    const totalUSD = Number((subtotalUSD - discountUSD + shippingUSD).toFixed(2));

    // Deduct from wallet if wallet payment is chosen
    if (paymentMethod === 'wallet' && walletBalanceUSD >= totalUSD) {
      setWalletBalanceUSD((prev) => Number((prev - totalUSD).toFixed(2)));
      setWalletHistory((prev) => [
        {
          id: `tx_${Date.now()}`,
          type: 'debit',
          amountUSD: totalUSD,
          description: `Order Payment (#BZ-${Math.floor(1000 + Math.random() * 9000)})`,
          date: new Date().toISOString().split('T')[0],
        },
        ...prev,
      ]);
    }

    const orderItems = cart.map((item) => {
      const p = products.find((pr) => pr.id === item.productId);
      return {
        productId: item.productId,
        productTitle: p?.title || 'Bazaario Product',
        productImage: p?.images[0] || '',
        variantName: item.variantName,
        quantity: item.quantity,
        unitPriceUSD: item.unitPriceUSD,
        sellerId: p?.sellerId || 'seller_1',
        sellerName: p?.sellerName || 'TechNova Official Store',
      };
    });

    const newOrder: Order = {
      id: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
      userId: 'usr_101',
      items: orderItems,
      subtotalUSD,
      discountUSD,
      shippingUSD,
      totalUSD,
      shippingAddress: selectedAddress,
      paymentMethod,
      status: 'packed',
      trackingNumber: `BZ-TRK-${Math.floor(1000000 + Math.random() * 9000000)}`,
      courier: courier || 'Bazaario Standard Delivery',
      createdAt: new Date().toISOString(),
      estimatedDelivery: '3 Business Days',
    };

    setOrders((prev) => [newOrder, ...prev]);
    setRewardPoints((prev) => prev + Math.floor(totalUSD));
    clearCart();
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return { ...o, status };
        }
        return o;
      })
    );
  };

  const requestOrderReturn = (orderId: string, reason: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status: 'returned' as const,
          };
        }
        return o;
      })
    );
    // Auto credit wallet on return
    const ord = orders.find((o) => o.id === orderId);
    if (ord) {
      setWalletBalanceUSD((prev) => Number((prev + ord.totalUSD).toFixed(2)));
      setWalletHistory((prev) => [
        {
          id: `tx_ret_${Date.now()}`,
          type: 'credit',
          amountUSD: ord.totalUSD,
          description: `Refund for Return Order ${orderId} (${reason})`,
          date: new Date().toISOString().split('T')[0],
        },
        ...prev,
      ]);
    }
  };

  const topUpWallet = (amountUSD: number, description = 'Wallet Credit Top-up') => {
    setWalletBalanceUSD((prev) => Number((prev + amountUSD).toFixed(2)));
    setWalletHistory((prev) => [
      {
        id: `tx_${Date.now()}`,
        type: 'credit',
        amountUSD,
        description,
        date: new Date().toISOString().split('T')[0],
      },
      ...prev,
    ]);
  };

  const addNewProduct = (productData: Partial<Product>): Product => {
    const newId = `prod_${Date.now()}`;
    const newProd: Product = {
      id: newId,
      title: productData.title || 'New Bazaario Product',
      slug: (productData.title || 'new-product').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category: productData.category || 'Electronics & Gadgets',
      sellerId: productData.sellerId || 'seller_1',
      sellerName: productData.sellerName || 'TechNova Official Store',
      basePriceUSD: Number(productData.basePriceUSD || 49.99),
      discountPercent: productData.discountPercent || 0,
      images:
        productData.images && productData.images.length > 0
          ? productData.images
          : ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80'],
      description: productData.description || 'Quality product listed on Bazaario Marketplace.',
      attributes: productData.attributes || { Condition: 'Brand New' },
      variants: productData.variants || [
        { id: 'var_std_1', name: 'Standard Unit', sku: `SKU-${Date.now().toString().slice(-4)}`, priceDelta: 0, stockQty: 50 },
      ],
      rating: 5.0,
      reviewCount: 1,
      reviews: [
        {
          id: `rev_${Date.now()}`,
          userId: 'usr_ver',
          userName: 'Verified Buyer',
          userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
          rating: 5,
          comment: 'Just listed! Highly anticipated release on Bazaario.',
          date: 'Just now',
          verifiedPurchase: true,
          helpfulCount: 2,
        },
      ],
      inStock: true,
      tags: productData.tags || ['featured', 'new'],
      createdAt: new Date().toISOString().split('T')[0],
    };

    setProducts((prev) => [newProd, ...prev]);
    return newProd;
  };

  const bulkAddProducts = (newProducts: Product[]) => {
    setProducts((prev) => [...newProducts, ...prev]);
  };

  const updateSellerCommission = (sellerId: string, newRate: number) => {
    setSellers((prev) => {
      const sel = prev[sellerId];
      if (!sel) return prev;
      return {
        ...prev,
        [sellerId]: { ...sel, commissionRate: newRate },
      };
    });
  };

  const addReviewToProduct = (productId: string, review: Omit<Review, 'id' | 'date'>) => {
    const newRev: Review = {
      ...review,
      id: `rev_${Date.now()}`,
      date: 'Just now',
      helpfulCount: 1,
    };
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const newCount = p.reviewCount + 1;
          const newAvg = Number(((p.rating * p.reviewCount + review.rating) / newCount).toFixed(1));
          return {
            ...p,
            rating: newAvg,
            reviewCount: newCount,
            reviews: [newRev, ...p.reviews],
          };
        }
        return p;
      })
    );
  };

  return (
    <MarketplaceContext.Provider
      value={{
        role,
        setRole,
        currency,
        setCurrency,
        products,
        sellers,
        cart,
        wishlistIds,
        orders,
        addresses,
        walletBalanceUSD,
        walletHistory,
        appliedCoupon,
        rewardPoints,
        user,
        authLoading,
        login,
        register,
        verifyEmail,
        logout,
        changePassword,
        updateProfile,
        demoLogin,
        refreshUser,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        applyCouponCode,
        removeCoupon,
        toggleWishlist,
        isInWishlist,
        placeOrder,
        updateOrderStatus,
        requestOrderReturn,
        topUpWallet,
        addNewProduct,
        bulkAddProducts,
        updateSellerCommission,
        addReviewToProduct,
        isAIChatOpen,
        setAIChatOpen,
        aiChatInitialPrompt,
        openAIChatWithPrompt,
        isAIImageModalOpen,
        setAIImageModalOpen,
        aiImageModalMode,
        openAIImageModal,
        isCartDrawerOpen,
        setCartDrawerOpen,
        selectedProductModal,
        setSelectedProductModal,
        isCheckoutOpen,
        setCheckoutOpen,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
};

export const useMarketplace = () => {
  const ctx = useContext(MarketplaceContext);
  if (!ctx) throw new Error('useMarketplace must be used within MarketplaceProvider');
  return ctx;
};
