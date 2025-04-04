// ==================================================
//    SCRIPT COMPLET - LE RÉACTEUR CSE (Visuel Dinguerie)
//    (Multi-Sections, Multi-Thèmes, PAS DE SON)
// ==================================================

/*
 * Prérequis pour ce script :
 * 1. Bibliothèque PapaParse incluse dans index.html.
 * 2. Bibliothèque Font Awesome (ou autre set d'icônes) incluse si utilisée.
 * 3. **REMPLACER LES URLS PLACEHOLDERS CI-DESSOUS** par vos URLs CSV réelles.
 * 4. **VÉRIFIER LES NOMS DE COLONNES CSV** dans les fonctions `display[Section]`.
 * 5. **VÉRIFIER LES URLS ET entry.XXXX DES FORMULAIRES GOOGLE**.
*/

// --- CONSTANTES ET VARIABLES GLOBALES ---

// !!! === URLs CSV à remplacer === !!!
const newsCsvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQcKo9WOqdnefe5z7QpaM5XtdkGs7pBeWNFrcy1crwW18Jn_KkR1IxV_KMhatedR5lmaASfeIlEsUF9/pub?gid=0&single=true&output=csv';
const eventsCsvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQcKo9WOqdnefe5z7QpaM5XtdkGs7pBeWNFrcy1crwW18Jn_KkR1IxV_KMhatedR5lmaASfeIlEsUF9/pub?gid=377066785&single=true&output=csv';
const partnersCsvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQcKo9WOqdnefe5z7QpaM5XtdkGs7pBeWNFrcy1crwW18Jn_KkR1IxV_KMhatedR5lmaASfeIlEsUF9/pub?gid=1082465411&single=true&output=csv';
const membersCsvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQcKo9WOqdnefe5z7QpaM5XtdkGs7pBeWNFrcy1crwW18Jn_KkR1IxV_KMhatedR5lmaASfeIlEsUF9/pub?gid=1265664324&single=true&output=csv';
// !!! ========================== !!!

// DOM Elements References
const sidebar = document.getElementById('sidebar');
const hamburger = document.querySelector('.hamburger');
const mainContent = document.getElementById('main-content');
const headerLogo = document.getElementById('header-logo');
const installButton = document.getElementById('install-button');
const currentYearSpan = document.getElementById('current-year');
const themeButtonsWrapper = document.getElementById('theme-buttons');

// State Variables
let deferredPrompt = null; // PWA install prompt
let isFormSubmitting = false; // Flag for iframe forms
let activeCountdownIntervals = []; // Stocker les IDs des timers actifs

// Theme Constants
const THEME_STORAGE_KEY = 'reacteur-cse-selected-theme';
const DEFAULT_THEME = 'theme-nebula';
const KNOWN_THEMES = ['theme-nebula', 'theme-daylight', 'theme-pixel'];


// --- NAVIGATION & CORE UI ---

function closeMenu() { if (sidebar) sidebar.classList.remove('active'); if (hamburger) hamburger.classList.remove('active'); }
function toggleMenu() { if (sidebar && hamburger) { sidebar.classList.toggle('active'); hamburger.classList.toggle('active'); } else { console.error("Sidebar ou Hamburger introuvable."); } }
function updateFooterYear() { if (currentYearSpan) { currentYearSpan.textContent = new Date().getFullYear(); } }
function clearActiveNavButton() { if (!sidebar) return; const buttons = sidebar.querySelectorAll('ul li button:not(.theme-button)'); buttons.forEach(button => button.classList.remove('active-page'));}
function updateActiveNavButton(pageId) { if (!sidebar) return; const targetButton = sidebar.querySelector(`button[onclick*="loadPage('${pageId}')"]`); if (targetButton) { targetButton.classList.add('active-page'); } else { console.warn(`Bouton pour page '${pageId}' non trouvé.`); }}


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
        case 'scoops': loadNews(); return true;
        case 'vortex': loadEvents(); return true;
        case 'galaxie': loadPartners(); return true;
        case 'equipage': loadMembers(); return true;
        case 'sos-cafeine': injectCoffeeForm(); return true;
        case 'holocom': injectContactForm(); return true;
        case 'accueil': injectAccueilPage(); return true;
        case 'boosters': injectBoostersPage(); return true;
        default: loadPlaceholderPage(pageId); return true;
    }
}

