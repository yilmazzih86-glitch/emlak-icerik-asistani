// features/crm/components/NewCustomerModal/NewCustomerModal.tsx

import React, { useState } from 'react';
import { useCrmStore } from '@/features/crm/hooks/useCrmStore';
import { crmService } from '@/features/crm/api/crmService';
import { X, Save, User, Phone, Mail, Banknote, FileText, Loader2 } from 'lucide-react';
import styles from './NewCustomerModal.module.scss';

interface NewCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewCustomerModal({ isOpen, onClose }: NewCustomerModalProps) {
  const { loadCustomers } = useCrmStore();
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    budget_min: '',
    budget_max: '',
    notes: ''
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Müşteriyi Oluştur
      await crmService.createCustomer({
        full_name: formData.full_name,
        phone: formData.phone,
        email: formData.email || undefined,
        budget_min: formData.budget_min ? Number(formData.budget_min) : undefined,
        budget_max: formData.budget_max ? Number(formData.budget_max) : undefined,
        notes: formData.notes,
        user_id: 'current_user_id', // Auth entegrasyonunda burası dinamik olacak
        source: 'manual_entry'
      });

      // 2. Listeyi Yenile ve Kapat
      await loadCustomers(1); // İlk sayfaya dön
      onClose();
      // Formu temizle
      setFormData({ full_name: '', phone: '', email: '', budget_min: '', budget_max: '', notes: '' });
      
    } catch (error) {
      console.error(error);
      alert('Müşteri oluşturulurken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <header className={styles.header}>
          <h2><User size={20} /> Yeni Müşteri Ekle</h2>
          <button onClick={onClose} className={styles.closeBtn}><X size={20} /></button>
        </header>

        <form onSubmit={handleSubmit} className={styles.form}>
          
          <div className={styles.formGroup}>
            <label>Ad Soyad *</label>
            <div className={styles.inputWrapper}>
              <User size={16} />
              <input 
                name="full_name" 
                required 
                placeholder="Örn: Ahmet Yılmaz" 
                value={formData.full_name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label>Telefon *</label>
              <div className={styles.inputWrapper}>
                <Phone size={16} />
                <input 
                  name="phone" 
                  required 
                  placeholder="0555..." 
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label>E-posta</label>
              <div className={styles.inputWrapper}>
                <Mail size={16} />
                <input 
                  name="email" 
                  type="email" 
                  placeholder="ornek@mail.com" 
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label>Min Bütçe</label>
              <div className={styles.inputWrapper}>
                <Banknote size={16} />
                <input 
                  name="budget_min" 
                  type="number" 
                  placeholder="1.000.000" 
                  value={formData.budget_min}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label>Max Bütçe</label>
              <div className={styles.inputWrapper}>
                <Banknote size={16} />
                <input 
                  name="budget_max" 
                  type="number" 
                  placeholder="5.000.000" 
                  value={formData.budget_max}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Notlar</label>
            <div className={styles.inputWrapper}>
              <FileText size={16} className={styles.textAreaIcon} />
              <textarea 
                name="notes" 
                rows={3} 
                placeholder="Müşteri hakkında ilk notlar..." 
                value={formData.notes}
                onChange={handleChange}
              />
            </div>
          </div>

          <footer className={styles.footer}>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>İptal</button>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? <Loader2 className={styles.spin} size={18}/> : <Save size={18} />}
              Kaydet
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}