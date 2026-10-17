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

## Yeni kurtarma yöntemi — Netlify arayüzünden kaynakları GitHub'a dışa aktarma

Netlify'nin 2026 tarihli [Create a repo from Netlify](https://docs.netlify.com/build/git-workflows/create-a-repo-from-netlify/) özelliği, Git'e bağlı olmayan projeler için **Project configuration → Developer settings → Continuous deployment → Repository → Link to repository → Push to new repository** yolunu anlatır. Bu işlemde Netlify **yeni GitHub deposu oluşturur ve proje dosyalarını oraya iter**. 

**Önemli:** Kullanıcının hedefi **mevcut** `kanunal99-jpg/Paki-Diyabet` deposu. Bu nedenle `Push to new repository` doğrudan hedef depoya taşıma değil, **geçici kurtarma kaynağı**dır. Netlify bu seçeneği mevcut proje için gösteriyor ve gerçekten orijinal `package.json`/lockfile/`app/page.tsx`/lib/db kaynaklarını aktarıyorsa, yeni depodaki kaynak GitHub üzerinden denetlenir, sonra bu mevcut depoyla güvenli bir PR ile birleştirilir. En son Netlify'nin repo bağlantısı mevcut `Paki-Diyabet` `main` dalına değiştirilir. Bu ara depoya hasta/veri/gizli anahtar girilmemelidir.

Bu seçeneğin kullanıcı hesabında kullanılabilirliği, proje dosyalarının tamlığı ve sonucu **bu oturumda doğrulanmadı**. Netlify connector'ı arayüzde `Push to new repository` veya `Link repository` eylemini sunmuyor; bu zorunlu kullanıcı arayüzü adımı atlanamaz. Netlify'nin [mevcut siteyi repo ile bağlama](https://docs.netlify.com/build/git-workflows/repo-permissions-linking/) seçeneği de bu arayüz üzerinden yapılır.

### Otomatik yayın kesin kabul testi

- [ ] Bu depoda gerçek tam kaynak; `npm ci`, lint, typecheck, unit/integration, gerçek giriş/kayıt E2E ve `next build` geçti
- [ ] PR merge öncesi required checks / code review aktif
- [ ] Netlify'de **mevcut** `pakidiyabet` projesi `kanunal99-jpg/Paki-Diyabet` `main` dalına bağlı (ikinci canlı site yok)
- [ ] Güvenli bir test commit'i main'e alındı ve Netlify'de **otomatik tetiklenen** deploy'da aynı commit SHA görüldü
- [ ] Production smoke + gerçek yetkili kimlik doğrulama + kayıt/veri izolasyonu + rollback doğrulandı

`netlify.toml` gerekli kaynaklar eksikken production derlemesini engeller; ayrıca artık lint/typecheck/unit testleri build'den **önce zorunlu** koşar. E2E GitHub required checks üzerinden ayrıca zorunludur.

## DURUM GÜNCELLEMESİ — otomatik yayın GERÇEKTEN çalışıyor (17 Ekim, 22:50 TRT)

Bu belgenin ilk kısmı kurtarma öncesi yazılmıştır. Sonraki doğrulanmış durum:

- Kaynak kod, Netlify'nin **Push to new repository** işlemiyle özel `kanunal99-jpg/Paki-Diyabet-Netlify-Kurtarma` GitHub deposuna aktarıldı: 291 özgün dosya, yaklaşık 115 MB.
- Tam kaynak için GitHub Actions kalite doğrulaması: [run 39063750090](https://github.com/kanunal99-jpg/Paki-Diyabet-Netlify-Kurtarma/actions/runs/39063750090), pnpm frozen install, lint, TypeScript, Netlify/sistem testleri ve Next.js build **başarılı**. Test yalnızca `audit/full-source-build-20261017` dalında çalıştırıldı.
- Netlify projesi özel kurtarma deposuna Git olarak bağlandı; production branch `main`.
- `main` commit `9cfd17f451c92315e0d07880528533902b8ce102` otomatik Netlify deploy `6ad3d13033218a91b2fa6cc4` oluşturdu, production `ready`, 2026-10-17 19:50:51 UTC. İki tarafta commit SHA'sı **eşleşiyor**.
- Yeniden çalıştırılmış salt-okunur smoke: [run 39057734192](https://github.com/kanunal99-jpg/Paki-Diyabet/actions/runs/39057734192), son deneme **32/32 başarılı**. Gerçek kullanıcı hesabı ile kayıt/giriş E2E **yapılmadı**.
- **OTOMATİK NETLIFY YAYINI ARTIK VAR**, ancak şimdilik doğru ve eksiksiz kaynağa sahip özel **kurtarma deposundan** çalışıyor; istenen asıl `kanunal99-jpg/Paki-Diyabet` deposu henüz bağlanmadı.

### Asıl depoya geçiş güvenliği

- Asıl GitHub deposu şu anda `public`; tam ve doğru kaynak `private` kurtarma deposunda. Kaynağı sırf geçişi bitirmek için gizli/sahiplik denetimi olmadan herkese açık repoya aktarmayın.
- Kurtarılan proje `pnpm@11.25.0`, `pnpm-lock.yaml`, `node >=22.13` (Netlify build ortamında Node 24) ve `pnpm run build` kullanıyor. Eski depodaki `npm ci` ve zorunlu `package-lock.json` varsayımları kaynakla **uyuşmuyor**.
- Amaç: önce iki depodaki kod/gizlilik/lisans farklarını denetlemek; gerekiyorsa hedef depoyu kullanıcı tarafından private yapmak veya güvenli kaynakları seçerek transfer etmek; doğru pnpm build/test iş akışını PR üzerinde çalıştırmak; ancak sonra Netlify Git bağlantısını mevcut hedef `main` dalına taşımak.
- **Çalışan özel depo bağlantısını erken kesmeyin.** İkinci site oluşturmayın, mevcut veritabanını veya Identity ayarlarını sıfırlamayın, üretimde sahte hasta/kayıt oluşturmayın.
