// Only article IDs are stored as map links. Descriptions always come from content.json.
let content=null,failed=false,currentPlace=null;
export async function loadArticles(){
 try{const response=await fetch('../content.json',{cache:'no-cache'});if(!response.ok)throw Error('Content unavailable');content=await response.json();}
 catch{failed=true;}
 if(currentPlace)showPlace(currentPlace);
}
export function showPlace(place){
 const changed=currentPlace?.id!==place?.id;currentPlace=place;if(!place)return;
 const container=document.getElementById('detail');container.replaceChildren();
 const heading=document.createElement('h2');heading.textContent=place.name;container.append(heading);
 const article=content?.articles?.find(a=>a.id===content.mapLinks?.[place.id]);
 const paragraph=document.createElement('p');
 if(article){
  let summary=article.summary?.trim();
  if(!summary){const parsed=new DOMParser().parseFromString(article.bodyHtml||'','text/html');parsed.querySelectorAll('script,style').forEach(el=>el.remove());summary=article.markdown??parsed.body.textContent;summary=summary?.replace(/\s+/g,' ').trim();if(summary?.length>360)summary=summary.slice(0,360)+'…';}
  paragraph.textContent=summary||'Откройте статью, чтобы узнать больше об этом месте.';
  const link=document.createElement('a');link.href='/maten-wiki/'+article.id+'/';link.target='_top';link.textContent='Читать: '+article.title+' ↗';
  container.append(paragraph,link);
 }else{
  paragraph.textContent=failed?'Статьи не загрузились. Обновите страницу, чтобы попробовать снова.':!content?'Загружаем сведения из вики…':content.mapLinks?.[place.id]?'Связанная статья удалена. Новую связь можно выбрать в Студии.':'Статья пока не привязана.';
  container.append(paragraph);
 }
 if(changed&&matchMedia('(max-width:570px)').matches){const panel=container.closest('aside');panel.scrollTop=container.offsetTop-panel.offsetTop-12;}
}
