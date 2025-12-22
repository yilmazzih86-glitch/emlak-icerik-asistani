// features/crm/components/CrmSidebar/SidebarGlobal.tsx

import React, { useState } from 'react';
import { useCrmStore } from '../../hooks/useCrmStore';
import { crmService } from '../../api/crmService';
import styles from './CrmSidebar.module.scss'; // Ortak stil dosyası
import { UserPlus, Trash2, Bot, Users, Search, MessageSquare, Activity, UserCheck } from 'lucide-react';

export default function SidebarGlobal() {
  const { customers, addCustomerToPipeline, openCustomerDetail, fetchInitialData } = useCrmStore();
  const [activeTab, setActiveTab] = useState<'pool' | 'ai'>('pool');
  const [isProcessing, setIsProcessing] = useState(false);

  // Müşteri Silme
  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Bu müşteriyi ve ilişkili tüm fırsatları silmek istediğinize emin misiniz?')) {
      await crmService.deleteCustomer(id);
      fetchInitialData(); // Listeyi yenile
    }
  };

  // Müşteriyi Pipeline'a (Fırsatlara) Aktarma
  const handleAddToPipeline = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setIsProcessing(true);
    try {
      await addCustomerToPipeline(id);
      alert("Müşteri başarıyla Fırsatlar (Pipeline) tablosuna eklendi!");
    } catch (error) {
      console.error(error);
      alert("Bir hata oluştu.");
    } finally {
      setIsProcessing(false);
    }
  };

  // AI Aracı: Takip & Sessizlik Algılama (Örnek Fonksiyon)
  const handleSilenceDetection = async () => {
    setIsProcessing(true);
    try {
        // Burada backend'e tüm pipeline'ı taraması için istek atılır
        const res = await fetch('/api/crm/ai-orchestrator', {
            method: 'POST',
            body: JSON.stringify({ mode: 'silence_detection' })
        });
        const data = await res.json();
        alert(data.message || "Riskli müşteriler tarandı ve bildirimler oluşturuldu.");
    } catch (e) {
        alert("Otomasyon hatası");
    } finally {
        setIsProcessing(false);
    }
  };

  return (
    <div className={styles.sidebarContent}>
      {/* Üst Sekmeler */}
      <div className={styles.globalTabs}>
        <button 
          onClick={() => setActiveTab('pool')} 
          className={`${styles.tabBtn} ${activeTab === 'pool' ? styles.active : ''}`}
        >
          <Users size={16} /> Müşteri Havuzu
        </button>
        <button 
          onClick={() => setActiveTab('ai')} 
          className={`${styles.tabBtn} ${activeTab === 'ai' ? styles.active : ''}`}
        >
          <Bot size={16} /> AI Araçları
        </button>
      </div>

      {/* İÇERİK: Müşteri Havuzu */}
      {activeTab === 'pool' && (
        <div className={styles.listContainer}>
          {customers.length === 0 ? (
            <p className={styles.emptyState}>Henüz müşteri yok.</p>
          ) : (
            customers.map(customer => (
              <div 
                key={customer.id} 
                className={styles.customerRow} 
                onClick={() => openCustomerDetail(customer.id)} // Tıklayınca Detay Moduna geçer
              >
                <div className={styles.info}>
                  <span className={styles.name}>{customer.full_name}</span>
                  <span className={styles.sub}>{customer.phone}</span>
                </div>
                <div className={styles.actions}>
                  <button 
                    onClick={(e) => handleAddToPipeline(e, customer.id)} 
                    title="Fırsata Dönüştür"
                    disabled={isProcessing}
                    className={styles.actionBtn}
                  >
                    <UserPlus size={16} />
                  </button>
                  <button 
                    onClick={(e) => handleDelete(e, customer.id)} 
                    title="Sil" 
                    className={`${styles.actionBtn} ${styles.danger}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* İÇERİK: AI Araçları */}
      {activeTab === 'ai' && (
        <div className={styles.aiToolsList}>
          
          <div className={styles.aiToolCard}>
            <div className={styles.aiHeader}>
                <MessageSquare className={styles.aiIcon} />
                <h5>1️⃣ Mesaj Hazırlama</h5>
            </div>
            <p>Müşteri etkileşimlerini analiz eder, WhatsApp taslağı hazırlar.</p>
            <small>Kullanım: Müşteri detay sayfasından erişilir.</small>
          </div>

          <div className={styles.aiToolCard}>
            <div className={styles.aiHeader}>
                <Search className={styles.aiIcon} />
                <h5>2️⃣ Akıllı Eşleştirme</h5>
            </div>
            <p>Kriterlere en uygun portföyleri skorlar ve listeler.</p>
            <small>Kullanım: Müşteri detay sayfasından erişilir.</small>
          </div>

          <div className={styles.aiToolCard} onClick={handleSilenceDetection} style={{cursor: 'pointer'}}>
            <div className={styles.aiHeader}>
                <Activity className={styles.aiIcon} />
                <h5>3️⃣ Takip & Sessizlik Algılama</h5>
            </div>
            <p>Uzun süre temas kurulmamış veya riskli müşterileri tespit eder.</p>
            <button className={styles.runBtn} disabled={isProcessing}>
                {isProcessing ? 'Taranıyor...' : 'Taramayı Başlat'}
            </button>
          </div>

          <div className={styles.aiToolCard}>
            <div className={styles.aiHeader}>
                <UserCheck className={styles.aiIcon} />
                <h5>4️⃣ Satış Sonrası İlişki</h5>
            </div>
            <p>Satış sonrası düzenli temas ve kutlama mesajları önerir.</p>
          </div>

          <div className={styles.aiToolCard}>
            <div className={styles.aiHeader}>
                <Bot className={styles.aiIcon} />
                <h5>5️⃣ Danışman İçgörü</h5>
            </div>
            <p>Müşteri sürecini özetler ve "Sonraki Adım" önerisi sunar.</p>
          </div>

        </div>
      )}
    </div>
  );
}