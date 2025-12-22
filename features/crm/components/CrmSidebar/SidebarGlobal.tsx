'use client';

import React, { useState } from 'react';
import { useCrmStore } from '../../hooks/useCrmStore';
import { Search, User, ChevronRight, UserPlus } from 'lucide-react';
import styles from './CrmSidebar.module.scss';

export default function SidebarGlobal() {
  const { customers, openCustomerDetail } = useCrmStore();
  const [searchTerm, setSearchTerm] = useState('');

  // Arama Filtresi (İsim veya Telefon)
  const filteredCustomers = customers.filter(c => 
    c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  return (
    <div className={styles.globalContainer}>
      {/* Üst Başlık ve Arama */}
      <div className={styles.sidebarHeader}>
        <div className={styles.titleRow}>
          <h2>Müşteri Havuzu</h2>
          <span className={styles.badge}>{customers.length} Kayıt</span>
        </div>
        
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon}/>
          <input 
            type="text" 
            placeholder="İsim veya telefon ile ara..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Müşteri Listesi */}
      <div className={styles.listContainer}>
        {filteredCustomers.length > 0 ? (
          filteredCustomers.map(customer => (
            <div 
              key={customer.id} 
              className={styles.customerCard}
              onClick={() => openCustomerDetail(customer.id)}
            >
              <div className={styles.avatar}>
                {customer.full_name.charAt(0).toUpperCase()}
              </div>
              <div className={styles.mainInfo}>
                <span className={styles.name}>{customer.full_name}</span>
                <span className={styles.phone}>{customer.phone}</span>
              </div>
              <ChevronRight size={16} className={styles.arrow} />
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <p>Müşteri bulunamadı.</p>
          </div>
        )}
      </div>

      {/* Alt Sabit Buton */}
      <div className={styles.sidebarFooter}>
        <button className={styles.addBtn}>
          <UserPlus size={18} /> Yeni Müşteri Ekle
        </button>
      </div>
    </div>
  );
}