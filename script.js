// ==================================================
//          SCRIPT COMPLET - LE RÉACTEUR CSE
//    (Multi-Sections, Multi-Thèmes, Dinguerie V1)
// ==================================================

/* ... (Prerequisites comments - Vérifier URLs CSV, Noms colonnes, Forms) ... */

// --- CONSTANTES ET VARIABLES GLOBALES ---

// URLs CSV (Vérifier/Remplacer !)
const newsCsvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQcKo9WOqdnefe5z7QpaM5XtdkGs7pBeWNFrcy1crwW18Jn_KkR1IxV_KMhatedR5lmaASfeIlEsUF9/pub?gid=0&single=true&output=csv';
const eventsCsvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQcKo9WOqdnefe5z7QpaM5XtdkGs7pBeWNFrcy1crwW18Jn_KkR1IxV_KMhatedR5lmaASfeIlEsUF9/pub?gid=377066785&single=true&output=csv';
const partnersCsvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQcKo9WOqdnefe5z7QpaM5XtdkGs7pBeWNFrcy1crwW18Jn_KkR1IxV_KMhatedR5lmaASfeIlEsUF9/pub?gid=1082465411&single=true&output=csv';
const membersCsvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQcKo9WOqdnefe5z7QpaM5XtdkGs7pBeWNFrcy1crwW18Jn_KkR1IxV_KMhatedR5lmaASfeIlEsUF9/pub?gid=1265664324&single=true&output=csv';

// Sound Paths (Assurez-vous que ces fichiers existent!)
const SOUNDS = {
    themeChange: './sounds/theme_change.mp3',
    navClick: './sounds/nav_click.mp3',
    vibeClick: './sounds/vibe_click.mp3',
    installAccept: './sounds/liftoff.mp3'
    // tick: './sounds/countdown_tick.mp3' // Optionnel
};

// DOM Elements References
const sidebar = document.getElementById('sidebar');
const hamburger = document.querySelector('.hamburger');
const mainContent = document.getElementById('main-content');
const headerLogo = document.getElementById('header-logo');
const installButton = document.getElementById('install-button');
const currentYearSpan = document.getElementById('current-year');
const themeButtonsWrapper = document.getElementById('theme-buttons');

// State Variables
let deferredPrompt = null;
let isFormSubmitting = false;
let activeCountdownIntervals = []; // Stocker les IDs des timers actifs
let isSoundMuted = false; // TODO: Ajouter un bouton Mute plus tard si besoin

// Theme Constants
const THEME_STORAGE_KEY = 'reacteur-cse-selected-theme';
const DEFAULT_THEME = 'theme-nebula';
const KNOWN_THEMES = ['theme-nebula', 'theme-daylight', 'theme-pixel'];

// --- SOUND HANDLING ---

/** Joue un fichier son (si non muté) */
function playSound(soundKey) {
    if (isSoundMuted || !SOUNDS[soundKey]) return;

    // Créer un nouvel objet Audio à chaque fois évite des problèmes de rejeu rapide
    const audio = new Audio(SOUNDS[soundKey]);
    audio.volume = (soundKey === 'themeChange') ? 0.3 : 0.2; // Volume différent ?

    audio.play().catch(error => {
        // L'autoplay peut échouer si l'utilisateur n'a pas encore interagi avec la page
        // ou si le format n'est pas supporté. Logguer mais ne pas bloquer.
        if (error.name === 'NotAllowedError') {
             console.warn(`[Sound] Playback ${soundKey} bloqué (interaction utilisateur nécessaire?).`);
        } else {
             console.error(`[Sound] Erreur lecture ${soundKey}:`, error);
        }
    });
}
// TODO: Ajouter une fonction toggleMute() liée à un bouton Mute dans le UI.

// --- NAVIGATION & CORE UI (Avec ajout son sur nav) ---

