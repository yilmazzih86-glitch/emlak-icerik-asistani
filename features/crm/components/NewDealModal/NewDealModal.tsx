// features/crm/components/NewDealModal/NewDealModal.tsx
'use client';
import React, { useState } from 'react';
import { useCrmStore } from '../../hooks/useCrmStore';
import { crmService } from '../../api/crmService';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, ChevronDown, User } from 'lucide-react';
import styles from './NewDealModal.module.scss';

export function NewDealModal({ isOpen, onClose, onSuccess }: any) {
  const { customers } = useCrmStore(); // Müşteri havuzundan verileri alıyoruz
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [amount, setAmount] = useState('');

  const filtered = customers.filter(c => c.full_name.toLowerCase().includes(search.toLowerCase()));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;
    
    await crmService.createDealFull({
      customer_id: selectedId,
      stage: 'NEW',
      expected_amount: Number(amount)
    });
    onSuccess();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={styles.premiumModal}>
        <div className={styles.modalHeader}>
          <h3><User size={20}/> Yeni Fırsat Kaydı</h3>
          <button onClick={onClose}><X size={20}/></button>
        </div>

        <form onSubmit={handleCreate}>
          <div className={styles.formGroup}>
            <label>Müşteri Seçin</label>
            <div className={styles.customSelect}>
              <div className={styles.selectTrigger} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                {selectedId ? customers.find(c => c.id === selectedId)?.full_name : "Müşteri Ara..."}
                <ChevronDown size={16} />
              </div>
              
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={styles.dropdownMenu}>
                    <div className={styles.searchInner}>
                      <Search size={14} />
                      <input placeholder="Hızlı ara..." value={search} onChange={(e) => setSearch(e.target.value)} autoFocus />
                    </div>
                    <div className={styles.optionsScroll}>
                      {filtered.map(c => (
                        <div key={c.id} className={styles.option} onClick={() => { setSelectedId(c.id); setIsDropdownOpen(false); }}>
                          <span>{c.full_name}</span>
                          <small>{c.phone}</small>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Tahmini İşlem Tutarı (₺)</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
          </div>

          <button type="submit" className={styles.btnSubmit} disabled={!selectedId}>
            Fırsatı Başlat
          </button>
        </form>
      </motion.div>
    </div>
  );
}