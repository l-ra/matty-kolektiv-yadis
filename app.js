
const TZ = 'Africa/Tunis';
const stay = { from:'2026-10-19', to:'2026-11-02', bus:'V3', adults:2 };

const services = [
  {name:'Recepce', where:'hotel', windows:[[0,1440]], group:'Hotel'},
  {name:'Směnárna', where:'recepce', windows:[[540,870],[900,1320]], group:'Hotel'},
  {name:'Bazén', where:'hotel', windows:[[480,1080]], group:'Hotel'},
  {name:'Snídaně', where:'Ulysse Restaurant', windows:[[420,600]], group:'Jídlo'},
  {name:'Pozdní snídaně', where:'Bar Central', windows:[[600,660]], group:'Jídlo'},
  {name:'Oběd', where:'Beach restaurant', windows:[[750,870]], group:'Jídlo'},
  {name:'Oběd', where:'Ulysse Restaurant', windows:[[750,870]], group:'Jídlo'},
  {name:'Večeře', where:'Ulysse Restaurant', windows:[[1110,1260]], group:'Jídlo'},
  {name:'Snack', where:'u bazénu', windows:[[960,1020]], group:'Jídlo'},
  {name:'Pizza corn', where:'Ulysse Restaurant', windows:[[0,120]], group:'Jídlo', note:'název převzatý z hotelového letáku'},
  {name:'Central Bar · All-inclusive', where:'Central Bar', windows:[[0,1440]], group:'Bary'},
  {name:'Pool Bar', where:'u bazénu', windows:[[540,1020]], group:'Bary'},
  {name:'Beach Bar', where:'pláž', windows:[[540,1020]], group:'Bary'},
  {name:'Café Maure', where:'Chicha extra', windows:[[960,1440]], group:'Bary'}
];

const contacts = [
  {name:'Ivana Opatová', role:'hlavní delegátka Blue Style', display:'+216 58 230 226', phone:'+21658230226', message:true},
  {name:'Dagmar Pecháčková', role:'delegátka Blue Style', display:'+216 29 657 590', phone:'+21629657590', message:true},
  {name:'Vendula Hofmanová', role:'delegátka Blue Style', display:'+216 53 664 155', phone:'+21653664155', message:true},
  {name:'Jitka Opletalová', role:'delegátka Blue Style', display:'+216 53 662 897', phone:'+21653662897', message:true},
  {name:'Tereza Seidlová', role:'delegátka Blue Style', display:'+216 58 230 481', phone:'+21658230481', message:true},
  {name:'ERGO Cestovní pojišťovna', role:'asistenční služba · česky mluvící operátoři', display:'+420 221 860 606', phone:'+420221860606', message:false},
  {name:'Tísňová linka', role:'nouzové volání dle materiálu CK', display:'112', phone:'112', message:false}
];

