import * as THREE from 'three';
import {OrbitControls} from 'orbit-controls';
import {GLTFLoader} from 'gltf-loader';
import {TOWNS} from './places.js';
import {showPlace,loadArticles} from './place-articles.js';
loadArticles();
const $=id=>document.getElementById(id),host=$('scene');
try{
 const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));host.prepend(renderer.domElement);
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.3;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 const scene=new THREE.Scene();scene.background=new THREE.Color('#bfc9c6');
 const camera=new THREE.PerspectiveCamera(37,1,.1,500);const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.minDistance=3;controls.maxDistance=400;controls.maxPolarAngle=Math.PI*.485;controls.target.set(0,0,0);
 const hemi=new THREE.HemisphereLight('#e9f4fa','#6a755f',2);scene.add(hemi);const sun=new THREE.DirectionalLight('#ffebc6',3.1);sun.position.set(-25,55,22);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-43,right:43,top:36,bottom:-36,near:1,far:130});sun.shadow.normalBias=.045;sun.shadow.bias=-.0002;scene.add(sun);
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(500,500),new THREE.MeshStandardMaterial({color:'#bfc9c6',roughness:1}));floor.rotation.x=-Math.PI/2;floor.position.y=-1.65;floor.receiveShadow=true;scene.add(floor);
 const gltf=await new GLTFLoader().loadAsync('./maten.glb',e=>{if(e.total)$('loading').lastElementChild.textContent='Загружаем карту… '+Math.round(e.loaded/e.total*100)+'%';});const world=gltf.scene;scene.add(world);
 const roads=[],forests=[];let water;world.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;if(o.name.startsWith('road-')||o.name.startsWith('network-')||o.name.includes('unified'))roads.push(o);if(o.name.startsWith('Лес'))forests.push(o);if(o.name.startsWith('Море')){water=o;o.castShadow=false;o.receiveShadow=false;}}});
 // Match all road mesh names using their source IDs, including the main network.
 const roadNames=new Set(["road-tarn-kehl-center","road-karana-dan-center","road-orkhar-center","road-urgash-center","road-saar-center","road-karn-dur-center","road-haldraq-center","road-brogholm-center","road-runegates-center","road-velissar-center","road-ostran-center","road-solatir-center","road-auris-center","road-edittar-center","road-drakmora-center","road-rezgar-center","road-varkas-center","road-nimveil-center","road-arkanor-center","road-lunar-harbor-center","road-valmir-center","road-silford-center","road-lokantil-center","road-morteyn-center","road-kardess-center","trunk-road-1","trunk-road-2","trunk-road-3","trunk-road-4","trunk-road-5","trunk-road-6","trunk-road-7","trunk-road-8","trunk-road-9","trunk-road-10","trunk-road-11","trunk-road-12","trunk-road-13","trunk-road-14","trunk-road-15","road-network-40","road-network-41","road-network-42","road-network-43","road-network-44","road-network-45","road-network-46","road-network-47","road-network-48","road-network-49","road-network-50","road-network-51","road-network-52","road-network-53","road-network-54","road-network-55","road-network-56","road-network-57","road-network-58","road-network-59","road-network-60","road-network-61","road-network-62","road-network-63","road-network-64"]);world.traverse(o=>{if(o.isMesh&&roadNames.has(o.name)&&!roads.includes(o))roads.push(o);});
 const uniforms={time:{value:0}};if(water){water.material.onBeforeCompile=s=>{s.uniforms.uTime=uniforms.time;s.vertexShader='uniform float uTime;\n'+s.vertexShader;s.fragmentShader='uniform float uTime;\n'+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('#include <normal_fragment_begin>','#include <normal_fragment_begin>\nnormal.x += .04*sin(gl_FragCoord.x*.13+uTime*.6)*cos(gl_FragCoord.y*.09+uTime*.4); normal = normalize(normal);');};}
 const mixer=new THREE.AnimationMixer(world);gltf.animations.forEach(a=>mixer.clipAction(a).play());let elapsed=0,last=performance.now(),transition=null,night=false,selected=null,viewMode='overview';const detailInitial=$('detail').innerHTML;
 function overview(){const d=100*Math.max(1,1.35/camera.aspect);return new THREE.Vector3(20,65,58).normalize().multiplyScalar(d);}
 function move(pos,target){transition={start:performance.now(),from:camera.position.clone(),to:pos.clone(),a:controls.target.clone(),b:target.clone()};}
 function resize(){camera.aspect=host.clientWidth/host.clientHeight;camera.updateProjectionMatrix();renderer.setSize(host.clientWidth,host.clientHeight);if(viewMode==='overview'){camera.position.copy(overview());controls.target.set(0,0,0);}}
 new ResizeObserver(resize).observe(host);resize();
 function choose(t){viewMode='town';selected=t.id;$('town').value=t.id;const target=new THREE.Vector3(t.x,t.z,-t.y);move(target.clone().add(new THREE.Vector3(3,6,8)),target);showPlace(t);}
 const markers=TOWNS.map(t=>{const el=document.createElement('button');el.className='marker'+(t.kind==='capital'?' capital':'');el.textContent=t.name;el.title=t.role+' · '+t.country;el.onclick=()=>choose(t);$('markers').append(el);const opt=document.createElement('option');opt.value=t.id;opt.textContent=t.name;$('town').append(opt);return {t,el,p:new THREE.Vector3(t.x,t.z+1.1,-t.y)};});
 $('town').onchange=e=>{const t=TOWNS.find(t=>t.id===e.target.value);if(t)choose(t);};
 $('search').oninput=e=>{const q=e.target.value.toLocaleLowerCase('ru').trim();$('results').replaceChildren();if(!q)return;for(const t of TOWNS.filter(t=>(t.name+' '+t.country).toLocaleLowerCase('ru').includes(q))){const b=document.createElement('button');b.textContent=t.name;b.onclick=()=>{choose(t);$('results').replaceChildren();$('search').value='';};$('results').append(b);}if(!$('results').children.length)$('results').textContent='Поселение не найдено';};
 $('overview').onclick=()=>{viewMode='overview';selected=null;$('town').value='';showPlace(null);$('detail').innerHTML=detailInitial;move(overview(),new THREE.Vector3(0,0,0));};
 $('top').onclick=()=>{viewMode='top';move(new THREE.Vector3(0,Math.max(80,110/camera.aspect),.001),new THREE.Vector3(0,0,0));};
 $('strait').onclick=()=>{viewMode='strait';move(new THREE.Vector3(0,28,27),new THREE.Vector3(0,.1,0));};
 $('labels').onchange=e=>$('markers').hidden=!e.target.checked;
 $('forests').onchange=e=>forests.forEach(o=>o.visible=e.target.checked);
 $('roads').onchange=e=>roads.forEach(o=>o.visible=e.target.checked);
 $('motion').checked=!matchMedia('(prefers-reduced-motion: reduce)').matches;
 $('night').onclick=()=>{night=!night;scene.background.set(night?'#162a3a':'#bfc9c6');floor.material.color.set(night?'#162a3a':'#bfc9c6');hemi.intensity=night?.65:2;sun.intensity=night?1.1:3.1;sun.color.set(night?'#8daede':'#ffebc6');$('night').textContent=night?'Дневной свет':'Сумерки';$('night').setAttribute('aria-pressed',String(night));};
 $('capture').onclick=()=>{renderer.render(scene,camera);const a=document.createElement('a');a.download='Матен-3D.png';a.href=renderer.domElement.toDataURL('image/png');a.click();};
 controls.addEventListener('start',()=>{transition=null;viewMode='free';});
 function frame(now){requestAnimationFrame(frame);if(document.hidden){last=now;return;}const dt=Math.min(.05,(now-last)/1000);last=now;if($('motion').checked){elapsed+=dt;mixer.update(dt);uniforms.time.value=elapsed;}
  if(transition){const t=Math.min(1,(now-transition.start)/900),e=t*t*(3-2*t);camera.position.lerpVectors(transition.from,transition.to,e);controls.target.lerpVectors(transition.a,transition.b,e);if(t===1)transition=null;}
  controls.update();renderer.render(scene,camera);
  const close=camera.position.distanceTo(controls.target)<35;const placed=[];
  for(const {t,el,p} of [...markers].sort((a,b)=>(b.t.id===selected?3:b.t.kind==='capital'?1:0)-(a.t.id===selected?3:a.t.kind==='capital'?1:0))){const q=p.clone().project(camera),x=(q.x*.5+.5)*host.clientWidth,y=(-q.y*.5+.5)*host.clientHeight;let visible=q.z<1&&q.z>-1&&Math.abs(q.x)<.98&&Math.abs(q.y)<.98;if(visible&&!close&&t.id!==selected&&placed.some(([xx,yy])=>Math.abs(xx-x)<94&&Math.abs(yy-y)<24))visible=false;if(visible)placed.push([x,y]);el.style.left=x+'px';el.style.top=y+'px';el.style.visibility=visible?'visible':'hidden';el.classList.toggle('selected',selected===t.id);}
  const dir=camera.position.clone().sub(controls.target);$('compass').style.transform=`rotate(${-Math.atan2(dir.x,dir.z)*180/Math.PI}deg)`;
 }
 requestAnimationFrame(frame);$('loading').remove();$('status').textContent='МАТЕН · ПОЛНАЯ СЦЕНА · 25 ПОСЕЛЕНИЙ';Object.assign(host.dataset,{ready:'true',roadCount:String(roads.length),forestCount:String(forests.length),settlementCount:String(markers.length)});window.maten={ready:true,renderer,scene,camera,controls,world,markers,roads,forests,gltf};
}catch(e){console.error(e);$('loading').replaceChildren();const message=document.createElement('p');message.textContent='Не удалось загрузить 3D. Попробуйте обновить страницу или открыть карту в браузере с поддержкой WebGL 2.';const fallback=document.createElement('a');fallback.href='./overview.png';fallback.target='_blank';fallback.textContent='Открыть обычную карту ↗';$('loading').append(message,fallback);$('status').textContent='ОШИБКА ЗАГРУЗКИ';}

