/**
 * api.ts – Central API layer for TrustApp
 * All Supabase interactions go through here.
 */

import { supabase } from './supabase';
import { Category, Product, Profile, SellerProfile, VerificationStatus } from './types';

// ─────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────

export const auth = {
  /** Sign in with email & password */
  signIn: (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password }),

  /** Register a new user */
  signUp: (email: string, password: string, fullName: string, role: 'buyer' | 'seller') =>
    supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role } },
    }),

  /** Sign out the current user */
  signOut: () => supabase.auth.signOut(),

  /** Get the current session */
  getSession: () => supabase.auth.getSession(),
};

// ─────────────────────────────────────────────────────────────
// PROFILES
// ─────────────────────────────────────────────────────────────

export const profiles = {
  /** Fetch the profile for a given user ID */
  getById: async (userId: string): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  },

  /** Update profile fields for a given user ID */
  update: async (userId: string, updates: Partial<Profile>): Promise<Profile> => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /** Upload an avatar image and return the public URL */
  uploadAvatar: async (userId: string, fileUri: string, mimeType = 'image/jpeg'): Promise<string> => {
    const ext = mimeType.split('/')[1];
    const path = `avatars/${userId}.${ext}`;
    const response = await fetch(fileUri);
    const blob = await response.blob();
    const { error } = await supabase.storage.from('avatars').upload(path, blob, {
      contentType: mimeType,
      upsert: true,
    });
    if (error) throw error;
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    return data.publicUrl;
  },
};

// ─────────────────────────────────────────────────────────────
// CATEGORIES
// ─────────────────────────────────────────────────────────────

export const categories = {
  /** Fetch all categories ordered by name */
  getAll: async (): Promise<Category[]> => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    if (error) throw error;
    return data ?? [];
  },
};

// ─────────────────────────────────────────────────────────────
// PRODUCTS
// ─────────────────────────────────────────────────────────────

export const products = {
  /** Fetch approved products with optional filters */
  getApproved: async (opts?: {
    categoryId?: string;
    search?: string;
  }): Promise<Product[]> => {
    let query = supabase
      .from('products')
      .select('*, seller:seller_profiles(*), category:categories(*)')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (opts?.categoryId) query = query.eq('category_id', opts.categoryId);
    if (opts?.search?.trim()) query = query.ilike('title', `%${opts.search.trim()}%`);

    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  },

  /** Fetch a single product by ID (with seller & category) */
  getById: async (id: string): Promise<Product | null> => {
    const { data, error } = await supabase
      .from('products')
      .select('*, seller:seller_profiles(*), category:categories(*)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  /** Fetch all products belonging to a seller */
  getBySeller: async (sellerId: string): Promise<Product[]> => {
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  /** Fetch all products (admin: any status) */
  getAll: async (): Promise<Product[]> => {
    const { data, error } = await supabase
      .from('products')
      .select('*, seller:seller_profiles(*), category:categories(*)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  /** Create a new product listing */
  create: async (payload: {
    seller_id: string;
    title: string;
    description: string;
    price: number;
    category_id?: string;
    images: string[];
  }): Promise<Product> => {
    const { data, error } = await supabase
      .from('products')
      .insert({ ...payload, status: 'pending' })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /** Update an existing product */
  update: async (id: string, updates: Partial<Product>): Promise<Product> => {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /** Admin: approve or reject a product */
  review: async (
    id: string,
    status: VerificationStatus,
    adminNotes?: string
  ): Promise<void> => {
    const { error } = await supabase
      .from('products')
      .update({ status, admin_notes: adminNotes ?? null, reviewed_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  },

  /** Delete a product by ID */
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
  },

  /** Upload a product image and return the public URL */
  uploadImage: async (
    sellerId: string,
    fileUri: string,
    mimeType = 'image/jpeg'
  ): Promise<string> => {
    const ext = mimeType.split('/')[1];
    const path = `products/${sellerId}/${Date.now()}.${ext}`;
    const response = await fetch(fileUri);
    const blob = await response.blob();
    const { error } = await supabase.storage.from('product-images').upload(path, blob, {
      contentType: mimeType,
    });
    if (error) throw error;
    const { data } = supabase.storage.from('product-images').getPublicUrl(path);
    return data.publicUrl;
  },
};

// ─────────────────────────────────────────────────────────────
// SELLERS
// ─────────────────────────────────────────────────────────────

export const sellers = {
  /** Fetch the seller profile for a given user ID */
  getByUserId: async (userId: string): Promise<SellerProfile | null> => {
    const { data, error } = await supabase
      .from('seller_profiles')
      .select('*, profile:profiles(*)')
      .eq('user_id', userId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data ?? null;
  },

  /** Fetch a seller profile by seller ID */
  getById: async (id: string): Promise<SellerProfile | null> => {
    const { data, error } = await supabase
      .from('seller_profiles')
      .select('*, profile:profiles(*)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  /** Fetch all sellers (admin) */
  getAll: async (): Promise<SellerProfile[]> => {
    const { data, error } = await supabase
      .from('seller_profiles')
      .select('*, profile:profiles(*)')
      .order('submitted_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  /** Submit a new seller verification request */
  submitVerification: async (payload: {
    user_id: string;
    full_name: string;
    business_name?: string;
    phone?: string;
    id_card_url: string;
  }): Promise<SellerProfile> => {
    const { data, error } = await supabase
      .from('seller_profiles')
      .insert({ ...payload, status: 'pending' })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /** Admin: approve or reject a seller */
  review: async (
    id: string,
    status: VerificationStatus,
    adminNotes?: string
  ): Promise<void> => {
    const { error } = await supabase
      .from('seller_profiles')
      .update({ status, admin_notes: adminNotes ?? null, reviewed_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  },

  /** Upload ID card image and return the public URL */
  uploadIdCard: async (
    userId: string,
    fileUri: string,
    mimeType = 'image/jpeg'
  ): Promise<string> => {
    const ext = mimeType.split('/')[1];
    const path = `id-cards/${userId}.${ext}`;
    const response = await fetch(fileUri);
    const blob = await response.blob();
    const { error } = await supabase.storage.from('id-cards').upload(path, blob, {
      contentType: mimeType,
      upsert: true,
    });
    if (error) throw error;
    const { data } = supabase.storage.from('id-cards').getPublicUrl(path);
    return data.publicUrl;
  },
};
