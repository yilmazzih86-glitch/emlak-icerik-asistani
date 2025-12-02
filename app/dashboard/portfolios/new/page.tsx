"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Save, ArrowLeft, MapPin, DollarSign, Ruler, Home, Building, Info, Layers, FileText, Star, MessageSquare } from "lucide-react";
import Link from "next/link";

import { 
  getCities, 
  getDistrictsByCityCode, 
  getNeighbourhoodsByCityCodeAndDistrict 
} from "turkey-neighbourhoods";

const ROOM_COUNTS = ["1+0", "1+1", "2+1", "3+1", "3+2", "4+1", "4+2", "5+1", "5+2", "Villa", "Müstakil"];
const HEATING_TYPES = ["Kombi (Doğalgaz)", "Merkezi", "Merkezi (Pay Ölçer)", "Yerden Isıtma", "Klima", "Soba", "Yok"];
const BUILDING_AGES = ["Sıfır Bina", "1-5", "5-10", "10-15", "15-20", "20-25", "25-30", "30+"];
const FLOOR_LOCATIONS = ["Giriş", "Yüksek Giriş", "Bahçe Katı", "1", "2", "3", "4", "5", "6-10", "10-15", "15+", "Çatı Katı"];
const YES_NO = ["Evet", "Hayır"];

