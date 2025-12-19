// features/crm/api/types.ts

export type CrmStage = 'new' | 'contacted' | 'presentation' | 'negotiation' | 'closed_won' | 'closed_lost';
export type ActivityType = 'note' | 'call' | 'meeting' | 'whatsapp_sent' | 'ai_generated' | 'status_change';

// DB Row Tipleri (Supabase'den dönen ham veri)
export interface DealRow {
  id: string;
  org_id: string;
  customer_id: string;
  portfolio_id?: string | null;
  stage: CrmStage;
  expected_amount: number;
  probability: number;
  created_at: string;
}

// Frontend'de kullanacağımız zenginleştirilmiş Tip (Join'ler dahil)
export interface Deal extends DealRow {
  customer?: {
    full_name: string;
    phone: string;
  };
  portfolio?: {
    title: string;
    price: number;
    image_url?: string;
  };
}

export interface CrmActivity {
  id: string;
  customer_id: string;
  type: ActivityType;
  content: string;
  metadata?: {
    ai_prompt?: string;
    channel?: 'whatsapp' | 'sms';
    draft_id?: string;
  };
  created_at: string;
  created_by_name?: string; // Join ile gelecek
}

// AI İstek/Cevap Şemaları
export interface AiDraftRequest {
  customer_id: string;
  deal_id?: string;
  purpose: 'followup' | 'new_portfolio' | 'meeting_invite';
  channel: 'whatsapp' | 'email';
  tone?: 'formal' | 'friendly' | 'urgent';
  custom_instruction?: string;
}

export interface AiDraftResponse {
  draft_text: string;
  suggested_actions?: string[]; // Örn: ["Fiyatı güncelle", "Randevu oluştur"]
}