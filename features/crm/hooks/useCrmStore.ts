import { create } from 'zustand';
import { CrmDeal, Customer, PipelineStage, Portfolio } from '../api/types';
import { crmService } from '../api/crmService';

type SidebarViewMode = 'global' | 'detail';
type DetailTab = 'info' | 'history' | 'ai';

interface CrmState {
  // --- Veri Kaynakları ---
  deals: CrmDeal[];       // Kanban panosu için fırsatlar
  customers: Customer[]; // Müşteri havuzu için tüm müşteriler
  isLoading: boolean;
  
  // --- UI Durumları ---
  isSidebarOpen: boolean;
  viewMode: SidebarViewMode;
  activeDetailTab: DetailTab;
  
  // --- Seçili Bağlam (Context) ---
  selectedCustomerId: string | null;
  selectedDealId: string | null;
  
  // --- Aksiyonlar ---
  fetchInitialData: () => Promise<void>;
  
  // Sidebar Kontrolleri
  openGlobalSidebar: () => void; // Müşteri havuzunu açar
  openCustomerDetail: (customerId: string, dealId?: string) => void; // Detay panelini açar
  closeSidebar: () => void;
  setDetailTab: (tab: DetailTab) => void;
  
  // Pipeline (Kanban) Aksiyonları
  moveDealOptimistic: (dealId: string, newStage: PipelineStage) => Promise<void>;
  
  // Veri Güncelleme (Yenileme)
  refreshDeals: () => Promise<void>;
  refreshCustomers: () => Promise<void>;
}

export const useCrmStore = create<CrmState>((set, get) => ({
  deals: [],
  customers: [],
  isLoading: false,
  isSidebarOpen: false,
  viewMode: 'global',
  activeDetailTab: 'info',
  selectedCustomerId: null,
  selectedDealId: null,

  // 1. Başlangıç Verilerini Çek (Hem Board hem Havuz için)
  fetchInitialData: async () => {
    set({ isLoading: true });
    try {
      const [dealsRes, customersRes] = await Promise.all([
        crmService.getDeals(),
        crmService.getCustomers()
      ]);
      set({ 
        deals: dealsRes.data || [], 
        customers: customersRes.data || [], 
        isLoading: false 
      });
    } catch (error) {
      console.error("Veri çekme hatası:", error);
      set({ isLoading: false });
    }
  },

  // 2. Müşteri Havuzunu (Global) Aç
  openGlobalSidebar: () => {
    set({ 
      isSidebarOpen: true, 
      viewMode: 'global', 
      selectedCustomerId: null, 
      selectedDealId: null 
    });
  },

  // 3. Müşteri Detaylarını Aç (Kanban kartından veya havuzdan)
  openCustomerDetail: (customerId, dealId) => {
    set({
      isSidebarOpen: true,
      viewMode: 'detail',
      selectedCustomerId: customerId,
      selectedDealId: dealId || null,
      activeDetailTab: 'info' // Her açılışta 'Bilgi' sekmesiyle başla
    });
  },

  closeSidebar: () => set({ isSidebarOpen: false }),
  setDetailTab: (tab) => set({ activeDetailTab: tab }),

  // 4. Kanban Sürükle-Bırak (Optimistic Update)
  moveDealOptimistic: async (dealId, newStage) => {
    const previousDeals = get().deals;
    
    // UI'ı anında güncelle (Kullanıcı beklememeli)
    set((state) => ({
      deals: state.deals.map(d => 
        d.id === dealId ? { ...d, stage: newStage } : d
      )
    }));

    try {
      const { error } = await crmService.updateDealStage(dealId, newStage);
      if (error) throw error;
    } catch (err) {
      console.error("Taşıma başarısız, veri geri alınıyor:", err);
      // Hata durumunda veriyi eski haline döndür
      set({ deals: previousDeals });
      alert("İşlem gerçekleştirilemedi. Lütfen tekrar deneyin.");
    }
  },

  // 5. Manuel Yenileme Fonksiyonları (Modal işlemlerinden sonra çağrılır)
  refreshDeals: async () => {
    const { data } = await crmService.getDeals();
    set({ deals: data || [] });
  },

  refreshCustomers: async () => {
    const { data } = await crmService.getCustomers();
    set({ customers: data || [] });
  }
}));