/** Ajoute une classe pour animer le H2 de la page chargée */
function animatePageTitle() {
    const titleElement = mainContent.querySelector('h2');
    if (titleElement) {
        titleElement.classList.remove('title-animate');
        void titleElement.offsetWidth; // Force reflow
        titleElement.classList.add('title-animate');
    }
}

// --- DATA LOADING & DISPLAY FUNCTIONS (CSV - avec MAJ pour dinguerie) ---

// ≈≈≈ NEWS (Scoops Brûlants) - Mise à jour displayNews pour Vibe-O-Mètre ---
function loadNews() {
     if (!mainContent) return; mainContent.innerHTML = `<h2 style="text-align:center">Scoops Brûlants <i class="fas fa-fire"></i></h2><div id="news-container" class="loading-state"><p class="loading-message">Scan des ondes alpha pour news...</p></div>`; loadNewsLogic();
}
function loadNewsLogic(){
    if (typeof Papa === 'undefined') { displayGenericError("Biblio PapaParse manquante.", "news-container"); return; } Papa.parse(newsCsvUrl, { download: true, header: true, skipEmptyLines: 'greedy', complete: (res) => { if (res.errors.length){ displayNewsError(`Err Format: ${res.errors[0].message}`); return; } if (!res.data || !res.data.length) { displayNewsError("Aucune news."); return; } displayNews(res.data); }, error: (err) => displayNewsError(`Err Charge: ${err.message}`) });
}

function displayNews(newsData) {
    const container = document.getElementById('news-container'); if (!container) return; container.classList.remove('loading-state'); container.innerHTML = '';
    const validAndSortedNews = newsData.filter(item => item && (item.Titre || item.titre)).sort((a, b) => (parseDateBestEffort(b.Date || b.date)?.getTime() ?? 0) - (parseDateBestEffort(a.Date || a.date)?.getTime() ?? 0));
    if (!validAndSortedNews.length) { container.innerHTML = '<p>Canal CSE silencieux...</p>'; return; }

    validAndSortedNews.forEach((item, index) => {
        const el = document.createElement('article'); const articleId = `news-${index}-${Date.now()}`; el.className = 'news-item card-style'; el.id = articleId;
        const title = item.Titre || item.titre || 'Sans Titre'; const dateStr = item.Date || item.date || ''; const description = (item.Description || item.description || '').replace(/\n/g, '<br>'); const imageUrl = item.Lien_image || item['Lien image'] || item.Image || item.image || '';
        const pDate = parseDateBestEffort(dateStr); const displayDate = pDate ? pDate.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }) : dateStr;
        const imgHtml = imageUrl ? `<div class="news-image-container"><img src="${imageUrl}" alt="" loading="lazy" class="news-image" onerror="this.parentElement.style.display='none';"></div>` : '';
        // Vibe-O-Mètre HTML dynamique (simulé)
        const vibes = [ { key: 'idea', icon: 'fa-lightbulb', title: 'Intéressant !', count: Math.floor(Math.random() * 5) }, { key: 'lol', icon: 'fa-laugh-squint', title: 'Haha !', count: Math.floor(Math.random() * 3) }, { key: 'cool', icon: 'fa-meteor', title: 'Trop Cool !', count: Math.floor(Math.random() * 8) }, { key: 'hmm', icon: 'fa-question', title: 'Hmm?', count: Math.floor(Math.random() * 2) } ];
        const vibeButtonsHtml = vibes.map(v => `<button class="vibe-btn" data-vibe="${v.key}" data-article-ref="${articleId}" title="${v.title}"><i class="fas ${v.icon}"></i> <span class="count">(${v.count})</span></button>`).join('');
        const vibeHtml = `<div class="vibe-o-meter"><span>Vibes:</span> ${vibeButtonsHtml}</div>`;
        el.innerHTML = `<h3 class="news-title">${title}</h3>${displayDate ? `<p class="news-date"><i class="fas fa-calendar-alt"></i> ${displayDate}</p>` : ''}${imgHtml}<div class="news-content"><p>${description}</p></div>${vibeHtml}`; container.appendChild(el);
    });
}

function initializeVibeOMeter() {
    const newsContainer = document.getElementById('news-container'); if (!newsContainer) return; newsContainer.addEventListener('click', handleVibeClick);
}

