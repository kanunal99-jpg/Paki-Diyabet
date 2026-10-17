import {diagnosticCodes,isDiagnostic,makeDiagnostic,errorFacts,diagnosticFrom,type Diagnostic,type DiagnosticArea,type DiagnosticStage} from './diagnostics';
export type VisibleDiagnostic={diagnostic:Diagnostic,at:number,delivery:'server'|'pending'|'reported'|'local'};
let recent:VisibleDiagnostic[]=[];
let reportTimes:number[]=[];
const notify=()=>{if(typeof window!=='undefined')window.dispatchEvent(new Event('paki-diagnostic'));};
export function recentDiagnostics(){return recent;}
export function clearDiagnostics(){recent=[];notify();}
function remember(diagnostic:Diagnostic,delivery:VisibleDiagnostic['delivery']){if(typeof window==='undefined')return;recent=[{diagnostic,at:Date.now(),delivery},...recent.filter(x=>x.diagnostic.id!==diagnostic.id)].slice(0,20);notify();}
function delivery(id:string,value:VisibleDiagnostic['delivery']){recent=recent.map(x=>x.diagnostic.id===id?{...x,delivery:value}:x);notify();}
export function reportClientDiagnostic(diagnostic:Diagnostic){
 remember(diagnostic,'pending');if(typeof window==='undefined')return;
 const now=Date.now();reportTimes=reportTimes.filter(t=>now-t<60000);if(reportTimes.length>=8){delivery(diagnostic.id,'local');return;}reportTimes.push(now);
 // Only the fixed vocabulary and a random ID cross this boundary. No raw error,
 // message, email, health value, URL, request body or browser state is collected.
 void fetch('/api/diagnostics',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(diagnostic),signal:AbortSignal.timeout(5000),keepalive:true}).then(response=>delivery(diagnostic.id,response.ok?'reported':'local')).catch(()=>delivery(diagnostic.id,'local'));
}
export function clientFailure(area:DiagnosticArea,stage:DiagnosticStage,error:unknown,code?:Diagnostic['code']){
 const existing=diagnosticFrom(error);if(existing){if(!recent.some(item=>item.diagnostic.id===existing.id))reportClientDiagnostic(existing);return existing;}
 const facts=errorFacts(error);const diagnostic=makeDiagnostic(area,stage,code??(facts.timeout?'NETWORK_TIMEOUT':facts.network?'NETWORK_UNREACHABLE':'APP_UNEXPECTED'),facts.status);reportClientDiagnostic(diagnostic);return diagnostic;
}
function apiArea(input:RequestInfo|URL):DiagnosticArea|undefined{
 if(typeof window==='undefined')return undefined;try{const url=new URL(typeof input==='string'?input:input instanceof URL?input.href:input.url,window.location.origin);if(url.origin!==window.location.origin||!url.pathname.startsWith('/api/')||url.pathname==='/api/diagnostics')return;const name=url.pathname.slice(5);return Object.hasOwn({records:1,journal:1,documents:1,backup:1,privacy:1,shares:1,shared:1,'sync-context':1,'stock-use':1,feedback:1,foods:1,status:1,session:1},name)?name as DiagnosticArea:undefined;}catch{return;}
}
export async function diagnosticFetch(input:RequestInfo|URL,init?:RequestInit):Promise<Response>{
 const area=apiArea(input);
 try{
  const response=await fetch(input,init);
  if(area&&response.ok&&response.headers.has('X-Paki-Warning-Code')){try{const body:unknown=await response.clone().json();if(body&&typeof body==='object'&&'warningDiagnostic' in body&&isDiagnostic(body.warningDiagnostic))remember(body.warningDiagnostic,'server');}catch{}}
  if(area&&!response.ok){
   try{const body:unknown=await response.clone().json();if(body&&typeof body==='object'&&'diagnostic' in body&&isDiagnostic(body.diagnostic))remember(body.diagnostic,'server');else if(!(area==='session'&&response.status===401))reportClientDiagnostic(makeDiagnostic(area,'request','HTTP_REQUEST_REJECTED',response.status));}catch{reportClientDiagnostic(makeDiagnostic(area,'request','HTTP_RESPONSE_INVALID',response.status));}
  }
  return response;
 }catch(error){if(area&&!(error instanceof Error&&error.name==='AbortError'&&init?.signal?.reason?.name==='AbortError'))clientFailure(area,'request',error);throw error;}
}
export function diagnosticText(d:Diagnostic){const definition=diagnosticCodes[d.code];return `${definition.title} — ${d.code}; takip: ${d.id}`;}
