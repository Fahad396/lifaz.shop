export interface ProductVariant {
  id: string;
  size: string;
  color: string;
  sku: string;
  inventory: number;
  inStock: boolean;
}

export interface SizeMeasurement {
  size: string;
  chestInches: number;
  lengthInches: number;
  shoulderInches: number;
  sleeveInches: number;
  waistInches?: number;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  drop: string;
  dropNumber: number;
  category: string;
  color: string;
  colorHex: string;
  description: string;
  details: string[];
  fabrication: string[];
  images: string[];
  sizeChartImage?: string;
  sizeChartNotes?: string;
  measurements?: SizeMeasurement[];
  variants: ProductVariant[];
  rating: number;
  reviewCount: number;
  featured?: boolean;
  badge?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Drop {
  id: string;
  dropNumber: number;
  title: string;
  name: string;
  subtitle: string;
  description: string;
  heroImage: string;
  lookbookImages?: string[];
  status: "Active" | "Upcoming" | "Archived";
  releaseDate: string;
  createdAt?: string;
}

export interface PaymentMethodConfig {
  id: string;
  name: string;
  type: "cod" | "mfs" | "card" | "bank" | "custom";
  provider: "cod" | "bkash" | "nagad" | "rocket" | "upay" | "card" | "bank" | "custom";
  accountNumber?: string;
  accountType?: "Personal" | "Merchant" | "Agent";
  instructions?: string;
  requiresTrxId?: boolean;
  isActive: boolean;
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  productId: string;
  variantId?: string;
  title: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  orderNumber?: string;
  userId?: string;
  customer: string;
  email: string;
  phone: string;
  division: string;
  area: string;
  address: string;
  items: string; // Summary string or serialized
  lineItems?: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  paymentType?: "advance_delivery_cod" | "full_advance" | "full_cod";
  advancePaid?: number;
  dueAmount?: number;
  status: "Order Confirmed" | "In Atelier Prep" | "Dispatched via Courier" | "Delivered" | "Cancelled";
  paymentMethod: string;
  paymentMethodId?: string;
  paymentStatus?: string;
  bkashTrxId?: string;
  trxId?: string;
  orderStatus?: string;
  paymentReference?: string;
  date: string;
  createdAt: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  division?: string;
  area?: string;
  address?: string;
  vipTier?: "Member" | "Silver" | "Gold" | "Atelier VIP";
  createdAt: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Inquiry {
  id: string;
  ticketNumber: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  orderNumber?: string;
  status: "Open" | "In Review" | "Resolved";
  createdAt: string;
}

export interface Subscriber {
  id: string;
  email: string;
  subscribedAt: string;
}

export interface HeroSettings {
  bannerTag: string;
  showBannerTag: boolean;
  title: string;
  subtitle: string;
  image: string;
  ctaPrimaryText: string;
  ctaPrimaryLink: string;
  ctaSecondaryText: string;
  ctaSecondaryLink: string;
  headlineSize: "monumental" | "medium" | "compact";
  headlineFontSizeRem: number;
  headlineTracking: "ultra-wide" | "wide" | "normal";
  headlineAlign: "left" | "center" | "right";
  headlineColor: string;
  headlineTransform: "uppercase" | "none" | "capitalize";
  headlineLineHeight: number;
  headlineShadow: "none" | "subtle" | "heavy";
  photoZoom: number;
  photoBrightness: number;
  photoContrast: number;
  photoPosition: "top" | "center" | "bottom";
  photoFilter: "none" | "monochrome" | "warm" | "cool" | "contrast";
}

export interface MosaicSettings {
  tag: string;
  title: string;
  description: string;
  // Left Hero Spread
  leftImage: string;
  leftTag: string;
  leftTitle: string;
  leftCtaText: string;
  leftCtaLink: string;
  // Right Stacked Spread
  rightImage: string;
  rightTag: string;
  rightTitle: string;
  // Feature Callouts
  callout1Tag: string;
  callout1Title: string;
  callout1Description: string;
  callout1Link: string;
  callout1LinkText: string;
  callout2Tag: string;
  callout2Title: string;
  callout2Description: string;
  callout2Link: string;
  callout2LinkText: string;
}

export interface DatabaseSchema {
  users?: User[];
  products: Product[];
  drops: Drop[];
  orders: Order[];
  paymentMethods?: PaymentMethodConfig[];
  categories: string[];
  inquiries: Inquiry[];
  subscribers: Subscriber[];
  hero: HeroSettings;
  mosaic?: MosaicSettings;
}

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  title: string;
  slug: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
  image: string;
  maxInventory?: number;
}
