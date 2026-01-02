// features/crm/components/CrmBoard/CrmBoard.tsx

import { CustomerCard } from '../CustomerCard/CustomerCard';
import React, { useState, DragEvent } from 'react';
import { useCrmStore } from '@/features/crm/hooks/useCrmStore';
import { STAGES, STAGE_LABELS, PipelineStage } from '@/features/crm/api/types';
import { Plus, Trash2 } from 'lucide-react';
import NewDealModal from '../NewDealModal/NewDealModal';
import styles from './CrmBoard.module.scss';

export default function CrmBoard() {
  const { deals, moveDealOptimistic, openCustomerDetail, deleteDeal } = useCrmStore();
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null);

  const handleDragStart = (e: DragEvent, dealId: string) => {
    setDraggedDealId(dealId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: DragEvent) => e.preventDefault();

  const handleDrop = (e: DragEvent, targetStage: PipelineStage) => {
    e.preventDefault();
    if (draggedDealId) {
      moveDealOptimistic(draggedDealId, targetStage);
      setDraggedDealId(null);
    }
  };

  return (
    <div className={styles.boardContainer}>
      <div className={styles.boardHeader}>
        <div className={styles.stats}>
          Toplam Fırsat: <strong>{deals.length}</strong>
        </div>
        <button className={styles.newDealBtn} onClick={() => setIsDealModalOpen(true)}>
          <Plus size={18} /> Yeni Fırsat
        </button>
      </div>

      <div className={styles.columnsWrapper}>
        {STAGES.map((stage) => {
          const stageDeals = deals.filter(d => d.stage === stage);
          
          return (
            <div 
              key={stage} 
              className={styles.column}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage)}
            >
              <div className={styles.columnHeader}>
                <span className={styles.stageTitle}>{STAGE_LABELS[stage]}</span>
                <span className={styles.countBadge}>{stageDeals.length}</span>
              </div>

              <div className={styles.columnContent}>
                {stageDeals.map((deal) => (
                  <div
                    key={deal.id}
                    className={styles.dealCardWrapper}
                    draggable
                    onDragStart={(e) => handleDragStart(e, deal.id)}
                  >
                    <CustomerCard 
                      deal={deal} 
                      onClick={() => openCustomerDetail(deal.customer_id, deal.id)} 
                    />

                    <button 
                      className={styles.deleteBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Bu fırsatı silmek istediğinize emin misiniz?")) {
                          deleteDeal(deal.id);
                        }
                      }}
                      title="Fırsatı Sil"
                    >
                      <Trash2 size={14}/>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <NewDealModal 
        isOpen={isDealModalOpen} 
        onClose={() => setIsDealModalOpen(false)} 
      />
    </div>
  );
}