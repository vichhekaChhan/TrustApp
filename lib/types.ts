export type UserRole = 'buyer' | 'seller' | 'admin';

export type VerificationStatus = 'pending' | 'approved' | 'rejected';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
}

export interface SellerProfile {
  id: string;
  user_id: string;
  full_name: string;
  business_name?: string;
  phone?: string;
  id_card_url: string;
  status: VerificationStatus;
  admin_notes?: string;
  submitted_at: string;
  reviewed_at?: string;
  profile?: Profile;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
}

export interface Product {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  price: number;
  category_id?: string;
  images: string[];
  status: VerificationStatus;
  admin_notes?: string;
  created_at: string;
  reviewed_at?: string;
  seller?: SellerProfile;
  category?: Category;
}
