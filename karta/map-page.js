const stage=document.getElementById('map-stage');
const start=document.getElementById('map-start');
start.addEventListener('click',()=>{
 const frame=document.createElement('iframe');frame.src='./viewer.html';frame.title='Трёхмерная карта Матена';frame.allowFullscreen=true;
 stage.replaceChildren(frame);stage.classList.add('is-loaded');
 document.getElementById('map-fullscreen').hidden=false;
});
document.getElementById('map-fullscreen').addEventListener('click',async()=>{
 try{if(!document.fullscreenElement)await stage.requestFullscreen();else await document.exitFullscreen();}
 catch{window.open('./viewer.html','_blank','noopener');}
});
