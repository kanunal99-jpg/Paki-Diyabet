'use client';
import ErrorPage from './error';
export default function GlobalError({error,retry}:{error:Error&{digest?:string},retry:()=>void}){
 return <html lang="tr"><body style={{fontFamily:'system-ui,sans-serif',padding:'24px',lineHeight:1.6}}><ErrorPage error={error} retry={retry}/></body></html>;
}
