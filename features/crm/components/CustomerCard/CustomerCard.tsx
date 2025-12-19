// features/crm/components/CustomerCard/CustomerCard.tsx
'use client';

import React from 'react';
import styles from './CustomerCard.module.scss';
import { Deal } from '@/features/crm/api/types';
import { Phone, Home, BadgeDollarSign } from 'lucide-react';

interface Props {
  deal: Deal;
  // image_7581c7'deki eksik prop hatalarını gideren tanımlar
  onClick?: () => void; 
  onWhatsApp?: (phone: string) => void;
}

export const CustomerCard = ({ deal, onClick }: Props) => {
  const customer = deal.customer;

  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.header}>
        <div className={styles.avatar}>
          {customer?.full_name?.charAt(0) || '?'}
        </div>
        <div className={styles.mainInfo}>
          <h4 className={styles.name}>{customer?.full_name || 'İsimsiz Müşteri'}</h4>
          <span className={styles.phone}>{customer?.phone}</span>
        </div>
        {customer?.budget_max && (
          <div className={styles.budget}>
            ₺{customer.budget_max.toLocaleString()}
          </div>
        )}
      </div>

      <div className={styles.tags}>
        <span className={styles.tag}>{deal.stage.toUpperCase()}</span>
      </div>

      {deal.portfolio && (
        <div className={styles.portfolioLink}>
          <Home size={14} />
          <span>{deal.portfolio.title}</span>
        </div>
      )}
      
      {!deal.portfolio && (
        <div className={styles.noPortfolio}>
          <Home size={14} />
          <span>Talep: 3+1 Kadıköy...</span>
        </div>
      )}
    </div>
  );
};