function closeMenu() { if (sidebar) sidebar.classList.remove('active'); if (hamburger) hamburger.classList.remove('active'); }
function toggleMenu() { if (sidebar && hamburger) { sidebar.classList.toggle('active'); hamburger.classList.toggle('active'); } else { console.error("Sidebar ou Hamburger introuvable."); } }
function updateFooterYear() { if (currentYearSpan) { currentYearSpan.textContent = new Date().getFullYear(); } }
function clearActiveNavButton() { if (!sidebar) return; const buttons = sidebar.querySelectorAll('ul li button:not(.theme-button)'); buttons.forEach(button => button.classList.remove('active-page')); }
function updateActiveNavButton(pageId) { if (!sidebar) return; const targetButton = sidebar.querySelector(`button[onclick*="loadPage('${pageId}')"]`); if (targetButton) { targetButton.classList.add('active-page'); } else { console.warn(`Bouton pour page '${pageId}' non trouvé.`); }}

// Ajouter un écouteur sur la sidebar pour les clics de navigation
function initializeSidebarSound() {
    if(!sidebar) return;
    sidebar.addEventListener('click', (e) => {
        const navButton = e.target.closest('li button:not(.theme-button)');
        if (navButton) {
             playSound('navClick');
        }
        // Gérer le clic thème est fait dans initializeThemeSwitcher
    });
}

// --- PAGE LOADING ORCHESTRATOR (Avec gestion animations/timers) ---

/** Charge le contenu approprié et lance animations/timers */
function loadPage(pageId) {
    closeMenu();
    if (!mainContent) { console.error("Element #main-content introuvable."); return; }

    // *** Nettoyer les anciens timers de compte à rebours ***
    clearAllCountdowns();

    console.log(`Chargement de la page : ${pageId}`);
    mainContent.innerHTML = `<p class="loading-message">Transmission de la section ${pageId} en cours...</p>`;
    clearActiveNavButton();

    // Injecter contenu (différé légèrement pour effets visuels)
    setTimeout(() => {
        let success = injectPageContent(pageId); // Fonction qui injecte le HTML
        if(success) {
            // *** Lancer Animation Titre après injection ***
            animatePageTitle();
            // Attacher les listeners spécifiques à la page si besoin
            if (pageId === 'scoops') {
                initializeVibeOMeter();
            }
             // Le démarrage des countdowns se fait DANS displayEvents après création des éléments
        }
    }, 50); // Petit délai pour la transition (peut être ajusté/retiré)


    updateActiveNavButton(pageId);
}

/** Fonction séparée pour injecter le HTML de la page */
function injectPageContent(pageId) {
     switch (pageId) {
        case 'scoops': loadNews(); return true; // Les loadXXX mettent à jour mainContent directement
        case 'vortex': loadEvents(); return true;
        case 'galaxie': loadPartners(); return true;
        case 'equipage': loadMembers(); return true;
        case 'sos-cafeine': injectCoffeeForm(); return true; // Les injectXXX aussi
        case 'holocom': injectContactForm(); return true;
        case 'accueil': injectAccueilPage(); return true;
        case 'boosters': injectBoostersPage(); return true;
        default: loadPlaceholderPage(pageId); return true; // Placeholder est aussi une injection
    }
     // return false; // Si on voulait gérer un échec d'injection
}

/** Ajoute une classe pour animer le H2 de la page chargée */
function animatePageTitle() {
    const titleElement = mainContent.querySelector('h2');
    if (titleElement) {
        // Assurer que l'animation redémarre si on recharge la même page
        titleElement.classList.remove('title-animate');
        // Forcer reflow (technique classique) pour redémarrer animation CSS
        void titleElement.offsetWidth;
        titleElement.classList.add('title-animate');
    }
}

// --- DATA LOADING & DISPLAY FUNCTIONS (CSV - avec MAJ pour dinguerie) ---

// ≈≈≈ NEWS (Scoops Brûlants) - Mise à jour displayNews pour Vibe-O-Mètre ---
function loadNews() { /* ... (identique sauf msg chargement) ... */
     if (!mainContent) return; mainContent.innerHTML = `<h2 style="text-align:center">Scoops Brûlants <i class="fas fa-fire"></i></h2><div id="news-container" class="loading-state"><p class="loading-message">Scan des ondes alpha pour news...</p></div>`; /*...*/ loadNewsLogic();
}
function loadNewsLogic(){ /* ... Contient le reste de la logique loadNews après la màj de l'innerHTML ... */
    if (typeof Papa === 'undefined') { displayGenericError("Biblio PapaParse manquante.", "news-container"); return; } Papa.parse(newsCsvUrl, { download: true, header: true, skipEmptyLines: 'greedy', complete: (res) => { if (res.errors.length){ displayNewsError(`Err Format: ${res.errors[0].message}`); return; } if (!res.data || !res.data.length) { displayNewsError("Aucune news."); return; } displayNews(res.data); }, error: (err) => displayNewsError(`Err Charge: ${err.message}`) });
}

