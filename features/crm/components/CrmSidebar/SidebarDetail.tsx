import React, { useEffect, useState } from 'react';
import styles from './CrmSidebar.module.scss';
import { useCrmStore } from '../../hooks/useCrmStore';
import { crmService } from '../../api/crmService';
import { Customer, Task, Activity, Appointment } from '../../api/types';
import { Button } from '@/components/ui/Button/Button';

// DÜZELTME: 'export default function' olarak değiştirildi
export default function SidebarDetail() {
  const { 
    selectedCustomerId, 
    activeDetailTab, 
    setDetailTab, 
    resetSelection,
  } = useCrmStore();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedCustomerId) return;
      setIsLoading(true);
      try {
        const [custData, taskData, actData, appData] = await Promise.all([
          crmService.getCustomerById(selectedCustomerId),
          crmService.getCustomerTasks(selectedCustomerId),
          crmService.getCustomerActivities(selectedCustomerId),
          crmService.getCustomerAppointments(selectedCustomerId)
        ]);
        setCustomer(custData);
        setTasks(taskData);
        setActivities(actData);
        setAppointments(appData);
      } catch (error) {
        console.error("Detay verileri çekilemedi:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [selectedCustomerId]);

  const handleCreateDeal = async () => {
    if (!customer) return;
    setIsActionLoading(true);
    try {
      const mockUserId = '2ffee494-c974-4c87-8724-0e1bf543890e'; 
      await crmService.createDeal(customer.id, mockUserId);
      alert("Müşteri pipeline'a aktarıldı!");
    } catch (error) {
      alert("Hata oluştu.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!confirm("Bu müşteriyi silmek istediğinize emin misiniz?")) return;
    setIsActionLoading(true);
    try {
      await crmService.deleteCustomer(selectedCustomerId!);
      resetSelection();
    } catch (error) {
      alert("Silme başarısız.");
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) return <div style={{padding:'2rem'}}>Yükleniyor...</div>;
  if (!customer) return <div style={{padding:'2rem'}}>Müşteri bulunamadı.</div>;

  return (
    <>
      <div className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={resetSelection} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.2rem' }}>←</button>
          <div>
            <h2 style={{ fontSize: '1.1rem', margin: 0 }}>{customer.full_name}</h2>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{customer.status}</span>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleDeleteCustomer} disabled={isActionLoading}>Sil</Button>
      </div>

      <div className={styles.tabs}>
        <button className={activeDetailTab === 'overview' ? styles.active : ''} onClick={() => setDetailTab('overview')}>Genel</button>
        <button className={activeDetailTab === 'tasks' ? styles.active : ''} onClick={() => setDetailTab('tasks')}>Görev</button>
        <button className={activeDetailTab === 'activities' ? styles.active : ''} onClick={() => setDetailTab('activities')}>Aktivite</button>
        <button className={activeDetailTab === 'appointments' ? styles.active : ''} onClick={() => setDetailTab('appointments')}>Randevu</button>
      </div>

      <div className={styles.content}>
        {activeDetailTab === 'overview' && (
          <div className={styles.infoCard}>
             <div className={styles.infoRow}><span className={styles.label}>Telefon:</span><span>{customer.phone}</span></div>
             <div className={styles.infoRow}><span className={styles.label}>Bütçe:</span><span>{customer.budget_max} ₺</span></div>
             
             <div className={styles.sectionTitle} style={{marginTop:'1.5rem'}}>Yapay Zeka Asistanı</div>
             <div className={styles.aiGrid}>
                <Button variant="outline" style={{ width: '100%', justifyContent:'flex-start' }}>💬 Mesaj Hazırla</Button>
                <Button variant="outline" style={{ width: '100%', justifyContent:'flex-start' }}>🏠 Portföy Eşleştir</Button>
                <Button variant="outline" style={{ width: '100%', justifyContent:'flex-start' }}>🔔 Takip Analizi</Button>
             </div>

             <div style={{ marginTop: '2rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                <Button variant="primary" style={{ width: '100%' }} onClick={handleCreateDeal} disabled={isActionLoading}>
                    🚀 Pipeline'a Aktar
                </Button>
            </div>
          </div>
        )}
        {activeDetailTab === 'tasks' && <div>Görev Listesi...</div>}
        {activeDetailTab === 'activities' && <div>Aktivite Geçmişi...</div>}
        {activeDetailTab === 'appointments' && <div>Randevular...</div>}
      </div>
    </>
  );
};