// app/dashboard/crm/page.tsx

'use client';

import { useEffect } from 'react';
import CrmBoard from '@/features/crm/components/CrmBoard/CrmBoard';
import CrmSidebar from '@/features/crm/components/CrmSidebar/CrmSidebar'; 
import { useCrmStore } from '@/features/crm/hooks/useCrmStore';
import { Menu, RefreshCw } from 'lucide-react';
import styles from './page.module.scss'; //

export default function CrmPage() {
  const { openGlobalSidebar, fetchInitialData, isLoading } = useCrmStore();

  // 1. Sayfa yüklendiğinde (Mount) verileri çek
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  return (
    <div className={styles.crmLayout}>
      
      {/* HEADER: Başlık ve Kontroller */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>Satış Pipeline</h1>
          {/* Veri yüklenirken kullanıcıya bilgi ver */}
          {isLoading && (
            <span className={styles.loadingBadge}>
              <RefreshCw size={14} className={styles.spin} /> Senkronize ediliyor...
            </span>
          )}
        </div>
        
        {/* SIDEBAR TOGGLE: Müşteri Havuzu & AI Paneli */}
        <button className={styles.sidebarToggle} onClick={openGlobalSidebar}>
            <Menu size={20} /> 
            <span>Müşteri Havuzu & AI</span>
        </button>
      </header>

      {/* MAIN CONTENT: Kanban Tahtası */}
      <main className={styles.boardWrapper}>
        <CrmBoard />
      </main>

      {/* SIDEBAR CONTAINER: Duruma göre Havuz veya Detay gösterir */}
      <CrmSidebar />

    </div>
  );
}