function displayNews(newsData) {
    const container = document.getElementById('news-container'); if (!container) return; container.classList.remove('loading-state'); container.innerHTML = '';
    const validAndSortedNews = newsData.filter(item => item && (item.Titre || item.titre)).sort((a, b) => (parseDateBestEffort(b.Date || b.date)?.getTime() ?? 0) - (parseDateBestEffort(a.Date || a.date)?.getTime() ?? 0));
    if (!validAndSortedNews.length) { container.innerHTML = '<p>Canal CSE silencieux...</p>'; return; }

    validAndSortedNews.forEach((item, index) => { // Ajout index pour ID unique (si besoin)
        const el = document.createElement('article');
        const articleId = `news-${index}-${Date.now()}`; // ID semi-unique pour référence
        el.className = 'news-item card-style'; el.id = articleId;

        // ... (Extraction titre, date, desc, image - identique) ...
        const title = item.Titre || item.titre || 'Sans Titre'; const dateStr = item.Date || item.date || ''; const description = (item.Description || item.description || '').replace(/\n/g, '<br>'); const imageUrl = item.Lien_image || item['Lien image'] || item.Image || item.image || '';
        const pDate = parseDateBestEffort(dateStr); const displayDate = pDate ? pDate.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }) : dateStr;
        const imgHtml = imageUrl ? `<div class="news-image-container"><img src="${imageUrl}" alt="" loading="lazy" class="news-image" onerror="this.parentElement.style.display='none';"></div>` : ''; // alt simplifié

        // *** Vibe-O-Mètre HTML dynamique ***
        // Idéalement, les 'vibes' et counts viendraient du CSV ou d'une API. Ici, on simule.
        const vibes = [
            { key: 'idea', icon: 'fa-lightbulb', title: 'Intéressant !', count: Math.floor(Math.random() * 5) },
            { key: 'lol', icon: 'fa-laugh-squint', title: 'Haha !', count: Math.floor(Math.random() * 3) },
            { key: 'cool', icon: 'fa-meteor', title: 'Trop Cool !', count: Math.floor(Math.random() * 8) },
            { key: 'hmm', icon: 'fa-question', title: 'Hmm?', count: Math.floor(Math.random() * 2) }
        ];
        const vibeButtonsHtml = vibes.map(v =>
            `<button class="vibe-btn" data-vibe="${v.key}" data-article-ref="${articleId}" title="${v.title}">
                <i class="fas ${v.icon}"></i> <span class="count">(${v.count})</span>
            </button>`
        ).join('');
        const vibeHtml = `<div class="vibe-o-meter"><span>Vibes:</span> ${vibeButtonsHtml}</div>`;
        // *** Fin Vibe-O-Mètre HTML ***

        el.innerHTML = `<h3 class="news-title">${title}</h3>${displayDate ? `<p class="news-date"><i class="fas fa-calendar-alt"></i> ${displayDate}</p>` : ''}${imgHtml}<div class="news-content"><p>${description}</p></div>${vibeHtml}`;
        container.appendChild(el);
    });
}

function initializeVibeOMeter() {
    const newsContainer = document.getElementById('news-container');
    if (!newsContainer) return;

    // Utilisation de la délégation d'événement
    newsContainer.addEventListener('click', handleVibeClick);
}

function handleVibeClick(event) {
    const vibeButton = event.target.closest('.vibe-btn');
    if (!vibeButton) return; // Pas cliqué sur un bouton vibe

    event.preventDefault();
    playSound('vibeClick');

    // 1. Ajouter un feedback visuel temporaire
    vibeButton.classList.add('vibe-btn--clicked');
    setTimeout(() => {
        vibeButton.classList.remove('vibe-btn--clicked');
    }, 200); // Durée de l'effet 'clic'

    // 2. Mettre à jour le compteur (Simulation)
    const countSpan = vibeButton.querySelector('.count');
    if (countSpan) {
        // Extrait le nombre actuel, l'incrémente, et met à jour
        let currentCount = parseInt(countSpan.textContent.replace(/[()]/g, ''), 10) || 0;
        currentCount++;
        countSpan.textContent = `(${currentCount})`;
    }

    // 3. Empêcher les clics multiples trop rapides (optionnel)
    vibeButton.disabled = true;
    setTimeout(() => { vibeButton.disabled = false; }, 500); // Anti-spam simple

    // 4. Logique de sauvegarde (pour une VRAIE implémentation)
    const articleRef = vibeButton.dataset.articleRef;
    const vibeType = vibeButton.dataset.vibe;
    console.log(`[Vibe] Utilisateur a cliqué sur "${vibeType}" pour l'article "${articleRef}"`);
    // Ici, on appellerait une fonction pour sauvegarder ce vote (localStorage ou API)
    // saveVibe(articleRef, vibeType);
}

