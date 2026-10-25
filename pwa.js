function isStandaloneMode(){
  return window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true ||
    document.referrer.startsWith('android-app://');
}

function applyPwaMode(){
  const standalone=isStandaloneMode();
  document.documentElement.classList.toggle('pwa-standalone',standalone);
  const installBtn=document.getElementById('installBtn');
  if(standalone && installBtn) installBtn.hidden=true;
}

function applyScrollableBottomNav(){
  if(document.getElementById('bottom-nav-scroll-style')) return;
  const style=document.createElement('style');
  style.id='bottom-nav-scroll-style';
  style.textContent=`
    .bottom-nav{
      display:flex !important;
      grid-template-columns:none !important;
      align-items:stretch;
      justify-content:flex-start;
      gap:1px;
      overflow-x:auto;
      overflow-y:hidden;
      scrollbar-width:none;
      -webkit-overflow-scrolling:touch;
      overscroll-behavior-x:contain;
      scroll-snap-type:x proximity;
    }
    .bottom-nav::-webkit-scrollbar{display:none}
    .bottom-nav .nav-btn{
      flex:0 0 auto;
      min-width:56px;
      padding:4px 6px;
      gap:1px;
      white-space:nowrap;
      font-size:.6rem;
      scroll-snap-align:center;
    }
    .bottom-nav .nav-btn span{font-size:1rem;line-height:1.05}
    @media(max-width:430px){
      .bottom-nav .nav-btn{min-width:54px;padding:4px 5px;font-size:.58rem}
      .bottom-nav .nav-btn span{font-size:.98rem}
    }
  `;
  document.head.appendChild(style);

  document.querySelectorAll('.bottom-nav .nav-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      btn.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'});
    });
  });
}

function makeCollapsibleSection(title,nodes,subtitle=''){
  const valid=nodes.filter(Boolean);
  if(!valid.length) return null;
  const first=valid[0];
  const details=document.createElement('details');
  details.className='accordion app-section';
  const summary=document.createElement('summary');
  summary.innerHTML=`<span class="app-section-title">${title}</span>${subtitle?`<small>${subtitle}</small>`:''}`;
  const body=document.createElement('div');
  body.className='body app-section-body';
  first.parentNode.insertBefore(details,first);
  details.appendChild(summary);
  details.appendChild(body);
  valid.forEach(n=>body.appendChild(n));
  return details;
}

function wrapWholePage(page){
  if(!page || page.dataset.collapsibleDone==='1') return;
  const head=[...page.children].find(x=>x.classList?.contains('section-head'));
  if(!head) return;
  const title=head.querySelector('h2')?.textContent?.trim()||'Sekce';
  const subtitle=head.querySelector('span')?.textContent?.trim()||'';
  const nodes=[];
  let n=head.nextElementSibling;
  while(n){nodes.push(n);n=n.nextElementSibling;}
  if(nodes.length){
    makeCollapsibleSection(title,nodes,subtitle);
    head.remove();
  }
  page.dataset.collapsibleDone='1';
}

function wrapHeadingSection(page,title,stopTest){
  const heading=[...page.children].find(x=>x.tagName==='H2'&&x.textContent.trim()===title);
  if(!heading) return;
  const nodes=[];
  let n=heading.nextElementSibling;
  while(n && !(stopTest&&stopTest(n))){nodes.push(n);n=n.nextElementSibling;}
  makeCollapsibleSection(title,nodes);
  heading.remove();
}

function applyCollapsibleSections(){
  if(document.documentElement.classList.contains('collapsible-sections-ready')) return;
  document.documentElement.classList.add('collapsible-sections-ready');

  if(!document.getElementById('collapsible-sections-style')){
    const style=document.createElement('style');
    style.id='collapsible-sections-style';
    style.textContent=`
      .app-section{margin:10px 0}
      .app-section>summary{display:flex;align-items:center;gap:8px;padding:13px 15px}
      .app-section>summary::after{margin-left:auto}
      .app-section-title{font-weight:850}
      .app-section>summary small{color:var(--muted);font-size:.72rem;font-weight:500;margin-left:auto;margin-right:8px;text-align:right}
      .app-section-body{padding-top:2px}
      .app-section-body>.alert:first-child,.app-section-body>.card:first-child{margin-top:0}
      @media(max-width:430px){.app-section>summary small{display:none}}
    `;
    document.head.appendChild(style);
  }

  // Všechny stávající akordeony začínají zavřené.
  document.querySelectorAll('main details').forEach(d=>d.open=false);

  const home=document.querySelector('.page[data-page="home"]');
  if(home){
    const primary=document.getElementById('primaryContact');
    if(primary) makeCollapsibleSection('Hlavní delegátka',[primary]);
    wrapHeadingSection(home,'Právě teď',n=>n.tagName==='H2');
    wrapHeadingSection(home,'Následující události',n=>n.classList?.contains('alert'));
    const alerts=[...home.children].filter(x=>x.classList?.contains('alert'));
    if(alerts.length) makeCollapsibleSection('Důležitá upozornění',alerts);
    home.dataset.collapsibleDone='1';
  }

  // Jednodušší záložky jsou jedna skládací obsahová sekce.
  ['services','contacts','info','trips','private'].forEach(name=>wrapWholePage(document.querySelector(`.page[data-page="${name}"]`)));

  // Finance: jednotlivé funkční části zvlášť.
  const finance=document.querySelector('.page[data-page="finance"]');
  if(finance && finance.dataset.collapsibleDone!=='1'){
    const summary=document.getElementById('financeSummary');
    const warnings=document.getElementById('financeWarnings');
    const toolbar=finance.querySelector('.finance-toolbar');
    if(summary) makeCollapsibleSection('Přehled financí',[summary,warnings,toolbar].filter(Boolean));

    wrapHeadingSection(finance,'Salda účastníků',n=>n.tagName==='H2'||n.tagName==='DETAILS');
    wrapHeadingSection(finance,'Plán',n=>n.tagName==='H2'||n.tagName==='DETAILS');
    wrapHeadingSection(finance,'Pohyby',n=>n.tagName==='H2'||n.tagName==='DETAILS');
    finance.querySelectorAll(':scope > details').forEach(d=>d.open=false);
    finance.dataset.collapsibleDone='1';
  }
}

document.addEventListener('DOMContentLoaded',()=>{
  applyPwaMode();
  applyScrollableBottomNav();
  applyCollapsibleSections();
});
window.addEventListener('appinstalled',()=>{
  document.documentElement.classList.add('pwa-standalone');
  const installBtn=document.getElementById('installBtn');
  if(installBtn) installBtn.hidden=true;
});

const displayModeQuery=window.matchMedia('(display-mode: standalone)');
if(displayModeQuery.addEventListener) displayModeQuery.addEventListener('change',applyPwaMode);

const financePlanEditor=document.createElement('script');
financePlanEditor.src='./finance-plan-edit.js';
financePlanEditor.async=false;
document.head.appendChild(financePlanEditor);
