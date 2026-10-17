# Paki Diyabet Rehberim

**Üretim sitesi:** https://pakidiyabet.netlify.app  
**Hedef kaynak deposu:** https://github.com/kanunal99-jpg/Paki-Diyabet  
**Netlify mevcut proje:** https://app.netlify.com/projects/pakidiyabet  
**Politika:** [ANAYASA.md](ANAYASA.md)  
**Taşıma prosedürü:** [docs/GITHUB-NETLIFY-GECIS.md](docs/GITHUB-NETLIFY-GECIS.md)

## Durum — 17 Ekim 2026

Bu depo, mevcut Netlify projesinin **kalıcı ve tek kaynak deposu** olarak seçildi. Ancak orijinal Next.js uygulamasının **eksiksiz kaynak kodu henüz depoya aktarılmadı** ve Netlify Git bağlantısı **henüz etkinleştirilmedi**. Bu depodaki belgeler ve yapılandırma mevcut sitenin kaynak kodunun yedeği değildir.

Netlify'nin son doğrulanan üretim dağıtımı: `6ad3a9dfdba55222435b4c2d` (ready; 17 Ekim 2026). Bu dağıtım Git commit'iyle ilişkilendirilmemiş bir doğrudan yüklemedir.

## Hedef çalışma

`feature/*` → Pull Request → CI / build / test / inceleme → `main` → **Netlify otomatik production build + deploy** → üretim smoke → gerekirse rollback.

**Üretim güvenliği:** Kaynak ve yapılandırma doğrulanana dek bu repoyu mevcut Netlify sitesine bağlayıp canlı dağıtımı tetiklemeyin. `scripts/verify-source.mjs` eksik kodla build yapılmasını engeller. Mevcut canlı sürüm korunmalıdır.

### Eksik kaynaklar

Çalışan uygulamanın `package.json`, bağımlılık kilit dosyası, ana sayfa giriş noktası, Next ayarları, bütün uygulama/API/DB kaynakları ve değişken envanteri (değerleri değil) eksiksiz aktarılıp denetlenmelidir. 17 Ekim tarihli “Paki-Diyabet-Kayit-Giris-Kod-Duzeltmesi.zip” yalnızca **değişen** kaynakları içeriyor; tek başına bir web sitesi oluşturmaz.

Ayrıntılı işlemler ve başarı ölçütleri: [GitHub → Netlify geçiş kılavuzu](docs/GITHUB-NETLIFY-GECIS.md).

> Asla gerçek hasta/sağlık verisi, parola, token veya gizli ortam değişkenini Git deposuna eklemeyin.

## Sites kaynak bağlantısına dair ek bulgu (17 Ekim 2026)

Dosya kitaplığına bağlı ayrı bir ChatGPT Sites projesi bulundu: [Paki Diyabet Rehberim](https://paki-diyabet-rehberim.kanunal99.chatgpt.site) (Sites kaynak sürümü 6). Kitaplık yüzeyinde yalnızca sitenin işlenmiş/görünür sayfa metni bulunuyor; **tam TS/TSX kaynak kodu sağlanmıyor**. Bu kaydın Netlify'de yayınlanan Next.js sürümüyle bire bir aynı proje olduğu ayrıca doğrulanmalıdır. Sites kaydı, Netlify kaynak ZIP'inin veya tam Next.js uygulamasının yerine kullanılamaz.

Kısmi düzeltme ZIP'i için SHA-256 ve syntax denetimi: [kaynak kurtarma raporu](docs/KAYNAK-KURTARMA-DENETIMI-2026-10-17.md).

## Kısmi kaynak kurtarma ve gerçek test ilerlemesi

Doğrulanmış 17 Ekim kaynak ZIP'inden `app/`, `lib/`, `db/` yollarına **10 gerçek uygulama dosyası**, ayrıca `tests/production-smoke.mjs` aktarıldı. Bu bir **kısmi kurtarmadır**, tam uygulama veya build edilebilir Next.js projesi değildir. Açık eksikler için [kaynak kurtarma denetimi](docs/KAYNAK-KURTARMA-DENETIMI-2026-10-17.md) ve [Issue #1](https://github.com/kanunal99-jpg/Paki-Diyabet/issues/1) izlenir.

**Canlı test kanıtı:** [GitHub Actions run 39056689315](https://github.com/kanunal99-jpg/Paki-Diyabet/actions/runs/39056689315) — **32/32 salt-okunur production smoke geçti.** Gerçek kayıt/giriş E2E ve GitHub→Netlify CD hâlâ bekliyor.

## CI/CD hazırlık denetimi (17 Ekim 2026, 21:30 TRT sonrası)

- [Kaynak bütünlüğü regresyonu](https://github.com/kanunal99-jpg/Paki-Diyabet/actions/runs/39059186763): **4/4 geçti**. Boş repo, eksik kalite scriptleri ve npm uyumsuz lock dosyası production hazırlık denetimini geçemez.
- Netlify `netlify.toml` şimdi **source gate → lint → typecheck → unit/integration → Next.js build** sırasında herhangi bir hata olursa yayın derlemesini durdurur.
- Gerçek kaynaklarda `@netlify/database` ve `@netlify/blobs` kullanımı vardır. PostgreSQL başlangıç migration dosyası kısmi ZIP'de olmadığından zorunlu kaynak kontrolüne dahil edildi; üretim verilerine ve schema'ya dokunulmadı.
- Güncel tam uygulama kalite iş akışı `SOURCE_INCOMPLETE` nedeni ile **başarısızdır (beklenen güvenli engel)**; tam Next.js kaynak projesi ve Netlify native Git bağlantısı **halen yok**.
- Resmi Netlify kaynak kurtarma seçeneği: [Push to new repository](https://docs.netlify.com/build/git-workflows/create-a-repo-from-netlify/). Arayüzde mevcutsa *geçici bir yeni depo* oluşturur; içeriği doğrulandıktan sonra bu **mevcut Paki-Diyabet deposuna** taşınmalıdır. Bu adım henüz kullanıcı hesabında uygulanmadı.
