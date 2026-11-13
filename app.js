/* QR Review Platform — static prototype
   Customer page  : /r/<slug>   (reads settings from config.js)
   Owner dashboard: /           (reads feedback stored in THIS browser only) */
const $=(s,r=document)=>r.querySelector(s);
const KEY='qrReviewDemoV2';
const CFG=()=>window.QR_CONFIG.restaurants;
const esc=(s='')=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const stars=n=>'★'.repeat(n)+'☆'.repeat(5-n);
const validWA=n=>/^\d{8,15}$/.test(n||'');

function db(){try{const d=JSON.parse(localStorage.getItem(KEY));if(d&&Array.isArray(d.feedback)&&Array.isArray(d.events))return d}catch{}return{feedback:[],events:[]}}
function save(d){try{localStorage.setItem(KEY,JSON.stringify(d))}catch{}}
function track(type,rid){const d=db();d.events.push({type,restaurantId:rid,createdAt:new Date().toISOString()});save(d)}
function toast(t){const e=document.createElement('div');e.className='toast';e.textContent=t;document.body.appendChild(e);setTimeout(()=>e.remove(),1800)}
const logo=(cls,letter)=>`<img class="${cls}" src="/assets/brand-logo.png" alt="" onerror="this.outerHTML='<div class=&quot;logo-fallback&quot;>${letter}</div>'">`;

function route(){const p=location.pathname.split('/').filter(Boolean);if(p[0]==='r')customer(p[1]||CFG()[0].slug);else dashboard()}

/* ===================== DASHBOARD ===================== */
let view='overview',filter='all';
const dayKey=t=>{const d=new Date(t);return d.getFullYear()+'-'+d.getMonth()+'-'+d.getDate()};
function last7(){const o=[];for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);o.push({key:dayKey(d),label:d.toLocaleDateString(undefined,{weekday:'short'})})}return o}
const greet=()=>{const h=new Date().getHours();return h<12?'Good morning':h<17?'Good afternoon':'Good evening'};

function dashboard(){
  const d=db(),r=CFG()[0],low=d.feedback.filter(f=>f.rating<r.minRatingForPublic&&!f.resolved).length;
  $('#app').innerHTML=`<header class="topbar"><div class="brand">${logo('logo',esc(r.name[0]))}<div>${esc(r.name)}<small>Guest feedback</small></div></div>
  <nav class="tabs">${[['overview','Overview'],['feedback','Feedback'],['setup','QR & setup']].map(([k,l])=>`<button class="tab ${view===k?'on':''}" onclick="go('${k}')">${l}${k==='feedback'&&low?`<span class="badge">${low}</span>`:''}</button>`).join('')}</nav></header>
  <main class="wrap">${view==='overview'?overview(d,r,low):view==='feedback'?feedbackView(d,r):setupView(r)}</main>
  <div class="footer">Demo prototype · dashboard data is stored in this browser only</div>`;
  if(view==='setup')drawQR(r);
}
function go(v){view=v;dashboard();scrollTo(0,0)}
function setFilter(f){filter=f;dashboard()}

