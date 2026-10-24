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

document.addEventListener('DOMContentLoaded',applyPwaMode);
window.addEventListener('appinstalled',()=>{
  document.documentElement.classList.add('pwa-standalone');
  const installBtn=document.getElementById('installBtn');
  if(installBtn) installBtn.hidden=true;
});

const displayModeQuery=window.matchMedia('(display-mode: standalone)');
if(displayModeQuery.addEventListener) displayModeQuery.addEventListener('change',applyPwaMode);
