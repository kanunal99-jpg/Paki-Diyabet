import {errorFacts,makeDiagnostic,diagnosticFrom,type DiagnosticCode,type DiagnosticStage} from './diagnostics';
export type AuthMode = 'login' | 'signup' | 'recovery';

// The browser SDK keeps GoTrue's status and message in AuthError.cause.
// Inspect that chain without rendering raw messages or logging credentials.
export const authErrorDetails=errorFacts;
export function authFailureCode(mode:AuthMode,error:unknown,sessionStarted=false):DiagnosticCode{
 const existing=diagnosticFrom(error);if(existing)return existing.code;
 const {status,message,network,timeout}=authErrorDetails(error);
 if(sessionStarted)return 'SESSION_NOT_ESTABLISHED';
 if(status===429||/rate limit|too many requests|too many attempts/i.test(message))return 'RATE_LIMITED';
 if(/email (?:is )?not confirmed|confirm your email|email not verified/i.test(message))return 'AUTH_EMAIL_UNCONFIRMED';
 if(mode==='signup'&&/already (?:been )?(?:registered|exists)|user already|email.*(?:in use|registered)|duplicate.*(?:email|user)/i.test(message))return 'AUTH_ACCOUNT_EXISTS';
 if(mode==='signup'&&/weak password|password.*(?:short|least|characters|weak|requirements)/i.test(message))return 'AUTH_PASSWORD_POLICY';
 if(mode==='signup'&&/signup.*disabled|signups.*(?:disabled|not allowed)|registration.*disabled|invite only/i.test(message))return 'AUTH_SIGNUP_DISABLED';
 if(status!==undefined&&status>=500)return 'AUTH_PROVIDER_UNAVAILABLE';
 if(timeout&&status===undefined)return 'NETWORK_TIMEOUT';
 if(network&&status===undefined)return 'NETWORK_UNREACHABLE';
 if(/invalid (?:login )?credentials|invalid email or password|invalid password/i.test(message))return 'AUTH_INVALID_CREDENTIALS';
 return 'AUTH_REQUEST_REJECTED';
}
export function authDiagnostic(mode:AuthMode,error:unknown,sessionStarted=false,stage:DiagnosticStage=mode){return diagnosticFrom(error)??makeDiagnostic(sessionStarted?'session':'auth',stage,authFailureCode(mode,error,sessionStarted),authErrorDetails(error).status);}

export function authFailureMessage(mode:AuthMode,error:unknown,sessionStarted=false){
 const {status,message,network}=authErrorDetails(error);
 if(sessionStarted)return 'Hesap doğrulandı ancak oturum tamamlanamadı. Şifrenizi yeniden girmeden Oturumu yeniden doğrula düğmesini kullanın.';
 if(status===429||/rate limit|too many requests|too many attempts/i.test(message))return 'Çok sayıda deneme yapıldı. Bir süre bekleyip yeniden deneyin.';
 if(/email (?:is )?not confirmed|confirm your email|email not verified/i.test(message))return 'E-posta adresiniz henüz doğrulanmamış. Gelen kutusu ve spam klasöründeki doğrulama bağlantısını açın, ardından giriş yapın.';
 if(mode==='signup'&&/already (?:been )?(?:registered|exists)|user already|email.*(?:in use|registered)|duplicate.*(?:email|user)/i.test(message))return 'Bu e-posta ile hesap oluşturulamadı. Daha önce kayıt olduysanız Giriş yap veya Şifremi unuttum seçeneğini kullanın.';
 if(mode==='signup'&&/weak password|password.*(?:short|least|characters|weak|requirements)/i.test(message))return 'Şifre güvenlik koşullarını karşılamıyor. En az 12 karakter kullanın ve daha güçlü bir şifre belirleyin.';
 if(mode==='signup'&&/signup.*disabled|signups.*(?:disabled|not allowed)|registration.*disabled|invite only/i.test(message))return 'Yeni hesap oluşturma şu anda kapalı. Mevcut hesabınızla giriş yapabilirsiniz.';
 if(status!==undefined&&status>=500)return 'Giriş hizmeti isteği tamamlayamadı. Biraz sonra yeniden deneyin.';
 if(network&&status===undefined)return 'Giriş hizmetine bağlantı kurulamadı. İnternet bağlantınızı kontrol edip yeniden deneyin.';
 if(mode==='login'&&authFailureCode(mode,error)==='AUTH_INVALID_CREDENTIALS')return 'Giriş bilgileri kabul edilmedi. Paki Diyabet hesabınızın e-posta ve şifresini kontrol edin; gerekirse Şifremi unuttum seçeneğini kullanın.';
 if(mode==='login')return 'Giriş isteği tamamlanamadı. Kesin neden belirlenemedi; hata ayrıntılarındaki takip kodunu kullanın.';
 if(mode==='signup')return 'Hesap oluşturulamadı. Bilgilerinizi kontrol edin; daha önce kayıt olduysanız Giriş yap veya Şifremi unuttum seçeneğini kullanın.';
 return 'Şifre yenileme isteği tamamlanamadı. E-posta adresinizi kontrol edip yeniden deneyin.';
}
