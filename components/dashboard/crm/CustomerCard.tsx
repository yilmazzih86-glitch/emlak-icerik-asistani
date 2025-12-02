"use client";

import { Phone, MapPin, Wallet, MessageCircle, Edit2, Bell } from "lucide-react";
import { motion } from "framer-motion";
import { Customer } from "@/types";

interface CustomerCardProps {
  customer: Customer;
  hasActiveTask?: boolean;
  onWhatsApp: (c: Customer) => void;
  onEdit: (c: Customer) => void;
}

export default function CustomerCard({ customer, hasActiveTask, onWhatsApp, onEdit }: CustomerCardProps) {
  
  // DÜZELTME: Fonksiyon parametresi 'stage' olarak değiştirildi
  const getStageLabel = (stage: string) => {
    const labels: Record<string, string> = {
      new: 'Yeni', 
      contacted: 'Görüşüldü', 
      viewing: 'Sunum',
      offer: 'Teklif', 
      sold: 'Satış', 
      lost: 'Olumsuz'
    };
    return labels[stage] || stage;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="crm-card group"
    >
      <div className="card-shine"></div>
      
      <div className="card-header">
        <div className="user-profile">
          <div className="avatar">
            {customer.full_name.charAt(0).toUpperCase()}
          </div>
          <div className="user-meta">
            <h3>{customer.full_name}</h3>
            <div className="badges">
               <span className={`type-badge ${customer.type}`}>
                {customer.type === 'buy' ? 'ALICI' : customer.type === 'sell' ? 'SATICI' : 'KİRACI'}
              </span>
              {/* DÜZELTME: customer.status -> customer.stage */}
              <span className={`status-badge ${customer.stage}`}>
                {getStageLabel(customer.stage)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="card-body">
        <div className="info-row">
          <Phone size={14} className="icon"/> {customer.phone}
        </div>
        {customer.budget_max && (
          <div className="info-row">
            <Wallet size={14} className="icon"/> Max {customer.budget_max.toLocaleString()} ₺
          </div>
        )}
        {customer.interested_districts && customer.interested_districts.length > 0 && (
          <div className="info-row">
            <MapPin size={14} className="icon"/> 
            <span className="truncate">{customer.interested_districts.join(', ')}</span>
          </div>
        )}
        
        {hasActiveTask && (
          <div className="task-alert">
            <Bell size={12} /> Bugün 1 görevi var
          </div>
        )}
      </div>

      <div className="card-footer">
        <button onClick={() => onWhatsApp(customer)} className="btn-action whatsapp">
          <MessageCircle size={16}/> WhatsApp
        </button>
        <button onClick={() => onEdit(customer)} className="btn-action icon-only">
          <Edit2 size={16}/>
        </button>
      </div>
    </motion.div>
  );
}