import {AsyncLocalStorage} from 'node:async_hooks';
import {diagnosticCodes,makeDiagnostic,diagnosticFrom,dependencyCode,errorFacts,type Diagnostic,type DiagnosticArea,type DiagnosticStage,type DiagnosticCode} from './diagnostics';
type Scope={area:DiagnosticArea,stage:DiagnosticStage,id:string,failure?:Diagnostic,warning?:Diagnostic};
const scopes=new AsyncLocalStorage<Scope>();
export function inDiagnosticRequest(){return !!scopes.getStore();}
export async function dependencyOperation<T>(dependency:'database'|'file'|'external',stage:DiagnosticStage,run:()=>Promise<T>):Promise<T>{try{return await run();}catch(error){captureServerFailure(error,dependency,stage);throw error;}}
export function captureServerFailure(error:unknown,dependency?:'database'|'file'|'external',stage?:DiagnosticStage,code?:DiagnosticCode){
 const scope=scopes.getStore();const existing=diagnosticFrom(error);
 const diagnostic=existing?{...existing,id:scope?.id??existing.id}:makeDiagnostic(scope?.area??'runtime',stage??scope?.stage??'request',code??(dependency?dependencyCode(error,dependency):'APP_UNEXPECTED'),errorFacts(error).status,scope?.id);
 if(scope&&!scope.failure)scope.failure=diagnostic;
 return diagnostic;
}
export function logDiagnostic(diagnostic:Diagnostic,source:'server'|'browser-report'='server',outcome:'failed'|'fallback'='failed'){
 // Construct a whitelist record rather than spreading any caller-controlled object.
 const release=process.env.DEPLOY_ID;
 const record={event:'paki_diagnostic',source,outcome,version:1,timestamp:new Date().toISOString(),release:release&&/^[a-f0-9]{24,40}$/i.test(release)?release:'unknown',id:diagnostic.id,area:diagnostic.area,stage:diagnostic.stage,code:diagnostic.code,httpStatus:diagnostic.httpStatus,frameworkDigest:diagnostic.frameworkDigest,identified:diagnosticCodes[diagnostic.code].identified,retryable:diagnosticCodes[diagnostic.code].retryable};
 try{if(source==='browser-report'||outcome==='fallback')console.warn(JSON.stringify(record));else console.error(JSON.stringify(record));return true;}catch{return false;}
}
export function noteFallback(diagnostic:Diagnostic){logDiagnostic(diagnostic,'server','fallback');const scope=scopes.getStore();if(scope){scope.warning=diagnostic;if(scope.failure===diagnostic)scope.failure=undefined;}}
function responseCode(status:number):DiagnosticCode{
 if(status===401)return 'AUTH_REQUIRED';if(status===403)return 'ACCESS_DENIED';if(status===404)return 'RESOURCE_NOT_FOUND';if(status===409)return 'STATE_CONFLICT';if(status===413)return 'REQUEST_TOO_LARGE';if(status===422)return 'RESOURCE_LIMIT';if(status===429)return 'RATE_LIMITED';if(status>=500)return 'HTTP_UNAVAILABLE';return 'REQUEST_INVALID';
}
export function diagnosticRoute(area:DiagnosticArea,stage:DiagnosticStage,handler:(request:Request)=>Promise<Response>|Response){
 return async function route(request:Request):Promise<Response>{
  const scope:Scope={area,stage,id:crypto.randomUUID()};
  return scopes.run(scope,async()=>{
   let response:Response;
   try{response=await handler(request);}catch(error){captureServerFailure(error);const failure=scope.failure!;const unavailable=['AUTH_PROVIDER_UNAVAILABLE','DB_UNAVAILABLE','DB_CONFIGURATION','DB_CAPACITY','FILE_UNAVAILABLE','EXTERNAL_UNAVAILABLE','NETWORK_UNREACHABLE','NETWORK_TIMEOUT'].includes(failure.code);response=Response.json({error:unavailable?'İlgili hizmet şu anda işlemi tamamlayamıyor. Yeniden deneyin.':'İşlem beklenmeyen bir hata nedeniyle tamamlanamadı.'},{status:unavailable?503:500});}
   const headers=new Headers(response.headers);headers.set('X-Paki-Request-ID',scope.id);
   if(response.status<400){if(scope.warning&&response.headers.get('content-type')?.includes('application/json')){const body:unknown=await response.clone().json();if(body&&typeof body==='object'&&!Array.isArray(body)){headers.set('X-Paki-Warning-Code',scope.warning.code);headers.delete('Content-Length');return Response.json({...body,warningDiagnostic:scope.warning},{status:response.status,headers});}}return new Response(response.body,{status:response.status,statusText:response.statusText,headers});}
   let body:Record<string,unknown>={};try{const parsed:unknown=await response.clone().json();if(parsed&&typeof parsed==='object'&&!Array.isArray(parsed))body=parsed as Record<string,unknown>;}catch{}
   // An anonymous session probe is normal and should not flood logs or the UI.
   if(area==='session'&&response.status===401&&!scope.failure)return new Response(response.body,{status:response.status,headers});
   const code=responseCode(response.status);
   const useCause=response.status>=500||response.status===401||response.status===403&&scope.failure?.code==='ORIGIN_REJECTED';
   const failure=useCause&&scope.failure?{...scope.failure,httpStatus:scope.failure.httpStatus??response.status}:makeDiagnostic(area,stage,code,response.status,scope.id);
   logDiagnostic(failure);headers.set('Cache-Control','private, no-store');headers.set('Content-Type','application/json');headers.set('X-Content-Type-Options','nosniff');headers.delete('Content-Length');headers.delete('Content-Encoding');headers.set('X-Paki-Error-Code',failure.code);
   return Response.json({...body,diagnostic:failure},{status:response.status,headers});
  });
 };
}
