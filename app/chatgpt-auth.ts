import {getUser} from '@netlify/identity';
import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {safeReturnPath} from '../lib/return-path';
import {captureServerFailure,inDiagnosticRequest,logDiagnostic} from '../lib/server-diagnostics';
import {DiagnosticError,errorFacts,type DiagnosticCode} from '../lib/diagnostics';
function verificationFailure(cause:unknown,code:DiagnosticCode):null{
 const diagnostic=captureServerFailure(cause,undefined,'session-check',code);
 if(inDiagnosticRequest())throw new DiagnosticError(diagnostic);
 logDiagnostic(diagnostic);return null;
}
export type ChatGPTUser={userId:string,displayName:string,email:string,fullName:string|null,canManage?:boolean};
export async function getChatGPTUser():Promise<ChatGPTUser|null>{
 const token=(await cookies()).get('nf_jwt')?.value;
 if(token){
  // Next's request cookies remain available when the platform SDK context is absent.
  // Ask Identity to validate the token; never authorize decoded client claims.
  try{
   const endpoint=new URL('/.netlify/identity/user',process.env.URL||'https://pakidiyabet.netlify.app');
   if(endpoint.protocol!=='https:')return verificationFailure(null,'AUTH_CONFIGURATION');
   const response=await fetch(endpoint,{headers:{Authorization:`Bearer ${token}`},cache:'no-store',redirect:'error',signal:AbortSignal.timeout(8000)});
   if(!response.ok){if(response.status>=500)return verificationFailure({status:response.status},'AUTH_PROVIDER_UNAVAILABLE');captureServerFailure({status:response.status},undefined,'session-check','SESSION_TOKEN_REJECTED');return null;}
   let raw:unknown;try{raw=await response.json();}catch{return verificationFailure(null,'AUTH_RESPONSE_INVALID');}
   if(!raw||typeof raw!=='object')return verificationFailure(null,'AUTH_RESPONSE_INVALID');
   const data=raw as {id?:unknown,email?:unknown,confirmed_at?:unknown,user_metadata?:{full_name?:unknown,name?:unknown},app_metadata?:{roles?:unknown}};
   if(typeof data.id!=='string'||!data.id||typeof data.email!=='string'||!data.email)return verificationFailure(null,'AUTH_RESPONSE_INVALID');
   if(typeof data.confirmed_at!=='string'||!data.confirmed_at){captureServerFailure(null,undefined,'session-check','AUTH_EMAIL_UNCONFIRMED');return null;}
   const name=data.user_metadata?.full_name||data.user_metadata?.name;
   return {userId:data.id,email:data.email.toLowerCase(),displayName:typeof name==='string'&&name?name:data.email,fullName:typeof name==='string'?name:null,canManage:Array.isArray(data.app_metadata?.roles)&&data.app_metadata.roles.includes('admin')};
  }catch(cause){if(cause instanceof DiagnosticError&&inDiagnosticRequest())throw cause;const facts=errorFacts(cause);return verificationFailure(cause,facts.timeout?'NETWORK_TIMEOUT':facts.network?'NETWORK_UNREACHABLE':'AUTH_PROVIDER_UNAVAILABLE');}
 }
 let user;try{user=await getUser();}catch(cause){const facts=errorFacts(cause);return verificationFailure(cause,facts.timeout?'NETWORK_TIMEOUT':facts.network?'NETWORK_UNREACHABLE':'AUTH_PROVIDER_UNAVAILABLE');}
 // Signed Identity tokens are verified server-side. Sites request headers are not trusted.
 if(!user?.id||!user.email||!user.confirmedAt)return null;
 return {userId:user.id,email:user.email.toLowerCase(),displayName:user.name||user.email,fullName:user.name||null,canManage:user.roles?.includes('admin')??false};
}
export async function requireChatGPTUser(returnTo:string){const user=await getChatGPTUser();if(user)return user;redirect(chatGPTSignInPath(returnTo));}
export function chatGPTSignInPath(returnTo='/'){return '/giris?return_to='+encodeURIComponent(safeReturnPath(returnTo));}
export function chatGPTSignOutPath(returnTo='/'){return '/cikis?return_to='+encodeURIComponent(safeReturnPath(returnTo));}
