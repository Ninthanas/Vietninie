import {spawn} from 'node:child_process';
import {createServer} from 'node:net';
import {createWriteStream} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const root=fileURLToPath(new URL('../',import.meta.url));
const socket=createServer();await new Promise(resolve=>socket.listen(0,'127.0.0.1',resolve));
const port=socket.address().port;await new Promise(resolve=>socket.close(resolve));
const java=process.env.JAVA_HOME?path.join(process.env.JAVA_HOME,'bin',process.platform==='win32'?'java.exe':'java'):'java';
const log=createWriteStream(path.join(root,'target/smoke.log'));
const child=spawn(java,['-jar','target/vietninie-api-1.0.0.jar','--server.port='+port,'--spring.datasource.url=jdbc:h2:mem:smoke;DB_CLOSE_DELAY=-1','--spring.jpa.hibernate.ddl-auto=create-drop'],{cwd:root,env:process.env,stdio:['ignore','pipe','pipe']});
child.stdout.pipe(log);child.stderr.pipe(log);
let startupError;child.on('error',error=>{startupError=error;});
const base='http://127.0.0.1:'+port;
async function request(route,method='GET',body,token){const response=await fetch(base+route,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(5000)});return {status:response.status,data:response.status===204?null:await response.json()};}
try {
 let ready=false;
 for(let i=0;i<80;i++){if(startupError)throw startupError;try{const data=await request('/api/data/chinese-vocabulary.json');if(data.status===200&&data.data.length){ready=true;break;}}catch{/* Wait for startup and seed commit. */}await new Promise(resolve=>setTimeout(resolve,500));}
 assert.ok(ready,'Java application did not become ready. See target/smoke.log.');
 const anonymous=await request('/api/progress/me');assert.equal(anonymous.status,401);
 const account=await request('/api/auth/register','POST',{username:'packaged_smoke',password:'Packaged-smoke-2026'});assert.equal(account.status,201);assert.deepEqual(account.data.roles,['USER']);const token=account.data.access_token;
 assert.equal((await request('/api/auth/me','GET',undefined,token)).status,200);
 assert.equal((await request('/api/admin/users','GET',undefined,token)).status,403);
 assert.equal((await request('/api/progress/me/vocabulary/1','PUT',{learned:true,favorite:true},token)).status,200);
 assert.equal((await request('/api/progress/me','GET',undefined,token)).data.words.length,1);
 assert.equal((await request('/api/auth/logout','POST',undefined,token)).status,204);
 assert.equal((await request('/api/auth/me','GET',undefined,token)).status,401);
 console.log('Packaged Java API: startup, Hibernate seed, JWT, RBAC, progress and logout passed.');
} finally {child.kill();await new Promise(resolve=>child.once('exit',resolve));log.end();}
