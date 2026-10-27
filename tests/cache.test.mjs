import test from 'node:test';import assert from 'node:assert/strict';import {loadData} from '../src/cache.mjs';
test('repeat visit only checks manifest; corrected day replaces cached data; offline preserves data',async()=>{
const original=globalThis.fetch;let calls=[];let version='a'.repeat(64);let value=9;let offline=false;
globalThis.fetch=async url=>{calls.push(url);if(offline)throw Error('offline');return {ok:true,json:async()=>url==='/api/data'?{schema:1,days:{'2026-10-27':{version,count:1}},latestAt:'2026-10-27T00:00:00+08:00'}:[[1793030400000,value]]};};
try{let r=await loadData(()=>{});assert.equal(calls.length,2);assert.equal(r.rows[0][1],9);calls=[];await loadData(()=>{});assert.equal(calls.length,1);version='b'.repeat(64);value=10;calls=[];r=await loadData(()=>{});assert.equal(calls.length,2);assert.equal(r.rows[0][1],10);offline=true;r=await loadData(()=>{});assert.equal(r.rows[0][1],10);assert.equal(r.error,'offline');}finally{globalThis.fetch=original;}
});
