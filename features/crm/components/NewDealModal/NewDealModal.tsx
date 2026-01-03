// features/crm/components/NewDealModal/NewDealModal.tsx

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useCrmStore } from '@/features/crm/hooks/useCrmStore';
import { crmService } from '@/features/crm/api/crmService';
import { STAGES, STAGE_LABELS, PipelineStage } from '@/features/crm/api/types';
import { X, Search, Briefcase, ChevronRight, UserCheck, Building2, CheckCircle2 } from 'lucide-react';
import styles from './NewDealModal.module.scss';


interface NewDealModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewDealModal({ isOpen, onClose }: NewDealModalProps) {
  const { refreshDeals } = useCrmStore();
  
  // Arama State'leri
  const [custQuery, setCustQuery] = useState('');
  const [portQuery, setPortQuery] = useState('');
  const [custResults, setCustResults] = useState<any[]>([]);
  const [portResults, setPortResults] = useState<any[]>([]);
  
  // Seçim State'leri
  const [selectedCust, setSelectedCust] = useState<any>(null);
  const [selectedPort, setSelectedPort] = useState<any>(null);
  const [stage, setStage] = useState<PipelineStage>('new');
  const [amount, setAmount] = useState('');

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    fetchUser();
  }, []);

  if (!isOpen) return null;

  // --- Müşteri Arama (Debounce yapılabilir, şimdilik direct call) ---
  const handleCustSearch = async (val: string) => {
    setCustQuery(val);
    if (val.length > 1) {
      const res = await crmService.searchCustomers(val);
      setCustResults(res || []);
    } else {
      setCustResults([]);
    }
  };

  // --- Portföy Arama ---
  const handlePortSearch = async (val: string) => {
    setPortQuery(val);
    if (val.length > 1) {
      const res = await crmService.searchPortfolios(val);
      setPortResults(res || []);
    } else {
      setPortResults([]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedCust) return alert('Lütfen bir müşteri seçin.');
    if (!currentUserId) return alert('Oturum bilgisi alınamadı. Lütfen sayfayı yenileyin.');
    
    setLoading(true);
    try {
      await crmService.createDeal({
        customer_id: selectedCust.id,
        portfolio_id: selectedPort?.id || null,
        stage: stage,
        expected_amount: amount ? Number(amount) : 0,
        user_id: currentUserId // Auth'dan gelecek
      });
      
      await refreshDeals();
      onClose();
      // State reset
      setSelectedCust(null);
      setSelectedPort(null);
      setCustQuery('');
      setPortQuery('');
    } catch (error) {
      console.error(error);
      alert('Fırsat oluşturulamadı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <header className={styles.header}>
          <h2><Briefcase size={20} /> Yeni Satış Fırsatı</h2>
          <button onClick={onClose} className={styles.closeBtn}><X size={20} /></button>
        </header>

        <div className={styles.body}>
          
          {/* 1. ADIM: Müşteri Seçimi */}
          <div className={styles.section}>
            <label>Müşteri Seçimi *</label>
            {!selectedCust ? (
              <div className={styles.searchBox}>
                <Search size={16} className={styles.icon}/>
                <input 
                  placeholder="Müşteri adı veya telefon..." 
                  value={custQuery}
                  onChange={(e) => handleCustSearch(e.target.value)}
                  autoFocus
                />
                {custResults.length > 0 && (
                  <ul className={styles.resultsList}>
                    {custResults.map(c => (
                      <li key={c.id} onClick={() => { setSelectedCust(c); setCustResults([]); }}>
                        <UserCheck size={14}/> {c.full_name} <span className={styles.sub}>{c.phone}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <div className={styles.selectedCard}>
                <div className={styles.info}>
                  <span className={styles.label}>Seçilen Müşteri</span>
                  <strong>{selectedCust.full_name}</strong>
                </div>
                <button onClick={() => setSelectedCust(null)}><X size={16}/></button>
              </div>
            )}
          </div>

          {/* 2. ADIM: Portföy Seçimi (Opsiyonel) */}
          <div className={styles.section}>
            <label>İlgilenilen Portföy (Opsiyonel)</label>
            {!selectedPort ? (
              <div className={styles.searchBox}>
                <Search size={16} className={styles.icon}/>
                <input 
                  placeholder="Portföy başlığı, il veya ilçe..." 
                  value={portQuery}
                  onChange={(e) => handlePortSearch(e.target.value)}
                />
                {portResults.length > 0 && (
                  <ul className={styles.resultsList}>
                    {portResults.map(p => (
                      <li key={p.id} onClick={() => { setSelectedPort(p); setPortResults([]); }}>
                        <Building2 size={14}/> {p.title} 
                        <span className={styles.sub}>{p.district} / {p.price}₺</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <div className={styles.selectedCard}>
                <div className={styles.info}>
                  <span className={styles.label}>Seçilen Portföy</span>
                  <strong>{selectedPort.title}</strong>
                </div>
                <button onClick={() => setSelectedPort(null)}><X size={16}/></button>
              </div>
            )}
          </div>

          {/* 3. ADIM: Aşama ve Tutar */}
          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label>Başlangıç Aşaması</label>
              <select value={stage} onChange={(e) => setStage(e.target.value as PipelineStage)}>
                {STAGES.map(s => (
                  <option key={s} value={s}>{STAGE_LABELS[s]}</option>
                ))}
              </select>
            </div>
            
          </div>

        </div>

        <footer className={styles.footer}>
          <button onClick={onClose} className={styles.cancelBtn}>İptal</button>
          <button 
            onClick={handleSubmit} 
            className={styles.submitBtn}
            disabled={loading || !selectedCust}
          >
            {loading ? 'Kaydediliyor...' : <><CheckCircle2 size={18}/> Fırsatı Oluştur</>}
          </button>
        </footer>
      </div>
    </div>
  );
}