function overview(d,r,low){
  const scans=d.events.filter(e=>e.type==='scan').length,fb=d.feedback.length,
  avg=fb?(d.feedback.reduce((a,f)=>a+f.rating,0)/fb).toFixed(1):'–',
  toZ=d.events.filter(e=>e.type==='zomato').length,toW=d.events.filter(e=>e.type==='whatsapp').length,
  days=last7(),cnt=(arr,k)=>arr.filter(x=>dayKey(x.createdAt)===k).length,
  sc=days.map(x=>cnt(d.events.filter(e=>e.type==='scan'),x.key)),fc=days.map(x=>cnt(d.feedback,x.key)),
  max=Math.max(4,...sc,...fc),W=620,H=200,bw=20,gap=(W-40)/7;
  const bars=days.map((x,i)=>{const cx=30+i*gap,h1=sc[i]/max*130,h2=fc[i]/max*130;
    return `<rect x="${cx}" y="${150-h1}" width="${bw}" height="${h1}" rx="5" fill="#6db3e8"/><rect x="${cx+bw+4}" y="${150-h2}" width="${bw}" height="${h2}" rx="5" fill="#5fd0a3"/><text x="${cx+bw+2}" y="178" text-anchor="middle" fill="#8ea4a6" font-size="12">${x.label}</text>`}).join('');
  const dist=[5,4,3,2,1].map(n=>{const c=d.feedback.filter(f=>f.rating===n).length;return `<div class="rrow"><span>${n} ★</span><div class="bar"><span style="width:${fb?c/fb*100:0}%;background:${n>=r.minRatingForPublic?'var(--jade)':'var(--coral)'}"></span></div><b>${c}</b></div>`}).join('');
  const pct=(n,t)=>t?Math.round(n/t*100):0;
  const step=(l,n,t,c)=>`<div class="step"><span>${l}</span><b>${n}</b><div class="bar"><span style="width:${pct(n,t||1)}%;background:${c}"></span></div></div>`;
  return `<section class="hero"><div><div class="live"><i></i>Live on this device</div><h1>${greet()}.<br>Here’s how guests feel.</h1></div>
  <button class="btn sec" onclick="demoData()">Load sample data</button></section>
  ${low?`<div class="alert"><div><b>${low} unhappy guest${low>1?'s':''} waiting for a reply</b><p>Rated ${r.minRatingForPublic-1} stars or below and still unresolved.</p></div><button class="btn" onclick="filter='attention';go('feedback')">Review now</button></div>`:''}
  <div class="stats"><div class="stat"><div class="l">QR scans</div><div class="v">${scans}</div><div class="n">Page opened</div></div>
  <div class="stat"><div class="l">Reviews collected</div><div class="v">${fb}</div><div class="n">${scans?pct(fb,scans)+'% of scans':'No scans yet'}</div></div>
  <div class="stat star"><div class="l">Average rating</div><div class="v">${avg}${fb?' ★':''}</div><div class="n">Out of 5</div></div>
  <div class="stat"><div class="l">Sent to Zomato</div><div class="v">${toZ}</div><div class="n">${toW} sent to WhatsApp</div></div></div>
  <div class="grid2"><section class="panel"><div class="ph"><h2>Last 7 days</h2><div class="legend"><span><i style="background:#6db3e8"></i>Scans</span><span><i style="background:#5fd0a3"></i>Reviews</span></div></div>
  <svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Scans and reviews over the last 7 days"><line x1="20" x2="${W-10}" y1="150" y2="150" stroke="#26393f"/>${bars}</svg></section>
  <section class="panel"><div class="ph"><h2>Rating split</h2></div>${dist}<p class="small" style="margin:14px 0 0">Green goes to Zomato, red comes to you on WhatsApp.</p></section></div>
  <section class="panel"><div class="ph"><h2>Where guests end up</h2></div><div class="journey">${step('Scanned the QR',scans,scans,'var(--sky)')}${step('Left a rating',fb,scans,'var(--jade)')}${step('Redirected to Zomato',toZ,fb,'#ff8c96')}${step('Sent to your WhatsApp',toW,fb,'#4be082')}</div>
  <p class="small" style="margin:14px 0 0">A redirect is counted when the guest is sent on. It cannot confirm they finished posting the review.</p></section>`;
}

function feedbackView(d,r){
  const all=d.feedback.slice().reverse();
  const f=all.filter(x=>filter==='all'||(filter==='public'&&x.rating>=r.minRatingForPublic)||(filter==='attention'&&x.rating<r.minRatingForPublic&&!x.resolved));
  const chip=(k,l)=>`<button class="chip ${filter===k?'on':''}" onclick="setFilter('${k}')">${l}</button>`;
  return `<section class="hero"><div><h1>Feedback inbox</h1><p class="sub">${all.length} total · low ratings arrive on your WhatsApp too.</p></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn sec sm" onclick="exportCSV()">Export CSV</button><button class="btn danger sm" onclick="clearData()">Clear data</button></div></section>
  <section class="panel"><div class="chips">${chip('all','All')}${chip('attention','Needs reply')}${chip('public','Happy guests')}</div>
  ${f.length?f.map(x=>{const lo=x.rating<r.minRatingForPublic;return `<div class="fb"><div class="score ${lo?'lo':'hi'}">${x.rating}</div><div><span class="stars-s">${stars(x.rating)}</span>${lo?(x.resolved?'<span class="pill ok">Resolved</span>':'<span class="pill w">WhatsApp</span>'):'<span class="pill z">Zomato</span>'}<p>${esc(x.comment||'No comment left.')}</p><div class="small" style="margin-top:6px">${esc(x.name||'Anonymous')} · ${new Date(x.createdAt).toLocaleString()}</div></div>
  <div class="act">${lo&&!x.resolved?`<button class="btn sec sm" onclick="resolve('${x.id}')">Mark resolved</button>`:''}</div></div>`}).join(''):'<div class="empty">Nothing here yet. Open the customer page and submit a rating, or load sample data from Overview.</div>'}</section>`;
}

