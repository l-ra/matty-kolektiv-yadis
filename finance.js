(()=>{
'use strict';

const KEY='yadis.finance.v1';
const SCHEMA='yadis-finance';
const VERSION=1;
let data=loadData();

const $=id=>document.getElementById(id);
const uid=prefix=>`${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
const fEsc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const round=n=>Math.round((Number(n)||0)*100)/100;
const money=(n,c)=>`${new Intl.NumberFormat('cs-CZ',{minimumFractionDigits:0,maximumFractionDigits:2}).format(round(n))} ${c}`;

function emptyData(){
  return {schema:SCHEMA,version:VERSION,participants:[],transactions:[],plans:[],meta:{createdAt:new Date().toISOString()}};
}
function loadData(){
  try{
    const raw=localStorage.getItem(KEY);
    if(!raw) return emptyData();
    return normalize(JSON.parse(raw));
  }catch(e){ console.warn('Finance data load failed',e); return emptyData(); }
}
function normalize(x){
  if(!x||typeof x!=='object') throw new Error('Neplatný formát dat.');
  return {
    schema:x.schema||SCHEMA,
    version:Number(x.version)||VERSION,
    participants:Array.isArray(x.participants)?x.participants:[],
    transactions:Array.isArray(x.transactions)?x.transactions:[],
    plans:Array.isArray(x.plans)?x.plans:[],
    meta:x.meta&&typeof x.meta==='object'?x.meta:{}
  };
}
function save(){
  data.meta.updatedAt=new Date().toISOString();
  localStorage.setItem(KEY,JSON.stringify(data));
  renderAll();
}
function participantName(id){ return data.participants.find(p=>p.id===id)?.name || id || 'neuvedeno'; }
function currentDate(){
  try{return new Intl.DateTimeFormat('en-CA',{timeZone:'Africa/Tunis',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}
  catch{return new Date().toISOString().slice(0,10);}
}

function transactionCashEffects(t){
  const out=[];
  const account=t.account||'other';
  if(account!=='shared_cash') return out;
  const cur=t.currency||'TND';
  const amount=Number(t.amount)||0;
  if(['opening','income','withdrawal'].includes(t.type)) out.push([cur,amount]);
  if(t.type==='expense') out.push([cur,-amount]);
  if(t.type==='adjustment') out.push([cur,amount]);
  if(t.type==='exchange'){
    out.push([cur,-amount]);
    out.push([t.toCurrency||'TND',Number(t.toAmount)||0]);
  }
  return out;
}
function cashBalances(){
  const b={};
  data.transactions.forEach(t=>transactionCashEffects(t).forEach(([c,a])=>b[c]=round((b[c]||0)+a)));
  return b;
}
function snapshotBalances(){
  const map={};
  data.transactions.filter(t=>t.type==='snapshot').forEach((t,i)=>{
    const key=t.currency||'TND';
    const stamp=`${t.date||'0000-00-00'}-${String(i).padStart(6,'0')}`;
    if(!map[key]||stamp>map[key].stamp) map[key]={amount:Number(t.amount)||0,stamp,date:t.date||null,note:t.note||''};
  });
  return map;
}
function planTotals(){
  const totals={};
  data.plans.forEach(p=>{
    const total=(Number(p.quantity)||1)*(Number(p.unitAmount)||0);
    const c=p.currency||'TND'; totals[c]=round((totals[c]||0)+total);
  });
  return totals;
}
function knownCurrencies(){
  const s=new Set(['EUR','TND']);
  data.transactions.forEach(t=>{if(t.currency)s.add(t.currency);if(t.toCurrency)s.add(t.toCurrency)});
  data.plans.forEach(p=>p.currency&&s.add(p.currency));
  return [...s];
}

function splitFor(t){
  const ids=t.split?.participants||[];
  if(!ids.length) return [];
  if(t.split.mode==='custom') return ids.map(id=>[id,Number(t.split.shares?.[id])||0]);
  const each=(Number(t.amount)||0)/ids.length;
  return ids.map(id=>[id,each]);
}
function settlementData(){
  const net={}; let pending=0;
  data.participants.forEach(p=>net[p.id]={});
  for(const t of data.transactions){
    if(t.type!=='expense') continue;
    const shares=splitFor(t);
    if(!shares.length) continue;
    if(!t.payer || !data.participants.some(p=>p.id===t.payer)){ pending++; continue; }
    const c=t.currency||'TND';
    const add=(id,val)=>{net[id]??={};net[id][c]=round((net[id][c]||0)+val)};
    add(t.payer,Number(t.amount)||0);
    shares.forEach(([id,val])=>add(id,-val));
  }
  return {net,pending};
}

function renderSummary(){
  const cash=cashBalances(), snapshots=snapshotBalances(), plans=planTotals();
  const html=knownCurrencies().map(c=>{
    const hasCash=Object.prototype.hasOwnProperty.call(cash,c);
    const snap=snapshots[c];
    return `<div class="finance-stat card"><span class="label">${fEsc(c)}</span><strong>${hasCash?money(cash[c],c):'—'}</strong><span class="muted">spočtená společná hotovost</span>${snap?`<span class="finance-check ${Math.abs((snap.amount||0)-(cash[c]||0))>.009?'bad':'ok'}">kontrola ${money(snap.amount,c)}</span>`:''}${plans[c]?`<span class="finance-plan-total">plán ${money(plans[c],c)}</span>`:''}</div>`;
  }).join('');
  $('financeSummary').innerHTML=html||'<div class="card">Zatím nejsou žádná finanční data.</div>';

  const warnings=[];
  for(const [c,s] of Object.entries(snapshots)){
    const diff=round(s.amount-(cash[c]||0));
    if(Math.abs(diff)>.009) warnings.push(`Kontrolní hotovost ${money(s.amount,c)} se liší od evidence ${money(cash[c]||0,c)} o <b>${diff>0?'+':''}${money(diff,c)}</b>. Chybí transakce nebo je některá položka zadaná jinak.`);
  }
  const needs=data.transactions.filter(t=>t.needsReview);
  if(needs.length) warnings.push(`${needs.length} ${needs.length===1?'položka je':'položky jsou'} označena k doplnění.`);
  $('financeWarnings').innerHTML=warnings.map(w=>`<div class="alert warn">${w}</div>`).join('');
}

function renderSettlements(){
  const {net,pending}=settlementData();
  if(!data.participants.length){$('financeSettlements').innerHTML='<div class="card">Nejdřív přidejte nebo importujte účastníky.</div>';return;}
  $('financeSettlements').innerHTML=data.participants.map(p=>{
    const entries=Object.entries(net[p.id]||{}).filter(([,v])=>Math.abs(v)>.009);
    const lines=entries.length?entries.map(([c,v])=>`<span class="settlement ${v>=0?'positive':'negative'}">${v>=0?'má dostat':'má zaplatit'} ${money(Math.abs(v),c)}</span>`).join(''):'<span class="muted">bez vypočteného salda</span>';
    return `<div class="finance-person card"><strong>${fEsc(p.name)}</strong><div>${lines}</div></div>`;
  }).join('')+(pending?`<div class="alert warn"><b>${pending} rozpočítaných výdajů</b> nemá uvedeného plátce, proto zatím nevstupuje do salda.</div>`:'');
}

function txTitle(t){
  if(t.type==='exchange') return `${money(t.amount,t.currency)} → ${money(t.toAmount,t.toCurrency)}`;
  const sign=['opening','income','withdrawal'].includes(t.type)?'+':t.type==='expense'?'-':'';
  if(t.type==='snapshot') return `kontrola ${money(t.amount,t.currency)}`;
  return `${sign}${money(t.amount,t.currency)}`;
}
function txKind(t){return ({opening:'počáteční stav',income:'příjem',withdrawal:'ATM',exchange:'směna',expense:'výdaj',snapshot:'kontrolní stav',adjustment:'korekce'})[t.type]||t.type;}
function renderTransactions(){
  const arr=data.transactions.map((t,i)=>({...t,_i:i})).sort((a,b)=>(b.date||'').localeCompare(a.date||'')||b._i-a._i);
  $('financeTransactions').innerHTML=arr.length?arr.map(t=>{
    const splits=splitFor(t);
    const splitText=splits.length?`Rozdělení: ${splits.map(([id,v])=>`${fEsc(participantName(id))} ${money(v,t.currency)}`).join(' · ')}`:'';
    const payer=t.payer?`Plátce: ${fEsc(participantName(t.payer))}`:'';
    const fee=t.fee?`Poplatek: ${money(t.fee,t.feeCurrency||t.currency)}`:'';
    return `<div class="finance-tx card ${t.needsReview?'needs-review':''}"><div class="finance-tx-head"><div><strong>${fEsc(t.description||txKind(t))}</strong><span class="muted">${fEsc(t.date||'bez data')} · ${fEsc(txKind(t))} · ${fEsc(accountLabel(t.account))}</span></div><b>${txTitle(t)}</b></div>${t.needsReview?'<span class="review-badge">k doplnění</span>':''}<div class="finance-tx-meta">${[payer,fee,splitText,t.note?fEsc(t.note):''].filter(Boolean).join('<br>')}</div><div class="row-actions"><button data-edit-tx="${fEsc(t.id)}" class="mini-button">Upravit</button><button data-delete-tx="${fEsc(t.id)}" class="mini-button danger">Smazat</button></div></div>`;
  }).join(''):'<div class="card">Zatím nejsou žádné pohyby.</div>';
}
function accountLabel(a){return ({shared_cash:'společná hotovost',card:'karta',personal:'osobní peníze',other:'jiné'})[a]||a||'jiné';}
function renderPlans(){
  const totals=planTotals();
  const cards=data.plans.map(p=>`<div class="finance-plan card"><div><strong>${fEsc(p.description)}</strong><span class="muted">${Number(p.quantity)||1} × ${money(p.unitAmount,p.currency)}${p.note?` · ${fEsc(p.note)}`:''}</span></div><b>${money((Number(p.quantity)||1)*(Number(p.unitAmount)||0),p.currency)}</b><button data-delete-plan="${fEsc(p.id)}" class="mini-button danger">Smazat</button></div>`).join('');
  const totalLine=Object.entries(totals).map(([c,v])=>money(v,c)).join(' + ');
  $('financePlans').innerHTML=(totalLine?`<div class="finance-plan-total-card card"><span>Celkem plán</span><strong>${totalLine}</strong></div>`:'')+(cards||'<div class="card">Žádné plánované výdaje.</div>');
}

function renderParticipants(){
  const payer=$('financePayer'); const selected=payer.value;
  payer.innerHTML='<option value="">neuvedeno</option>'+data.participants.map(p=>`<option value="${fEsc(p.id)}">${fEsc(p.name)}</option>`).join('');
  if(data.participants.some(p=>p.id===selected)) payer.value=selected;
  $('financeParticipants').innerHTML=data.participants.map(p=>`<label class="participant-check"><input type="checkbox" value="${fEsc(p.id)}"> <span>${fEsc(p.name)}</span></label>`).join('')||'<span class="muted">Žádní účastníci.</span>';
  $('financeParticipantList').innerHTML=data.participants.map(p=>`<span class="participant-chip">${fEsc(p.name)} <button type="button" data-delete-participant="${fEsc(p.id)}" aria-label="Smazat ${fEsc(p.name)}">×</button></span>`).join('');
  updateCustomShares();
}
function selectedParticipantIds(){return [...$('financeParticipants').querySelectorAll('input:checked')].map(x=>x.value);}
function updateCustomShares(existing={}){
  if(!$('financeCustomShares')) return;
  const custom=$('financeSplitMode').value==='custom';
  $('financeCustomShares').hidden=!custom;
  if(!custom){updateSplitCheck();return;}
  const ids=selectedParticipantIds();
  $('financeCustomShares').innerHTML=ids.map(id=>`<label>${fEsc(participantName(id))}<input type="number" step="0.01" min="0" inputmode="decimal" data-share-id="${fEsc(id)}" value="${existing[id]??''}"></label>`).join('');
  $('financeCustomShares').querySelectorAll('input').forEach(i=>i.addEventListener('input',updateSplitCheck));
  updateSplitCheck();
}
function updateSplitCheck(){
  const amount=Number($('financeAmount').value)||0;
  const ids=selectedParticipantIds();
  if(!ids.length){$('financeSplitCheck').textContent='Bez rozpočítání.';return;}
  if($('financeSplitMode').value==='equal'){$('financeSplitCheck').textContent=`${ids.length} osob · ${money(amount/ids.length,$('financeCurrency').value)} na osobu`;return;}
  const sum=[...$('financeCustomShares').querySelectorAll('input')].reduce((s,x)=>s+(Number(x.value)||0),0);
  const diff=round(amount-sum);
  $('financeSplitCheck').textContent=Math.abs(diff)<.009?'Součet vlastních částek odpovídá výdaji.':`Rozdíl proti výdaji: ${money(diff,$('financeCurrency').value)}`;
}

function renderAll(){renderSummary();renderSettlements();renderTransactions();renderPlans();renderParticipants();}

function typeChanged(){
  const type=$('financeType').value;
  $('financeExchangeTarget').hidden=type!=='exchange';
  $('financeFeeRow').hidden=type!=='withdrawal';
  $('financeSplitBlock').hidden=type!=='expense';
  $('financeMainAmount').querySelector('label:first-child').childNodes[0].nodeValue=type==='exchange'?'Vydaná částka':type==='snapshot'?'Zjištěná hotovost':'Částka';
}
function resetTxForm(){
  $('financeTxForm').reset(); $('financeEditId').value=''; $('financeDate').value=currentDate(); $('financeCurrency').value='TND'; $('financeToCurrency').value='TND'; $('financeFeeCurrency').value='TND'; $('financeAccount').value='shared_cash'; $('financeSplitMode').value='equal'; $('financeCancelEdit').hidden=true; typeChanged(); renderParticipants(); updateSplitCheck();
}
function formTransaction(){
  const type=$('financeType').value;
  const amount=Number($('financeAmount').value);
  if(!Number.isFinite(amount)||amount<0) throw new Error('Zadejte platnou částku.');
  const t={
    id:$('financeEditId').value||uid('tx'),type,date:$('financeDate').value||null,description:$('financeDescription').value.trim(),
    amount:round(amount),currency:$('financeCurrency').value,account:$('financeAccount').value,payer:$('financePayer').value||null,
    note:$('financeNote').value.trim(),needsReview:false
  };
  if(type==='exchange'){
    const to=Number($('financeToAmount').value); if(!Number.isFinite(to)||to<0) throw new Error('Zadejte získanou částku směny.');
    t.toAmount=round(to);t.toCurrency=$('financeToCurrency').value;
  }
  if(type==='withdrawal'){t.fee=round(Number($('financeFee').value)||0);t.feeCurrency=$('financeFeeCurrency').value;}
  if(type==='expense'){
    const ids=selectedParticipantIds();
    t.split={mode:$('financeSplitMode').value,participants:ids};
    if(t.split.mode==='custom'){
      t.split.shares={}; [...$('financeCustomShares').querySelectorAll('input')].forEach(x=>t.split.shares[x.dataset.shareId]=round(Number(x.value)||0));
      const sum=Object.values(t.split.shares).reduce((a,b)=>a+b,0); if(ids.length&&Math.abs(sum-t.amount)>.009) throw new Error('Součet vlastních částek musí odpovídat výdaji.');
    }
  }
  return t;
}
function editTransaction(id){
  const t=data.transactions.find(x=>x.id===id); if(!t)return;
  $('financeEditId').value=t.id;$('financeType').value=t.type;$('financeDate').value=t.date||'';$('financeDescription').value=t.description||'';$('financeAmount').value=t.amount??'';$('financeCurrency').value=t.currency||'TND';$('financeAccount').value=t.account||'other';$('financePayer').value=t.payer||'';$('financeNote').value=t.note||'';
  $('financeToAmount').value=t.toAmount??'';$('financeToCurrency').value=t.toCurrency||'TND';$('financeFee').value=t.fee??0;$('financeFeeCurrency').value=t.feeCurrency||t.currency||'TND';$('financeSplitMode').value=t.split?.mode||'equal';
  typeChanged();
  [...$('financeParticipants').querySelectorAll('input')].forEach(x=>x.checked=(t.split?.participants||[]).includes(x.value));
  updateCustomShares(t.split?.shares||{}); $('financeCancelEdit').hidden=false;
  $('financeTxForm').scrollIntoView({behavior:'smooth',block:'start'});
}

function exportJson(){
  const payload={...data,meta:{...data.meta,exportedAt:new Date().toISOString()}};
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`yadis-finance-${currentDate()}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
async function importJson(file){
  const text=await file.text(); const parsed=normalize(JSON.parse(text));
  if(parsed.schema!==SCHEMA && !confirm('Soubor nemá označení Yadis finance. Přesto pokračovat?')) return;
  if(!confirm(`Import nahradí současná finanční data. Importovat ${parsed.transactions.length} pohybů, ${parsed.plans.length} plánů a ${parsed.participants.length} účastníků?`)) return;
  data=parsed; save(); resetTxForm();
}

function bind(){
  if(!$('financeTxForm')) return;
  $('financeDate').value=currentDate();
  $('financeType').addEventListener('change',typeChanged);
  $('financeAmount').addEventListener('input',updateSplitCheck);$('financeCurrency').addEventListener('change',updateSplitCheck);$('financeSplitMode').addEventListener('change',()=>updateCustomShares());
  $('financeParticipants').addEventListener('change',()=>updateCustomShares());
  $('financeSelectAll').addEventListener('click',()=>{[...$('financeParticipants').querySelectorAll('input')].forEach(x=>x.checked=true);updateCustomShares()});
  $('financeSelectNone').addEventListener('click',()=>{[...$('financeParticipants').querySelectorAll('input')].forEach(x=>x.checked=false);updateCustomShares()});
  $('financeTxForm').addEventListener('submit',e=>{e.preventDefault();try{const t=formTransaction();const i=data.transactions.findIndex(x=>x.id===t.id);if(i>=0)data.transactions[i]=t;else data.transactions.push(t);save();resetTxForm()}catch(err){alert(err.message)}});
  $('financeCancelEdit').addEventListener('click',resetTxForm);
  $('financePlanForm').addEventListener('submit',e=>{e.preventDefault();data.plans.push({id:uid('plan'),description:$('planDescription').value.trim(),quantity:Number($('planQty').value)||1,unitAmount:round(Number($('planUnit').value)||0),currency:$('planCurrency').value,note:$('planNote').value.trim()});save();e.target.reset();$('planQty').value=1;$('planCurrency').value='TND'});
  $('financeParticipantForm').addEventListener('submit',e=>{e.preventDefault();const name=$('financeParticipantName').value.trim();if(name){data.participants.push({id:uid('p'),name});save();e.target.reset()}});
  $('financeTransactions').addEventListener('click',e=>{const edit=e.target.closest('[data-edit-tx]');const del=e.target.closest('[data-delete-tx]');if(edit)editTransaction(edit.dataset.editTx);if(del&&confirm('Smazat tento pohyb?')){data.transactions=data.transactions.filter(t=>t.id!==del.dataset.deleteTx);save()}});
  $('financePlans').addEventListener('click',e=>{const b=e.target.closest('[data-delete-plan]');if(b&&confirm('Smazat plánovanou položku?')){data.plans=data.plans.filter(p=>p.id!==b.dataset.deletePlan);save()}});
  $('financeParticipantList').addEventListener('click',e=>{const b=e.target.closest('[data-delete-participant]');if(!b)return;const id=b.dataset.deleteParticipant;const used=data.transactions.some(t=>t.payer===id||(t.split?.participants||[]).includes(id));if(used){alert('Účastník je použitý v transakcích. Nejdřív upravte tyto transakce.');return}if(confirm(`Smazat účastníka ${participantName(id)}?`)){data.participants=data.participants.filter(p=>p.id!==id);save()}});
  $('financeExport').addEventListener('click',exportJson);
  $('financeImport').addEventListener('change',async e=>{const f=e.target.files?.[0];if(!f)return;try{await importJson(f)}catch(err){alert(`Import se nezdařil: ${err.message}`)}finally{e.target.value=''}});
  typeChanged();renderAll();updateSplitCheck();
}

bind();
})();
