import {getDatabase,getConnectionString} from '@netlify/database';
import {captureServerFailure,dependencyOperation} from '../lib/server-diagnostics';

// Preserve parameter binding and camel-case result fields when moving to Postgres.
export function postgresSQL(sql:string){
 let parameter=0;
 return sql.replace(/\?/g,()=>'$'+(++parameter)).replace(/\bAS\s+([a-zA-Z][a-zA-Z0-9]*)/g,(_,name:string)=>'AS "'+name+'"');
}
type QueryResult={rows:Record<string,unknown>[],rowCount?:number|null};
type QueryClient={query:(text:string,params?:unknown[])=>Promise<QueryResult>,release:()=>void};
type QueryPool={query:(text:string,params?:unknown[])=>Promise<QueryResult>,connect:()=>Promise<QueryClient>};
function result(r:QueryResult){
 const numbers=new Set(['consented_at','expiresAt','expires_at','n','epoch','deleting','revoked','size','storageEpoch','value','secondary']);
 const rows=r.rows.map(row=>Object.fromEntries(Object.entries(row).map(([key,value])=>[key,numbers.has(key)&&typeof value==='string'?Number(value):value])));
 return {results:rows,success:true,meta:{changes:r.rowCount??0,duration:0}};
}
export function createDatabase(pool:QueryPool){
 class Statement {
  constructor(readonly text:string,readonly params:unknown[]=[]){}
  bind(...params:unknown[]){return new Statement(this.text,params);}
  async all(){return result(await dependencyOperation('database','query',()=>pool.query(postgresSQL(this.text),this.params)));}
  async first<T=Record<string,unknown>>(){return ((await this.all()).results[0]??null) as T|null;}
  async run(){return (await batch([this]))[0];}
 }
 async function batch(statements:Statement[]){
  const client=await dependencyOperation('database','connect',()=>pool.connect());
  try{
   await client.query('BEGIN');
   // Serialize mutation guards and lifecycle locks across every server instance.
   await client.query('SELECT pg_advisory_xact_lock(739812741)');
   const results=[];
   for(const statement of statements)results.push(result(await client.query(postgresSQL(statement.text),statement.params)));
   await client.query('COMMIT');return results;
  }catch(error){captureServerFailure(error,'database','transaction');await client.query('ROLLBACK').catch(()=>{});throw error;}finally{client.release();}
 }
 return {prepare:(sql:string)=>new Statement(sql),batch};
}
let cached:{connection:string,db:ReturnType<typeof createDatabase>,pool:ReturnType<typeof getDatabase>['pool']}|undefined;
export function database(){
 try{
 const connection=getConnectionString();
 if(!cached||cached.connection!==connection){
  const prior=cached,instance=getDatabase();
  cached={connection,pool:instance.pool,db:createDatabase(instance.pool as unknown as QueryPool)};
  if(prior)void prior.pool.end().catch(()=>{});
 }
 return cached.db as unknown as D1Database;
 }catch(error){captureServerFailure(error,'database','connect');throw error;}
}
