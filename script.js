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

// --- Google Calendar (Prochaines dates) ---
async function loadCalendarEvents() {
  const container = document.getElementById('datesContainer');
  if (!container) return;

  // ID du calendrier Google de Gwenaël
  const calendarId = 'gwenael.ollivier.piano@gmail.com';
  // Clé API Google Calendar — à remplacer par votre clé (console.cloud.google.com)
  // Tuto : Créer un projet → Activer "Google Calendar API" → Identifiants → Créer une clé API
  const apiKey = 'AIzaSyCCPnn6wonAkog76Qx-kKhwEmKvGNKE4hg';

  const now = new Date().toISOString();
  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?key=${apiKey}&timeMin=${now}&orderBy=startTime&singleEvents=true&maxResults=20`;

  try {
    container.innerHTML = '<p class="dates-loading">Chargement des dates...</p>';
    const res = await fetch(url);
    if (!res.ok) throw new Error('Calendrier non accessible');
    const data = await res.json();
    const events = data.items || [];

    if (events.length === 0) {
      container.innerHTML = `
        <div class="dates-empty">
          <p>Aucune date annoncée pour le moment.</p>
          <p style="font-size:0.85rem;margin-top:0.5rem;">Revenez bientôt, de nouveaux concerts arrivent !</p>
        </div>`;
      return;
    }

    const mois = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
    const html = events.map(ev => {
      const start = new Date(ev.start.dateTime || ev.start.date);
      const day   = start.getDate().toString().padStart(2,'0');
      const month = mois[start.getMonth()];
      const title = ev.summary || 'Concert';
      const lieu  = ev.location || '';
      const desc  = ev.description || '';
      return `
        <div class="date-item reveal">
          <div class="date-day">
            <div class="day">${day}</div>
            <div class="month">${month} ${start.getFullYear()}</div>
          </div>
          <div class="date-info">
            <h3>${title}</h3>
            ${lieu ? `<div class="lieu">📍 ${lieu}</div>` : ''}
            ${desc ? `<div class="groupe-tag">${desc}</div>` : ''}
          </div>
        </div>`;
    }).join('');

    container.innerHTML = `<div class="dates-list">${html}</div>`;
    // Relancer les animations reveal
    container.querySelectorAll('.reveal').forEach(el => {
      observer_reveal(el);
    });

  } catch (err) {
    console.warn('Erreur calendrier:', err);
    container.innerHTML = `
      <div class="dates-empty">
        <p>Les dates seront bientôt disponibles.</p>
        <p style="font-size:0.8rem;color:var(--text-muted);margin-top:1rem;">
          (Configurez la clé API Google Calendar dans script.js)
        </p>
      </div>`;
  }
}

function observer_reveal(el) {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.1 });
  obs.observe(el);
}

// Charger le calendrier si on est sur la page dates
if (document.getElementById('datesContainer')) {
  loadCalendarEvents();
}
