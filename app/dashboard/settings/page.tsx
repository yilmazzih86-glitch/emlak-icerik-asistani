"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User, Building2, Phone, Save, Loader2, Camera, Trash2 } from "lucide-react";

export default function SettingsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [formData, setFormData] = useState<{
    full_name: string;
    agency_name: string;
    phone: string;
    avatar_url: string | null; // <-- İşte sihirli değnek burası: Hem string hem null olabilir dedik.
  }>({
    full_name: "",
    agency_name: "",
    phone: "",
    avatar_url: null // Başlangıç değeri
  });

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);

      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) {
        setFormData({
          full_name: data.full_name || "",
          agency_name: data.agency_name || "",
          phone: data.phone || "",
          avatar_url: data.avatar_url || null
        });
      }
      setLoading(false);
    }
    getProfile();
  }, []);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          agency_name: formData.agency_name,
          phone: formData.phone,
          avatar_url: formData.avatar_url
        })
        .eq('id', user.id);

      if (error) throw error;
      alert("Profil başarıyla güncellendi! 🎉");
      window.location.reload(); 
    } catch (error) {
      alert("Hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  const uploadAvatar = async (event: any) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setFormData({ ...formData, avatar_url: data.publicUrl });

    } catch (error: any) {
      alert('Resim yüklenirken hata: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if(!confirm("Profil fotoğrafını kaldırmak istediğinize emin misiniz?")) return;
    setFormData({ ...formData, avatar_url: null });
  };

  if (loading) return <div className="p-8 text-white flex items-center gap-2"><Loader2 className="animate-spin"/> Yükleniyor...</div>;

  return (
    <div className="max-w-5xl mx-auto animate-in pt-6 pb-20">
      
      <div className="mb-8 border-b border-white/10 pb-6">
        <h1 className="text-3xl font-bold text-white tracking-tight">Hesap Ayarları</h1>
        <p className="text-gray-400 mt-2 text-lg">Profil bilgilerinizi ve ofis detaylarınızı buradan yönetin.</p>
      </div>

      <div className="settings-grid">
        
        {/* --- SOL TARAF: PROFİL KARTI --- */}
        <div className="profile-card">
          <div className="avatar-circle avatar-lg shadow-2xl mb-4 bg-gray-900/50">
            {formData.avatar_url ? (
              <img 
                src={formData.avatar_url} 
                alt="Avatar" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            ) : (
              <span className="text-5xl font-bold text-gray-600">
                {formData.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <h3 className="mb-1">{formData.full_name || "İsimsiz Kullanıcı"}</h3>
          <p className="mb-6 opacity-70">{formData.agency_name || "Ajans Belirtilmemiş"}</p>
          
          <div className="flex items-center gap-3 w-full px-2">
            <label 
              htmlFor="avatar-upload" 
              className={`btn btn-outline text-xs flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border-white/10 hover:bg-white/5 hover:text-white transition-all ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <Camera size={14} className="text-orange-500" />
              {uploading ? "Yükleniyor..." : "Değiştir"}
            </label>

            {formData.avatar_url && (
              <button 
                onClick={handleRemoveAvatar}
                disabled={uploading}
                className="btn btn-outline text-xs flex items-center justify-center py-2.5 px-3 rounded-lg border-white/10 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all"
                title="Fotoğrafı Kaldır"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>

          <input 
            type="file" 
            id="avatar-upload" 
            accept="image/*" 
            onChange={uploadAvatar} 
            style={{ display: 'none' }} 
            disabled={uploading}
          />
        </div>

        {/* --- SAĞ TARAF: FORM (GÜNCELLENDİ) --- */}
        <div className="settings-form-card">
          <div className="space-y-6">
            
            {/* Ad Soyad */}
            <div className="input-group">
              <label>Ad Soyad</label>
              <div className="input-wrapper">
                <User size={18} /> 
                <input 
                  type="text" 
                  className="input-field" 
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                />
              </div>
            </div>

            {/* Ajans Adı */}
            <div className="input-group">
              <label>Emlak Ofisi / Marka Adı</label>
              <div className="input-wrapper">
                <Building2 size={18} />
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Örn: Spektrum Gayrimenkul"
                  value={formData.agency_name}
                  onChange={(e) => setFormData({...formData, agency_name: e.target.value})}
                />
              </div>
            </div>

            {/* Telefon */}
            <div className="input-group">
              <label>Telefon (WhatsApp Bağlantısı İçin)</label>
              <div className="input-wrapper">
                <Phone size={18} />
                <input 
                  type="tel" 
                  className="input-field" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>

            {/* Kaydet Butonu */}
            <div className="pt-6 mt-2 border-t border-white/10 flex justify-end">
              <button 
                onClick={handleUpdate}
                disabled={saving}
                className="btn btn-primary flex items-center gap-2 px-8 py-3 text-sm font-semibold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all"
              >
                {saving ? (
                  <><Loader2 className="animate-spin" size={18}/> Kaydediliyor...</>
                ) : (
                  <><Save size={18}/> Değişiklikleri Kaydet</>
                )}
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}