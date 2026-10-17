# Paki Diyabet — Mevcut Netlify Projesini GitHub'a Taşıma

## Doğrulanan kaynak durumu (17.10.2026)

- GitHub: `kanunal99-jpg/Paki-Diyabet`, başta **boş** depo.
- Netlify: `pakidiyabet`, site ID `2dc3dce5-a7a6-491b-a7ca-6ff4a7a356f6`.
- Son production deploy: `6ad3a9dfdba55222435b4c2d`; Next.js, `ready`; `commit_ref=null`, `branch=null`, `has_source_zip=true`. Bu Git bağlantısının olmadığına işaret eder.
- Kitaplıktaki `Paki-Diyabet-Kayit-Giris-Kod-Duzeltmesi.zip` paketi 61 öğeden oluşan **yalnız değişen kaynaklar, patch, test raporları** paketidir. İçindeki README bu paketin tam site olmadığını belirtir. `package.json`, `package-lock.json` ve Next ana sayfa dosyası pakette yoktur.
- Netlify başarılı deploy indirimi, çoğu durumda **dağıtılan derlenmiş dosyaları** verir; çalışılabilir tam TS/TSX kaynak kodunun eşdeğeri olarak kabul etmeyin. Orijinal çalışma alanı / tam kaynak arşivi aranmalı.

## Güvenli geçiş prosedürü

1. **Kaynak kurtarma** — son Netlify dağıtımını oluşturan orijinal proje çalışma alanından tam sürüm edin: `package.json`, lockfile, `app/` veya `pages/`, `lib/`, `db/`, `public/`, Next config, testler, kaynak veri dosyaları. 17 Ekim giriş/kayıt düzeltmelerini tam tabana tek tek eşleştir. Her dosyanın tamamlığı ve commit/snapshot kaynağı kayda geçsin.
2. **Gizli veri kontrolü** — `.env*`, token, bağlantı parolası, kullanıcı/sağlık kaydı, production veri dump'ı, kişisel log/git tarihi ekleme. Gizli ayarların yalnızca **isimlerini** belgeleyip değerlerini Netlify'de muhafaza et.
3. **Depoya transfer** — kod ve dizin yapısı bu deponun köküne gelsin. `netlify.toml`, `scripts/verify-source.mjs`, `.github/workflows/ci.yml`, `ANAYASA.md` korunup mevcut projeyle uyarlansın. Uygulama gerçek build için kilitli dependency ile çalışmalı. Rapor ZIP'i ana uygulamanın yerine koyma.
4. **Yerel/CI kanıtı** — `node scripts/verify-source.mjs`, `npm ci`, lint/typecheck, birim/integration, `npm run build`, login/register ve anonim sınır E2E; veri kalıcılığı/izolasyon. Geçmeyen kapı canlıya geçmez. Gerekirse ek scriptler sürüme göre entegre edilir.
5. **Önizleme/roll-back** — Netlify mevcut çalışan deploy ID kayda geçir, özelleştirilmiş domain/kimlik/veri/env ayarlarını ayrı doğrula, önizleme fonksiyonlarını sentetik kullanıcıyla çalıştır. Gerçek veri aktarımı veya silme yapılmaz.
6. **Aynı Netlify projesini Git'e bağla** — https://app.netlify.com/projects/pakidiyabet → **Project configuration → Developer settings → Continuous deployment → Repository → Link repository**. GitHub'a izin ver, `kanunal99-jpg/Paki-Diyabet` seç, production branch `main`. Proje yeniden oluşturulmayacak. Next.js build `npm run build`, publish `.next`, site root repo kökü. Netlify UI ile `netlify.toml` çelişirse dosya geçerlidir. GitHub App'in bu depoya erişim yetkisi doğrulanmalı.
7. **Gerçek otomatik yayın denemesi** — korumalı PR merge sonrası `main` commit SHA'sının Netlify otomatik deploy'unda göründüğünü, `ready` olduğunu ve canlı `/, /giris, /api/status` yanıtlarını doğrula. Gerçek hesapla giriş/üyelik denemeleri için ayrı yetkili doğrulama gerekir. Smoke başarısızsa önceki çalışan deploy'a geri dön.
8. **Takip** — GitHub required status checks, PR review, deploy previews, haftalık/versiyonlu backup ve hata log kontrollerini etkinleştir.

## Mevcut araç erişimi nedeniyle henüz otomatik yapılamayanlar

Bu oturumun Netlify bağlantısı proje ve dağıtım **okuma** yetenekleri sağlıyor, ancak kaynak ZIP'ini indirme ve mevcut siteyi Git deposuna bağlama işlemini sağlayan eylem bulunmuyor. Bu nedenle işlemler kullanıcıya yapılmış gibi gösterilmez. Siteye başka bir repodan yeni deploy tetikleyecek tehlikeli kestirme uygulanmaz.

## Üretim onayı kanıt tablosu

| Aşama | Kanıt | Durum |
|---|---|---|
| Repo kuralları | README / ANAYASA | Hazır |
| Repo tam kaynak | package.json / lockfile / app / src | Bekliyor |
| CI | GitHub Actions test + build successful | Bekliyor |
| Netlify bağlantısı | UI Repository: kanunal99-jpg/Paki-Diyabet main | Bekliyor |
| Otomatik yayın | commit SHA = Netlify deploy commit_ref | Bekliyor |
| Production | Smoke + geri alma doğrulaması | Bekliyor |

**Resmi başvuru:** https://docs.netlify.com/build/git-workflows/repo-permissions-linking/
