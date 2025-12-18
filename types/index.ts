// --- GENEL TİPLER ---
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// --- 1. N8N WEBHOOK VERİ TİPLERİ (INPUT & OUTPUT) ---

// Webhook'a gönderilen Marketing objesi
export interface MarketingOptions {
  target: string;     // Örn: "aile", "yatırımcı"
  tone: string;       // Örn: "profesyonel", "samimi"
  highlights: string; // Örn: "Geniş balkon, metroya yakın"
  language: string;   // Örn: "tr"
  notes: string;      // Ekstra notlar
}

// Webhook'a gönderilen İlan Detayları (Görseldeki Body yapısı)
export interface PortfolioDetails {
  city: string;
  district: string;
  neighborhood: string;
  listingNo: string;
  propertyType: string;
  price: number | null; // Görselde null olabildiği için
  grossM2: number;
  netM2: number;
  roomCount: string;
  floor: string;
  heating: string;
  site: string;    // "Evet" | "Hayır" (Görselde string olarak gelmiş)
  parking: string; // "Evet" | "Hayır"
  credit: string;  // "Evet" | "Hayır"
  marketing?: MarketingOptions; // İsteğe bağlı, veritabanında saklarken ayırabiliriz
}

// N8N'den dönen "contents" objesi (Görseldeki Output yapısı)
export interface AiContent {
  portal: string;
  instagram: string;
  linkedin: string;
  reels: string;
}

// N8N API Tam Yanıtı
export interface N8nApiResponse {
  success: boolean;
  fromCache: boolean;
  cacheKey: string | null;
  language: string;
  contents: AiContent;
}

// --- 2. VERİTABANI TABLOLARI (SUPABASE) ---

export interface Profile {
  id: string;
  full_name: string | null;
  agency_name: string | null;
  phone: string | null;
  
  // --- YENİ ABONELİK ALANLARI ---
  plan_type: 'free' | 'freelance' | 'pro' | 'office';
  listing_limit: number;
  listing_used: number;
  image_ai_limit: number;
  video_ai_limit: number;
  renews_at: string | null; // Tarih
  
  created_at: string;
}

export interface Portfolio {
  id: string;
  user_id: string;
  title: string;
  details: any; // Legacy (Eskiler bozulmasın diye tutuyoruz ama artık ana kaynak değil)
  
  // Ana Sütunlar (Doğru Veri Kaynağı)
  status: 'active' | 'passive' | 'sold' | 'rented';
  listing_type: 'sale' | 'rent';
  city?: string;
  district?: string;
  neighborhood?: string;
  
  // Sayısal ve Kritik Veriler
  price?: number;
  dues?: number; // YENİ EKLENDİ (Aidat)
  net_m2?: number;
  gross_m2?: number;
  room_count?: string;
  floor?: string;
  heating?: string;
  credit_status?: string; // 'Evet/Hayır' yerine 'Uygun/Uygun Değil' standardı daha iyi
  site?: string; // Site içerisinde mi?
  
  ai_output: any;
  image_urls: string[] | null;
  created_at: string;
}

// types/index.ts

// types/index.ts

// Mevcut Customer tipini güncelleme
export interface Customer {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  email?: string | null;
  type: 'buy' | 'rent' | 'sell';
  budget_max?: number | null;
  interested_districts?: string[] | null;
  
  // KRİTİK KISIM: Burası 'stage' olmalı
  stage: 'new' | 'contacted' | 'viewing' | 'offer' | 'sold' | 'lost';
  last_note?: string | null;
  last_activity_at?: string | null;
  owner_id?: string;
  
  created_at: string;
  avatar_url?: string | null;
}

export interface CrmTask {
  id: string;
  customer_id?: string | null;
  assigned_to: string;
  title: string;
  description?: string | null;
  due_date?: string | null;
  is_completed: boolean;
  created_at: string;
  customers?: { full_name: string } | null; // Join ile gelen
}

export interface CrmAppointment {
  id: string;
  customer_id?: string | null;
  created_by: string;
  title: string;
  appointment_date: string;
  location?: string | null;
  notes?: string | null;
  created_at: string;
  customers?: { full_name: string } | null; // Join ile gelen
}
export interface CrmActivity {
  id: string;
  customer_id: string;
  type: 'note' | 'call' | 'whatsapp' | 'meeting' | 'task_done' | 'stage_change' | 'appointment';
  description: string; // Ana metin
  meta?: any;          // Ekstra veriler (örn: eski aşama -> yeni aşama)
  created_at: string;
  created_by?: string;
}

export interface CrmCustomerPortfolio {
  id: string;
  customer_id: string;
  portfolio_id: string;
  added_at: string;
  notes?: string;
  // Join ile gelecek veri
  portfolios?: Portfolio;
}