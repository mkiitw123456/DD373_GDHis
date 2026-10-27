import sqlite3, json, hashlib, os
from pathlib import Path
from datetime import datetime, timezone, timedelta
ROOT=Path(__file__).resolve().parents[1]
dbpath=Path(os.environ.get('DD373_DATABASE',r'C:\Users\User\Documents\Codex\2026-10-12\https-www-dd373-com-s-cbk5a5\outputs\dd373-monitor\history.sqlite3'))
db=sqlite3.connect(dbpath.as_uri()+'?mode=ro',uri=True)
rows=db.execute('SELECT id,day,ts,ratio FROM points ORDER BY ts,id').fetchall();db.close()
days={}
for ident,day,ts,ratio in rows: days.setdefault(day,[]).append([int(datetime.fromisoformat(ts).timestamp()*1000),float(ratio)])
out=ROOT/'public'/'data';out.mkdir(parents=True,exist_ok=True)
manifest={'schema':1,'days':{},'exportedAt':datetime.now(timezone.utc).isoformat(),'latestAt':rows[-1][2] if rows else None}
for day,points in days.items():
    text=json.dumps(points,separators=(',',':'));version=hashlib.sha256(text.encode()).hexdigest()
    manifest['days'][day]={'version':version,'count':len(points)}
    (out/f'{day}-{version}.json').write_text(text,encoding='utf-8')
manifest['version']=hashlib.sha256(json.dumps(manifest['days'],sort_keys=True).encode()).hexdigest()
(out/'manifest.json').write_text(json.dumps(manifest,separators=(',',':')),encoding='utf-8')
print(json.dumps({'days':len(days),'points':len(rows),'latestAt':manifest['latestAt']}))
