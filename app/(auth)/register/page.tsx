"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Building2, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// useSearchParams kullandığımız için Suspense sarmalaması şart
export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="text-white text-center p-10">Yükleniyor...</div>}>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  // URL'den planı çek.
  const planParam = searchParams.get("plan");
  
  // Eğer plan 'pro', 'office' veya 'freelance' değilse, varsayılan olarak 'free' (demo) yap.
  let selectedPlan = 'free';
  if (planParam === 'pro' || planParam === 'office' || planParam === 'freelance') {
    selectedPlan = planParam;
  }

  // Plan adını Türkçeleştirip başlığını düzeltmek için (UI için)
  const displayPlanName = selectedPlan === 'free' ? 'Ücretsiz Demo' : selectedPlan;

  const [fullName, setFullName] = useState("");
  const [agencyName, setAgencyName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setError("Lütfen geçerli bir telefon numarası giriniz.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      // 1. Kullanıcıyı Kaydet
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            agency_name: agencyName,
            phone: phone,
            plan_type: selectedPlan, // Metadata olarak gönderiyoruz (Trigger için)
          },
        },
      });

      if (error) throw error;

      // 2. PROFİL GÜNCELLEME (GARANTİ YÖNTEM - BACKUP)
      // Trigger çalışmazsa kod tarafında limitleri manuel yazıyoruz.
      if (data.user) {
        // Varsayılan FREE limitleri (Sadece 3 İçerik)
        let limits = { list: 3, img: 0, social: 0, vid: 0 };
        
        if(selectedPlan === 'office') limits = { list: 150, img: 100, social: 50, vid: 2 };
        else if(selectedPlan === 'pro') limits = { list: 100, img: 30, social: 15, vid: 1 };
        else if(selectedPlan === 'freelance') limits = { list: 15, img: 3, social: 1, vid: 0 };
        
        await supabase
          .from('profiles')
          .update({ 
            plan_type: selectedPlan, 
            subscription_tier: selectedPlan,
            listing_limit: limits.list,
            image_ai_limit: limits.img,
            social_ai_limit: limits.social,
            video_ai_limit: limits.vid
          })
          .eq('id', data.user.id);
      }

      setSuccess(true);
      
      if (data.session) {
        setTimeout(() => { router.push("/dashboard"); }, 2000);
      }

    } catch (err: any) {
      setError(err.message || "Kayıt hatası.");
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="header">
          <div style={{width:'40px', height:'40px', background:'linear-gradient(135deg, var(--primary), var(--accent))', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1rem auto', color:'white'}}>
            <Building2 size={20} />
          </div>
          <h2>Hesap Oluşturun</h2>
          {/* Seçili Paketi Göster */}
          <div style={{marginTop:'0.5rem', fontSize:'0.9rem', color:'#a1a1aa'}}>
            Seçilen Paket: <span style={{color:'#a855f7', fontWeight:'700', textTransform:'capitalize'}}>{displayPlanName}</span>
          </div>
        </div>

        {success ? (
          <div style={{textAlign:'center', padding:'2rem 0', color:'white'}}>
            <div style={{fontSize:'3rem', marginBottom:'1rem'}}>🎉</div>
            <h3>Kayıt Başarılı!</h3>
            <p style={{color:'#a1a1aa'}}>Yönlendiriliyorsunuz...</p>
          </div>
        ) : (
          <form onSubmit={handleRegister}>
            {error && <div style={{padding:'0.8rem', background:'rgba(239,68,68,0.1)', color:'#fca5a5', borderRadius:'8px', marginBottom:'1rem', fontSize:'0.9rem'}}>{error}</div>}
            
            <div className="form-group">
              <label>Ad Soyad</label>
              <input type="text" required className="input-field" placeholder="Adınız Soyadınız" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Emlak Ofisi / Ajans Adı</label>
              <input type="text" required className="input-field" placeholder="Örn: Spektrum Gayrimenkul" value={agencyName} onChange={(e) => setAgencyName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Telefon</label>
              <input type="tel" required className="input-field" placeholder="5XX XXX XX XX" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="form-group">
              <label>E-posta</label>
              <input type="email" required className="input-field" placeholder="mail@ornek.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Şifre</label>
              <input type="password" required className="input-field" placeholder="******" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            <button type="submit" className="btn btn-primary" style={{width:'100%', marginTop:'1rem'}} disabled={loading}>
              {loading ? <><Loader2 className="animate-spin" size={18} style={{marginRight:8}}/> Kaydediliyor...</> : "Kayıt Ol ve Devam Et"}
            </button>
            
            <div style={{marginTop:'1.5rem', textAlign:'center', fontSize:'0.85rem', color:'#a1a1aa'}}>
              Zaten üye misiniz? <Link href="/login" style={{color:'#a855f7', textDecoration:'none'}}>Giriş Yap</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}