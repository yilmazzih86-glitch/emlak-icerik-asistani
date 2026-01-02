// features/crm/components/CustomerCard/CustomerCard.tsx
'use client';

import React from 'react';
import styles from './CustomerCard.module.scss';
import { CrmDeal } from '@/features/crm/api/types';
import { Home, MapPin, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/Badge/Badge';

interface Props {
  deal: CrmDeal;
  // image_7581c7'deki eksik prop hatalarını gideren tanımlar
  onClick?: () => void; 
  onWhatsApp?: (phone: string) => void;
}

export const CustomerCard = ({ deal, onClick }: Props) => {
  const customer = deal.customers; 
  const portfolio = deal.portfolios;

  return (
    <div className={styles.card} onClick={onClick}>
      {/* 1. Üst Kısım: Ad Soyad ve Müşteri Tipi */}
      <div className={styles.header}>
        <div className={styles.mainInfo}>
          <h4 className={styles.name}>{customer?.full_name || 'İsimsiz Müşteri'}</h4>
          {customer?.type && (
             <span className={styles.typeBadge}>
               {customer.type === 'sale' ? 'Alıcı' : 'Kiracı'}
             </span>
          )}
          <Badge variant={customer?.type === 'sale' ? 'success' : 'purple'}>
            {customer?.type === 'sale' ? 'Alıcı' : 'Kiracı'}
          </Badge>
        </div>
      </div>

      {/* 2. Orta Kısım: Bütçe ve Lokasyon Bilgileri */}
      <div className={styles.details}>
        <div className={styles.detailRow}>
          <Tag size={14} />
          <span className={styles.budget}>
            {customer?.budget_min?.toLocaleString()} - {customer?.budget_max?.toLocaleString()} ₺
          </span>
        </div>
        
        <div className={styles.detailRow}>
          <MapPin size={14} />
          <span className={styles.location}>
            {customer?.interested_cities?.join(', ')} / {customer?.interested_districts?.join(', ')}
          </span>
        </div>
      </div>

      {/* 3. Alt Kısım: Bağlı Portföy (Varsa) */}
      {portfolio ? (
        <div className={styles.portfolioLink}>
          <Home size={14} />
          <div className={styles.portfolioInfo}>
            <span className={styles.portfolioTitle}>{portfolio.title}</span>
            <span className={styles.portfolioPrice}>{portfolio.price.toLocaleString()} ₺</span>
          </div>
        </div>
      ) : (
        <div className={styles.noPortfolio}>
          <Home size={14} />
          <span>Henüz bir portföy bağlanmadı</span>
        </div>
      )}
    </div>
  );
};