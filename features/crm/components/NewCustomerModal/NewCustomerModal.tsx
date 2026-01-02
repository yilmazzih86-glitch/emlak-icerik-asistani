// features/crm/components/NewCustomerModal/NewCustomerModal.tsx

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useCrmStore } from '@/features/crm/hooks/useCrmStore';
import { crmService } from '@/features/crm/api/crmService';
import { X, Save, User, Phone, Mail, Banknote, FileText, Loader2, MapPin } from 'lucide-react';
import styles from './NewCustomerModal.module.scss';
import { getCities, getDistrictsByCityCode } from 'turkey-neighbourhoods';

// TypeScript hatası almamak için basit bir tip tanımı
interface NewCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewCustomerModal({ isOpen, onClose }: NewCustomerModalProps) {
  const { loadCustomers } = useCrmStore();
  const supabase = createClient();
  
  // 1. DÜZELTME: JSX ile uyumlu olması için tek bir formData state'i kullanıyoruz.
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    budget_min: '',
    budget_max: '',
    notes: '',
    type: 'sale' as 'sale' | 'rent', // Varsayılan Alıcı
    interested_cities: [] as string[],
    interested_districts: [] as string[],
    preferred_room_counts: [] as string[], // Artık tek bir string tutacak
    source: ""
  });
  const ROOM_OPTIONS = [
  { id: '1+0', label: '1+0' },
  { id: '1+1', label: '1+1' },
  { id: '2+1', label: '2+1' },
  { id: '3+1', label: '3+1' },
  { id: '4+1', label: '4+1' },
  { id: '5+1', label: '5+1' },
  { id: null, label: 'Belirsiz' } // Seçimi sıfırlamak için
];