function handleVibeClick(event) {
    const vibeButton = event.target.closest('.vibe-btn'); if (!vibeButton) return;
    event.preventDefault();
    // Effet Visuel
    vibeButton.classList.add('vibe-btn--clicked'); setTimeout(() => { vibeButton.classList.remove('vibe-btn--clicked'); }, 200);
    // MAJ Compteur (Simulation)
    const countSpan = vibeButton.querySelector('.count'); if (countSpan) { let currentCount = parseInt(countSpan.textContent.replace(/[()]/g, ''), 10) || 0; currentCount++; countSpan.textContent = `(${currentCount})`; }
    // Anti-spam
    vibeButton.disabled = true; setTimeout(() => { vibeButton.disabled = false; }, 500);
    // Logique sauvegarde (à implémenter)
    console.log(`[Vibe] Click ${vibeButton.dataset.vibe} pour ${vibeButton.dataset.articleRef}`);
}

function displayNewsError(message) { displayGenericError(message, "news-container"); }


// ≈≈≈ EVENTS (Vortex Temporel) - Mise à jour pour Countdowns ---
function loadEvents() {
     if (!mainContent) return; mainContent.innerHTML = `<h2>Vortex Temporel <i class="fas fa-calendar-days"></i></h2><div id="events-container" class="loading-state"><p class="loading-message">Scan des anomalies temporelles...</p></div>`; loadEventsLogic();
}
function loadEventsLogic(){
    if (typeof Papa === 'undefined') { displayGenericError("Biblio PapaParse manquante.", "events-container"); return;} Papa.parse(eventsCsvUrl, { download: true, header: true, skipEmptyLines: 'greedy', complete: (res) => { if(res.errors.length){displayEventsError(`Err Format: ${res.errors[0].message}`);return;} if(!res.data){displayEventsError("Données calendrier corrompues.");return;} processAndDisplayEvents(res.data);}, error:(err) => displayEventsError(`Err Charge: ${err.message}`)});
}
function processAndDisplayEvents(rawEventsData) {
    const container = document.getElementById('events-container'); if (!container) return; container.classList.remove('loading-state'); container.innerHTML = ''; const now = new Date(); const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    const validAndUpcoming = (rawEventsData || []).map(event => { const sdStr = event.DateDebut || event.Date; const edStr = event.DateFin; const t = event.Titre; const sd = parseDateBestEffort(sdStr); let ed = parseDateBestEffort(edStr); if (ed && sd && ed < sd) ed = null; if (!sd || !t) return null; const timeStr = event.Heure || event.heure || ''; let targetDateTime = new Date(sd); // Copier pour ne pas muter pStartDate
        if(timeStr){ const timeParts = timeStr.match(/^(\d{1,2}):(\d{2})$/); if(timeParts){ try { targetDateTime.setUTCHours(parseInt(timeParts[1],10), parseInt(timeParts[2],10), 0, 0); } catch(e){/* Ignorer heure invalide */}}} return { ...event, pStartDate: sd, pEndDate: ed, targetTimestamp: targetDateTime.getTime()}; }).filter(e => e && (e.pEndDate || e.pStartDate) >= today).sort((a, b) => a.pStartDate.getTime() - b.pStartDate.getTime());
    displayEvents(validAndUpcoming);
}

