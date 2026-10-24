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

document.addEventListener('DOMContentLoaded',()=>{
  applyPwaMode();
  applyScrollableBottomNav();
});
window.addEventListener('appinstalled',()=>{
  document.documentElement.classList.add('pwa-standalone');
  const installBtn=document.getElementById('installBtn');
  if(installBtn) installBtn.hidden=true;
});

const displayModeQuery=window.matchMedia('(display-mode: standalone)');
if(displayModeQuery.addEventListener) displayModeQuery.addEventListener('change',applyPwaMode);
