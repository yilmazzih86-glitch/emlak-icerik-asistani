import { useState, useEffect } from 'react';
import styles from './NewDealModal.module.scss';
import { Button } from '@/components/ui/Button/Button';
import { X, Save, User, Phone, Wallet, Briefcase, ChevronDown } from 'lucide-react';
import { crmService } from '@/features/crm/api/crmService';
import { CrmStage } from '@/features/crm/api/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // Kayıt sonrası sayfayı yenilemek için
  initialStage?: CrmStage;
}

export const NewDealModal = ({ isOpen, onClose, onSuccess, initialStage = 'new' }: Props) => {
  const [loading, setLoading] = useState(false);
  const [portfolios, setPortfolios] = useState<{id: string, title: string}[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    portfolio_id: '',
    expected_amount: '',
    stage: initialStage
  });

  // Modal açıldığında portföyleri çek ve formu sıfırla
  useEffect(() => {
    if (isOpen) {
      // Portföy listesini select box için getir
      crmService.getPortfoliosSelect()
        .then(setPortfolios)
        .catch(err => console.error("Portföyler çekilemedi", err));

      // Formu varsayılan değerlere döndür
      setFormData({
        full_name: '',
        phone: '',
        portfolio_id: '',
        expected_amount: '',
        stage: initialStage
      });
    }
  }, [isOpen, initialStage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basit Validasyon
    if (!formData.full_name.trim()) return alert('Lütfen müşteri adını girin.');

    try {
      setLoading(true);
      
      // Servis çağrısı: Hem müşteri hem fırsat oluşturur
      await crmService.createDealWithNewCustomer({
        full_name: formData.full_name,
        phone: formData.phone,
        portfolio_id: formData.portfolio_id || undefined,
        stage: formData.stage,
        expected_amount: formData.expected_amount ? Number(formData.expected_amount) : 0
      });
      
      onSuccess(); // Sayfayı yenilet
      onClose();   // Modalı kapat
    } catch (error) {
      console.error(error);
      alert('Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      {/* onClick propagation'ı durdurarak modalın içine tıklayınca kapanmasını engelliyoruz */}
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        
        {/* HEADER */}
        <div className={styles.modal__header}>
          <h2>Hızlı Fırsat Ekle</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        
        {/* FORM */}
        <form onSubmit={handleSubmit} className={styles.modal__body}>
          
          {/* 1. Müşteri Adı (Zorunlu) */}
          <div className={styles.formGroup}>
            <label>Müşteri Adı Soyadı <span className="text-red-500">*</span></label>
            <div className={styles.inputWrapper}>
              <User size={18} />
              <input 
                type="text" 
                placeholder="Örn: Ahmet Yılmaz"
                value={formData.full_name}
                onChange={e => setFormData({...formData, full_name: e.target.value})}
                required
                autoFocus
              />
            </div>
          </div>

          {/* 2. Telefon */}
          <div className={styles.formGroup}>
            <label>Telefon Numarası</label>
            <div className={styles.inputWrapper}>
              <Phone size={18} />
              <input 
                type="tel" 
                placeholder="0555 123 45 67"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>

          <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '0.25rem 0' }} />

          {/* 3. Portföy Seçimi (Opsiyonel) */}
          <div className={styles.formGroup}>
            <label>İlgilenilen Portföy</label>
            <div className={styles.inputWrapper}>
              <Briefcase size={18} />
              <select 
                value={formData.portfolio_id}
                onChange={e => setFormData({...formData, portfolio_id: e.target.value})}
              >
                <option value="">(Portföy Seçilmedi)</option>
                {portfolios.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
              {/* Select okunu özelleştirmek için (CSS ile gizleyip buraya ikon koyulabilir, şimdilik basit bırakıyoruz) */}
            </div>
          </div>

          {/* 4. Tutar ve Aşama (Yan Yana) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            
            <div className={styles.formGroup}>
              <label>Tahmini Tutar (TL)</label>
              <div className={styles.inputWrapper}>
                <Wallet size={18} />
                <input 
                  type="number" 
                  placeholder="0"
                  value={formData.expected_amount}
                  onChange={e => setFormData({...formData, expected_amount: e.target.value})}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Aşama</label>
              <div className={styles.inputWrapper}>
                 {/* Select'ler için wrapper içindeki ikon bazen kayabilir, burada ikon kullanmıyoruz */}
                <select 
                  value={formData.stage}
                  onChange={e => setFormData({...formData, stage: e.target.value as any})}
                  style={{ paddingLeft: '1rem' }} // İkon olmadığı için normal padding
                >
                  <option value="new">Yeni Müşteri</option>
                  <option value="contacted">Görüşüldü</option>
                  <option value="presentation">Sunum Yapıldı</option>
                  <option value="negotiation">Teklif / Pazarlık</option>
                </select>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className={styles.modal__footer}>
            <Button type="button" variant="ghost" onClick={onClose}>İptal</Button>
            <Button type="submit" variant="primary" isLoading={loading} icon={<Save size={18}/>}>
              Kaydet
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
};