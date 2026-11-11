import assert from 'node:assert/strict';
import fs from 'node:fs';

const {rows}=JSON.parse(fs.readFileSync(new URL('./dashboard/data.json',import.meta.url),'utf8'));
assert.ok(rows.length>0,'Snapshot must contain observations');
const keys=new Set(),mines=new Map();
for(const r of rows){
  const key=`${r.date}/${r.mine}`;
  assert.ok(!keys.has(key),`Duplicate mine/day: ${key}`); keys.add(key);
  assert.match(r.date,/^2026-\d{2}-\d{2}$/);
  assert.ok(Number.isFinite(r.output)&&r.output>=0,`Invalid output: ${key}`);
  assert.ok(Number.isFinite(r.movingAverage),`Invalid moving average: ${key}`);
  if(!mines.has(r.mine))mines.set(r.mine,[]);
  mines.get(r.mine).push(r);
}
for(const [mine,series] of mines){
  series.sort((a,b)=>a.date.localeCompare(b.date));
  assert.equal(series.length,365,`${mine}: expected one row per day`);
  for(let i=0;i<series.length;i++){
    if(i)assert.equal(Date.parse(series[i].date)-Date.parse(series[i-1].date),86400000,`${mine}: missing day`);
    const window=series.slice(Math.max(0,i-6),i+1);
    const expected=window.reduce((sum,r)=>sum+r.output,0)/window.length;
    assert.ok(Math.abs(series[i].movingAverage-expected)<0.002,`${mine} ${series[i].date}: incorrect trailing average`);
  }
}
console.log(`PASS: ${rows.length} rows; ${mines.size} complete mine series; duplicate, date, finite-value and rolling-window checks`);
