import {diagnosticRoute} from '../../../lib/server-diagnostics';
import {getChatGPTUser} from '../../chatgpt-auth';
import {database} from '../../../db/raw';
import {reply,storageFailure} from '../../../lib/api';
import {unpack} from '../../../lib/server-journal';

// Only a server-managed Netlify Identity admin role grants inbox access.
async function handleGET(){const u=await getChatGPTUser();if(!u)return reply({error:'Giriş yapın.'},401);if(!u.canManage)return reply({canManage:false,entries:[],limited:false});try{const r=await database().prepare("SELECT j.id,j.kind,j.event_at AS at,j.payload FROM journal_entries j LEFT JOIN user_lifecycle l ON l.user_id=j.user_id WHERE j.kind='feedback' AND COALESCE(l.deleting,0)=0 ORDER BY j.event_at DESC,j.id DESC LIMIT 101").all();return reply({canManage:true,entries:r.results.slice(0,100).map(unpack),limited:r.results.length>100});}catch(error){return storageFailure('feedback_inbox_failed',error);}}

export const GET=diagnosticRoute('feedback','read',handleGET);
