import {captureServerFailure} from './server-diagnostics';
export const privateHeaders={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
export const reply=(data:unknown,status=200)=>Response.json(data,{status,headers:privateHeaders});
export const mutationAllowed=(r:Request)=>{const origin=r.headers.get('origin'),allowed=origin===new URL(r.url).origin;if(!allowed)captureServerFailure(null,undefined,'request','ORIGIN_REJECTED');return allowed;};
export async function readBody(r:Request,max:number){if(Number(r.headers.get('content-length')||0)>max)throw new Error('too_large');const bytes=new Uint8Array(await r.arrayBuffer());if(bytes.byteLength>max)throw new Error('too_large');return JSON.parse(new TextDecoder().decode(bytes));}
export function storageFailure(event:string,error?:unknown){if(error)captureServerFailure(error);return reply({error:'Kayıt hizmetine ulaşılamıyor. Formunuz açık kalır; bağlantınızı kontrol edip yeniden deneyin.'},503);}
