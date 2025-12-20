import { create } from 'zustand';

// Sidebar'ın iki ana modu var:
type SidebarViewMode = 'global' | 'detail';

// Sidebar içindeki aktif sekmeler
type GlobalTab = 'pool' | 'ai-tools';
type DetailTab = 'overview' | 'tasks' | 'activities' | 'appointments';

interface CrmState {
  // --- UI Durumu ---
  isSidebarOpen: boolean;
  viewMode: SidebarViewMode;
  
  // --- Global Görünüm Durumu ---
  activeGlobalTab: GlobalTab;
  
  // --- Detay Görünüm Durumu ---
  selectedCustomerId: string | null;
  selectedDealId: string | null;
  activeDetailTab: DetailTab;
  
  // --- Actions (Eylemler) ---
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
  
  setGlobalTab: (tab: GlobalTab) => void;
  setDetailTab: (tab: DetailTab) => void;
  
  selectCustomer: (customerId: string, dealId?: string) => void;
  resetSelection: () => void;
}

export const useCrmStore = create<CrmState>((set) => ({
  // Başlangıç Değerleri
  isSidebarOpen: false,
  viewMode: 'global',
  activeGlobalTab: 'pool',
  selectedCustomerId: null,
  selectedDealId: null,
  activeDetailTab: 'overview',

  // Fonksiyonlar
  openSidebar: () => set({ isSidebarOpen: true }),
  closeSidebar: () => set({ isSidebarOpen: false }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  setGlobalTab: (tab) => set({ 
    viewMode: 'global', 
    activeGlobalTab: tab 
  }),

  setDetailTab: (tab) => set({ 
    activeDetailTab: tab 
  }),

  selectCustomer: (customerId, dealId) => set({
    isSidebarOpen: true, // Otomatik aç
    viewMode: 'detail',
    selectedCustomerId: customerId,
    selectedDealId: dealId || null,
    activeDetailTab: 'overview' // Her seçimde genel bakışa dön
  }),

  resetSelection: () => set({
    viewMode: 'global',
    selectedCustomerId: null,
    selectedDealId: null,
    activeGlobalTab: 'pool' // Havuza geri dön
  }),
}));