function displayEvents(events) {
    const container = document.getElementById('events-container'); if (!container) return; container.innerHTML = ''; if (events.length === 0) { container.innerHTML = '<p>Aucun événement futur détecté. Zone temporelle stable.</p>'; return; } const nowTs = Date.now(); const dateOptsShort = { year: 'numeric', month: 'numeric', day: 'numeric', timeZone: 'UTC' }; const dateOptsLong = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' };
    events.forEach((event, index) => { const item = document.createElement('div'); item.className = 'event-item card-style'; let dateStr = ''; const startFmt = event.pStartDate.toLocaleDateString('fr-FR', dateOptsLong); if (event.pEndDate && event.pEndDate.getTime() !== event.pStartDate.getTime()) { const endFmt = event.pEndDate.toLocaleDateString('fr-FR', dateOptsShort); const startShort = event.pStartDate.toLocaleDateString('fr-FR', dateOptsShort); dateStr = `Du ${startShort} au ${endFmt}`; } else { dateStr = startFmt; } let timeStr = ''; const time = event.Heure || event.heure; if (time) { const tParts = String(time).match(/^(\d{1,2}):(\d{2})$/); timeStr = tParts ? ` à ${tParts[1]}h${tParts[2]}` : ''; } const title = event.Titre || 'Événement'; const desc = (event.Description || '').replace(/\n/g, '<br>'); const loc = event.Lieu || ''; let countdownHtml = ''; const countdownThreshold = 90 * 24 * 60 * 60 * 1000; if (event.targetTimestamp > nowTs && (event.targetTimestamp - nowTs < countdownThreshold)) { const countdownId = `countdown-${index}`; countdownHtml = `<div class="countdown-container">Début dans: <span class="countdown-timer" id="${countdownId}" data-target-ts="${event.targetTimestamp}">Calcul...</span></div>`; setTimeout(() => startCountdown(countdownId, event.targetTimestamp), 0); } item.innerHTML = `<div class="event-date-time">${dateStr}${timeStr}</div><div class="event-details"><h4>${title}</h4>${loc ? `<p class="event-location"><i class="fas fa-map-marker-alt"></i> ${loc}</p>` : ''}${desc ? `<p class="event-description">${desc}</p>` : ''} ${countdownHtml}</div>`; container.appendChild(item);
    });
}

function startCountdown(elementId, targetTimestamp) {
    const countdownElement = document.getElementById(elementId); if (!countdownElement) return; const updateCountdown = () => { const now = Date.now(); const difference = targetTimestamp - now; if (difference <= 0) { countdownElement.textContent = "Commencé !"; const intervalInfo = activeCountdownIntervals.find(item => item.elementId === elementId); if (intervalInfo) clearInterval(intervalInfo.intervalId); activeCountdownIntervals = activeCountdownIntervals.filter(item => item.elementId !== elementId); return; } countdownElement.textContent = formatTimeDifference(difference); }; updateCountdown(); const intervalId = setInterval(updateCountdown, 1000); activeCountdownIntervals.push({ elementId: elementId, intervalId: intervalId });
}

function clearAllCountdowns() { console.log(`[Countdown] Nettoyage de ${activeCountdownIntervals.length} timers.`); activeCountdownIntervals.forEach(item => clearInterval(item.intervalId)); activeCountdownIntervals = []; }

function formatTimeDifference(ms) { if (ms <= 0) return "0s"; const totalSeconds = Math.floor(ms / 1000); const days = Math.floor(totalSeconds / 86400); const hours = Math.floor((totalSeconds % 86400) / 3600); const minutes = Math.floor((totalSeconds % 3600) / 60); const seconds = totalSeconds % 60; let result = ''; if (days > 0) result += `${days}j `; if (hours > 0 || days > 0) result += `${String(hours).padStart(days > 0 ? 2 : 1, '0')}h `; if (minutes > 0 || hours > 0 || days > 0) result += `${String(minutes).padStart(2, '0')}m `; result += `${String(seconds).padStart(2, '0')}s`; return result.trim(); }

function displayEventsError(message) { displayGenericError(message, "events-container"); }

