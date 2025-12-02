"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { X, Save, User, Phone, Mail, MapPin, Wallet, FileText, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface NewCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function NewCustomerModal({ isOpen, onClose, onSuccess }: NewCustomerModalProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    email: "",
    type: "buy",
    budget_max: "",
    interested_districts: "",
    notes: ""
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Oturum bulunamadı.");

      const districtsArray = formData.interested_districts
        ? formData.interested_districts.split(',').map(s => s.trim()) 
        : [];

      const { error } = await supabase.from('customers').insert({
        user_id: user.id, // Sahibi
        owner_id: user.id, // RLS için owner
        full_name: formData.full_name,
        phone: formData.phone,
        email: formData.email || null,
        type: formData.type,
        stage: 'new',
        budget_max: formData.budget_max ? Number(formData.budget_max) : null,
        interested_districts: districtsArray,
        last_note: formData.notes // last_note alanına kaydediyoruz
      });

      if (error) throw error;

      onSuccess();
      onClose();
      setFormData({ full_name: "", phone: "", email: "", type: "buy", budget_max: "", interested_districts: "", notes: "" });

    } catch (error: any) {
      alert("Hata: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="modal-content glass-panel"
      >
        <div className="modal-header">
          <h3>Yeni Müşteri Ekle</h3>
          <button onClick={onClose} className="close-btn"><X size={20}/></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body custom-scrollbar">
          <div className="form-row">
            <div className="form-group flex-1">
              <label><User size={14}/> Ad Soyad</label>
              <input required type="text" value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} />
            </div>
            <div className="form-group w-1/3">
              <label>Tipi</label>
              <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                <option value="buy">Alıcı</option><option value="sell">Satıcı</option><option value="rent">Kiracı</option>
              </select>
            </div>
          </div>
          {/* Diğer inputlar aynı mantıkla devam eder (Kısaltıldı) */}
          <div className="form-group">
             <label><Phone size={14}/> Telefon</label>
             <input required type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
          </div>
          <div className="form-group">
             <label><MapPin size={14}/> Bölgeler (Virgülle ayırın)</label>
             <input type="text" value={formData.interested_districts} onChange={(e) => setFormData({...formData, interested_districts: e.target.value})} />
          </div>
           <div className="form-group">
             <label><Wallet size={14}/> Bütçe</label>
             <input type="number" value={formData.budget_max} onChange={(e) => setFormData({...formData, budget_max: e.target.value})} />
          </div>
          <div className="form-group">
            <label><FileText size={14}/> Notlar</label>
            <textarea rows={3} value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">İptal</button>
            <button type="submit" disabled={loading} className="btn-primary">{loading ? <Loader2 className="spin"/> : "Kaydet"}</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}