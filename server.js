const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 8787;
const PASSWORD = process.env.DASHBOARD_PASSWORD || '';
const ROOT = path.join(__dirname, 'public');

function send(res, status, body, type='text/plain') {
  res.writeHead(status, {'Content-Type': type, 'Cache-Control': 'no-store'});
  res.end(body);
}
function timingSafeEqual(a,b){
  const A=Buffer.from(a||''); const B=Buffer.from(b||'');
  if(A.length!==B.length) return false;
  return crypto.timingSafeEqual(A,B);
}
function authorized(req){
  if(!PASSWORD) return true;
  const cookie=req.headers.cookie||'';
  return cookie.split(';').some(x=>x.trim().startsWith('dash_auth=') && timingSafeEqual(decodeURIComponent(x.trim().slice(10)), PASSWORD));
}
const server = http.createServer((req,res)=>{
  const url = new URL(req.url, `http://${req.headers.host}`);
  if(url.pathname==='/login' && req.method==='POST'){
    let body=''; req.on('data',c=>body+=c); req.on('end',()=>{
      const pass=new URLSearchParams(body).get('password')||'';
      if(timingSafeEqual(pass,PASSWORD)) {res.writeHead(302, {'Set-Cookie': `dash_auth=${encodeURIComponent(pass)}; HttpOnly; SameSite=Lax; Path=/`, 'Location':'/'}); res.end();}
      else send(res,401,loginPage('Wrong password'),'text/html');
    }); return;
  }
  if(PASSWORD && !authorized(req)) return send(res,200,loginPage(''),'text/html');
  if(url.pathname==='/api/data') {
    return fs.readFile(path.join(ROOT,'data','dashboard-data.json'),'utf8',(e,d)=> e ? send(res,500,JSON.stringify({error:e.message}),'application/json') : send(res,200,d,'application/json'));
  }
  let file = url.pathname==='/' ? '/index.html' : url.pathname;
  file = path.normalize(file).replace(/^([.][.][/\\])+/, '');
  const full = path.join(ROOT,file);
  if(!full.startsWith(ROOT)) return send(res,403,'Forbidden');
  fs.readFile(full,(e,d)=>{
    if(e) return send(res,404,'Not found');
    const ext=path.extname(full).toLowerCase();
    const type={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png'}[ext]||'application/octet-stream';
    send(res,200,d,type);
  });
});
function loginPage(msg){return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Dashboard Login</title><style>body{margin:0;background:#07111f;color:#eaf2ff;font-family:Arial;display:grid;place-items:center;min-height:100vh}.box{background:#0f1c2e;border:1px solid #24364f;padding:28px;border-radius:18px;width:min(420px,92vw)}input,button{width:100%;padding:12px;margin-top:12px;border-radius:10px;border:1px solid #28415f;background:#081423;color:#fff}button{background:#1d6bff;font-weight:bold}</style></head><body><form class="box" method="post" action="/login"><h2>Moniepoint Dashboard</h2><p>Enter dashboard password.</p>${msg?`<p style="color:#ff5d5d">${msg}</p>`:''}<input type="password" name="password" autofocus><button>Open dashboard</button></form></body></html>`}
server.listen(PORT,()=>console.log(`Moniepoint dashboard running on http://localhost:${PORT}`));
