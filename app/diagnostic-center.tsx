'use client';
import {useEffect,useState} from 'react';
import {areaLabels,stageLabels,diagnosticCodes,type Diagnostic} from '../lib/diagnostics';
import {recentDiagnostics,clearDiagnostics,clientFailure,type VisibleDiagnostic} from '../lib/client-diagnostics';

export function DiagnosticDetails({diagnostic}:{diagnostic:Diagnostic|null}){
 if(!diagnostic)return null;const info=diagnosticCodes[diagnostic.code];
 return <details className="diagnostic-details"><summary>Hata ayrıntıları</summary><dl><dt>Alan / aşama</dt><dd>{areaLabels[diagnostic.area]} / {stageLabels[diagnostic.stage]}</dd><dt>Hata kodu</dt><dd><code>{diagnostic.code}</code></dd><dt>Neden</dt><dd>{info.reason}</dd><dt>Kesinlik</dt><dd>{info.identified?'Belirli bir hata koşulu tespit edildi.':'Kesin kök neden henüz belirlenmedi.'}</dd>{diagnostic.httpStatus&&<><dt>HTTP durumu</dt><dd>{diagnostic.httpStatus}</dd></>}<dt>İncelenecek alan</dt><dd>{info.check}</dd>{diagnostic.frameworkDigest&&<><dt>Framework kodu</dt><dd><code>{diagnostic.frameworkDigest}</code></dd></>}<dt>Takip kodu</dt><dd><code>{diagnostic.id}</code></dd></dl></details>;
}

export function DiagnosticCenter(){
 const [items,setItems]=useState<VisibleDiagnostic[]>([]);
 useEffect(()=>{
  const update=()=>setItems([...recentDiagnostics()]);
  const error=(event:ErrorEvent)=>{clientFailure('runtime','render',event.error,'APP_UNEXPECTED');};
  const rejection=(event:PromiseRejectionEvent)=>{clientFailure('runtime','request',event.reason,'APP_UNEXPECTED');};
  update();window.addEventListener('paki-diagnostic',update);window.addEventListener('error',error);window.addEventListener('unhandledrejection',rejection);
  return()=>{window.removeEventListener('paki-diagnostic',update);window.removeEventListener('error',error);window.removeEventListener('unhandledrejection',rejection);};
 },[]);
 if(!items.length)return null;
 return <aside className="diagnostic-center" aria-label="Tanı günlüğü" data-testid="diagnostic-center"><details><summary>Hata kayıtları ({items.length})</summary><p>Bu sekmenin son 20 tanısı. Takip kodu, ilgili sunucu kaydını bulmak için kullanılır.</p>{items.map(item=><section key={item.diagnostic.id}><b>{diagnosticCodes[item.diagnostic.code].title}</b><p>{new Date(item.at).toLocaleTimeString('tr-TR')} · {item.delivery==='server'?'Sunucu tanısı':item.delivery==='reported'?'Tarayıcı bildirimi sunucuya iletildi':item.delivery==='pending'?'Bildirim iletiliyor':'Yalnızca bu sekmede; sunucuya iletilemedi'}</p><DiagnosticDetails diagnostic={item.diagnostic}/></section>)}<button type="button" className="text-button" onClick={clearDiagnostics}>Bu sekmedeki listeyi temizle</button></details></aside>;
}
