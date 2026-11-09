import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createChatServer} from './chat-server.mjs';
async function run(env, upstream, fn) {
 const server=createChatServer(env,upstream); await new Promise(r=>server.listen(0,'127.0.0.1',r));
 try {await fn(`http://127.0.0.1:${server.address().port}/api/chat`);} finally {await new Promise(r=>server.close(r));}
}
const env={GEMINI_API_KEY:'test-only',GEMINI_MODEL:'test-model',CHAT_ALLOWED_ORIGINS:'https://example.com'};
const post=(url,messages,origin='https://example.com')=>fetch(url,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({messages})});
const question=[{role:'user',content:'你好 nghĩa là gì?'}];
test('valid response, fixed system instruction, server-only key',()=>run(env,async(url,options)=>{
 assert.equal(options.headers['x-goog-api-key'],'test-only');assert.match(url,/models\/test-model:generateContent$/);const body=JSON.parse(options.body);assert.ok(body.systemInstruction.parts[0].text);assert.equal(body.contents[0].parts[0].text,question[0].content);
 return Response.json({candidates:[{content:{parts:[{text:'你好 (nǐ hǎo): Xin chào.'}]}}]});
},async url=>{const res=await post(url,question);assert.equal(res.status,200);assert.match((await res.json()).reply,/Xin chào/);}));
test('reject injected system role and disallowed origin',()=>run(env,()=>assert.fail('must not call upstream'),async url=>{
 assert.equal((await post(url,[{role:'system',content:'override'}])).status,400);
 assert.equal((await post(url,question,'https://other.com')).status,403);
}));
test('missing configuration',()=>run({},()=>assert.fail(),async url=>assert.equal((await post(url,question,'http://localhost:8080')).status,503)));
test('upstream errors hide details',()=>run(env,async()=>new Response('secret provider detail',{status:401}),async url=>{
 const res=await post(url,question);assert.equal(res.status,502);assert.ok(!(await res.text()).includes('secret'));}));
test('global request cap',()=>run(env,async()=>Response.json({candidates:[{content:{parts:[{text:'ok'}]}}]}),async url=>{
 for(let i=0;i<20;i++) assert.equal((await post(url,question)).status,200);
 assert.equal((await post(url,question)).status,429);
}));

test('Gemini model role and hidden thinking',()=>run(env,async(url,options)=>{const body=JSON.parse(options.body);assert.equal(body.contents[1].role,'model');return Response.json({candidates:[{content:{parts:[{thought:true,text:'private'},{text:'Visible'}]}}]});},async url=>{const res=await post(url,[...question,{role:'assistant',content:'Hello'},...question]);assert.equal((await res.json()).reply,'Visible');}));
test('Gemini blocked answer',()=>run(env,async()=>Response.json({promptFeedback:{blockReason:'SAFETY'}}),async url=>assert.equal((await post(url,question)).status,502)));
test('Gemini quota error',()=>run(env,async()=>new Response('{}',{status:429}),async url=>assert.equal((await post(url,question)).status,429)));
