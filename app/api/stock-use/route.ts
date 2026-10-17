import {diagnosticRoute} from '../../../lib/server-diagnostics';
import {mutationScope,writeFailure,guardedRun} from '../../../lib/write-guard';
import {getChatGPTUser} from '../../chatgpt-auth';
import {database} from '../../../db/raw';
import {readBody,reply,mutationAllowed} from '../../../lib/api';
import {unpack} from '../../../lib/server-journal';
async function handlePOST(request:Request){const u=await getChatGPTUser();if(!u)return reply({error:'Giriş yapın.'},401);if(!mutationAllowed(request))return reply({error:'İstek kabul edilmedi.'},403);try{const scope=await mutationScope(request,u.userId);const {id}=await readBody(request,1000);if(typeof id!=='string'||!/^[a-f0-9-]{36}$/i.test(id))return reply({error:'Geçersiz stok kaydı.'},400);const db=database();const r=await guardedRun(scope,db.prepare("UPDATE journal_entries SET payload=jsonb_set(payload::jsonb,'{quantity}',to_jsonb((payload::jsonb->>'quantity')::numeric-1))::text WHERE id=? AND user_id=? AND kind='stock' AND (payload::jsonb->>'quantity')::numeric>=1").bind(id,u.userId));if(!r.meta.changes)return reply({error:'Stok yok veya bu kayda erişilemiyor. Güncel miktarı kontrol edin.'},409);const e=await db.prepare('SELECT id,kind,event_at AS at,payload FROM journal_entries WHERE id=? AND user_id=?').bind(id,u.userId).first();console.info(JSON.stringify({event:'stock_reduced'}));return reply({entry:unpack(e)});}catch(e){return writeFailure(e,'stock_update_failed');}}

export const POST=diagnosticRoute('stock-use','create',handlePOST);
