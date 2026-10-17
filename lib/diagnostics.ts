// Shared, data-free diagnostic vocabulary. Never put raw errors, request bodies,
// email addresses, health values, URLs, credentials or SQL in a diagnostic.
export const areas=['auth','session','records','journal','documents','backup','privacy','shares','shared','sync-context','stock-use','feedback','foods','status','runtime','offline'] as const;
export type DiagnosticArea=typeof areas[number];
export const stages=['settings','signup','login','recovery','callback','password-save','logout','session-check','session-refresh','request','read','create','update','delete','restore','connect','query','transaction','file-read','file-write','file-delete','external-fetch','render','local-storage','offline-queue'] as const;
export type DiagnosticStage=typeof stages[number];
type Definition={category:string,title:string,reason:string,check:string,retryable:boolean,identified:boolean};
const definition=(category:string,title:string,reason:string,check:string,retryable=false,identified=true):Definition=>({category,title,reason,check,retryable,identified});
export const diagnosticCodes={
 AUTH_ACCOUNT_EXISTS:definition('Kimlik','Hesap zaten kayıtlı','Kimlik hizmeti bu e-posta için mevcut hesap bildirdi.','Mevcut hesapla giriş veya şifre yenileme'),
 AUTH_EMAIL_UNCONFIRMED:definition('Kimlik','E-posta doğrulanmamış','Kimlik hizmeti e-posta doğrulaması gerektiğini bildirdi.','Doğrulama bağlantısı ve e-posta teslimi'),
 AUTH_PASSWORD_POLICY:definition('Kimlik','Şifre koşulu karşılanmadı','Kimlik hizmeti şifre koşulunu reddetti.','Şifre uzunluğu ve sağlayıcı şifre politikası'),
 AUTH_SIGNUP_DISABLED:definition('Ayar','Yeni kayıt kapalı','Kimlik hizmeti yeni kayda izin vermiyor.','Identity kayıt ayarı'),
 AUTH_EMAIL_PROVIDER_DISABLED:definition('Ayar','E-posta girişi kapalı','Kimlik ayarlarında e-posta sağlayıcısı etkin değil.','Identity e-posta sağlayıcısı'),
 AUTH_INVALID_CREDENTIALS:definition('Kimlik','Giriş bilgileri reddedildi','Kimlik hizmeti geçersiz giriş bilgisi bildirdi.','Hesabın e-posta ve şifresi'),
 AUTH_REQUIRED:definition('Kimlik','Oturum gerekli','Bu işlem için doğrulanmış bir sunucu oturumu bulunamadı.','Giriş ve sunucu oturumu'),
 AUTH_CALLBACK_INVALID:definition('Doğrulama','Bağlantı reddedildi','Kimlik hizmeti bağlantının geçersiz veya süresi dolmuş olduğunu bildirdi.','Doğrulama/kurtarma bağlantısının süresi ve kullanımı'),
 AUTH_REQUEST_REJECTED:definition('Kimlik','İstek reddedildi; neden belirsiz','İstek reddedildi ancak doğrulanmış özel bir ret nedeni alınamadı.','Takip koduyla Identity isteği ve sağlayıcı yanıtı',false,false),
 AUTH_PROVIDER_UNAVAILABLE:definition('Kimlik hizmeti','Kimlik hizmeti isteği tamamlayamadı','Kimlik hizmetinden 5xx yanıtı alındı.','Identity hizmet durumu ve ilgili istek',true),
 AUTH_RESPONSE_INVALID:definition('Kimlik hizmeti','Kimlik yanıtı geçersiz','Yanıt beklenen doğrulanmış kullanıcı alanlarını içermiyor.','Identity kullanıcı yanıtı ve SDK sözleşmesi'),
 AUTH_CONFIGURATION:definition('Kimlik ayarı','Kimlik adresi geçersiz','Sunucu kimlik doğrulama adresi güvenli HTTPS biçiminde değil.','Site URL ve Identity adres ayarı'),
 SESSION_TOKEN_REJECTED:definition('Oturum','Oturum belirteci reddedildi','Identity oturum belirtecini reddetti; süre dolması veya iptal gibi alt nedenler kesinleşmedi.','Oturum yenileme ve Identity kullanıcı kontrolü',false,false),
 SESSION_NOT_ESTABLISHED:definition('Oturum','Sunucu oturumu oluşmadı','İstemcideki işlemden sonra sunucu oturumu doğrulanamadı.','Cookie aktarımı ve sunucu Identity doğrulaması',true,false),
 SESSION_RESPONSE_INVALID:definition('Oturum','Oturum yanıtı geçersiz','Oturum uç noktasının yanıtı beklenen biçimde değil.','Oturum API yanıtı'),
 NETWORK_TIMEOUT:definition('Bağlantı','İstek zaman aşımına uğradı','İşlem belirtilen sürede tamamlanamadı.','İlgili hizmetin gecikmesi ve bağlantı',true),
 NETWORK_UNREACHABLE:definition('Bağlantı','Hizmete bağlantı kurulamadı','Ağ isteği tamamlanamadı; HTTP yanıtı alınamadı.','Tarayıcı/ağ bağlantısı veya ilgili hizmet',true,false),
 RATE_LIMITED:definition('İstek sınırı','Çok sayıda deneme','İstek sayısı sınırı aşıldı.','Retry-After süresi ve tekrar sıklığı',true),
 REQUEST_INVALID:definition('Girdi','İstek doğrulanamadı','İstek biçimi veya alanları kabul edilmedi.','İlgili formun doğrulama kuralları'),
 REQUEST_TOO_LARGE:definition('Girdi','İstek çok büyük','İstek boyutu sınırı aşıldı.','Dosya veya istek boyutu'),
 ORIGIN_REJECTED:definition('Güvenlik','İstek kökeni reddedildi','İstek beklenen site kökeninden gelmiyor.','Origin ve aynı köken kontrolü'),
 ACCESS_DENIED:definition('Yetki','Erişim reddedildi','Sunucu bu işleme izin vermedi.','Hesap yetkisi ve erişim kontrolü'),
 RESOURCE_NOT_FOUND:definition('Kaynak','Kaynak bulunamadı','Kaynak bulunamadı veya bu hesaba açık değil.','Kaynağın varlığı ve hesaba ait olması'),
 STATE_CONFLICT:definition('Veri durumu','İşlem mevcut durumla çakıştı','İşlem güncel veri durumuyla uyuşmuyor.','Hesap, silme dönemi veya kaynağın son durumu'),
 RESOURCE_LIMIT:definition('Sınır','Kaynak sınırı aşıldı','İşlem uygulamanın kaynak sınırına takıldı.','İlgili belge/paylaşım/kayıt sınırı'),
 DB_UNAVAILABLE:definition('Veritabanı','Veritabanı işlemi başarısız','Veritabanı katmanında işlem tamamlanamadı; kesin alt neden belirlenemedi.','Veritabanı bağlantısı ve ilgili sorgu',true,false),
 DB_CONFIGURATION:definition('Veritabanı ayarı','Veritabanı ayarı eksik','Veritabanı bağlantı ayarı bulunamadı veya reddedildi.','Netlify Database bağlantı ayarı'),
 DB_SCHEMA_MISMATCH:definition('Veritabanı şeması','Tablo veya alan uyuşmuyor','Postgres eksik tablo/alan bildirdi.','Uygulanan migration ve çalışan kod sürümü'),
 DB_QUERY_INVALID:definition('Veritabanı sorgusu','Sorgu sözdizimi geçersiz','Postgres sorgu sözdizimini reddetti.','İlgili sorgunun SQL sözdizimi'),
 DB_CONSTRAINT:definition('Veritabanı kuralı','Veri kuralı ihlali','Postgres bir veri bütünlüğü kuralını reddetti.','Tekillik, ilişki ve alan kuralları'),
 DB_PERMISSION:definition('Veritabanı yetkisi','Veritabanı erişimi reddedildi','Postgres bağlantı veya sorgu yetkisini reddetti.','Veritabanı kullanıcı yetkisi ve bağlantı ayarı'),
 DB_CAPACITY:definition('Veritabanı kapasitesi','Veritabanı kapasite sınırı','Postgres kapasite veya bağlantı sınırı bildirdi.','Bağlantı havuzu ve veritabanı kapasitesi',true),
 FILE_UNAVAILABLE:definition('Dosya depolama','Dosya işlemi başarısız','Dosya depolama katmanında işlem tamamlanamadı; kesin alt neden belirlenemedi.','Özel Blobs deposu ve ilgili dosya işlemi',true,false),
 FILE_MISSING:definition('Dosya depolama','Dosya içeriği bulunamadı','Belge kaydı var ancak dosya içeriği bulunamadı.','Belge metadata ve özel dosya nesnesi'),
 FILE_ACCESS_DENIED:definition('Dosya depolama','Dosya deposuna erişim reddedildi','Dosya hizmeti yetki reddi bildirdi.','Blobs depo bağlamı ve erişim ayarı'),
 EXTERNAL_UNAVAILABLE:definition('Dış servis','Dış servis yanıt vermedi','Dış servis isteği tamamlanamadı; kesin alt neden belirlenemedi.','İlgili dış servis ve zaman aşımı',true,false),
 EXTERNAL_RESPONSE_INVALID:definition('Dış servis','Dış servis yanıtı geçersiz','Dış servis beklenen yanıt biçimini döndürmedi.','Sağlayıcı sözleşmesi ve yanıt doğrulaması'),
 EXTERNAL_HTTP_ERROR:definition('Dış servis','Dış servis HTTP hatası','Dış servis başarılı olmayan HTTP yanıtı döndürdü.','Sağlayıcı durumu ve isteğin geçerliliği',true,false),
 LOCAL_STORAGE_UNAVAILABLE:definition('Cihaz depolama','Cihazda saklama başarısız','Tarayıcıda saklama işlemi tamamlanamadı.','IndexedDB, kota ve tarayıcı depolama izni',true,false),
 OFFLINE_DRAFT_INVALID:definition('Bekleyen kayıt','Bekleyen kayıt doğrulanamadı','Bekleyen kayıt geçerli hesap/dönem veya veri kurallarıyla uyuşmuyor.','Bekleyen kayıt sahibi, silme dönemi ve veri doğrulaması'),
 APP_RENDER_FAILED:definition('Arayüz','Ekran oluşturulamadı','Ekran oluşturulurken beklenmeyen bir hata oluştu.','İlgili ekranın render ve sunucu kayıtları',true,false),
 APP_UNEXPECTED:definition('Uygulama','Beklenmeyen hata','Hatanın özel nedeni henüz belirlenemedi.','Takip koduyla ilgili işlem ve çalışan kod',false,false),
 HTTP_UNAVAILABLE:definition('Sunucu','Sunucu isteği tamamlayamadı','Sunucu 5xx yanıtı döndürdü; kesin alt neden belirlenemedi.','İlgili API işlemi ve sunucu kaydı',true,false),
 HTTP_RESPONSE_INVALID:definition('Sunucu','Sunucu yanıtı okunamadı','Sunucu beklenen API yanıtını döndürmedi.','API yönlendirmesi ve yanıt biçimi',false,false),
 HTTP_REQUEST_REJECTED:definition('Sunucu','API isteği reddedildi','Sunucu bir HTTP hata yanıtı verdi; özel neden bildirilmedi.','İlgili API yanıtı ve sunucu kaydı',false,false),
 } as const;
