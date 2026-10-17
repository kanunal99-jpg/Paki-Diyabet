import {hydrateSession,refreshSession} from '@netlify/identity';
import {DiagnosticError,isDiagnostic,makeDiagnostic} from './diagnostics';
import {diagnosticFetch as fetch} from './client-diagnostics';

async function probeSession(){
 const response=await fetch('/api/session',{cache:'no-store',credentials:'same-origin',signal:AbortSignal.timeout(12000)});
 if(response.status===401)return false;
 let data:unknown;try{data=await response.json();}catch{throw new DiagnosticError(makeDiagnostic('session','session-check','SESSION_RESPONSE_INVALID'));}
 if(!response.ok){const diagnostic=data&&typeof data==='object'&&'diagnostic' in data&&isDiagnostic(data.diagnostic)?data.diagnostic:makeDiagnostic('session','session-check','HTTP_UNAVAILABLE',response.status);throw new DiagnosticError(diagnostic,'Oturum hizmeti isteği tamamlayamadı.');}
 if(!data||typeof data!=='object'||!('authenticated' in data)||typeof data.authenticated!=='boolean')throw new DiagnosticError(makeDiagnostic('session','session-check','SESSION_RESPONSE_INVALID'));
 return data.authenticated===true;
}

export async function verifiedBrowserSession(refresh=false){
 // A cached SDK user is not proof of a server session. Refresh once on 401;
 // never repeat login/signup or retry a rejected password automatically.
 if(!refresh&&await probeSession())return true;
 await hydrateSession();
 await refreshSession();
 return probeSession();
}
