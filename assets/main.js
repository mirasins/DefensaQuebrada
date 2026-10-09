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

// Header that compacts after the first scroll.
const syncHeader=()=>document.body.classList.toggle('scrolled',window.scrollY>40);
syncHeader();
window.addEventListener('scroll',syncHeader,{passive:true});

const motionAllowed=()=>!motionPaused&&!motionPreference.matches;

// Statement band as a continuous marquee; duplicates are hidden from assistive tech.
const statement=document.querySelector('.statement');
if(statement){
  const originals=[...statement.children];
  const track=document.createElement('div');
  track.className='marquee-track';
  const separator=()=>{const s=document.createElement('span');s.setAttribute('aria-hidden','true');s.textContent='✳';return s;};
  originals.forEach(item=>track.append(item));
  track.append(separator());
  for(let copy=0;copy<5;copy++){
    originals.forEach(item=>{const clone=item.cloneNode(true);clone.setAttribute('aria-hidden','true');track.append(clone);});
    track.append(separator());
  }
  statement.classList.add('marquee');
  statement.append(track);
}

// Staggered entrance for the opening section of each page.
if(motionAllowed()){
  const intro=document.querySelector('.hero-copy,.dossier-hero');
  if(intro){
    [...intro.children].filter(el=>!el.classList.contains('botanical-layer')).forEach((el,index)=>{
      el.classList.add('intro-anim');
      el.style.setProperty('--intro-delay',`${120+index*130}ms`);
    });
  }
  document.querySelector('.hero-image')?.classList.add('intro-anim');
}

// Hand-drawn underline below the main handwritten titles.
function addScribble(heading){
  if(!heading)return;
  const ns='http://www.w3.org/2000/svg';
  const svg=document.createElementNS(ns,'svg');
  svg.setAttribute('class','scribble');
  svg.setAttribute('viewBox','0 0 380 20');
  svg.setAttribute('preserveAspectRatio','none');
  svg.setAttribute('aria-hidden','true');
  const path=document.createElementNS(ns,'path');
  path.setAttribute('d','M4 13 C 60 4, 118 18, 184 10 S 300 3, 376 12');
  svg.append(path);
  heading.after(svg);
  svg.style.setProperty('--len',Math.ceil(path.getTotalLength()+2));
}
addScribble(document.querySelector('.hero h1'));
addScribble(document.querySelector('.dossier-hero h1'));

// Decorative mountain ridge above the footer.
const footer=document.querySelector('body>footer');
let ridge=null;
if(footer){
  const ns='http://www.w3.org/2000/svg';
  ridge=document.createElementNS(ns,'svg');
  ridge.setAttribute('class','ridge-divider');
  ridge.setAttribute('viewBox','0 0 1440 80');
  ridge.setAttribute('preserveAspectRatio','none');
  ridge.setAttribute('aria-hidden','true');
  const line='M0 58 L90 40 L160 52 L260 18 L330 36 L420 10 L520 44 L600 30 L700 52 L800 22 L880 34 L980 6 L1080 40 L1160 28 L1260 50 L1350 30 L1440 46';
  ridge.innerHTML=`<path class="ridge-fill" d="${line} L1440 80 L0 80Z"/><path class="ridge-line" d="${line}"/>`;
  footer.before(ridge);
  const ridgeLine=ridge.querySelector('.ridge-line');
  ridge.style.setProperty('--len',Math.ceil(ridgeLine.getTotalLength()+2));
}

// Animated counters for key figures (single numbers only, never ranges).
const counters=[];
document.querySelectorAll('.data-strip strong,.feature-data strong').forEach(el=>{
  const node=[...el.childNodes].find(n=>n.nodeType===3&&/\d/.test(n.textContent));
  if(!node)return;
  const match=node.textContent.match(/^(\D*?)(\d{1,3}(?:\.\d{3})*(?:,\d+)?)(\D*)$/);
  if(!match)return;
  const decimals=(match[2].split(',')[1]||'').length;
  const target=parseFloat(match[2].replace(/\./g,'').replace(',','.'));
  counters.push({el,node,prefix:match[1],suffix:match[3],decimals,target,final:node.textContent});
});
const formatNumber=(value,decimals)=>value.toLocaleString('es-CL',{minimumFractionDigits:decimals,maximumFractionDigits:decimals});
function runCounter(counter){
  if(counter.done)return;
  counter.done=true;
  if(!motionAllowed()){counter.node.textContent=counter.final;return;}
  const start=performance.now(),duration=1700;
  const step=now=>{
    if(!motionAllowed()){counter.node.textContent=counter.final;return;}
    const t=Math.min(1,(now-start)/duration),eased=1-Math.pow(1-t,3);
    counter.node.textContent=t<1?counter.prefix+formatNumber(counter.target*eased,counter.decimals)+counter.suffix:counter.final;
    if(t<1)requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// Scroll reveals for handwritten titles, images, counters and the ridge.
const inkTargets=new Map();
if('IntersectionObserver' in window&&motionAllowed()){
  const inkObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      (inkTargets.get(entry.target)||[entry.target]).forEach(el=>el.classList.add('is-visible'));
      const counter=counters.find(c=>c.el===entry.target);
      if(counter)runCounter(counter);
      inkObserver.unobserve(entry.target);
    });
  },{threshold:0.15});
  // Clipped titles have no visible area, so their parent is observed instead.
  document.querySelectorAll('main h2').forEach(el=>{
    el.classList.add('ink');
    const parent=el.parentElement;
    if(!inkTargets.has(parent))inkTargets.set(parent,[]);
    inkTargets.get(parent).push(el);
    inkObserver.observe(parent);
  });
  document.querySelectorAll('.gallery-grid figure,.map-pair figure,.alternative figure,.example-figure').forEach((el,index)=>{
    el.classList.add('img-reveal');
    el.style.setProperty('--reveal-delay',`${index%3*110}ms`);
    inkObserver.observe(el);
  });
  counters.forEach(c=>{c.node.textContent=c.prefix+formatNumber(0,c.decimals)+c.suffix;inkObserver.observe(c.el);});
  if(ridge)inkObserver.observe(ridge);
}
motionControl.addEventListener('click',()=>{
  if(!motionPaused)return;
  document.querySelectorAll('.ink,.img-reveal,.ridge-divider').forEach(el=>el.classList.add('is-visible'));
  counters.forEach(c=>{c.done=true;c.node.textContent=c.final;});
});

