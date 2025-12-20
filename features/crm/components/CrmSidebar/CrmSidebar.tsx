'use client';

import React from 'react';
import styles from './CrmSidebar.module.scss';
import { useCrmStore } from '../../hooks/useCrmStore';
import { SidebarGlobal } from './SidebarGlobal';
import { SidebarDetail } from './SidebarDetail';

export const CrmSidebar = () => {
  const { isSidebarOpen, closeSidebar, viewMode } = useCrmStore();

  // Sidebar kapalıysa DOM'dan kaldırma, sadece CSS ile gizle (Animasyon için)
  // Ancak performans için conditional rendering yapılabilir.
  // Burada CSS transition kullanacağımız için HTML hep var olacak.
  
  return (
    <>
      {/* Arka plan karartma (Sadece açıksa görünür) */}
      {isSidebarOpen && (
        <div className={styles.sidebarOverlay} onClick={closeSidebar} />
      )}

      {/* Sidebar Paneli */}
      <div className={`${styles.sidebarContainer} ${isSidebarOpen ? styles.open : ''}`}>
        {/* Kapat Butonu (Absolute konumlandırılmış üst köşe için) */}
        <button 
          className={styles.closeAbsoluteBtn} 
          onClick={closeSidebar}
          style={{ 
            position: 'absolute', 
            top: '1rem', 
            right: '1rem', 
            zIndex: 60,
            background: 'none', 
            border: 'none', 
            fontSize: '1.2rem', 
            cursor: 'pointer' 
          }}
        >
          ✕
        </button>

        {/* İçerik Yönetimi */}
        {viewMode === 'global' ? (
          <SidebarGlobal />
        ) : (
          <SidebarDetail />
        )}
      </div>
    </>
  );
};