// features/crm/api/crmService.ts
import { createClient } from '@/lib/supabase/client';
import { Customer, Deal, Task, Activity, Appointment } from './types';

const supabase = createClient();

export const crmService = {
  // --- Müşteriler ---
  
  // Tüm müşteri havuzunu getir
  getCustomers: async (): Promise<Customer[]> => {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false }); // En yeniler üstte

    if (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
    return data || [];
  },

  // Tekil müşteri detayı (Detay görünümü için lazım olacak)
  // features/crm/api/crmService.ts içine eklenecekler:

  // --- Tekil Müşteri Verileri ---

  // ID'ye göre müşteri getir
  getCustomerById: async (id: string): Promise<Customer | null> => {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Müşteriye ait görevleri getir
  getCustomerTasks: async (customerId: string): Promise<Task[]> => {
    const { data, error } = await supabase
      .from('crm_tasks')
      .select('*')
      .eq('customer_id', customerId)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Müşteriye ait aktiviteleri getir
  getCustomerActivities: async (customerId: string): Promise<Activity[]> => {
    const { data, error } = await supabase
      .from('crm_activities')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Müşteriye ait randevuları getir
  getCustomerAppointments: async (customerId: string): Promise<Appointment[]> => {
    const { data, error } = await supabase
      .from('crm_appointments')
      .select('*')
      .eq('customer_id', customerId)
      .order('appointment_date', { ascending: true });

    if (error) {
        // Tablo yoksa hata patlatmasın, boş dönsün (Güvenlik önlemi)
        console.warn("Randevu tablosu çekilemedi:", error);
        return [];
    }
    return data || [];
  },

  // --- Aksiyonlar ---

  // Müşteriyi Pipeline'a (Fırsatlara) Taşı
  createDeal: async (customerId: string, userId: string): Promise<void> => {
    // 1. Önce müşteri var mı kontrol et
    const { data: customer } = await supabase.from('customers').select('id').eq('id', customerId).single();
    if (!customer) throw new Error("Müşteri bulunamadı");

    // 2. Fırsat yarat
    const { error } = await supabase
      .from('crm_deals')
      .insert({
        customer_id: customerId,
        stage: 'new', // Başlangıç aşaması
        user_id: userId,
        // created_at otomatik oluşur
      });

    if (error) throw error;
  },

  // Müşteriyi Sil (Cascading delete yoksa manuel temizlik gerekebilir)
  deleteCustomer: async (customerId: string): Promise<void> => {
    // Önce ilişkili deal'ları silebiliriz veya veritabanı cascade ayarlıysa direkt silebiliriz.
    // Şimdilik direkt siliyoruz.
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', customerId);

    if (error) throw error;
  },
  // features/crm/api/crmService.ts içine ekleyin:

  // --- FIRSATLAR (DEALS) ---

  // Tüm fırsatları getir (Müşteri detaylarıyla beraber)
  getDeals: async (): Promise<Deal[]> => {
    const { data, error } = await supabase
      .from('crm_deals')
      .select(`
        *,
        customer:customers (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Fırsatın aşamasını güncelle (Sürükle-Bırak sonrası)
  updateDealStage: async (dealId: string, newStage: string): Promise<void> => {
    const { error } = await supabase
      .from('crm_deals')
      .update({ stage: newStage, updated_at: new Date().toISOString() })
      .eq('id', dealId);

    if (error) throw error;
  },
  
  // Fırsat Silme
   deleteDeal: async (dealId: string): Promise<void> => {
    const { error } = await supabase
      .from('crm_deals')
      .delete()
      .eq('id', dealId);

    if (error) throw error;
  },
  // features/crm/api/crmService.ts içine ekleyin:

  // --- YENİ KAYIT EKLEME ---

  // Yeni Müşteri Oluştur
  createCustomer: async (customerData: Partial<Customer>): Promise<Customer> => {
    // ID otomatik oluşur, created_at otomatik oluşur.
    const { data, error } = await supabase
      .from('customers')
      .insert([{
        ...customerData,
        status: 'new', // Varsayılan
        created_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Yeni Fırsat (Deal) Oluştur - Gelişmiş Versiyon
  createDealFull: async (dealData: Partial<Deal>): Promise<Deal> => {
    const { data, error } = await supabase
      .from('crm_deals')
      .insert([{
        ...dealData,
        stage: dealData.stage || 'new',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },
  
  // Basit Müşteri Araması (Deal eklerken lazım olacak)
  searchCustomers: async (query: string): Promise<Partial<Customer>[]> => {
    const { data, error } = await supabase
      .from('customers')
      .select('id, full_name, phone')
      .ilike('full_name', `%${query}%`)
      .limit(10);
      
    if (error) return [];
    // Supabase'den dönen kısmi veriyi Partial<Customer> olarak işaretliyoruz
    return (data || []) as unknown as Partial<Customer>[];
  }

  // --- Diğer metodlar ileride buraya eklenecek ---
};