'use client';

import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useCrmStore } from '../../hooks/useCrmStore';
import { STAGES, STAGE_LABELS, PipelineStage } from '../../api/types';
import styles from './CrmBoard.module.scss';
import { Calendar, User, MapPin, Plus, UserPlus, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NewCustomerModal } from '../NewCustomerModal/NewCustomerModal';
import { NewDealModal } from '../NewDealModal/NewDealModal';

export default function CrmBoard() {
  const { deals, fetchInitialData, moveDealOptimistic, openCustomerDetail, refreshDeals, refreshCustomers } = useCrmStore();
  const [isMounted, setIsMounted] = useState(false);
  const [modals, setModals] = useState({ customer: false, deal: false });

  useEffect(() => {
    fetchInitialData();
    setIsMounted(true);
  }, []);

  const onDragEnd = (result: DropResult) => {
    const { destination, draggableId } = result;
    if (!destination) return;
    moveDealOptimistic(draggableId, destination.droppableId as PipelineStage);
  };

  if (!isMounted) return <div className={styles.loading}>Yükleniyor...</div>;

  return (
    <div className={styles.boardWrapper}>
      <header className={styles.premiumHeader}>
        <div>
          <h1>Satış Pipeline <Sparkles size={20} className={styles.aiGlowIcon} /></h1>
          <p>Aktif fırsatlarınızı ve müşteri sürecinizi yönetin.</p>
        </div>
        <div className={styles.actions}>
          <button className={styles.btnSecondary} onClick={() => setModals({ ...modals, customer: true })}>
            <UserPlus size={18} /> Yeni Müşteri
          </button>
          <button className={styles.btnPrimary} onClick={() => setModals({ ...modals, deal: true })}>
            <Plus size={18} /> Yeni Fırsat
          </button>
        </div>
      </header>

      <div className={styles.boardContainer}>
        <DragDropContext onDragEnd={onDragEnd}>
          {STAGES.map((stage: PipelineStage) => (
            <div key={stage} className={styles.column}>
              <div className={`${styles.columnHeader} ${styles[stage.toLowerCase()]}`}>
                <h3>{STAGE_LABELS[stage]}</h3>
                <span className={styles.count}>{(deals || []).filter(d => d.stage === stage).length}</span>
              </div>
              
              <Droppable droppableId={stage}>
                {(provided, snapshot) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className={`${styles.droppableArea} ${snapshot.isDraggingOver ? styles.draggingOver : ''}`}>
                    <AnimatePresence>
                      {(deals || []).filter(d => d.stage === stage).map((deal, index) => (
                        <Draggable key={deal.id} draggableId={deal.id} index={index}>
                          {(provided, snapshot) => {
                            // DnD ve Motion çakışma çözümü
                            const { onDragStart, ...dragHandleProps } = (provided.dragHandleProps || {}) as any;
                            return (
                              <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...dragHandleProps}
                                className={`${styles.dealCard} ${snapshot.isDragging ? styles.dragging : ''}`}
                                onClick={() => openCustomerDetail(deal.customer_id, deal.id)}
                              >
                                <div className={styles.cardHeader}>
                                  <div className={styles.avatar}>{deal.customers?.full_name?.charAt(0)}</div>
                                  <span className={styles.name}>{deal.customers?.full_name}</span>
                                </div>
                                <div className={styles.cardPrice}>
                                  {deal.expected_amount?.toLocaleString() || '0'} ₺
                                </div>
                                <div className={styles.cardFooter}>
                                  <Calendar size={12}/> {new Date(deal.created_at).toLocaleDateString()}
                                </div>
                              </motion.div>
                            );
                          }}
                        </Draggable>
                      ))}
                    </AnimatePresence>
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </DragDropContext>
      </div>

      <NewCustomerModal isOpen={modals.customer} onClose={() => setModals({ ...modals, customer: false })} onSuccess={refreshCustomers} />
      <NewDealModal isOpen={modals.deal} onClose={() => setModals({ ...modals, deal: false })} onSuccess={refreshDeals} />
    </div>
  );
}