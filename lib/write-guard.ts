import {database} from '../db/raw';
import {reply,storageFailure} from './api';

type Scope={userId:string,epoch:number};
export class WriteBlocked extends Error{}
export async function syncContext(userId:string){
 const row=await database().prepare('SELECT epoch,deleting,last_deletion_id AS lastDeletionId FROM user_lifecycle WHERE user_id=?').bind(userId).first<{epoch:number,deleting:number,lastDeletionId:string}>();
 return {userId,epoch:row?.epoch??0,deleting:!!row?.deleting,lastDeletionId:row?.lastDeletionId??''};
}
export async function mutationScope(request:Request,userId:string):Promise<Scope>{
 const context=await syncContext(userId),header=request.headers.get('X-Paki-Sync-Epoch');
 if(request.headers.get('X-Paki-Expected-User')&&request.headers.get('X-Paki-Expected-User')!==userId)throw new WriteBlocked('Hesabınız değişti. Sayfayı yenileyin.');
 if(context.deleting)throw new WriteBlocked('Veri silme işlemi sürüyor. Önce silme işlemini tamamlayın.');
 if(header!==null&&(!/^\d{1,10}$/.test(header)||Number(header)!==context.epoch)||header===null&&context.epoch>0)throw new WriteBlocked('Veriler silindikten önceki bir işlem gönderilemez. Sayfayı yenileyin.');
 return {userId,epoch:context.epoch};
}
// The assertion and write share one D1 transaction. Deletion cannot race a paused write.
export async function guardedBatch(scope:Scope,statements:D1PreparedStatement[]){
 const db=database(),id=crypto.randomUUID();
 const assertion=db.prepare('INSERT INTO write_assertions (id,valid) SELECT ?,CASE WHEN COALESCE((SELECT epoch FROM user_lifecycle WHERE user_id=?),0)=? AND COALESCE((SELECT deleting FROM user_lifecycle WHERE user_id=?),0)=0 THEN 1 ELSE 0 END').bind(id,scope.userId,scope.epoch,scope.userId);
 try{const results=await db.batch([assertion,...statements,db.prepare('DELETE FROM write_assertions WHERE id=?').bind(id)]);return results.slice(1,-1);}
 catch(e){if(String(e).includes('paki_write_allowed'))throw new WriteBlocked('Bu işlem veri silme sırasında durduruldu. Sayfayı yenileyin.');throw e;}
}
export async function guardedRun(scope:Scope,statement:D1PreparedStatement){return (await guardedBatch(scope,[statement]))[0];}
export function writeFailure(error:unknown,event:string){return error instanceof WriteBlocked?reply({error:error.message,code:'epoch_changed'},409):storageFailure(event,error);}
