import {validPoints} from './data.mjs';
const memory=new Map();let dbPromise;
function db(){return dbPromise??=new Promise((resolve,reject)=>{const r=indexedDB.open('dd373-history-v1',1);r.onupgradeneeded=()=>r.result.createObjectStore('cache');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);}).catch(()=>null);}
export async function get(key){try{const d=await db();if(!d)return memory.get(key);return await new Promise((resolve,reject)=>{const r=d.transaction('cache').objectStore('cache').get(key);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}catch{return memory.get(key);}}
export async function put(key,value){memory.set(key,value);try{const d=await db();if(!d)return false;await new Promise((resolve,reject)=>{const tx=d.transaction('cache','readwrite');tx.objectStore('cache').put(value,key);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});return true;}catch{return false;}}
async function readJSON(url){const r=await fetch(url,{signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error('目前無法更新，已保留上次成功取得的資料。');return r.json();}
const local=import.meta.env.DEV;
const endpoint=local?'/data/manifest.json':'/api/data';
let inFlight;
export function loadData(onCached){return inFlight??=(async()=>{
 const saved=await get('snapshot');if(saved?.rows&&validPoints(saved.rows))onCached(saved);
 try{
   const manifest=await readJSON(endpoint);
   if(manifest.schema!==1||!manifest.days)throw Error('資料格式無法辨識');
   const entries=Object.entries(manifest.days).sort();const parts=[];
   // Bounded requests avoid a burst against Firebase on first visit.
   for(let i=0;i<entries.length;i+=4){parts.push(...await Promise.all(entries.slice(i,i+4).map(async([day,info])=>{
     if(!/^\d{4}-\d{2}-\d{2}$/.test(day)||!/^[a-f0-9]{64}$/.test(info.version))throw Error('資料版本無效');
     const key=`day:${day}:${info.version}`;let points=await get(key);
     if(!validPoints(points)){points=await readJSON(local?`/data/${day}-${info.version}.json`:`/api/data?day=${day}&version=${info.version}`);if(!validPoints(points))throw Error('資料格式無法辨識');await put(key,points);}
     return points;
   })));}
   const result={rows:parts.flat().sort((a,b)=>a[0]-b[0]),manifest,checkedAt:Date.now(),source:local?'本機歷史資料預覽':'Firebase'};
   result.persisted=await put('snapshot',result);return result;
 }catch(e){if(saved?.rows&&validPoints(saved.rows))return {...saved,error:e.message};throw e;}
})().finally(()=>{inFlight=null;});}
