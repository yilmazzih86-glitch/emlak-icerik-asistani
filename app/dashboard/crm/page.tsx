'use client';

import { useEffect } from 'react';
import CrmBoard from '@/features/crm/components/CrmBoard/CrmBoard';
import CrmSidebar from '@/features/crm/components/CrmSidebar/CrmSidebar'; // Tek bir import
import { useCrmStore } from '@/features/crm/hooks/useCrmStore';
import { Menu } from 'lucide-react';
import styles from './page.module.scss';

export default function CrmPage() {
  const { openGlobalSidebar } = useCrmStore();

  return (
    <div className={styles.crmLayout}>
      
      {/* HEADER */}
      <header className={styles.header}>
        <h1>Satış Pipeline</h1>
        
        {/* Sidebar Açma Butonu */}
        <button className={styles.sidebarToggle} onClick={openGlobalSidebar}>
            <Menu size={20}/> Müşteri Havuzu & AI
        </button>
      </header>

      {/* BOARD CONTENT */}
      <main className={styles.boardWrapper}>
        <CrmBoard />
      </main>

      {/* SIDEBAR (Artık kendi içinde fixed pozisyona sahip) */}
      <CrmSidebar />

    </div>
  );
}