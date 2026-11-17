/**
 * UNDANGAN MEPANDES — PRAMJAYA & AGUNGFERNANDO
 * Cover: Pohon Bergerak, Daun Melayang, Kertas Vintage & Buka Gapura (GSAP)
 * Konten: Countdown, Audio Backsound, Denah Modal, RSVP & Kolom Ucapan
 */

document.addEventListener('DOMContentLoaded', () => {
  // -------------------------------------------------------------------------
  // 1. NAMA TAMU PERSONALISASI (?to=Nama+Tamu atau /slug)
  // -------------------------------------------------------------------------
  const guestDisplayEl = document.getElementById('guest-name-display');
  const rsvpNameInput = document.getElementById('rsvp-name');

  function applyGuestName(name) {
    if (!name) return;
    if (guestDisplayEl) {
      guestDisplayEl.textContent = name;
    }
    if (rsvpNameInput && !rsvpNameInput.value) {
      rsvpNameInput.value = name;
    }
  }

  function formatSlugToName(slug) {
    return decodeURIComponent(slug)
      .replace(/[-_+]+/g, ' ')
      .trim()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  const urlParams = new URLSearchParams(window.location.search);
  const queryGuest = urlParams.get('to') || urlParams.get('guest') || urlParams.get('u') || urlParams.get('kepada');
  const rawPathname = window.location.pathname.replace(/^\/+|\/+$/g, '');
  const pathSlug = (rawPathname && !rawPathname.toLowerCase().endsWith('index.html'))
    ? decodeURIComponent(rawPathname.split('/').pop() || '')
    : '';

  if (queryGuest) {
    const cleaned = decodeURIComponent(queryGuest.replace(/\+/g, ' ')).trim();
    applyGuestName(cleaned);
  } else if (pathSlug && !['mepandes', 'undanganmepandes'].includes(pathSlug.toLowerCase())) {
    applyGuestName(formatSlugToName(pathSlug));
  } else if (guestDisplayEl) {
    guestDisplayEl.textContent = 'Tamu Undangan';
  }

  // -------------------------------------------------------------------------
  // 2. BACKSOUND & AUDIO CONTROLLER
  // -------------------------------------------------------------------------
  const bgAudio = document.getElementById('bg-audio');
  const musicController = document.getElementById('music-controller');
  let isMusicPlaying = false;

  function playAudio() {
    if (!bgAudio) return;
    bgAudio.play().then(() => {
      isMusicPlaying = true;
      if (musicController) {
        musicController.classList.add('playing');
        musicController.setAttribute('aria-label', 'Jeda Musik');
      }
    }).catch((err) => {
      console.log('Autoplay membutuhkan interaksi pengguna:', err);
    });
  }

  function pauseAudio() {
    if (!bgAudio) return;
    bgAudio.pause();
    isMusicPlaying = false;
    if (musicController) {
      musicController.classList.remove('playing');
      musicController.setAttribute('aria-label', 'Putar Musik');
    }
  }

  if (musicController) {
    musicController.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isMusicPlaying) {
        pauseAudio();
      } else {
        playAudio();
      }
    });
  }

  // -------------------------------------------------------------------------
  // 3. COVER INTRO, POHON BERGERAK, DAUN MELAYANG & TRANSISI BUKA GAPURA (GSAP)
  // -------------------------------------------------------------------------
  const coverEl = document.getElementById('cover');
  const btnOpen = document.getElementById('btn-open-invitation');
  const driftContainer = document.querySelector('.drift');
  let introFinished = false;
  let isCoverOpen = false;
  let driftInterval = null;
  let shimmerInterval = null;
  let activeLeaves = 0;
  const maxLeaves = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ? 3 : 5;
  const leafAssets = [
    'assets/leave1.webp',
    'assets/leave2.webp',
    'assets/leave3.webp',
    'assets/leave4.webp',
    'assets/leave5.webp',
    'assets/leave6.webp',
    'assets/leave7.webp'
  ];

  function spawnLeaf() {
    if (!driftContainer || activeLeaves >= maxLeaves || document.hidden || isCoverOpen) return;
    activeLeaves++;
    const leaf = document.createElement('img');
    const asset = leafAssets[Math.floor(Math.random() * leafAssets.length)];
    leaf.src = asset;
    leaf.alt = '';
    leaf.className = 'drift-leaf';

    const widthVw = Math.random() * 4 + 6;
    const startX = Math.random() * 85 + 5;
    const duration = Math.random() * 6 + 12;
    const rotStart = Math.random() * 60 - 30;
    const rotEnd = rotStart + (Math.random() > 0.5 ? 360 : -360);
    const driftX = (Math.random() - 0.5) * 16;

    leaf.style.width = `${widthVw}vw`;
    leaf.style.maxWidth = '42px';
    leaf.style.left = `${startX}%`;
    leaf.style.top = '-12vh';
    leaf.style.transform = `rotate(${rotStart}deg)`;
    leaf.style.opacity = '0';
    driftContainer.appendChild(leaf);

    if (window.gsap) {
      gsap.timeline({
        onComplete: () => {
          leaf.remove();
          activeLeaves--;
        }
      })
        .to(leaf, { opacity: 0.85, duration: duration * 0.15, ease: 'power1.out' }, 0)
        .to(leaf, { y: '124vh', x: `${driftX}vw`, rotation: rotEnd, duration: duration, ease: 'none' }, 0)
        .to(leaf, { opacity: 0, duration: duration * 0.25, ease: 'power1.in' }, duration * 0.75);
    } else {
      setTimeout(() => {
        leaf.remove();
        activeLeaves--;
      }, 14000);
    }
  }

  function startDrift() {
    if (driftInterval) return;
    spawnLeaf();
    driftInterval = setInterval(spawnLeaf, 3500);
  }

  function stopDrift() {
    if (driftInterval) {
      clearInterval(driftInterval);
      driftInterval = null;
    }
    if (driftContainer) {
      driftContainer.innerHTML = '';
    }
  }

  function startIdle() {
    if (isCoverOpen) return;
    if (coverEl) coverEl.classList.add('is-idle');
    startDrift();

    if (!shimmerInterval && window.gsap) {
      shimmerInterval = setInterval(() => {
        if (isCoverOpen || document.hidden) return;
        gsap.fromTo('.shine',
          { xPercent: -100, opacity: 0 },
          { xPercent: 100, opacity: 0.8, duration: 1, ease: 'power2.inOut' }
        );
      }, 12000);
    }
  }

  function pauseIdle() {
    if (coverEl) coverEl.classList.remove('is-idle');
    stopDrift();
    if (shimmerInterval) {
      clearInterval(shimmerInterval);
      shimmerInterval = null;
    }
  }

  let introTl = null;
  let treeSwayTweens = [];

  function startTreeSway() {
    if (treeSwayTweens.length > 0 || !window.gsap || isCoverOpen) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const swayConfigs = [
      { selector: '.tree-slot--left-back .tree-sway',  fromRot: -1.8, toRot: 1.8, duration: 4.8, delay: 0 },
      { selector: '.tree-slot--left-mid .tree-sway',   fromRot: 1.6,  toRot: -1.8, duration: 4.2, delay: -1.1 },
      { selector: '.tree-slot--left-low .tree-sway',   fromRot: -1.4, toRot: 1.7, duration: 3.9, delay: -0.6 },
      { selector: '.tree-slot--right-back .tree-sway', fromRot: 1.8,  toRot: -1.8, duration: 5.0, delay: -1.5 },
      { selector: '.tree-slot--right-mid .tree-sway',  fromRot: -1.6, toRot: 1.9, duration: 4.4, delay: -0.4 },
      { selector: '.tree-slot--right-low .tree-sway',  fromRot: 1.5,  toRot: -1.5, duration: 4.0, delay: -1.8 }
    ];

    swayConfigs.forEach(cfg => {
      const el = document.querySelector(cfg.selector);
      if (!el) return;
      gsap.set(el, { rotation: cfg.fromRot, transformOrigin: '48% 92%' });
      const tween = gsap.to(el, {
        rotation: cfg.toRot,
        duration: cfg.duration,
        delay: cfg.delay,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true
      });
      treeSwayTweens.push(tween);
    });
  }

  function stopTreeSway() {
    treeSwayTweens.forEach(t => t && t.kill());
    treeSwayTweens = [];
  }

  function buildIntro() {
    if (!window.gsap) {
      introFinished = true;
      if (btnOpen) {
        btnOpen.style.opacity = '1';
        btnOpen.style.pointerEvents = 'auto';
        btnOpen.classList.add('is-ready');
      }
      document.querySelectorAll('.letter__names .w').forEach(w => w.classList.add('is-writing'));
      startIdle();
      return;
    }

    const E = {
      out: 'power3.out',
      inout: 'power2.inOut',
      settle: 'back.out(1.2)'
    };

    gsap.set('.letter-wrapper', { xPercent: -50, yPercent: -50 });
    gsap.set('.fg--bc', { xPercent: -50 });
    gsap.set('.tree-wing--left, .tree-wing--right', { xPercent: 0, opacity: 1 });
    gsap.set('.tree-slot--left-back, .tree-slot--left-mid, .tree-slot--left-low', {
      xPercent: -58,
      opacity: 0,
      rotate: -4
    });
    gsap.set('.tree-slot--right-back, .tree-slot--right-mid, .tree-slot--right-low', {
      xPercent: 58,
      opacity: 0,
      rotate: 4
    });
    gsap.set('.tree-curtain__bottom', { yPercent: 24, opacity: 0 });

    introTl = gsap.timeline({
      defaults: { ease: E.out },
      onComplete: () => {
        introFinished = true;
        if (btnOpen) btnOpen.classList.add('is-ready');
        startIdle();
      }
    });

    introTl.addLabel('bg', 0)
      .fromTo('.bg',
        { opacity: 0, filter: 'blur(8px) saturate(0.35) brightness(1.12)', yPercent: -2.5, scale: 1.06 },
        { opacity: 1, filter: 'blur(0px) saturate(1) brightness(1)', yPercent: 0, scale: 1, duration: 2.2 },
        'bg')
      .fromTo('.shine',
        { xPercent: -100, opacity: 0 },
        { xPercent: 100, opacity: 0.8, duration: 1, ease: E.inout },
        0.9)

      // Pohon Sisi Kiri & Kanan Muncul & Terus Bergoyang
      .addLabel('treeEnter', 0.3)
      .add(() => startTreeSway(), 'treeEnter')
      .to('.tree-slot--left-back, .tree-slot--left-mid, .tree-slot--left-low', {
        xPercent: 0,
        opacity: 1,
        rotate: 0,
        duration: 1.7,
        stagger: 0.22,
        ease: 'power3.out'
      }, 'treeEnter')
      .to('.tree-slot--right-back, .tree-slot--right-mid, .tree-slot--right-low', {
        xPercent: 0,
        opacity: 1,
        rotate: 0,
        duration: 1.7,
        stagger: 0.22,
        ease: 'power3.out'
      }, 'treeEnter')
      .to('.tree-curtain__bottom', {
        yPercent: 0,
        opacity: 1,
        duration: 1.5,
        ease: 'power3.out'
      }, 'treeEnter+=0.35')

      // Kertas Mendarat
      .addLabel('paper', 1.8)
      .fromTo('.letter-wrapper',
        { y: '40vh', rotate: 4, opacity: 0 },
        { y: 0, rotate: 0, opacity: 1, duration: 1.2, ease: E.settle },
        'paper')
      .fromTo('.letter-flower',
        { scale: 0.6, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.7, stagger: 0.12 },
        'paper+=0.8')

      // Tulisan Nama Reveal Tangan & Wobble Pena
      .addLabel('write', 3.0)
      .fromTo('.letter__eyebrow',
        { opacity: 0, letterSpacing: '0.5em' },
        { opacity: 1, letterSpacing: '0.32em', duration: 0.9 },
        'write')
      .fromTo('.ink',
        { x: 20, rotate: 14, opacity: 0 },
        { x: 0, rotate: 8, opacity: 1, duration: 0.6 },
        'write+=0.4')
      .add(() => {
        const w1 = document.querySelector('.w--1');
        if (w1) w1.classList.add('is-writing');
      }, 'write+=0.6')
      .add(() => {
        const wAmp = document.querySelector('.w--amp');
        if (wAmp) wAmp.classList.add('is-writing');
      }, 'write+=1.7')
      .add(() => {
        const w2 = document.querySelector('.w--2');
        if (w2) w2.classList.add('is-writing');
      }, 'write+=2.1')
      .to('.ink', { rotate: 11, y: -2, duration: 0.45, yoyo: true, repeat: 5, ease: 'sine.inOut' }, 'write+=0.6')
      .to('.ink', { rotate: 8, y: 0, duration: 0.4, ease: E.out }, 'write+=3.1')

      // Tagline & Tamu Undangan Fade In
      .fromTo('.letter__tagline',
        { opacity: 0, y: 6 },
        { opacity: 1, y: 0, duration: 0.8 },
        6.2)
      .fromTo('.letter__guest',
        { opacity: 0, y: 6 },
        { opacity: 1, y: 0, duration: 0.8 },
        6.4)

      // Tombol Buka Undangan
      .fromTo('.cta',
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.9,
          ease: 'power2.out',
          onStart: () => {
            if (btnOpen) {
              btnOpen.style.pointerEvents = 'auto';
              btnOpen.classList.add('is-ready');
            }
          }
        },
        '+=1.2');
  }

  function skipIntro() {
    if (introFinished) return;
    if (introTl) {
      introTl.progress(1);
    }
    introFinished = true;
    if (window.gsap) {
      gsap.set('.tree-wing--left, .tree-wing--right', { xPercent: 0, opacity: 1 });
      gsap.set('.tree-slot--left-back, .tree-slot--left-mid, .tree-slot--left-low, .tree-slot--right-back, .tree-slot--right-mid, .tree-slot--right-low', {
        xPercent: 0,
        opacity: 1,
        rotate: 0
      });
      gsap.set('.tree-curtain__bottom', { yPercent: 0, opacity: 1 });
      startTreeSway();
      if (btnOpen) {
        gsap.to(btnOpen, { opacity: 1, duration: 0.3, ease: 'power2.out' });
      }
    }
    document.querySelectorAll('.letter__names .w').forEach(w => w.classList.add('is-writing'));
    if (btnOpen) {
      btnOpen.style.opacity = '1';
      btnOpen.style.pointerEvents = 'auto';
      btnOpen.classList.add('is-ready');
    }
    startIdle();
  }

  function showPage2() {
    stopTreeSway();
    if (coverEl) {
      coverEl.style.display = 'none';
    }
    document.body.classList.remove('locked');
    window.scrollTo(0, 0);

    if (musicController) {
      musicController.classList.add('visible');
    }

    const page2 = document.getElementById('page-2');
    if (page2 && window.gsap) {
      page2.style.visibility = 'visible';
      gsap.fromTo(page2, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' });
    }
  }

  function openGate() {
    if (isCoverOpen) return;
    isCoverOpen = true;
    pauseIdle();
    playAudio();

    if (!window.gsap) {
      stopTreeSway();
      showPage2();
      return;
    }

    const tl = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      onComplete: showPage2
    });

    tl.to('.cta', { opacity: 0, duration: 0.35, ease: 'power2.out' }, 0)
      .to('.letter-wrapper', { y: '-40vh', rotate: -4, opacity: 0, duration: 0.9 }, 0.1)
      .to('.tree-wing--left', { xPercent: -75, opacity: 0, duration: 1.5, ease: 'power2.inOut' }, 0.2)
      .to('.tree-wing--right', { xPercent: 75, opacity: 0, duration: 1.5, ease: 'power2.inOut' }, 0.2)
      .to('.tree-curtain__bottom', { yPercent: 100, opacity: 0, duration: 1.2, ease: 'power2.inOut' }, 0.2)
      .to('.fg--bl', { x: '-35vw', scale: 1.25, opacity: 0, duration: 1.5 }, 0.3)
      .to('.fg--br', { x: '35vw', scale: 1.25, opacity: 0, duration: 1.5 }, 0.3)
      .to('.fg--bc', { y: '20vw', opacity: 0, duration: 1.4 }, 0.4)
      .to('.bg', { scale: 1.55, transformOrigin: '50% 66%', duration: 1.9 }, 0.3)
      .to('.veil', { opacity: 1, duration: 0.8 }, 1.5);
  }

  if (btnOpen) {
    btnOpen.addEventListener('click', (e) => {
      e.stopPropagation();
      openGate();
    });
  }

  if (coverEl) {
    coverEl.addEventListener('click', (e) => {
      if (!introFinished) {
        skipIntro();
        return;
      }
      if (e.target.closest('#btn-open-invitation')) {
        openGate();
      }
    });
  }

  buildIntro();

  // -------------------------------------------------------------------------
  // 4. COUNTDOWN TIMER & GOOGLE CALENDAR
  // -------------------------------------------------------------------------
  const targetDate = new Date('2026-12-11T08:00:00+08:00').getTime();
  const cdDays = document.getElementById('cd-days');
  const cdHours = document.getElementById('cd-hours');
  const cdMinutes = document.getElementById('cd-minutes');
  const cdSeconds = document.getElementById('cd-seconds');

  function updateCountdown() {
    const now = Date.now();
    const diff = Math.max(0, targetDate - now);

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    if (cdDays) cdDays.textContent = String(days).padStart(2, '0');
    if (cdHours) cdHours.textContent = String(hours).padStart(2, '0');
    if (cdMinutes) cdMinutes.textContent = String(mins).padStart(2, '0');
    if (cdSeconds) cdSeconds.textContent = String(secs).padStart(2, '0');
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  const btnCalendar = document.getElementById('btn-add-calendar');
  if (btnCalendar) {
    const gcalUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
      '&text=' + encodeURIComponent('Upacara Mepandes I Gusti Nyoman Pramajaya & I Gusti Kadek Agung Gading Fernando') +
      '&dates=20261211T000000Z/20261211T140000Z' +
      '&details=' + encodeURIComponent('Upacara Manusa Yadnya Mepandes (Potong Gigi) I Gusti Nyoman Pramajaya & I Gusti Kadek Agung Gading Fernando. Pukul 08.00 WITA - Selesai.') +
      '&location=' + encodeURIComponent('260m ke utara dari Balai Banjar Sembung Gede Kelod, Desa Sembung Gede, Kec. Kerambitan, Kab. Tabanan, Bali');
    btnCalendar.href = gcalUrl;
    btnCalendar.target = '_blank';
    btnCalendar.rel = 'noopener noreferrer';
  }

  // -------------------------------------------------------------------------
  // 5. DENAH LOKASI MODAL LIGHTBOX
  // -------------------------------------------------------------------------
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxClose = document.getElementById('lightbox-close');
  const btnZoomDenah = document.getElementById('btn-zoom-denah');
  const denahPreviewCard = document.getElementById('denah-preview-card');

  function openDenahLightbox() {
    if (lightboxModal) {
      lightboxModal.classList.add('active');
    }
  }

  function closeDenahLightbox() {
    if (lightboxModal) {
      lightboxModal.classList.remove('active');
    }
  }

  if (btnZoomDenah) btnZoomDenah.addEventListener('click', openDenahLightbox);
  if (denahPreviewCard) denahPreviewCard.addEventListener('click', openDenahLightbox);
  if (lightboxClose) lightboxClose.addEventListener('click', closeDenahLightbox);
  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) closeDenahLightbox();
    });
  }

  // -------------------------------------------------------------------------
  // 6. KONFIRMASI TAMU (RSVP) & KOLOM UCAPAN
  // -------------------------------------------------------------------------
  const STORAGE_KEY = 'mepandes_pramjaya_agungfernando_wishes_v2';
  const defaultWishes = [
    {
      name: 'Keluarga Besar Br. Sembung Gede',
      attendance: 'hadir',
      guests: 'Bersama Keluarga',
      message: 'Rahajeng melaksanakan Upacara Manusa Yadnya Mepandes untuk I Gusti Nyoman Pramajaya & I Gusti Kadek Agung Gading Fernando. Semoga senantiasa diberikan kerahayuan dan tuntunan Ida Sang Hyang Widhi Wasa.',
      createdAt: 'Baru saja'
    },
    {
      name: 'I Made Adi & Keluarga',
      attendance: 'hadir',
      guests: '2 Orang',
      message: 'Selamat menjalani prosesi Mepandes / Metatah. Semoga menjadi putra yang suputra dan senantiasa diberkahi kebahagiaan. Astungkara labda karya.',
      createdAt: '1 jam yang lalu'
    }
  ];

  let wishesList = [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    wishesList = saved ? JSON.parse(saved) : [...defaultWishes];
  } catch (e) {
    wishesList = [...defaultWishes];
  }

  const statTotal = document.getElementById('stat-total');
  const statHadir = document.getElementById('stat-hadir');
  const statTidak = document.getElementById('stat-tidak');
  const statRagu = document.getElementById('stat-ragu');
  const wishesContainer = document.getElementById('wishes-list-container');
  const rsvpForm = document.getElementById('rsvp-form');

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatAttendanceLabel(att) {
    if (att === 'hadir') return 'Hadir';
    if (att === 'tidak-hadir') return 'Tidak Hadir';
    return 'Masih Ragu';
  }

  function renderWishes() {
    if (!wishesContainer) return;

    const total = wishesList.length;
    const hadirCount = wishesList.filter(w => w.attendance === 'hadir').length;
    const tidakCount = wishesList.filter(w => w.attendance === 'tidak-hadir').length;
    const raguCount = wishesList.filter(w => w.attendance === 'ragu').length;

    if (statTotal) statTotal.textContent = total;
    if (statHadir) statHadir.textContent = hadirCount;
    if (statTidak) statTidak.textContent = tidakCount;
    if (statRagu) statRagu.textContent = raguCount;

    wishesContainer.innerHTML = wishesList.map(item => `
      <div class="wish-item">
        <div class="wish-header">
          <span class="wish-author">${escapeHtml(item.name)}</span>
          <span class="wish-badge ${escapeHtml(item.attendance)}">${formatAttendanceLabel(item.attendance)}</span>
        </div>
        <p class="wish-message">${escapeHtml(item.message)}</p>
        <div class="wish-meta">${escapeHtml(item.guests || '1 Orang')} &bull; ${escapeHtml(item.createdAt || 'Baru saja')}</div>
      </div>
    `).join('');
  }

  function showToast(msg) {
    const toast = document.getElementById('toast-notice');
    const toastMsg = document.getElementById('toast-message');
    if (!toast || !toastMsg) return;
    toastMsg.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3200);
  }

  if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameVal = (document.getElementById('rsvp-name')?.value || '').trim();
      const msgVal = (document.getElementById('rsvp-message')?.value || '').trim();
      const guestsVal = document.getElementById('rsvp-guests')?.value || '1 Orang';
      const attInput = document.querySelector('input[name="attendance"]:checked');
      const attVal = attInput ? attInput.value : 'hadir';

      if (!nameVal || !msgVal) return;

      const newEntry = {
        name: nameVal,
        attendance: attVal,
        guests: guestsVal,
        message: msgVal,
        createdAt: 'Baru saja'
      };

      wishesList.unshift(newEntry);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(wishesList));
      } catch (err) {}

      renderWishes();
      document.getElementById('rsvp-message').value = '';
      showToast('Terima kasih! Konfirmasi & doa restu Anda telah tersimpan.');
    });
  }

  renderWishes();

  // -------------------------------------------------------------------------
  // 7. SCROLL REVEAL & PARTIKEL DEBU EMAS
  // -------------------------------------------------------------------------
  const fadeEls = document.querySelectorAll('.fade-in-element');
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    fadeEls.forEach(el => obs.observe(el));
  } else {
    fadeEls.forEach(el => el.classList.add('is-visible'));
  }

  // Partikel Emas Halus
  const canvas = document.getElementById('particles-canvas');
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext('2d');
    let w = (canvas.width = Math.min(window.innerWidth, 480));
    let h = (canvas.height = window.innerHeight);

    const particles = Array.from({ length: 18 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 2 + 0.8,
      vy: Math.random() * 0.35 + 0.15,
      vx: (Math.random() - 0.5) * 0.25,
      alpha: Math.random() * 0.45 + 0.15
    }));

    function drawParticles() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        p.y += p.vy;
        p.x += p.vx;
        if (p.y > h) p.y = -5;
        if (p.x > w) p.x = 0;
        if (p.x < 0) p.x = w;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(197, 138, 60, ${p.alpha})`;
        ctx.fill();
      });
      requestAnimationFrame(drawParticles);
    }
    drawParticles();

    window.addEventListener('resize', () => {
      w = canvas.width = Math.min(window.innerWidth, 480);
      h = canvas.height = window.innerHeight;
    });
  }
});
