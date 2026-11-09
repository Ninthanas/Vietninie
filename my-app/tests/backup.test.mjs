import {test,beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import {importProgress,exportProgress} from '../src/features/progress/backup.ts';
let items;
beforeEach(()=>{items=new Map();globalThis.localStorage={get length(){return items.size;},key:i=>[...items.keys()][i]??null,getItem:key=>items.get(key)??null,setItem:(key,value)=>items.set(key,String(value))};});
test('backup excludes account tokens and unrelated browser data',()=>{items.set('sentruc_learned_zh','[1,2]');items.set('vietninie_react_user','{"access_token":"private"}');items.set('unrelated','secret');const result=JSON.parse(exportProgress());assert.deepEqual(result.data,{'sentruc_learned_zh':'[1,2]'});});
test('restore validates the whole backup before changing progress',()=>{items.set('sentruc_learned_zh','[9]');assert.throws(()=>importProgress(JSON.stringify({version:1,data:{sentruc_learned_zh:'[1]',sentruc_favorites_vi:'["bad"]'}})));assert.equal(items.get('sentruc_learned_zh'),'[9]');});
test('restore imports progress and ignores credential keys',()=>{importProgress(JSON.stringify({version:1,data:{sentruc_learned_zh:'[1,2]',sentruc_daily_log:'{"2026-11-10":2}',vietninie_react_user:'{"access_token":"injected"}'}}));assert.equal(items.get('sentruc_learned_zh'),'[1,2]');assert.equal(items.has('vietninie_react_user'),false);});
