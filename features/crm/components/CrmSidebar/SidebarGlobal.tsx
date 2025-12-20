import React, { useEffect, useState } from 'react';
import styles from './CrmSidebar.module.scss';
import { useCrmStore } from '../../hooks/useCrmStore';
import { crmService } from '../../api/crmService';
import { Customer } from '../../api/types';
import { Button } from '@/components/ui/Button/Button';
import { Avatar } from '@/components/ui/Avatar/Avatar'; 
import { NewCustomerModal } from '../NewCustomerModal/NewCustomerModal';

export const SidebarGlobal = () => {
  const { activeGlobalTab, setGlobalTab, selectCustomer } = useCrmStore();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const data = await crmService.getCustomers();
      setCustomers(data || []);
    } catch (error) {
      console.error("Müşteri listesi çekilemedi:", error);
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeGlobalTab === 'pool') {
      fetchCustomers();
    }
  }, [activeGlobalTab]);

  return (
    <>
      <div className={styles.header}>
        <h2>CRM Paneli</h2>
      </div>

      <div className={styles.tabs}>
        <button 
          className={activeGlobalTab === 'pool' ? styles.active : ''} 
          onClick={() => setGlobalTab('pool')}
        >
          Müşteri Havuzu {customers.length > 0 && `(${customers.length})`}
        </button>
        <button 
          className={activeGlobalTab === 'ai-tools' ? styles.active : ''} 
          onClick={() => setGlobalTab('ai-tools')}
        >
          Yapay Zeka Araçları
        </button>
      </div>

      <div className={styles.content}>
        
        {/* TAB 1: MÜŞTERİ HAVUZU */}
        {activeGlobalTab === 'pool' && (
          <div className={styles.poolList}>
            {isLoading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                Yükleniyor...
              </div>
            ) : customers.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                <p>Henüz kayıtlı müşteri yok.</p>
              </div>
            ) : (
              customers.map((customer) => (
                <div 
                  key={customer.id} 
                  className={styles.customerItem}
                  onClick={() => selectCustomer(customer.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    
                    {/* AVATAR DÜZELTME: name prop'u eklendi */}
                    <div style={{ width: '40px', height: '40px' }}>
                      {customer.avatar_url ? (
                        <Avatar 
                            src={customer.avatar_url} 
                            name={customer.full_name} 
                        />
                      ) : (
                        // Resim yoksa baş harf gösteren daire
                        <div style={{ 
                           width: '100%', 
                           height: '100%', 
                           background: '#e2e8f0', 
                           borderRadius: '50%', 
                           display: 'flex', 
                           alignItems: 'center', 
                           justifyContent: 'center',
                           color: '#475569', 
                           fontWeight: 600,
                           fontSize: '0.9rem'
                        }}>
                           {customer.full_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    
                    <div className={styles.info}>
                      <h4>{customer.full_name}</h4>
                      <p>{customer.phone}</p>
                      {customer.budget_max && (
                        <span style={{ 
                            fontSize: '0.75rem', color: '#2563eb', 
                            background: '#eff6ff', padding: '2px 6px', 
                            borderRadius: '4px', marginTop: '4px', 
                            display: 'inline-block' 
                        }}>
                          Max: {customer.budget_max.toLocaleString('tr-TR')} ₺
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      selectCustomer(customer.id);
                    }}
                  >
                    Detay
                  </Button>
                </div>
              ))
            )}
            
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <Button 
                variant="primary" 
                style={{ width: '100%' }}
                onClick={() => setIsModalOpen(true)}
              >
                + Yeni Müşteri Ekle
              </Button>
            </div>
          </div>
        )}

        {/* TAB 2: AI ARAÇLARI */}
        {activeGlobalTab === 'ai-tools' && (
          <div className={styles.aiToolsList}>
            <div className={styles.aiToolCard}>
              <h4>🤖 Müşteri Analiz Raporu</h4>
              <p>Potansiyel satış fırsatlarını raporlar.</p>
              <Button variant="outline" size="sm" style={{ width: '100%' }}>Analizi Başlat</Button>
            </div>
            
            <div className={styles.aiToolCard}>
              <h4>📧 Toplu E-posta Taslağı</h4>
              <p>Kişiselleştirilmiş bülten hazırlar.</p>
              <Button variant="outline" size="sm" style={{ width: '100%' }}>Taslak Oluştur</Button>
            </div>
          </div>
        )}
      </div>

      <NewCustomerModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => fetchCustomers()}
      />
    </>
  );
};