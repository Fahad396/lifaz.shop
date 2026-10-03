import fs from "fs";
import path from "path";
import {
  DatabaseSchema,
  Product,
  Drop,
  Order,
  User,
  Inquiry,
  Subscriber,
  HeroSettings,
  MosaicSettings,
  PaymentMethodConfig,
} from "./types";

// 1. VPS & Local Configurable Path Resolution
const DATA_DIR =
  process.env.LIFAZ_DATA_DIR || path.join(process.cwd(), "data");
const DB_PATH =
  process.env.DATABASE_FILE || path.join(DATA_DIR, "lifaz-database.json");
const BACKUP_DIR = path.join(DATA_DIR, "backups");

let lastSnapshotTime = 0;
const SNAPSHOT_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes rolling snapshots
const MAX_BACKUPS_RETAINED = 30; // Keep last 30 snapshots on VPS disk

export const DEFAULT_PAYMENT_METHODS: PaymentMethodConfig[] = [
  {
    id: "pay_cod",
    name: "Cash on Delivery (COD)",
    type: "cod",
    provider: "cod",
    instructions: "Inspect luxury garments upon doorstep delivery before cash settlement.",
    requiresTrxId: false,
    isActive: true,
    displayOrder: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "pay_bkash",
    name: "bKash Mobile Banking",
    type: "mfs",
    provider: "bkash",
    accountNumber: "01711-000000",
    accountType: "Merchant",
    instructions: "Send Money / Payment to our official bKash Merchant Wallet. Enter your Phone Number as reference and submit the 8-digit Transaction ID (TrxID) below.",
    requiresTrxId: true,
    isActive: true,
    displayOrder: 2,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "pay_nagad",
    name: "Nagad Mobile Banking",
    type: "mfs",
    provider: "nagad",
    accountNumber: "01711-000000",
    accountType: "Merchant",
    instructions: "Send Money / Payment to our official Nagad Merchant Wallet. Enter your Phone Number as reference and submit the 8-digit Transaction ID (TrxID) below.",
    requiresTrxId: true,
    isActive: true,
    displayOrder: 3,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "pay_card",
    name: "Credit / Debit Card (Visa, Mastercard, AMEX)",
    type: "card",
    provider: "card",
    instructions: "3D Secure SSL encrypted payment gateway. Direct gateway redirection and instant authentication.",
    requiresTrxId: false,
    isActive: true,
    displayOrder: 4,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

const DEFAULT_DB: DatabaseSchema = {
  users: [],
  products: [],
  drops: [],
  orders: [],
  paymentMethods: DEFAULT_PAYMENT_METHODS,
  categories: [
    "Outerwear",
    "Tailoring",
    "Dresses",
    "Tops",
    "Bottoms",
  ],
  inquiries: [],
  subscribers: [],
  hero: {
    bannerTag: "",
    showBannerTag: false,
    title: "LIFAZ ATELIER",
    subtitle: "Dhaka Atelier // Ready-To-Wear & Capsule Drops.",
    image: "",
    ctaPrimaryText: "SHOP ALL",
    ctaPrimaryLink: "/collections/all",
    ctaSecondaryText: "CAMPAIGN",
    ctaSecondaryLink: "/editorial",
    headlineSize: "monumental",
    headlineFontSizeRem: 5.5,
    headlineTracking: "wide",
    headlineAlign: "center",
    headlineColor: "#FFFFFF",
    headlineTransform: "uppercase",
    headlineLineHeight: 0.95,
    headlineShadow: "subtle",
    photoZoom: 100,
    photoBrightness: 100,
    photoContrast: 100,
    photoPosition: "center",
    photoFilter: "none",
  },
  mosaic: {
    tag: "ARCHITECTURAL PROPORTION & DRAPE",
    title: "SCULPTED MINIMALISM",
    description:
      "Constructed with bonded faux leather and structured tailoring. Every garment is engineered in our Dhaka atelier for fluid movement and dramatic silhouette.",
    leftImage: "",
    leftTag: "CAPSULE DROP // STUDY",
    leftTitle: "BONDED VEGAN LEATHER",
    leftCtaText: "EXPLORE ALL PIECES",
    leftCtaLink: "/collections/all",
    rightImage: "",
    rightTag: "RUNWAY ARCHIVE",
    rightTitle: "THE DHAKA SESSIONS",
    callout1Tag: "7-DAY SIZING DESK",
    callout1Title: "Complimentary Swap",
    callout1Description: "Doorstep size exchange available across all 64 districts.",
    callout1Link: "/pages/faq",
    callout1LinkText: "LEARN MORE",
    callout2Tag: "64-DISTRICT COURIER",
    callout2Title: "Insured Shipping",
    callout2Description: "Same-day VIP concierge in Dhaka, and 48-hour nationwide delivery.",
    callout2Link: "/pages/shipping",
    callout2LinkText: "DELIVERY MATRIX",
  },
};

/**
 * Ensures data directory and json database exist
 */
function ensureDbExists(): void {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_DB, null, 2), "utf-8");
  }
}