// Gentle parallax on large photographs.
const parallaxItems=[...document.querySelectorAll('.hero-image img,.hero-image video,.alternative img')];
parallaxItems.forEach(el=>el.classList.add('parallax'));
let parallaxQueued=false;
function updateParallax(){
  parallaxQueued=false;
  if(!motionAllowed()){parallaxItems.forEach(el=>el.style.transform='');return;}
  const viewport=window.innerHeight;
  parallaxItems.forEach(el=>{
    const box=el.parentElement.getBoundingClientRect();
    if(box.bottom<0||box.top>viewport)return;
    const progress=(box.top+box.height/2-viewport/2)/viewport;
    el.style.transform=`translate3d(0,${(progress*-38).toFixed(1)}px,0) scale(1.1)`;
  });
}
const queueParallax=()=>{if(!parallaxQueued){parallaxQueued=true;requestAnimationFrame(updateParallax);}};
window.addEventListener('scroll',queueParallax,{passive:true});
window.addEventListener('resize',queueParallax);
motionControl.addEventListener('click',queueParallax);
queueParallax();

// Document filters on the archive page.
const filterButtons=[...document.querySelectorAll('.filters button')];
filterButtons.forEach(button=>button.addEventListener('click',()=>{
  const filter=button.dataset.filter;
  filterButtons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  document.querySelectorAll('.doc-card').forEach(card=>{card.hidden=filter!=='todos'&&card.dataset.type!==filter;});
}));

// Fixed Andes dawn background; the sun keeps rising slowly as the page scrolls.
const andes=document.createElement('div');
andes.className='andes-bg';
andes.setAttribute('aria-hidden','true');
andes.innerHTML=`<svg viewBox="0 0 1440 420" preserveAspectRatio="xMidYMax slice" focusable="false">
<defs><radialGradient id="sun-glow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffd58a" stop-opacity=".9"/><stop offset=".45" stop-color="#ffc677" stop-opacity=".35"/><stop offset="1" stop-color="#ffc677" stop-opacity="0"/></radialGradient></defs>
<g class="andes-sun-wrap"><circle class="andes-sun-glow" cx="135" cy="214" r="200" fill="url(#sun-glow)"/><circle class="andes-sun" cx="135" cy="214" r="54" fill="#f8b75a"/></g>
<path class="andes-far" d="M0 250 L70 214 L130 232 L210 168 L265 196 L340 120 L400 170 L470 140 L540 196 L610 150 L690 92 L760 160 L820 128 L900 186 L970 132 L1050 70 L1120 150 L1190 118 L1260 176 L1330 130 L1440 190 L1440 420 L0 420Z"/>
<path class="andes-snow" d="M340 120 L322 144 L336 139 L345 150 L356 140 L366 146Z M690 92 L668 120 L684 114 L694 126 L706 113 L718 122Z M1050 70 L1026 100 L1043 94 L1054 108 L1066 95 L1080 104Z M470 140 L457 156 L468 152 L476 160 L485 151Z M1190 118 L1176 136 L1188 132 L1196 141 L1205 131Z"/>
<path class="andes-mid" d="M0 300 L90 250 L160 276 L250 220 L330 262 L420 214 L500 258 L590 230 L680 270 L770 222 L860 262 L950 236 L1040 276 L1130 226 L1220 260 L1320 232 L1440 268 L1440 420 L0 420Z"/>
<path class="andes-near" d="M0 350 L110 312 L220 336 L340 298 L460 334 L580 306 L700 340 L820 312 L940 344 L1060 314 L1180 340 L1300 318 L1440 342 L1440 420 L0 420Z"/>
<path class="andes-front" d="M0 392 C 180 370 320 384 480 378 S 800 366 960 380 S 1260 372 1440 384 L1440 420 L0 420Z"/>
</svg>`;
document.body.prepend(andes);
// On narrow screens keep the left side (where the sun rises) in frame.
const andesSvg=andes.querySelector('svg');
const narrowQuery=window.matchMedia('(max-width:700px)');
const frameAndes=()=>andesSvg.setAttribute('preserveAspectRatio',narrowQuery.matches?'xMinYMax slice':'xMidYMax slice');
frameAndes();
narrowQuery.addEventListener('change',frameAndes);
const sunWrap=andes.querySelector('.andes-sun-wrap');
let sunQueued=false;
function updateSun(){
  sunQueued=false;
  if(!motionAllowed()){sunWrap.style.transform='';return;}
  const max=Math.max(1,document.documentElement.scrollHeight-window.innerHeight);
  sunWrap.style.transform=`translateY(${(-70*window.scrollY/max).toFixed(1)}px)`;
}
window.addEventListener('scroll',()=>{if(!sunQueued){sunQueued=true;requestAnimationFrame(updateSun);}},{passive:true});
motionControl.addEventListener('click',updateSun);
updateSun();
