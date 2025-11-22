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
  title: string; // Genellikle "city + district + roomCount" birleşimi yapılabilir
  details: PortfolioDetails; // JSONB sütunu bu yapıyı tutacak
  ai_output: AiContent | null;
  slug: string | null;
  status: 'active' | 'sold' | 'passive';
  image_urls: string[] | null;
  is_public: boolean;
  created_at: string;
}

export interface Customer {
  id: string;
  user_id: string;
  name: string;
  phone: string | null;
  demand_type: 'buy' | 'rent';
  budget_min: number | null;
  budget_max: number | null;
  location_interest: string | null;
  notes: string | null;
  created_at: string;
}