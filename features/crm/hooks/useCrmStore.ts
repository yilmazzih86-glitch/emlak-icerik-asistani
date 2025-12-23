// features/crm/hooks/useCrmStore.ts

import { create } from 'zustand';
import { 
  CrmDeal, 
  Customer, 
  PipelineStage, 
  CustomerDetail,
  CrmActivity,
  CrmTask,
  CrmAppointment
} from '../api/types';
import { crmService } from '../api/crmService';

type SidebarViewMode = 'global' | 'detail';
type DetailTab = 'info' | 'history' | 'ai' | 'tasks'; // 'tasks' sekmesi eklendi

interface CrmState {
  // --- Global Veriler ---
  deals: CrmDeal[];       
  customers: Customer[];
  removeCustomerFromState: (customerId: string) => void;
  
  // --- Pagination & Filtre ---
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  searchQuery: string;

  // --- UI Durumları ---
  isLoading: boolean;
  isSidebarOpen: boolean;
  viewMode: SidebarViewMode;
  activeDetailTab: DetailTab;
  
  // --- Seçili Bağlam (Context) ---
  selectedCustomerId: string | null;
  selectedDealId: string | null;
  selectedCustomerDetail: CustomerDetail | null; // Tüm ilişkisel veriler burada
  
  // --- Aksiyonlar (Veri Çekme) ---
  fetchInitialData: () => Promise<void>;
  loadCustomers: (page?: number) => Promise<void>;
  searchCustomersLocal: (query: string) => Promise<void>;
  
  // --- Aksiyonlar (UI Kontrol) ---
  openGlobalSidebar: () => void;
  openCustomerDetail: (customerId: string, dealId?: string) => Promise<void>;
  closeSidebar: () => void;
  setDetailTab: (tab: DetailTab) => void;
  
  // --- Aksiyonlar (Pipeline) ---
  moveDealOptimistic: (dealId: string, newStage: PipelineStage) => Promise<void>;
  refreshDeals: () => Promise<void>;

  // --- Aksiyonlar (Detay Güncellemeleri - Optimistic) ---
  addActivityToState: (activity: CrmActivity) => void;
  addTaskToState: (task: CrmTask) => void;
  removeTaskFromState: (taskId: string) => void;
  removeActivityFromState: (activityId: string) => void;
  addAppointmentToState: (appointment: CrmAppointment) => void;
}

