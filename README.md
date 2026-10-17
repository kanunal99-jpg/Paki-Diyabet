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
