// features/crm/api/crmService.ts

import { createClient } from '@/lib/supabase/client';
import { 
  Customer, 
  CrmDeal, 
  PipelineStage, 
  CrmActivity, 
  CrmTask, 
  CrmAppointment,
  CreateDealPayload,
  CreateCustomerPayload,
  Portfolio
} from './types';

const supabase = createClient();

export const crmService = {
  
  // ---------------------------------------------------------------------------
  // 1. MÜŞTERİ YÖNETİMİ (Customers)
  // ---------------------------------------------------------------------------

  // Sayfalamalı Müşteri Listesi Getir
  async getCustomers(page: number = 1, limit: number = 20) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('customers')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;
    return { data, count };
  },

  // Hızlı Arama (Dropdown/Modal için) - Sadece gerekli alanları çeker
  async searchCustomers(query: string) {
    if (!query) return [];
    
    const { data, error } = await supabase
      .from('customers')
      .select('id, full_name, phone, email, avatar_url')
      .or(`full_name.ilike.%${query}%,phone.ilike.%${query}%`)
      .limit(10); // Performans için limitli
      
    if (error) throw error;
    return data;
  },

  async createCustomer(payload: CreateCustomerPayload) {
    const { data, error } = await supabase
      .from('customers')
      .insert(payload)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },

  async updateCustomer(id: string, updates: Partial<Customer>) {
    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },
  async deleteCustomer(id: string) {
    const { error } = await supabase
      .from('customers') // Sadece customers'dan silmek yeterlidir (Cascade varsa)
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    return true;
  },

  // ---------------------------------------------------------------------------
  // 2. PORTFÖY YÖNETİMİ (Portfolios)
  // ---------------------------------------------------------------------------

  // Fırsat eklerken portföy aramak için
  async searchPortfolios(query: string) {
    if (!query) return [];

    const { data, error } = await supabase
      .from('portfolios')
      .select('id, title, city, district, price, room_count, image_urls')
      .eq('status', 'active') // Sadece aktif portföyleri öner
      .ilike('title', `%${query}%`)
      .limit(10);
      
    if (error) throw error;
    return data as Partial<Portfolio>[];
  },

  // ---------------------------------------------------------------------------
  // 3. FIRSAT / PIPELINE YÖNETİMİ (Deals)
  // ---------------------------------------------------------------------------

  async getDeals() {
    // Kanban panosu için tüm aktif fırsatları çeker
    // Not: Müşteri ve Portföy bilgilerini "join" ile alır.
    const { data, error } = await supabase
      .from('crm_deals')
    .select(`
      *,
      customers (
        id, 
        full_name, 
        type, 
        interested_cities, 
        interested_districts, 
        budget_min, 
        budget_max,
        phone, 
        avatar_url
      ),
      portfolios (
        id, 
        title, 
        price, 
        district, 
        city
      )
    `)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data;
  },

  async createDeal(payload: CreateDealPayload) {
    const { data, error } = await supabase
      .from('crm_deals')
      .insert({
        customer_id: payload.customer_id,
        portfolio_id: payload.portfolio_id || null, // Boş gelebilir
        user_id: payload.user_id,
        stage: payload.stage,
        expected_amount: payload.expected_amount || 0
      })
      .select(`
        *,
        customers (id, full_name, phone, avatar_url),
        portfolios (id, title, price, district)
      `)
      .single();
      
    if (error) throw error;
    return data;
  },

  async updateDealStage(dealId: string, newStage: PipelineStage) {
    const { error } = await supabase
      .from('crm_deals')
      .update({ stage: newStage, updated_at: new Date().toISOString() })
      .eq('id', dealId);
      
    if (error) throw error;
    return true;
  },
  async deleteDeal(id: string) {
  const { error } = await supabase
    .from('crm_deals')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
  return true;
},

  // ---------------------------------------------------------------------------
  // 4. DETAY & ALT TABLOLAR (Tasks, Activities, Appointments)
  // ---------------------------------------------------------------------------

  // Müşteri Profil Sayfası için "Hepsi Bir Arada" veri çekme
  async getCustomerFullProfile(customerId: string) {
    // Promise.all ile paralel istek atarak sayfa yükleme hızını artırıyoruz
    const [customer, tasks, activities, appointments, deals] = await Promise.all([
      supabase.from('customers').select('*').eq('id', customerId).single(),
      
      supabase.from('crm_tasks')
        .select('*')
        .eq('customer_id', customerId)
        .order('due_date', { ascending: true }),
        
      supabase.from('crm_activities')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false }),
        
      supabase.from('crm_appointments')
        .select('*')
        .eq('customer_id', customerId)
        .order('appointment_date', { ascending: true }),
        
      supabase.from('crm_deals')
        .select('*, portfolios(title, price)')
        .eq('customer_id', customerId)
    ]);

    // Veri yoksa boş array veya null döndürme mantığı
    return {
      customer: customer.data,
      tasks: tasks.data || [],
      activities: activities.data || [],
      appointments: appointments.data || [],
      deals: deals.data || []
    };
  },

  // --- Ekleme Metodları ---

  async createActivity(activity: Partial<CrmActivity>) {
    const { data, error } = await supabase
      .from('crm_activities')
      .insert(activity)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  
  async createTask(task: Partial<CrmTask>) {
    const { data, error } = await supabase
      .from('crm_tasks')
      .insert(task)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async createAppointment(appointment: Partial<CrmAppointment>) {
    const { data, error } = await supabase
      .from('crm_appointments')
      .insert(appointment)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async deleteActivity(activityId: string) {
    const { error } = await supabase
      .from('crm_activities')
      .delete()
      .eq('id', activityId);
      
    if (error) throw error;
    return true;
  },
  async deleteTask(taskId: string) {
    const { error, count } = await supabase
      .from('crm_tasks')
      .delete({ count: 'exact' })
      .eq('id', taskId);
      
    if (error) throw error;
    if (count === 0) throw new Error("Görev silinemedi veya bulunamadı.");
    
    return true;
  }
};