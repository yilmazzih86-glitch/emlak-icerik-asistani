// features/crm/api/types.ts

// ---------------------------------------------------------------------------
// 1. SABİTLER VE ENUM'LAR
// ---------------------------------------------------------------------------

export type PipelineStage = 'new' | 'contacted' | 'presentation' | 'negotiation' | 'closed_won';

export const STAGES: PipelineStage[] = ['new', 'contacted', 'presentation', 'negotiation', 'closed_won'];

export const STAGE_LABELS: Record<PipelineStage, string> = {
  new: 'Yeni Müşteri',
  contacted: 'Görüşüldü',       // DB'de 'contacted' olarak geçiyor
  presentation: 'Sunum Yapıldı',
  negotiation: 'Teklif / Pazarlık',
  closed_won: 'Satış Başarılı'
};

// AI Araç Modları (n8n Webhook'ları ile eşleşir)
export type AiToolMode = 
  | 'message_draft'       // Mesaj Hazırlama
  | 'smart_match'         // Akıllı Eşleştirme
  | 'tracking_perception' // Takip & Sessizlik Algılama
  | 'after_sales'         // Satış Sonrası
  | 'insight';            // Danışman İçgörü

// Aktivite Tipleri
export type ActivityType = 'call' | 'meeting' | 'note' | 'whatsapp' | 'ai_log' | 'task_done' | 'email';

// ---------------------------------------------------------------------------
// 2. ANA VERİ TABLO ARAYÜZLERİ (Database Schema)
// ---------------------------------------------------------------------------

export interface Portfolio {
  id: string;
  user_id: string;
  title: string;
  slug?: string;
  status: 'active' | 'passive' | 'sold' | 'deleted';
  listing_type?: 'sale' | 'rent'; // Satılık / Kiralık
  price: number;
  city: string;
  district: string;
  neighborhood?: string;
  room_count?: string;
  net_m2?: number;
  gross_m2?: number;
  heating?: string;
  image_urls?: string[]; // CSV'de JSON array veya string array olabilir
  created_at: string;
}

export interface Customer {
  id: string;
  user_id?: string; // Danışman ID (row owner)
  full_name: string;
  phone: string;
  email?: string;

  type?: 'sale' | 'rent';
  
  // Tercih & Filtreleme Kriterleri
  budget_min?: number;
  budget_max?: number;
  location_interest?: string; // Genel lokasyon ilgisi
  interested_cities?: string[]; // İlgi duyduğu şehirler
  interested_districts?: string[]; // İlgi duyduğu ilçeler
  preferred_room_counts?: string[]; // 2+1, 3+1 vb.
  
  // CRM Meta Verileri
  status?: string; 
  stage?: PipelineStage; // Müşteri hangi aşamada (Genel durum)
  source?: string; // Sahibinden, Referans, Instagram vb.
  tags?: string[]; // ['yatirimlik', 'acik', 'krediye_uygun']
  notes?: string;
  last_note?: string;
  avatar_url?: string;
  assigned_to?: string; // Atanan danışman
  created_at: string;
}

export interface CrmDeal {
  id: string;
  customer_id: string;
  portfolio_id?: string | null; // Opsiyonel olabilir (henüz portföy yoksa)
  user_id: string; // Fırsatı yöneten danışman
  
  stage: PipelineStage;
  expected_amount?: number; 
  probability?: number; // % Olasılık (0-100)
  
  created_at: string;
  closed_at?: string | null;
  updated_at?: string;

  // Join ile gelen ilişkisel veriler (Supabase select)
  customers?: Customer; 
  portfolios?: Portfolio; 
}

export interface CrmTask {
  id: string;
  customer_id: string;
  assigned_to?: string;
  created_by?: string;
  
  title: string;
  description?: string;
  is_completed: boolean;
  due_date?: string; // ISO String
  created_at: string;
}

export interface CrmActivity {
  id: string;
  customer_id: string;
  created_by: string;
  
  type: ActivityType;
  description: string;
  meta?: any; // JSONb formatında ek veriler (AI çıktıları buraya gömülebilir)
  created_at: string;
}

export interface CrmAppointment {
  id: string;
  customer_id: string;
  created_by: string;
  
  title: string;
  appointment_date: string; // ISO Date-Time
  location?: string;
  notes?: string;
  
  created_at: string;
}

// ---------------------------------------------------------------------------
// 3. UI & COMPOSITE TYPES (Frontend için Özelleştirilmiş)
// ---------------------------------------------------------------------------

// Müşteri Detay Sayfası için "Hepsi Bir Arada" veri yapısı
export interface CustomerDetail extends Customer {
  tasks: CrmTask[];
  activities: CrmActivity[];
  appointments: CrmAppointment[];
  deals: CrmDeal[];
}

// AI Yanıt Yapısı
export interface AiResponse {
  type: AiToolMode;
  content: string; // Ana metin çıktısı
  data?: any;      // Yapılandırılmış veri (örn: önerilen portföy listesi)
}

// Form Payload Tipleri (Create/Update işlemleri için)
export interface CreateDealPayload {
  customer_id: string;
  portfolio_id?: string | null;
  user_id: string;
  stage: PipelineStage;
  expected_amount?: number;
}

export interface CreateCustomerPayload {
  full_name: string;
  phone: string;
  email?: string;
  budget_min?: number;
  budget_max?: number;
  notes?: string;
  source?: string;
  user_id: string; // created_by

  type: 'sale' | 'rent';               // Zorunlu
  interested_cities: string[];        // Zorunlu (En az 1 il)
  interested_districts: string[];     // Zorunlu (En az 1 ilçe)
  preferred_room_counts?: string[];    // Opsiyonel
}
// features/crm/api/types.ts içine eklenebilir

export interface SmartMatchSuggestion {
  portfolio_id: string;
  score: number;
  label: string; // Örn: "Alternatif", "Tam Eşleşme"
  one_liner: string;
  fit_reasons: string[];
  risk_reasons: string[];
  presentation_tip: string;
  // API tarafında ekleyeceğimiz Supabase verisi:
  portfolio_details?: {
    title: string;
    price: number;
    currency: string;
    city: string;
    district: string;
    image_url?: string;
  };
}

export interface SmartMatchResponse {
  ok: boolean;
  customer_id: string;
  suggestions: SmartMatchSuggestion[];
}