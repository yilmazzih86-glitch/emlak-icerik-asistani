// features/crm/components/CrmSidebar/SidebarGlobal.tsx

import React, { useState, useEffect } from 'react';
import { useCrmStore } from '@/features/crm/hooks/useCrmStore';
import { Customer } from '@/features/crm/api/types';
import { Search, Plus, User, Phone, ChevronRight, Users } from 'lucide-react';
import NewCustomerModal from '../NewCustomerModal/NewCustomerModal';
import styles from './CrmSidebar.module.scss'; // Ortak stiller

export default function SidebarGlobal() {
  const { 
    customers, 
    openCustomerDetail, 
    closeSidebar, 
    searchCustomersLocal, 
    loadCustomers,
    pagination,
    isLoading 
  } = useCrmStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Arama işlemi (Debounce mantığı eklenebilir)
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    searchCustomersLocal(val);
  };

  return (
    <aside className={styles.sidebarGlobal}>
      
      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <h3><Users size={18}/> Müşteri Havuzu</h3>
          <button onClick={closeSidebar} className={styles.closeMobile}>Kapat</button>
        </div>
        
        <div className={styles.actions}>
          <div className={styles.searchBox}>
            <Search size={14} />
            <input 
              placeholder="İsim veya telefon ara..." 
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <button className={styles.addBtn} onClick={() => setIsModalOpen(true)}>
            <Plus size={16} />
          </button>
        </div>
      </header>

      {/* LISTE */}
      <div className={styles.listContainer}>
        {customers.length === 0 && !isLoading ? (
          <div className={styles.emptyState}>
            <p>Müşteri bulunamadı.</p>
          </div>
        ) : (
          customers.map((c) => (
            <div 
              key={c.id} 
              className={styles.customerRow}
              onClick={() => openCustomerDetail(c.id)}
            >
              <div className={styles.avatar}>
                {c.avatar_url ? (
                  <img src={c.avatar_url} alt={c.full_name} />
                ) : (
                  <span>{c.full_name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className={styles.info}>
                <h4>{c.full_name}</h4>
                <div className={styles.meta}>
                  <span><Phone size={10}/> {c.phone}</span>
                  {c.status && <span className={styles.tag}>{c.status}</span>}
                </div>
              </div>
              <ChevronRight size={14} className={styles.arrow} />
            </div>
          ))
        )}
        
        {/* Yükle Butonu (Pagination) */}
        {customers.length < pagination.total && !searchTerm && (
          <button 
            className={styles.loadMoreBtn}
            onClick={() => loadCustomers(pagination.page + 1)}
            disabled={isLoading}
          >
            {isLoading ? 'Yükleniyor...' : 'Daha Fazla Yükle'}
          </button>
        )}
      </div>

      {/* MODAL */}
      <NewCustomerModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </aside>
  );
}