function displayNewsError(message) { displayGenericError(message, "news-container"); }


// ≈≈≈ EVENTS (Vortex Temporel) - Mise à jour pour Countdowns ---
function loadEvents() { /* ... (identique sauf msg chargement) ... */
     if (!mainContent) return; mainContent.innerHTML = `<h2>Vortex Temporel <i class="fas fa-calendar-days"></i></h2><div id="events-container" class="loading-state"><p class="loading-message">Scan des anomalies temporelles...</p></div>`; /*...*/ loadEventsLogic();
}
function loadEventsLogic(){/* ... Contient le reste de la logique loadEvents ... */
    if (typeof Papa === 'undefined') { displayGenericError("Biblio PapaParse manquante.", "events-container"); return;} Papa.parse(eventsCsvUrl, { download: true, header: true, skipEmptyLines: 'greedy', complete: (res) => { if(res.errors.length){displayEventsError(`Err Format: ${res.errors[0].message}`);return;} if(!res.data){displayEventsError("Données calendrier corrompues.");return;} processAndDisplayEvents(res.data);}, error:(err) => displayEventsError(`Err Charge: ${err.message}`)});
}
function processAndDisplayEvents(rawEventsData) { /* ... (identique pour tri/filtre) ... */
    const container = document.getElementById('events-container'); if (!container) return; container.classList.remove('loading-state'); container.innerHTML = ''; const now = new Date(); const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())); const validAndUpcoming = (rawEventsData || []).map(event => { const sdStr = event.DateDebut || event.Date; const edStr = event.DateFin; const t = event.Titre; const sd = parseDateBestEffort(sdStr); let ed = parseDateBestEffort(edStr); if (ed && sd && ed < sd) ed = null; if (!sd || !t) return null; // Associer l'heure à la date de début si présente
         const timeStr = event.Heure || event.heure || ''; let targetDateTime = sd; if(timeStr){ const timeParts = timeStr.match(/^(\d{1,2}):(\d{2})$/); if(timeParts){ try { sd.setUTCHours(parseInt(timeParts[1],10), parseInt(timeParts[2],10), 0, 0); targetDateTime = sd;} catch(e){console.warn(`Heure invalide ${timeStr} pour event ${t}`);}}} return { ...event, pStartDate: sd, pEndDate: ed, targetTimestamp: targetDateTime.getTime()}; }).filter(e => e && (e.pEndDate || e.pStartDate) >= today).sort((a, b) => a.pStartDate.getTime() - b.pStartDate.getTime()); displayEvents(validAndUpcoming);
}

