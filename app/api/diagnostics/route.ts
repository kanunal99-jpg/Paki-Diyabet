import {isDiagnostic} from '../../../lib/diagnostics';
import {logDiagnostic} from '../../../lib/server-diagnostics';
import {mutationAllowed,privateHeaders} from '../../../lib/api';
export const dynamic='force-dynamic';
let windowStart=0,accepted=0;
async function readDiagnostic(request:Request){
 if(Number(request.headers.get('content-length')||0)>700||!request.body)throw new Error('invalid');
 const reader=request.body.getReader(),decoder=new TextDecoder();let length=0,text='';
 try{while(true){const chunk=await reader.read();if(chunk.done)break;length+=chunk.value.byteLength;if(length>700){await reader.cancel().catch(()=>{});throw new Error('too_large');}text+=decoder.decode(chunk.value,{stream:true});}text+=decoder.decode();return JSON.parse(text) as unknown;}finally{reader.releaseLock();}
}
export async function POST(request:Request){
 const reply=(status:number)=>Response.json({accepted:status===202},{status,headers:privateHeaders});
 if(!mutationAllowed(request)||request.headers.get('sec-fetch-site')==='cross-site')return reply(403);
 if(request.headers.get('content-type')?.split(';')[0]!=='application/json')return reply(415);
 let body:unknown;try{body=await readDiagnostic(request);}catch{return reply(400);}
 if(!isDiagnostic(body))return reply(400);
 // A bounded best-effort log sink, not an authenticated source of truth.
 const now=Date.now();if(now-windowStart>=60000){windowStart=now;accepted=0;}if(accepted>=60)return reply(429);accepted++;
 return reply(logDiagnostic(body,'browser-report')?202:503);
}
