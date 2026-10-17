'use client';
import {useEffect,useRef,useState} from 'react';
import {signup,login,logout,getUser,handleAuthCallback,getSettings,requestPasswordRecovery,updateUser,acceptInvite} from '@netlify/identity';
import Link from 'next/link';
import {safeReturnPath} from '../lib/return-path';
import {authFailureMessage,authFailureCode,authErrorDetails,type AuthMode} from '../lib/auth-errors';
import {verifiedBrowserSession} from '../lib/auth-session';
import {clientFailure} from '../lib/client-diagnostics';
import type {Diagnostic,DiagnosticStage} from '../lib/diagnostics';
import {DiagnosticDetails} from './diagnostic-center';

function authIssue(mode:AuthMode,error:unknown,sessionStarted=false,stage:DiagnosticStage=mode){
 return clientFailure(sessionStarted?'session':'auth',stage,error,authFailureCode(mode,error,sessionStarted));
}
export function AuthCallback(){
 const [message,setMessage]=useState(''),[error,setError]=useState(''),[mode,setMode]=useState(''),[token,setToken]=useState(''),[password,setPassword]=useState(''),[busy,setBusy]=useState(false),[diagnostic,setDiagnostic]=useState<Diagnostic|null>(null);
 const callback=useRef<{hash:string,promise:ReturnType<typeof handleAuthCallback>}|null>(null);
 useEffect(()=>{
  let active=true;
  function consume(reusePending=false){
   const hash=window.location.hash;
   if(/(confirmation_token|recovery_token|invite_token|email_change_token|access_token)=/.test(hash)){
    if(callback.current?.hash!==hash){
     setMode('');setToken('');setPassword('');setError('');setMessage('');setDiagnostic(null);
     callback.current={hash,promise:handleAuthCallback()};
    }
   }else if(!reusePending||!callback.current){if(reusePending)void getUser().catch(cause=>{authIssue('login',cause,false,'session-check');});return;}
   const task=callback.current!;
   task.promise.then(async result=>{
    if(!active||callback.current!==task)return;
    if(result?.type==='recovery')setMode('recovery');
    else if(result?.type==='invite'){setMode('invite');setToken(result.token||'');}
    else if(result?.user){
     const verified=await verifiedBrowserSession();
     if(!active||callback.current!==task)return;
     if(verified)window.location.replace('/');
     else{setDiagnostic(authIssue('login',null,true,'session-check'));setError('E-posta doğrulandı ancak oturum tamamlanamadı. Giriş ekranından yeniden deneyin.');}
    }
   }).catch(cause=>{
    if(!active||callback.current!==task)return;
    const facts=authErrorDetails(cause),invalid=/token.*(?:expired|invalid)|(?:expired|invalid).*token/i.test(facts.message);
    setDiagnostic(clientFailure('auth','callback',cause,invalid?'AUTH_CALLBACK_INVALID':authFailureCode('login',cause)));
    setError('Doğrulama bağlantısı kullanılamadı. Giriş ekranından yeniden deneyin.');
   });
  }
  const onHashChange=()=>consume();
  consume(true);window.addEventListener('hashchange',onHashChange);
  return()=>{active=false;window.removeEventListener('hashchange',onHashChange);};
 },[]);
 async function reset(event:React.FormEvent){
  event.preventDefault();if(busy)return;setBusy(true);setError('');setDiagnostic(null);let saved=false;
  try{
   if(mode==='invite')await acceptInvite(token,password);else await updateUser({password});
   saved=true;setPassword('');setMode('');setToken('');setMessage('Şifreniz kaydedildi.');
   if(await verifiedBrowserSession())window.location.replace('/');
   else{setDiagnostic(authIssue('login',null,true,'session-check'));setMessage('Şifreniz kaydedildi. Oturumu açmak için giriş ekranından e-posta ve şifrenizle giriş yapın.');}
  }catch(cause){
   setDiagnostic(authIssue('recovery',cause,saved,saved?'session-check':'password-save'));
   if(saved)setMessage('Şifreniz kaydedildi. Oturum tamamlanamadı; giriş ekranından yeniden giriş yapın.');else setError('Şifre kaydedilemedi. Yeniden deneyin.');
  }finally{setBusy(false);}
 }
 if(!mode&&!error&&!message)return null;
 return <section className="auth-banner card" aria-live="polite">{mode?<form className="record-form" onSubmit={reset}><h2>Yeni şifre belirleyin</h2><label>Şifre<input type="password" autoComplete="new-password" required minLength={12} maxLength={128} value={password} onChange={e=>setPassword(e.target.value)}/></label><button className="primary" disabled={busy}>{busy?'Kaydediliyor…':'Şifreyi kaydet'}</button></form>:message&&<p role="status">{message} <Link href="/giris">Giriş ekranı</Link></p>}{error&&<p role="alert" className="form-error">{error} <Link href="/giris">Giriş ekranı</Link></p>}<DiagnosticDetails diagnostic={diagnostic}/></section>;
}

