// features/crm/components/CrmBoard/CrmBoard.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import styles from './CrmBoard.module.scss';
import { useCrmStore } from '../../hooks/useCrmStore';
import { crmService } from '../../api/crmService';
import { Deal, Stage, STAGE_LABELS } from '../../api/types';
import { Button } from '@/components/ui/Button/Button';
import { NewDealModal } from '../NewDealModal/NewDealModal';

// Sütunların sırası
const STAGE_ORDER: Stage[] = ['new', 'contacted', 'presentation', 'negotiation', 'won'];

export default function CrmBoard() {
  const { selectCustomer } = useCrmStore();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDealModalOpen, setIsDealModalOpen] = useState(false); // Modal state

  // Verileri Çek
  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      const data = await crmService.getDeals();
      setDeals(data);
    } catch (error) {
      console.error('Fırsatlar yüklenemedi:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Sürükle-Bırak İşlemi
  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Geçersiz bırakma veya aynı yere bırakma
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }

    const newStage = destination.droppableId as Stage;

    // 1. Optimistic Update (Arayüzü hemen güncelle)
    const updatedDeals = deals.map(deal => 
      deal.id === draggableId ? { ...deal, stage: newStage } : deal
    );
    setDeals(updatedDeals);

    // 2. Backend Update
    try {
      await crmService.updateDealStage(draggableId, newStage);
    } catch (error) {
      console.error("Stage update failed:", error);
      fetchDeals(); // Hata varsa eski haline döndür
    }
  };

  // Deals verisini sütunlara göre grupla
  const getDealsByStage = (stage: Stage) => {
    return deals.filter(deal => deal.stage === stage);
  };

  // Toplam Beklenen Tutar Hesaplama
  const calculateTotal = (stageDeals: Deal[]) => {
    return stageDeals.reduce((acc, curr) => acc + (curr.expected_amount || 0), 0);
  };

  if (isLoading) return <div className={styles.loading}>Pipeline Yükleniyor...</div>;

  return (
    <>
      {/* Üst Bar: Yeni Fırsat Butonu */}
      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'flex-end', padding: '0 1rem' }}>
          <Button variant="primary" onClick={() => setIsDealModalOpen(true)}>
              + Yeni Fırsat Ekle
          </Button>
      </div>

      <div className={styles.boardContainer}>
        <DragDropContext onDragEnd={onDragEnd}>
          <div className={styles.columnsWrapper}>
            {STAGE_ORDER.map((stage) => {
              const stageDeals = getDealsByStage(stage);
              
              return (
                <div key={stage} className={styles.column}>
                  {/* Sütun Başlığı */}
                  <div className={styles.columnHeader}>
                    <div className={styles.headerTop}>
                      <h3>{STAGE_LABELS[stage]}</h3>
                      <span className={styles.countBadge}>{stageDeals.length}</span>
                    </div>
                    <div className={styles.headerTotal}>
                      {stageDeals.length > 0 && calculateTotal(stageDeals) > 0 
                        ? `${calculateTotal(stageDeals).toLocaleString('tr-TR')} ₺`
                        : '-'}
                    </div>
                  </div>

                  {/* Droppable Alan */}
                  <Droppable droppableId={stage}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`${styles.dealList} ${snapshot.isDraggingOver ? styles.draggingOver : ''}`}
                      >
                        {stageDeals.map((deal, index) => (
                          <Draggable key={deal.id} draggableId={deal.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`${styles.dealCard} ${snapshot.isDragging ? styles.dragging : ''}`}
                                onClick={() => selectCustomer(deal.customer_id, deal.id)} // Sidebar'ı açar
                                style={{ ...provided.draggableProps.style }}
                              >
                                <div className={styles.cardHeader}>
                                  <span className={styles.customerName}>
                                    {deal.customer?.full_name || 'İsimsiz Müşteri'}
                                  </span>
                                  {deal.probability !== undefined && deal.probability > 0 && (
                                    <span className={`${styles.probability} ${deal.probability > 70 ? styles.high : styles.low}`}>
                                      %{deal.probability}
                                    </span>
                                  )}
                                </div>
                                
                                <div className={styles.cardBody}>
                                  {deal.portfolio ? (
                                      <div className={styles.portfolioTag}>🏠 {deal.portfolio.title}</div>
                                  ) : (
                                      <div className={styles.emptyTag}>Portföy Seçilmedi</div>
                                  )}
                                  
                                  {deal.expected_amount && (
                                    <div className={styles.amount}>
                                      {deal.expected_amount.toLocaleString('tr-TR')} ₺
                                    </div>
                                  )}
                                </div>

                                <div className={styles.cardFooter}>
                                  <span className={styles.date}>
                                    {new Date(deal.updated_at).toLocaleDateString('tr-TR')}
                                  </span>
                                  {deal.customer?.avatar_url && (
                                      <img src={deal.customer.avatar_url} className={styles.miniAvatar} alt="" />
                                  )}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>

      {/* --- MODAL ENTEGRASYONU --- */}
      <NewDealModal
        isOpen={isDealModalOpen}
        onClose={() => setIsDealModalOpen(false)}
        onSuccess={() => {
            fetchDeals(); // Board'u yenile
        }}
      />
    </>
  );
}