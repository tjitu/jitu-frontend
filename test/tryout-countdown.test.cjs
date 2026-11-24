const {test}=require('node:test');
const assert=require('node:assert/strict');
const {getTryoutCountdown}=require('../lib/tryout-countdown.ts');
const start='2030-01-01T02:00:00Z', end='2030-01-01T04:00:00Z';
test('counts to start before the tryout begins',()=>assert.equal(getTryoutCountdown(start,end,Date.parse('2030-01-01T01:30:00Z')),'Mulai dalam 0h 30m 0s'));
test('switches to counting to the end exactly at start',()=>assert.equal(getTryoutCountdown(start,end,Date.parse(start)),'Berakhir dalam 2h 0m 0s'));
test('shows finished at end and handles missing dates',()=>{assert.equal(getTryoutCountdown(start,end,Date.parse(end)),'Selesai');assert.equal(getTryoutCountdown(null,null,Date.parse(end)),'Jadwal belum ditentukan')});
