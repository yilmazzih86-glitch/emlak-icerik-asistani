'use client';

import React from 'react';
import { useCrmStore } from '../../hooks/useCrmStore';
import SidebarGlobal from './SidebarGlobal';
import SidebarDetail from './SidebarDetail';
import styles from './CrmSidebar.module.scss';
import { X } from 'lucide-react';

export default function CrmSidebar() {
  const { isSidebarOpen, viewMode, closeSidebar } = useCrmStore();

  return (
    <>
      <div 
        className={`${styles.overlay} ${isSidebarOpen ? styles.open : ''}`} 
        onClick={closeSidebar}
      />
      
      <aside className={`${styles.sidebarContainer} ${isSidebarOpen ? styles.open : ''}`}>
        {/* Kapat butonu her zaman sağ üstte sabit */}
        <button className={styles.closeBtn} onClick={closeSidebar}>
            <X size={20} />
        </button>

        {/* İçerik viewMode'a göre değişir */}
        <div className={styles.sidebarBody}>
            {viewMode === 'global' ? <SidebarGlobal /> : <SidebarDetail />}
        </div>
      </aside>
    </>
  );
}