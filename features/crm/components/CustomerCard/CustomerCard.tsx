import React from 'react';
import { Phone, Home, Clock } from 'lucide-react'; // Lucide ikonları
import styles from './CustomerCard.module.scss';
import { Badge } from '@/components/ui/Badge/Badge';
import { Avatar } from '@/components/ui/Avatar/Avatar';
import { Button } from '@/components/ui/Button/Button';
// Eğer henüz types dosyasını oluşturmadıysan, 'any' kullanıp geçme, aşağıda basit bir tip tanımlayalım
import { Deal } from '@/features/crm/api/types'; 

interface Props {
  deal: Deal;
  onClick: () => void;
  onWhatsApp: (phone: string) => void;
}

export const CustomerCard = ({ deal, onClick, onWhatsApp }: Props) => {
  const customerName = deal.customer?.full_name || 'İsimsiz Müşteri';
  const priceFormatted = deal.expected_amount 
    ? new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumSignificantDigits: 3 }).format(deal.expected_amount)
    : '-';

  return (
    <div className={styles.card} onClick={onClick}>
      {/* Üst Kısım: Avatar + İsim + Fiyat */}
      <div className={styles.card__header}>
        <div className={styles.card__info}>
          <Avatar name={customerName} />
          <div>
            <h4>{customerName}</h4>
            <p>{deal.customer?.phone}</p>
          </div>
        </div>
        {deal.expected_amount > 0 && (
          <span className={styles.card__price}>{priceFormatted}</span>
        )}
      </div>

      {/* Orta Kısım: Badge (Aşama) */}
      <div style={{ marginBottom: '0.5rem' }}>
        <Badge variant={
          deal.stage === 'new' ? 'info' :
          deal.stage === 'closed_won' ? 'success' :
          deal.stage === 'closed_lost' ? 'danger' : 'warning'
        }>
          {deal.stage.toUpperCase().replace('_', ' ')}
        </Badge>
      </div>

      {/* Alt Kısım: Portföy Bilgisi ve Aksiyon */}
      <div className={styles.card__details}>
        <div className={styles.card__portfolio}>
          {deal.portfolio ? (
            <>
              <Home size={14} />
              <span>{deal.portfolio.title.substring(0, 20)}...</span>
            </>
          ) : (
            <span>Talep: 3+1 Kadıköy...</span> // (Dinamik hale gelecek)
          )}
        </div>

        <div className={styles.card__actions}>
          <Button 
            variant="ghost" 
            size="sm" // Button bileşenine size prop'u eklememiz gerekebilir
            onClick={(e) => {
              e.stopPropagation();
              if (deal.customer?.phone) onWhatsApp(deal.customer.phone);
            }}
          >
            <Phone size={16} className="text-green-500" /> {/* WhatsApp Yeşil */}
          </Button>
        </div>
      </div>
    </div>
  );
};