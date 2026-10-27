export const taiwanInput=t=>new Date(t+8*3600000).toISOString().slice(0,16);
export const fromTaiwanInput=s=>Date.parse(s+':00+08:00');
export const fmt=(t,seconds=false)=>new Intl.DateTimeFormat('zh-TW',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',...(seconds?{second:'2-digit'}:{}),hour12:false}).format(new Date(t));
export const dateKey=t=>new Date(t+8*3600000).toISOString().slice(0,10);
export function filterRange(rows,range){return range?rows.filter(r=>r[0]>=range[0]&&r[0]<=range[1]):rows;}
export function summarize(rows){
 if(!rows.length)return null;
 return {first:rows[0],last:rows.at(-1),high:rows.reduce((a,b)=>b[1]>a[1]?b:a),low:rows.reduce((a,b)=>b[1]<a[1]?b:a),count:rows.length};
}
export function dailySummary(rows){const map=new Map();for(const r of rows){const day=dateKey(r[0]);if(!map.has(day))map.set(day,[]);map.get(day).push(r);}return [...map].map(([day,rs])=>({day,...summarize(rs)})).reverse();}
export function validPoints(rows){return Array.isArray(rows)&&rows.every(r=>Array.isArray(r)&&r.length===2&&Number.isFinite(r[0])&&Number.isFinite(r[1])&&r[1]>0);}
