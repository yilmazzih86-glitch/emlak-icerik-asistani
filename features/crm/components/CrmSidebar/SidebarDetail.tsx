// features/crm/components/CrmSidebar/SidebarDetail.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useCrmStore } from '../../hooks/useCrmStore';
import { crmService } from '../../api/crmService';
import { ArrowLeft, User, Mail, Phone, Calendar, Sparkles, History, Map } from 'lucide-react';
import AiToolsPanel from './AiToolsPanel';
import styles from './CrmSidebar.module.scss';
import { CustomerDetail } from '../../api/types';
import { motion } from 'framer-motion';

export default function SidebarDetail() {
  const { selectedCustomerId, openGlobalSidebar, activeDetailTab, setDetailTab } = useCrmStore();
  const [data, setData] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  if (!selectedCustomerId) return;
  // Detaylar doğrudan customers tablosundan çekilir
  crmService.getCustomerFullProfile(selectedCustomerId).then(res => {
    setData(res as any);
  });
}, [selectedCustomerId]);

  if (loading || !data) return <div className={styles.loading}>Veriler Hazırlanıyor...</div>;

  return (
    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className={styles.detailWrapper}>
      <header className={styles.detailHeader}>
        <button onClick={openGlobalSidebar} className={styles.backButton}>
          <ArrowLeft size={20} />
        </button>
        <div className={styles.headerProfile}>
          <h2>{data.full_name}</h2>
          <div className={`${styles.statusPill} ${styles[data.stage?.toLowerCase() || 'new']}`}>
            {data.stage?.toUpperCase() || 'YENİ'}
          </div>
        </div>
      </header>

      <div className={styles.tabNav}>
        <button className={activeDetailTab === 'info' ? styles.active : ''} onClick={() => setDetailTab('info')}>
          <User size={16} /> Profil
        </button>
        <button className={activeDetailTab === 'history' ? styles.active : ''} onClick={() => setDetailTab('history')}>
          <History size={16} /> Geçmiş
        </button>
        <button className={`${styles.aiTab} ${activeDetailTab === 'ai' ? styles.activeAi : ''}`} onClick={() => setDetailTab('ai')}>
          <Sparkles size={16} /> AI Asistan
        </button>
      </div>

      <div className={styles.tabContent}>
        {activeDetailTab === 'info' && (
          <div className={styles.profileView}>
            <section className={styles.infoSection}>
              <h4>İletişim</h4>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}><Phone size={14}/> <span>{data.phone}</span></div>
                <div className={styles.infoItem}><Mail size={14}/> <span>{data.email || 'E-posta belirtilmedi'}</span></div>
              </div>
            </section>
            
            <section className={styles.infoSection}>
              <h4>Arayış Detayları</h4>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <Map size={14}/> 
                  <div className={styles.tags}>
                    {data.interested_districts?.map(d => <span key={d} className={styles.tag}>{d}</span>) || 'Bölge seçilmedi'}
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <strong>Bütçe:</strong>
                  <span>{data.budget_min?.toLocaleString()} - {data.budget_max?.toLocaleString()} ₺</span>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeDetailTab === 'history' && (
          <div className={styles.historyTimeline}>
            {data.activities?.map((activity, i) => (
              <div key={i} className={styles.timelineItem}>
                <div className={styles.timelinePoint} />
                <div className={styles.timelineCard}>
                  <div className={styles.cardTop}>
                    <span className={styles.activityType}>{activity.type}</span>
                    <span className={styles.activityDate}>{new Date(activity.created_at).toLocaleDateString()}</span>
                  </div>
                  <p>{activity.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeDetailTab === 'ai' && <AiToolsPanel customerId={data.id} />}
      </div>
    </motion.div>
  );
}