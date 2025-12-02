"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { X, CheckCircle2, Circle, Calendar, Plus, Clock, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CrmTask, CrmAppointment, Customer } from "@/types";

interface AgendaPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AgendaPanel({ isOpen, onClose }: AgendaPanelProps) {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<'tasks' | 'appointments'>('tasks');
  
  // Veri Stateleri
  const [tasks, setTasks] = useState<CrmTask[]>([]);
  const [appointments, setAppointments] = useState<CrmAppointment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);

  // --- GÖREV EKLEME STATE ---
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDate, setNewTaskDate] = useState("");
  const [newTaskCustomer, setNewTaskCustomer] = useState("");

  // --- RANDEVU EKLEME STATE (Eksik olan buydu) ---
  const [isAddingApp, setIsAddingApp] = useState(false);
  const [newAppTitle, setNewAppTitle] = useState("");
  const [newAppDate, setNewAppDate] = useState("");
  const [newAppTime, setNewAppTime] = useState("");
  const [newAppLocation, setNewAppLocation] = useState("");
  const [newAppCustomer, setNewAppCustomer] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchData();
      fetchCustomers();
    }
  }, [isOpen, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (activeTab === 'tasks') {
      const { data } = await supabase.from('crm_tasks').select('*, customers(full_name)').eq('assigned_to', user.id).order('due_date', { ascending: true });
      if (data) setTasks(data as any);
    } else {
      const { data } = await supabase.from('crm_appointments').select('*, customers(full_name)').eq('created_by', user.id).order('appointment_date', { ascending: true });
      if (data) setAppointments(data as any);
    }
    setLoading(false);
  };

  const fetchCustomers = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if(user) {
       const { data } = await supabase.from('customers').select('id, full_name').eq('user_id', user.id);
       if(data) setCustomers(data as any);
    }
  }

  // --- GÖREV KAYDETME ---
  const handleAddTask = async () => {
    if(!newTaskTitle) return;
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase.from('crm_tasks').insert({
      assigned_to: user!.id,
      title: newTaskTitle,
      due_date: newTaskDate || null,
      customer_id: newTaskCustomer || null,
      is_completed: false
    });
    
    setIsAddingTask(false);
    setNewTaskTitle(""); setNewTaskDate(""); setNewTaskCustomer("");
    fetchData();
  };

  // --- RANDEVU KAYDETME ---
  const handleAddAppointment = async () => {
    if(!newAppTitle || !newAppDate || !newAppTime) return alert("Başlık, tarih ve saat zorunludur.");
    
    const { data: { user } } = await supabase.auth.getUser();
    const dateTimeString = `${newAppDate}T${newAppTime}:00`;
    
    await supabase.from('crm_appointments').insert({
      created_by: user!.id,
      title: newAppTitle,
      appointment_date: new Date(dateTimeString).toISOString(),
      customer_id: newAppCustomer || null,
      location: newAppLocation
    });
    
    setIsAddingApp(false);
    setNewAppTitle(""); setNewAppDate(""); setNewAppTime(""); setNewAppLocation(""); setNewAppCustomer("");
    fetchData();
  };

  const toggleTask = async (id: string, current: boolean) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, is_completed: !current } : t));
    await supabase.from('crm_tasks').update({ is_completed: !current }).eq('id', id);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="panel-backdrop"/>
          
          <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className="panel-sidebar">
            {/* Header */}
            <div className="panel-header">
              <h2>Ajanda & Görevler</h2>
              <button onClick={onClose} className="close-btn"><X size={20}/></button>
            </div>

            {/* Tabs */}
            <div className="panel-tabs">
              <button onClick={() => setActiveTab('tasks')} className={`tab-btn ${activeTab === 'tasks' ? 'active-purple' : ''}`}>Görevler</button>
              <button onClick={() => setActiveTab('appointments')} className={`tab-btn ${activeTab === 'appointments' ? 'active-orange' : ''}`}>Randevular</button>
            </div>
            
            {/* Content */}
            <div className="panel-content custom-scrollbar">
              
              {/* --- 1. GÖREVLER SEKMESİ --- */}
              {activeTab === 'tasks' && (
                <>
                  <div className="mb-4">
                    {!isAddingTask ? (
                      <button onClick={() => setIsAddingTask(true)} className="btn-add-new purple"><Plus size={16}/> Yeni Görev Ekle</button>
                    ) : (
                      <div className="quick-add-form">
                        <input type="text" placeholder="Görev Başlığı..." value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} className="form-input mb-2"/>
                        <div className="row mb-2">
                          <input type="date" value={newTaskDate} onChange={e => setNewTaskDate(e.target.value)} className="form-input"/>
                          <select value={newTaskCustomer} onChange={e => setNewTaskCustomer(e.target.value)} className="form-input">
                            <option value="">Müşteri Seç (Opsiyonel)</option>
                            {customers.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={handleAddTask} className="btn-save-mini">Ekle</button>
                          <button onClick={() => setIsAddingTask(false)} className="btn-cancel-mini">İptal</button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="list-container">
                    {tasks.map(task => (
                       <div key={task.id} className={`task-item ${task.is_completed ? 'completed' : ''}`}>
                          <button onClick={() => toggleTask(task.id, task.is_completed)} className="check-btn">
                            {task.is_completed ? <CheckCircle2 size={20} className="text-green"/> : <Circle size={20}/>}
                          </button>
                          <div className="info">
                            <h4 className="title">{task.title}</h4>
                            {task.customers && <p className="sub-info purple">👤 {task.customers.full_name}</p>}
                            {task.due_date && <p className="sub-info gray"><Clock size={12}/> {new Date(task.due_date).toLocaleDateString('tr-TR')}</p>}
                          </div>
                       </div>
                    ))}
                  </div>
                </>
              )}

              {/* --- 2. RANDEVULAR SEKMESİ (BURASI EKSİKTİ, ŞİMDİ EKLENDİ) --- */}
              {activeTab === 'appointments' && (
                <>
                   <div className="mb-4">
                    {!isAddingApp ? (
                      // Buradaki buton sayesinde form açılıyor
                      <button onClick={() => setIsAddingApp(true)} className="btn-add-new orange"><Plus size={16}/> Yeni Randevu Ekle</button>
                    ) : (
                      // Form Alanı
                      <div className="quick-add-form">
                        <input type="text" placeholder="Randevu Başlığı (Örn: Ev Gösterimi)" value={newAppTitle} onChange={e => setNewAppTitle(e.target.value)} className="form-input mb-2"/>
                        
                        <div className="row mb-2">
                          <input type="date" value={newAppDate} onChange={e => setNewAppDate(e.target.value)} className="form-input"/>
                          <input type="time" value={newAppTime} onChange={e => setNewAppTime(e.target.value)} className="form-input"/>
                        </div>

                        <div className="row mb-2">
                          <input type="text" placeholder="Konum (Örn: Ofis)" value={newAppLocation} onChange={e => setNewAppLocation(e.target.value)} className="form-input"/>
                          <select value={newAppCustomer} onChange={e => setNewAppCustomer(e.target.value)} className="form-input">
                            <option value="">Müşteri Seç</option>
                            {customers.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                          </select>
                        </div>

                        <div className="flex gap-2">
                          <button onClick={handleAddAppointment} className="btn-save-mini" style={{backgroundColor: '#f97316'}}>Ekle</button>
                          <button onClick={() => setIsAddingApp(false)} className="btn-cancel-mini">İptal</button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="list-container">
                    {appointments.map(app => (
                       <div key={app.id} className="appointment-item">
                          <div className="app-header">
                            <h4>{app.title}</h4>
                            <span className="time-badge">{new Date(app.appointment_date).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}</span>
                          </div>
                          <p className="app-date"><Calendar size={12}/> {new Date(app.appointment_date).toLocaleDateString('tr-TR')}</p>
                          {app.customers && <p className="app-user">👤 {app.customers.full_name}</p>}
                          {app.location && <p className="app-location">📍 {app.location}</p>}
                       </div>
                    ))}
                  </div>
                </>
              )}

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}