'use client'

import { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { FaEdit, FaSave, FaTimes, FaEye, FaEyeSlash, FaExternalLinkAlt, FaUndo, FaCoins } from 'react-icons/fa'
import toast from 'react-hot-toast'

import { createClient } from '@/lib/supabase-browser'
import ImageUpload from '@/components/ImageUpload'
import { ILLER } from '@/lib/iller'
import { ROTALAR, ilHizmetUrl } from '@/lib/rotalar'
import { VARSAYILAN_BAZ_UCRET, VARSAYILAN_KM_UCRETI } from '@/lib/rota-icerik'

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), { ssr: false })

const BOS_FORM = {
  slug: '', tur: 'rota', hedef_slug: '', baslik: '', h1: '', ozet: '', icerik: '',
  makale_baslik: '', makale: '', resim: '', mesafe_km: '', sure_metni: '', ilceler: '',
  fiyat_notu: '', aktif: true, meta_title: '', meta_description: '', meta_keywords: '',
  og_image: '', canonical_url: '',
}

/** Kod tarafındaki rota listesi panelin temel kaynağı; tabloda her sayfa
 *  görünür, veritabanında kaydı olmayanlar "varsayılan" olarak işaretlenir. */
const ROTA_SATIRLARI = ROTALAR.map((r) => ({
  slug: r.rotaSlug,
  tur: 'rota',
  hedef_slug: r.slug,
  ad: r.rotaAdi,
  altAd: r.tersBaslik,
  url: r.url,
  mesafe: r.mesafe,
  il: r.il,
  bolge: r.bolgeAdi,
  tip: r.tip,
}))

const IL_SATIRLARI = ILLER.map((il) => ({
  slug: il.slug,
  tur: 'il-hizmet',
  hedef_slug: il.slug,
  ad: `${il.ad} Nakliye Hizmetleri`,
  altAd: `${il.ilceler.length} ilçe`,
  url: ilHizmetUrl(il.slug),
  mesafe: il.mesafe,
  il: il.ad,
  bolge: il.bolgeAdi,
  tip: 'il-hizmet',
}))