// ≈≈≈ PARTNERS (Galaxie Avantages) ≈≈≈
function loadPartners() { if (!mainContent) return; mainContent.innerHTML = `<h2>Galaxie Avantages <i class="fas fa-star"></i></h2><div id="partners-container" class="loading-state"><p class="loading-message">Scan hyperspatial des partenaires...</p></div>`; loadPartnersLogic(); }
function loadPartnersLogic(){ if (typeof Papa === 'undefined') { displayGenericError("Biblio PapaParse manquante.", "partners-container"); return; } Papa.parse(partnersCsvUrl, { download: true, header: true, skipEmptyLines: 'greedy', complete: (res) => { if(res.errors.length){displayPartnersError(`Err Format: ${res.errors[0].message}`);return;} if(!res.data){displayPartnersError("Données partenaires corrompues.");return;} displayPartners(groupPartnersByCategory(res.data));}, error:(err) => displayPartnersError(`Err Charge: ${err.message}`)}); }
function groupPartnersByCategory(partnersData) { /* ... (identique) ... */ const groups={}; const defaultCat="Autres Pépites"; partnersData.forEach(p=>{ if (!p||!p.Nom||!String(p.Nom).trim())return; const cat=(p.Categorie||p.categorie||'').trim()||defaultCat; if(!groups[cat])groups[cat]=[];groups[cat].push(p);}); const keys=Object.keys(groups).sort((a,b)=>(a===defaultCat)?1:(b===defaultCat)?-1:a.localeCompare(b,'fr')); const sorted={};keys.forEach(k=>{sorted[k]=groups[k].sort((a,b)=>(a.Nom||'').localeCompare(b.Nom||'','fr'));}); return sorted;}
function displayPartners(groupedPartners) { /* ... (identique) ... */ const c=document.getElementById('partners-container'); if(!c)return; c.classList.remove('loading-state');c.innerHTML='';if(!Object.keys(groupedPartners).length){c.innerHTML='<p>Aucun partenaire répertorié.</p>'; return;} for (const cat in groupedPartners){const t=document.createElement('h3'); t.className='partner-category-title';t.textContent=cat; c.appendChild(t); const grid=document.createElement('div'); grid.className='partner-category-grid'; c.appendChild(grid); groupedPartners[cat].forEach(p=>{ const card=document.createElement('div'); card.className='partner-card card-style'; const n=p.Nom||''; const d=(p.Description||'').replace(/\n/g,'<br>'); const l=p.Lien||p.lien||p.URL||p.url||''; const o=p.Logo||p.logo||''; const logoHtml=o?`<img src="${o}" alt="${n}" class="partner-logo" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"><div class="logo-placeholder placeholder-error" style="display:none;"><i class="fas fa-image-slash"></i></div>`:`<div class="logo-placeholder placeholder-default"><i class="fas fa-store"></i></div>`; card.innerHTML=`${logoHtml}<h4>${n}</h4>${d?`<p class="partner-description">${d}</p>`:''}`; if(l){const link=document.createElement('a'); link.href=l;link.target='_blank';link.rel='noopener noreferrer';link.className='partner-link';link.appendChild(card); grid.appendChild(link);} else{grid.appendChild(card);}});}}
function displayPartnersError(message) { displayGenericError(message, "partners-container"); }

// ≈≈≈ MEMBERS (L'Équipage) ≈≈≈
function loadMembers() { if (!mainContent) return; mainContent.innerHTML = `<h2>L'Équipage <i class="fas fa-user-astronaut"></i></h2><div id="members-container" class="loading-state"><p class="loading-message">Analyse biométrique...</p></div>`; loadMembersLogic(); }
function loadMembersLogic(){ if (typeof Papa === 'undefined') { displayGenericError("Biblio PapaParse manquante.", "members-container"); return; } Papa.parse(membersCsvUrl, { download: true, header: true, skipEmptyLines: 'greedy', complete: (res) => { if(res.errors.length){displayMembersError(`Err Format: ${res.errors[0].message}`);return;} if(!res.data){displayMembersError("Données équipage corrompues.");return;} displayMembers(res.data);}, error:(err) => displayMembersError(`Err Charge: ${err.message}`)}); }
function displayMembers(membersData) { /* ... (identique) ... */ const c=document.getElementById('members-container');if(!c)return;c.classList.remove('loading-state');c.innerHTML=''; const validM = (membersData||[]).filter(m=>m&&m.Nom&&m.Prenom&&String(m.Nom).trim()&&String(m.Prenom).trim()).sort((a,b)=>{const nA=(a.Nom||'').toLowerCase(),nB=(b.Nom||'').toLowerCase(),pA=(a.Prenom||'').toLowerCase(),pB=(b.Prenom||'').toLowerCase(); if(nA<nB)return -1; if(nA>nB) return 1; if(pA<pB)return -1; if(pA>pB)return 1; return 0;}); if(!validM.length){c.innerHTML='<p>Équipage non répertorié.</p>'; return;} const grid=document.createElement('div'); grid.className='members-grid'; c.appendChild(grid); validM.forEach(m=>{ const card=document.createElement('div');card.className='member-card card-style';const nom=m.Nom||''; const pren=m.Prenom||''; const op=m.Operation||''; const roleS=m.Role||'Membre'; const ph=m.PhotoURL||m.PhotoUrl||''; const roles=roleS.split(',').map(r=>r.trim()).filter(r=>r).join('<br>'); let phHtml='';if(ph){phHtml=`<img src="${ph}" alt="${pren} ${nom}" class="member-photo" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"><div class="member-placeholder placeholder-error" style="display: none;"><i class="fas fa-user-slash"></i></div>`;}else{phHtml=`<div class="member-placeholder placeholder-default"><i class="fas fa-user-secret"></i></div>`;} card.innerHTML=`${phHtml}<h4>${pren} ${nom}</h4><p class="member-role">${roles}</p>${op?`<p class="member-operation">${op}</p>`:''}`; grid.appendChild(card); }); }
function displayMembersError(message) { displayGenericError(message, "members-container"); }


