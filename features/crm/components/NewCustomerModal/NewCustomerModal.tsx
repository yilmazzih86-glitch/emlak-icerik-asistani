// features/crm/components/NewCustomerModal/NewCustomerModal.tsx
'use client';

import { useState } from 'react';
import styles from './NewCustomerModal.module.scss';
import { Button } from '@/components/ui/Button/Button';
import { X, Save, User, Phone, Mail, Wallet, MapPin } from 'lucide-react';
import { crmService } from '@/features/crm/api/crmService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const NewCustomerModal = ({ isOpen, onClose, onSuccess }: Props) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    budget_max: '',
    interested_districts: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name.trim()) return alert('Müşteri adı zorunludur.');

    try {
      setLoading(true);
      // Müşteri verisini hazırlıyoruz
      await crmService.createCustomer({
        full_name: formData.full_name,
        phone: formData.phone,
        email: formData.email,
        budget_max: formData.budget_max ? Number(formData.budget_max) : 0,
        // Virgülle ayrılan bölgeleri diziye çeviriyoruz
        interested_districts: formData.interested_districts 
          ? formData.interested_districts.split(',').map(d => d.trim()) 
          : [],
        notes: formData.notes,
        status: 'new'
      });
      
      onSuccess(); // Listeyi yenile
      onClose();   // Modalı kapat
    } catch (error) {
      console.error(error);
      alert('Müşteri kaydedilirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        
        <div className={styles.modal__header}>
          <h2>Yeni Müşteri Kaydı</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.modal__body}>
          
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Ad Soyad *</label>
              <div className={styles.inputWrapper}>
                <User size={18} />
                <input 
                  type="text" 
                  required 
                  placeholder="Örn: Ahmet Yılmaz"
                  value={formData.full_name} 
                  onChange={e => setFormData({...formData, full_name: e.target.value})} 
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Telefon</label>
              <div className={styles.inputWrapper}>
                <Phone size={18} />
                <input 
                  type="tel" 
                  placeholder="05xx..."
                  value={formData.phone} 
                  onChange={e => setFormData({...formData, phone: e.target.value})} 
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>E-posta</label>
              <div className={styles.inputWrapper}>
                <Mail size={18} />
                <input 
                  type="email" 
                  placeholder="ornek@mail.com"
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Maks. Bütçe (TL)</label>
              <div className={styles.inputWrapper}>
                <Wallet size={18} />
                <input 
                  type="number" 
                  placeholder="0"
                  value={formData.budget_max} 
                  onChange={e => setFormData({...formData, budget_max: e.target.value})} 
                />
              </div>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>İlgilenilen Bölgeler (Virgülle ayırın)</label>
            <div className={styles.inputWrapper}>
              <MapPin size={18} />
              <input 
                placeholder="Örn: Beşiktaş, Sarıyer, Kadıköy" 
                value={formData.interested_districts} 
                onChange={e => setFormData({...formData, interested_districts: e.target.value})} 
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Müşteri Hakkında Notlar</label>
            <textarea 
              placeholder="Müşterinin özel istekleri, taşınma aciliyeti vb..."
              value={formData.notes} 
              onChange={e => setFormData({...formData, notes: e.target.value})} 
              rows={3} 
              className={styles.textarea}
            />
          </div>

          <div className={styles.modal__footer}>
            <Button type="button" variant="ghost" onClick={onClose}>
              İptal
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              isLoading={loading} 
              icon={<Save size={18}/>}
              style={{ minWidth: '150px' }} // fullWidth yerine belirli genişlik veya 100%
            >
              Müşteriyi Kaydet
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};