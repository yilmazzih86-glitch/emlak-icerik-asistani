'use client';

import React, { useState } from 'react';
import { useCrmStore } from '../../hooks/useCrmStore';
import styles from './CrmSidebar.module.scss'; // Ortak stilleri kullanabiliriz
import { Search, User, ChevronRight } from 'lucide-react';

export default function SidebarGlobal() {
  const { customers, openCustomerDetail } = useCrmStore();
  const [searchTerm, setSearchTerm] = useState('');

  // Arama Filtresi
  const filteredCustomers = customers.filter(c => 
    c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  return (
    <div className={styles.globalContainer}>
      {/* Üst Arama Alanı */}
      <div className={styles.searchHeader}>
        <h2>Müşteri Havuzu ({customers.length})</h2>
        <div className={styles.inputWrapper}>
          <Search size={16} className={styles.searchIcon}/>
          <input 
            type="text" 
            placeholder="İsim veya telefon ara..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Liste */}
      <div className={styles.customerList}>
        {filteredCustomers.map(customer => (
          <div 
            key={customer.id} 
            className={styles.customerRow}
            onClick={() => openCustomerDetail(customer.id)}
          >
            <div className={styles.avatar}>
              <User size={18} />
            </div>
            <div className={styles.info}>
              <span className={styles.name}>{customer.full_name}</span>
              <span className={styles.phone}>{customer.phone}</span>
            </div>
            <ChevronRight size={16} className={styles.arrow} />
          </div>
        ))}
        
        {filteredCustomers.length === 0 && (
          <div className={styles.emptyState}>Müşteri bulunamadı.</div>
        )}
      </div>
    </div>
  );
}