export default function AdminRotalarPage() {
  const [sekme, setSekme] = useState('rota')
  const [arama, setArama] = useState('')
  const [kayitlar, setKayitlar] = useState([])
  const [loading, setLoading] = useState(true)
  const [tabloYok, setTabloYok] = useState(false)
  const [editSlug, setEditSlug] = useState(null)
  const [formData, setFormData] = useState(BOS_FORM)
  const [kaydediliyor, setKaydediliyor] = useState(false)
  const [fiyat, setFiyat] = useState({ baz: '', km: '', goster: true, guncelleme: '' })

  const supabase = createClient()

  useEffect(() => {
    let iptal = false

    const yukle = async () => {
      const [rotaSonuc, ayarSonuc] = await Promise.all([
        supabase.from('rota_sayfalari').select('*'),
        supabase.from('ayarlar').select('anahtar, deger').in('anahtar', [
          'rota_baz_ucret', 'rota_km_ucreti', 'rota_fiyat_goster', 'rota_fiyat_guncelleme',
        ]),
      ])
      if (iptal) return

      if (rotaSonuc.error) {
        setTabloYok(true)
      } else {
        setKayitlar(rotaSonuc.data || [])
      }

      const al = (k) => ayarSonuc.data?.find((a) => a.anahtar === k)?.deger
      setFiyat({
        baz: al('rota_baz_ucret') || '',
        km: al('rota_km_ucreti') || '',
        goster: String(al('rota_fiyat_goster') ?? 'true') !== 'false',
        guncelleme: al('rota_fiyat_guncelleme') || '',
      })
      setLoading(false)
    }

    yukle()
    return () => { iptal = true }
    // supabase istemcisi her render'da yeniden üretiliyor; yükleme bir kez çalışmalı.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const kayitHaritasi = useMemo(() => {
    const harita = new Map()
    for (const k of kayitlar) harita.set(`${k.tur}:${k.slug}`, k)
    return harita
  }, [kayitlar])

  const satirlar = useMemo(() => {
    const kaynak = sekme === 'rota' ? ROTA_SATIRLARI : IL_SATIRLARI
    const q = arama.trim().toLocaleLowerCase('tr')
    if (!q) return kaynak
    return kaynak.filter(
      (s) =>
        s.ad.toLocaleLowerCase('tr').includes(q) ||
        s.slug.includes(q) ||
        s.il.toLocaleLowerCase('tr').includes(q) ||
        s.bolge.toLocaleLowerCase('tr').includes(q)
    )
  }, [sekme, arama])

  const kayitAl = (satir) => kayitHaritasi.get(`${satir.tur}:${satir.slug}`) || null

  const duzenle = (satir) => {
    const kayit = kayitAl(satir)
    setEditSlug(`${satir.tur}:${satir.slug}`)
    setFormData({
      ...BOS_FORM,
      ...(kayit || {}),
      slug: satir.slug,
      tur: satir.tur,
      hedef_slug: satir.hedef_slug,
      mesafe_km: kayit?.mesafe_km ?? '',
      aktif: kayit?.aktif ?? true,
      _ad: satir.ad,
      _url: satir.url,
      _varsayilanMesafe: satir.mesafe,
    })
  }

  const kapat = () => { setEditSlug(null); setFormData(BOS_FORM) }

  const degistir = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((onceki) => ({ ...onceki, [name]: type === 'checkbox' ? checked : value }))
  }

  const kaydet = async () => {
    setKaydediliyor(true)
    const { _ad, _url, _varsayilanMesafe, id, created_at, updated_at, ...govde } = formData
    const veri = {
      ...govde,
      mesafe_km: govde.mesafe_km === '' || govde.mesafe_km === null ? null : Number(govde.mesafe_km),
      updated_at: new Date().toISOString(),
    }
    const { data, error } = await supabase
      .from('rota_sayfalari')
      .upsert(veri, { onConflict: 'tur,slug' })
      .select()
    setKaydediliyor(false)

    if (error) { toast.error('Kaydedilemedi: ' + error.message); return }
    toast.success('Sayfa güncellendi')
    const yeni = data?.[0]
    if (yeni) {
      setKayitlar((onceki) => {
        const disari = onceki.filter((k) => !(k.tur === yeni.tur && k.slug === yeni.slug))
        return [...disari, yeni]
      })
    }
    kapat()
  }

  const varsayilanaDon = async (satir) => {
    const kayit = kayitAl(satir)
    if (!kayit) return
    if (!confirm(`${satir.ad} sayfasındaki panel içeriği silinsin mi? Sayfa otomatik içerikle yayında kalır.`)) return
    const { error } = await supabase.from('rota_sayfalari').delete().eq('tur', satir.tur).eq('slug', satir.slug)
    if (error) { toast.error('Silinemedi: ' + error.message); return }
    setKayitlar((onceki) => onceki.filter((k) => !(k.tur === satir.tur && k.slug === satir.slug)))
    toast.success('Varsayılan içeriğe dönüldü')
  }

  const aktifDegistir = async (satir) => {
    const kayit = kayitAl(satir)
    const yeniDurum = !(kayit?.aktif ?? true)
    const { data, error } = await supabase
      .from('rota_sayfalari')
      .upsert(
        { slug: satir.slug, tur: satir.tur, hedef_slug: satir.hedef_slug, aktif: yeniDurum, updated_at: new Date().toISOString() },
        { onConflict: 'tur,slug' }
      )
      .select()
    if (error) { toast.error('Güncellenemedi: ' + error.message); return }
    const yeni = data?.[0]
    setKayitlar((onceki) => {
      const disari = onceki.filter((k) => !(k.tur === satir.tur && k.slug === satir.slug))
      return yeni ? [...disari, yeni] : disari
    })
    toast.success(yeniDurum ? 'Sayfa yayına alındı' : 'Sayfa yayından kaldırıldı')
  }

  const fiyatKaydet = async () => {
    const satirlar = [
      { anahtar: 'rota_baz_ucret', deger: String(fiyat.baz || ''), grup: 'rota', aciklama: 'Rota sayfalarındaki tahmini fiyatın sabit bileşeni (TL)' },
      { anahtar: 'rota_km_ucreti', deger: String(fiyat.km || ''), grup: 'rota', aciklama: 'Rota sayfalarında kilometre başına eklenen tutar (TL)' },
      { anahtar: 'rota_fiyat_goster', deger: fiyat.goster ? 'true' : 'false', grup: 'rota', aciklama: 'Rota sayfalarında fiyat tablosu gösterilsin mi' },
      { anahtar: 'rota_fiyat_guncelleme', deger: fiyat.guncelleme || '', grup: 'rota', aciklama: 'Fiyat tablosunun son güncelleme tarihi (metin)' },
    ]
    const { error } = await supabase.from('ayarlar').upsert(satirlar, { onConflict: 'anahtar' })
    if (error) { toast.error('Fiyat ayarları kaydedilemedi: ' + error.message); return }
    toast.success('Fiyat ayarları kaydedildi')
  }

  const ornekFiyat = useMemo(() => {
    const baz = Number(fiyat.baz) || VARSAYILAN_BAZ_UCRET
    const km = Number(fiyat.km) || VARSAYILAN_KM_UCRETI
    const hesap = (mesafe) => new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(Math.round((baz + mesafe * km) / 250) * 250)
    return { mersin: hesap(70), ankara: hesap(490), istanbul: hesap(940) }
  }, [fiyat.baz, fiyat.km])

  if (loading) return <div className="flex justify-center py-12"><div className="spinner" /></div>

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Rota ve İl Sayfaları</h1>
          <p className="mt-1 text-sm text-gray-600">
            {ROTA_SATIRLARI.length} rota ve {IL_SATIRLARI.length} il sayfası otomatik yayında.
            Buradan bir sayfayı düzenlediğinizde yalnızca doldurduğunuz alanlar otomatik içeriğin yerine geçer.
          </p>
        </div>
      </div>

      {tabloYok && (
        <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <strong>rota_sayfalari tablosu bulunamadı.</strong> Sayfalar otomatik içerikle yayında, ancak buradan
          düzenleme yapabilmek için <code className="rounded bg-amber-100 px-1">supabase-migrations/rota_sayfalari.sql</code>{' '}
          dosyasını Supabase SQL editöründe çalıştırın.
        </div>
      )}

      {/* Fiyat ayarları: iki sayı tüm rota sayfalarındaki tabloyu belirler */}
      <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-1 flex items-center gap-2 text-lg font-bold"><FaCoins className="text-[#046ffb]" /> Fiyat Tablosu Ayarları</h2>
        <p className="mb-4 text-sm text-gray-600">
          Tahmini fiyat = baz ücret + (mesafe × km ücreti). Bu iki sayıyı değiştirdiğinizde tüm rota
          sayfalarındaki tablo güncellenir. Boş bırakılırsa varsayılan {VARSAYILAN_BAZ_UCRET} TL ve {VARSAYILAN_KM_UCRETI} TL/km kullanılır.
        </p>
        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <label className="admin-label" htmlFor="rota-baz">Baz ücret (TL)</label>
            <input id="rota-baz" type="number" min="0" className="admin-input" value={fiyat.baz}
              onChange={(e) => setFiyat({ ...fiyat, baz: e.target.value })} placeholder={String(VARSAYILAN_BAZ_UCRET)} />
          </div>
          <div>
            <label className="admin-label" htmlFor="rota-km">Km ücreti (TL)</label>
            <input id="rota-km" type="number" min="0" className="admin-input" value={fiyat.km}
              onChange={(e) => setFiyat({ ...fiyat, km: e.target.value })} placeholder={String(VARSAYILAN_KM_UCRETI)} />
          </div>
          <div>
            <label className="admin-label" htmlFor="rota-tarih">Güncelleme tarihi</label>
            <input id="rota-tarih" type="text" className="admin-input" value={fiyat.guncelleme}
              onChange={(e) => setFiyat({ ...fiyat, guncelleme: e.target.value })} placeholder="Ocak 2026" />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 pb-2 text-sm font-medium">
              <input type="checkbox" checked={fiyat.goster} onChange={(e) => setFiyat({ ...fiyat, goster: e.target.checked })} />
              Fiyat tablosunu göster
            </label>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <button onClick={fiyatKaydet} className="admin-btn-primary flex items-center gap-2"><FaSave /> Fiyat Ayarlarını Kaydet</button>
          <p className="text-xs text-gray-600">
            Örnek 2+1 taban: Mersin {ornekFiyat.mersin} TL · Ankara {ornekFiyat.ankara} TL · İstanbul {ornekFiyat.istanbul} TL
          </p>
        </div>
      </section>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg bg-gray-200 p-1">
          {[
            { id: 'rota', etiket: `Rota Sayfaları (${ROTA_SATIRLARI.length})` },
            { id: 'il-hizmet', etiket: `İl Hizmet Sayfaları (${IL_SATIRLARI.length})` },
          ].map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSekme(s.id)}
              className={`rounded-md px-4 py-2 text-sm font-semibold transition-all ${sekme === s.id ? 'bg-white text-gray-900 shadow' : 'text-gray-600 hover:text-gray-900'}`}
            >
              {s.etiket}
            </button>
          ))}
        </div>
        <input
          type="search"
          value={arama}
          onChange={(e) => setArama(e.target.value)}
          placeholder="İl, ilçe veya bölge ara..."
          className="admin-input max-w-xs"
          aria-label="Sayfalarda ara"
        />
        <span className="text-sm text-gray-600">{satirlar.length} sayfa</span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">Sayfa</th>
              <th scope="col" className="px-4 py-3 font-semibold">Bölge</th>
              <th scope="col" className="px-4 py-3 font-semibold">Mesafe</th>
              <th scope="col" className="px-4 py-3 font-semibold">İçerik</th>
              <th scope="col" className="px-4 py-3 font-semibold">Durum</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {satirlar.map((satir) => {
              const kayit = kayitAl(satir)
              const aktif = kayit?.aktif ?? true
              return (
                <tr key={`${satir.tur}:${satir.slug}`} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-gray-900">{kayit?.h1 || satir.ad}</div>
                    <div className="text-xs text-gray-500">{satir.altAd}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{satir.bolge}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-600">~{kayit?.mesafe_km || satir.mesafe} km</td>
                  <td className="px-4 py-3">
                    {kayit ? (
                      <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">Panelden düzenlendi</span>
                    ) : (
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">Otomatik</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {aktif ? (
                      <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">Yayında</span>
                    ) : (
                      <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800">Kapalı</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <a href={satir.url} target="_blank" rel="noopener noreferrer"
                        className="rounded-lg p-2.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900" title="Sayfayı aç" aria-label={`${satir.ad} sayfasını yeni sekmede aç`}>
                        <FaExternalLinkAlt />
                      </a>
                      <button type="button" onClick={() => aktifDegistir(satir)}
                        className="rounded-lg p-2.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900" title={aktif ? 'Yayından kaldır' : 'Yayına al'}
                        aria-label={`${satir.ad} sayfasını ${aktif ? 'yayından kaldır' : 'yayına al'}`}>
                        {aktif ? <FaEye /> : <FaEyeSlash />}
                      </button>
                      {kayit && (
                        <button type="button" onClick={() => varsayilanaDon(satir)}
                          className="rounded-lg p-2.5 text-gray-500 hover:bg-gray-100 hover:text-red-700" title="Varsayılan içeriğe dön"
                          aria-label={`${satir.ad} sayfasını varsayılan içeriğe döndür`}>
                          <FaUndo />
                        </button>
                      )}
                      <button type="button" onClick={() => duzenle(satir)}
                        className="rounded-lg p-2.5 text-[#046ffb] hover:bg-blue-50" title="Düzenle"
                        aria-label={`${satir.ad} sayfasını düzenle`}>
                        <FaEdit />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {editSlug && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white p-6">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">{formData._ad}</h2>
                <a href={formData._url} target="_blank" rel="noopener noreferrer" className="text-sm text-[#046ffb] hover:underline">
                  {formData._url}
                </a>
              </div>
              <button type="button" onClick={kapat} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100" aria-label="Kapat"><FaTimes /></button>
            </div>

            <p className="mb-6 rounded-lg bg-blue-50 p-3 text-sm text-blue-900">
              Boş bıraktığınız her alan otomatik içeriğiyle yayınlanmaya devam eder. Yalnızca değiştirmek
              istediğiniz alanları doldurun.
            </p>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="admin-label" htmlFor="f-h1">Sayfa Başlığı (H1)</label>
                <input id="f-h1" name="h1" value={formData.h1 || ''} onChange={degistir} className="admin-input" placeholder={formData._ad} />
              </div>
              <div>
                <label className="admin-label" htmlFor="f-baslik">Alt Başlık</label>
                <input id="f-baslik" name="baslik" value={formData.baslik || ''} onChange={degistir} className="admin-input" placeholder="Örn: Adıyaman Adana Evden Eve Nakliyat" />
              </div>
            </div>

            <div className="mt-4 grid gap-6 md:grid-cols-3">
              <div>
                <label className="admin-label" htmlFor="f-mesafe">Mesafe (km)</label>
                <input id="f-mesafe" name="mesafe_km" type="number" min="0" value={formData.mesafe_km ?? ''} onChange={degistir}
                  className="admin-input" placeholder={String(formData._varsayilanMesafe ?? '')} />
              </div>
              <div>
                <label className="admin-label" htmlFor="f-sure">Teslim Süresi</label>
                <input id="f-sure" name="sure_metni" value={formData.sure_metni || ''} onChange={degistir} className="admin-input" placeholder="1-2 gün" />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 pb-2 text-sm font-medium">
                  <input type="checkbox" name="aktif" checked={formData.aktif !== false} onChange={degistir} />
                  Sayfa yayında
                </label>
              </div>
            </div>

            <div className="mt-4">
              <label className="admin-label" htmlFor="f-ozet">Giriş Metni</label>
              <textarea id="f-ozet" name="ozet" rows={3} value={formData.ozet || ''} onChange={degistir} className="admin-input resize-none" />
            </div>

            <div className="mt-4">
              <label className="admin-label" htmlFor="f-ilceler">Ek İlçeler (virgülle ayırın)</label>
              <input id="f-ilceler" name="ilceler" value={formData.ilceler || ''} onChange={degistir} className="admin-input" placeholder="Örn: Sultanhanı, Eskil" />
              <p className="mt-1 text-xs text-gray-500">Buraya yazdıklarınız hazır ilçe listesine eklenir, listeyi silmez.</p>
            </div>

            <div className="mt-4">
              <label className="admin-label">Kapak Görseli</label>
              <ImageUpload value={formData.resim} onChange={(url) => setFormData({ ...formData, resim: url })} folder="rotalar" />
            </div>

            <div className="mt-4">
              <label className="admin-label">Ek İçerik (fiyat tablosundan sonra çıkar)</label>
              <RichTextEditor value={formData.icerik || ''} onChange={(html) => setFormData({ ...formData, icerik: html })} placeholder="Bu rotaya özel ek bilgi..." />
            </div>

            <div className="mt-4">
              <label className="admin-label" htmlFor="f-makale-baslik">Makale Başlığı</label>
              <input id="f-makale-baslik" name="makale_baslik" value={formData.makale_baslik || ''} onChange={degistir} className="admin-input" />
            </div>

            <div className="mt-4">
              <label className="admin-label">Makale İçeriği</label>
              <RichTextEditor value={formData.makale || ''} onChange={(html) => setFormData({ ...formData, makale: html })} placeholder="Boş bırakırsanız otomatik makale yayınlanır." />
            </div>

            <div className="mt-4">
              <label className="admin-label" htmlFor="f-fiyat-notu">Fiyat Tablosu Notu</label>
              <input id="f-fiyat-notu" name="fiyat_notu" value={formData.fiyat_notu || ''} onChange={degistir} className="admin-input" />
            </div>

            <hr className="my-6" />
            <h3 className="mb-4 font-bold">SEO Ayarları</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="admin-label" htmlFor="f-mt">Meta Title</label>
                <input id="f-mt" name="meta_title" value={formData.meta_title || ''} onChange={degistir} className="admin-input" />
              </div>
              <div>
                <label className="admin-label" htmlFor="f-mk">Meta Keywords</label>
                <input id="f-mk" name="meta_keywords" value={formData.meta_keywords || ''} onChange={degistir} className="admin-input" />
              </div>
            </div>
            <div className="mt-4">
              <label className="admin-label" htmlFor="f-md">Meta Description</label>
              <textarea id="f-md" name="meta_description" rows={2} value={formData.meta_description || ''} onChange={degistir} className="admin-input resize-none" />
            </div>
            <div className="mt-4 grid gap-6 md:grid-cols-2">
              <div>
                <label className="admin-label" htmlFor="f-og">OG Image URL</label>
                <input id="f-og" name="og_image" value={formData.og_image || ''} onChange={degistir} className="admin-input" />
              </div>
              <div>
                <label className="admin-label" htmlFor="f-canonical">Canonical URL</label>
                <input id="f-canonical" name="canonical_url" value={formData.canonical_url || ''} onChange={degistir} className="admin-input" />
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button type="button" onClick={kapat} className="rounded-lg border border-gray-300 px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-50">
                Vazgeç
              </button>
              <button type="button" onClick={kaydet} disabled={kaydediliyor} className="admin-btn-primary flex items-center gap-2 disabled:opacity-60">
                <FaSave /> {kaydediliyor ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