export default function NewPortfolioPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    listing_type: "sale",
    price: "",
    
    city: "",
    district: "",
    neighborhood: "",
    
    gross_m2: "",
    net_m2: "",
    room_count: "3+1",
    bathroom_count: "1",
    
    floor: "",
    total_floors: "",
    building_age: "",
    heating: "Kombi (Doğalgaz)",
    
    credit_status: "Uygun",
    furnished: "Hayır",
    in_site: "Hayır",
    dues: "",
    swap: "Hayır",
    
    // YENİ ALANLAR (ESKİ DESCRIPTION YERİNE)
    highlights: "", 
    notes: ""
  });

  const allCities = useMemo(() => getCities(), []);
  const selectedCityCode = useMemo(() => allCities.find(c => c.name === formData.city)?.code || "", [formData.city, allCities]);
  const districtOptions = useMemo(() => selectedCityCode ? getDistrictsByCityCode(selectedCityCode) : [], [selectedCityCode]);
  const neighborhoodOptions = useMemo(() => (selectedCityCode && formData.district) ? getNeighbourhoodsByCityCodeAndDistrict(selectedCityCode, formData.district) : [], [selectedCityCode, formData.district]);

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => {
      if (name === 'city') return { ...prev, city: value, district: "", neighborhood: "" };
      if (name === 'district') return { ...prev, district: value, neighborhood: "" };
      return { ...prev, [name]: value };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!formData.city || !formData.district || !formData.price || !formData.title) {
        alert("Lütfen zorunlu alanları (Başlık, Fiyat, Konum) doldurun.");
        return;
    }
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Oturum hatası");

      const { data, error } = await supabase.from("portfolios").insert({
        user_id: user.id,
        status: "active",
        
        title: formData.title,
        listing_type: formData.listing_type,
        price: Number(formData.price),
        city: formData.city,
        district: formData.district,
        neighborhood: formData.neighborhood,
        net_m2: formData.net_m2 ? Number(formData.net_m2) : null,
        gross_m2: formData.gross_m2 ? Number(formData.gross_m2) : null,
        room_count: formData.room_count,
        floor: formData.floor,
        heating: formData.heating,
        credit_status: formData.credit_status,

        details: {
          ...formData,
          price: Number(formData.price),
          grossM2: Number(formData.gross_m2),
          netM2: Number(formData.net_m2),
          listingNo: Math.floor(100000 + Math.random() * 900000).toString(),
          
          // MARKETING VERİSİ
          marketing: {
            highlights: formData.highlights, 
            notes: formData.notes,
            target: "Genel",
            tone: "Profesyonel",
            language: "tr"
          }
        }
      }).select().single();

      if (error) throw error;
      router.push(`/dashboard/portfolios/${data.id}`);

    } catch (error: any) {
      alert("Hata: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="new-portfolio-page animate-in fade-in">
      <div className="page-header">
        <Link href="/dashboard/portfolios" className="back-link"><ArrowLeft size={20}/></Link>
        <div>
          <h1>Yeni Portföy Ekle</h1>
          <p style={{fontSize: '0.9rem', color: '#9ca3af'}}>İlan detaylarını eksiksiz girerek portföyünüzü oluşturun.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel portfolio-form">
        
        {/* 1. TEMEL BİLGİLER */}
        <div className="form-section">
          <h3 className="section-title"><Info size={18} className="text-purple"/> Temel Bilgiler</h3>
          <div className="form-grid">
            <div className="input-group full-width">
               <label>İlan Başlığı *</label>
               <input required placeholder="Örn: Cadde Üzeri Lüks 3+1 Daire" className="form-input" 
                 value={formData.title} onChange={(e) => handleChange("title", e.target.value)} />
            </div>
            <div className="input-group">
               <label>İlan Tipi</label>
               <select className="form-select" value={formData.listing_type} onChange={(e) => handleChange("listing_type", e.target.value)}>
                 <option value="sale">Satılık</option><option value="rent">Kiralık</option>
               </select>
            </div>
            <div className="input-group">
               <label>Fiyat (TL) *</label>
               <div className="input-wrapper">
                 <DollarSign size={16} className="input-icon green"/>
                 <input required type="number" placeholder="0" className="form-input with-icon" 
                   value={formData.price} onChange={(e) => handleChange("price", e.target.value)} />
               </div>
            </div>
            <div className="input-group">
               <label>Aidat (TL)</label>
               <input type="number" placeholder="0" className="form-input" 
                 value={formData.dues} onChange={(e) => handleChange("dues", e.target.value)} />
            </div>
          </div>
        </div>

        {/* 2. KONUM */}
        <div className="form-section">
          <h3 className="section-title"><MapPin size={18} className="text-orange"/> Konum</h3>
          <div className="form-grid three-col">
            <div className="input-group">
               <label>İl *</label>
               <select className="form-select" value={formData.city} onChange={(e) => handleChange("city", e.target.value)}>
                 <option value="">Seçiniz</option>
                 {allCities.map(c => <option key={c.code} value={c.name}>{c.name}</option>)}
               </select>
            </div>
            <div className="input-group">
               <label>İlçe *</label>
               <select className="form-select" value={formData.district} onChange={(e) => handleChange("district", e.target.value)} disabled={!formData.city}>
                 <option value="">Seçiniz</option>
                 {districtOptions.map((d, i) => <option key={i} value={d}>{d}</option>)}
               </select>
            </div>
            <div className="input-group">
               <label>Mahalle *</label>
               <select className="form-select" value={formData.neighborhood} onChange={(e) => handleChange("neighborhood", e.target.value)} disabled={!formData.district}>
                 <option value="">Seçiniz</option>
                 {neighborhoodOptions.map((n, i) => <option key={i} value={n}>{n}</option>)}
               </select>
            </div>
          </div>
        </div>

        {/* 3. ÖZELLİKLER */}
        <div className="form-section">
          <h3 className="section-title"><Home size={18} className="text-blue"/> Gayrimenkul Özellikleri</h3>
          <div className="form-grid four-col">
            <div className="input-group">
               <label>Oda Sayısı</label>
               <select className="form-select" value={formData.room_count} onChange={(e) => handleChange("room_count", e.target.value)}>
                 {ROOM_COUNTS.map(r => <option key={r} value={r}>{r}</option>)}
               </select>
            </div>
            <div className="input-group">
               <label>Brüt m²</label>
               <div className="input-wrapper"><Ruler size={14} className="input-icon"/><input type="number" className="form-input with-icon" placeholder="120" value={formData.gross_m2} onChange={(e) => handleChange("gross_m2", e.target.value)} /></div>
            </div>
            <div className="input-group">
               <label>Net m²</label>
               <div className="input-wrapper"><Ruler size={14} className="input-icon"/><input type="number" className="form-input with-icon" placeholder="100" value={formData.net_m2} onChange={(e) => handleChange("net_m2", e.target.value)} /></div>
            </div>
            <div className="input-group">
               <label>Banyo</label>
               <input type="number" className="form-input" placeholder="1" value={formData.bathroom_count} onChange={(e) => handleChange("bathroom_count", e.target.value)} />
            </div>
          </div>
        </div>

        {/* 4. BİNA DETAYLARI */}
        <div className="form-section">
          <h3 className="section-title"><Building size={18} className="text-purple"/> Bina Detayları</h3>
          <div className="form-grid four-col">
            <div className="input-group">
               <label>Bulunduğu Kat</label>
               <select className="form-select" value={formData.floor} onChange={(e) => handleChange("floor", e.target.value)}>
                 <option value="">Seçiniz</option>{FLOOR_LOCATIONS.map(f => <option key={f} value={f}>{f}</option>)}
               </select>
            </div>
            <div className="input-group">
               <label>Kat Sayısı</label>
               <input type="number" className="form-input" placeholder="5" value={formData.total_floors} onChange={(e) => handleChange("total_floors", e.target.value)} />
            </div>
            <div className="input-group">
               <label>Bina Yaşı</label>
               <select className="form-select" value={formData.building_age} onChange={(e) => handleChange("building_age", e.target.value)}>
                 <option value="">Seçiniz</option>{BUILDING_AGES.map(a => <option key={a} value={a}>{a}</option>)}
               </select>
            </div>
            <div className="input-group">
               <label>Isıtma</label>
               <select className="form-select" value={formData.heating} onChange={(e) => handleChange("heating", e.target.value)}>
                 {HEATING_TYPES.map(h => <option key={h} value={h}>{h}</option>)}
               </select>
            </div>
          </div>
        </div>

        {/* 5. DİĞER BİLGİLER */}
        <div className="form-section">
           <h3 className="section-title"><Layers size={18} className="text-green"/> Diğer</h3>
           <div className="form-grid four-col">
              <div className="input-group">
                <label>Kredi</label>
                <select className="form-select" value={formData.credit_status} onChange={(e) => handleChange("credit_status", e.target.value)}>
                   <option value="Uygun">Uygun</option><option value="Uygun Değil">Uygun Değil</option><option value="Bilinmiyor">Bilinmiyor</option>
                </select>
              </div>
              <div className="input-group">
                <label>Eşyalı</label>
                <select className="form-select" value={formData.furnished} onChange={(e) => handleChange("furnished", e.target.value)}>
                   {YES_NO.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>Site İçinde</label>
                <select className="form-select" value={formData.in_site} onChange={(e) => handleChange("in_site", e.target.value)}>
                   {YES_NO.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>Takas</label>
                <select className="form-select" value={formData.swap} onChange={(e) => handleChange("swap", e.target.value)}>
                   {YES_NO.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
           </div>
        </div>

        {/* 6. ÖNE ÇIKANLAR VE NOTLAR (YENİ EKLENEN KISIM) */}
        <div className="form-section">
          <h3 className="section-title"><Star size={18} className="text-yellow-400"/> Öne Çıkanlar & Notlar</h3>
          <div className="form-grid">
            <div className="input-group full-width">
               <label>Öne Çıkan Özellikler (AI İçin İpucu)</label>
               <textarea 
                 className="form-textarea" 
                 rows={3}
                 placeholder="Örn: Deniz manzaralı, güney cephe, metroya yakın..."
                 value={formData.highlights} 
                 onChange={(e) => handleChange("highlights", e.target.value)}
               />
            </div>
            <div className="input-group full-width">
               <label><MessageSquare size={14} className="mr-1"/> Ek Notlar (İç Kullanım / AI)</label>
               <textarea 
                 className="form-textarea" 
                 rows={3}
                 placeholder="Dairede şu an kiracı var, randevu ile gösteriliyor..."
                 value={formData.notes} 
                 onChange={(e) => handleChange("notes", e.target.value)}
               />
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="form-footer">
           <Link href="/dashboard/portfolios" className="btn-secondary">İptal</Link>
           <button disabled={loading} type="submit" className="btn-primary">
             {loading ? "Kaydediliyor..." : <><Save size={18}/> Kaydet</>}
           </button>
        </div>

      </form>
    </div>
  );
}