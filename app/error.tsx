'use client';
import {useEffect,useState,useRef} from 'react';
import {reportClientDiagnostic} from '../lib/client-diagnostics';
import {makeDiagnostic,type Diagnostic} from '../lib/diagnostics';
import {DiagnosticDetails} from './diagnostic-center';
export default function ErrorPage({error,retry}:{error:Error&{digest?:string},retry:()=>void}){
 const [diagnostic,setDiagnostic]=useState<Diagnostic|null>(null);
 const reported=useRef<Error|null>(null);
 useEffect(()=>{if(reported.current===error)return;reported.current=error;const d=makeDiagnostic('runtime','render','APP_RENDER_FAILED');if(error.digest&&/^\d{1,20}$/.test(error.digest))d.frameworkDigest=error.digest;reportClientDiagnostic(d);setDiagnostic(d);},[error]);
 return <main className="auth-page"><section className="card account-card"><h1>Ekran açılamadı</h1><p>Beklenmeyen bir hata oluştu. Yeniden deneyebilirsiniz.</p><DiagnosticDetails diagnostic={diagnostic}/><button className="primary" onClick={retry}>Yeniden dene</button></section></main>;
}