export const useCrmStore = create<CrmState>((set, get) => ({
  // Başlangıç Değerleri
  deals: [],
  customers: [],
  pagination: { page: 1, limit: 20, total: 0 },
  searchQuery: '',
  isLoading: false,
  isSidebarOpen: false,
  viewMode: 'global',
  activeDetailTab: 'info',
  selectedCustomerId: null,
  selectedDealId: null,
  selectedCustomerDetail: null,

  // 1. Başlangıç Verilerini Çek (Board + İlk Müşteri Sayfası)
  fetchInitialData: async () => {
    set({ isLoading: true });
    try {
      const [dealsRes, customersRes] = await Promise.all([
        crmService.getDeals(),
        crmService.getCustomers(1, 20)
      ]);
      
      set({ 
        deals: dealsRes || [], 
        customers: customersRes.data || [],
        pagination: { ...get().pagination, total: customersRes.count || 0 },
        isLoading: false 
      });
    } catch (error) {
      console.error("Veri çekme hatası:", error);
      set({ isLoading: false });
    }
  },

  // 2. Müşteri Listesi Yükle (Pagination ile)
  loadCustomers: async (page = 1) => {
    set({ isLoading: true });
    try {
      const { limit } = get().pagination;
      const { data, count } = await crmService.getCustomers(page, limit);
      
      set((state) => ({
        customers: page === 1 ? data : [...state.customers, ...data], // İlk sayfaysa değiştir, değilse ekle
        pagination: { ...state.pagination, page, total: count || 0 },
        isLoading: false
      }));
    } catch (error) {
      console.error("Müşteri yükleme hatası:", error);
      set({ isLoading: false });
    }
  },

  // 3. Müşteri Arama (Debounce UI tarafında yapılmalı)
  searchCustomersLocal: async (query) => {
    set({ searchQuery: query, isLoading: true });
    try {
      if (!query.trim()) {
        // Arama boşsa ilk sayfayı geri yükle
        return get().loadCustomers(1);
      }
      const data = await crmService.searchCustomers(query);
      // Not: Arama sonucu customer listesini geçici olarak ezer
      // Customer tipine uydurmak için partial data dönüşümü gerekebilir
      // Burada gelen data CustomerPartial, state Customer[] bekliyor.
      // Tip güvenliği için `as Customer[]` kullanıyoruz, production'da mapper yazılabilir.
      set({ customers: data as unknown as Customer[], isLoading: false });
    } catch (error) {
      console.error("Arama hatası:", error);
      set({ isLoading: false });
    }
  },

  // 4. Müşteri Havuzunu Aç
  openGlobalSidebar: () => {
    set({ 
      isSidebarOpen: true, 
      viewMode: 'global', 
      selectedCustomerId: null, 
      selectedDealId: null,
      selectedCustomerDetail: null
    });
  },

  // 5. Müşteri Detaylarını Aç ve Verileri Çek
  openCustomerDetail: async (customerId, dealId) => {
    // Önce UI'ı aç (Yükleniyor göster)
    set({
      isSidebarOpen: true,
      viewMode: 'detail',
      selectedCustomerId: customerId,
      selectedDealId: dealId || null,
      activeDetailTab: 'info',
      isLoading: true
    });

    try {
      // Servisten ful detayı çek
      const fullProfile = await crmService.getCustomerFullProfile(customerId);
      
      set({
        // CustomerDetail tipine uygun birleştirme
        selectedCustomerDetail: {
          ...fullProfile.customer,
          tasks: fullProfile.tasks,
          activities: fullProfile.activities,
          appointments: fullProfile.appointments,
          deals: fullProfile.deals
        } as CustomerDetail,
        isLoading: false
      });
    } catch (error) {
      console.error("Detay çekme hatası:", error);
      set({ isLoading: false }); // Hata olsa bile loading'i kapat
    }
  },

  closeSidebar: () => set({ isSidebarOpen: false }),
  setDetailTab: (tab) => set({ activeDetailTab: tab }),

  // 6. Kanban Sürükle-Bırak (Optimistic Update)
  moveDealOptimistic: async (dealId, newStage) => {
    const previousDeals = get().deals;
    
    // UI'ı anında güncelle
    set((state) => ({
      deals: state.deals.map(d => 
        d.id === dealId ? { ...d, stage: newStage } : d
      )
    }));

    try {
      await crmService.updateDealStage(dealId, newStage);
    } catch (err) {
      console.error("Taşıma başarısız:", err);
      set({ deals: previousDeals }); // Geri al
      alert("İşlem gerçekleştirilemedi.");
    }
  },

  refreshDeals: async () => {
    const data = await crmService.getDeals();
    set({ deals: data || [] });
  },

  // 7. Detay Ekranı İçin Yardımcı Metodlar (UI anında güncellensin diye)
  addActivityToState: (activity) => {
    set((state) => {
      if (!state.selectedCustomerDetail) return state;
      return {
        selectedCustomerDetail: {
          ...state.selectedCustomerDetail,
          activities: [activity, ...state.selectedCustomerDetail.activities]
        }
      };
    });
  },
  removeActivityFromState: (activityId) => {
    set((state) => {
      if (!state.selectedCustomerDetail) return state;
      return {
        selectedCustomerDetail: {
          ...state.selectedCustomerDetail,
          activities: state.selectedCustomerDetail.activities.filter(a => a.id !== activityId)
        }
      };
    });
  },

  addTaskToState: (task) => {
    set((state) => {
      if (!state.selectedCustomerDetail) return state;
      return {
        selectedCustomerDetail: {
          ...state.selectedCustomerDetail,
          tasks: [...state.selectedCustomerDetail.tasks, task]
        }
      };
    });
  },
  removeTaskFromState: (taskId) => {
    set((state) => {
      if (!state.selectedCustomerDetail) return state;
      return {
        selectedCustomerDetail: {
          ...state.selectedCustomerDetail,
          tasks: state.selectedCustomerDetail.tasks.filter(t => t.id !== taskId)
        }
      };
    });
  },
  removeCustomerFromState: (customerId) => {
    set((state) => {
      // 1. Listeden çıkar
      const updatedCustomers = state.customers.filter(c => c.id !== customerId);
      
      // 2. Eğer silinen müşteri şu an ekranda açıksa paneli kapat
      const shouldClose = state.selectedCustomerId === customerId;

      return {
        customers: updatedCustomers,
        // Silinen müşteri açıksa her şeyi sıfırla ve kapat
        isSidebarOpen: shouldClose ? false : state.isSidebarOpen,
        selectedCustomerId: shouldClose ? null : state.selectedCustomerId,
        selectedCustomerDetail: shouldClose ? null : state.selectedCustomerDetail
      };
    });
  },

  addAppointmentToState: (appointment) => {
    set((state) => {
      if (!state.selectedCustomerDetail) return state;
      return {
        selectedCustomerDetail: {
          ...state.selectedCustomerDetail,
          appointments: [...state.selectedCustomerDetail.appointments, appointment]
        }
      };
    });
  }
}));