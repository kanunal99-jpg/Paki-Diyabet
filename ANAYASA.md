# PAKİ DİYABET — PROJE GELİŞTİRME ANAYASASI

**Yürürlük:** 17 Ekim 2026 · **Kapsam:** Paki Diyabet'in bütün kaynak kodu, testleri, GitHub sürümleri, Netlify dağıtımları, API ve veri güvenliği.  
Bu belge hedef çalışma standardını belirler. **Kuralların depoya yazılması, henüz tamamlanmamış Git bağlantısını veya testleri tamamlanmış saydırmaz.**

## Madde 1 — Tek kaynak: GitHub
1. Uygulamanın geliştirilebilir **tam kaynak kodu**, yapılandırması, bağımlılık kilit dosyası, test ve dokümantasyonu `kanunal99-jpg/Paki-Diyabet` deposunda sürümlenir.
2. Netlify **derleme/yayın hedefidir**, kaynak kodun asıl deposu değildir. Derlenmiş site dosyaları, Netlify deploy çıktısı veya kısmi yama, tam kaynağın yerine geçmez.
3. Üretim dalı `main`; özellik/hata düzeltmeleri ayrı dallarda ve gözden geçirilen Pull Request ile entegre edilir. `main` dalında test ve gerekli kontroller başarısızsa merge yapılmaz.
4. Her değişiklik commit geçmişinde ve mümkünse ilgili talep/PR ile izlenebilir olmalıdır.

## Madde 2 — Otomatik Netlify yayını
1. Mevcut **aynı** Netlify sitesi `pakidiyabet`, bu deponun `main` dalına Git tabanlı Continuous Deployment ile bağlanacaktır; gereksiz ikinci site oluşturulmayacaktır.
2. `main` üzerine onaylı kaynak değişikliği geldiğinde Netlify otomatik olarak bağımlılıkları kuracak, Next.js üretim build'i yapacak ve **başarılı dağıtımı** yayınlayacaktır. Pull Request için Deploy Preview kullanılacaktır.
3. Başarısız build/eksik kaynak/yetki ihlali canlı yayına geçirilmez. Dağıtımdan sonra production smoke uygulanır; ciddi regresyonda son çalışan deploy'a rollback yapılır. “Ready” tek başına fonksiyonel test kanıtı değildir.
4. Normal akış elle ZIP/Drop yükleme değil, GitHub → Netlify CI/CD'dir. Ancak acil rollback için güvenli manuel yöntem belgeli tutulur.

## Madde 3 — Zorunlu geliştirme döngüsü
**Araştır → kök nedeni bul → düzelt → uygula → build → test → doğrula → deploy → production/smoke test → kanıtla.**
Tamamlanmamış/başarısız işlem tamamlandı olarak bildirilmez. Kök neden, değişen dosya, test kanıtı, deployment commit'i ve yayının sonucu kaydedilir.

## Madde 4 — Katmanlı dayanıklılık
Kritik alanlarda **ana servis → alternatif → gerçek fallback → hata yönetimi → güvenli varsayılan → log/izleme → smoke test** uygulanır.
Kimlik doğrulama, API, veritabanı/veri kalıcılığı, harici sağlayıcılar, dosya depolama, frontend/backend, ödeme/kota ve deploy için tek hata noktasından kaçınılır. Fallback **gerçekten çalıştırılarak** test edilir, sahte başarı üretmez.

## Madde 5 — Güvenlik, mahremiyet, maliyet
1. Bütün dış girdiler doğrulanır. Kimlik/yetki kontrolleri sunucu tarafında zorunludur; kullanıcılar arası sağlık verisi izolasyonu E2E/integration testlerinde doğrulanır.
2. Gerçek sağlık verileri, oturum çerezleri, e-postalar, gizli anahtarlar, erişim tokenları ve `.env*` dosyaları GitHub'a konmaz. Secrets Netlify ortam değişkenlerinde/uygun güvenli kasada tutulur. Tanı logları hassas içeriği ifşa etmez.
3. Önce ücretsiz/açık kaynak/yerel veya ücretsiz katman. Yeni maliyeti doğuran hiçbir değişiklik kullanıcı onayı olmadan yapılmaz.
4. Gerçek kayıtlar korunur: yedekleme, veri kalıcılığı, geri dönüş stratejisi olmadan riskli veri yapısı değişikliği canlıya çıkmaz.

## Madde 6 — Sürüm kalite kapıları
- CI: kaynak bütünlüğü, bağımlılık çözümlemesi, TypeScript/typecheck, lint, birim/integration, üretim build; uygun durumlarda Playwright E2E ve güvenlik/kimlik testi.
- Release: giriş, kayıt, çıkış, yetkisiz erişim (401/403), kullanıcı izolasyonu, veri kalıcılığı, API sağlık uçları, mobil görünüm ve hata/kayıt izleme.
- Merge/production için açık doğrulama sonucu zorunludur. CI'da olmayan bir test varmış gibi raporlanmaz.
- GitHub branch protection / required checks, Netlify Deploy Preview ve post-deploy smoke etkinleştirilir ve ayrıca doğrulanır.

## Madde 7 — Dosyalar ve sürüm kanıtı
- Her önemli sürüm: sürüm notu, kaynak commit SHA, değişiklikler, test sonuçları, Netlify deploy ID/URL ve rollback yolu.
- Android APK barındıran herhangi bir ilgili alt proje oluşursa önemli sürümlerde APK release artifact'ı cihazdan indirilebilir şekilde eklenir ve erişimi doğrulanır.
- Yönetim yapılandırmaları ve belgeler kaynakla aynı depoda tutulur.

## Madde 8 — Geçişte canlı sürümü koruma
Kaynağın **eksiksizliği ve build edilebilirliği doğrulanmadan** mevcut Netlify production projesine Git bağlantısı kurulup yeni yayın tetiklenmez. Derleme çıktısı özgün TypeScript/Next.js kaynaklarının yerine konmaz. Önce kaynak, sonra CI, sonra staging/preview, ardından mevcut Netlify projesine `main` bağlantısı ve son olarak production smoke.

## Madde 9 — Doğruluk ilkesi
Her görev için **yapıldı / doğrulandı / engellendi / yapılmadı** ayrı raporlanır. Hesap ve veri güvenliğine etkisi olan testlerde gerçek kullanıcı yerine sentetik fixtures kullanılır. Sürümü “otomatik yayınlanıyor” olarak adlandırmak için Netlify Git bağlantısı ve gerçek `main` commit tetiklemesiyle bir build/deploy kanıtı bulunmalıdır.

## İlk geçiş kontrol listesi

- [x] Mevcut Netlify projesi ve son `ready` deploy tespit edildi.
- [x] Hedef GitHub deposu belirlendi.
- [x] CI/CD anayasası ve koruyucu kaynak doğrulaması repoya yazıldı.
- [ ] Orijinal kaynak kodun **tamamı** kurtarıldı / repoya aktarıldı.
- [ ] Testler, Next.js build, E2E ve üretim öncesi smoke başarılı.
- [ ] Netlify mevcut projesi bu GitHub deposunun `main` dalına bağlandı.
- [ ] GitHub'a yeni commit → Netlify otomatik deploy gerçek testle doğrulandı.
- [ ] Production smoke, veri koruması ve rollback doğrulandı.
