// app/dashboard/crm/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { CrmBoard } from '@/features/crm/components/CrmBoard/CrmBoard';
import { CrmSidebar } from '@/features/crm/components/CrmSidebar/CrmSidebar';
import { crmService } from '@/features/crm/api/crmService';
import { Deal, Customer, CrmStage } from '@/features/crm/api/types';

export default function CrmPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true); // State ismi doğru olmalı
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true); // Buradaki setIsLoadingPool hatası giderildi
      const data = await crmService.getDeals();
      setDeals(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleTransferToOpportunity = async (customerId: string) => {
    await crmService.createDeal({ customer_id: customerId, stage: 'new' });
    fetchData();
    setIsSidebarOpen(false);
  };

  return (
    <div className="crm-container">
      {/* Müşteri Havuzu Butonu */}
      <div onClick={() => { setSelectedCustomer(null); setIsSidebarOpen(true); }}>
        Müşteri Havuzu
      </div>

      <CrmBoard 
        deals={deals} 
        isLoading={isLoading} 
        onDealClick={(d) => { setSelectedCustomer(d.customer); setIsSidebarOpen(true); }}
        onStageChange={async (id, s) => { await crmService.updateDealStage(id, s); fetchData(); }}
        onAddDeal={() => {}} // Eksik prop
        onWhatsApp={() => {}} // Eksik prop
      />

      {/* Yan Panel Bileşeni */}
      <CrmSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        customer={selectedCustomer}
        // Tip uyuşmazlığı giderildi: (customer: Customer | null) => void
        onSelectCustomer={(c: Customer | null) => setSelectedCustomer(c)} 
        onTransferToOpportunity={handleTransferToOpportunity}
      />
    </div>
  );
}