// features/crm/components/NewDealModal/NewDealModal.tsx
'use client';

import { useState, useEffect } from 'react';
import styles from './NewDealModal.module.scss';
import { Button } from '@/components/ui/Button/Button';
import { X, Save, User, Briefcase, Wallet, Layers } from 'lucide-react';
import { crmService } from '@/features/crm/api/crmService';
import { CrmStage } from '@/features/crm/api/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialStage?: CrmStage;
}

export const NewDealModal = ({ isOpen, onClose, onSuccess, initialStage = 'new' }: Props) => {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<{id: string, full_name: string}[]>([]);
  const [portfolios, setPortfolios] = useState<{id: string, title: string}[]>([]);

  const [formData, setFormData] = useState({
    customer_id: '',
    portfolio_id: '',
    expected_amount: '',
    stage: initialStage
  });

  useEffect(() => {
    if (isOpen) {
      const loadOptions = async () => {
        const [cData, pData] = await Promise.all([
          crmService.getCustomersSelect(),
          crmService.getPortfoliosSelect()
        ]);
        setCustomers(cData);
        setPortfolios(pData);
      };
      loadOptions();
      setFormData(prev => ({ ...prev, stage: initialStage }));
    }
  }, [isOpen, initialStage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customer_id) return alert('Lütfen müşteri seçin.');

    try {
      setLoading(true);
      await crmService.createDeal({
        customer_id: formData.customer_id,
        portfolio_id: formData.portfolio_id || null,
        stage: formData.stage,
        expected_amount: formData.expected_amount ? Number(formData.expected_amount) : 0
      });
      onSuccess();
      onClose();
    } catch (error) {
      alert('Hata: ' + (error as Error).message);
    } finally { setLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modal__header}>
          <h2>Sürece Dahil Et (Yeni Fırsat)</h2>
          <button className={styles.closeBtn} onClick={onClose}><X size={20}/></button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.modal__body}>
          <div className={styles.formGroup}>
            <label>Müşteri Seçin *</label>
            <div className={styles.inputWrapper}>
              <User size={18}/>
              <select required value={formData.customer_id} onChange={e => setFormData({...formData, customer_id: e.target.value})}>
                <option value="">-- Müşteri Seçin --</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>İlgilenilen Portföy (Opsiyonel)</label>
            <div className={styles.inputWrapper}>
              <Briefcase size={18}/>
              <select value={formData.portfolio_id} onChange={e => setFormData({...formData, portfolio_id: e.target.value})}>
                <option value="">Belirsiz / Genel İlgilenen</option>
                {portfolios.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className={styles.formGroup}>
              <label>Tahmini Tutar (TL)</label>
              <div className={styles.inputWrapper}><Wallet size={18}/><input type="number" value={formData.expected_amount} onChange={e => setFormData({...formData, expected_amount: e.target.value})}/></div>
            </div>
            <div className={styles.formGroup}>
              <label>Aşama</label>
              <div className={styles.inputWrapper}><Layers size={18}/>
                <select value={formData.stage} onChange={e => setFormData({...formData, stage: e.target.value as any})}>
                  <option value="new">Yeni</option>
                  <option value="contacted">Görüşüldü</option>
                  <option value="presentation">Sunum</option>
                  <option value="negotiation">Pazarlık</option>
                </select>
              </div>
            </div>
          </div>

          <div className={styles.modal__footer}>
            <Button type="button" variant="ghost" onClick={onClose}>Vazgeç</Button>
            <Button type="submit" variant="primary" isLoading={loading} style={{ minWidth: '160px' }} icon={<Save size={18}/>}>Pipeline'a Ekle</Button>
          </div>
        </form>
      </div>
    </div>
  );
};