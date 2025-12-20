import React, { useState } from 'react';
import styles from './NewCustomerModal.module.scss';
import { crmService } from '../../api/crmService';
// DÜZELTME: Named import
import { Button } from '@/components/ui/Button/Button';

interface NewCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const NewCustomerModal = ({ isOpen, onClose, onSuccess }: NewCustomerModalProps) => {
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    notes: '',
    budget_max: ''
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await crmService.createCustomer({
        full_name: formData.full_name,
        phone: formData.phone,
        email: formData.email,
        notes: formData.notes,
        budget_max: formData.budget_max ? Number(formData.budget_max) : undefined,
        status: 'active'
      });
      onSuccess(); 
      onClose();   
      setFormData({ full_name: '', phone: '', email: '', notes: '', budget_max: '' });
    } catch (error) {
      alert('Müşteri oluşturulurken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3>Yeni Müşteri Ekle</h3>
          <button onClick={onClose} className={styles.closeBtn}>✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Ad Soyad *</label>
            <input 
              type="text" 
              required 
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              placeholder="Örn: Ahmet Yılmaz"
            />
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label>Telefon *</label>
              <input 
                type="tel" 
                required 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="05..."
              />
            </div>
            <div className={styles.formGroup}>
              <label>Maks. Bütçe (TL)</label>
              <input 
                type="number" 
                value={formData.budget_max}
                onChange={(e) => setFormData({...formData, budget_max: e.target.value})}
                placeholder="Örn: 5000000"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>E-posta</label>
            <input 
              type="email" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="ornek@email.com"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Notlar</label>
            <textarea 
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Müşteri talepleri..."
            />
          </div>

          <div className={styles.footer}>
            <Button variant="outline" onClick={onClose} type="button">İptal</Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};