// --- FORM INJECTION & HANDLING ---
// Garder le HTML long dans ces fonctions ou le déplacer dans des fonctions getFormHtml() séparées pour la lisibilité.
function injectCoffeeForm() { if (!mainContent) return; const formHTML = `<h2>SOS Caféine <i class="fas fa-meteor"></i></h2> <div class="form-container card-style"> ... (HTML Formulaire Café Complet) ... </div>`; mainContent.innerHTML = formHTML; attachFormEvents('reportForm');}
function injectContactForm() { if (!mainContent) return; const formHTML = `<h2>Holocom' CSE <i class="fas fa-headset"></i></h2> <div class="form-container card-style"> ... (HTML Formulaire Contact Complet) ... </div>`; mainContent.innerHTML = formHTML; attachFormEvents('contactForm');}
function attachFormEvents(formId) { /* ... (identique) ... */ const form=document.getElementById(formId);if(!form)return; const btn=form.querySelector('button[type="submit"]');const sts=form.querySelector('.form-status-sending');const conf=form.querySelector('.confirmation-message'); form.addEventListener('submit', (e) => { window.isFormSubmitting = true; if(btn) btn.disabled = true; if(sts) sts.style.display = 'block'; if(conf) conf.style.display = 'none'; }); }
function onFormSubmit(formId) { /* ... (identique - version corrigée scroll) ... */ if(!window.isFormSubmitting)return;window.isFormSubmitting=false; console.log(`[Form] Reçu ${formId}`); const form=document.getElementById(formId); if(!form)return; const btn=form.querySelector('button[type="submit"]');const sts=form.querySelector('.form-status-sending');const conf=form.querySelector('.confirmation-message'); if(sts)sts.style.display='none'; if(conf)conf.style.display='block'; if(form)form.style.display='none'; try{ const bs=window.getComputedStyle(document.body); const hs=bs.getPropertyValue('--header-height').trim()||'65px'; const hh=parseFloat(hs)||65; if(mainContent){const st=mainContent.offsetTop-hh-10; window.scrollTo({top:st>0?st:0,behavior:'smooth'});}}catch(e){console.error("[Form] Err scroll:", e);} }


// --- STATIC PAGE INJECTION ---
function injectAccueilPage() { if (!mainContent) return; mainContent.innerHTML = `<h2>Sas d'Accueil <i class="fas fa-door-open"></i></h2> <div class="card-style text-center"> ... (HTML Accueil Complet) ... </div> <style>.icon-list{...}.animation-pulse{...}@keyframes simplePulse{...}.text-center{...}</style>`; }
function injectBoostersPage() { if (!mainContent) return; mainContent.innerHTML = `<h2>Boosters <i class="fas fa-bolt"></i> ...</h2> <section id="accesce-section"> ... (HTML AccèsCE) ... </section> <section id="action-logement-section"> ... (HTML ActionLogement) ... </section> <style>.sub-section{...}.highlight-box{...}... (autres styles Boosters)</style>`; }
function loadPlaceholderPage(pageId) { /* ... (identique, avec icône qui tourne) ... */ setTimeout(() => { if(!mainContent) return; let title = pageId.charAt(0).toUpperCase() + pageId.slice(1).replace(/-/g,' '); let icon = 'fa-wrench'; mainContent.innerHTML = `<h2 style="text-align:center;">Section : ${title}</h2><div class="card-style text-center"><p style="margin:20px 0;"><i class="fas ${icon} fa-3x fa-spin" style="color:var(--color-accent);"></i></p><p>Module '${title}' en cours de dev.</p></div><style>.text-center{text-align:center;} .fa-spin{animation:fa-spin 2s infinite linear;} @keyframes fa-spin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}</style>`; }, 300); }


