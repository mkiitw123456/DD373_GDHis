export default async function handler(req,res){
  if(req.method!=='GET') return res.status(405).json({error:'Method not allowed'});
  const base=process.env.FIREBASE_DATABASE_URL;
  if(!base) return res.status(503).json({error:'Firebase 尚未連接'});
  const {day,version}=req.query;
  if((day||version)&&(!/^\d{4}-\d{2}-\d{2}$/.test(day||'')||!/^[a-f0-9]{64}$/.test(version||''))) return res.status(400).json({error:'Invalid request'});
  let url;
  try {url=new URL(base);if(url.protocol!=='https:'||!/(\.firebasedatabase\.app|\.firebaseio\.com)$/.test(url.hostname))throw Error();}catch{return res.status(503).json({error:'Firebase 設定錯誤'});}
  const path=day?`days/${day}/${version}`:'manifest';
  try{
    const upstream=await fetch(`${url.origin}/dd373/${path}.json`,{signal:AbortSignal.timeout(10000)});
    if(!upstream.ok) throw Error();
    const value=await upstream.json();if(!value) return res.status(404).json({error:'Data not found'});
    res.setHeader('Cache-Control',day?'public, max-age=31536000, immutable':'public, max-age=60');
    res.setHeader('Vercel-CDN-Cache-Control',day?'public, max-age=31536000':'public, max-age=300, stale-while-revalidate=60');
    return res.status(200).json(value);
  }catch{return res.status(502).json({error:'暫時無法取得資料，請稍後再試'});}
}