const info = [
  {title:'💧 Voda', html:`<p>Voda z vodovodu není kvůli vysokému obsahu minerálů a solí vhodná k pití. K pití používejte balenou vodu; tím lze předejít zažívacím potížím.</p><p>Pro omytí ovoce a zeleniny a pro čištění zubů lze podle materiálu CK vodu z vodovodu bez obav použít.</p>`},
  {title:'🩺 Lékařská péče', html:`<p>Při zdravotních problémech kontaktujte asistenční službu své pojišťovny. U pojištění sjednaného přes CK Blue Style je uvedena ERGO Cestovní pojišťovna: <b>+420 221 860 606</b>, s česky mluvícími operátory.</p><p>Pokud asistence zařídí ošetření na klinice, vezměte s sebou voucher s číslem pojistky a cestovní pas. Uschovejte účtenky za ošetření i léky.</p><p>Materiál CK upozorňuje, že v lékárnách se mohou prodávat i léky, které jsou v Evropě běžně na předpis. Tísňové volání: <b>112</b>.</p>`},
  {title:'🔐 Cenné věci', html:`<p>Doklady, karty, hotovost, šperky a další cennosti ukládejte do hotelového trezoru. Hotelový leták uvádí, že trezor je zdarma. CK doporučuje trezor na pokoji nebo na recepci; recepce je dostupná 24 hodin denně.</p><p>Chraňte věci zejména v autobusech/MHD, na plážích a v centrech měst. Nenechávejte cennosti v autě. Hotel ani CK podle materiálu neodpovídají za peníze a cennosti volně uložené na pokoji. Pas není nutné nosit na výlety ani do města.</p>`},
  {title:'🏨 Ubytování a pobytová taxa', html:`<p>Po příjezdu nechte zavazadla před recepcí, na recepci obdržíte ubytovací kartu a po vyplnění odevzdáte kartu s cestovním dokladem a ubytovacím voucherem. Poté dostanete klíč/kartu od pokoje. V některých hotelech se karta nevyplňuje a na recepci se jen skenuje pas.</p><p>V Tunisku se hradí povinná pobytová taxa na místě po příjezdu; její výše se liší podle kategorie ubytování. U pobytu do 10 nocí se účtuje skutečný počet nocí, u pobytu 10 nocí a více maximálně 10 nocí. Taxa se vztahuje na osoby od 12 let včetně. Aktuální částku zjistíte na recepci nebo u popisu hotelu na webu Blue Style.</p><p>Tento pobyt má 14 nocí, takže podle tohoto pravidla se taxa počítá nejvýše za 10 nocí.</p>`},
  {title:'💱 Měna', html:`<p>Měnou je tuniský dinár (TND), 1 TND = 1000 milimů. Bankovky jsou v hodnotách 5, 10, 20 a 50 TND.</p><p>Peníze lze měnit ve směnárnách, na hotelových recepcích a v bankách. V bance a směnárně je k výměně potřeba cestovní pas. Na platby kartou není vhodné příliš spoléhat; z bankomatu lze vybrat jen tuniské dináry. Českou korunu v Tunisku nelze směnit.</p><p>Vývoz a dovoz tuniské měny je přísně zakázán. Zbylé dináry směňte před odletem; pro zpětnou výměnu je potřeba doklad o předchozí výměně, proto si jej vždy vyžádejte a uschovejte. Zpětná výměna bývá nevýhodná.</p>`},
  {title:'🗝️ Praktické rady', html:`<ul><li>Klíč nebo magnetickou kartu – případně její plastový aktivátor – vložte do otvoru u dveří; jinak nemusí fungovat elektřina, klimatizace, světla a TV.</li><li>Do mešity se podle pokynů CK nemá vstupovat.</li><li>V Tunisku je zvykem dávat „bakšiš“, zejména v autobusech při transferech a výletech a za drobné služby; často jsou k dispozici tip boxy.</li><li>Je zakázáno fotografovat osoby v uniformě a budovy se státní vlajkou, například letiště a policejní stanice. Při fotografování tuniských žen a venkovanů si vyžádejte svolení.</li><li>Za fotografování památek a exponátů v muzeích se obvykle vedle vstupného platí 1–3 TND.</li></ul>`},
  {title:'✈️ Poslední den a odlet', html:`<p>Informace o odjezdu z hotelu a odletu z destinace jsou vyvěšeny den předem na informační tabuli; čas odletu se může změnit.</p><p>Ubytování a program All-inclusive končí v den odjezdu, obvykle mezi 10:00 a 12:00. Na recepci se zeptejte na sprchu a úschovu zavazadel do odjezdu na letiště.</p><p>CK doporučuje před odletem nepít alkohol v nepřiměřeném množství; viditelně opilého cestujícího může dopravce odmítnout přepravit.</p>`},
  {title:'📝 Překlad ubytovací karty', html:`<ul><li><b>Nom</b> – příjmení</li><li><b>Prénom</b> – jméno</li><li><b>Nom de jeune fille</b> – příjmení za svobodna</li><li><b>Date de naissance</b> – datum narození</li><li><b>Lieu de naissance</b> – místo narození</li><li><b>Nationalité</b> – národnost</li><li><b>Profession</b> – povolání</li><li><b>Domicile habituel</b> – trvalé bydliště</li><li><b>Venant de</b> – letiště, ze kterého jste přiletěli</li><li><b>Allant à</b> – letiště, na které jste přiletěli</li><li><b>Entrée le</b> – datum příletu</li><li><b>Date de départ</b> – datum odletu</li><li><b>Numéro de passport</b> – číslo pasu</li><li><b>Delivré le</b> – datum vydání pasu</li><li><b>Expiré le</b> – datum expirace</li><li><b>Signature</b> – podpis</li></ul>`},
  {title:'📶 Hotel: internet, telefon a trezor', html:`<p><b>Wi‑Fi:</b> zdarma v celém hotelu, bez hesla. <b>Telefon:</b> pro volání na jiný pokoj vytočte číslo pokoje; pro recepci vytočte 9. <b>Trezor:</b> zdarma; hotel neodpovídá za věci, které v trezoru nejsou.</p>`},
  {title:'🏖️ Bazén, lehátka a ručníky', html:`<p>Bazén je otevřen 08:00–18:00. Rezervace lehátek je zakázána. Ztráta nebo nevrácení ručníku je zpoplatněno 10 €. Koupelnové ručníky musí zůstat na pokoji.</p>`},
  {title:'📲 Blue Style: infokniha a Blue Assistant', html:`<p>V materiálech jsou QR odkazy na infoknihu destinace, informace o hotelu a aplikaci Blue Assistant. Delegáty lze podle letáku kontaktovat také přes mobilní aplikaci Blue Style.</p><p><a href="https://www.blue-style.cz/download/1/0/7/3/Infokniha-2025-Tunisko-Djerba.pdf" target="_blank" rel="noopener"><b>Otevřít Infoknihu Tunisko – Djerba</b></a> (online odkaz dekódovaný z QR kódu na předaném materiálu). Hotelové informace z druhého QR jsou již přepsané přímo v této PWA.</p>`},
  {title:'ℹ️ Zdroj materiálů', html:`<p>Leták s výlety uvádí: Cestovní kancelář Blue Style a.s., Jindřišská 873/27, 110 00 Praha 1, IČ 25609688, DIČ CZ25609688, zapsaná v OR vedeném Městským soudem v Praze pod sp. zn. B 26756.</p>`}
];

