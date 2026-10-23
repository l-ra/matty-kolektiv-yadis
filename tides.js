const TIDE_SOURCE='Midoun (Djerba)';
const tides=[
  ['2026-10-19','03:14','low',0.59],['2026-10-19','10:09','high',0.69],['2026-10-19','17:47','low',0.57],['2026-10-19','23:59','high',0.72],
  ['2026-10-20','06:27','low',0.53],['2026-10-20','12:34','high',0.77],['2026-10-20','18:53','low',0.48],
  ['2026-10-21','00:58','high',0.82],['2026-10-21','07:11','low',0.43],['2026-10-21','13:14','high',0.88],['2026-10-21','19:28','low',0.38],
  ['2026-10-22','01:30','high',0.92],['2026-10-22','07:42','low',0.34],['2026-10-22','13:44','high',0.97],['2026-10-22','19:57','low',0.30],
  ['2026-10-23','01:58','high',1.01],['2026-10-23','08:11','low',0.26],['2026-10-23','14:13','high',1.05],['2026-10-23','20:25','low',0.23],
  ['2026-10-24','02:26','high',1.09],['2026-10-24','08:40','low',0.18],['2026-10-24','14:42','high',1.11],['2026-10-24','20:52','low',0.17],
  ['2026-10-25','02:55','high',1.15],['2026-10-25','09:08','low',0.13],['2026-10-25','15:11','high',1.15],['2026-10-25','21:20','low',0.13],
  ['2026-10-26','03:25','high',1.19],['2026-10-26','09:38','low',0.11],['2026-10-26','15:41','high',1.16],['2026-10-26','21:49','low',0.12],
  ['2026-10-27','03:56','high',1.19],['2026-10-27','10:09','low',0.13],['2026-10-27','16:12','high',1.14],['2026-10-27','22:20','low',0.13],
  ['2026-10-28','04:30','high',1.16],['2026-10-28','10:41','low',0.17],['2026-10-28','16:45','high',1.10],['2026-10-28','22:53','low',0.18],
  ['2026-10-29','05:05','high',1.09],['2026-10-29','11:15','low',0.24],['2026-10-29','17:21','high',1.03],['2026-10-29','23:30','low',0.25],
  ['2026-10-30','05:45','high',1.00],['2026-10-30','11:53','low',0.33],['2026-10-30','18:02','high',0.94],
  ['2026-10-31','00:13','low',0.35],['2026-10-31','06:32','high',0.90],['2026-10-31','12:41','low',0.43],['2026-10-31','18:56','high',0.85],
  ['2026-11-01','01:17','low',0.46],['2026-11-01','07:41','high',0.80],['2026-11-01','14:05','low',0.52],['2026-11-01','20:31','high',0.78],
  ['2026-11-02','03:34','low',0.52],['2026-11-02','09:49','high',0.75],['2026-11-02','16:38','low',0.52],['2026-11-02','22:57','high',0.80]
].map(([date,time,type,height])=>({date,time,type,height,at:new Date(`${date}T${time}:00+01:00`)}));

function dayKey(date){
  return new Intl.DateTimeFormat('en-CA',{timeZone:TZ,year:'numeric',month:'2-digit',day:'2-digit'}).format(date);
}
function whenLabel(date){
  const now=new Date();
  const today=dayKey(now);
  const tomorrow=dayKey(new Date(now.getTime()+86400000));
  const key=dayKey(date);
  const time=new Intl.DateTimeFormat('cs-CZ',{timeZone:TZ,hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(date);
  if(key===today) return `dnes ${time}`;
  if(key===tomorrow) return `zítra ${time}`;
  const day=new Intl.DateTimeFormat('cs-CZ',{timeZone:TZ,weekday:'short',day:'numeric',month:'numeric'}).format(date);
  return `${day} ${time}`;
}
function tideEventHtml(e){
  const high=e.type==='high';
  const height=e.height.toLocaleString('cs-CZ',{minimumFractionDigits:2,maximumFractionDigits:2});
  return `<div class="service-row tide-event"><span class="status-dot ${high?'open':''}"></span><div class="service-main"><div class="service-name">${high?'🌊 Vrchol přílivu':'↘ Vrchol odlivu'}</div><div class="service-where">${TIDE_SOURCE} · výška ${height} m</div></div><span class="status">${whenLabel(e.at)}</span></div>`;
}
function serviceEventHtml(e){
  return `<div class="service-row"><span class="status-dot"></span><div class="service-main"><div class="service-name">${esc(e.s.name)}</div><div class="service-where">${esc(e.s.where)} · ${scheduleText(e.s)}</div></div><span class="status">${whenLabel(e.at)}</span></div>`;
}
function renderUpcomingEvents(){
  const target=document.getElementById('nextEvents');
  if(!target) return;
  const now=new Date();
  const p=tunisParts(now);
  const serviceEvents=services
    .map(s=>({s,st:statusFor(s,p.mins)}))
    .filter(x=>!x.st.open && Number.isFinite(x.st.delta))
    .map(x=>({...x,kind:'service',at:new Date(now.getTime()+x.st.delta*60000)}));
  const tideEvents=tides
    .filter(t=>t.at>now)
    .map(t=>({...t,kind:'tide'}));
  const events=[...serviceEvents,...tideEvents]
    .sort((a,b)=>a.at-b.at)
    .slice(0,8);
  target.innerHTML=events.map(e=>e.kind==='tide'?tideEventHtml(e):serviceEventHtml(e)).join('') || '<div class="card">Žádné další události.</div>';
}

renderUpcomingEvents();
setInterval(renderUpcomingEvents,30000);