function setupView(r){
  const url=location.origin+'/r/'+r.slug,okW=validWA(r.whatsapp),okZ=/^https?:\/\//.test(r.reviewUrl||'');
  return `<section class="hero"><div><h1>QR code & setup</h1><p class="sub">Print this and put it on tables, bills or the counter.</p></div></section>
  <section class="panel"><div class="setup"><div><div class="qrbox" id="qr"></div><div style="display:flex;gap:8px;margin-top:12px"><button class="btn sm" style="flex:1" onclick="dlQR('${r.slug}')">Download PNG</button><button class="btn sec sm" style="flex:1" onclick="window.print()">Print</button></div></div>
  <div><h2 style="font-size:20px">How a scan works</h2><div class="rule"><div class="a"><b>${r.minRatingForPublic}–5 stars</b>Guest is sent to your Zomato reviews page. Their comment is copied so they can paste it.</div><div class="b"><b>1–${r.minRatingForPublic-1} stars</b>Guest’s feedback opens in WhatsApp, addressed to you, instead of going public.</div></div>
  <div style="margin-top:20px"><div class="check"><i class="${okZ?'ok':'bad'}">${okZ?'✓':'✕'}</i><div>Zomato link<br><code>${esc(r.reviewUrl||'missing')}</code></div></div>
  <div class="check"><i class="${okW?'ok':'bad'}">${okW?'✓':'✕'}</i><div>${okW?'Owner WhatsApp number is set':'Owner WhatsApp number is not set yet. Open <code>config.js</code> and replace <code>91XXXXXXXXXX</code> with your number (country code + digits).'}</div></div>
  <div class="check"><i class="ok">✓</i><div>Customer link<br><code>${esc(url)}</code></div></div></div>
  <div style="display:flex;gap:8px;margin-top:16px;flex-wrap:wrap"><a class="btn" href="/r/${r.slug}" target="_blank" rel="noopener">Test as a guest</a><button class="btn sec" onclick="navigator.clipboard.writeText('${url}').then(()=>toast('Link copied'))">Copy link</button></div></div></div></section>`;
}
function drawQR(r){const el=$('#qr');if(!el)return;el.innerHTML='';if(typeof QRCode==='undefined'){el.innerHTML='<p class="small" style="color:#333">QR library could not load. Check your connection.</p>';return}new QRCode(el,{text:location.origin+'/r/'+r.slug,width:280,height:280,correctLevel:QRCode.CorrectLevel.H})}
function dlQR(slug){const c=$('#qr canvas');if(!c)return;const a=document.createElement('a');a.href=c.toDataURL('image/png');a.download='qr-'+slug+'.png';a.click()}
function resolve(id){const d=db(),f=d.feedback.find(x=>x.id===id);if(f){f.resolved=true;save(d)}dashboard()}
function clearData(){if(confirm('Delete all feedback and stats stored in this browser?')){localStorage.removeItem(KEY);dashboard()}}
function exportCSV(){const d=db(),q=v=>'"'+String(v??'').replace(/"/g,'""')+'"';const rows=[['Date','Rating','Name','Comment','Sent to','Resolved'],...d.feedback.map(f=>[f.createdAt,f.rating,f.name||'',f.comment||'',f.route,f.resolved?'yes':'no'])];const b=new Blob([rows.map(r=>r.map(q).join(',')).join('\n')],{type:'text/csv'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='feedback.csv';a.click()}
function demoData(){const d=db(),r=CFG()[0],names=['Ramesh','Priya','Anil','Sneha','Farhan','Divya',''],good=['Loved the fish curry and the service.','Great ambience, will come again!','Food was hot and fresh.','Perfect for family dinners.'],bad=['Waited too long for the food.','Biryani was cold.','Staff was not attentive.'];
  for(let i=0;i<34;i++){const t=new Date(Date.now()-Math.random()*6.5*864e5).toISOString();d.events.push({type:'scan',restaurantId:r.id,createdAt:t});
    if(i<22){const rt=Math.random()<.78?3+Math.floor(Math.random()*3):1+Math.floor(Math.random()*2),hi=rt>=r.minRatingForPublic;
      d.feedback.push({id:'demo'+i+Date.now().toString(36),restaurantId:r.id,rating:rt,name:names[i%7],comment:(hi?good:bad)[i%(hi?4:3)],route:hi?'zomato':'whatsapp',resolved:false,createdAt:t});d.events.push({type:hi?'zomato':'whatsapp',restaurantId:r.id,createdAt:t})}}
  save(d);dashboard()}

/* ===================== CUSTOMER PAGE ===================== */
function customer(slug){
  const r=CFG().find(x=>x.slug===slug&&x.active!==false);
  if(!r){$('#app').innerHTML='<main class="customer"><div class="card"><h1>Page not found</h1><p class="sub">Please check the QR code or ask the staff.</p></div></main>';return}
  track('scan',r.id);let rating=0;const moods=['','Poor','Could be better','Good','Great','Excellent!'];
  $('#app').innerHTML=`<main class="customer"><div class="card" id="card">${logo('logo',esc(r.name[0]))}<h1>${esc(r.name)}</h1><p class="sub">${esc(r.area||'')}<br>How was your visit today?</p>
  <form id="f"><div class="stars" role="radiogroup" aria-label="Rating">${[1,2,3,4,5].map(n=>`<button type="button" class="star" data-s="${n}" role="radio" aria-checked="false" aria-label="${n} star${n>1?'s':''}">★</button>`).join('')}</div><div class="mood" id="mood" aria-live="polite"></div>
  <div class="field"><label for="comment">Tell us more (optional)</label><textarea id="comment" maxlength="1000" placeholder="What did you enjoy, or what should we fix?"></textarea></div>
  <div class="field"><label for="name">Your name (optional)</label><input id="name" maxlength="60" autocomplete="given-name"></div>
  <button class="btn" type="submit">Submit</button><div id="msg"></div></form></div></main>`;
  const set=n=>{rating=n;$('#mood').textContent=moods[n];document.querySelectorAll('.star').forEach(b=>{const on=+b.dataset.s<=n;b.classList.toggle('sel',on);b.setAttribute('aria-checked',+b.dataset.s===n)})};
  document.querySelectorAll('.star').forEach(b=>b.onclick=()=>set(+b.dataset.s));
  $('#f').onsubmit=e=>{e.preventDefault();
    if(!rating){$('#msg').innerHTML='<div class="notice">Please tap a star rating first.</div>';return}
    const comment=$('#comment').value.trim(),name=$('#name').value.trim(),hi=rating>=r.minRatingForPublic;
    const d=db();d.feedback.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),restaurantId:r.id,rating,comment,name,route:hi?'zomato':'whatsapp',resolved:false,createdAt:new Date().toISOString()});save(d);
    hi?goPublic(r,comment):goOwner(r,rating,comment,name)}
}
function goPublic(r,comment){
  if(comment&&navigator.clipboard)navigator.clipboard.writeText(comment).catch(()=>{});
  track('zomato',r.id);
  $('#card').innerHTML=`<div class="bigicon">🎉</div><h1>Thank you!</h1><p class="sub">So glad you enjoyed it. One last step: we’re taking you to Zomato so you can post your review.${comment?'<br><b>Your comment is copied, just paste it.</b>':''}</p><div class="spin"></div><a class="btn" href="${esc(r.reviewUrl)}">Open Zomato now</a>`;
  setTimeout(()=>{location.href=r.reviewUrl},2600)}
function goOwner(r,rating,comment,name){
  const msg=`Feedback for ${r.name}\nRating: ${rating}/5 ${stars(rating)}\n${name?'Name: '+name+'\n':''}Comment: ${comment||'(none)'}`;
  if(!validWA(r.whatsapp)){$('#card').innerHTML='<div class="bigicon">🙏</div><h1>Thank you</h1><p class="sub">We’re sorry your visit fell short. Your feedback has been noted.</p>';return}
  track('whatsapp',r.id);const url='https://wa.me/'+r.whatsapp+'?text='+encodeURIComponent(msg);
  $('#card').innerHTML=`<div class="bigicon">🙏</div><h1>We’re sorry</h1><p class="sub">We want to make this right. We’re opening WhatsApp with your feedback ready for the owner. Just tap <b>Send</b>.</p><div class="spin"></div><a class="btn wa" href="${url}">Open WhatsApp now</a>`;
  setTimeout(()=>{location.href=url},2200)}

route();
