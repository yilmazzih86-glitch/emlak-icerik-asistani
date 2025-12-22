import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Motion eklendi
import { X } from 'lucide-react'; // X simgesi eklendi
import styles from './NewCustomerModal.module.scss';
import { crmService } from '../../api/crmService';
import { Button } from '@/components/ui/Button/Button';

interface NewCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const NewCustomerModal = ({ isOpen, onClose, onSuccess }: NewCustomerModalProps) => {
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    notes: '',
    budget_max: ''
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await crmService.createCustomer({
        full_name: formData.full_name,
        phone: formData.phone,
        email: formData.email,
        notes: formData.notes,
        budget_max: formData.budget_max ? Number(formData.budget_max) : undefined,
        status: 'active'
      });
      onSuccess(); 
      onClose();   
      setFormData({ full_name: '', phone: '', email: '', notes: '', budget_max: '' });
    } catch (error) {
      alert('Müşteri oluşturulurken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className={styles.modalOverlay}>
    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={styles.premiumModal}>
      <div className={styles.modalHeader}>
        <h3>Yeni Müşteri Profili</h3>
        <button onClick={onClose}><X size={20}/></button>
      </div>
      <form className={styles.premiumForm}>
        {/* Inputlar... */}
        <div className={styles.modalFooter}>
          <button type="button" onClick={onClose} className={styles.btnCancel}>İptal</button>
          <button type="submit" className={styles.btnSubmit}>Kaydet</button>
        </div>
      </form>
    </motion.div>
  </div>
);
};