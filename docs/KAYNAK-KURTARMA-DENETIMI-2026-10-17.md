# Kaynak Kurtarma Denetimi — 17 Ekim 2026

## Gerçekten doğrulananlar

İncelenen dosya: kullanıcı dosya kitaplığındaki `Paki-Diyabet-Kayit-Giris-Kod-Duzeltmesi.zip` (214.366 bayt).

- ZIP içeriğinde toplam **61 dosya** var; açılmış toplam 690.579 bayt.
- `SHA256.json` içerisinde 60 dosyanın SHA-256 değeri kayıtlı; **60/60 eşleşti**, eksik veya uyuşmayan dosya yok.
- Bağımsız Node `--check` sözdizimi kontrolü: 7 adet `.mjs/.cjs` dosyasının tamamı **geçti**.
- Kısıtlı yüksek güvenlikli desen taramasında özel anahtar başlığı, GitHub token deseni, yaygın API anahtarı öneki ve belirli gizli `.env` atamaları **bulunmadı**. Bu tarama tam güvenlik veya gizli bilgi bulunmadığı garantisi değildir; tam tarama zorunlu.
- Pakette `app/api/`, `app/`, `lib/`, `db/`, `tests/`, `docs/`, `reports/` ve bir patch var. Dosyalar **bir düzeltme/kurtarma paketi**; asıl projenin tümü değil.
- Paket README'si tam Next.js kaynaklarının bu ZIP'de olmadığını açıkça söylüyor.

## Eksik ve transferi engelleyen dosyalar

- `package.json` — **yok**
- `package-lock.json`, `pnpm-lock.yaml` veya `yarn.lock` — **yok**
- `app/page.tsx` veya Next ana sayfa alternatifi — **yok**
- `next.config.{js,mjs,ts}` — **yok**
- `tsconfig.json` — **yok**
- Tam test fikstürleri, verilere erişim düzeni, özgün bağımlılıklar/ortam değişkeni envanteri — **doğrulanmadı**

**Bu eksikler düzeltilmeden `npm ci`, gerçek Next.js `npm run build` veya oturum/kayıt E2E suite başarıyla çalıştırılamaz.** Doğrulanmış 7 JavaScript dosyasının syntax başarısı uygulamanın çalıştığı anlamına gelmez.

## Netlify mevcut dağıtım doğrulaması

- Site: `pakidiyabet`, site ID: `2dc3dce5-a7a6-491b-a7ca-6ff4a7a356f6`
- Deploy: `6ad3a9dfdba55222435b4c2d`
- Deploy `ready`; `commit_ref=null` ve `branch=null`. Bu Netlify'de otomatik Git bağlantısı kanıtı olmadığını gösterir.
- `has_source_zip=true`; **bu oturumdaki Netlify bağlayıcısı ZIP dosyasını indirecek veya mevcut siteye repo bağlayacak eylem sağlamıyor.**
- GitHub Actions run `39055417064`: `Verify complete original application source` **failure**, diğer build/test adımları bu nedenle atlandı; kapı eksik kaynak kodu doğru şekilde reddetti.

## Kurtarma için aranan ve bulunamayanlar

- GitHub'da kullanıcıya bağlı erişilebilir projelerde Netlify üretim sürümünün tam Next.js kaynağı bulunamadı.
- Bağlı Google Drive'da `Paki Diyabet`, `pakidiyabet`, `source`, `Netlify` aramalarında tam proje bulunamadı.
- Mevcut kısmi ZIP tam proje sayılmadı.
- Canlı sitenin HTTP uçlarına bu ortamdan test erişimi başarısız olduğundan canlı smoke yeni yapılmış gibi raporlanmaz.

## Tamamlama eşiği

1. Mevcut yayına ait tam orijinal çalışma klasörünü veya kaynak ZIP'ini yetkili Netlify/Sites arayüzünden edin.
2. Kaynakları gizli veri taraması ve eksiksizlik kontrolünden sonra bu depoya taşı.
3. GitHub CI'da install/build/unit/E2E başarılı olmalı; sağlık verisi izolasyonu ve veri kalıcılığı sentetik oturumlarla doğrulanmalı.
4. Mevcut Netlify sitesi aynı repo `main` dalına bağlanmalı; ikinci site oluşturma.
5. `main` commit SHA'sı Netlify deploy kaydında görünmeli; yeni production deploy `ready` + HTTP smoke ve rollback doğrulaması yapılmalı.

**NOT:** “Şimdiye kadar tamamlananlar” anayasa, kılavuz, GitHub güvenli kalite kapıları ve bu denetimdir. “Tam transfer” ve “Netlify otomatik yayın” henüz tamamlanmamıştır.