const trips = [
  {name:'Okruh ostrovem', tag:'půldenní', text:'Muzeum národních zvyků a tradic, keramika v Guellale, synagoga La Ghriba, výrobna olivového oleje a esenciálních olejů. Možnost nákupu v Houmt Souku a vyhlídka u španělské pevnosti.'},
  {name:'Matmata – Ksar Ghilane', tag:'celodenní', text:'Přes římskou cestu a Medenine do oázy Ksar Ghilane, prohlídka oázy a možnost koupání v termálním jezírku. Za příplatek velbloudi nebo čtyřkolky. Oběd bez nápojů. Poté pohoří Dahar, Matmata s podzemními berberskými obydlími a místo natáčení Hvězdných válek, cesta přes malé vesnice a návrat na ostrov.'},
  {name:'Djerba Explore – plazi', tag:'areál', text:'Více než 600 krokodýlů různých velikostí, představení a ukázky dalších druhů plazů, možnost focení s malým krokodýlem. Součástí je typický djerbský statek s místními řemesly a pro zájemce muzeum islámského umění.'},
  {name:'Výlet lodí', tag:'Houmt Souk → Ostrov plameňáků', text:'Plavba z přístavu v Houmt Souku na Ostrov plameňáků, asi 50 minut. Na ostrově volno ke koupání, oběd (jídlo a voda během oběda v ceně), krátký zábavný program a plavba zpět. Plameňáci se podle letáku vyskytují jen v zimních měsících. Lehátka, slunečníky a aktivity na ostrově jsou za poplatek.'},
  {name:'Katamarán', tag:'3 hodiny', text:'Pohodová plavba: přibližně 2 hodiny plavby a 1 hodina zastávka na koupání na širém moři v hloubce 3–4 m. Varianta odpoledne nebo při západu slunce. V ceně voda, nealkoholické nápoje a sezónní ovoce.'},
  {name:'Čtyřkolky Ajim', tag:'24 km', text:'Trasa z hotelové zóny vnitrozemím a částečně po pláži, jedna z delších tras na Djerbě. Zastávka u podzemní mešity Bardoui s možností návštěvy, na konci drobné občerstvení. Od 16 let lze řídit samostatně; nevhodné pro děti do 6 let.'}
];

