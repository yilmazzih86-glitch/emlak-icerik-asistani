'use client';

import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useCrmStore } from '../../hooks/useCrmStore';
import { STAGE_LABELS, PipelineStage } from '../../api/types';
import styles from './CrmBoard.module.scss';
import { Calendar, User, MapPin } from 'lucide-react';

const STAGES: PipelineStage[] = ['NEW', 'CONTACT', 'PRESENTATION', 'OFFER', 'SOLD'];

export default function CrmBoard() {
  const { deals, fetchInitialData, moveDealOptimistic, openCustomerDetail } = useCrmStore();
  const [isMounted, setIsMounted] = useState(false);

  // 1. Verileri Çek
  useEffect(() => {
    fetchInitialData();
  }, []);

  // 2. Hydration Fix (Next.js için kritik: Sürükle bırak sadece client'ta çalışmalı)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 3. Sürükleme Bittiğinde Çalışacak Fonksiyon
  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Geçersiz bir yere bırakıldıysa iptal et
    if (!destination) return;

    // Aynı yere bırakıldıysa iptal et
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // Store üzerindeki Optimistic Update fonksiyonunu çağır
    moveDealOptimistic(draggableId, destination.droppableId as PipelineStage);
  };

  // 4. Safe Filtering (Hata veren kısmı düzelttik)
  const getDealsByStage = (stage: PipelineStage) => {
    // deals undefined olsa bile boş array döndürerek hatayı önler
    return (deals || []).filter(deal => deal.stage === stage);
  };

  // Server-side render sırasında DnD render etme (Hydration hatasını önler)
  if (!isMounted) return <div className={styles.loadingBoard}>Board Yükleniyor...</div>;

  return (
    <div className={styles.boardContainer}>
      <DragDropContext onDragEnd={onDragEnd}>
        {STAGES.map(stage => {
          const stageDeals = getDealsByStage(stage);
          
          return (
            <div key={stage} className={styles.column}>
              {/* Sütun Başlığı */}
              <div className={`${styles.columnHeader} ${styles[stage.toLowerCase()]}`}>
                <h3>{STAGE_LABELS[stage]}</h3>
                <span className={styles.count}>{stageDeals.length}</span>
              </div>
              
              {/* Sürükle Bırak Alanı */}
              <Droppable droppableId={stage}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`${styles.droppableArea} ${snapshot.isDraggingOver ? styles.draggingOver : ''}`}
                  >
                    {stageDeals.map((deal, index) => (
                      <Draggable key={deal.id} draggableId={deal.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`${styles.dealCard} ${snapshot.isDragging ? styles.dragging : ''}`}
                            onClick={() => openCustomerDetail(deal.customer_id, deal.id)}
                            style={{ ...provided.draggableProps.style }}
                          >
                            <div className={styles.cardHeader}>
                              <span className={styles.customerName}>
                                <User size={14}/> {deal.customers?.full_name || 'Müşteri'}
                              </span>
                            </div>
                            
                            <div className={styles.cardBody}>
                               {deal.portfolios ? (
                                  <div className={styles.portfolioBadge}>
                                      <MapPin size={12}/> 
                                      {deal.portfolios.district} - {deal.portfolios.price?.toLocaleString()} ₺
                                  </div>
                               ) : (
                                  <span className={styles.noPortfolio}>Portföy Eşleşmedi</span>
                               )}
                               
                               <div className={styles.cardFooter}>
                                  <small className={styles.date}>
                                    <Calendar size={12}/> {new Date(deal.created_at).toLocaleDateString('tr-TR')}
                                  </small>
                               </div>
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
      </DragDropContext>
    </div>
  );
}