function displayEvents(events) {
    const container = document.getElementById('events-container'); if (!container) return; container.innerHTML = '';
    if (events.length === 0) { container.innerHTML = '<p>Aucun événement futur détecté. Zone temporelle stable.</p>'; return; }
    const nowTs = Date.now();
    const dateOptsShort = { year: 'numeric', month: 'numeric', day: 'numeric', timeZone: 'UTC' }; const dateOptsLong = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' };

    events.forEach((event, index) => {
        const item = document.createElement('div'); item.className = 'event-item card-style';
        let dateStr = ''; const startFmt = event.pStartDate.toLocaleDateString('fr-FR', dateOptsLong); if (event.pEndDate && event.pEndDate.getTime() !== event.pStartDate.getTime()) { const endFmt = event.pEndDate.toLocaleDateString('fr-FR', dateOptsShort); const startShort = event.pStartDate.toLocaleDateString('fr-FR', dateOptsShort); dateStr = `Du ${startShort} au ${endFmt}`; } else { dateStr = startFmt; } let timeStr = ''; const time = event.Heure || event.heure; if (time) { const tParts = String(time).match(/^(\d{1,2}):(\d{2})$/); timeStr = tParts ? ` à ${tParts[1]}h${tParts[2]}` : ''; } const title = event.Titre || 'Événement'; const desc = (event.Description || '').replace(/\n/g, '<br>'); const loc = event.Lieu || '';

        // *** Countdown Logic Insertion ***
        let countdownHtml = '';
        const countdownThreshold = 90 * 24 * 60 * 60 * 1000; // 90 jours max pour afficher countdown
        if (event.targetTimestamp > nowTs && (event.targetTimestamp - nowTs < countdownThreshold)) {
             const countdownId = `countdown-${index}`;
             countdownHtml = `<div class="countdown-container">Début dans: <span class="countdown-timer" id="${countdownId}" data-target-ts="${event.targetTimestamp}">Calcul...</span></div>`;
             // Démarrer le timer APRES ajout au DOM
             setTimeout(() => startCountdown(countdownId, event.targetTimestamp), 0);
        }
        // *** Fin Countdown ***

        item.innerHTML = `<div class="event-date-time">${dateStr}${timeStr}</div><div class="event-details"><h4>${title}</h4>${loc ? `<p class="event-location"><i class="fas fa-map-marker-alt"></i> ${loc}</p>` : ''}${desc ? `<p class="event-description">${desc}</p>` : ''} ${countdownHtml}</div>`; container.appendChild(item);
    });
}

/** Démarre un timer de compte à rebours pour un élément */
function startCountdown(elementId, targetTimestamp) {
    const countdownElement = document.getElementById(elementId);
    if (!countdownElement) return;

    const updateCountdown = () => {
        const now = Date.now();
        const difference = targetTimestamp - now;

        if (difference <= 0) {
            countdownElement.textContent = "Commencé !";
            // trouver l'ID de cet interval pour l'arrêter
            const intervalId = activeCountdownIntervals.find(item => item.elementId === elementId)?.intervalId;
            if (intervalId) clearInterval(intervalId);
            activeCountdownIntervals = activeCountdownIntervals.filter(item => item.elementId !== elementId); // Nettoyer
            return;
        }

        countdownElement.textContent = formatTimeDifference(difference);
        // Optionnel: Jouer un tick discret (Attention: peut être très agaçant)
        // playSound('tick');
    };

    updateCountdown(); // Afficher immédiatement
    const intervalId = setInterval(updateCountdown, 1000); // Mettre à jour chaque seconde
    activeCountdownIntervals.push({ elementId: elementId, intervalId: intervalId }); // Stocker pour nettoyage
}

/** Nettoie tous les timers de compte à rebours actifs */
function clearAllCountdowns() {
    console.log(`[Countdown] Nettoyage de ${activeCountdownIntervals.length} timers.`);
    activeCountdownIntervals.forEach(item => clearInterval(item.intervalId));
    activeCountdownIntervals = [];
}

/** Formate la différence de temps en J/H/M/S */
function formatTimeDifference(ms) {
    if (ms <= 0) return "0s";
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / (24 * 3600));
    const secondsAfterDays = totalSeconds % (24 * 3600);
    const hours = Math.floor(secondsAfterDays / 3600);
    const secondsAfterHours = secondsAfterDays % 3600;
    const minutes = Math.floor(secondsAfterHours / 60);
    const seconds = secondsAfterHours % 60;

    let result = '';
    if (days > 0) result += `${days}j `;
    if (hours > 0 || days > 0) result += `${String(hours).padStart(2, '0')}h `; // Pad H si Jours présents
    if (minutes > 0 || hours > 0 || days > 0) result += `${String(minutes).padStart(2, '0')}m `; // Pad M si Heures/Jours présents
    result += `${String(seconds).padStart(2, '0')}s`; // Toujours afficher secondes

    return result.trim();
}

function displayEventsError(message) { displayGenericError(message, "events-container"); }

