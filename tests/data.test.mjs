import test from 'node:test';
import assert from 'node:assert/strict';
import {filterRange,fromTaiwanInput,taiwanInput,dailySummary,validPoints} from '../src/data.mjs';
test('Taiwan dates are independent of viewer timezone',()=>{const t=Date.parse('2026-10-26T16:00:00Z');assert.equal(taiwanInput(t),'2026-10-27T00:00');assert.equal(fromTaiwanInput('2026-10-27T00:00'),t);});
test('range boundaries inclusive and out of range empty',()=>{assert.deepEqual(filterRange([[1,8],[2,9],[3,10]],[2,3]),[[2,9],[3,10]]);assert.deepEqual(filterRange([[1,8]],[2,3]),[]);});
test('daily grouping uses Taiwan midnight, handles one point',()=>{const rows=[[Date.parse('2026-10-26T15:59Z'),9],[Date.parse('2026-10-26T16:00Z'),10]];const ds=dailySummary(rows);assert.equal(ds.length,2);assert.equal(ds[0].day,'2026-10-27');assert.equal(ds[0].high[1],10);assert.equal(ds[0].count,1);});
test('malformed cloud payload rejected',()=>{assert.equal(validPoints([[1,0]]),false);assert.equal(validPoints([[1,null]]),false);assert.equal(validPoints({}),false);assert.equal(validPoints([[1,3]]),true);});
