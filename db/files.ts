import {getStore,getDeployStore} from '@netlify/blobs';
import {captureServerFailure,dependencyOperation} from '../lib/server-diagnostics';
export function files(){
 try{
 const store=process.env.CONTEXT==='production'
  ?getStore({name:'paki-private-documents',consistency:'strong'})
  :getDeployStore({name:'paki-private-documents',consistency:'strong'});
 return {
  async get(key:string){const bytes=await dependencyOperation('file','file-read',()=>store.get(key,{type:'arrayBuffer'}));return bytes?{body:bytes,arrayBuffer:async()=>bytes}:null;},
  async put(key:string,value:Uint8Array){const written=await dependencyOperation('file','file-write',()=>store.set(key,new Uint8Array(value).buffer,{onlyIfNew:true}));return written.modified?{etag:written.etag}:null;},
  async delete(key:string|string[]){for(const item of Array.isArray(key)?key:[key])await dependencyOperation('file','file-delete',()=>store.delete(item));}
 } as unknown as R2Bucket;
 }catch(error){captureServerFailure(error,'file','connect');throw error;}
}