// Müşteri kaynağı seçenekleri
const SOURCE_OPTIONS = [
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'phone', label: 'Telefon' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'sahibinden', label: 'Sahibinden' },
  { id: 'hepsi_emlak', label: 'Hepsi Emlak' },
  { id: 'office', label: 'Ofis' },
  { id: 'other', label: 'Diğer' }
];
const handleRoomSelect = (roomId: string | null) => {
  setFormData(prev => ({
    ...prev,
    preferred_room_counts: roomId ? [roomId] : ([] as string[]) 
  }));
};
const handleSourceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  const value = e.target.value;
  setFormData(prev => ({
    ...prev,
    source: value
  }));
};

  const [cityList] = useState(getCities()); // Şehirler statik olduğu için direkt alabiliriz
  const [districtList, setDistrictList] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  // 2. DÜZELTME: Kullanıcı ID'sini tutacak state ve useEffect
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    }
    if (isOpen) {
      getUser();
    }
  }, [isOpen]);

  useEffect(() => {
  const cityCode = formData.interested_cities[0];

  if (cityCode) {
    // Doğrudan kodu kullanarak ilçeleri çekiyoruz
    const districts = getDistrictsByCityCode(cityCode);
    setDistrictList(districts || []);
    
    console.log(`${cityCode} kodlu ilin ilçeleri yüklendi:`, districts);
  } else {
    setDistrictList([]);
  }
}, [formData.interested_cities]);
useEffect(() => {
  const cityCode = formData.interested_cities[0];

  if (cityCode) {
    // Doğrudan kodu kullanarak ilçeleri çekiyoruz
    const districts = getDistrictsByCityCode(cityCode);
    setDistrictList(districts || []);
    
    console.log(`${cityCode} kodlu ilin ilçeleri yüklendi:`, districts);
  } else {
    setDistrictList([]);
  }
}, [formData.interested_cities]);

    useEffect(() => {
    if (formData.interested_cities.length > 0) {
      const selectedCityName = formData.interested_cities[0];
      // Şimdilik ilk seçilen ile göre ilçeleri getiriyoruz (Geliştirilebilir)
      const selectedCity = cityList.find(
      c => c.name.toLowerCase() === selectedCityName.toLowerCase()
    );
    console.log("Bulunan Şehir Objesi:", selectedCity);
      if (selectedCity) {
      // 3. İlçeleri çek
      const districts = getDistrictsByCityCode(selectedCity.code);
      console.log("Çekilen İlçe Listesi:", districts);
      
      setDistrictList(districts || []);
    }
    } else {
      setDistrictList([]);
    }
  }, [formData.interested_cities, cityList]);
    


  // Form elemanları değiştiğinde çalışacak fonksiyon
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Güvenlik: Kullanıcı oturumu yoksa işlem yapma
    if (!currentUserId) {
      alert("Oturum bilgisi alınamadı. Lütfen sayfayı yenileyin.");
      return;
    }

    setLoading(true);
    try {
      // Plaka kodunu şehir ismine çeviriyoruz
      const selectedCityCode = formData.interested_cities[0];
      const cityObject = cityList.find(c => c.code === selectedCityCode);
      const finalCityName = cityObject ? cityObject.name : selectedCityCode;

      await crmService.createCustomer({
        user_id: currentUserId,
        full_name: formData.full_name,
        phone: formData.phone,
        email: formData.email || undefined,
        budget_min: formData.budget_min ? Number(formData.budget_min) : undefined,
        budget_max: formData.budget_max ? Number(formData.budget_max) : undefined,
        notes: formData.notes || undefined,
        
        // Yeni Alanlar:
        type: formData.type,
        interested_cities: finalCityName ? [finalCityName] : [],
        interested_districts: formData.interested_districts,
        preferred_room_counts: formData.preferred_room_counts
      });

      // Listeyi yenile ve modalı kapat
      await loadCustomers(1); 
      onClose();
      
      // Formu temizle
      setFormData({
        full_name: '', phone: '', email: '',
        budget_min: '', budget_max: '', notes: '',
        type: 'sale',
        interested_cities: [],
        interested_districts: [],
        preferred_room_counts: [],
        source: ""
      });
      
    } catch (error: any) {
  // Hatanın tüm detaylarını bir popup olarak ekrana basar
  const errorMsg = error.message || "Bilinmeyen hata";
  const errorCode = error.code || "Kod yok";
  const errorDetails = error.details || "Detay yok";
  
  alert(`HATA: ${error.message || 'Kayıt başarısız'}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  }; // handleSubmit fonksiyonu burada bitmeli

  // Modal kapalıysa hiçbir şey render etme
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <header className={styles.header}>
          <h2><User size={20} /> Yeni Müşteri Ekle</h2>
          <button onClick={onClose} className={styles.closeBtn}><X size={20} /></button>
        </header>

        <form onSubmit={handleSubmit} className={styles.body}>
          
          <div className={styles.section}>
            <label>Ad Soyad *</label>
            <div className={styles.inputWrapper}>
              <User size={16} />
              <input 
                name="full_name" // name alanı state anahtarı ile aynı olmalı
                placeholder="Örn: Ahmet Yılmaz" 
                value={formData.full_name}
                onChange={handleChange}
                required
                autoFocus
              />
            </div>
          </div>
          <div className={styles.section}>
  <label>Müşteri Tipi *</label>
  <div className={styles.typeToggle}>
    <button 
      type="button"
      className={formData.type === 'sale' ? styles.activeType : ''} 
      onClick={() => setFormData(prev => ({ ...prev, type: 'sale' }))}
    >
      Alıcı (Satılık)
    </button>
    <button 
      type="button"
      className={formData.type === 'rent' ? styles.activeType : ''} 
      onClick={() => setFormData(prev => ({ ...prev, type: 'rent' }))}
    >
      Kiracı (Kiralık)
    </button>
  </div>
</div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label>Telefon *</label>
              <div className={styles.inputWrapper}>
                <Phone size={16} />
                <input 
                  name="phone"
                  placeholder="0555..." 
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label>E-Posta</label>
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
  {/* ŞEHİR SEÇİMİ */}
  <div className={styles.formGroup}>
    <label>İl *</label>
    <div className={styles.inputWrapper}>
      <MapPin size={16} />
      <select 
  name="interested_cities"
  value={formData.interested_cities[0] || ''}
  onChange={(e) => {
    const selectedCode = e.target.value;
    setFormData(prev => ({ 
      ...prev, 
      interested_cities: [selectedCode], // Artık '34' gibi kod saklanacak
      interested_districts: [] // İl değişince ilçeyi sıfırla
    }));
  }}
  required
>
  <option value="">İl Seçiniz</option>
  {cityList.map(city => (
    // Value değerini city.code yaptık
    <option key={city.code} value={city.code}>{city.name}</option>
  ))}
</select>
    </div>
  </div>

  {/* İLÇE SEÇİMİ */}
  <div className={styles.formGroup}>
    <label>İlçe *</label>
    <div className={styles.inputWrapper}>
      <MapPin size={16} />
      <select 
  name="interested_districts"
  value={formData.interested_districts[0] || ''}
  onChange={(e) => setFormData(prev => ({ 
    ...prev, 
    interested_districts: [e.target.value] 
  }))}
  disabled={!formData.interested_cities.length}
  required
>
  <option value="">İlçe Seçiniz</option>
  {districtList.map((districtName) => (
    // Eğer districtList string dizisiyse doğrudan değeri kullanıyoruz
    <option key={districtName} value={districtName}>{districtName}</option>
  ))}
</select>
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

          <div className="modal-form-row">
  {/* Oda Sayısı Tercihi (Sekmeli/Tab Yapısı) */}
  <div className="modal-form-column">
    <label className="field-label">Oda Sayısı Tercihi</label>
    <div className="room-tabs-wrapper">
        <button
  type="button"
  className={`room-tab-item ${(formData.preferred_room_counts?.length === 0) ? 'active' : ''}`}
  onClick={() => handleRoomSelect(null)}
>
  Belirsiz
</button>
{ROOM_OPTIONS.filter(opt => opt.id !== null).map((option) => (
    <button
      key={option.id}
      type="button"
      className={`room-tab-item ${formData.preferred_room_counts?.includes(option.id as string) ? 'active' : ''}`}
      onClick={() => handleRoomSelect(option.id)}
    >
      {option.label}
    </button>
  ))}
 
    </div>
  </div>
  <div className="modal-form-column">
    <label className="field-label">Müşteri Kaynağı</label>
    <select
      className="source-select"
      value={formData.source}
      onChange={handleSourceChange}
    >
      <option value="">Kaynak Seçiniz</option>
      {SOURCE_OPTIONS.map((source) => (
        <option key={source.id} value={source.id}>
          {source.label}
        </option>
      ))}
    </select>
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