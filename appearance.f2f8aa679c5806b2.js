/* Keep the original preference key so existing readers retain their choice. */
(()=>{
 'use strict';
 const key='moko-wiki-theme',root=document.documentElement,media=window.matchMedia('(prefers-color-scheme: dark)');
 let explicit=null;
 try{const saved=localStorage.getItem(key);if(saved==='dark'||saved==='light')explicit=saved;}catch{}
 function apply(theme){
  root.dataset.theme=theme;
  const dark=theme==='dark',button=document.getElementById('themeToggle');
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content',dark?'#111b17':'#173d32');
  if(button){button.setAttribute('aria-pressed',String(dark));button.title=dark?'라이트 모드로 전환':'다크 모드로 전환';}
 }
 function choose(theme){explicit=theme;try{localStorage.setItem(key,theme);}catch{}apply(theme);}
 apply(explicit||(media.matches?'dark':'light'));
 document.addEventListener('DOMContentLoaded',()=>{
  const button=document.getElementById('themeToggle');
  if(button)button.addEventListener('click',()=>choose(root.dataset.theme==='dark'?'light':'dark'));
  apply(root.dataset.theme);
 });
 media.addEventListener('change',()=>{if(!explicit)apply(media.matches?'dark':'light');});
 window.addEventListener('storage',e=>{if(e.key===key||e.key===null){explicit=e.newValue==='dark'||e.newValue==='light'?e.newValue:null;apply(explicit||(media.matches?'dark':'light'));}});
})();
