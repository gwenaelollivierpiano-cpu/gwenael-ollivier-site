/* ============================================
   LECTEUR AUDIO — audio-player.js
   ============================================ */

// Convertit un nom de fichier en titre lisible
// ex: "tant-pis-tant-mieux.mp3" → "Tant Pis Tant Mieux"
function fileToTitle(filename) {
  return filename
    .replace(/\.mp3$/i, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

// Formate les secondes en mm:ss
function formatTime(sec) {
  if (isNaN(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

class AudioPlayer {
  constructor(containerId, tracks, options = {}) {
    this.container  = document.getElementById(containerId);
    if (!this.container) return;
    this.tracks     = tracks; // [{title, src}]
    this.current    = 0;
    this.audio      = new Audio();
    this.playing    = false;
    this.options    = options;
    this.render();
    this.bindEvents();
  }

  render() {
    if (this.tracks.length === 0) {
      this.container.innerHTML = `<div class="audio-empty">♪ Les morceaux arrivent bientôt…</div>`;
      return;
    }

    const trackItems = this.tracks.map((t, i) => `
      <li class="audio-track${i === 0 ? ' active' : ''}" data-index="${i}">
        <span class="track-num">${(i+1).toString().padStart(2,'0')}</span>
        <span class="track-name">${t.title}</span>
        <span class="track-duration" id="dur-${containerId}-${i}">–:––</span>
      </li>`).join('');

    this.container.innerHTML = `
      <ul class="audio-track-list">${trackItems}</ul>
      <div class="audio-controls">
        <div class="audio-now-playing" id="np-${this.container.id}">♪ ${this.tracks[0].title}</div>
        <div class="audio-progress-bar" id="pb-${this.container.id}">
          <div class="audio-progress-fill" id="pf-${this.container.id}"></div>
        </div>
        <div class="audio-buttons">
          <button class="audio-btn" id="prev-${this.container.id}" title="Précédent">⏮</button>
          <button class="audio-btn play-pause" id="pp-${this.container.id}" title="Lecture/Pause">▶</button>
          <button class="audio-btn" id="next-${this.container.id}" title="Suivant">⏭</button>
          <span class="audio-time" id="time-${this.container.id}">0:00 / 0:00</span>
          <div class="audio-volume">
            <span style="font-size:0.9rem;color:var(--text-muted);">🔈</span>
            <input type="range" id="vol-${this.container.id}" min="0" max="1" step="0.05" value="0.8">
          </div>
        </div>
      </div>`;

    this.loadTrack(0, false);
  }

  get containerId() { return this.container.id; }

  bindEvents() {
    if (this.tracks.length === 0) return;

    // Clics sur les pistes
    this.container.querySelectorAll('.audio-track').forEach(el => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.dataset.index);
        this.loadTrack(idx, true);
      });
    });

    // Boutons
    document.getElementById(`pp-${this.containerId}`)
      ?.addEventListener('click', () => this.togglePlay());
    document.getElementById(`prev-${this.containerId}`)
      ?.addEventListener('click', () => this.prev());
    document.getElementById(`next-${this.containerId}`)
      ?.addEventListener('click', () => this.next());

    // Barre de progression
    document.getElementById(`pb-${this.containerId}`)
      ?.addEventListener('click', e => {
        const bar  = e.currentTarget;
        const pct  = e.offsetX / bar.offsetWidth;
        this.audio.currentTime = pct * this.audio.duration;
      });

    // Volume
    document.getElementById(`vol-${this.containerId}`)
      ?.addEventListener('input', e => { this.audio.volume = e.target.value; });

    // Events audio
    this.audio.addEventListener('timeupdate', () => this.updateProgress());
    this.audio.addEventListener('ended',      () => this.next());
    this.audio.addEventListener('loadedmetadata', () => {
      const durEl = document.getElementById(`dur-${this.containerId}-${this.current}`);
      if (durEl) durEl.textContent = formatTime(this.audio.duration);
    });

    this.audio.volume = 0.8;
  }

  loadTrack(idx, autoplay = false) {
    this.current = idx;
    const t = this.tracks[idx];
    this.audio.src = t.src;
    this.audio.load();

    // UI
    this.container.querySelectorAll('.audio-track').forEach((el, i) => {
      el.classList.toggle('active', i === idx);
    });
    const np = document.getElementById(`np-${this.containerId}`);
    if (np) np.textContent = `♪ ${t.title}`;
    const pp = document.getElementById(`pp-${this.containerId}`);
    if (pp) pp.textContent = '▶';
    this.playing = false;

    if (autoplay) this.play();
  }

  play() {
    this.audio.play().catch(() => {});
    this.playing = true;
    const pp = document.getElementById(`pp-${this.containerId}`);
    if (pp) pp.textContent = '⏸';
  }

  pause() {
    this.audio.pause();
    this.playing = false;
    const pp = document.getElementById(`pp-${this.containerId}`);
    if (pp) pp.textContent = '▶';
  }

  togglePlay() {
    this.playing ? this.pause() : this.play();
  }

  prev() {
    const idx = (this.current - 1 + this.tracks.length) % this.tracks.length;
    this.loadTrack(idx, this.playing);
  }

  next() {
    const idx = (this.current + 1) % this.tracks.length;
    this.loadTrack(idx, this.playing);
  }

  updateProgress() {
    const pct  = this.audio.duration ? (this.audio.currentTime / this.audio.duration) * 100 : 0;
    const fill = document.getElementById(`pf-${this.containerId}`);
    if (fill) fill.style.width = pct + '%';
    const time = document.getElementById(`time-${this.containerId}`);
    if (time) time.textContent = `${formatTime(this.audio.currentTime)} / ${formatTime(this.audio.duration)}`;
  }
}

// Scan automatique du dossier audio pour un groupe
// Les fichiers MP3 doivent être dans audio/{groupe}/
async function initGroupPlayer(containerId, groupFolder) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Liste des fichiers MP3 via un fichier index.json dans chaque dossier
  // Format : ["morceau1.mp3", "morceau2.mp3"]
  try {
    const res = await fetch(`audio/${groupFolder}/index.json`);
    if (!res.ok) throw new Error('Pas de fichiers audio');
    const files = await res.json();
    const tracks = files.map(f => ({
      title: fileToTitle(f),
      src:   `audio/${groupFolder}/${f}`
    }));
    new AudioPlayer(containerId, tracks);
  } catch {
    container.innerHTML = `<div class="audio-empty">♪ Les morceaux de ce groupe arrivent bientôt…</div>`;
  }
}

