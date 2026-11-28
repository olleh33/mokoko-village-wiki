(()=>{'use strict';
const {docs,releases,skills,engravings,revision}=window.MOKO_GUIDE;
const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fam={SWORD:'검/방',SPEAR:'창',BOW:'활',STAFF:'지팡이',DAGGER:'단검',BOOK:'치유의 책'},kind={basic:'기본 공격',active:'전투 기술',ultimate:'궁극기',passive:'패시브'},rarity={BASIC:'기본',COMMON:'일반',MAGIC:'마법',RARE:'희귀',EPIC:'에픽',LEGENDARY:'레전드',MYTHIC:'신화'};
let current='start',family='ALL',query='',rank='ALL',type='ALL',observer;
const latest=releases[0],stamp=latest?latest.date.replaceAll('-','.')+' 개정':'';
document.querySelectorAll('[data-stamp]').forEach(e=>e.textContent=stamp+' · 현재 규칙과 이용 방법');
const groups=[...new Set(docs.map(d=>d.group))];
$('#nav').innerHTML=groups.map(g=>`<div class="nav-group"><h2>${esc(g)}</h2>${docs.filter(d=>d.group===g).map(d=>`<a href="#${d.id}" data-doc="${d.id}">${esc(d.title)}</a>`).join('')}</div>`).join('');
const closeNav=()=>{document.body.classList.remove('menu-open');$('#navToggle').setAttribute('aria-expanded','false');$('#veil').hidden=true;};
$('#navToggle').onclick=()=>{const open=document.body.classList.toggle('menu-open');$('#navToggle').setAttribute('aria-expanded',String(open));$('#veil').hidden=!open;};$('#veil').onclick=closeNav;
$('#toTop').onclick=()=>window.scrollTo({top:0,behavior:'smooth'});
$('.skip').onclick=e=>{e.preventDefault();$('#content').focus();$('#content').scrollIntoView({behavior:'instant'});};
function block(b){
 if(b.text)return `<p>${esc(b.text)}</p>`;
 if(b.tip)return `<aside class="tip">${esc(b.tip)}</aside>`;
 if(b.steps||b.list)return `<${b.steps?'ol':'ul'} class="${b.steps?'steps':'list'}">${(b.steps||b.list).map(t=>`<li>${esc(t)}</li>`).join('')}</${b.steps?'ol':'ul'}>`;
 if(b.table)return `<div class="table-wrap" tabindex="0" role="region" aria-label="가로로 스크롤할 수 있는 표"><table><thead><tr>${b.table.head.map(t=>`<th scope="col">${esc(t)}</th>`).join('')}</tr></thead><tbody>${b.table.rows.map(r=>`<tr>${r.map(t=>`<td>${esc(t)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
 if(b.commands)return `<dl class="commands">${b.commands.map(([a,t])=>`<dt><code>${esc(a)}</code></dt><dd>${esc(t)}</dd>`).join('')}</dl>`;
 if(b.links)return `<div class="links">${b.links.map(l=>`<a href="${esc(l.url)}">${esc(l.label)}</a>`).join('')}</div>`;
 if(b.lifeCards)return `<div class="engraving-grid">${b.lifeCards.map(e=>`<div class="engraving-card"><div class="skill-title"><img src="${e.icon}" alt="${esc(e.name)} 아이콘" loading="lazy"><div><h3>${esc(e.name)}</h3><small>레벨 ${e.level}부터 · 최대 ${e.max}단계</small></div></div><p>${esc(e.effect)}</p></div>`).join('')}</div>`;
 if(b.diagram)return `<pre class="diagram">${esc(b.diagram)}</pre>`;
 if(b.skillCatalog)return `<div class="skill-toolbar"><div class="filters" aria-label="무기군 선택">${[['ALL','전체'],...Object.entries(fam)].map(([f,n])=>`<button class="chip ${family===f?'active':''}" data-family="${f}" aria-pressed="${family===f}">${n}</button>`).join('')}</div><div class="filter-row"><input id="skillSearch" type="search" placeholder="기술 이름·효과 검색" aria-label="기술 이름과 효과 검색" value="${esc(query)}"><select id="skillRank" aria-label="기술 등급"><option value="ALL">모든 등급</option>${Object.entries(rarity).map(([v,n])=>`<option value="${v}" ${rank===v?'selected':''}>${n}</option>`).join('')}</select><select id="skillType" aria-label="기술 종류"><option value="ALL">모든 종류</option>${Object.entries(kind).map(([v,n])=>`<option value="${v}" ${type===v?'selected':''}>${n}</option>`).join('')}</select></div><div id="skillCount" class="result-count" aria-live="polite"></div></div><div id="skillGrid" class="skill-grid"></div>`;
 if(b.engravingCatalog)return `<div class="engraving-grid">${engravings.map(e=>`<div class="engraving-card"><div class="skill-title"><img src="${e.icon}" alt="${esc(e.name)} 아이콘" loading="lazy"><div><h3>${esc(e.name)}</h3><small>${esc(e.family)} 전용</small></div></div><p>${esc(e.effect)}</p></div>`).join('')}</div>`;
 if(b.releaseHistory)return releases.map((r,i)=>`${i===1?'<div class="history-label">이전 기록 · 현재 이용 규칙은 각 문서를 기준으로 확인하십시오.</div>':''}<details class="release" ${i===0?'open':''}><summary><time>${esc(r.date)}</time><strong>${esc(r.title)}</strong></summary>${r.sections?.length?r.sections.map(section=>`<section><h3>${esc(section.title)}</h3><ul>${section.changes.map(t=>`<li>${esc(t)}</li>`).join('')}</ul></section>`).join(''):`<ul>${r.changes.map(t=>`<li>${esc(t)}</li>`).join('')}</ul>`}</details>`).join('');
 return '';
}
function skillResults(){const q=query.toLocaleLowerCase();const found=skills.filter(s=>(family==='ALL'||s.family===family)&&(rank==='ALL'||s.rarity===rank)&&(type==='ALL'||s.kind===type)&&[s.name,s.summary,s.condition].join(' ').toLocaleLowerCase().includes(q)).sort((a,b)=>a.level-b.level||a.name.localeCompare(b.name,'ko'));
 $('#skillCount').textContent=`${found.length}종 표시 / 전체 152종 · 필요 무기 숙련 순 · 수치는 기본 마나 기준`;
 $('#skillGrid').innerHTML=found.length?found.map(s=>`<article class="skill-card" id="skill-${s.id}"><div class="skill-title"><img src="${s.icon}" alt="${esc(s.name)} 아이콘" loading="lazy"><div><h3>${esc(s.name)}</h3><small>${fam[s.family]} · ${kind[s.kind]}</small></div></div><div class="skill-meta"><span>무기 숙련 ${s.level}</span><span>${rarity[s.rarity]}</span><span>마나 ${s.mana}</span></div><p>${esc(s.summary||'상세 효과는 게임 내 기술 설명에서 확인할 수 있습니다.')}</p>${s.condition?`<p class="skill-condition">${esc(s.condition)}</p>`:''}</article>`).join(''):'<div class="empty">조건에 맞는 기술이 없습니다.<br>검색어 또는 필터를 변경하십시오.</div>';
}
function bindSkills(){if(!$('#skillGrid'))return;skillResults();document.querySelectorAll('[data-family]').forEach(b=>b.onclick=()=>{family=b.dataset.family;document.querySelectorAll('[data-family]').forEach(c=>{c.classList.toggle('active',c===b);c.setAttribute('aria-pressed',String(c===b));});skillResults();});$('#skillSearch').oninput=e=>{query=e.target.value;skillResults();};$('#skillRank').onchange=e=>{rank=e.target.value;skillResults();};$('#skillType').onchange=e=>{type=e.target.value;skillResults();};}
function home(){return `<div class="hero"><small>마을에서 시작하는 작은 모험</small><h2>한 뼘의 농장부터<br>함께 오르는 전장까지.</h2><p>생활 활동, 장비 제작과 전투 기술을 한곳에서 확인할 수 있습니다.<br>모험에 필요한 규칙과 이용 방법을 안내합니다.</p><a class="hero-link" href="#jobs">나에게 맞는 생활 찾기 →</a><div class="hero-items" aria-hidden="true"><img src="assets/items/npc_farm.png" alt=""><img src="assets/items/workshop_craft.png" alt=""><img src="assets/items/skill_book_mythic.png" alt=""></div></div>${latest?`<a class="news" href="#updates"><b>최근 업데이트</b><span>${esc(latest.date)} · ${esc(latest.title)}</span><em>자세히 →</em></a>`:''}<div class="quick-grid">${[['combat-skills','전투 기술 찾기','6개 무기군 · 152종 기술','skill_book_epic'],['cooking','공용 주방','재료를 넣고 새로운 맛 발견','npc_farm'],['adventure','모험 준비','던전·레이드와 보상 안내','hunting_coin']].map(([id,t,d,img])=>`<a class="quick-card" href="#${id}"><img src="assets/items/${img}.png" alt=""><strong>${t}</strong><span>${d}</span><em>안내 보기 ↗</em></a>`).join('')}</div>`;}
function route(){let hash;try{hash=decodeURIComponent(location.hash.slice(1)||'start');}catch{hash='start';}hash=hash.replace(/^([^/~]+)~(\d+)$/,'$1/s-$2');const parts=hash.split('/'),id=parts[0];const d=docs.find(d=>d.id===id)||docs[0];const same=current===d.id&&$('#content').dataset.loaded==='yes';
 if(same&&parts[1]&&parts[1].startsWith('s-')){document.getElementById(parts[1])?.scrollIntoView({behavior:'instant'});return;}
 if(parts[1]?.startsWith('skill-')){family='ALL';query='';rank='ALL';type='ALL';}
 current=d.id;closeNav();$('#searchResults').hidden=true;document.title=`${d.title} · 모코코 마을 게임 위키`;
 document.querySelectorAll('[data-doc]').forEach(a=>{const on=a.dataset.doc===current;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
 const toc=d.sections.map((s,i)=>`<a href="#${d.id}/s-${i}" data-section="s-${i}">${esc(s.title)}</a>`).join('');
 $('#toc').innerHTML=`<div class="toc-title">이 문서의 내용</div>${toc}`;
 const di=docs.indexOf(d),prev=docs[di-1],next=docs[di+1];
 $('#content').innerHTML=`<header class="article-head"><div class="eyebrow">${esc(d.group)}</div><h1>${esc(d.title)}</h1><p class="lead">${esc(d.summary)}</p><div class="meta"><span>게임 위키</span><span>${esc(stamp)}</span></div></header>${current==='start'?home():''}<details class="mobile-toc"><summary>이 문서의 내용</summary><div>${toc}</div></details>${d.sections.map((s,i)=>`<section class="section" id="s-${i}"><h2><span class="number">${String(i+1).padStart(2,'0')}</span>${esc(s.title)}</h2>${s.blocks.map(block).join('')}</section>`).join('')}<nav class="article-nav" aria-label="이전 다음 문서">${prev?`<a href="#${prev.id}"><small>이전 문서</small>← ${esc(prev.title)}</a>`:'<span></span>'}${next?`<a href="#${next.id}"><small>다음 문서</small>${esc(next.title)} →</a>`:'<a href="#start">처음으로 →</a>'}</nav>`;
 $('#content').dataset.loaded='yes';bindSkills();if(observer)observer.disconnect();observer=new IntersectionObserver(entries=>{entries.filter(e=>e.isIntersecting).forEach(e=>document.querySelectorAll('#toc a').forEach(a=>a.classList.toggle('active',a.dataset.section===e.target.id)));},{rootMargin:'-110px 0px -65% 0px'});document.querySelectorAll('.section').forEach(s=>observer.observe(s));
 if(parts[1]?.startsWith('s-'))document.getElementById(parts[1])?.scrollIntoView({behavior:'instant'});else if(parts[1]?.startsWith('skill-')){const el=document.getElementById(parts[1]);el?.scrollIntoView({behavior:'instant'});el?.classList.add('highlight-target');}else window.scrollTo({top:0,behavior:'instant'});
}
const searchIndex=docs.map(d=>({id:d.id,title:d.title,group:d.group,sections:d.sections.map(s=>s.title),hay:[d.title,d.summary,JSON.stringify(d.sections)].join(' ').toLocaleLowerCase()}));
$('#search').oninput=e=>{const q=e.target.value.trim().toLocaleLowerCase();const box=$('#searchResults');if(!q){box.hidden=true;return;}const hits=searchIndex.filter(d=>d.hay.includes(q)).map(d=>{const section=d.sections.findIndex(s=>s.toLocaleLowerCase().includes(q));return {...d,section,score:(d.title.toLocaleLowerCase().includes(q)?10:0)+(section>=0?5:0)};}).sort((a,b)=>b.score-a.score).slice(0,8);const sh=skills.filter(s=>s.name.toLocaleLowerCase().includes(q)).slice(0,5);box.innerHTML=hits.map(d=>`<a href="#${d.id}${d.section>=0?'/s-'+d.section:''}"><strong>${esc(d.title)}</strong><small>${esc(d.section>=0?d.sections[d.section]:d.group)}</small></a>`).join('')+sh.map(s=>`<a href="#combat-skills/skill-${s.id}"><strong>${esc(s.name)}</strong><small>${fam[s.family]} · 무기 숙련 ${s.level} · ${kind[s.kind]}</small></a>`).join('');if(!box.innerHTML)box.innerHTML='<div class="search-empty">검색 결과가 없습니다. 다른 검색어를 입력하십시오.</div>';box.hidden=false;};
$('#search').onkeydown=e=>{if(e.key==='Enter'){$('#searchResults a')?.click();$('#search').blur();}if(e.key==='Escape'){$('#searchResults').hidden=true;$('#search').blur();}};
document.addEventListener('click',e=>{if(!e.target.closest('.search-wrap'))$('#searchResults').hidden=true;});
document.addEventListener('keydown',e=>{if(e.key==='/'&&!['INPUT','SELECT','TEXTAREA'].includes(document.activeElement.tagName)){e.preventDefault();$('#search').focus();}if(e.key==='Escape'){closeNav();$('#searchResults').hidden=true;}});
// Old tabs keep their current article until the reader chooses to refresh.
// Failed/offline checks never discard already loaded content.
let updateBusy=false,lastUpdateCheck=0;
async function checkGuideUpdate(){
 if(!revision||document.hidden||updateBusy||Date.now()-lastUpdateCheck<10000)return;
 updateBusy=true;lastUpdateCheck=Date.now();
 try{
  const response=await fetch('version.json?check='+Math.floor(Date.now()/60000),{cache:'no-store',signal:AbortSignal.timeout(5000)});
  if(!response.ok)return;
  const latest=await response.json();
  if(typeof latest.revision!=='string'||!latest.revision.match(/^[a-f0-9]{16}$/)||latest.revision===revision||$('#guideUpdate'))return;
  const notice=document.createElement('aside');notice.id='guideUpdate';notice.className='guide-update';notice.setAttribute('role','status');
  const label=document.createElement('span');label.textContent='안내서가 업데이트됐어요.';
  const button=document.createElement('button');button.type='button';button.textContent='최신 내용 보기';button.onclick=()=>location.reload();
  notice.append(label,button);document.body.append(notice);
 }catch{/* Keep reading when the network or the update endpoint is unavailable. */}
 finally{updateBusy=false;}
}
window.setInterval(checkGuideUpdate,60000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)checkGuideUpdate();});
window.addEventListener('hashchange',route);route();checkGuideUpdate();
})();
