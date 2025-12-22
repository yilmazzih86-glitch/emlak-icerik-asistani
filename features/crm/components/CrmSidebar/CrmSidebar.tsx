// features/crm/components/CrmSidebar/CrmSidebar.tsx (Eğer eksikse)

'use client';

import React from 'react';
import { useCrmStore } from '@/features/crm/hooks/useCrmStore';
import SidebarGlobal from './SidebarGlobal';
import SidebarDetail from './SidebarDetail';
import styles from './CrmSidebar.module.scss'; //

const CrmSidebar = () => {
  const { isSidebarOpen, viewMode, closeSidebar } = useCrmStore();

  return (
    <>
      {/* Overlay (Mobilde arka planı karartmak için) */}
      <div 
        className={`${styles.overlay} ${isSidebarOpen ? styles.open : ''}`} 
        onClick={closeSidebar}
      />

      {/* Sidebar Ana Kapsayıcı */}
      <aside className={`${styles.sidebarContainer} ${isSidebarOpen ? styles.open : ''}`}>
        {viewMode === 'global' ? <SidebarGlobal /> : <SidebarDetail />}
      </aside>
    </>
  );
};

export default CrmSidebar;