// ≈≈≈ PARTNERS (Galaxie Avantages) ≈≈≈
function loadPartners() { /* ... (identique sauf msg chargement) ... */
     if (!mainContent) return; mainContent.innerHTML = `<h2>Galaxie Avantages <i class="fas fa-star"></i></h2><div id="partners-container" class="loading-state"><p class="loading-message">Scan hyperspatial des partenaires...</p></div>`; /*...*/ loadPartnersLogic();
}
function loadPartnersLogic(){/* ... Reste logique loadPartners ... */
    if (typeof Papa === 'undefined') { displayGenericError("Biblio PapaParse manquante.", "partners-container"); return; } Papa.parse(partnersCsvUrl, { download: true, header: true, skipEmptyLines: 'greedy', complete: (res) => { if(res.errors.length){displayPartnersError(`Err Format: ${res.errors[0].message}`);return;} if(!res.data){displayPartnersError("Données partenaires corrompues.");return;} displayPartners(groupPartnersByCategory(res.data));}, error:(err) => displayPartnersError(`Err Charge: ${err.message}`)});
}
function groupPartnersByCategory(partnersData) { /* ... (identique) ... */ }
function displayPartners(groupedPartners) { /* ... (identique) ... */ }
function displayPartnersError(message) { displayGenericError(message, "partners-container"); }

// ≈≈≈ MEMBERS (L'Équipage) ≈≈≈
function loadMembers() { /* ... (identique sauf msg chargement) ... */
    if (!mainContent) return; mainContent.innerHTML = `<h2>L'Équipage <i class="fas fa-user-astronaut"></i></h2><div id="members-container" class="loading-state"><p class="loading-message">Analyse biométrique de l'équipage...</p></div>`; /*...*/ loadMembersLogic();
}
function loadMembersLogic(){/* ... Reste logique loadMembers ... */
    if (typeof Papa === 'undefined') { displayGenericError("Biblio PapaParse manquante.", "members-container"); return; } Papa.parse(membersCsvUrl, { download: true, header: true, skipEmptyLines: 'greedy', complete: (res) => { if(res.errors.length){displayMembersError(`Err Format: ${res.errors[0].message}`);return;} if(!res.data){displayMembersError("Données équipage corrompues.");return;} displayMembers(res.data);}, error:(err) => displayMembersError(`Err Charge: ${err.message}`)});
}
function displayMembers(membersData) { /* ... (identique) ... */ }
function displayMembersError(message) { displayGenericError(message, "members-container"); }


// --- FORM INJECTION & HANDLING ---
function injectCoffeeForm() { /* ... (identique, injecte le HTML du formulaire café) ... */
     if (!mainContent) return; const formHTML = `<h2>SOS Caféine ...</h2> ... (le HTML complet ici) ... `; mainContent.innerHTML = formHTML; attachFormEvents('reportForm');
}
function injectContactForm() { /* ... (identique, injecte le HTML du formulaire contact) ... */
     if (!mainContent) return; const formHTML = `<h2>Holocom' CSE ...</h2> ... (le HTML complet ici) ... `; mainContent.innerHTML = formHTML; attachFormEvents('contactForm');
}
function attachFormEvents(formId) { /* ... (identique, ajoute listener submit) ... */
    const form = document.getElementById(formId); if(!form)return; const btn = form.querySelector('button[type="submit"]'); const sts = form.querySelector('.form-status-sending'); const conf = form.querySelector('.confirmation-message'); form.addEventListener('submit', (event) => { window.isFormSubmitting = true; if(btn) btn.disabled = true; if(sts) sts.style.display = 'block'; if(conf) conf.style.display = 'none'; });
}
function onFormSubmit(formId) { /* ... (identique à la version corrigée, avec getComputedStyle pour scroll) ... */
     if (!window.isFormSubmitting) return; window.isFormSubmitting = false; console.log(`[Form Submit] Reçu iframe pour ${formId}.`); const form = document.getElementById(formId); if (!form) { console.warn(`[Form Submit] Form #${formId} introuvable.`); return; } const btn = form.querySelector('button[type="submit"]'); const sts = form.querySelector('.form-status-sending'); const conf = form.querySelector('.confirmation-message'); if (sts) sts.style.display = 'none'; if (conf) conf.style.display = 'block'; if (form) form.style.display = 'none'; try { const bdySt = window.getComputedStyle(document.body); const hStr = bdySt.getPropertyValue('--header-height').trim()||'65px'; const hH = parseFloat(hStr)||65; if (mainContent) { const scrollTarget = mainContent.offsetTop - hH - 10; window.scrollTo({ top: scrollTarget > 0 ? scrollTarget : 0, behavior: 'smooth'}); }} catch(err){ console.error("[Form Submit] Err scroll:", err);}
}


