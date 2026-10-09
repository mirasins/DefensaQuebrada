const button=document.querySelector('.menu');
const nav=document.querySelector('#nav');
button.addEventListener('click',()=>{const open=button.getAttribute('aria-expanded')!=='true';button.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open);});
nav.addEventListener('click',event=>{if(event.target.closest('a')){button.setAttribute('aria-expanded','false');nav.classList.remove('open');}});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&nav.classList.contains('open')){button.setAttribute('aria-expanded','false');nav.classList.remove('open');button.focus();}});

// Subtle botanical movement; all ornaments stay out of the reading and focus order.
const motionPreference=window.matchMedia('(prefers-reduced-motion: reduce)');
let motionPaused=motionPreference.matches;
try{const saved=localStorage.getItem('quebrada-motion');if(saved!==null)motionPaused=saved==='paused'||motionPreference.matches;}catch{}
document.body.dataset.motion=motionPaused?'paused':'active';
const motionControl=document.createElement('button');
motionControl.type='button';
motionControl.className='motion-control';
function updateMotionControl(){
  motionControl.textContent=motionPaused?'Reanudar animación':'Pausar animación';
  motionControl.setAttribute('aria-pressed',String(motionPaused));
  document.body.dataset.motion=motionPaused?'paused':'active';
}
motionControl.addEventListener('click',()=>{
  motionPaused=!motionPaused;
  updateMotionControl();
  try{localStorage.setItem('quebrada-motion',motionPaused?'paused':'active');}catch{}
});
updateMotionControl();
document.body.append(motionControl);
motionPreference.addEventListener('change',event=>{if(event.matches){motionPaused=true;updateMotionControl();}});

function addLeaves(section,dry=false){
  if(!section)return;
  section.classList.add('botanical-section');
  const layer=document.createElement('div');
  layer.className=`botanical-layer ${dry?'dry-leaves':'green-leaves'}`;
  layer.setAttribute('aria-hidden','true');
  const positions=dry?[[3,12,38],[90,8,65],[95,48,45],[5,75,55],[81,88,37],[51,94,28]]:[[5,8,32],[84,9,47],[92,60,33],[57,82,29],[26,94,41],[75,40,24]];
  positions.forEach(([left,top,size],index)=>{
    const leaf=document.createElement('span');
    leaf.className='floating-leaf';
    leaf.style.cssText=`--leaf-x:${left}%;--leaf-y:${top}%;--leaf-size:${size}px;--leaf-angle:${index*39-60}deg;--leaf-duration:${16+index*3}s;--leaf-delay:${-index*4}s;`;
    leaf.innerHTML='<svg viewBox="0 0 64 96" focusable="false" aria-hidden="true"><path class="leaf-shape" d="M32 4C7 21-4 47 9 66c8 13 24 18 37 7C63 58 59 29 32 4Z"/><path class="leaf-vein" d="M32 13c-4 27-7 46-4 76m2-30L14 43m17 4 16-18m-19 38 16-13" fill="none" stroke-linecap="round"/></svg>';
    layer.append(leaf);
  });
  section.prepend(layer);
}
addLeaves(document.querySelector('.hero-copy'));
addLeaves(document.querySelector('.dossier-hero'));
addLeaves(document.querySelector('#preocupaciones'),true);

if('IntersectionObserver' in window&&!motionPaused&&!motionPreference.matches){
  const revealObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');revealObserver.unobserve(entry.target);}});
  },{threshold:0.08});
  document.querySelectorAll('.section-top,.split>div,.principles article,.participation>div,.concerns article,.alternative>div,.data-strip,.status,.pdf-card,.timeline li').forEach((element,index)=>{
    element.classList.add('motion-reveal');
    element.style.setProperty('--reveal-delay',`${index%3*65}ms`);
    revealObserver.observe(element);
  });
}
// Complete pending reveals when animations are paused, including off-screen text.
motionControl.addEventListener('click',()=>{if(motionPaused)document.querySelectorAll('.motion-reveal').forEach(element=>element.classList.add('is-visible'));});

const ambientVideos=[...document.querySelectorAll('.ambient-video')];
const visibleVideos=new Set();
function syncAmbientVideo(){
  ambientVideos.forEach(video=>{
    const shouldPlay=!motionPaused&&!motionPreference.matches&&!document.hidden&&visibleVideos.has(video);
    if(shouldPlay){video.muted=true;const playing=video.play();if(playing)playing.catch(()=>video.closest('figure')?.classList.remove('video-playing'));}
    else video.pause();
  });
}
ambientVideos.forEach(video=>{
  video.addEventListener('playing',()=>video.closest('figure')?.classList.add('video-playing'));
  video.addEventListener('error',()=>video.closest('figure')?.classList.remove('video-playing'));
});
if('IntersectionObserver' in window){
  const videoObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting)visibleVideos.add(entry.target);else visibleVideos.delete(entry.target);});syncAmbientVideo();},{threshold:0.1});
  ambientVideos.forEach(video=>videoObserver.observe(video));
}else{ambientVideos.forEach(video=>visibleVideos.add(video));syncAmbientVideo();}
motionControl.addEventListener('click',syncAmbientVideo);
motionPreference.addEventListener('change',syncAmbientVideo);
document.addEventListener('visibilitychange',syncAmbientVideo);
