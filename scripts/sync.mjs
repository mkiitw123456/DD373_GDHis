import {readFile,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {initializeApp,cert} from 'firebase-admin/app';
import {getDatabase} from 'firebase-admin/database';
const root=fileURLToPath(new URL('..',import.meta.url));
// Credentials stay outside the public directory and are never sent to Vercel or browsers.
const config=JSON.parse(await readFile(resolve(root,'sync.config.json'),'utf8'));
const credential=JSON.parse(await readFile(config.serviceAccountPath,'utf8'));
initializeApp({credential:cert(credential),databaseURL:config.databaseURL});
execFileSync(config.pythonPath||'python',[resolve(root,'scripts/export.py')],{cwd:root,env:{...process.env,...(config.databasePath?{DD373_DATABASE:config.databasePath}:{})},stdio:'pipe'});
const manifest=JSON.parse(await readFile(resolve(root,'public/data/manifest.json'),'utf8'));
const ref=getDatabase().ref('dd373');
const current=(await ref.child('manifest').get()).val();
if(current?.version===manifest.version){console.log('No changed records');process.exit(0);}
const updates={manifest};
for(const [day,info] of Object.entries(manifest.days)){
  if(current?.days?.[day]?.version===info.version)continue;
  updates[`days/${day}/${info.version}`]=JSON.parse(await readFile(resolve(root,`public/data/${day}-${info.version}.json`),'utf8'));
}
// Atomic publication: readers cannot see a manifest before its day payload exists.
await ref.update(updates);
console.log(`Published ${Object.keys(updates).length-1} changed days`);
process.exit(0);
