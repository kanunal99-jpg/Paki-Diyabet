import {diagnosticRoute} from '../../../lib/server-diagnostics';
import {getChatGPTUser} from '../../chatgpt-auth';
import {database} from '../../../db/raw';
import {reply,readBody,mutationAllowed,storageFailure} from '../../../lib/api';
import {tokenHash} from '../../../lib/shares';
async function handlePOST(request:Request){const u=await getChatGPTUser();if(!u)return reply({error:'Paylaşımı açmak için belirtilen alıcının hesabıyla giriş yapın.'},401);if(!mutationAllowed(request))return reply({error:'İstek kabul edilmedi.'},403);try{const {token}=await readBody(request,1000);if(typeof token!=='string'||!/^[a-f0-9]{64}$/.test(token))return reply({error:'Paylaşım bağlantısı geçersiz.'},400);const row=await database().prepare('SELECT user_id AS owner,recipient,snapshot,expires_at AS expiresAt,revoked FROM record_shares WHERE token_hash=? AND NOT EXISTS (SELECT 1 FROM user_lifecycle WHERE user_lifecycle.user_id=record_shares.user_id AND deleting=1)').bind(await tokenHash(token)).first<{owner:string,recipient:string,snapshot:string,expiresAt:number,revoked:number}>();if(!row||row.revoked||row.expiresAt<=Date.now()||(row.owner!==u.userId&&row.recipient!==u.email.trim().toLowerCase()))return reply({error:'Paylaşım bulunamadı, süresi doldu veya bu hesaba izin verilmedi.'},404);return reply({snapshot:JSON.parse(row.snapshot),expiresAt:row.expiresAt});}catch(error){return storageFailure('share_view_failed',error);}}

export const POST=diagnosticRoute('shared','create',handlePOST);
