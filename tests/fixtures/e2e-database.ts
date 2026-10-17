// Test-only adapter. Copied into a disposable Next.js stage by e2e-auth.cjs.
import {PGlite} from '@electric-sql/pglite';
import {readFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';
const state=globalThis as typeof globalThis&{pakiE2EDatabase?:Promise<PGlite>};
function database(){
 return state.pakiE2EDatabase??= (async()=>{
  const pg=new PGlite();
  await pg.exec(readFileSync(join(process.cwd(),'netlify/database/migrations/001_initial-schema/migration.sql'),'utf8'));
  return pg;
 })();
}
const pool={
 async query(sql:string,params:unknown[]=[]){const faultFile=process.env.PAKI_E2E_FAILURE_FILE;if(faultFile&&existsSync(faultFile)){const fault=JSON.parse(readFileSync(faultFile,'utf8'));if(fault.database)throw Object.assign(new Error('synthetic-private-health-note synthetic-private-password'),{code:fault.database});}const result=await (await database()).query(sql,params);return {rows:result.rows,rowCount:result.affectedRows??result.rows.length};},
 async connect(){return {query:pool.query,release(){}};},
 async end(){}
};
export const getDatabase=()=>({pool});
export const getConnectionString=()=>'test-only-pglite';
