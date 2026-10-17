import {diagnosticRoute} from '../../../lib/server-diagnostics';
import {getChatGPTUser} from '../../chatgpt-auth';
export const dynamic='force-dynamic';
async function handleGET(){
 const user=await getChatGPTUser();
 return Response.json({authenticated:!!user},{status:user?200:401,headers:{'Cache-Control':'private, no-store'}});
}

export const GET=diagnosticRoute('session','session-check',handleGET);