function tunisParts(date=new Date()){
  const fmt = new Intl.DateTimeFormat('en-GB',{timeZone:TZ,year:'numeric',month:'2-digit',day:'2-digit',weekday:'short',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
  const p={}; fmt.formatToParts(date).forEach(x=>{if(x.type!=='literal')p[x.type]=x.value});
  return {...p, mins:Number(p.hour)*60+Number(p.minute)};
}
function hm(mins){ if(mins===1440)return '24:00'; return String(Math.floor(mins/60)).padStart(2,'0')+':'+String(mins%60).padStart(2,'0'); }
function scheduleText(s){ return s.windows.map(([a,b])=>`${hm(a)}–${hm(b)}`).join(' / '); }
function statusFor(s, nowMin){
  const current=s.windows.find(([a,b])=>nowMin>=a && nowMin<b);
  if(current) return {open:true,label:current[1]===1440?'otevřeno':'do '+hm(current[1])};
  let delta=Infinity, next=null;
  for(const [a] of s.windows){ const d=a>nowMin?a-nowMin:a+1440-nowMin; if(d<delta){delta=d;next=a;} }
  return {open:false,label:'od '+hm(next),delta,next};
}
function esc(s=''){return s.replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function serviceHtml(s,nowMin){ const st=statusFor(s,nowMin); return `<div class="service-row"><span class="status-dot ${st.open?'open':''}"></span><div class="service-main"><div class="service-name">${esc(s.name)}</div><div class="service-where">${esc(s.where)} · ${scheduleText(s)}</div></div><span class="status ${st.open?'open':''}">${st.open?'OTEVŘENO · ':''}${st.label}</span></div>`; }

function renderStatus(){
  const p=tunisParts();
  const open=services.filter(s=>statusFor(s,p.mins).open);
  document.getElementById('nowServices').innerHTML=open.map(s=>serviceHtml(s,p.mins)).join('') || '<div class="card">Momentálně není otevřená žádná časově omezená služba.</div>';
  const next=services.filter(s=>!statusFor(s,p.mins).open).map(s=>({s,st:statusFor(s,p.mins)})).sort((a,b)=>a.st.delta-b.st.delta).slice(0,4);
  document.getElementById('nextServices').innerHTML=next.map(x=>serviceHtml(x.s,p.mins)).join('');
  document.getElementById('serviceList').innerHTML=['Jídlo','Bary','Hotel'].map(g=>`<h2>${g}</h2>${services.filter(s=>s.group===g).map(s=>serviceHtml(s,p.mins)).join('')}`).join('');
  renderStayProgress();
}
function renderStayProgress(){
  const start=new Date('2026-10-19T00:00:00+01:00');
  const end=new Date('2026-11-02T00:00:00+01:00');
  const now=new Date();
  const total=end-start;
  const raw=(now-start)/total;
  const progress=Math.max(0,Math.min(1,raw));
  const pct=(progress*100).toFixed(1)+'%';
  document.getElementById('stayFill').style.width=pct;
  document.getElementById('stayMarker').style.left=pct;

  const status=document.getElementById('stayStatus');
  const detail=document.getElementById('stayDetail');
  if(now<start){
    const days=Math.max(1,Math.ceil((start-now)/86400000));
    status.textContent=`Za ${days} ${days===1?'den':'dní'}`;
    detail.textContent='2 dospělí · Standard room · V3';
    return;
  }
  if(now>=end){
    status.textContent='Pobyt ukončen';
    detail.textContent='19. 10. – 2. 11. 2026 · 14 nocí';
    return;
  }
  const day=Math.min(14,Math.floor((now-start)/86400000)+1);
  const nightsLeft=Math.max(0,Math.ceil((end-now)/86400000));
  status.textContent=`${day}. den pobytu`;
  detail.textContent=nightsLeft===1?'zbývá 1 noc':`zbývá ${nightsLeft} nocí`;
}
function messageText(){
  const room=localStorage.getItem('yadis.room');
  return `Dobrý den, jsme klienti Blue Style v hotelu Yadis Djerba Golf Thalasso Spa${room?`, pokoj ${room}`:''}.`;
}
function contactCardHtml(c){
  const num=c.phone.replace('+','');
  const msg=encodeURIComponent(messageText());
  return `<div class="contact-card"><div class="contact-head"><div><div class="contact-name">${esc(c.name)}</div><div class="muted">${esc(c.role)}</div></div><div class="contact-number">${esc(c.display)}</div></div><div class="actions"><a class="primary-action" href="tel:${c.phone}">Volat</a>${c.message?`<a href="sms:${c.phone}?body=${msg}">SMS</a><a target="_blank" rel="noopener" href="https://wa.me/${num}?text=${msg}">WhatsApp</a>`:''}</div></div>`;
}
function renderContacts(){
  const primary=contacts[0];
  document.getElementById('primaryContact').innerHTML=contactCardHtml(primary);
  document.getElementById('contactList').innerHTML=contacts.map(contactCardHtml).join('') + `<div class="contact-card"><div class="contact-name">Hotelová recepce</div><div class="muted">z telefonu na pokoji vytočte interní volbu <b>9</b></div></div>`;
}
function renderInfo(){ document.getElementById('infoList').innerHTML=info.map((x,i)=>`<details class="accordion" ${i<2?'open':''}><summary>${x.title}</summary><div class="body">${x.html}</div></details>`).join(''); }
function renderTrips(){ document.getElementById('tripList').innerHTML=trips.map(t=>`<div class="trip-card"><h3>${esc(t.name)}</h3><span class="tag">${esc(t.tag)}</span><p>${esc(t.text)}</p></div>`).join(''); }
function loadPrivate(){
  const ids=[['roomInput','room'],['noteInput','note'],['voucherInput','voucher'],['travelerInput','traveler']];
  ids.forEach(([id,key])=>document.getElementById(id).value=localStorage.getItem('yadis.'+key)||'');
  updateRoomSummary();
}
function updateRoomSummary(){ const r=localStorage.getItem('yadis.room'); document.getElementById('roomSummary').textContent=r?`Pokoj ${r}`:'Nastavit číslo pokoje'; }
function savePrivate(){
  [['roomInput','room'],['noteInput','note'],['voucherInput','voucher'],['travelerInput','traveler']].forEach(([id,key])=>{const v=document.getElementById(id).value.trim(); if(v)localStorage.setItem('yadis.'+key,v); else localStorage.removeItem('yadis.'+key)});
  updateRoomSummary(); renderContacts();
  const b=document.getElementById('savePrivate'); const old=b.textContent; b.textContent='Uloženo ✓'; setTimeout(()=>b.textContent=old,1300);
}
function clearPrivate(){ if(confirm('Smazat číslo pokoje a všechny lokální poznámky z tohoto zařízení?')){ ['room','note','voucher','traveler'].forEach(k=>localStorage.removeItem('yadis.'+k)); loadPrivate(); renderContacts(); } }
function goto(page){
  document.querySelectorAll('.page').forEach(x=>x.classList.toggle('active',x.dataset.page===page));
  document.querySelectorAll('.nav-btn').forEach(x=>x.classList.toggle('active',x.dataset.target===page));
  window.scrollTo({top:0,behavior:'smooth'});
}
function renderOnline(){const el=document.getElementById('onlineBadge'); const on=navigator.onLine; el.textContent=on?'ONLINE':'OFFLINE'; el.className='pill hero-online '+(on?'ok':'off');}

let deferredPrompt;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;document.getElementById('installBtn').hidden=false});
document.getElementById('installBtn').addEventListener('click',async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;document.getElementById('installBtn').hidden=true});
document.getElementById('shareBtn').addEventListener('click',async()=>{ if(navigator.share){try{await navigator.share({title:'Matty kolektiv · Yadis Djerba',url:location.href})}catch{}} else {await navigator.clipboard.writeText(location.href); alert('Odkaz zkopírován.');} });
document.getElementById('savePrivate').addEventListener('click',savePrivate);
document.getElementById('clearPrivate').addEventListener('click',clearPrivate);
document.querySelectorAll('.nav-btn').forEach(b=>b.addEventListener('click',()=>goto(b.dataset.target)));
document.querySelectorAll('[data-goto]').forEach(b=>b.addEventListener('click',()=>goto(b.dataset.goto)));
window.addEventListener('online',renderOnline); window.addEventListener('offline',renderOnline);

renderStatus(); renderContacts(); renderInfo(); renderTrips(); loadPrivate(); renderOnline(); setInterval(renderStatus,30000);
if('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js'));
