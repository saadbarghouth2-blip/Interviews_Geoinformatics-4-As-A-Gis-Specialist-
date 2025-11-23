// ==============================
// Enhanced GeoInformatics UI Script
// ==============================
document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const toggleBtn = document.getElementById('toggle-mode');
  const loading = document.getElementById('loading');
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');
  const parallaxEls = document.querySelectorAll('.parallax');
  const tiltEls = document.querySelectorAll('[data-tilt]');
  const fadeInEls = document.querySelectorAll('.fade-in');
  const footer = document.querySelector('footer');

  // ==========================
  // Footer year auto-update
  // ==========================
  const year = new Date().getFullYear();
  if (footer) footer.innerHTML += ` • ${year}`;

  // ==========================
  // Loading overlay
  // ==========================
  function hideLoading() {
    loading.classList.add('hidden');
    setTimeout(() => loading.style.display = 'none', 600);
  }
  window.addEventListener('load', () => setTimeout(hideLoading, 300));
  setTimeout(hideLoading, 6000);

  // ==========================
  // Mode toggle (Glass <-> Blue)
  // ==========================
  function applyMode(mode) {
    if(mode === 'glass') {
      body.setAttribute('data-mode','glass');
      toggleBtn.textContent = 'Switch to Blue Mode';
    } else {
      body.removeAttribute('data-mode');
      toggleBtn.textContent = 'Switch to Glass Mode';
    }
    localStorage.setItem('site-mode', mode);
  }
  const savedMode = localStorage.getItem('site-mode') || 'blue';
  applyMode(savedMode);

  toggleBtn.addEventListener('click', () => {
    const current = body.getAttribute('data-mode')==='glass'?'blue':'glass';
    applyMode(current);
  });

  // ==========================
  // Particles
  // ==========================
  let w = canvas.width = window.innerWidth;
  let h = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => { w=canvas.width=window.innerWidth; h=canvas.height=window.innerHeight; initParticles(); });

  const particles = [];
  let PARTICLE_COUNT = Math.floor((w*h)/90000)+30;

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random()*w;
      this.y = Math.random()*h;
      this.vx = (Math.random()-0.5)*0.35;
      this.vy = (Math.random()-0.5)*0.35;
      this.size = 0.8 + Math.random()*2.2;
      this.alpha = 0.15 + Math.random()*0.5;
      this.hue = 230 + Math.random()*80; // Purple-blue range
    }
    step() {
      this.x += this.vx; this.y += this.vy;
      if(this.x<-20||this.x>w+20||this.y<-20||this.y>h+20) this.reset();
    }
    draw(ctx){
      const gradient = ctx.createRadialGradient(this.x,this.y,0,this.x,this.y,this.size*6);
      gradient.addColorStop(0, `hsla(${this.hue},90%,65%,${this.alpha})`);
      gradient.addColorStop(0.3, `hsla(${this.hue},85%,55%,${this.alpha*0.45})`);
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(this.x,this.y,this.size,0,Math.PI*2);
      ctx.fill();
    }
  }

  function initParticles(){
    particles.length=0;
    PARTICLE_COUNT = Math.floor((w*h)/90000)+30;
    for(let i=0;i<PARTICLE_COUNT;i++) particles.push(new Particle());
  }
  initParticles();

  function drawParticles(){
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle = (body.getAttribute('data-mode')==='glass')? 'rgba(8,12,20,0.02)':'rgba(4,8,16,0.01)';
    ctx.fillRect(0,0,w,h);

    // Draw particles
    for(let p of particles){ p.step(); p.draw(ctx); }

    // Connect particles
    for(let i=0;i<particles.length;i++){
      for(let j=i+1;j<particles.length;j++){
        const a=particles[i], b=particles[j];
        const dx=a.x-b.x, dy=a.y-b.y;
        const dist=Math.hypot(dx,dy);
        if(dist<120){
          ctx.globalAlpha=Math.max(0,0.12-(dist/120)*0.11);
          ctx.strokeStyle='rgba(200,220,255,0.7)';
          ctx.lineWidth=0.6;
          ctx.beginPath();
          ctx.moveTo(a.x,a.y);
          ctx.lineTo(b.x,b.y);
          ctx.stroke();
          ctx.globalAlpha=1;
        }
      }
    }
    requestAnimationFrame(drawParticles);
  }
  drawParticles();

  // ==========================
  // Smooth Parallax + Mouse Tilt
  // ==========================
  let mouseX=0, mouseY=0, currX=0, currY=0;
  const speed=0.05;

  window.addEventListener('mousemove',(e)=>{
    mouseX=(e.clientX/window.innerWidth-0.5)*2;
    mouseY=(e.clientY/window.innerHeight-0.5)*2;
  });

  function animateParallax(){
    currX+=(mouseX-currX)*speed;
    currY+=(mouseY-currY)*speed;
    parallaxEls.forEach(el=>{
      const depth=parseFloat(el.getAttribute('data-depth'))||0.03;
      const moveX=currX*depth*50;
      const moveY=currY*depth*50;
      el.style.transform=`translate3d(${moveX}px, ${moveY}px, 0)`;
    });
    requestAnimationFrame(animateParallax);
  }
  animateParallax();

  // Scroll Parallax
  window.addEventListener('scroll',()=>{
    const scrolled = window.scrollY;
    parallaxEls.forEach(el=>{
      const depth = parseFloat(el.getAttribute('data-depth')||'0.03');
      el.style.transform += ` translateY(${scrolled*depth*-0.5}px)`;
    });
  });

  // Tilt effect
  tiltEls.forEach(el=>{
    el.addEventListener('mousemove',(e)=>{
      const rect=el.getBoundingClientRect();
      const px=(e.clientX-rect.left)/rect.width;
      const py=(e.clientY-rect.top)/rect.height;
      const rotateY=(px-0.5)*18;
      const rotateX=(0.5-py)*10;
      el.style.transform=`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(4px)`;
      el.style.boxShadow=`0 ${Math.abs(rotateX)*0.9}px ${20+Math.abs(rotateY)}px rgba(2,6,23,0.12)`;
    });
    el.addEventListener('mouseleave',()=>{ el.style.transform=''; el.style.boxShadow=''; });
  });

  // ==========================
  // Fade-in IntersectionObserver
  // ==========================
  const obs = new IntersectionObserver((entries, observer)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){ entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    });
  },{threshold:0.12});
  fadeInEls.forEach(el=>obs.observe(el));

  // ==========================
  // Accessibility / Performance
  // ==========================
  toggleBtn.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); toggleBtn.click(); }});
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden) particles.forEach(p=>{p._vx=p.vx; p._vy=p.vy; p.vx=p.vy=0;});
    else particles.forEach(p=>{ if(p._vx!==undefined){p.vx=p._vx; p.vy=p._vy;} });
  });

});
