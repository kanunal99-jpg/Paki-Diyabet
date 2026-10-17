// Test-only in-memory storage. Never used by the production build.
const objects=new Map<string,ArrayBuffer>();
export function getStore(){return {
 async get(key:string){return objects.get(key)??null;},
 async set(key:string,value:ArrayBuffer,options?:{onlyIfNew?:boolean}){if(options?.onlyIfNew&&objects.has(key))return {modified:false};objects.set(key,value);return {modified:true,etag:'test-only'};},
 async delete(key:string){objects.delete(key);}
};}
export const getDeployStore=getStore;
