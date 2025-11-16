"use client";

import { useState } from "react";
import {
  getCities,
  getDistrictsByCityCode,
  getNeighbourhoodsByCityCodeAndDistrict,
} from "turkey-neighbourhoods";

type Contents = {
  portal?: string;
  instagram?: string;
  linkedin?: string;
  reels?: string;
};

const CITIES = getCities(); // [{ code: "01", name: "Adana" }, ...]
const CITY_CODE_BY_NAME: Record<string, string> = Object.fromEntries(
  CITIES.map((c) => [c.name, c.code])
);
const CITY_NAMES = CITIES.map((c) => c.name); // ["Adana", "Adıyaman", ...]

const HEATING_TYPES = [
  "Belirtilmemiş",
  "Kombi (Doğalgaz)",
  "Kombi (Elektrik)",
  "Merkezi Sistem",
  "Merkezi (Pay Ölçer)",
  "Doğalgaz Sobası",
  "Kat Kaloriferi",
  "Klima",
  "Yerden ısıtma",
  "Soba",

];

const YES_NO_OPTIONS = [
  "Belirtilmemiş",
  "Evet",
  "Hayır",
];




export default function Home() {
  // 1) WIZARD ADIM STATE'İ
  const [step, setStep] = useState<1 | 2>(1);
  // Lokasyon
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [neighborhood, setNeighborhood] = useState("");

  // Portföy bilgileri
  const [listingNo, setListingNo] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [price, setPrice] = useState("");
  const [brut, setBrut] = useState("");
  const [net, setNet] = useState("");
  const [rooms, setRooms] = useState("");
  const [floor, setFloor] = useState("");
  const [heating, setHeating] = useState("");
  const [site, setSite] = useState("");
  const [parking, setParking] = useState("");
  const [credit, setCredit] = useState("");
  const [images, setImages] = useState<File[]>([]);

  // Marketing
  const [target, setTarget] = useState("");
  const [tone, setTone] = useState("");
  const [highlights, setHighlights] = useState("");
  const [language, setLanguage] = useState("tr");
  const [notes, setNotes] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [contents, setContents] = useState<Contents | null>(null);
  const [activeTab, setActiveTab] = useState<keyof Contents>("portal");
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState<boolean | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

    // --- Wizard logic & validation ---
  const canGoNext = Boolean(
    city &&
      district &&
      neighborhood &&
      propertyType &&
      price &&
      brut &&
      net &&
      rooms
  );

  const canSubmit = Boolean(target && tone);

  const portfolioSummary = (() => {
    const parts: string[] = [];

    if (city && district && neighborhood) {
      parts.push(`${city} / ${district} / ${neighborhood}`);
    }

    const subParts: string[] = [];
    if (rooms) subParts.push(rooms);
    if (net) subParts.push(`${net} m² Net`);
    else if (brut) subParts.push(`${brut} m² Brüt`);

    if (heating) subParts.push(heating);
    if (site === "Evet") subParts.push("Site içi");
    if (parking === "Evet") subParts.push("Otoparklı");
    if (credit === "Evet") subParts.push("Krediye uygun");

    if (subParts.length) {
      parts.push(subParts.join(" • "));
    }

    return parts.join(" • ");
  })();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setContents(null);
    setFromCache(null);

    try {
      // n8n Normalize node'unla uyumlu bir JSON body
      const body = {
        city,
        district,
        neighborhood,
        listingNo,
        propertyType,
        price: price ? Number(price) : undefined,
        grossM2: brut ? Number(brut) : undefined,
        netM2: net ? Number(net) : undefined,
        roomCount: rooms,
        floor,
        heating,
        site,
        parking,
        credit,
        marketing: {
          target,
          tone,
          highlights,
          language,
          notes,
        },
      };

      const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
      if (!webhookUrl) {
        throw new Error(
          "NEXT_PUBLIC_N8N_WEBHOOK_URL tanımlı değil. .env.local dosyasını kontrol et."
        );
      }

      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error(`Sunucudan hata döndü: ${res.status}`);
      }

      const data = await res.json();

      if (!data || !data.contents) {
        throw new Error("Beklenen formatta içerik dönmedi.");
      }

      setContents(data.contents as Contents);
      setActiveTab("portal");
      setFromCache(Boolean(data.fromCache));
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Bilinmeyen bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(files);
    // Şimdilik sadece state'te tutuyoruz. n8n'e ileride bağlayacağız.
  };
  const handleCopyCurrent = async () => {
    if (!contents || !currentText) return;
    try {
      await navigator.clipboard.writeText(currentText);
      setCopyMessage("Metin panoya kopyalandı.");
      setTimeout(() => setCopyMessage(null), 2000);
    } catch (err) {
      console.error(err);
      setCopyMessage("Kopyalama sırasında bir hata oluştu.");
      setTimeout(() => setCopyMessage(null), 2500);
    }
  };

  const currentText = contents ? contents[activeTab] || "" : "";

  const districtsForSelectedCity = city
  ? getDistrictsByCityCode(CITY_CODE_BY_NAME[city] || "").sort()
  : [];

  const neighbourhoodsForSelectedDistrict =
  city && district
    ? getNeighbourhoodsByCityCodeAndDistrict(
        CITY_CODE_BY_NAME[city] || "",
        district
      ).sort()
    : [];


  return (
    <div className="page">
      <div className="container">
        {/* Sol sütun – Form + marka */}
        <div className="card">
          {/* Üst brand bar */}
          <div className="brand-header">
  <div>
    <div className="brand-domain">Emlak İçerik Asistanı</div>
    <div className="brand-subtitle">
      Emlak danışmanları için tek formdan 4 kanala içerik.
    </div>
  </div>
  <div className="brand-by">
    <span className="brand-dot" />
    <span>
      by{" "}
      <a
        href="https://spektrumcreative.co"
        target="_blank"
        rel="noreferrer"
      >
        SpektrumCreative.co
      </a>
    </span>
  </div>
</div>


  {/* Wizard step bar */}
  <div className="wizard">
    <div className={`wizard-step ${step === 1 ? "active" : ""}`}>
      1. Portföy Bilgileri
    </div>
    <div className={`wizard-line ${step === 2 ? "active" : ""}`}></div>
    <div className={`wizard-step ${step === 2 ? "active" : ""}`}>
      2. Pazarlama Ayarları
    </div>
  </div>


          <div style={{ marginBottom: 12 }}>
            <div className="title-main">
              Portföyünü gir,{" "}
              <span className="title-highlight">metin yazma yükünü bırak.</span>
            </div>
            <p className="text-muted">
              Portal ilanı, Instagram postu, LinkedIn paylaşımı ve Reels
              senaryosu – hepsi tek seferde, aynı portföyden.
            </p>
          </div>

          <form
  onSubmit={step === 2 ? handleSubmit : (e) => e.preventDefault()}
  className="form-grid-1"
>
  {/* STEP 1 – LOKASYON + PORTFÖY */}
  {step === 1 && (
    <div className="step-panel">
      {/* Lokasyon */}
      <div className="form-section-title">Lokasyon</div>
      <div className="form-grid-3">
        <select
          className="input"
          value={city}
          onChange={(e) => {
            setCity(e.target.value);
            setDistrict("");
            setNeighborhood("");
          }}
        >
          <option value="">İl seç</option>
          {CITY_NAMES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          className="input"
          value={district}
          onChange={(e) => {
            setDistrict(e.target.value);
            setNeighborhood("");
          }}
          disabled={!city}
        >
          <option value="">
            {city ? "İlçe seç" : "Önce il seç"}
          </option>
          {districtsForSelectedCity.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <select
          className="input"
          value={neighborhood}
          onChange={(e) => setNeighborhood(e.target.value)}
          disabled={!city || !district}
        >
          <option value="">
            {city && district
              ? "Mahalle / site seç"
              : "Önce il ve ilçe seç"}
          </option>
          {neighbourhoodsForSelectedDistrict.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* Portföy temel bilgiler */}
      <div className="form-section-title">Portföy bilgileri</div>
      <div className="form-grid-3">
        <input
          className="input"
          placeholder="İlan no"
          value={listingNo}
          onChange={(e) => setListingNo(e.target.value)}
        />
        <input
          className="input"
          placeholder="Emlak tipi (Satılık daire)"
          value={propertyType}
          onChange={(e) => setPropertyType(e.target.value)}
        />
        <input
          className="input"
          placeholder="Fiyat (TL)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </div>

      <div className="form-grid-3">
        <input
          className="input"
          placeholder="Brüt m²"
          value={brut}
          onChange={(e) => setBrut(e.target.value)}
        />
        <input
          className="input"
          placeholder="Net m²"
          value={net}
          onChange={(e) => setNet(e.target.value)}
        />
        <input
          className="input"
          placeholder="Oda sayısı (2+1)"
          value={rooms}
          onChange={(e) => setRooms(e.target.value)}
        />
      </div>

      <div className="form-grid-3">
        <input
          className="input"
          placeholder="Bulunduğu kat"
          value={floor}
          onChange={(e) => setFloor(e.target.value)}
        />

        <select
          className="input"
          value={heating}
          onChange={(e) => setHeating(e.target.value)}
        >
          <option value="">Isıtma tipi seç</option>
          {HEATING_TYPES.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>

        <select
          className="input"
          value={site}
          onChange={(e) => setSite(e.target.value)}
        >
          <option value="">Site durumu</option>
          {YES_NO_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <div className="form-grid-2">
        <select
          className="input"
          value={parking}
          onChange={(e) => setParking(e.target.value)}
        >
          <option value="">Otopark durumu</option>
          {YES_NO_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>

        <select
          className="input"
          value={credit}
          onChange={(e) => setCredit(e.target.value)}
        >
          <option value="">Krediye uygunluk</option>
          {YES_NO_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
          
        </select>
      </div>
      {/* Görseller (opsiyonel) */}
      <div className="form-section-title">Görseller (opsiyonel)</div>
      <div className="form-grid-1">
        <label className="upload-field">
          <span className="upload-title">Portföy görselleri ekle</span>
          <span className="upload-subtitle">
            Plan: Daire, bina dışı, manzara vb. görseller. Şimdilik sadece yer tutucu, ileride işlenecek.
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
          />
        </label>
        {images.length > 0 && (
          <div className="upload-info">
            {images.length} görsel seçildi.
          </div>
        )}
      </div>

      {/* Step 1 -> Step 2 butonu */}
      <div className="wizard-buttons-single">
        <button
        type="button"
        className="button-primary"
        onClick={() => setStep(2)}
        disabled={!canGoNext}
      >
        Devam Et →
      </button>
      {!canGoNext && (
        <p className="helper-text">
          Devam etmek için lokasyon ve temel portföy bilgilerini doldur.
        </p>
      )}
      </div>
    </div>
  )}

  {/* STEP 2 – PAZARLAMA AYARLARI */}
  {step === 2 && (
  <div className="step-panel">
    {/* Portföy özet kartı */}
    {portfolioSummary && (
      <div className="summary-card">
        <div className="summary-label">Portföy özeti</div>
        <div className="summary-text">{portfolioSummary}</div>
      </div>
    )}

    <div className="form-section-title">Pazarlama ayarları</div>

      <div className="form-grid-1">
        <input
          className="input"
          placeholder="Hedef kitle (aile, yatırımcı, öğrenci...)"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
        />
        <input
          className="input"
          placeholder="Ton (samimi, profesyonel, kurumsal...)"
          value={tone}
          onChange={(e) => setTone(e.target.value)}
        />
        <input
          className="input"
          placeholder="Öne çıkan özellikler (virgülle ayır)"
          value={highlights}
          onChange={(e) => setHighlights(e.target.value)}
        />
      </div>

      <div className="form-grid-2">
        <select
          className="input"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="tr">Türkçe</option>
          <option value="en">İngilizce</option>
        </select>
        <input
          className="input"
          placeholder="Ek not (örn: otopark mutlaka geçsin)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="wizard-buttons">
      <button
        type="button"
        className="button-secondary"
        onClick={() => setStep(1)}
      >
        ← Geri
      </button>

      <button
        type="submit"
        className="button-primary wizard-submit"
        disabled={!canSubmit || loading}
      >
        {loading ? "İçerikler üretiliyor..." : "İçerik Üret"}
      </button>
    </div>

    {!canSubmit && !loading && (
      <p className="helper-text">
        İçerik üretmek için en azından hedef kitle ve tonu belirt.
      </p>
    )}

    {error && <div className="alert-error">{error}</div>}
    {fromCache !== null && !error && (
      <div className="alert-info">
        {fromCache
          ? "Bu portföy için içerikler önbellekten getirildi."
          : "Bu portföy için içerikler ilk kez üretildi."}
      </div>
    )}
  </div>
)}
</form>

        </div>

        {/* Sağ sütun – Çıktılar */}
        <div className="card card-secondary">
  <div className="output-header">
    <div style={{ display: "flex", gap: 8 }}>
      <span className="badge">
        <span className="badge-dot" />
        n8n + OpenAI içerik motoru
      </span>
      <span className="badge">Portal · Instagram · LinkedIn · Reels</span>
    </div>
<button
      type="button"
      className="copy-button"
      onClick={handleCopyCurrent}
      disabled={!currentText}
    >
      Kopyala
    </button>
  </div>

          {!contents ? (
            <p className="text-muted">
              Henüz içerik üretilmedi. Sol taraftaki formu doldurup{" "}
              <b>“İçerik Üret”</b> dediğinde; dört kanal için hazır içerikleri
              burada sekmeler halinde göreceksin.
            </p>
          ) : (
            <>
              <div className="tabs">
                <button
                  type="button"
                  className={
                    "tab " + (activeTab === "portal" ? "tab-active" : "")
                  }
                  onClick={() => setActiveTab("portal")}
                >
                  Portal İlan
                </button>
                <button
                  type="button"
                  className={
                    "tab " + (activeTab === "instagram" ? "tab-active" : "")
                  }
                  onClick={() => setActiveTab("instagram")}
                >
                  Instagram
                </button>
                <button
                  type="button"
                  className={
                    "tab " + (activeTab === "linkedin" ? "tab-active" : "")
                  }
                  onClick={() => setActiveTab("linkedin")}
                >
                  LinkedIn
                </button>
                <button
                  type="button"
                  className={
                    "tab " + (activeTab === "reels" ? "tab-active" : "")
                  }
                  onClick={() => setActiveTab("reels")}
                >
                  Reels Senaryosu
                </button>
              </div>

              <div>
                <textarea
                  className="textarea-output"
                  readOnly
                  value={currentText}
                  placeholder="Bu kanala ait içerik burada görünecek."
                />
                {copyMessage && (
                  <div className="helper-text" style={{ marginTop: 4 }}>
                    {copyMessage}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