export type DiagnosticCode=keyof typeof diagnosticCodes;
export type Diagnostic={version:1,id:string,area:DiagnosticArea,stage:DiagnosticStage,code:DiagnosticCode,httpStatus?:number,frameworkDigest?:string};
export const areaLabels:Record<DiagnosticArea,string>={auth:'Kayıt ve giriş',session:'Oturum',records:'Sağlık kayıtları',journal:'Günlükler ve planlar',documents:'Belgeler',backup:'Yedekleme',privacy:'Veri silme',shares:'Paylaşım',shared:'Paylaşılan kayıt', 'sync-context':'Hesap eşitleme','stock-use':'Stok işlemleri',feedback:'Geri bildirim',foods:'Besin kataloğu',status:'Hizmet sağlığı',runtime:'Uygulama',offline:'Bekleyen kayıtlar'};
export const stageLabels:Record<DiagnosticStage,string>={settings:'Ayar kontrolü',signup:'Hesap oluşturma',login:'Giriş',recovery:'Şifre kurtarma',callback:'E-posta bağlantısı','password-save':'Şifre kaydetme',logout:'Çıkış','session-check':'Sunucu oturum kontrolü','session-refresh':'Oturum yenileme',request:'İstek',read:'Okuma',create:'Ekleme',update:'Güncelleme',delete:'Silme',restore:'Geri yükleme',connect:'Bağlantı',query:'Sorgu',transaction:'Veri işlemi','file-read':'Dosya okuma','file-write':'Dosya yükleme','file-delete':'Dosya silme','external-fetch':'Dış servis isteği',render:'Ekran oluşturma','local-storage':'Cihazda saklama','offline-queue':'Bekleyen kayıt gönderimi'};
export function makeDiagnostic(area:DiagnosticArea,stage:DiagnosticStage,code:DiagnosticCode,httpStatus?:number,id=crypto.randomUUID()):Diagnostic{return {version:1,id,area,stage,code,...(httpStatus!==undefined&&Number.isInteger(httpStatus)&&httpStatus>=400&&httpStatus<=599?{httpStatus}:{})};}
export function isDiagnostic(value:unknown):value is Diagnostic{
 if(!value||typeof value!=='object')return false;const d=value as Record<string,unknown>;
 return Object.keys(d).every(k=>['version','id','area','stage','code','httpStatus','frameworkDigest'].includes(k))&&d.version===1&&typeof d.id==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(d.id)&&areas.includes(d.area as DiagnosticArea)&&stages.includes(d.stage as DiagnosticStage)&&typeof d.code==='string'&&Object.hasOwn(diagnosticCodes,d.code)&&(d.httpStatus===undefined||typeof d.httpStatus==='number'&&Number.isInteger(d.httpStatus)&&d.httpStatus>=400&&d.httpStatus<=599)&&(d.frameworkDigest===undefined||typeof d.frameworkDigest==='string'&&/^\d{1,20}$/.test(d.frameworkDigest));
}
export class DiagnosticError extends Error{constructor(readonly diagnostic:Diagnostic,message=diagnosticCodes[diagnostic.code].title){super(message);this.name='DiagnosticError';}}
export function diagnosticFrom(error:unknown):Diagnostic|undefined{let current=error;const seen=new Set<object>();for(let i=0;i<8&&current&&typeof current==='object'&&!seen.has(current);i++){seen.add(current);const item=current as {diagnostic?:unknown,cause?:unknown};if(isDiagnostic(item.diagnostic))return item.diagnostic;current=item.cause;}return undefined;}
export function errorFacts(error:unknown){
 const seen=new Set<object>(),messages:string[]=[],codes:string[]=[],queue:unknown[]=[error];let status:number|undefined,timeout=false,network=false;
 for(let i=0;i<16&&queue.length;i++){
  const current=queue.shift();if(!current||typeof current!=='object'||seen.has(current))continue;seen.add(current);const e=current as Record<string,unknown>;
  for(const key of ['status','statusCode','code']){const v=e[key];if(typeof v==='number'&&Number.isInteger(v)&&v>=400&&v<=599)status=v;if(typeof v==='string'&&/^[A-Z0-9_]{2,40}$/.test(v))codes.push(v);}
  for(const key of ['message','msg','error_description','error'])if(typeof e[key]==='string')messages.push((e[key] as string).slice(0,4000));
  timeout||=e.name==='TimeoutError';network||=e.name==='AbortError';queue.push(e.cause,e.json);
 }
 const message=messages.join(' ');timeout||=/timed? out|timeout/i.test(message)||codes.some(c=>['ETIMEDOUT','UND_ERR_CONNECT_TIMEOUT','UND_ERR_HEADERS_TIMEOUT'].includes(c));
 network||=timeout||=/failed to fetch|networkerror|network request failed|load failed|network unavailable|provider offline|^offline$/i.test(message)||codes.some(c=>['ECONNREFUSED','ECONNRESET','ENOTFOUND','EAI_AGAIN','UND_ERR_SOCKET'].includes(c));
 return {status,message,codes,timeout,network};
}
export function dependencyCode(error:unknown,dependency:'database'|'file'|'external'):DiagnosticCode{
 const f=errorFacts(error);
 if(dependency==='database'){
  if(f.codes.some(c=>['42P01','42703'].includes(c)))return 'DB_SCHEMA_MISMATCH';
  if(f.codes.includes('42601'))return 'DB_QUERY_INVALID';
  if(f.codes.some(c=>c.startsWith('23')))return 'DB_CONSTRAINT';
  if(f.codes.some(c=>c.startsWith('28')||c==='42501'))return 'DB_PERMISSION';
  if(f.codes.some(c=>c.startsWith('53')||c==='53300'))return 'DB_CAPACITY';
  if(/missing.*(?:connection|database)|(?:database|connection).*(?:not (?:set|configured)|missing)|NETLIFY_DATABASE_URL/i.test(f.message))return 'DB_CONFIGURATION';
  return 'DB_UNAVAILABLE';
 }
 if(dependency==='file')return f.status===401||f.status===403?'FILE_ACCESS_DENIED':'FILE_UNAVAILABLE';
 if(f.timeout)return 'NETWORK_TIMEOUT';if(f.network&&f.status===undefined)return 'NETWORK_UNREACHABLE';if(f.status===429)return 'RATE_LIMITED';return f.status?'EXTERNAL_HTTP_ERROR':'EXTERNAL_UNAVAILABLE';
}
