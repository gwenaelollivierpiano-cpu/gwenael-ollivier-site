/* ============================================
   GWENAËL OLLIVIER — script.js
   ============================================ */

// --- Navbar scroll ---
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  });
}

// --- Burger menu ---
const burgerBtn = document.getElementById('burgerBtn');
const navLinks  = document.getElementById('navLinks');
if (burgerBtn && navLinks) {
  burgerBtn.addEventListener('click', () => {
    burgerBtn.classList.toggle('open');
    navLinks.classList.toggle('open');
  });
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      burgerBtn.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });
}

// --- Active nav link ---
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach(link => {
  const href = link.getAttribute('href');
  if (href === currentPage || (currentPage === '' && href === 'index.html')) {
    link.classList.add('active');
  }
});

// --- Scroll reveal ---
const revealEls = document.querySelectorAll('.reveal');
if (revealEls.length) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => observer.observe(el));
}

// --- Galerie tabs ---
const galerieTabs = document.querySelectorAll('.galerie-tab');
if (galerieTabs.length) {
  galerieTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      galerieTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.dataset.tab;
      document.querySelectorAll('.photo-grid-item, .video-grid-item').forEach(item => {
        item.classList.remove('active');
      });
      document.querySelectorAll(`.${target}-item`).forEach(item => {
        item.classList.add('active');
      });
    });
  });
  // Activer le premier onglet par défaut
  if (galerieTabs[0]) galerieTabs[0].click();
}

// --- Lightbox ---
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
if (lightbox && lightboxImg) {
  document.querySelectorAll('.photo-grid img').forEach(img => {
    img.addEventListener('click', () => {
      lightboxImg.src = img.src;
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });
  document.getElementById('lightboxClose')?.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeLightbox();
  });
}
function closeLightbox() {
  lightbox?.classList.remove('open');
  document.body.style.overflow = '';
}

// --- Google Calendar ---
const CALENDAR_ID = 'gwenael.ollivier.piano@gmail.com';
const API_KEY     = 'AIzaSyCCPnn6wonAkog76Qx-kKhwEmKvGNKE4hg';
const MOIS        = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
const MOIS_LONG   = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const JOURS       = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];

// Abréviations à remplacer
const ABBREV = {
  'JP':       'Jean Plume',
  'Zonky\'s': 'The Zonky\'s',
  'Zonkys':   'The Zonky\'s',
  'Z':        'The Zonky\'s',
  'CZ':       'Control Zèbre',
  'MT':       'Moritz Trio',
};

function formatTitle(raw) {
  if (!raw) return '';
  let t = raw.trim();
  // Corriger espaces multiples
  t = t.replace(/\s{2,}/g, ' ');
  // Remplacer abréviations en début de titre
  for (const [abbr, full] of Object.entries(ABBREV)) {
    const re = new RegExp(`^${abbr}\\b`, 'i');
    t = t.replace(re, full);
  }
  // Remplacer abréviations après virgule ou tiret
  for (const [abbr, full] of Object.entries(ABBREV)) {
    const re = new RegExp(`([,\\-]\\s*)${abbr}\\b`, 'gi');
    t = t.replace(re, (m, sep) => sep + full);
  }
  // Majuscule première lettre
  t = t.charAt(0).toUpperCase() + t.slice(1);
  return t;
}

function formatHeure(dateStr) {
  if (!dateStr || !dateStr.includes('T')) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function buildDateItem(ev) {
  const start  = new Date(ev.start.dateTime || ev.start.date);
  const day    = start.getDate().toString().padStart(2, '0');
  const month  = MOIS[start.getMonth()];
  const year   = start.getFullYear();
  const jour   = JOURS[start.getDay()];
  const title  = formatTitle(ev.summary);
  const lieu   = ev.location ? formatTitle(ev.location) : '';
  const desc   = ev.description ? formatTitle(ev.description) : '';
  return `
    <div class="date-item reveal">
      <div class="date-day">
        <div class="day">${day}</div>
        <div class="month">${month} ${year}</div>
      </div>
      <div class="date-info">
        <h3>${title}</h3>
        ${lieu  ? `<div class="lieu">📍 ${lieu}</div>` : ''}
        ${desc  ? `<div class="groupe-tag">${desc}</div>` : ''}
      </div>
    </div>`;
}

async function fetchEvents(timeMin, timeMax, maxResults = 50) {
  let url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events?key=${API_KEY}&singleEvents=true&maxResults=${maxResults}`;
  if (timeMin) url += `&timeMin=${timeMin}&orderBy=startTime`;
  if (timeMax) url += `&timeMax=${timeMax}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Calendrier non accessible');
  const data = await res.json();
  return data.items || [];
}

// Page prochaines dates
async function loadCalendarEvents() {
  const container = document.getElementById('datesContainer');
  if (!container) return;
  try {
    container.innerHTML = '<p class="dates-loading">Chargement des dates...</p>';
    const now    = new Date().toISOString();
    const events = await fetchEvents(now, null, 20);
    if (events.length === 0) {
      container.innerHTML = `
        <div class="dates-empty">
          <p>Aucune date annoncée pour le moment.</p>
          <p style="font-size:0.85rem;margin-top:0.5rem;">Revenez bientôt, de nouveaux concerts arrivent !</p>
        </div>
        <div style="text-align:center;margin-top:3rem;">
          <a href="concerts-passes.html" class="btn-secondary">Voir les concerts passés →</a>
        </div>`;
      return;
    }
    const html = events.map(buildDateItem).join('');
    container.innerHTML = `
      <div class="dates-list">${html}</div>
      <div style="text-align:center;margin-top:3rem;">
        <a href="concerts-passes.html" class="btn-secondary">Voir les concerts passés →</a>
      </div>`;
    container.querySelectorAll('.reveal').forEach(el => observer_reveal(el));
  } catch (err) {
    console.warn('Erreur calendrier:', err);
    container.innerHTML = `<div class="dates-empty"><p>Les dates seront bientôt disponibles.</p></div>`;
  }
}

// Page concerts passés
async function loadPastEvents() {
  const container = document.getElementById('passesContainer');
  if (!container) return;
  try {
    container.innerHTML = '<p class="dates-loading">Chargement des concerts passés...</p>';
    const now    = new Date().toISOString();
    const events = await fetchEvents(null, now, 100);
    // Du plus récent au plus ancien
    events.sort((a, b) => new Date(b.start.dateTime || b.start.date) - new Date(a.start.dateTime || a.start.date));
    if (events.length === 0) {
      container.innerHTML = `<div class="dates-empty"><p>Aucun concert passé enregistré pour le moment.</p></div>`;
      return;
    }
    const html = events.map(buildDateItem).join('');
    container.innerHTML = `<div class="dates-list">${html}</div>`;
    container.querySelectorAll('.reveal').forEach(el => observer_reveal(el));
  } catch (err) {
    console.warn('Erreur calendrier:', err);
    container.innerHTML = `<div class="dates-empty"><p>Les concerts passés seront bientôt disponibles.</p></div>`;
  }
}

function observer_reveal(el) {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }});
  }, { threshold: 0.1 });
  obs.observe(el);
}

if (document.getElementById('datesContainer'))  loadCalendarEvents();
if (document.getElementById('passesContainer')) loadPastEvents();