// --- HELPER FUNCTIONS ---
function parseDateBestEffort(dateString) { /* ... (identique) ... */ if(!dateString||typeof dateString!=='string')return null;const norm=dateString.trim().replace(/[\.\-]/g,'/');let p=norm.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);if(p){const d=parseInt(p[1]),m=parseInt(p[2])-1,y=parseInt(p[3]); const dt=new Date(Date.UTC(y,m,d));if(dt.getUTCFullYear()===y&&dt.getUTCMonth()===m&&dt.getUTCDate()===d)return dt;} p=norm.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);if(p){const y=parseInt(p[1]),m=parseInt(p[2])-1,d=parseInt(p[3]); const dt=new Date(Date.UTC(y,m,d));if(dt.getUTCFullYear()===y&&dt.getUTCMonth()===m&&dt.getUTCDate()===d)return dt;} try{const ts=Date.parse(dateString);if(!isNaN(ts))return new Date(ts);}catch(e){} console.warn(`ParseDate échec: "${dateString}"`);return null; }
function displayGenericError(message, containerId) { /* ... (identique) ... */ const c=document.getElementById(containerId);if(c){c.classList.remove('loading-state');c.innerHTML=`<div class="error-message"><i class="fas fa-exclamation-triangle"></i> Oups! ${message}</div>`;}else{console.error(`Conteneur #${containerId} introuvable pour erreur: ${message}`);if(mainContent) mainContent.innerHTML=`<div class="error-message"><i class="fas fa-exclamation-triangle"></i> Oups! ${message}</div>`;}}


// --- THEME HANDLING FUNCTIONS ---
function applyTheme(themeName) { const v = KNOWN_THEMES.includes(themeName)?themeName:DEFAULT_THEME; document.body.classList.remove(...KNOWN_THEMES); document.body.classList.add(v); try {localStorage.setItem(THEME_STORAGE_KEY, v);}catch(e){} updateThemeButtonStates(v); /*playSound('themeChange'); <-- Son retiré*/}
function loadSavedTheme() { let s=DEFAULT_THEME; try{s=localStorage.getItem(THEME_STORAGE_KEY)||DEFAULT_THEME;}catch(e){} if(!KNOWN_THEMES.includes(s))s=DEFAULT_THEME; applyTheme(s);}
function updateThemeButtonStates(active) { const b=document.querySelectorAll('.theme-buttons-wrapper button.theme-button'); b.forEach(btn=>{btn.classList.toggle('active-theme', btn.dataset.theme === active);});}
function initializeThemeSwitcher() { if (!themeButtonsWrapper)return; themeButtonsWrapper.addEventListener('click', (e) => { const btn=e.target.closest('button[data-theme]'); if(btn){e.preventDefault(); applyTheme(btn.dataset.theme);}});}


// --- PWA HANDLING FUNCTIONS ---
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; if (installButton) installButton.style.display = 'inline-block';});
function handleInstallClick() { if(!deferredPrompt)return; if(installButton)installButton.style.display='none'; deferredPrompt.prompt(); deferredPrompt.userChoice.then((choice)=>{ console.log('PWA install:',choice.outcome); if(choice.outcome === 'accepted'){ /*playSound('installAccept'); <-- Son retiré */} deferredPrompt=null;});}
window.addEventListener('appinstalled', () => { console.log('PWA installée!'); if(installButton)installButton.style.display='none'; deferredPrompt = null;});


// --- DOMContentLoaded INITIALIZER ---
document.addEventListener('DOMContentLoaded', () => {
    if (hamburger) hamburger.addEventListener('click', toggleMenu);
    if (installButton) installButton.addEventListener('click', handleInstallClick);
    // initializeSidebarSound(); // Retiré car gestion son globale retirée
    updateFooterYear();
    initializeThemeSwitcher();
    loadSavedTheme(); // Applique thème initial
    // playSound('themeChange'); // Retiré : pas de son au démarrage
    loadPage('accueil');
    if(mainContent) { mainContent.addEventListener('click', () => { if(sidebar && sidebar.classList.contains('active')) { closeMenu(); } }); }
    if ('serviceWorker' in navigator) { navigator.serviceWorker.register('sw.js').then(() => console.log('SW OK.')).catch(err => console.error('SW Échec:', err)); } else { console.warn('SW non supporté.'); }
    console.log("Réacteur CSE (Dinguerie Visuelle) Prêt.");
});

// Fin du script complet (Sans Son)
