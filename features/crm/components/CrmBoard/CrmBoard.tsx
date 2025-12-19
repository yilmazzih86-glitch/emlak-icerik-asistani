// features/crm/components/CrmBoard/CrmBoard.tsx
'use client';

import React, { useState } from 'react';
import styles from './CrmBoard.module.scss';
import { CustomerCard } from '../CustomerCard/CustomerCard';
import { Deal, CrmStage } from '@/features/crm/api/types';
import { Plus, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button/Button';

// image_7fe350 ve image_751ce7'deki interface eksiklerini gideren tam tanım
interface CrmBoardProps {
  deals: Deal[];
  isLoading: boolean;
  onDealClick: (deal: Deal) => void;
  onStageChange: (dealId: string, newStage: CrmStage) => void;
  onAddDeal: (stage: CrmStage) => void;
  onWhatsAppAutomation: (deal: Deal) => Promise<void>;
  onAddDealFromPool?: (customerId: string, stage: CrmStage) => void;
}

const STAGES: { id: CrmStage; label: string }[] = [
  { id: 'new', label: 'Yeni Müşteri' },
  { id: 'contacted', label: 'Görüşüldü' },
  { id: 'presentation', label: 'Sunum Yapıldı' },
  { id: 'negotiation', label: 'Pazarlık' },
  { id: 'closed_won', label: 'Satış Başarılı' },
];

export const CrmBoard = ({ 
  deals, 
  isLoading, 
  onDealClick, 
  onStageChange, 
  onAddDeal, 
  onWhatsAppAutomation,
  onAddDealFromPool 
}: CrmBoardProps) => {
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    setDraggedDealId(dealId);
    e.dataTransfer.setData('dealId', dealId);
  };

  const handleDrop = (e: React.DragEvent, targetStage: CrmStage) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData('dealId');
    const customerId = e.dataTransfer.getData('customerId'); // image_757e44: Havuzdan drop mantığı

    if (dealId) {
      onStageChange(dealId, targetStage);
    } else if (customerId && onAddDealFromPool) {
      onAddDealFromPool(customerId, targetStage);
    }
    setDraggedDealId(null);
  };

  if (isLoading) return <div className={styles.loading}><Loader2 className="animate-spin" /></div>;

  return (
    <div className={styles.boardContainer}>
      <div className={styles.board}>
        {STAGES.map((stage) => (
          <div 
            key={stage.id} 
            className={styles.column}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, stage.id)}
          >
            <div className={styles.columnHeader}>
              <div className={styles.titleGroup}>
                <h3>{stage.label}</h3>
                <span className={styles.badge}>
                  {deals.filter(d => d.stage === stage.id).length}
                </span>
              </div>
              {/* image_7fe350'deki onAddDeal hatası giderildi */}
              <button className={styles.addBtn} onClick={() => onAddDeal(stage.id)}>
                <Plus size={18} />
              </button>
            </div>

            <div className={styles.cards}>
              {deals
                .filter((deal) => deal.stage === stage.id)
                .map((deal) => (
                  <div 
                    key={deal.id} 
                    className={styles.cardWrapper}
                    draggable 
                    onDragStart={(e) => handleDragStart(e, deal.id)}
                  >
                    <CustomerCard 
                      deal={deal} 
                      onClick={() => onDealClick(deal)} // image_7581c7 prop hatası fix
                    />
                    
                    {deal.customer?.phone && (
                      <div className={styles.cardActions}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onWhatsAppAutomation(deal);
                          }}
                          className={styles.aiButton}
                          icon={<Sparkles size={14} />}
                        >
                          AI Mesajı ile Gönder
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};