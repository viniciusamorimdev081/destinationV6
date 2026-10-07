// ===========================================================
// THAI MARINS - O Código do Destination Wedding
// JavaScript puro (sem frameworks)
// ===========================================================

document.addEventListener('DOMContentLoaded', function () {

  // ===== SMOOTH SCROLL HELPER =====
  function smoothScrollTo(selector, offset) {
    offset = offset || 80;
    var target = document.querySelector(selector);
    if (target) {
      var top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: top, behavior: 'smooth' });
    }
  }

  // ===== NAVIGATION: scroll background change =====
  var navbar = document.getElementById('navbar');
  if (navbar) {
    function handleNavScroll() {
      if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
    window.addEventListener('scroll', handleNavScroll, { passive: true });
    handleNavScroll();
  }

  // ===== NAVIGATION: logo click -> scroll to top =====
  var logoBtn = document.getElementById('logoBtn');
  if (logoBtn) {
    logoBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ===== NAVIGATION: links with data-href -> smooth scroll =====
  var mobileMenu = document.getElementById('mobileMenu');
  var iconMenu = document.getElementById('iconMenu');
  var iconClose = document.getElementById('iconClose');
  var navAnchors = document.querySelectorAll('[data-href]');
  navAnchors.forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var href = link.getAttribute('data-href');
      smoothScrollTo(href, 80);
      // Close mobile menu if open
      if (mobileMenu) mobileMenu.classList.remove('open');
      if (iconMenu) iconMenu.style.display = 'block';
      if (iconClose) iconClose.style.display = 'none';
    });
  });

  // ===== MOBILE MENU TOGGLE =====
  var mobileMenuBtn = document.getElementById('mobileMenuBtn');
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', function () {
      var isOpen = mobileMenu.classList.contains('open');
      if (isOpen) {
        mobileMenu.classList.remove('open');
        if (iconMenu) iconMenu.style.display = 'block';
        if (iconClose) iconClose.style.display = 'none';
      } else {
        mobileMenu.classList.add('open');
        if (iconMenu) iconMenu.style.display = 'none';
        if (iconClose) iconClose.style.display = 'block';
      }
    });
  }

  // ===== HERO FLOATING PARTICLES =====
  var particlesContainer = document.getElementById('particles-container');
  if (particlesContainer) {
    var particleCount = 12;
    for (var i = 0; i < particleCount; i++) {
      var particle = document.createElement('div');
      particle.className = 'particle';
      var left = Math.random() * 100;
      var delay = Math.random() * 8;
      var duration = 6 + Math.random() * 6;
      var size = 2 + Math.random() * 3;

      particle.style.position = 'absolute';
      particle.style.left = left + '%';
      particle.style.animationDelay = delay + 's';
      particle.style.animationDuration = duration + 's';
      particle.style.width = size + 'px';
      particle.style.height = size + 'px';

      particlesContainer.appendChild(particle);
    }
    particlesContainer.style.position = 'absolute';
    particlesContainer.style.top = '0';
    particlesContainer.style.left = '0';
    particlesContainer.style.width = '100%';
    particlesContainer.style.height = '100%';
    particlesContainer.style.pointerEvents = 'none';
    particlesContainer.style.overflow = 'hidden';
  }

  // ===== SCROLL REVEAL (single elements with .reveal) =====
  var revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2, rootMargin: '0px 0px -50px 0px' }
  );

  document.querySelectorAll('.reveal').forEach(function (el) {
    revealObserver.observe(el);
  });

  // ===== STAGGERED REVEAL FOR GRID CONTAINERS =====
  function setupStaggerReveal(containerSelector, cardSelector, threshold, staggerStep) {
    var container = document.querySelector(containerSelector);
    if (!container) return;

    var cards = container.querySelectorAll(cardSelector);

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var children = entry.target.querySelectorAll(cardSelector);
            children.forEach(function (card, i) {
              card.style.transitionDelay = (i * staggerStep) + 's';
              card.classList.add('revealed');
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: threshold || 0.2 }
    );

    observer.observe(container);
  }

  // Para Quem grid
  setupStaggerReveal('#paraquem-grid', '.paraquem-card', 0.2, 0.08);

  // Modulos grid
  setupStaggerReveal('#modulos-grid', '.modulo-card', 0.15, 0.1);

  // Sobre container
  setupStaggerReveal('#sobre-container', '.sobre-reveal', 0.2, 0.1);

  // Bonus: inclusos grid
  setupStaggerReveal('#inclusos-grid', '.incluso-card', 0.2, 0.06);

  // Bonus: bonus grid
  setupStaggerReveal('#bonus-grid', '.bonus-card', 0.2, 0.1);

  // Depoimentos grid
  setupStaggerReveal('#depoimentos-grid', '.depoimento-card', 0.15, 0.1);

  // ===== AREA DE MEMBROS: esteira infinita =====
  // A lista de cards é clonada 2x; a posição é sempre reduzida ao intervalo
  // [0, largura de 1 lista), então o 1º card volta logo após o 10º sem salto.
  // Pausa com mouse em cima, foco ou toque; setas e arrasto movem nos dois sentidos.
  function setupMembrosCarousel(root) {
    var viewport = root.querySelector('.membros-viewport');
    var track = root.querySelector('.membros-track');
    var prevBtn = root.querySelector('.membros-nav-prev');
    var nextBtn = root.querySelector('.membros-nav-next');
    var originals = Array.prototype.slice.call(track.children);
    if (originals.length < 2) return;

    for (var c = 0; c < 2; c++) {
      originals.forEach(function (card) {
        var clone = card.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        track.appendChild(clone);
      });
    }

    root.classList.add('is-marquee');
    viewport.scrollLeft = 0;

    var SPEED = 40;          // px por segundo
    var TOUCH_RESUME = 2500; // ms parado depois de soltar o dedo
    var NAV_RESUME = 3000;   // ms parado depois de clicar numa seta
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var setWidth = 1, step = 1, pos = 0;
    var hovering = false, focused = false, dragging = false;
    var resumeAt = 0, anim = null;
    var dragStartX = 0, dragStartPos = 0, dragPointer = null;
    var running = false, lastTime = null;

    function measure() {
      var cards = track.children;
      setWidth = cards[originals.length].offsetLeft - cards[0].offsetLeft;
      step = cards[1].offsetLeft - cards[0].offsetLeft;
      pos = wrap(pos);
      render();
    }

    function wrap(v) {
      return ((v % setWidth) + setWidth) % setWidth;
    }

    function render() {
      track.style.transform = 'translate3d(' + (-wrap(pos)) + 'px, 0, 0)';
    }

    function tick(now) {
      if (!running) { lastTime = null; return; }
      if (lastTime === null) lastTime = now;
      var dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      if (anim) {
        var t = Math.min((now - anim.start) / anim.duration, 1);
        var eased = 1 - Math.pow(1 - t, 3);
        pos = anim.from + (anim.to - anim.from) * eased;
        if (t >= 1) { anim = null; pos = wrap(pos); }
      } else if (!dragging && !hovering && !focused && !reduceMotion && now >= resumeAt) {
        pos = wrap(pos + SPEED * dt);
      }

      render();
      requestAnimationFrame(tick);
    }

    function go(dir) {
      var from = anim ? anim.to : pos;
      var index = from / step;
      var target = (dir > 0 ? Math.floor(index + 0.001) + 1 : Math.ceil(index - 0.001) - 1) * step;
      anim = { from: pos, to: target, start: performance.now(), duration: 450 };
      resumeAt = performance.now() + NAV_RESUME;
    }

    prevBtn.addEventListener('click', function () { go(-1); });
    nextBtn.addEventListener('click', function () { go(1); });

    root.addEventListener('mouseenter', function () { hovering = true; });
    root.addEventListener('mouseleave', function () { hovering = false; });
    root.addEventListener('focusin', function () { focused = true; });
    root.addEventListener('focusout', function () { focused = false; });

    viewport.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (e.pointerType === 'mouse') e.preventDefault();
      dragging = true;
      dragPointer = e.pointerId;
      anim = null;
      dragStartX = e.clientX;
      dragStartPos = pos;
      root.classList.add('is-dragging');
      viewport.setPointerCapture(e.pointerId);
    });

    viewport.addEventListener('pointermove', function (e) {
      if (!dragging || e.pointerId !== dragPointer) return;
      pos = dragStartPos - (e.clientX - dragStartX);
    });

    function endDrag(e) {
      if (!dragging || e.pointerId !== dragPointer) return;
      dragging = false;
      dragPointer = null;
      pos = wrap(pos);
      root.classList.remove('is-dragging');
      if (e.pointerType !== 'mouse') resumeAt = performance.now() + TOUCH_RESUME;
    }

    viewport.addEventListener('pointerup', endDrag);
    viewport.addEventListener('pointercancel', endDrag);

    // Só anima enquanto a seção está na tela
    var visibilityObserver = new IntersectionObserver(function (entries) {
      var visible = entries[0].isIntersecting;
      if (visible && !running) {
        running = true;
        requestAnimationFrame(tick);
      } else if (!visible) {
        running = false;
      }
    });
    visibilityObserver.observe(root);

    window.addEventListener('resize', measure);
    window.addEventListener('load', measure);
    measure();
  }

  var membrosCarousel = document.getElementById('membros-carousel');
  if (membrosCarousel) setupMembrosCarousel(membrosCarousel);

});
