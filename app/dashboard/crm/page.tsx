"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Users, Search, Plus, ClipboardList, Loader2
} from "lucide-react";
import { Customer } from "@/types";
import CustomerCard from "@/components/dashboard/crm/CustomerCard";
import StageFilters from "@/components/dashboard/crm/StageFilters";
import NewCustomerModal from "@/components/dashboard/crm/NewCustomerModal";
import AgendaPanel from "@/components/dashboard/crm/AgendaPanel";

// 1. YENİ BİLEŞENİ IMPORT EDİYORUZ
import CustomerDetailPanel from "@/components/dashboard/crm/CustomerDetailPanel";

export default function CrmPage() {
  const supabase = createClient();
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStage, setFilterStage] = useState("all");
  
  const [stageCounts, setStageCounts] = useState<Record<string, number>>({});
  
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isAgendaOpen, setIsAgendaOpen] = useState(false);

  // 2. SEÇİLİ MÜŞTERİ STATE'İ (Panelin açılması için)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('customers')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      setCustomers(data as Customer[]);
      
      const counts: Record<string, number> = { all: data.length };
      data.forEach((c: any) => {
        const stg = c.stage || 'new';
        counts[stg] = (counts[stg] || 0) + 1;
      });
      setStageCounts(counts);
    }
    setLoading(false);
  };

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (c.phone && c.phone.includes(searchTerm));
    
    const matchesStage = filterStage === 'all' || c.stage === filterStage;
    
    return matchesSearch && matchesStage;
  });

  const handleWhatsApp = (customer: Customer) => {
    const phone = customer.phone?.replace(/\D/g, ''); 
    if (!phone) return alert("Telefon numarası bulunamadı.");
    const url = `https://wa.me/90${phone.replace(/^0+/, '')}`;
    window.open(url, '_blank');
  };

  return (
    <div className="crm-page animate-in fade-in">
      
      <div className="crm-header">
        <div className="header-left">
          <h1><Users size={28} className="icon-purple"/> Müşteri Listesi</h1>
          <p>Potansiyel alıcı ve satıcılarınızı tek yerden yönetin.</p>
        </div>
        <div className="header-actions">
          <button onClick={() => setIsAgendaOpen(true)} className="btn-secondary">
            <ClipboardList size={18} className="icon-orange"/> Ajandam
          </button>
          <button onClick={() => setIsCustomerModalOpen(true)} className="btn-primary">
            <Plus size={18} /> Yeni Müşteri
          </button>
        </div>
      </div>

      <div className="crm-controls-wrapper">
        <div className="search-container">
          <Search size={18} className="search-icon"/>
          <input type="text" className="search-input" placeholder="İsim veya telefon ile ara..." 
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <StageFilters 
          currentStage={filterStage} 
          onStageChange={setFilterStage} 
          counts={stageCounts} 
        />
      </div>

      <div className="crm-grid">
        {loading ? (
          <div className="state-box"><Loader2 className="spin icon-purple" size={32}/><span>Yükleniyor...</span></div>
        ) : filteredCustomers.length === 0 ? (
          <div className="state-box empty"><Users size={48} className="icon-muted"/><p>Kayıt bulunamadı.</p></div>
        ) : (
          filteredCustomers.map((customer) => (
            <CustomerCard 
              key={customer.id} 
              customer={customer} 
              onWhatsApp={handleWhatsApp}
              // 3. KARTTA DÜZENLE BUTONUNA BASILINCA STATE GÜNCELLENİR
              onEdit={() => setSelectedCustomer(customer)} 
              hasActiveTask={false} 
            />
          ))
        )}
      </div>

      <NewCustomerModal 
        isOpen={isCustomerModalOpen} 
        onClose={() => setIsCustomerModalOpen(false)} 
        onSuccess={fetchCustomers} 
      />
      
      <AgendaPanel 
        isOpen={isAgendaOpen}
        onClose={() => setIsAgendaOpen(false)}
      />

      {/* 4. DETAY PANELİ (EN ALTA EKLENDİ) */}
      <CustomerDetailPanel 
        customer={selectedCustomer} 
        onClose={() => setSelectedCustomer(null)} 
      />

    </div>
  );
}