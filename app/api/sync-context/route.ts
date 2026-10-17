import {diagnosticRoute} from '../../../lib/server-diagnostics';
import {getChatGPTUser} from '../../chatgpt-auth';
import {reply,storageFailure} from '../../../lib/api';
import {syncContext} from '../../../lib/write-guard';
async function handleGET(){const user=await getChatGPTUser();if(!user)return reply({error:'Giriş yapın.'},401);try{return reply(await syncContext(user.userId));}catch(error){return storageFailure('sync_context_failed',error);}}

export const GET=diagnosticRoute('sync-context','read',handleGET);