// Lecteur global (page d'accueil)
async function initGlobalPlayer() {
  const groups = [
    { folder: 'jean-plume',    label: 'Jean Plume' },
    { folder: 'zonkys',        label: "The Zonky's" },
    { folder: 'zitzelyth',     label: 'ZitZelyth' },
    { folder: 'sancocho',      label: 'Trio Sancocho' },
    { folder: 'elcojillo',     label: 'El Cojillo' },
    { folder: 'djangoretro',   label: 'Django Retro Show' },
    { folder: 'controlzebre',  label: 'Control Zèbre' },
    { folder: 'moritztrio',    label: 'Moritz Trio' },
    { folder: 'toucantoco',    label: 'Toucan Toco' },
  ];

  const btn     = document.getElementById('globalPlayerBtn');
  const overlay = document.getElementById('globalPlayerOverlay');
  const closeBtn= document.getElementById('globalPlayerClose');
  const tabsEl  = document.getElementById('globalPlayerTabs');
  const bodyEl  = document.getElementById('globalPlayerBody');
  if (!btn || !overlay) return;

  let initialized = false;

  btn.addEventListener('click', async () => {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (initialized) return;
    initialized = true;

    // Charger les pistes de chaque groupe
    const loaded = [];
    for (const g of groups) {
      try {
        const res = await fetch(`audio/${g.folder}/index.json`);
        if (!res.ok) continue;
        const files = await res.json();
        if (files.length === 0) continue;
        loaded.push({ ...g, tracks: files.map(f => ({ title: fileToTitle(f), src: `audio/${g.folder}/${f}` })) });
      } catch { continue; }
    }

    if (loaded.length === 0) {
      bodyEl.innerHTML = `<div class="audio-empty" style="padding:3rem;">♪ Les morceaux arrivent bientôt…</div>`;
      return;
    }

    // Tabs
    tabsEl.innerHTML = loaded.map((g, i) =>
      `<button class="global-tab${i===0?' active':''}" data-idx="${i}">${g.label}</button>`
    ).join('');

    // Afficher le premier groupe
    bodyEl.innerHTML = `<div id="global-player-instance"></div>`;
    let currentPlayer = new AudioPlayer('global-player-instance', loaded[0].tracks);

    tabsEl.querySelectorAll('.global-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        tabsEl.querySelectorAll('.global-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const idx = parseInt(tab.dataset.idx);
        if (currentPlayer) currentPlayer.pause();
        bodyEl.innerHTML = `<div id="global-player-instance"></div>`;
        currentPlayer = new AudioPlayer('global-player-instance', loaded[idx].tracks);
      });
    });
  });

  closeBtn?.addEventListener('click', () => {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  });
  overlay.addEventListener('click', e => {
    if (e.target === overlay) {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  // Lecteurs de groupe
  const groupPlayer = document.getElementById('group-audio-player');
  if (groupPlayer) {
    const folder = groupPlayer.dataset.folder;
    if (folder) initGroupPlayer('group-audio-player', folder);
  }
  // Lecteur global
  initGlobalPlayer();
});
