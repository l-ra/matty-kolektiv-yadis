(()=>{
'use strict';

const KEY='yadis.finance.v1';
const OPEN_KEY='yadis.finance.reopen';
const form=document.getElementById('financePlanForm');
const plans=document.getElementById('financePlans');
if(!form||!plans) return;

const submit=form.querySelector('button[type="submit"]');
const qty=document.getElementById('planQty');
const currency=document.getElementById('planCurrency');

const cancel=document.createElement('button');
cancel.type='button';
cancel.className='mini-button';
cancel.textContent='Zrušit úpravu';
cancel.hidden=true;
submit.insertAdjacentElement('afterend',cancel);

function readData(){
  try{return JSON.parse(localStorage.getItem(KEY)||'{}');}
  catch{return {};}
}

function resetEdit(){
  delete form.dataset.editPlanId;
  form.reset();
  qty.value=1;
  currency.value='TND';
  submit.textContent='Přidat do plánu';
  cancel.hidden=true;
}

function startEdit(id){
  const data=readData();
  const p=(data.plans||[]).find(x=>x.id===id);
  if(!p) return;
  form.dataset.editPlanId=id;
  document.getElementById('planDescription').value=p.description||'';
  qty.value=Number(p.quantity)||1;
  document.getElementById('planUnit').value=Number(p.unitAmount)||0;
  currency.value=p.currency||'TND';
  document.getElementById('planNote').value=p.note||'';
  submit.textContent='Uložit změny';
  cancel.hidden=false;
  const details=form.closest('details');
  if(details) details.open=true;
  form.scrollIntoView({behavior:'smooth',block:'start'});
}

function enhance(){
  plans.querySelectorAll('[data-delete-plan]').forEach(del=>{
    const id=del.dataset.deletePlan;
    if(!id || plans.querySelector(`[data-edit-plan="${CSS.escape(id)}"]`)) return;
    const edit=document.createElement('button');
    edit.type='button';
    edit.className='mini-button';
    edit.dataset.editPlan=id;
    edit.textContent='Upravit';
    del.insertAdjacentElement('beforebegin',edit);
  });
}

plans.addEventListener('click',e=>{
  const edit=e.target.closest('[data-edit-plan]');
  if(edit) startEdit(edit.dataset.editPlan);
});

cancel.addEventListener('click',resetEdit);

form.addEventListener('submit',e=>{
  const id=form.dataset.editPlanId;
  if(!id) return;

  e.preventDefault();
  e.stopImmediatePropagation();

  const description=document.getElementById('planDescription').value.trim();
  const quantity=Number(qty.value);
  const unitAmount=Number(document.getElementById('planUnit').value);
  const note=document.getElementById('planNote').value.trim();

  if(!description){alert('Zadejte popis plánované položky.');return;}
  if(!Number.isFinite(quantity)||quantity<1){alert('Počet musí být alespoň 1.');return;}
  if(!Number.isFinite(unitAmount)||unitAmount<0){alert('Zadejte platnou cenu.');return;}

  const data=readData();
  const list=Array.isArray(data.plans)?data.plans:[];
  const i=list.findIndex(x=>x.id===id);
  if(i<0){alert('Plánovaná položka už neexistuje.');resetEdit();return;}

  list[i]={
    ...list[i],
    description,
    quantity,
    unitAmount:Math.round(unitAmount*100)/100,
    currency:currency.value,
    note
  };
  data.plans=list;
  data.meta=data.meta&&typeof data.meta==='object'?data.meta:{};
  data.meta.updatedAt=new Date().toISOString();
  localStorage.setItem(KEY,JSON.stringify(data));
  sessionStorage.setItem(OPEN_KEY,'1');
  location.reload();
},true);

new MutationObserver(enhance).observe(plans,{childList:true,subtree:true});
enhance();

if(sessionStorage.getItem(OPEN_KEY)==='1'){
  sessionStorage.removeItem(OPEN_KEY);
  setTimeout(()=>document.querySelector('.nav-btn[data-target="finance"]')?.click(),0);
}
})();