export function LoginForm(){
 const [mode,setMode]=useState<AuthMode>('login'),[email,setEmail]=useState(''),[name,setName]=useState(''),[password,setPassword]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState(''),[ready,setReady]=useState(false),[allowSignup,setAllowSignup]=useState(false),[needsSessionCheck,setNeedsSessionCheck]=useState(false),[diagnostic,setDiagnostic]=useState<Diagnostic|null>(null);
 function settingsResult(settings:Awaited<ReturnType<typeof getSettings>>){
  setAllowSignup(!settings.disableSignup&&settings.providers.email);setReady(settings.providers.email);
  if(!settings.providers.email){setDiagnostic(clientFailure('auth','settings',null,'AUTH_EMAIL_PROVIDER_DISABLED'));setError('E-posta ile giriş bu sitede etkin değil.');}
 }
 function settingsFailed(cause:unknown){setDiagnostic(authIssue('login',cause,false,'settings'));setError('Giriş hizmetine şu anda ulaşılamıyor. Biraz sonra yeniden deneyin.');}
 async function check(){setError('');setDiagnostic(null);setReady(false);try{settingsResult(await getSettings());}catch(cause){settingsFailed(cause);}}
 useEffect(()=>{let active=true;getSettings().then(settings=>{if(active)settingsResult(settings);}).catch(cause=>{if(active)settingsFailed(cause);});return()=>{active=false;};},[]);
 async function submit(event:React.FormEvent){
  event.preventDefault();if(busy||!ready||(mode==='signup'&&!allowSignup))return;
  setBusy(true);setError('');setMessage('');setNeedsSessionCheck(false);setDiagnostic(null);let sessionStarted=false;
  try{
   if(mode==='recovery'){await requestPasswordRecovery(email.trim().toLowerCase());setMessage('Bu e-posta için bir hesap varsa şifre yenileme bağlantısı gönderildi.');return;}
   const user=mode==='signup'?await signup(email.trim().toLowerCase(),password,{full_name:name.trim()}):await login(email.trim().toLowerCase(),password);
   setPassword('');
   if(!user.confirmedAt){
    if(mode==='signup')setMessage('Kayıt isteğiniz alındı. Hesabınızı etkinleştirmek için e-postanıza gelen doğrulama bağlantısını açın. Gelen kutusu ve spam klasörünü kontrol edin.');
    else{setDiagnostic(clientFailure('auth','login',null,'AUTH_EMAIL_UNCONFIRMED'));setError('E-posta adresinizi doğruladıktan sonra yeniden giriş yapın.');}
    return;
   }
   sessionStarted=true;
   if(!await verifiedBrowserSession()){setNeedsSessionCheck(true);setDiagnostic(authIssue(mode,null,true,'session-check'));setError('Hesap doğrulandı ancak oturum tamamlanamadı. Oturumu yeniden doğrula düğmesini kullanın.');return;}
   window.location.assign(safeReturnPath(new URLSearchParams(window.location.search).get('return_to')||'/'));
  }catch(cause){setNeedsSessionCheck(sessionStarted);setDiagnostic(authIssue(mode,cause,sessionStarted,sessionStarted?'session-check':mode));setError(authFailureMessage(mode,cause,sessionStarted));}
  finally{setBusy(false);}
 }
 async function retrySession(){
  if(busy)return;setBusy(true);setError('');setDiagnostic(null);
  try{if(await verifiedBrowserSession(true))window.location.assign(safeReturnPath(new URLSearchParams(window.location.search).get('return_to')||'/'));else{setDiagnostic(authIssue('login',null,true,'session-refresh'));setError('Oturum doğrulanamadı. E-posta ve şifrenizle yeniden giriş yapın.');}}
  catch(cause){setDiagnostic(authIssue('login',cause,true,'session-refresh'));setError('Oturum yenilenemedi. Yeniden giriş yapın; sorun sürerse biraz sonra tekrar deneyin.');}
  finally{setBusy(false);}
 }
 function change(next:AuthMode){if(busy)return;setMode(next);setError('');setMessage('');setPassword('');setNeedsSessionCheck(false);setDiagnostic(null);}
 return <main className="auth-page"><section className="card account-card"><Link href="/" className="auth-brand">PAKİ DİYABET</Link><h1>{mode==='signup'?'Paki hesabı oluştur':mode==='recovery'?'Şifrenizi yenileyin':'Paki hesabınıza giriş yapın'}</h1><p>Kişisel kayıtlarınız hesabınıza özeldir. Eğitim içeriklerini giriş yapmadan okuyabilirsiniz.</p><form className="record-form" onSubmit={submit}>{mode==='signup'&&<label>Adınız<input value={name} onChange={e=>setName(e.target.value)} maxLength={100} autoComplete="name"/></label>}<label>E-posta<input type="email" required maxLength={254} autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)}/></label>{mode!=='recovery'&&<label>Şifre<input type="password" required minLength={mode==='signup'?12:1} maxLength={128} autoComplete={mode==='signup'?'new-password':'current-password'} value={password} onChange={e=>setPassword(e.target.value)}/>{mode==='signup'&&<small>En az 12 karakter kullanın. E-postanız doğrulandıktan sonra giriş yapabilirsiniz.</small>}</label>}{error&&<p className="form-error" role="alert">{error}</p>}{message&&<p className="notice" role="status">{message}</p>}<DiagnosticDetails diagnostic={diagnostic}/><button className="primary" disabled={busy||!ready||(mode==='signup'&&!allowSignup)}>{busy?'İşlem sürüyor…':mode==='signup'?'Hesap oluştur':mode==='recovery'?'Yenileme bağlantısı gönder':'Giriş yap'}</button>{!ready&&<button type="button" className="secondary-button" disabled={busy} onClick={check}>Giriş hizmetini yeniden kontrol et</button>}{needsSessionCheck&&<button type="button" className="secondary-button" disabled={busy} onClick={retrySession}>Oturumu yeniden doğrula</button>}</form><div className="auth-links">{mode!=='login'&&<button disabled={busy} onClick={()=>change('login')}>Giriş yap</button>}{mode!=='signup'&&allowSignup&&<button disabled={busy} onClick={()=>change('signup')}>Hesap oluştur</button>}{mode!=='recovery'&&<button disabled={busy} onClick={()=>change('recovery')}>Şifremi unuttum</button>}<Link href="/">Siteye dön</Link></div></section></main>;
}

export function LogoutForm(){
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[diagnostic,setDiagnostic]=useState<Diagnostic|null>(null);
 async function leave(){if(busy)return;setBusy(true);setError('');setDiagnostic(null);try{await logout();window.location.replace('/');}catch(cause){setDiagnostic(authIssue('login',cause,false,'logout'));setError('Çıkış işlemi tamamlanamadı. Yeniden deneyin.');setBusy(false);}}
 return <main className="auth-page"><section className="card account-card"><h1>Hesaptan çıkış</h1><p>Bu cihazdaki oturumunuzu kapatın. Kaydedilmiş bilgileriniz hesabınızda kalır.</p>{error&&<p className="form-error" role="alert">{error}</p>}<DiagnosticDetails diagnostic={diagnostic}/><button className="primary" onClick={leave} disabled={busy}>{busy?'Çıkış yapılıyor…':'Çıkış yap'}</button> <Link href="/">Siteye dön</Link></section></main>;
}
