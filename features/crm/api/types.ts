// features/crm/api/types.ts

// ----------------------------------------------------------------------
// 1. Temel Enum ve Sabitler
// ----------------------------------------------------------------------
export type Stage = 'new' | 'contacted' | 'presentation' | 'negotiation' | 'won';

export const STAGE_LABELS: Record<Stage, string> = {
  new: 'Yeni Müşteri',
  contacted: 'Görüşüldü',
  presentation: 'Sunum Yapıldı',
  negotiation: 'Teklif / Pazarlık',
  won: 'Satış Başarılı',
};

// ----------------------------------------------------------------------
// 2. Veritabanı Tablo Karşılıkları (Interfaces)
// ----------------------------------------------------------------------

export interface Customer {
  id: string;
  user_id?: string; // Ekleyen kullanıcı
  full_name: string;
  phone: string;
  email?: string;
  type?: 'buy' | 'sell'; // Alıcı / Satıcı
  status: 'active' | 'passive' | 'archived';
  
  // Tercihler ve Bütçe
  budget_min?: number;
  budget_max?: number;
  location_interest?: string; // Genel ilgi alanı
  interested_cities?: string[]; // Örn: ["İzmir", "Aydın"] (CSV'den parse edilecek)
  preferred_room_counts?: string[]; // Örn: ["3+1", "Villa"]
  
  notes?: string;
  tags?: string[];
  avatar_url?: string;
  
  // Sistem Alanları
  created_at: string;
  last_activity_at?: string; // Otomasyon için kritik
  assigned_to?: string; // Danışman ID
}

export interface Deal {
  id: string;
  customer_id: string;
  user_id?: string;
  portfolio_id?: string; // Müşteri bir portföyle eşleştiyse
  stage: Stage;
  expected_amount?: number;
  probability?: number; // 0-100 arası
  closed_at?: string;
  created_at: string;
  updated_at: string;
  
  // Join ile gelebilecek ilişkili veriler
  customer?: Customer;
  portfolio?: Portfolio;
}

export interface Task {
  id: string;
  customer_id: string;
  assigned_to: string;
  title: string;
  description?: string;
  due_date?: string;
  is_completed: boolean;
  created_at: string;
}

export interface Activity {
  id: string;
  customer_id: string;
  type: 'call' | 'meeting' | 'note' | 'email' | 'whatsapp' | 'system' | 'task_done';
  description: string;
  meta?: any; // Ekstra veri (örn: hangi portföy önerildi)
  created_at: string;
  created_by: string;
}

export interface Appointment {
  id: string;
  customer_id: string;
  title: string;
  appointment_date: string; // ISO String
  location?: string;
  notes?: string;
  created_by: string;
  created_at: string;
}

export interface Portfolio {
  id: string;
  title: string;
  price: number;
  city: string;
  district: string;
  neighborhood?: string;
  room_count: string;
  net_m2: number;
  gross_m2?: number;
  floor?: string;
  heating?: string;
  credit_status?: string;
  image_urls?: string[];
  
  // AI ve Pazarlama
  ai_output?: {
    reels?: string;
    portal?: string;
    linkedin?: string;
    instagram?: string;
  };
  marketing?: {
    tone?: string;
    target?: string;
  };
}

// ----------------------------------------------------------------------
// 3. AI & Otomasyon Tipleri (Frontend Logic İçin)
// ----------------------------------------------------------------------

export interface AIAnalysisResult {
  portfolio_id: string;
  match_score: number; // 0-100
  reason: string; // "Bütçe ve lokasyon tam uyumlu..."
  risks: string[]; // "Bütçeyi %10 aşıyor"
}

export interface MessageDraft {
  platform: 'whatsapp' | 'email';
  content: string;
  phone_number?: string;
}