# Gwenaël Ollivier — Site Web
## Instructions de mise en place

### Structure des fichiers
```
gwen-site/
├── index.html              → Page d'accueil
├── biographie.html         → Biographie
├── groupes.html            → Liste des groupes
├── groupe-jeanplume.html   → Jean Plume
├── groupe-zonkys.html      → The Zonky's
├── groupe-zitzelyth.html   → ZitZelyth
├── groupe-sancocho.html    → Trio Sancocho
├── groupe-elcojillo.html   → El Cojillo
├── groupe-djangoretro.html → The Django Retro Show
├── groupe-controlzebre.html→ Control Zèbre
├── groupe-moritztrio.html  → Moritz Trio (à compléter)
├── groupe-toucantoco.html  → Toucan Toco
├── galerie.html            → Galerie photos & vidéos
├── dates.html              → Prochaines dates (Google Calendar)
├── contact.html            → Contact
├── style.css               → Styles
├── script.js               → JavaScript
└── images/                 → Dossier photos (à remplir)
```

### Photos à placer dans le dossier /images/
- `hero.jpg`            → Photo principale (accueil) — suggéré : IMG-20170710-WA0065.jpg
- `bio-main.jpg`        → Photo bio principale — suggéré : FB_IMG_1496767626343.jpg
- `bio-secondary.jpg`   → Photo bio secondaire — suggéré : 20211104_141612.jpg
- `contact.jpg`         → Photo contact — suggéré : 10924203_...jpg
- `galerie-rue.jpg`     → Concert de rue — suggéré : 5869068857_947ddf043e_z.jpg
- `galerie-smoking.jpg` → Concert smoking — suggéré : 20211104_141612.jpg
- `galerie-portrait.jpg`→ Portrait — suggéré : DSC_9653.jpg
- `jeanplume.jpg`       → Jean Plume (depuis Wix)
- `zitzelyth.jpg`       → ZitZelyth photo 1
- `zitzelyth2.jpg`      → ZitZelyth photo sépia
- `sancocho.jpg`        → Trio Sancocho
- `sancocho-cover.jpg`  → Pochette Sancocho
- `elcojillo.jpg`       → El Cojillo (depuis alexandrearnaud.fr)
- `djangoretro.jpg`     → Django Retro Show (depuis alexandrearnaud.fr)
- `controlzebre.jpg`    → Control Zèbre
- `controlzebre2.jpg`   → Control Zèbre concert
- `controlzebre3.jpg`   → Control Zèbre piano
- `toucantoco.jpg`      → Toucan Toco photo 1
- `toucantoco2.jpg`     → Toucan Toco photo 2

### Google Calendar — Activer les prochaines dates
1. Aller sur calendar.google.com
2. Cliquer sur ⚙️ (paramètres) → votre agenda → "Rendre disponible au public" ✓
3. Obtenir une clé API Google sur https://console.cloud.google.com
   - Créer un projet → Activer "Google Calendar API" → Créer une clé API
4. Dans script.js, remplacer : `const apiKey = 'VOTRE_CLE_API_GOOGLE';`
   par votre vraie clé API

### Hébergement sur VPS Hostinger
1. Uploader tous les fichiers via FTP ou le gestionnaire de fichiers Hostinger
2. Placer les fichiers dans le dossier public_html/
3. Le site sera accessible à votre domaine
