"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  // Form State'leri
  const [fullName, setFullName] = useState("");
  const [agencyName, setAgencyName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // UI State'leri
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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Bu veriler auth.users tablosundaki metadata kısmına ve
          // trigger sayesinde public.profiles tablosuna gider.
          data: {
            full_name: fullName,
            agency_name: agencyName,
            phone: phone,
          },
        },
      });

      if (error) throw error;

      // Kayıt başarılı oldu
      setSuccess(true);
      
      // Eğer otomatik oturum açıldıysa (Email onayı kapalıysa) yönlendir
      if (data.session) {
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      }

    } catch (err: any) {
      setError(err.message || "Kayıt olurken bir hata oluştu.");
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Logo & Başlık */}
        <div className="header">
          <div 
            style={{
              width: '40px', height: '40px', 
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem auto', color: 'white'
            }}
          >
            <Building2 size={20} />
          </div>
          <h2>Hesap Oluşturun</h2>
          <p>İçerik üretimine başlamak için 30 saniyenizi ayırın.</p>
        </div>

        {/* Başarı Mesajı */}
        {success ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
            <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>Kayıt Başarılı!</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
              Hesabınız oluşturuldu. Yönlendiriliyorsunuz...
            </p>
            {/* Eğer email onayı açıksa buraya "Lütfen emailinizi kontrol edin" yazısı eklenebilir */}
          </div>
        ) : (
          <>
            {/* Hata Mesajı */}
            {error && (
              <div style={{ 
                padding: '0.75rem', 
                marginBottom: '1rem', 
                borderRadius: '0.5rem', 
                backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: '#fca5a5',
                fontSize: '0.875rem'
              }}>
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label>Ad Soyad</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="Adınız Soyadınız"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Emlak Ofisi / Ajans Adı</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="Örn: Spektrum Gayrimenkul"
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Telefon (WhatsApp)</label>
                <input
                  type="tel"
                  required
                  className="input-field"
                  placeholder="5XX XXX XX XX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>E-posta Adresi</label>
                <input
                  type="email"
                  required
                  className="input-field"
                  placeholder="ornek@sirket.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Şifre</label>
                <input
                  type="password"
                  required
                  className="input-field"
                  placeholder="En az 6 karakter"
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', marginTop: '1rem' }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} style={{ marginRight: '8px' }} />
                    Kaydediliyor...
                  </>
                ) : (
                  "Ücretsiz Kayıt Ol"
                )}
              </button>
            </form>

            <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--muted)' }}>
              Zaten hesabınız var mı?{" "}
              <Link href="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>
                Giriş Yap
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}