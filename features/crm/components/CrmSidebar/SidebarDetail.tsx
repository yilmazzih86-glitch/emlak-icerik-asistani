'use client';

import React, { useEffect, useState } from 'react';
import { useCrmStore } from '../../hooks/useCrmStore';
import { crmService } from '../../api/crmService';
import { ArrowLeft, User, MessageSquare, Calendar, Sparkles } from 'lucide-react';
import AiToolsPanel from './AiToolsPanel'; // Bir önceki adımda oluşturduğumuz panel
import styles from './CrmSidebar.module.scss';
import { CustomerDetail } from '../../api/types';

type Tab = 'info' | 'history' | 'ai';

export default function SidebarDetail() {
  const { selectedCustomerId, openGlobalSidebar } = useCrmStore();
  const [activeTab, setActiveTab] = useState<Tab>('info');
  const [data, setData] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(false);

  // Müşteri seçildiğinde tüm verisini çek
  useEffect(() => {
    if (!selectedCustomerId) return;
    
    setLoading(true);
    crmService.getCustomerFullProfile(selectedCustomerId)
      .then(res => {
        // API'den dönen yapıyı CustomerDetail tipine uyduruyoruz
        // Not: crmService.getCustomerFullProfile dönüş tipini kontrol et
        setData({
           ...res.customer,
           tasks: res.tasks,
           activities: res.activities,
           appointments: res.appointments,
           deals: res.deals
        } as CustomerDetail);
      })
      .finally(() => setLoading(false));
  }, [selectedCustomerId]);

  if (!selectedCustomerId) return null;
  if (loading || !data) return <div className={styles.loading}>Yükleniyor...</div>;

  return (
    <div className={styles.detailContainer}>
      {/* Üst Navigasyon */}
      <div className={styles.detailHeader}>
        <button onClick={openGlobalSidebar} className={styles.backBtn}>
          <ArrowLeft size={18} /> Geri
        </button>
        <div className={styles.profileSummary}>
           <h3>{data.full_name}</h3>
           <span>{data.phone}</span>
        </div>
      </div>

      {/* Sekmeler (Tabs) */}
      <div className={styles.tabs}>
        <button 
          className={activeTab === 'info' ? styles.active : ''} 
          onClick={() => setActiveTab('info')}
        >
          <User size={16}/> Bilgi
        </button>
        <button 
          className={activeTab === 'history' ? styles.active : ''} 
          onClick={() => setActiveTab('history')}
        >
          <Calendar size={16}/> Geçmiş
        </button>
        <button 
          className={`${activeTab === 'ai' ? styles.activeAi : ''} ${styles.aiTab}`} 
          onClick={() => setActiveTab('ai')}
        >
          <Sparkles size={16}/> AI Asistan
        </button>
      </div>

      {/* İçerik Alanı */}
      <div className={styles.contentArea}>
        
        {/* TAB 1: Temel Bilgiler */}
        {activeTab === 'info' && (
          <div className={styles.infoTab}>
             <div className={styles.field}>
                <label>Bütçe</label>
                <div>{data.budget_min?.toLocaleString()} - {data.budget_max?.toLocaleString()} ₺</div>
             </div>
             <div className={styles.field}>
                <label>Bölgeler</label>
                <div className={styles.tags}>
                  {data.interested_districts?.map(d => <span key={d} className={styles.tag}>{d}</span>)}
                </div>
             </div>
             {/* Buraya form elemanları eklenerek düzenleme yapılabilir */}
          </div>
        )}

        {/* TAB 2: Geçmiş & Aktiviteler */}
        {activeTab === 'history' && (
          <div className={styles.historyTab}>
            {data.activities.map(act => (
              <div key={act.id} className={styles.activityItem}>
                 <small>{new Date(act.created_at).toLocaleDateString('tr-TR')}</small>
                 <p>{act.description}</p>
                 <span className={styles.typeBadge}>{act.type}</span>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: AI ASİSTAN (Kritik Nokta) */}
        {activeTab === 'ai' && (
          <AiToolsPanel customerId={data.id} />
        )}

      </div>
    </div>
  );
}