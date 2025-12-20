import React, { useState, useEffect } from 'react';
import styles from './NewDealModal.module.scss';
import { crmService } from '../../api/crmService';
import { Customer, Stage } from '../../api/types';
// DÜZELTME: Named import
import { Button } from '@/components/ui/Button/Button';

interface NewDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const NewDealModal = ({ isOpen, onClose, onSuccess }: NewDealModalProps) => {
  // DÜZELTME: Seçilen müşterinin tam Customer olması gerekmiyor, Partial yeterli
  const [selectedCustomer, setSelectedCustomer] = useState<Partial<Customer> | null>(null);
  const [expectedAmount, setExpectedAmount] = useState('');
  const [stage, setStage] = useState<Stage>('new');
  
  const [searchTerm, setSearchTerm] = useState('');
  // DÜZELTME: State tipi Partial<Customer>[] yapıldı (Type hatası çözümü)
  const [searchResults, setSearchResults] = useState<Partial<Customer>[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchTerm.length > 1) {
        setIsSearching(true);
        const results = await crmService.searchCustomers(searchTerm);
        setSearchResults(results);
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer?.id) {
      alert("Lütfen bir müşteri seçin.");
      return;
    }

    setSubmitting(true);
    try {
      await crmService.createDealFull({
        customer_id: selectedCustomer.id,
        stage: stage,
        expected_amount: expectedAmount ? Number(expectedAmount) : 0,
        user_id: '2ffee494-c974-4c87-8724-0e1bf543890e'
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert('Fırsat oluşturulamadı.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3>Yeni Fırsat Ekle</h3>
          <button onClick={onClose} className={styles.closeBtn}>✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Müşteri Seç *</label>
            {selectedCustomer ? (
              <div className={styles.selectedCustomer}>
                <span>✅ {selectedCustomer.full_name}</span>
                <button type="button" onClick={() => setSelectedCustomer(null)}>Değiştir</button>
              </div>
            ) : (
              <div style={{position: 'relative'}}>
                <input 
                  type="text" 
                  placeholder="Müşteri adı ara..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
                {searchResults.length > 0 && (
                  <ul className={styles.searchResults}>
                    {searchResults.map(cust => (
                      <li key={cust.id} onClick={() => {
                        setSelectedCustomer(cust);
                        setSearchTerm('');
                        setSearchResults([]);
                      }}>
                        {cust.full_name} <small>({cust.phone})</small>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
               <label>Aşama</label>
               <select value={stage} onChange={(e) => setStage(e.target.value as Stage)}>
                 <option value="new">Yeni Müşteri</option>
                 <option value="contacted">Görüşüldü</option>
                 <option value="presentation">Sunum Yapıldı</option>
                 <option value="negotiation">Teklif / Pazarlık</option>
               </select>
            </div>
            <div className={styles.formGroup}>
               <label>Beklenen Tutar (TL)</label>
               <input 
                 type="number" 
                 value={expectedAmount}
                 onChange={(e) => setExpectedAmount(e.target.value)}
                 placeholder="0"
               />
            </div>
          </div>

          <div className={styles.footer}>
            <Button variant="outline" onClick={onClose} type="button">İptal</Button>
            <Button variant="primary" type="submit" disabled={submitting || !selectedCustomer}>
              {submitting ? 'Oluşturuluyor...' : 'Fırsat Oluştur'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};