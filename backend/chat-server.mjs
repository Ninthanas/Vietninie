import http from 'node:http';
import {pathToFileURL} from 'node:url';
const prompt = 'Bạn là trợ lý Vietninie, giúp học tiếng Trung và tiếng Việt. Trả lời bằng ngôn ngữ người dùng, ngắn gọn, chính xác. Với tiếng Trung hãy có chữ Hán, pinyin và nghĩa tiếng Việt khi phù hợp. Giúp về từ vựng, ngữ pháp, phát âm, hội thoại và chuyên ngành công việc. Không bịa tính năng website hay tiến độ cá nhân. Khi không chắc hãy nói rõ.';
export function createChatServer(env = process.env, fetcher = fetch) {
 const origins = (env.CHAT_ALLOWED_ORIGINS || 'http://localhost:8080,http://127.0.0.1:8080').split(',').map(x=>x.trim());
 let count = 0, reset = Date.now()+60000, active = 0;
 return http.createServer(async (req,res) => {
  const origin = req.headers.origin;
  const send = (status,body) => {res.writeHead(status, {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(body));};
  if (origin && !origins.includes(origin)) return send(403,{error:'Nguồn truy cập không được phép.'});
  if(origin) {res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');}
  if(req.url === '/health' && req.method === 'GET') return send(200,{status:'ok'});
  if(req.url !== '/api/chat') return send(404,{error:'Not found'});
  if(req.method === 'OPTIONS') {res.setHeader('Access-Control-Allow-Methods','POST');res.setHeader('Access-Control-Allow-Headers','Content-Type');res.writeHead(204);return res.end();}
  if(req.method !== 'POST') return send(405,{error:'Method not allowed'});
  if(Date.now()>reset) {count=0;reset=Date.now()+60000;}
  if(count>=20 || active>=3) return send(429,{error:'Trợ lý đang bận. Vui lòng chờ một phút.'});
  if(!env.GEMINI_API_KEY || !env.GEMINI_MODEL) return send(503,{error:'Trợ lý AI chưa được cấu hình. Vui lòng quay lại sau.'});
  count++; active++;
  try {
   let body=''; for await(const chunk of req) {body+=chunk;if(Buffer.byteLength(body)>32000) {send(413,{error:'Câu hỏi quá dài.'});return;}}
   let data; try {data=JSON.parse(body);} catch {return send(400,{error:'Dữ liệu không hợp lệ.'});}
   const messages=data.messages;
   if(!Array.isArray(messages)||!messages.length||messages.length>12||messages.at(-1)?.role!=='user'||messages.some(m=>!['user','assistant'].includes(m.role)||typeof m.content!=='string'||!m.content.trim()||m.content.length>6000)||messages.at(-1).content.length>2000) return send(400,{error:'Câu hỏi không hợp lệ hoặc quá dài.'});
   const upstream=await fetcher('https://generativelanguage.googleapis.com/v1beta/models/'+encodeURIComponent(env.GEMINI_MODEL)+':generateContent',{
    method:'POST', headers:{'x-goog-api-key':env.GEMINI_API_KEY,'Content-Type':'application/json'},
    body:JSON.stringify({systemInstruction:{parts:[{text:prompt}]},contents:messages.map(({role,content})=>({role:role==='assistant'?'model':'user',parts:[{text:content}]})),generationConfig:{maxOutputTokens:2048}}),signal:AbortSignal.timeout(35000)
   });
   if(!upstream.ok) {
    console.error('Gemini request failed:', upstream.status);
    const errors={401:'Khóa Gemini chưa được xác thực.',403:'Khóa Gemini chưa có quyền truy cập dịch vụ.',404:'Model Gemini chưa khả dụng.',400:'Cấu hình hoặc khóa Gemini không hợp lệ.',429:'Gemini đang hết lượt hoặc quá tải. Hãy thử lại sau.'};
    return send(upstream.status===429?429:502,{error:errors[upstream.status] || 'Dịch vụ AI tạm thời không khả dụng. Hãy thử lại sau.'});
   }

   const result=await upstream.json(), candidate=result.candidates?.[0];
   const reply=candidate?.content?.parts?.filter(p=>!p.thought && typeof p.text==='string').map(p=>p.text).join('');
   if(typeof reply!=='string'||!reply.trim()) return send(502,{error:'AI chưa trả về câu trả lời. Hãy thử lại.'});
   send(200,{reply});
  } catch {send(502,{error:'Không kết nối được dịch vụ AI. Hãy thử lại sau.'});} finally {active--;}
 });
}
if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href) createChatServer().listen(Number(process.env.PORT || process.env.CHAT_PORT || 8787),'0.0.0.0',()=>console.log('Chat server ready'));
