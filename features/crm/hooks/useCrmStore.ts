import { create } from 'zustand';
import { CrmDeal, Customer, PipelineStage, AiAutomationMode, Portfolio } from '../api/types';
import { crmService } from '../api/crmService';

type SidebarViewMode = 'global' | 'detail';
type DetailTab = 'overview' | 'tasks' | 'activities' | 'appointments';

interface CrmState {
  // --- Data Cache ---
  deals: CrmDeal[];
  customers: Customer[];
  isLoading: boolean;
  
  // --- UI State ---
  isSidebarOpen: boolean;
  viewMode: SidebarViewMode;
  activeDetailTab: DetailTab;
  
  // --- Selected Context ---
  selectedCustomerId: string | null;
  selectedDealId: string | null; // Eğer pipeline'dan tıklandıysa
  selectedPortfolioForAi: Portfolio | null; // AI mesajı için seçilen portföy
  
  // --- Actions ---
  fetchInitialData: () => Promise<void>;
  
  // Sidebar Controls
  openGlobalSidebar: () => void;
  openCustomerDetail: (customerId: string, dealId?: string) => void;
  closeSidebar: () => void;
  setDetailTab: (tab: DetailTab) => void;
  
  // Pipeline Actions
  moveDealOptimistic: (dealId: string, newStage: PipelineStage) => void;
  addCustomerToPipeline: (customerId: string) => Promise<void>;
  
  // AI Helper
  setAiPortfolio: (portfolio: Portfolio | null) => void;
}

export const useCrmStore = create<CrmState>((set, get) => ({
  deals: [],
  customers: [],
  isLoading: false,
  
  isSidebarOpen: false,
  viewMode: 'global',
  activeDetailTab: 'overview',
  
  selectedCustomerId: null,
  selectedDealId: null,
  selectedPortfolioForAi: null,

  fetchInitialData: async () => {
    set({ isLoading: true });
    const [dealsRes, customersRes] = await Promise.all([
      crmService.getDeals(),
      crmService.getCustomers()
    ]);
    set({ 
      deals: dealsRes.data || [], 
      customers: customersRes.data || [], 
      isLoading: false 
    });
  },

  openGlobalSidebar: () => {
    set({ 
      isSidebarOpen: true, 
      viewMode: 'global', 
      selectedCustomerId: null, 
      selectedDealId: null 
    });
  },

  openCustomerDetail: (customerId, dealId) => {
    set({
      isSidebarOpen: true,
      viewMode: 'detail',
      selectedCustomerId: customerId,
      selectedDealId: dealId || null,
      activeDetailTab: 'overview'
    });
  },

  closeSidebar: () => set({ isSidebarOpen: false }),
  
  setDetailTab: (tab) => set({ activeDetailTab: tab }),

  setAiPortfolio: (portfolio) => set({ selectedPortfolioForAi: portfolio }),

  moveDealOptimistic: (dealId, newStage) => {
    // 1. UI'ı hemen güncelle
    set((state) => ({
      deals: state.deals.map(d => 
        d.id === dealId ? { ...d, stage: newStage } : d
      )
    }));
    // 2. Arka planda sunucuya gönder
    crmService.updateDealStage(dealId, newStage).catch(err => {
      console.error("Move failed revert needed", err);
      // Hata olursa eski haline döndürme mantığı buraya eklenebilir
      get().fetchInitialData();
    });
  },

  addCustomerToPipeline: async (customerId) => {
    const { data: newDeal, error } = await crmService.createDeal(customerId, 'NEW');
    if (!error && newDeal) {
      // Store'a ekle (müşteri bilgisini de joinlemek gerekir normalde ama şimdilik hızlı ekleme)
      get().fetchInitialData(); // Temiz veri çek
    }
  }
}));