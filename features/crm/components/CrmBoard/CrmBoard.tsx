// features/crm/components/CrmBoard/CrmBoard.tsx

import React, { useState, DragEvent } from 'react';
import { useCrmStore } from '@/features/crm/hooks/useCrmStore';
import { STAGES, STAGE_LABELS, PipelineStage, CrmDeal } from '@/features/crm/api/types';
import { Plus, MoreHorizontal, Calendar, TrendingUp } from 'lucide-react';
import NewDealModal from '../NewDealModal/NewDealModal';
import styles from './CrmBoard.module.scss';

export default function CrmBoard() {
  const { deals, moveDealOptimistic, openCustomerDetail } = useCrmStore();
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  
  // Sürüklenen Kartın ID'sini tut
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null);

  // --- DRAG & DROP HANDLERS ---
  const handleDragStart = (e: DragEvent, dealId: string) => {
    setDraggedDealId(dealId);
    e.dataTransfer.effectAllowed = 'move';
    // Görünmez hayalet resim ayarlanabilir ama default tarayıcı davranışı yeterli
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault(); // Drop'a izin ver
  };

  const handleDrop = (e: DragEvent, targetStage: PipelineStage) => {
    e.preventDefault();
    if (draggedDealId) {
      moveDealOptimistic(draggedDealId, targetStage);
      setDraggedDealId(null);
    }
  };

  // Helper: Para birimi
  const formatMoney = (amount?: number) => {
    if (!amount) return '';
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className={styles.boardContainer}>
      
      {/* Üst Bar / Filtreler (Genişletilebilir) */}
      <div className={styles.boardHeader}>
        <div className={styles.stats}>
          <span>Toplam Fırsat: <strong>{deals.length}</strong></span>
          {/* İleride buraya toplam beklenen ciro da eklenebilir */}
        </div>
        <button className={styles.newDealBtn} onClick={() => setIsDealModalOpen(true)}>
          <Plus size={16} /> Yeni Fırsat
        </button>
      </div>

      {/* KANBAN SÜTUNLARI */}
      <div className={styles.columnsWrapper}>
        {STAGES.map((stage) => {
          // Bu aşamadaki fırsatları filtrele
          const stageDeals = deals.filter(d => d.stage === stage);
          
          return (
            <div 
              key={stage} 
              className={styles.column}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage)}
            >
              {/* Sütun Başlığı */}
              <div className={styles.columnHeader}>
                <span className={styles.stageTitle}>{STAGE_LABELS[stage]}</span>
                <span className={styles.countBadge}>{stageDeals.length}</span>
              </div>

              {/* Sütun İçeriği */}
              <div className={styles.columnContent}>
                {stageDeals.map((deal) => (
                  <div
                    key={deal.id}
                    className={styles.dealCard}
                    draggable
                    onDragStart={(e) => handleDragStart(e, deal.id)}
                    onClick={() => openCustomerDetail(deal.customer_id, deal.id)}
                  >
                    <div className={styles.cardHeader}>
                      <span className={styles.customerName}>
                        {deal.customers?.full_name || 'İsimsiz Müşteri'}
                      </span>
                      <button className={styles.moreBtn}><MoreHorizontal size={14}/></button>
                    </div>

                    {deal.portfolios && (
                      <div className={styles.portfolioInfo}>
                        <span className={styles.pTitle}>{deal.portfolios.title}</span>
                      </div>
                    )}

                    <div className={styles.cardFooter}>
                      <span className={styles.price}>
                        {formatMoney(deal.expected_amount)}
                      </span>
                      <span className={styles.date}>
                        {new Date(deal.created_at).toLocaleDateString('tr-TR', {day:'numeric', month:'short'})}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL */}
      <NewDealModal 
        isOpen={isDealModalOpen} 
        onClose={() => setIsDealModalOpen(false)} 
      />
    </div>
  );
}