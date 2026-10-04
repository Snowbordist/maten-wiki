(()=>{
  'use strict';
  const norm=s=>String(s).toLocaleLowerCase('ru').replace(/ё/g,'е');
  const dialog=document.querySelector('#search-dialog'),input=document.querySelector('#wiki-search'),results=document.querySelector('#search-results'),status=document.querySelector('#search-status');
  let index,loading;
  const load=()=>loading||(loading=fetch('/maten-wiki/search-index.json').then(r=>{if(!r.ok)throw Error('load');return r.json();}).then(x=>index=x).catch(e=>{loading=null;throw e;}));
  async function search(){
    const query=input.value.trim();
    results.replaceChildren();
    status.textContent='Загружаем указатель…';
    try{await load();}catch{status.textContent='Не удалось загрузить поиск. Проверьте соединение и попробуйте ещё раз.';return;}
    if(input.value.trim()!==query)return;
    if(!query){status.textContent='Поиск по именам, прозвищам и тексту статей.';return;}
    const words=norm(query).split(/\s+/);
    const found=index.filter(a=>words.every(w=>norm([a.title,...a.aliases,a.text].join(' ')).includes(w))).sort((a,b)=>Number(norm(b.title).includes(norm(query)))-Number(norm(a.title).includes(norm(query))));
    status.textContent=found.length?`Найдено: ${found.length}`:'Ничего не найдено. Попробуйте часть имени или другое слово.';
    for(const a of found.slice(0,50)){
      const link=document.createElement('a'),title=document.createElement('strong'),meta=document.createElement('small'),snippet=document.createElement('p');
      link.href=a.url;title.textContent=a.title;meta.textContent=a.section;
      const pos=Math.max(0,norm(a.text).indexOf(words[0])-65);snippet.textContent=(pos?'…':'')+a.text.slice(pos,pos+200)+(a.text.length>pos+200?'…':'');
      link.append(meta,title,snippet);results.append(link);
    }
  }
  document.querySelectorAll('[data-open-search]').forEach(b=>b.onclick=()=>{dialog.showModal();input.focus();search();});
  document.querySelector('[data-close-search]').onclick=()=>dialog.close();
  input.addEventListener('input',search);
  document.addEventListener('keydown',e=>{if(e.key==='/'&&!/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)&&!e.target.isContentEditable){e.preventDefault();dialog.showModal();input.focus();search();}});
  const directory=document.querySelector('#directory-search');
  if(directory)directory.oninput=()=>{let count=0;document.querySelectorAll('[data-filter]').forEach(a=>{a.hidden=!norm(a.dataset.filter).includes(norm(directory.value));if(!a.hidden)count++;});document.querySelector('#directory-status').textContent=`Статей: ${count}`;};
  const headings=[...document.querySelectorAll('.standalone-article .article-copy h2,.standalone-article .article-copy h3')];
  const toc=document.querySelector('.article-toc');
  if(toc&&headings.length>1){toc.hidden=false;const label=document.createElement('strong');label.textContent='На этой странице';toc.append(label);headings.forEach((h,i)=>{if(!h.id)h.id='section-'+(i+1);const a=document.createElement('a');a.href='#'+h.id;a.textContent=h.textContent;toc.append(a);});}
  const facts=document.querySelector('.article-facts');if(facts){const mobile=matchMedia('(max-width: 720px)');facts.open=!mobile.matches;mobile.addEventListener('change',()=>facts.open=!mobile.matches);}
})();