// --- STATIC PAGE INJECTION ---
function injectAccueilPage() { /* ... (identique) ... */ }
function injectBoostersPage() { /* ... (identique) ... */ }
function loadPlaceholderPage(pageId) { /* ... (identique, avec icône qui tourne) ... */ }


// --- HELPER FUNCTIONS ---
function parseDateBestEffort(dateString) { /* ... (identique) ... */ }
function displayGenericError(message, containerId) { /* ... (identique) ... */ }


// --- THEME HANDLING FUNCTIONS ---
// ... (applyTheme avec playSound('themeChange'), loadSavedTheme, updateThemeButtonStates, initializeThemeSwitcher - Identiques) ...
function applyTheme(themeName) { const validThemeName = KNOWN_THEMES.includes(themeName) ? themeName : DEFAULT_THEME; console.log(`App Thème : ${validThemeName}`); document.body.classList.remove(...KNOWN_THEMES); document.body.classList.add(validThemeName); try {localStorage.setItem(THEME_STORAGE_KEY, validThemeName); } catch (e) { console.warn("LocalStorage non dispo:", e); } updateThemeButtonStates(validThemeName); playSound('themeChange'); } // <<< SON AJOUTÉ ICI
function loadSavedTheme() { let savedTheme = DEFAULT_THEME; try {savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || DEFAULT_THEME; } catch (e) {} if (!KNOWN_THEMES.includes(savedTheme)) savedTheme = DEFAULT_THEME; applyTheme(savedTheme); }
function updateThemeButtonStates(activeTheme) { const btns = document.querySelectorAll('.theme-buttons-wrapper button.theme-button'); btns.forEach(b => { b.classList.toggle('active-theme', b.dataset.theme === activeTheme); }); }
function initializeThemeSwitcher() { if (!themeButtonsWrapper) {console.error("Conteneur boutons thème introuvable."); return;} themeButtonsWrapper.addEventListener('click', (e) => { const btn = e.target.closest('button[data-theme]'); if (btn) { e.preventDefault(); applyTheme(btn.dataset.theme); }});}

// --- PWA HANDLING FUNCTIONS ---
// ... (beforeinstallprompt, handleInstallClick avec playSound('installAccept'), appinstalled - Identiques) ...
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; if (installButton) { console.log('PWA install dispo.'); installButton.style.display = 'inline-block'; }});
function handleInstallClick() { if (!deferredPrompt) return; if(installButton) installButton.style.display = 'none'; deferredPrompt.prompt(); deferredPrompt.userChoice.then((choice) => { console.log('PWA install outcome:', choice.outcome); if(choice.outcome === 'accepted') { playSound('installAccept'); } deferredPrompt = null; }); } // <<< SON AJOUTÉ ICI
window.addEventListener('appinstalled', () => { console.log('PWA installée!'); if(installButton) installButton.style.display = 'none'; deferredPrompt = null;});


// --- DOMContentLoaded INITIALIZER ---
document.addEventListener('DOMContentLoaded', () => {
    if (hamburger) hamburger.addEventListener('click', toggleMenu); else console.error("Hamburger manquant.");
    if (installButton) installButton.addEventListener('click', handleInstallClick); else console.info("Bouton PWA non trouvé.");

    initializeSidebarSound(); // Attacher l'écouteur pour le son de nav
    updateFooterYear();
    initializeThemeSwitcher();
    loadSavedTheme();       // Charge et applique le thème initial SANS jouer le son
    playSound('themeChange'); // Joue le son une fois au démarrage après chargement thème initial

    loadPage('accueil'); // Démarrer sur l'accueil

    if(mainContent) { mainContent.addEventListener('click', () => { if(sidebar && sidebar.classList.contains('active')) { closeMenu(); } }); }
    if ('serviceWorker' in navigator) { navigator.serviceWorker.register('sw.js').then(() => console.log('SW OK.')).catch(err => console.error('SW Échec:', err)); } else { console.warn('SW non supporté.'); }

    console.log("Réacteur CSE V1.1 Initialisé et Paré.");
});

// Fin du script complet Dinguerie V1
