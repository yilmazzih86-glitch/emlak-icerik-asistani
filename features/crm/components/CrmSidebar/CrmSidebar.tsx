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
      {/* 1. Karartma Perdesi (Overlay) */}
      <div 
        className={`${styles.overlay} ${isSidebarOpen ? styles.open : ''}`} 
        onClick={closeSidebar}
      />

      {/* 2. Sabit Sidebar Konteyneri */}
      <aside className={`${styles.sidebarContainer} ${isSidebarOpen ? styles.open : ''}`}>
        
        {/* Kapatma Butonu */}
        <button className={styles.closeBtn} onClick={closeSidebar}>
            <X size={20} />
        </button>

        {/* İçerik */}
        <div className={styles.sidebarBody}>
            {/* ViewMode'a göre içerik değiştir */}
            {viewMode === 'global' ? <SidebarGlobal /> : <SidebarDetail />}
        </div>

      </aside>
    </>
  );
}