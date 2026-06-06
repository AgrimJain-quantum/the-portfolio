document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Selectors ---
  const body = document.body;
  const navbar = document.getElementById('navbar');
  const cursor = document.getElementById('cursor');
  const ring = document.getElementById('cursor-ring');
  
  const toggleEng = document.getElementById('toggle-eng');
  const toggleCr = document.getElementById('toggle-cr');
  const slider = document.getElementById('mode-slider');
  const creativeBackGateway = document.getElementById('creative-back-gateway');
  
  const heroBtnEng = document.getElementById('hero-btn-eng');
  const heroBtnCr = document.getElementById('hero-btn-cr');
  
  const heroSection = document.getElementById('hero');
  const gatewayContainer = document.querySelector('.hero-gateway');
  const splitLeft = document.getElementById('hero-split-eng');
  const splitRight = document.getElementById('hero-split-cr');
  const heroDivider = document.querySelector('.hero-divider');
  
  const canvas = document.getElementById('canvas-bg');
  const ctx = canvas.getContext('2d');
  
  const reveals = document.querySelectorAll('.reveal');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.project-card');

  // Engineering specific elements
  const engBackGateway = document.getElementById('eng-back-gateway');
  const engSidebar = document.getElementById('eng-sidebar');
  const statusIndicator = document.querySelector('.status-indicator');
  const engSidebarLinks = document.querySelectorAll('.eng-sidebar-menu a');

  // --- State Variables ---
  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;
  let particles = [];
  const particleCount = 45;
  let mouse = { x: null, y: null, radius: 140 };

  // Creative mode floating blob variables
  let creativeBlobs = [];
  const creativeBlobCount = 7;
  
  let targetSplitPct = 50;
  let currentSplitPct = 50;
  let isGatewayActive = true;

  // Matrix Rain Variables
  let drops = [];
  const fontSize = 14;
  let columns = 0;
  const chars = "ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ1234567890MLAIENGINEER";

  // --- Helper Functions ---

  // Custom Cursor Spring Physics
  function updateCursorRing() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    ring.style.left = `${ringX}px`;
    ring.style.top = `${ringY}px`;
    requestAnimationFrame(updateCursorRing);
  }

  // Toggle Slider Positions
  function updateSlider(mode) {
    if (!slider || !toggleCr || !toggleEng) return;
    if (mode === 'creative') {
      slider.style.left = '50%';
      slider.style.width = '48%';
      toggleCr.classList.add('active');
      toggleEng.classList.remove('active');
    } else {
      slider.style.left = '0.25rem';
      slider.style.width = '48%';
      toggleEng.classList.add('active');
      toggleCr.classList.remove('active');
    }
  }

  // Grid Category Filter
  function filterProjects(cat) {
    cards.forEach(card => {
      const cardCats = card.getAttribute('data-cat').split(' ');
      if (cat === 'all' || cardCats.includes(cat)) {
        card.style.display = 'flex';
        setTimeout(() => {
          card.style.opacity = '1';
          card.style.transform = 'scale(1)';
        }, 50);
      } else {
        card.style.opacity = '0';
        card.style.transform = 'scale(0.95)';
        setTimeout(() => {
          card.style.display = 'none';
        }, 200);
      }
    });
  }

  // Preset Filters Based on Theme Mode
  function filterGridByMode(mode) {
    filterBtns.forEach(b => b.classList.remove('active'));
    
    if (mode === 'creative') {
      const reelBtn = document.querySelector('.filter-btn[data-filter="reel"]');
      if (reelBtn) {
        reelBtn.classList.add('active');
        filterProjects('reel');
      }
    } else {
      const mlBtn = document.querySelector('.filter-btn[data-filter="ml"]');
      if (mlBtn) {
        mlBtn.classList.add('active');
        filterProjects('ml');
      }
    }
  }

  // Master Mode Theme Setter
  function setMode(mode) {
    if (mode === 'creative') {
      body.classList.remove('mode-engineering');
      body.classList.add('mode-creative');
      localStorage.setItem('portfolio-mode', 'creative');
      updateSlider('creative');
      filterGridByMode('creative');
    } else {
      body.classList.remove('mode-creative');
      body.classList.add('mode-engineering');
      localStorage.setItem('portfolio-mode', 'engineering');
      updateSlider('engineering');
      filterGridByMode('engineering');
    }
    // Reinitialize canvas dimensions & arrays
    initCanvas();
  }
  // --- Canvas Animation Classes & Logic ---
  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.size = Math.random() * 2.5 + 1;
      this.bokehSize = Math.random() * 60 + 20;
      this.bokehAlpha = Math.random() * 0.08 + 0.02;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
      if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;

      if (mouse.x !== null && mouse.y !== null) {
        let dx = this.x - mouse.x;
        let dy = this.y - mouse.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          let force = (mouse.radius - dist) / mouse.radius;
          let angle = Math.atan2(dy, dx);
          this.x += Math.cos(angle) * force * 1.5;
          this.y += Math.sin(angle) * force * 1.5;
        }
      }
    }

    draw(mode) {
      if (mode === 'engineering') {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 45, 45, 0.45)';
        ctx.shadowBlur = 4;
        ctx.shadowColor = '#ff2d2d';
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
  }

  // Creative Mode — Floating Gradient Blobs
  class CreativeBlob {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.radius = Math.random() * 250 + 150;
      this.vx = (Math.random() - 0.5) * 0.35;
      this.vy = (Math.random() - 0.5) * 0.35;
      this.phase = Math.random() * Math.PI * 2;
      this.pulseSpeed = Math.random() * 0.008 + 0.003;

      // Curated pastel palette
      const palettes = [
        { r: 255, g: 182, b: 147 },  // warm peach
        { r: 180, g: 160, b: 255 },  // soft lavender
        { r: 130, g: 220, b: 210 },  // mint teal
        { r: 255, g: 155, b: 200 },  // blush pink
        { r: 160, g: 200, b: 255 },  // sky blue
        { r: 255, g: 220, b: 130 },  // warm gold
        { r: 200, g: 255, b: 180 },  // spring green
      ];
      this.color = palettes[Math.floor(Math.random() * palettes.length)];
      this.baseAlpha = Math.random() * 0.12 + 0.06;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.phase += this.pulseSpeed;

      // Soft bounce
      if (this.x < -this.radius) this.x = canvas.width + this.radius;
      if (this.x > canvas.width + this.radius) this.x = -this.radius;
      if (this.y < -this.radius) this.y = canvas.height + this.radius;
      if (this.y > canvas.height + this.radius) this.y = -this.radius;
    }

    draw() {
      const pulse = Math.sin(this.phase) * 0.3 + 1;
      const r = this.radius * pulse;
      const alpha = this.baseAlpha * (0.7 + Math.sin(this.phase) * 0.3);

      const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, r);
      const { r: cr, g: cg, b: cb } = this.color;
      grad.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, ${alpha})`);
      grad.addColorStop(0.5, `rgba(${cr}, ${cg}, ${cb}, ${alpha * 0.4})`);
      grad.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, 0)`);

      ctx.beginPath();
      ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }
  }

  function initCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const activeMode = body.classList.contains('mode-creative') ? 'creative' : 'engineering';

    if (isGatewayActive) {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    } else if (activeMode === 'creative') {
      creativeBlobs = [];
      for (let i = 0; i < creativeBlobCount; i++) {
        creativeBlobs.push(new CreativeBlob());
      }
    } else {
      columns = Math.floor(canvas.width / fontSize);
      drops = [];
      for (let i = 0; i < columns; i++) {
        drops[i] = Math.random() * -100; // stagger drops
      }
    }
  }

  function animateCanvas() {
    const activeMode = body.classList.contains('mode-creative') ? 'creative' : 'engineering';
    
    if (isGatewayActive) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw connecting lines between particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          let dx = particles[i].x - particles[j].x;
          let dy = particles[i].y - particles[j].y;
          let dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            let alpha = ((110 - dist) / 110) * 0.14;
            ctx.strokeStyle = `rgba(255, 45, 45, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      particles.forEach(p => {
        p.update();
        p.draw('engineering'); // draw as engineering nodes
      });
    } else if (activeMode === 'engineering') {
      // Fade trail backdrop
      ctx.fillStyle = 'rgba(2, 0, 0, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw matrix chars
      ctx.font = '14px "DM Mono", monospace';
      
      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        
        // Random white glowing character at the leading edge
        if (Math.random() > 0.98) {
          ctx.fillStyle = '#ffffff';
        } else {
          ctx.fillStyle = 'rgba(255, 45, 45, 0.85)';
        }
        
        ctx.fillText(char, x, y);
        
        // Reset drop
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        } else {
          drops[i] += 0.85; // drop speed
        }
      }
    } else {
      // Creative mode — floating gradient blobs
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      creativeBlobs.forEach(b => {
        b.update();
        b.draw();
      });
    }

    requestAnimationFrame(animateCanvas);
  }

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initCanvas();
  }

  // --- Initializers & Listeners ---

  // Mouse move updates
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = `${mouseX}px`;
    cursor.style.top = `${mouseY}px`;
  });

  // Canvas mouse interact coords
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
  });

  // Window listeners
  window.addEventListener('resize', resizeCanvas);
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Run cursor tracking
  updateCursorRing();

  // Run Canvas
  initCanvas();
  animateCanvas();

  // Load Saved Preference
  const savedMode = localStorage.getItem('portfolio-mode') || 'engineering';
  setMode(savedMode);

  // Navbar button toggles
  if (toggleEng) toggleEng.addEventListener('click', () => setMode('engineering'));
  if (toggleCr) toggleCr.addEventListener('click', () => setMode('creative'));
  if (creativeBackGateway) creativeBackGateway.addEventListener('click', showGateway);

  // Gateway Mouse Tracking split line logic
  if (gatewayContainer) {
    gatewayContainer.addEventListener('mousemove', (e) => {
      if (window.innerWidth > 768) {
        const midPoint = window.innerWidth / 2;
        if (e.clientX < midPoint) {
          targetSplitPct = 100;
          gatewayContainer.classList.add('expand-left');
          gatewayContainer.classList.remove('expand-right');
        } else {
          targetSplitPct = 0;
          gatewayContainer.classList.add('expand-right');
          gatewayContainer.classList.remove('expand-left');
        }
      }
    });

    gatewayContainer.addEventListener('mouseleave', () => {
      targetSplitPct = 50;
      gatewayContainer.classList.remove('expand-left', 'expand-right');
    });
  }

  // Real-time animation loop for the divider line (LERP)
  function updateSplitScreen() {
    if (window.innerWidth > 768 && gatewayContainer && heroSection && !heroSection.classList.contains('dismissed')) {
      currentSplitPct += (targetSplitPct - currentSplitPct) * 0.12;
      // Snap to target when very close to eliminate thin remaining strip
      if (Math.abs(targetSplitPct - currentSplitPct) < 0.5) {
        currentSplitPct = targetSplitPct;
      }
      splitLeft.style.width = `${currentSplitPct}%`;
      splitRight.style.width = `${100 - currentSplitPct}%`;
      heroDivider.style.left = `${currentSplitPct}%`;
    }
    requestAnimationFrame(updateSplitScreen);
  }
  updateSplitScreen();

  // Reset scroll to top on refresh if gateway is active
  window.scrollTo(0, 0);

  // Gateway dismissing trigger
  function dismissGateway() {
    isGatewayActive = false;
    heroSection.classList.add('dismissed');
    body.classList.remove('gateway-active');
    
    // Initialize canvas arrays (particles or matrix drops) based on active state and mode
    initCanvas();
    
    heroSection.addEventListener('transitionend', () => {
      heroSection.style.display = 'none';
    }, { once: true });
    
    handleScroll();
  }

  // Restore Gateway Splash
  function showGateway() {
    isGatewayActive = true;
    heroSection.style.display = 'block';
    
    // Restore gateway particle arrays
    initCanvas();
    
    setTimeout(() => {
      heroSection.classList.remove('dismissed');
      body.classList.add('gateway-active');
    }, 50);
    handleScroll();
  }

  if (engBackGateway) {
    engBackGateway.addEventListener('click', showGateway);
  }

  // Hero Intro Split choosing buttons
  if (heroBtnEng && heroBtnCr) {
    heroBtnEng.addEventListener('click', (e) => {
      e.stopPropagation();
      setMode('engineering');
      dismissGateway();
    });
    heroBtnCr.addEventListener('click', (e) => {
      e.stopPropagation();
      setMode('creative');
      dismissGateway();
    });
  }

  // Navbar scroll visibility transitions
  const handleScroll = () => {
    if (isGatewayActive) {
      navbar.classList.remove('visible');
      navbar.classList.remove('scrolled');
      return;
    }
    
    navbar.classList.add('visible');
    
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleScroll);
  handleScroll();

  // Scroll reveal setup
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  reveals.forEach(el => observer.observe(el));

  // Project filter button listeners
  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      const category = e.target.getAttribute('data-filter');
      filterProjects(category);
    });
  });

  // --- Engineering Mode Sidebar & Scroll Spy Operations ---
  
  // Sidebar scroll clicks
  engSidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const targetSection = document.querySelector(targetId);
      
      if (targetSection) {
        // Scroll offset
        const offset = window.innerWidth > 768 ? 80 : 70;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = targetSection.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
        
        // Hide sidebar drawer on mobile
        if (engSidebar) engSidebar.classList.remove('open');
      }
    });
  });

  // Toggle mobile sidebar on crosshair click
  if (statusIndicator) {
    statusIndicator.addEventListener('click', (e) => {
      e.stopPropagation();
      if (engSidebar) {
        engSidebar.classList.toggle('open');
      }
    });
  }

  // Click outside sidebar drawer on mobile closes it
  document.addEventListener('click', (e) => {
    if (engSidebar && engSidebar.classList.contains('open')) {
      if (!engSidebar.contains(e.target) && !e.target.classList.contains('status-indicator')) {
        engSidebar.classList.remove('open');
      }
    }
  });

  // Active section tracker (Scroll Spy)
  const handleScrollSpy = () => {
    const activeMode = body.classList.contains('mode-engineering') ? 'engineering' : 'creative';
    if (activeMode !== 'engineering') return;

    const sections = ['about', 'eng-about-details', 'skills', 'projects', 'contact'];
    const scrollPos = window.scrollY + 130;

    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        const top = el.offsetTop;
        const height = el.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
          // Update active links
          document.querySelectorAll('.eng-sidebar-menu li').forEach(li => li.classList.remove('active'));
          const currentLink = document.querySelector(`.eng-sidebar-menu a[href="#${id}"]`);
          if (currentLink) currentLink.parentElement.classList.add('active');
        }
      }
    });
  };
  window.addEventListener('scroll', handleScrollSpy);
  handleScrollSpy();

  // --- Service Accordion Logic ---
  const accordionItems = document.querySelectorAll('.accordion-item');
  accordionItems.forEach(item => {
    const header = item.querySelector('.accordion-header');
    header.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      // Close all items
      accordionItems.forEach(i => {
        i.classList.remove('active');
        const icon = i.querySelector('.accordion-icon');
        if (icon) icon.textContent = '+';
      });
      
      // Toggle clicked item
      if (!isActive) {
        item.classList.add('active');
        const icon = item.querySelector('.accordion-icon');
        if (icon) icon.textContent = '—';
      }
    });
  });

  // --- Gallery Lightbox Logic ---
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('gallery-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');
  
  let currentImgIndex = 0;
  const galleryPhotos = [
    { src: 'images/photo1.jpg', caption: 'NCC Cadet' },
    { src: 'images/photo2.jpg', caption: 'Keynote Speaker' },
    { src: 'images/photo3.jpg', caption: 'Cultural Walk' },
    { src: 'images/photo4.jpg', caption: 'Salute & Honor' },
    { src: 'images/photo5.jpg', caption: 'Shuttle Perspectivism' },
    { src: 'images/photo6.jpg', caption: 'Stage Intensity' },
    { src: 'images/photo7.jpg', caption: 'Joy Portrait' },
    { src: 'images/photo8.jpg', caption: 'Vocal Capture' },
    { src: 'images/photo9.jpg', caption: 'Portrait Light' },
    { src: 'images/photo10.jpg', caption: 'Vocal Focus' },
    { src: 'images/photo11.jpg', caption: 'Speaker Angle' },
    { src: 'images/photo12.jpg', caption: 'Concert Landscape' },
    { src: 'images/photo13.jpg', caption: 'Elysium Highlights' },
    { src: 'images/photo14.jpg', caption: 'Concert Crowd' },
    { src: 'images/photo15.jpg', caption: 'Committee Group' },
    { src: 'images/photo16.jpg', caption: 'Concert Light Stage' }
  ];

  function showLightbox(index) {
    if (index < 0) index = galleryPhotos.length - 1;
    if (index >= galleryPhotos.length) index = 0;
    
    currentImgIndex = index;
    const photo = galleryPhotos[index];
    
    lightboxImg.src = photo.src;
    lightboxCaption.textContent = photo.caption;
    lightbox.style.display = 'flex';
    body.style.overflow = 'hidden'; // Lock scroll
  }

  function closeLightbox() {
    lightbox.style.display = 'none';
    const isGatewayActiveNow = body.classList.contains('gateway-active');
    if (!isGatewayActiveNow) {
      body.style.overflow = 'auto'; // Restore scroll
    }
  }

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const index = parseInt(item.getAttribute('data-index'), 10);
      showLightbox(index);
    });
  });

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }

  if (lightboxPrev) {
    lightboxPrev.addEventListener('click', () => showLightbox(currentImgIndex - 1));
  }

  if (lightboxNext) {
    lightboxNext.addEventListener('click', () => showLightbox(currentImgIndex + 1));
  }

  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (lightbox && lightbox.style.display === 'flex') {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showLightbox(currentImgIndex - 1);
      if (e.key === 'ArrowRight') showLightbox(currentImgIndex + 1);
    }
  });
});
