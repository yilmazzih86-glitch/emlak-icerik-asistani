import React, { useState } from 'react';
import styles from './CrmBoard.module.scss';
import { CustomerCard } from '../CustomerCard/CustomerCard';
import { Deal, CrmStage } from '@/features/crm/api/types';
import { Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button/Button';

const STAGES: { id: CrmStage; label: string; color: string }[] = [
  { id: 'new', label: 'Yeni Müşteri', color: '#3b82f6' },
  { id: 'contacted', label: 'Görüşüldü', color: '#f59e0b' },
  { id: 'presentation', label: 'Sunum Yapıldı', color: '#8b5cf6' },
  { id: 'negotiation', label: 'Teklif / Pazarlık', color: '#ec4899' },
  { id: 'closed_won', label: 'Satış Başarılı', color: '#10b981' },
];

interface CrmBoardProps {
  deals: Deal[];
  isLoading: boolean;
  onDealClick: (deal: Deal) => void;
  onWhatsApp: (phone: string) => void;
  onAddDeal?: (stage: CrmStage) => void;
  onStageChange?: (dealId: string, newStage: CrmStage) => void; // YENİ PROP
}

export const CrmBoard = ({ 
  deals, 
  isLoading, 
  onDealClick, 
  onWhatsApp, 
  onAddDeal,
  onStageChange 
}: CrmBoardProps) => {
  
  // Sürüklenen öğeyi takip etmek için state
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null);

  // Sürükleme Başladığında
  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    setDraggedDealId(dealId);
    e.dataTransfer.setData("dealId", dealId);
    e.dataTransfer.effectAllowed = "move";
  };

  // Sürükleme Alanın Üzerindeyken (İzin ver)
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Drop'a izin vermek için zorunlu
  };

  // Bırakıldığında (Drop)
  const handleDrop = (e: React.DragEvent, targetStage: CrmStage) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData("dealId");
    
    if (dealId && onStageChange) {
      onStageChange(dealId, targetStage);
    }
    setDraggedDealId(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 w-full text-muted">
        <Loader2 className="animate-spin mr-2" /> Yükleniyor...
      </div>
    );
  }

  return (
    <div className={styles.board}>
      {STAGES.map((stage) => {
        const stageDeals = deals.filter((d) => d.stage === stage.id);
        
        return (
          <div 
            key={stage.id} 
            className={styles.board__column}
            // Drop olayları buraya bağlanır
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stage.id)}
            style={{ 
              transition: 'background 0.2s',
              // Eğer bir şey sürükleniyorsa hedef alanları belli et (Opsiyonel UX)
            }}
          >
            <div className={styles['board__column-header']}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: stage.color }} />
                <h3>{stage.label}</h3>
              </div>
              <span className={styles['board__column-count']}>{stageDeals.length}</span>
            </div>

            <div className={styles['board__column-content']}>
              {stageDeals.map((deal) => (
                <div 
                  key={deal.id}
                  draggable // HTML5 Sürükleme özelliği
                  onDragStart={(e) => handleDragStart(e, deal.id)}
                  style={{ cursor: 'grab' }}
                >
                  <CustomerCard 
                    deal={deal} 
                    onClick={() => onDealClick(deal)}
                    onWhatsApp={onWhatsApp}
                  />
                </div>
              ))}
              
              {stageDeals.length === 0 && (
                <div className="text-center py-8 opacity-50">
                   <Button variant="ghost" size="sm" onClick={() => onAddDeal?.(stage.id)} icon={<Plus size={14}/>}>
                    Fırsat Ekle
                  </Button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};