export type AppRole = 'customer' | 'seller' | 'admin';
export type ProductCategory = string;

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'BDT' | 'PKR' | 'IDR';

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rate: number; // relative to USD (1 USD)
}

export interface Seller {
  id: string;
  businessName: string;
  rating: number;
  reviewsCount: number;
  isVerified: boolean;
  responseTime: string;
  country: string;
  joinedYear: number;
  commissionRate: number; // e.g. 10 for 10%
  totalSales: number;
}

export interface ProductVariant {
  id: string;
  name: string; // e.g., "Matte Slate / 256GB" or "Size L / Navy"
  sku: string;
  priceDelta: number; // added to basePrice
  stockQty: number;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number; // 1-5
  comment: string;
  date: string;
  verifiedPurchase: boolean;
  helpfulCount: number;
  sellerResponse?: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  category: string;
  sellerId: string;
  sellerName: string;
  basePriceUSD: number;
  discountPercent?: number; // flash sale or promo discount
  images: string[];
  description: string;
  attributes: Record<string, string>;
  variants: ProductVariant[];
  rating: number;
  reviewCount: number;
  reviews: Review[];
  inStock: boolean;
  isFlashSale?: boolean;
  isB2BEligible?: boolean;
  moq?: number; // minimum order qty for B2B
  tags: string[];
  createdAt: string;
}

export interface CartItem {
  id: string; // unique cart line ID
  productId: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  unitPriceUSD: number;
}

export interface Address {
  id: string;
  label: string; // e.g. "Home", "Office"
  fullName: string;
  phone: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export type PaymentMethodType = 'card' | 'wallet' | 'cod' | 'mobile_banking';

export interface OrderItem {
  productId: string;
  productTitle: string;
  productImage: string;
  variantName?: string;
  quantity: number;
  unitPriceUSD: number;
  sellerId: string;
  sellerName: string;
}

export type OrderStatus = 'pending' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'returned';

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotalUSD: number;
  discountUSD: number;
  shippingUSD: number;
  totalUSD: number;
  shippingAddress: Address;
  paymentMethod: PaymentMethodType;
  status: OrderStatus;
  trackingNumber: string;
  courier: string;
  createdAt: string;
  estimatedDelivery: string;
}

export interface Coupon {
  code: string;
  description: string;
  discountPercent: number;
  minSpendUSD: number;
}

export interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit';
  amountUSD: number;
  description: string;
  date: string;
  reference?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  modelUsed?: string;
  suggestedProducts?: Product[];
}

export interface AIImageAnalysisResult {
  title?: string;
  detectedProduct?: string;
  category?: string;
  priceRangeUSD?: string;
  suggestedPriceUSD?: number;
  styleAttributes?: string[];
  keyAttributes?: string[];
  matchingKeywords?: string[];
  tags?: string[];
  authenticityCheck?: string;
  description?: string;
  imageQualityScore?: number;
  imageQualityFeedback?: string;
  recommendationSummary?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  full_name?: string;
  username?: string;
  email: string;
  phone?: string;
  role: AppRole;
  seller_enabled: boolean;
  email_verified?: boolean;
  profile_photo?: string;
  created_at?: string;
  last_login?: string;
}

export interface SentEmailMessage {
  id: string;
  to: string;
  subject: string;
  type: 'email_verification' | 'password_reset' | 'security_alert';
  verificationLink?: string;
  resetLink?: string;
  message: string;
  timestamp: string;
}

