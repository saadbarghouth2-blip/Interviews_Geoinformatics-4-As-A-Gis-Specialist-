// Enhanced UI script
// - Particles on canvas
// - 3D tilt (mousemove)
// - Parallax stronger on scroll/mouse with smooth motion
// - Mode toggle (Blue <-> Glass) with smooth transition
// - Loading animation management
// - Smooth fade-in + parallax for cards and footer

document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const toggleBtn = document.getElementById('toggle-mode');
  const loading = document.getElementById('loading');
  const particlesCanvas = document.getElementById('particles-canvas');
  const ctx = particlesCanvas.getContext('2d');
  const parallaxEls = document.querySelectorAll('.parallax');
  const tiltTargets = document.querySelectorAll('[data-tilt]');
  const fadeInElements = document.querySelectorAll('.fade-in');
  const footer = document.querySelector('footer');

  // Footer year
  const year = new Date().getFullYear();
  if (footer) footer.innerHTML = footer.innerHTML + ` • ${year}`;

  // Loading
  function hideLoading() { 
    loading.classList.add('hidden'); 
    setTimeout(() => loading.style.display = 'none', 600);
  }
  window.addEventListener('load', () => setTimeout(hideLoading, 300));
  setTimeout(hideLoading, 6000);

  // Mode toggle
  function setModeGlass(glass) {
    if (glass) {
      body.setAttribute('data-mode','glass');
      toggleBtn.textContent='Switch to Blue Mode';
      toggleBtn.setAttribute('aria-pressed','true');
    } else {
      body.removeAttribute('data-mode');
      toggleBtn.textContent='Switch to Glass Mode';
      toggleBtn.setAttribute('aria-pressed','false');
    }
    document.documentElement.style.transition='background 420ms ease';
    setTimeout(()=>document.documentElement.style.transition='',440);
  }
  toggleBtn.addEventListener('click', ()=>{ 
    const isGlass = body.getAttribute('data-mode')==='glass';
    setModeGlass(!isGlass);
    localStorage.setItem('site-mode', (!isGlass)?'glass':'blue');
  });

  // apply saved mode
  const saved = localStorage.getItem('site-mode');
  if (saved==='glass') setModeGlass(true);

  // Particles setup
  let w = particlesCanvas.width = innerWidth;
  let h = particlesCanvas.height = innerHeight;
  window.addEventListener('resize', ()=>{ 
    w = particlesCanvas.width = innerWidth; 
    h = particlesCanvas.height = innerHeight; 
    initParticles(); 
  });

  const particles = [];
  let PARTICLE_COUNT = Math.floor((w*h)/90000)+30;

  class Particle { 
    constructor(){ this.reset(); }
    reset(){ 
      this.x=Math.random()*w; this.y=Math.random()*h; 
      this.vx=(Math.random()-0.5)*0.35; this.vy=(Math.random()-0.5)*0.35; 
      this.size=0.8+Math.random()*2.2; this.alpha=0.18+Math.random()*0.5; 
    }
    step(){ 
      this.x+=this.vx; this.y+=this.vy; 
      if (this.x<-10||this.x>w+10||this.y<-10||this.y>h+10) this.reset(); 
    }
    draw(ctx){ 
      ctx.beginPath(); 
      ctx.globalAlpha=this.alpha; 
      ctx.fillStyle='rgba(255,255,255,0.95)'; 
      ctx.arc(this.x,this.y,this.size,0,Math.PI*2); 
      ctx.fill(); 
      ctx.globalAlpha=1; 
    }
  }

  function initParticles(){ 
    particles.length=0; 
    PARTICLE_COUNT = Math.floor((w*h)/90000)+30; 
    for (let i=0;i<PARTICLE_COUNT;i++) particles.push(new Particle()); 
  }
  initParticles();

  function draw(){ 
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle = (document.body.getAttribute('data-mode')==='glass')? 'rgba(8,12,20,0.02)':'rgba(4,8,16,0.01)';
    ctx.fillRect(0,0,w,h);
    for (let p of particles){ p.step(); p.draw(ctx); }
    // connect
    for (let i=0;i<particles.length;i++){
      for (let j=i+1;j<particles.length;j++){ 
        const a=particles[i], b=particles[j]; 
        const dx=a.x-b.x, dy=a.y-b.y; 
        const dist=Math.hypot(dx,dy); 
        if (dist<110){ 
          ctx.globalAlpha=Math.max(0,0.12-(dist/110)*0.11); 
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
    requestAnimationFrame(draw);
  }
  draw();

  // Smooth Parallax + Fade-in
  let mouseX=0, mouseY=0, currentX=0, currentY=0;
  const speed = 0.05; // smoothing speed

  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  fadeInElements.forEach(el => el.classList.remove('visible')); // hide before fade
  window.addEventListener('DOMContentLoaded', () => {
    fadeInElements.forEach(el => el.classList.add('visible'));
  });

  function animateParallax() {
    currentX += (mouseX - currentX) * speed;
    currentY += (mouseY - currentY) * speed;
    parallaxEls.forEach(el => {
      const depth = parseFloat(el.getAttribute('data-depth')) || 0.03;
      const moveX = currentX * depth * 50;
      const moveY = currentY * depth * 50;
      el.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
    });
    requestAnimationFrame(animateParallax);
  }
  animateParallax();

  // Scroll Parallax
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    parallaxEls.forEach(el => {
      const depth = parseFloat(el.getAttribute('data-depth')||'0.03');
      el.style.transform += ` translateY(${scrolled*depth*-0.5}px)`;
    });
  });

  // 3D tilt effect (header + any element with data-tilt)
  tiltTargets.forEach(target => {
    target.addEventListener('mousemove', (e) => {
      const rect=target.getBoundingClientRect();
      const w=rect.width, h=rect.height;
      const px=(e.clientX-rect.left)/w;
      const py=(e.clientY-rect.top)/h;
      const rotateY=(px-0.5)*18;
      const rotateX=(0.5-py)*10;
      const translateZ=4;
      target.style.transform=`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${translateZ}px)`;
      target.style.boxShadow=`0 ${Math.abs(rotateX)*0.9}px ${20+Math.abs(rotateY)}px rgba(2,6,23,0.12)`;
    });
    target.addEventListener('mouseleave', ()=>{ 
      target.style.transform=''; 
      target.style.boxShadow=''; 
    });
  });

  // IntersectionObserver fade-in for elements not yet in view
  const obs = new IntersectionObserver((entries, ob) => { 
    entries.forEach(entry => { 
      if (entry.isIntersecting){ 
        entry.target.classList.add('visible'); 
        ob.unobserve(entry.target); 
      } 
    }); 
  }, { threshold:0.12 });
  fadeInElements.forEach(el => obs.observe(el));

  // Accessibility keyboard toggle
  toggleBtn.addEventListener('keydown', (e) => { 
    if (e.key==='Enter'||e.key===' '){ 
      e.preventDefault(); 
      toggleBtn.click(); 
    } 
  });

  // Performance pause when hidden
  document.addEventListener('visibilitychange', () => { 
    if (document.hidden) particles.forEach(p=>{ p._savedVx=p.vx; p._savedVy=p.vy; p.vx=p.vy=0; }); 
    else particles.forEach(p=>{ if (p._savedVx!==undefined){ p.vx=p._savedVx; p.vy=p._savedVy; } }); 
  });
});