/**
 * Rotates and cleans old backup snapshots on VPS disk
 */
function pruneOldBackups(): void {
  try {
    if (!fs.existsSync(BACKUP_DIR)) return;
    const files = fs
      .readdirSync(BACKUP_DIR)
      .filter((f) => f.endsWith(".json"))
      .map((f) => ({
        name: f,
        path: path.join(BACKUP_DIR, f),
        mtime: fs.statSync(path.join(BACKUP_DIR, f)).mtimeMs,
      }))
      .sort((a, b) => b.mtime - a.mtime);

    if (files.length > MAX_BACKUPS_RETAINED) {
      const toDelete = files.slice(MAX_BACKUPS_RETAINED);
      for (const item of toDelete) {
        fs.unlinkSync(item.path);
      }
    }
  } catch (err) {
    console.error("Failed to prune old database backups:", err);
  }
}

/**
 * Creates an automated local snapshot backup file
 */
function createLocalSnapshot(db: DatabaseSchema, isManual = false): void {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const prefix = isManual ? "manual" : "auto";
    const backupFile = path.join(BACKUP_DIR, `snapshot-${prefix}-${timestamp}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(db, null, 2), "utf-8");
    lastSnapshotTime = Date.now();
    pruneOldBackups();
  } catch (err) {
    console.error("Failed to write snapshot backup:", err);
  }
}

/**
 * Auto-heal: Attempts to recover corrupt database from the latest valid backup
 */
function attemptAutoRecovery(): DatabaseSchema | null {
  try {
    if (!fs.existsSync(BACKUP_DIR)) return null;
    const files = fs
      .readdirSync(BACKUP_DIR)
      .filter((f) => f.endsWith(".json"))
      .map((f) => ({
        path: path.join(BACKUP_DIR, f),
        mtime: fs.statSync(path.join(BACKUP_DIR, f)).mtimeMs,
      }))
      .sort((a, b) => b.mtime - a.mtime);

    for (const file of files) {
      try {
        const raw = fs.readFileSync(file.path, "utf-8");
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          console.warn(`[LIFAZ DB AUTO-HEAL] Restored database from backup snapshot: ${file.path}`);
          fs.writeFileSync(DB_PATH, JSON.stringify(parsed, null, 2), "utf-8");
          return parsed;
        }
      } catch {
        continue;
      }
    }
  } catch (err) {
    console.error("Auto recovery search failed:", err);
  }
  return null;
}

/**
 * Reads database safely with auto-healing and normalization
 */
export function getDatabase(): DatabaseSchema {
  try {
    ensureDbExists();
    const data = fs.readFileSync(DB_PATH, "utf-8");
    let parsed: any;
    try {
      parsed = JSON.parse(data);
    } catch (parseError) {
      console.error("[LIFAZ DB ERROR] JSON parse error in database file:", parseError);
      const recovered = attemptAutoRecovery();
      if (recovered) {
        parsed = recovered;
      } else {
        throw parseError;
      }
    }

    return {
      ...DEFAULT_DB,
      ...parsed,
      users: parsed.users || [],
      products: parsed.products || [],
      drops: parsed.drops || [],
      orders: parsed.orders || [],
      paymentMethods:
        parsed.paymentMethods && parsed.paymentMethods.length > 0
          ? parsed.paymentMethods
          : DEFAULT_PAYMENT_METHODS,
      categories: parsed.categories || DEFAULT_DB.categories,
      inquiries: parsed.inquiries || [],
      subscribers: parsed.subscribers || [],
      hero: parsed.hero || DEFAULT_DB.hero,
      mosaic: parsed.mosaic || DEFAULT_DB.mosaic,
    };
  } catch (error) {
    console.error("Failed to read database file:", error);
    return DEFAULT_DB;
  }
}

/**
 * Writes atomic update to local database and manages rolling snapshots
 */
export function saveDatabase(db: DatabaseSchema, forceSnapshot = false): boolean {
  try {
    ensureDbExists();
    const tmpPath = `${DB_PATH}.tmp`;
    fs.writeFileSync(tmpPath, JSON.stringify(db, null, 2), "utf-8");
    fs.renameSync(tmpPath, DB_PATH);

    // Periodic or forced local snapshot on VPS disk
    if (forceSnapshot || Date.now() - lastSnapshotTime > SNAPSHOT_INTERVAL_MS) {
      createLocalSnapshot(db, forceSnapshot);
    }

    return true;
  } catch (error) {
    console.error("Failed to write database file:", error);
    return false;
  }
}

// ---------------- PRODUCTS CRUD ---------------- //

export function getProducts(): Product[] {
  return getDatabase().products;
}

export function getProductById(id: string): Product | undefined {
  return getDatabase().products.find(
    (p) => p.id === id || p.slug === id || p.slug === id.toLowerCase()
  );
}

export function saveProduct(product: Product): Product {
  const db = getDatabase();
  const existingIndex = db.products.findIndex((p) => p.id === product.id);

  if (existingIndex >= 0) {
    db.products[existingIndex] = {
      ...db.products[existingIndex],
      ...product,
      updatedAt: new Date().toISOString(),
    };
  } else {
    db.products.unshift({
      ...product,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  saveDatabase(db);
  return product;
}

export function deleteProduct(id: string): boolean {
  const db = getDatabase();
  const initialLength = db.products.length;
  db.products = db.products.filter((p) => p.id !== id && p.slug !== id);
  if (db.products.length !== initialLength) {
    saveDatabase(db);
    return true;
  }
  return false;
}

// ---------------- DROPS CRUD ---------------- //

export function getDrops(): Drop[] {
  return getDatabase().drops;
}

export function getDropById(id: string): Drop | undefined {
  return getDatabase().drops.find(
    (d) =>
      d.id === id ||
      d.id === `drop-${id}` ||
      d.dropNumber.toString() === id ||
      d.title.toLowerCase().includes(id.toLowerCase())
  );
}

export function saveDrop(drop: Drop): Drop {
  const db = getDatabase();
  const index = db.drops.findIndex((d) => d.id === drop.id);
  if (index >= 0) {
    db.drops[index] = { ...db.drops[index], ...drop };
  } else {
    db.drops.unshift({
      ...drop,
      createdAt: new Date().toISOString(),
    });
  }
  saveDatabase(db);
  return drop;
}

export function deleteDrop(id: string): boolean {
  const db = getDatabase();
  const initialLength = db.drops.length;
  db.drops = db.drops.filter((d) => d.id !== id);
  if (db.drops.length !== initialLength) {
    saveDatabase(db);
    return true;
  }
  return false;
}

// ---------------- CATEGORIES CRUD ---------------- //

export function getCategories(): string[] {
  return getDatabase().categories;
}

export function saveCategory(name: string): string[] {
  const db = getDatabase();
  const cleanName = name.trim();
  if (!cleanName || db.categories.includes(cleanName)) {
    return db.categories;
  }
  db.categories.push(cleanName);
  saveDatabase(db);
  return db.categories;
}

export function updateCategory(oldName: string, newName: string): boolean {
  const db = getDatabase();
  const cleanNew = newName.trim();
  const index = db.categories.indexOf(oldName);
  if (index >= 0 && cleanNew) {
    db.categories[index] = cleanNew;
    // Update affected products
    db.products.forEach((p) => {
      if (p.category === oldName) {
        p.category = cleanNew;
      }
    });
    saveDatabase(db);
    return true;
  }
  return false;
}

export function deleteCategory(name: string): boolean {
  const db = getDatabase();
  const index = db.categories.indexOf(name);
  if (index >= 0) {
    db.categories.splice(index, 1);
    saveDatabase(db);
    return true;
  }
  return false;
}

// ---------------- ORDERS CRUD ---------------- //

export function getOrders(): Order[] {
  return getDatabase().orders;
}

export function getOrderById(id: string): Order | undefined {
  return getDatabase().orders.find((o) => o.id === id || o.orderNumber === id);
}

export function getOrdersByUserId(userId: string): Order[] {
  return getDatabase().orders.filter((o) => o.userId === userId);
}

export function saveOrder(order: Order): Order {
  const db = getDatabase();
  const existingIndex = db.orders.findIndex(
    (o) => o.id === order.id || (o.orderNumber && o.orderNumber === order.orderNumber)
  );

  if (existingIndex >= 0) {
    db.orders[existingIndex] = {
      ...db.orders[existingIndex],
      ...order,
      updatedAt: new Date().toISOString(),
    };
  } else {
    db.orders.unshift({
      ...order,
      createdAt: order.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  saveDatabase(db);
  return order;
}

export function updateOrderStatus(
  id: string,
  status: Order["status"],
  paymentStatus?: Order["paymentStatus"],
  trxId?: string
): Order | undefined {
  const db = getDatabase();
  const order = db.orders.find((o) => o.id === id || o.orderNumber === id);
  if (order) {
    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (trxId) order.bkashTrxId = trxId;
    order.updatedAt = new Date().toISOString();
    saveDatabase(db);
    return order;
  }
  return undefined;
}

export function updateOrder(id: string, updates: Partial<Order>): Order | undefined {
  const db = getDatabase();
  const order = db.orders.find((o) => o.id === id || o.orderNumber === id);
  if (order) {
    Object.assign(order, updates);
    order.updatedAt = new Date().toISOString();
    saveDatabase(db);
    return order;
  }
  return undefined;
}

export const getUserOrders = getOrdersByUserId;
export const updateUserProfile = updateUser;

// ---------------- USERS CRUD ---------------- //

export function getUsers(): User[] {
  return getDatabase().users || [];
}

export function getUserById(id: string): User | undefined {
  return (getDatabase().users || []).find((u) => u.id === id);
}

export function getUserByEmailOrPhone(identifier: string): User | undefined {
  const clean = identifier.trim().toLowerCase();
  return (getDatabase().users || []).find(
    (u) => u.email.toLowerCase() === clean || u.phone.replace(/[^0-9]/g, "") === clean.replace(/[^0-9]/g, "")
  );
}

export function saveUser(user: User): User {
  const db = getDatabase();
  if (!db.users) db.users = [];
  const index = db.users.findIndex((u) => u.id === user.id);
  const timestamp = new Date().toISOString();

  if (index >= 0) {
    db.users[index] = {
      ...db.users[index],
      ...user,
      updatedAt: timestamp,
    };
  } else {
    db.users.push({
      ...user,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  }

  saveDatabase(db);
  return user;
}

export function updateUser(id: string, updates: Partial<User>): User | undefined {
  const db = getDatabase();
  if (!db.users) db.users = [];
  const index = db.users.findIndex((u) => u.id === id);
  if (index >= 0) {
    db.users[index] = {
      ...db.users[index],
      ...updates,
      id: db.users[index].id, // Prevent ID overwrite
      updatedAt: new Date().toISOString(),
    };
    saveDatabase(db);
    return db.users[index];
  }
  return undefined;
}

// ---------------- INQUIRIES ---------------- //

export function getInquiries(): Inquiry[] {
  return getDatabase().inquiries || [];
}

export function saveInquiry(inquiry: Omit<Inquiry, "id" | "createdAt" | "status">): Inquiry {
  const db = getDatabase();
  if (!db.inquiries) db.inquiries = [];
  const newInquiry: Inquiry = {
    ...inquiry,
    id: `INQ-${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: "Open",
  };
  db.inquiries.unshift(newInquiry);
  saveDatabase(db);
  return newInquiry;
}

export function updateInquiryStatus(id: string, status: Inquiry["status"]): boolean {
  const db = getDatabase();
  if (!db.inquiries) db.inquiries = [];
  const item = db.inquiries.find((i) => i.id === id);
  if (item) {
    item.status = status;
    saveDatabase(db);
    return true;
  }
  return false;
}

// ---------------- SUBSCRIBERS ---------------- //

export function getSubscribers(): Subscriber[] {
  return getDatabase().subscribers;
}

export function saveSubscriber(email: string): boolean {
  const db = getDatabase();
  const cleanEmail = email.trim().toLowerCase();
  if (db.subscribers.some((s) => s.email.toLowerCase() === cleanEmail)) {
    return false;
  }
  db.subscribers.unshift({
    id: `sub-${Date.now()}`,
    email: cleanEmail,
    subscribedAt: new Date().toISOString(),
  });
  saveDatabase(db);
  return true;
}

// ---------------- HERO SETTINGS ---------------- //

export function getHeroSettings(): HeroSettings {
  return getDatabase().hero;
}

export function saveHeroSettings(hero: HeroSettings): HeroSettings {
  const db = getDatabase();
  db.hero = hero;
  saveDatabase(db);
  return hero;
}

// ---------------- MOSAIC (SCULPTED MINIMALISM) SETTINGS ---------------- //

export function getMosaicSettings(): MosaicSettings {
  const db = getDatabase();
  return db.mosaic || DEFAULT_DB.mosaic!;
}

export function saveMosaicSettings(mosaic: MosaicSettings): MosaicSettings {
  const db = getDatabase();
  db.mosaic = mosaic;
  saveDatabase(db);
  return mosaic;
}

// ---------------- STATS & LOCAL BACKUP VAULT ---------------- //

export function getDatabaseStats() {
  ensureDbExists();
  const stat = fs.statSync(DB_PATH);
  const db = getDatabase();

  let backupCount = 0;
  if (fs.existsSync(BACKUP_DIR)) {
    backupCount = fs.readdirSync(BACKUP_DIR).filter((f) => f.endsWith(".json")).length;
  }

  return {
    filePath: DB_PATH,
    dataDir: DATA_DIR,
    backupDir: BACKUP_DIR,
    backupCount,
    sizeBytes: stat.size,
    sizeKb: (stat.size / 1024).toFixed(2),
    lastModified: stat.mtime.toISOString(),
    isSelfHostedVPS: true,
    cloudDependency: "None (100% Local VPS Filesystem)",
    counts: {
      products: db.products.length,
      drops: db.drops.length,
      orders: db.orders.length,
      paymentMethods: (db.paymentMethods || []).length,
      categories: db.categories.length,
      inquiries: db.inquiries.length,
      subscribers: db.subscribers.length,
    },
  };
}

// ---------------- PAYMENT METHODS CRUD ---------------- //

export function getPaymentMethods(includeInactive = false): PaymentMethodConfig[] {
  const db = getDatabase();
  const list =
    db.paymentMethods && db.paymentMethods.length > 0
      ? db.paymentMethods
      : DEFAULT_PAYMENT_METHODS;
  const filtered = includeInactive ? list : list.filter((m) => m.isActive);
  return [...filtered].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
}

export function getPaymentMethodById(id: string): PaymentMethodConfig | undefined {
  const db = getDatabase();
  const list =
    db.paymentMethods && db.paymentMethods.length > 0
      ? db.paymentMethods
      : DEFAULT_PAYMENT_METHODS;
  return list.find((m) => m.id === id);
}

export function savePaymentMethod(method: PaymentMethodConfig): PaymentMethodConfig {
  const db = getDatabase();
  if (!db.paymentMethods || db.paymentMethods.length === 0) {
    db.paymentMethods = [...DEFAULT_PAYMENT_METHODS];
  }
  const index = db.paymentMethods.findIndex((m) => m.id === method.id);
  const timestamp = new Date().toISOString();
  if (index >= 0) {
    db.paymentMethods[index] = {
      ...db.paymentMethods[index],
      ...method,
      updatedAt: timestamp,
    };
  } else {
    db.paymentMethods.push({
      ...method,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  }
  saveDatabase(db);
  return method;
}

export function updatePaymentMethod(
  id: string,
  updates: Partial<PaymentMethodConfig>
): PaymentMethodConfig | undefined {
  const db = getDatabase();
  if (!db.paymentMethods || db.paymentMethods.length === 0) {
    db.paymentMethods = [...DEFAULT_PAYMENT_METHODS];
  }
  const index = db.paymentMethods.findIndex((m) => m.id === id);
  if (index >= 0) {
    db.paymentMethods[index] = {
      ...db.paymentMethods[index],
      ...updates,
      id: db.paymentMethods[index].id, // protect ID
      updatedAt: new Date().toISOString(),
    };
    saveDatabase(db);
    return db.paymentMethods[index];
  }
  return undefined;
}

export function togglePaymentMethodStatus(id: string): PaymentMethodConfig | undefined {
  const db = getDatabase();
  if (!db.paymentMethods || db.paymentMethods.length === 0) {
    db.paymentMethods = [...DEFAULT_PAYMENT_METHODS];
  }
  const index = db.paymentMethods.findIndex((m) => m.id === id);
  if (index >= 0) {
    db.paymentMethods[index].isActive = !db.paymentMethods[index].isActive;
    db.paymentMethods[index].updatedAt = new Date().toISOString();
    saveDatabase(db);
    return db.paymentMethods[index];
  }
  return undefined;
}

export function deletePaymentMethod(id: string): boolean {
  const db = getDatabase();
  if (!db.paymentMethods || db.paymentMethods.length === 0) {
    db.paymentMethods = [...DEFAULT_PAYMENT_METHODS];
  }
  const initialLength = db.paymentMethods.length;
  db.paymentMethods = db.paymentMethods.filter((m) => m.id !== id);
  if (db.paymentMethods.length !== initialLength) {
    saveDatabase(db);
    return true;
  }
  return false;
}