## Canlı smoke doğrulaması — aynı gün ek çalışma

**GitHub Actions run:** https://github.com/kanunal99-jpg/Paki-Diyabet/actions/runs/39056689315  
**Job:** `live-smoke` (117465984331) — **success**.

Kısmi ZIP'deki `tests/production-smoke.mjs` dosyası depoya güvenli salt-okunur test olarak taşındı; `.github/workflows/production-smoke.yml` ile canlı ortamdan bağımsız GitHub Actions testi yapıldı. GitHub iş günlüğü **32 başarılı / 0 başarısız** kontrol gösterdi:

- Ana sayfa, giriş/kayıt ekranı, çıkış ekranı ve Netlify Identity sağlayıcı ayarları: HTTP 200.
- `/api/status` veritabanı sağlık yanıtı: HTTP 200, JSON `ok: true`.
- Anonim kayıtlar, günlük, dosyalar, yedekleme ve paylaşım API'leri: HTTP 401; sahte kullanıcı başlığı/bozuk JWT yetki sağlamadı.
- Manifest, service worker, çevrimdışı sayfa, ikon ve Next.js CSS/JS dosyaları: HTTP 200.

**Sınır:** Gerçek e-posta onayı, hesap oluşturma, kimlik sağlayıcıdan gerçek JWT edinme, kullanıcıya ait veri güncelleme ve veri kalıcılığı bu salt-okunur testte denenmedi. CI kaynak bütünlüğü/gerçek üretim build hâlâ eksik kaynak nedeniyle başarısız; Netlify'nin GitHub'a otomatik bağlı olduğunu bu smoke kanıtlamaz.

## İkinci denetim — eksik modül bağımlılıkları ve CI düzeltmeleri

Kaynak ZIP içindeki `app/`, `lib/` ve `db/` yollarına ait .ts/.tsx dosyaları üzerinden **128 yerel import** incelendi. **8 farklı modül yolu** ZIP içinde bulunamadı:

1. `app/session-reconciler`
2. `lib/backup`
3. `lib/documents`
4. `lib/health`
5. `lib/journal`
6. `lib/return-path`
7. `lib/server-journal`
8. `lib/shares`

Bunların asıl kaynakta mevcut olup olmadığını anlamak için tam çalışma alanı gerekir. Eksikler, ZIP içindeki dosyaların silindiğinin veya canlı ortamda kodun hatalı çalıştığının kanıtı değildir. ZIP'in kısmi olduğunu gösterir.

GitHub'a aktarılan 10 `app/`, `db/`, `lib/` dosyasının **Git blob SHA-1 değerleri kısmi ZIP'deki aynı dosyaların Git blob SHA-1 değerleriyle 10/10 birebir eşleşti**. Aktarımda bu 10 kaynak dosyasının bozulduğuna yönelik kanıt yok.

### Düzeltilen CI kusurları

- **Önceki kusur:** `npm run lint --if-present`, `npm run typecheck --if-present` ve `npm test --if-present` kontrol script'i olmayan bir projede testleri **sessizce atlayabilirdi**.
- **Düzeltme:** `lint`, `typecheck`, `test`, `test:e2e` ve `build` scriptleri artık zorunlu. Script eksikse kalite kapısı başarısız; E2E Chromium adımı belirlendi. Bu adımlar tam proje olmadığı için henüz çalıştırılamaz.
- **Önceki/ara kusur:** npm cache kurulumu, eksik lockfile nedeniyle asıl kaynak denetiminden önce hata oluşturabilirdi.
- **Düzeltme:** `scripts/verify-source.mjs` ilk adım yapıldı; kaynak eksikliği doğru kök neden olarak gösterilecek.
- **Ek kontrol:** Salt-okunur production smoke GitHub Actions içinde **her gün 08:15 Türkiye saati** için zamanlandı (`05:15 UTC`). GitHub zamanlayıcısında gecikme olabilir; otomatik testler gerçek kullanıcı login/registration doğrulamasının yerine geçmez.
- Son değişikliklerden sonra `Source, Test and Build` run **39057757656**, eksik kaynak denetiminde beklenen şekilde başarısızdır. `Production Read-Only Smoke` run **39057734192** başarılıdır.

### Önemli sınır

Netlify `ready` hali üretim dosyalarının yayımlandığı anlamına gelir; özgün geliştirilebilir Next.js kaynak kodu, ilgili deploy download dosyalarında her zaman bulunmaz. Mevcut Netlify connector erişimi repoyu doğrudan bağlamayı ya da üretim kaynağının orijinal tamamını indirmeyi desteklemiyor. **GitHub'a tam taşıma ve CD, şu aşamada tamamlanmadı.**

