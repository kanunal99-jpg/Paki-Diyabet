import {diagnosticRoute} from '../../../lib/server-diagnostics';
import {database} from '../../../db/raw';
import {privateHeaders} from '../../../lib/api';
export const dynamic='force-dynamic';
async function handleGET(){try{await database().prepare('SELECT 1 AS ready').first();return Response.json({ok:true},{headers:privateHeaders});}catch{console.error(JSON.stringify({event:'database_health_failed'}));return Response.json({ok:false},{status:503,headers:privateHeaders});}}

export const GET=diagnosticRoute('status','read',handleGET);
