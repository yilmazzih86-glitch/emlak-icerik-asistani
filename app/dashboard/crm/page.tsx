"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Filter, Trash2, Edit } from "lucide-react"; // Trash2 ikonu eklendi
import { Button } from "@/components/ui/Button/Button";
import { CrmBoard } from "@/features/crm/components/CrmBoard/CrmBoard";
import { NewDealModal } from "@/features/crm/components/NewDealModal/NewDealModal";
import { Deal, CrmStage } from "@/features/crm/api/types";
import { crmService } from "@/features/crm/api/crmService";

export default function CrmPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  
  // Modal State'leri
  const [isNewDealOpen, setIsNewDealOpen] = useState(false);
  const [initialStage, setInitialStage] = useState<CrmStage>('new');

  const fetchDeals = async () => {
    try {
      const data = await crmService.getDeals();
      setDeals(data);
    } catch (error) {
      console.error("Hata:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDeals(); }, []);

  // --- YENİ: AŞAMA DEĞİŞTİRME (Sürükle-Bırak) ---
  const handleStageChange = async (dealId: string, newStage: CrmStage) => {
    // 1. Optimistic Update (Ekran anında güncellensin)
    setDeals(prev => prev.map(d => d.id === dealId ? { ...d, stage: newStage } : d));

    try {
      // 2. Veritabanını güncelle
      await crmService.updateDealStage(dealId, newStage);
    } catch (error) {
      console.error("Aşama güncellenemedi:", error);
      fetchDeals(); // Hata varsa geri al
    }
  };

  // --- YENİ: SİLME İŞLEMİ ---
  const handleDeleteDeal = async () => {
    if (!selectedDeal) return;
    if (!confirm("Bu fırsatı silmek istediğinize emin misiniz? (Müşteri kaydı silinmez)")) return;

    try {
      await crmService.deleteDeal(selectedDeal.id);
      setSelectedDeal(null); // Paneli kapat
      fetchDeals(); // Listeyi yenile
    } catch (error) {
      alert("Silme başarısız");
    }
  };

  const handleOpenNewDeal = (stage: CrmStage = 'new') => {
    setInitialStage(stage);
    setIsNewDealOpen(true);
  };

  const handleWhatsApp = (phone: string) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/\D/g, '').replace(/^0+/, '');
    window.open(`https://wa.me/90${cleanPhone}`, '_blank');
  };

  const filteredDeals = deals.filter((deal) => {
    const term = searchTerm.toLowerCase();
    return deal.customer?.full_name?.toLowerCase().includes(term) || 
           deal.portfolio?.title?.toLowerCase().includes(term);
  });

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '0 1.5rem 1.5rem 1.5rem', maxWidth: '100vw' }}>
      
      {/* HEADER */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', marginTop: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--foreground)' }}>Pipeline</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Müşteri ilişkileri ve satış süreçleri.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <input 
              type="text" 
              placeholder="Ara..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                background: 'var(--secondary)', border: '1px solid var(--border)', color: 'var(--foreground)', 
                padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '0.5rem', fontSize: '0.9rem', width: '260px', outline: 'none'
              }}
            />
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}/>
          </div>
          <Button icon={<Plus size={18}/>} onClick={() => handleOpenNewDeal('new')}>Yeni Fırsat</Button>
        </div>
      </header>

      {/* BOARD */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <CrmBoard 
          deals={filteredDeals} 
          isLoading={loading}
          onDealClick={setSelectedDeal}
          onWhatsApp={handleWhatsApp}
          onAddDeal={handleOpenNewDeal}
          onStageChange={handleStageChange} // BAĞLANTI BURADA
        />
      </div>

      <NewDealModal 
        isOpen={isNewDealOpen}
        onClose={() => setIsNewDealOpen(false)}
        initialStage={initialStage}
        onSuccess={fetchDeals} 
      />

      {/* DETAY PANELİ */}
      {selectedDeal && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }} onClick={() => setSelectedDeal(null)} />
          
          <div style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, width: '450px', background: 'var(--secondary)', 
            borderLeft: '1px solid var(--border)', zIndex: 50, padding: '1.5rem', 
            boxShadow: '-5px 0 25px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: '1rem',
            animation: 'slideInRight 0.3s ease'
          }}>
            {/* Panel Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>{selectedDeal.customer?.full_name}</h2>
                <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{selectedDeal.customer?.phone}</span>
                </div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setSelectedDeal(null)}>Kapat</Button>
            </div>

            {/* Panel Content */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Tarih Bilgisi */}
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                Eklenme Tarihi: {new Date(selectedDeal.created_at).toLocaleString('tr-TR')}
              </div>

              {/* Portföy Alanı */}
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--accent)' }}>Portföy</h3>
                {selectedDeal.portfolio ? (
                  <div>
                    <p>{selectedDeal.portfolio.title}</p>
                    <p style={{ fontWeight: 700, marginTop: '0.25rem', color: '#10b981' }}>
                      {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(selectedDeal.portfolio.price || 0)}
                    </p>
                  </div>
                ) : (
                  <p style={{ color: 'var(--muted)', fontStyle: 'italic' }}>Henüz portföy seçilmemiş.</p>
                )}
              </div>

              {/* AI Aksiyonları */}
              <div style={{ padding: '1rem', border: '1px dashed var(--border)', borderRadius: '8px', textAlign: 'center' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '1rem' }}>
                  Yapay zeka bu müşteri için ne yapsın?
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <Button variant="outline" size="sm">Takip Mesajı</Button>
                  <Button variant="outline" size="sm">Randevu İste</Button>
                </div>
              </div>

            </div>

            {/* Panel Footer (Silme Butonu) */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
               <Button variant="ghost" style={{ color: '#ef4444' }} onClick={handleDeleteDeal} icon={<Trash2 size={16} />}>
                 Fırsatı Sil
               </Button>
               <Button onClick={() => handleWhatsApp(selectedDeal.customer?.phone || '')}>WhatsApp'ta Aç</Button>
            </div>

          </div>
        </>
      )}

      <style jsx global>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}