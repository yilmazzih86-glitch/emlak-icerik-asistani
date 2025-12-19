import { createClient } from '@/lib/supabase/client';
import { Deal, AiDraftRequest, AiDraftResponse } from './types';

// Supabase istemcisini oluştur
const supabase = createClient();

export const crmService = {
  // 1. Tüm Fırsatları Getir
  getDeals: async (): Promise<Deal[]> => {
    const { data, error } = await supabase
      .from('crm_deals')
      .select(`
        *,
        customer:customers(full_name, phone),
        portfolio:portfolios(title, price, image_urls)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fırsatlar çekilirken hata:', error);
      throw error;
    }
    
    return data as Deal[];
  },

  // 2. AI Mesaj Taslağı Oluştur
  generateMessageDraft: async (payload: AiDraftRequest): Promise<AiDraftResponse> => {
    const response = await fetch('/api/crm/message-draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('AI servisi yanıt vermedi.');
    }

    return await response.json();
  },

  // 3. Müşteri Listesi
  getCustomersSelect: async () => {
    const { data, error } = await supabase
      .from('customers')
      .select('id, full_name')
      .neq('status', 'archived')
      .order('full_name');
    
    if (error) throw error;
    return data || [];
  },

  // 4. Portföy Listesi
  getPortfoliosSelect: async () => {
    const { data, error } = await supabase
      .from('portfolios')
      .select('id, title')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  },

  // 5. Sadece Fırsat Yarat (Varolan Müşteri)
  createDeal: async (dealData: { 
    customer_id: string; 
    portfolio_id?: string; 
    stage: string; 
    expected_amount?: number 
  }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Kullanıcı bulunamadı");

    const safeOrgId = user.user_metadata?.org_id || user.id;

    const { data, error } = await supabase
      .from('crm_deals')
      .insert({
        customer_id: dealData.customer_id,
        portfolio_id: dealData.portfolio_id || null,
        stage: dealData.stage,
        expected_amount: dealData.expected_amount || 0,
        org_id: safeOrgId,
        user_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 6. Hem Yeni Müşteri Hem Fırsat Yarat (Hızlı Ekleme)
  createDealWithNewCustomer: async (data: { 
    full_name: string;
    phone: string;
    portfolio_id?: string; 
    stage: string; 
    expected_amount?: number 
  }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Kullanıcı bulunamadı");

    // Güvenli Org ID (Meta yoksa user id kullan)
    const safeOrgId = user.user_metadata?.org_id || user.id;

    // A. Önce Müşteriyi Oluştur
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .insert({
        full_name: data.full_name,
        phone: data.phone,
        email: '', 
        status: 'new',
        type: 'buy',
        source: 'pipeline_quick_add',
        
        // FİYAT DÜZELTMESİ: Müşteri tablosuna da bütçe olarak ekliyoruz
        budget_max: data.expected_amount || 0,
        budget_min: 0,

        // ID Eşleştirmeleri
        user_id: user.id,      
        owner_id: user.id,     
        assigned_to: user.id,  
        org_id: safeOrgId
      })
      .select('id')
      .single();

    if (customerError) {
      console.error("Müşteri oluşturma hatası:", customerError);
      throw new Error(`Müşteri Hatası: ${customerError.message}`);
    }

    if (!customer) throw new Error("Müşteri verisi dönmedi.");

    // B. Sonra Fırsatı (Deal) Oluştur
    const { data: deal, error: dealError } = await supabase
      .from('crm_deals')
      .insert({
        customer_id: customer.id,
        portfolio_id: data.portfolio_id || null,
        stage: data.stage,
        expected_amount: data.expected_amount || 0,
        
        // ORG ID DÜZELTMESİ:
        org_id: safeOrgId,
        user_id: user.id
      })
      .select()
      .single();

    if (dealError) {
      console.error("Fırsat oluşturma hatası:", dealError);
      throw new Error(`Müşteri oluştu (${customer.id}) ancak Fırsat eklenemedi: ${dealError.message}`);
    }

    return deal;
  },

  // 7. Fırsat Aşamasını Güncelle (Sürükle-Bırak için - EKSİK OLAN KISIM)
  updateDealStage: async (dealId: string, newStage: string) => {
    const { error } = await supabase
      .from('crm_deals')
      .update({ stage: newStage, updated_at: new Date().toISOString() })
      .eq('id', dealId);

    if (error) throw new Error(`Aşama güncellenemedi: ${error.message}`);
    return true;
  },

  // 8. Fırsatı Sil (EKSİK OLAN KISIM)
  deleteDeal: async (dealId: string) => {
    const { error } = await supabase
      .from('crm_deals')
      .delete()
      .eq('id', dealId);

    if (error) throw new Error(`Silme işlemi başarısız: ${error.message}`);
    return true;
  }
};