/**
 * api.mock.ts – Mock API for testing without Supabase
 */
import { Category, Product, Profile, SellerProfile, VerificationStatus } from './types';

// ─── MOCK DATA ────────────────────────────────────────────────
const mockUsers: (Profile & { password: string })[] = [
  { id: '1', email: 'buyer@test.com', password: '123456', full_name: 'Test Buyer', role: 'buyer', created_at: new Date().toISOString() },
  { id: '2', email: 'seller@test.com', password: '123456', full_name: 'Test Seller', role: 'seller', created_at: new Date().toISOString() },
  { id: '3', email: 'admin@test.com', password: '123456', full_name: 'Test Admin', role: 'admin', created_at: new Date().toISOString() },
];

let currentUser: Profile | null = null;

const mockCategories: Category[] = [
  { id: '1', name: 'Electronics', icon: '💻' },
  { id: '2', name: 'Clothing', icon: '👕' },
  { id: '3', name: 'Food', icon: '🍜' },
  { id: '4', name: 'Furniture', icon: '🪑' },
];

const mockProducts: (Product & { status: VerificationStatus })[] = [
  { id: '1', seller_id: '1', title: 'iPhone 14 Pro', description: 'Good condition, minor scratches', price: 800, category_id: '1', images: [], status: 'approved', created_at: new Date().toISOString() },
  { id: '2', seller_id: '1', title: 'Nike Air Max', description: 'Brand new, size 42', price: 120, category_id: '2', images: [], status: 'approved', created_at: new Date().toISOString() },
  { id: '3', seller_id: '2', title: 'MacBook Pro M2', description: 'Used once, perfect condition', price: 1500, category_id: '1', images: [], status: 'approved', created_at: new Date().toISOString() },
  { id: '4', seller_id: '2', title: 'Vintage T-Shirt', description: 'Rare design', price: 30, category_id: '2', images: [], status: 'pending', created_at: new Date().toISOString() },
];

const mockSellers: SellerProfile[] = [
  { id: '1', user_id: '1', full_name: 'Test Buyer', business_name: 'Buyer Shop', phone: '012345678', id_card_url: '', status: 'approved', submitted_at: new Date().toISOString() },
  { id: '2', user_id: '2', full_name: 'Test Seller', business_name: 'Seller Shop', phone: '098765432', id_card_url: '', status: 'approved', submitted_at: new Date().toISOString() },
];

// ─── AUTH ─────────────────────────────────────────────────────
export const auth = {
  signIn: async (email: string, password: string) => {
    const user = mockUsers.find(u => u.email === email && u.password === password);
    if (!user) return { data: null, error: { message: 'Invalid email or password' } };
    currentUser = user;
    return { data: { user, session: { access_token: 'mock-token', user } }, error: null };
  },
  signUp: async (email: string, _password: string, fullName: string, role: 'buyer' | 'seller') => {
    const exists = mockUsers.find(u => u.email === email);
    if (exists) return { data: null, error: { message: 'Email already exists' } };
    const newUser = { id: String(mockUsers.length + 1), email, password: _password, full_name: fullName, role, created_at: new Date().toISOString() };
    mockUsers.push(newUser);
    currentUser = newUser;
    return { data: { user: newUser }, error: null };
  },
  signOut: async () => { currentUser = null; return { error: null }; },
  getSession: async () => {
    if (!currentUser) return { data: { session: null }, error: null };
    return { data: { session: { access_token: 'mock-token', user: currentUser } }, error: null };
  },
};

// ─── PROFILES ─────────────────────────────────────────────────
export const profiles = {
  getById: async (userId: string): Promise<Profile | null> =>
    mockUsers.find(u => u.id === userId) ?? null,
  update: async (userId: string, updates: Partial<Profile>): Promise<Profile> => {
    const index = mockUsers.findIndex(u => u.id === userId);
    mockUsers[index] = { ...mockUsers[index], ...updates };
    return mockUsers[index];
  },
  uploadAvatar: async (userId: string, _fileUri: string): Promise<string> =>
    `https://i.pravatar.cc/150?u=${userId}`,
};

// ─── CATEGORIES ───────────────────────────────────────────────
export const categories = {
  getAll: async (): Promise<Category[]> => mockCategories,
};

// ─── PRODUCTS ─────────────────────────────────────────────────
export const products = {
  getApproved: async (opts?: { categoryId?: string; search?: string }): Promise<Product[]> => {
    let result = mockProducts.filter(p => p.status === 'approved');
    if (opts?.categoryId) result = result.filter(p => p.category_id === opts.categoryId);
    if (opts?.search?.trim()) result = result.filter(p => p.title.toLowerCase().includes(opts.search!.toLowerCase()));
    return result;
  },
  getById: async (id: string): Promise<Product | null> =>
    mockProducts.find(p => p.id === id) ?? null,
  getBySeller: async (sellerId: string): Promise<Product[]> =>
    mockProducts.filter(p => p.seller_id === sellerId),
  getAll: async (): Promise<Product[]> => mockProducts,
  create: async (payload: Omit<Product, 'id' | 'created_at'>): Promise<Product> => {
    const newProduct = { ...payload, id: String(mockProducts.length + 1), status: 'pending' as VerificationStatus, created_at: new Date().toISOString() };
    mockProducts.push(newProduct);
    return newProduct;
  },
  update: async (id: string, updates: Partial<Product>): Promise<Product> => {
    const index = mockProducts.findIndex(p => p.id === id);
    mockProducts[index] = { ...mockProducts[index], ...updates };
    return mockProducts[index];
  },
  review: async (id: string, status: VerificationStatus, adminNotes?: string): Promise<void> => {
    const index = mockProducts.findIndex(p => p.id === id);
    if (index !== -1) mockProducts[index] = { ...mockProducts[index], status, admin_notes: adminNotes };
  },
  delete: async (id: string): Promise<void> => {
    const index = mockProducts.findIndex(p => p.id === id);
    if (index !== -1) mockProducts.splice(index, 1);
  },
  uploadImage: async (sellerId: string, _fileUri: string): Promise<string> =>
    `https://picsum.photos/400/300?random=${Math.random()}`,
};

// ─── SELLERS ──────────────────────────────────────────────────
export const sellers = {
  getByUserId: async (userId: string): Promise<SellerProfile | null> =>
    mockSellers.find(s => s.user_id === userId) ?? null,
  getById: async (id: string): Promise<SellerProfile | null> =>
    mockSellers.find(s => s.id === id) ?? null,
  getAll: async (): Promise<SellerProfile[]> => mockSellers,
  submitVerification: async (payload: Omit<SellerProfile, 'id' | 'submitted_at' | 'status'>): Promise<SellerProfile> => {
    const newSeller = { ...payload, id: String(mockSellers.length + 1), status: 'pending' as VerificationStatus, submitted_at: new Date().toISOString() };
    mockSellers.push(newSeller);
    return newSeller;
  },
  review: async (id: string, status: VerificationStatus, adminNotes?: string): Promise<void> => {
    const index = mockSellers.findIndex(s => s.id === id);
    if (index !== -1) mockSellers[index] = { ...mockSellers[index], status, admin_notes: adminNotes };
  },
  uploadIdCard: async (userId: string, _fileUri: string): Promise<string> =>
    `https://mock-url.com/idcards/${userId}.jpg`,
};
