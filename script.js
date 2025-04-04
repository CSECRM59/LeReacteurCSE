// ==================================================
//          SCRIPT COMPLET POUR LE RÉACTEUR CSE
//    (Multi-Sections, Multi-Thèmes, CSV Loading, Forms)
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

// !!! === URLs à remplacer === !!!
const newsCsvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQcKo9WOqdnefe5z7QpaM5XtdkGs7pBeWNFrcy1crwW18Jn_KkR1IxV_KMhatedR5lmaASfeIlEsUF9/pub?gid=0&single=true&output=csv';          // Exemple Actus
const eventsCsvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQcKo9WOqdnefe5z7QpaM5XtdkGs7pBeWNFrcy1crwW18Jn_KkR1IxV_KMhatedR5lmaASfeIlEsUF9/pub?gid=377066785&single=true&output=csv';         // Exemple Calendrier
const partnersCsvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQcKo9WOqdnefe5z7QpaM5XtdkGs7pBeWNFrcy1crwW18Jn_KkR1IxV_KMhatedR5lmaASfeIlEsUF9/pub?gid=1082465411&single=true&output=csv';       // Exemple Partenaires
const membersCsvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQcKo9WOqdnefe5z7QpaM5XtdkGs7pBeWNFrcy1crwW18Jn_KkR1IxV_KMhatedR5lmaASfeIlEsUF9/pub?gid=1265664324&single=true&output=csv';        // Exemple Membres
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

// Theme Constants
const THEME_STORAGE_KEY = 'reacteur-cse-selected-theme';
const DEFAULT_THEME = 'theme-nebula';
const KNOWN_THEMES = ['theme-nebula', 'theme-daylight', 'theme-pixel'];

// --- NAVIGATION & CORE UI ---

function closeMenu() { /* ... (identique) ... */ if (sidebar) sidebar.classList.remove('active'); if (hamburger) hamburger.classList.remove('active'); }
function toggleMenu() { /* ... (identique) ... */ if (sidebar && hamburger) { sidebar.classList.toggle('active'); hamburger.classList.toggle('active'); } else { console.error("Sidebar ou Hamburger introuvable."); } }
function updateFooterYear() { /* ... (identique) ... */ if (currentYearSpan) { currentYearSpan.textContent = new Date().getFullYear(); } }
function clearActiveNavButton() { /* ... (identique) ... */ if (!sidebar) return; const buttons = sidebar.querySelectorAll('ul li button:not(.theme-button)'); buttons.forEach(button => button.classList.remove('active-page'));}
function updateActiveNavButton(pageId) { /* ... (identique) ... */ if (!sidebar) return; const targetButton = sidebar.querySelector(`button[onclick*="loadPage('${pageId}')"]`); if (targetButton) { targetButton.classList.add('active-page'); } else { console.warn(`Bouton pour page '${pageId}' non trouvé.`); }}


// --- PAGE LOADING ORCHESTRATOR ---

/** Charge le contenu approprié pour une pageId donnée */
function loadPage(pageId) {
    closeMenu();
    if (!mainContent) { console.error("Element #main-content introuvable."); return; }
    console.log(`Chargement de la page : ${pageId}`);
    mainContent.innerHTML = `<p class="loading-message">Recalibrage des propulseurs pour la section : ${pageId}...</p>`;
    clearActiveNavButton();

    switch (pageId) {
        // --- Data-Driven Sections ---
        case 'scoops':
            loadNews();
            break;
        case 'vortex':
            loadEvents();
            break;
        case 'galaxie':
            loadPartners();
            break;
        case 'equipage':
            loadMembers();
            break;

        // --- Form Sections ---
        case 'sos-cafeine':
            injectCoffeeForm();
            break;
        case 'holocom':
            injectContactForm();
            break;

        // --- Static/Quasi-Static Sections ---
        case 'accueil':
            injectAccueilPage();
            break;
        case 'boosters': // Cette page regroupe AccèsCE et Action Logement?
            injectBoostersPage(); // Inclura les infos AccèsCE et Action Logement
            break;
        // Note: Si 'accesce' ou 'action-logement' avaient leurs propres boutons,
        // ils auraient leurs propres 'case' appelant des injecteurs spécifiques.

        // --- Fallback for unimplemented sections ---
        default:
            loadPlaceholderPage(pageId);
            break;
    }
    updateActiveNavButton(pageId);
}

// --- DATA LOADING & DISPLAY FUNCTIONS (CSV) ---

// ≈≈≈ NEWS (Scoops Brûlants) ≈≈≈
function loadNews() { /* ... (identique à la version précédente) ... */
    if (!mainContent) return; mainContent.innerHTML = `<h2>Scoops Brûlants <i class="fas fa-fire"></i></h2><div id="news-container" class="loading-state"><p class="loading-message">Recherche dépêches...</p></div>`;
    if (typeof Papa === 'undefined') { displayGenericError("Bibliothèque PapaParse manquante.", "news-container"); return; }
    Papa.parse(newsCsvUrl, { download: true, header: true, skipEmptyLines: 'greedy', complete: (results) => { if (results.errors.length) { console.warn("CSV News Erreurs:", results.errors); displayNewsError(`Erreur format CSV: ${results.errors[0].message}`); return;} if (!results.data || !results.data.length) { displayNewsError("Aucune actualité trouvée."); return; } displayNews(results.data); }, error: (err) => displayNewsError(`Chargement impossible (Vérif URL/Connexion). ${err.message}`) });
}
function displayNews(newsData) { /* ... (identique à la version précédente, avec tri, filtrage, affichage, vibe-o-meter placeholder) ... */
    const container = document.getElementById('news-container'); if (!container) return; container.classList.remove('loading-state'); container.innerHTML = '';
    const validAndSortedNews = newsData.filter(item => item && (item.Titre || item.titre)).sort((a, b) => (parseDateBestEffort(b.Date || b.date)?.getTime() ?? 0) - (parseDateBestEffort(a.Date || a.date)?.getTime() ?? 0));
    if (!validAndSortedNews.length) { container.innerHTML = '<p>Pas de scoops pour le moment.</p>'; return; }
    validAndSortedNews.forEach(item => {
        const el = document.createElement('article'); el.className = 'news-item card-style';
        const title = item.Titre || item.titre || 'Sans Titre'; const dateStr = item.Date || item.date || ''; const description = (item.Description || item.description || '').replace(/\n/g, '<br>'); const imageUrl = item.Lien_image || item['Lien image'] || item.Image || item.image || '';
        const pDate = parseDateBestEffort(dateStr); const displayDate = pDate ? pDate.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }) : dateStr;
        const imgHtml = imageUrl ? `<div class="news-image-container"><img src="${imageUrl}" alt="Image pour ${title}" loading="lazy" class="news-image" onerror="this.parentElement.style.display='none';"></div>` : '';
        const vibeHtml = `<div class="vibe-o-meter"><span>Vibes:</span> <button class="vibe-btn" title="Intéressant !"><i class="fas fa-lightbulb"></i></button> <button class="vibe-btn" title="Haha !"><i class="fas fa-laugh-squint"></i></button> <button class="vibe-btn" title="Cool !"><i class="fas fa-meteor"></i></button> <button class="vibe-btn" title="Hmm?"><i class="fas fa-question"></i></button></div>`;
        el.innerHTML = `<h3 class="news-title">${title}</h3>${displayDate ? `<p class="news-date"><i class="fas fa-calendar-alt"></i> ${displayDate}</p>` : ''}${imgHtml}<div class="news-content"><p>${description}</p></div>${vibeHtml}`;
        container.appendChild(el);
    });
}
function displayNewsError(message) { displayGenericError(message, "news-container"); }

// ≈≈≈ EVENTS (Vortex Temporel) ≈≈≈
function loadEvents() {
    if (!mainContent) return; mainContent.innerHTML = `<h2>Vortex Temporel <i class="fas fa-calendar-days"></i></h2><div id="events-container" class="loading-state"><p class="loading-message">Synchronisation flux temporel...</p></div>`;
    if (typeof Papa === 'undefined') { displayGenericError("Bibliothèque PapaParse manquante.", "events-container"); return; }
    Papa.parse(eventsCsvUrl, { download: true, header: true, skipEmptyLines: 'greedy', complete: (results) => { if (results.errors.length) { console.warn("CSV Events Erreurs:", results.errors); displayEventsError(`Erreur format CSV: ${results.errors[0].message}`); return;} if (!results.data) { displayEventsError("Données calendrier corrompues."); return; } processAndDisplayEvents(results.data); }, error: (err) => displayEventsError(`Chargement impossible (Vérif URL/Connexion). ${err.message}`) });
}
function processAndDisplayEvents(rawEventsData) { /* ... (identique à AppliCSE.txt, gère dates début/fin, tri) ... */
    const container = document.getElementById('events-container'); if (!container) return; container.classList.remove('loading-state'); container.innerHTML = '';
    const now = new Date(); const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())); // Use UTC for comparison
    const validAndUpcoming = (rawEventsData || []).map(event => { const sdStr = event.DateDebut || event.Date; const edStr = event.DateFin; const t = event.Titre; const sd = parseDateBestEffort(sdStr); let ed = parseDateBestEffort(edStr); if (ed && sd && ed < sd) ed = null; if (!sd || !t) return null; return { ...event, pStartDate: sd, pEndDate: ed }; }).filter(e => e && (e.pEndDate || e.pStartDate) >= today).sort((a, b) => a.pStartDate.getTime() - b.pStartDate.getTime());
    displayEvents(validAndUpcoming);
}
function displayEvents(events) { /* ... (identique à AppliCSE.txt, formate affichage liste) ... */
     const container = document.getElementById('events-container'); if (!container) return; container.innerHTML = '';
     if (events.length === 0) { container.innerHTML = '<p>Aucun événement futur programmé dans ce quadrant.</p>'; return; }
     const dateOptsShort = { year: 'numeric', month: 'numeric', day: 'numeric', timeZone: 'UTC' }; const dateOptsLong = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' };
     events.forEach(event => { const item = document.createElement('div'); item.className = 'event-item card-style'; let dateStr = ''; const startFmt = event.pStartDate.toLocaleDateString('fr-FR', dateOptsLong); if (event.pEndDate && event.pEndDate.getTime() !== event.pStartDate.getTime()) { const endFmt = event.pEndDate.toLocaleDateString('fr-FR', dateOptsShort); const startShort = event.pStartDate.toLocaleDateString('fr-FR', dateOptsShort); dateStr = `Du ${startShort} au ${endFmt}`; } else { dateStr = startFmt; } let timeStr = ''; const time = event.Heure || event.heure; if (time) { const tParts = String(time).match(/^(\d{1,2}):(\d{2})$/); timeStr = tParts ? ` à ${tParts[1]}h${tParts[2]}` : ''; } const title = event.Titre || 'Événement'; const desc = (event.Description || '').replace(/\n/g, '<br>'); const loc = event.Lieu || '';
         item.innerHTML = `<div class="event-date-time">${dateStr}${timeStr}</div><div class="event-details"><h4>${title}</h4>${loc ? `<p class="event-location"><i class="fas fa-map-marker-alt"></i> ${loc}</p>` : ''}${desc ? `<p class="event-description">${desc}</p>` : ''}</div>`; container.appendChild(item); });
}
function displayEventsError(message) { displayGenericError(message, "events-container"); }

// ≈≈≈ PARTNERS (Galaxie Avantages) ≈≈≈
function loadPartners() {
    if (!mainContent) return; mainContent.innerHTML = `<h2>Galaxie Avantages <i class="fas fa-star"></i></h2><div id="partners-container" class="loading-state"><p class="loading-message">Cartographie des systèmes partenaires...</p></div>`;
    if (typeof Papa === 'undefined') { displayGenericError("Bibliothèque PapaParse manquante.", "partners-container"); return; }
    Papa.parse(partnersCsvUrl, { download: true, header: true, skipEmptyLines: 'greedy', complete: (results) => { if (results.errors.length) { console.warn("CSV Partners Erreurs:", results.errors); displayPartnersError(`Erreur format CSV: ${results.errors[0].message}`); return;} if (!results.data) { displayPartnersError("Données partenaires corrompues."); return; } const grouped = groupPartnersByCategory(results.data); displayPartners(grouped);}, error: (err) => displayPartnersError(`Chargement impossible (Vérif URL/Connexion). ${err.message}`) });
}
function groupPartnersByCategory(partnersData) { /* ... (identique à AppliCSE.txt) ... */
    const groups = {}; const defaultCategory = "Autres Pépites"; partnersData.forEach(p => { if (!p || !p.Nom || String(p.Nom).trim() === '') return; const cat = (p.Categorie || p.categorie || '').trim() || defaultCategory; if (!groups[cat]) groups[cat] = []; groups[cat].push(p); }); const sortedKeys = Object.keys(groups).sort((a, b) => (a === defaultCategory) ? 1 : (b === defaultCategory) ? -1 : a.localeCompare(b, 'fr', { sensitivity: 'base' })); const sortedGroups = {}; sortedKeys.forEach(key => { sortedGroups[key] = groups[key].sort((a, b) => (a.Nom || '').localeCompare(b.Nom || '', 'fr', { sensitivity: 'base' })); }); return sortedGroups;
}
function displayPartners(groupedPartners) { /* ... (identique à AppliCSE.txt, crée titres catégories + grilles de cartes) ... */
     const container = document.getElementById('partners-container'); if (!container) return; container.classList.remove('loading-state'); container.innerHTML = ''; if (Object.keys(groupedPartners).length === 0) { container.innerHTML = '<p>Aucun partenaire répertorié pour le moment.</p>'; return; }
     for (const category in groupedPartners) { const titleEl = document.createElement('h3'); titleEl.className = 'partner-category-title'; titleEl.textContent = category; container.appendChild(titleEl); const gridEl = document.createElement('div'); gridEl.className = 'partner-category-grid'; container.appendChild(gridEl); groupedPartners[category].forEach(p => { const card = document.createElement('div'); card.className = 'partner-card card-style'; const n = p.Nom || ''; const d = (p.Description || '').replace(/\n/g, '<br>'); const l = p.Lien || p.lien || p.URL || p.url || ''; const o = p.Logo || p.logo || ''; const logoHtml = o ? `<img src="${o}" alt="${n}" class="partner-logo" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"><div class="logo-placeholder placeholder-error" style="display:none;"><i class="fas fa-image-slash"></i></div>` : `<div class="logo-placeholder placeholder-default"><i class="fas fa-store"></i></div>`; card.innerHTML = `${logoHtml}<h4>${n}</h4>${d ? `<p class="partner-description">${d}</p>` : ''}`; if (l) { const link = document.createElement('a'); link.href = l; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.className = 'partner-link'; link.appendChild(card); gridEl.appendChild(link); } else { gridEl.appendChild(card); }});}}
function displayPartnersError(message) { displayGenericError(message, "partners-container"); }

// ≈≈≈ MEMBERS (L'Équipage) ≈≈≈
function loadMembers() {
    if (!mainContent) return; mainContent.innerHTML = `<h2>L'Équipage <i class="fas fa-user-astronaut"></i></h2><div id="members-container" class="loading-state"><p class="loading-message">Scan des badges de l'équipage...</p></div>`;
    if (typeof Papa === 'undefined') { displayGenericError("Bibliothèque PapaParse manquante.", "members-container"); return; }
     Papa.parse(membersCsvUrl, { download: true, header: true, skipEmptyLines: 'greedy', complete: (results) => { if (results.errors.length) { console.warn("CSV Members Erreurs:", results.errors); displayMembersError(`Erreur format CSV: ${results.errors[0].message}`); return;} if (!results.data) { displayMembersError("Données équipage corrompues."); return; } displayMembers(results.data);}, error: (err) => displayMembersError(`Chargement impossible (Vérif URL/Connexion). ${err.message}`) });
}
function displayMembers(membersData) { /* ... (identique à AppliCSE.txt, avec tri, filtrage, affichage photo/placeholder) ... */
    const container = document.getElementById('members-container'); if (!container) return; container.classList.remove('loading-state'); container.innerHTML = '';
    const validMembers = (membersData || []).filter(m => m && (m.Nom || m.nom) && String(m.Nom || m.nom).trim() !== '' && (m.Prenom || m.prenom) && String(m.Prenom || m.prenom).trim() !== '').sort((a, b) => { const nA = String(a.Nom || a.nom || '').toLowerCase(); const nB = String(b.Nom || b.nom || '').toLowerCase(); const pA = String(a.Prenom || a.prenom || '').toLowerCase(); const pB = String(b.Prenom || b.prenom || '').toLowerCase(); if (nA < nB) return -1; if (nA > nB) return 1; if (pA < pB) return -1; if (pA > pB) return 1; return 0; });
    if (!validMembers.length) { container.innerHTML = '<p>Équipage non répertorié pour l\'instant.</p>'; return; }
    const grid = document.createElement('div'); grid.className = 'members-grid'; container.appendChild(grid);
    validMembers.forEach(m => { const card = document.createElement('div'); card.className = 'member-card card-style'; const nom = m.Nom || m.nom; const prenom = m.Prenom || m.prenom; const operation = m.Operation || m.operation || ''; const roleString = m.Role || m.role || 'Membre'; const photoUrl = m.PhotoURL || m.PhotoUrl || m.photoURL || m.photourl || ''; const rolesHtml = roleString.split(',').map(r => r.trim()).filter(r => r).join('<br>'); let photoHtml = ''; if (photoUrl) { photoHtml = `<img src="${photoUrl}" alt="Photo de ${prenom} ${nom}" class="member-photo" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"><div class="member-placeholder placeholder-error" style="display: none;"><i class="fas fa-user-slash"></i></div>`; } else { photoHtml = `<div class="member-placeholder placeholder-default"><i class="fas fa-user-secret"></i></div>`; } card.innerHTML = `${photoHtml}<h4>${prenom} ${nom}</h4><p class="member-role">${rolesHtml}</p>${operation ? `<p class="member-operation">${operation}</p>` : ''}`; grid.appendChild(card); });
}
function displayMembersError(message) { displayGenericError(message, "members-container"); }


// --- FORM INJECTION FUNCTIONS ---

function injectCoffeeForm() {
     if (!mainContent) return;
     // Récupération du HTML du formulaire depuis AppliCSE.txt ou fichier séparé si très long
     const formHTML = `
        <h2>SOS Caféine <i class="fas fa-meteor"></i></h2>
        <div class="form-container card-style">
        <h3>Signalement Machine à Café</h3>
        <p>Un souci avec votre dose de carburant ? Signalez-le ici !</p>
        <form id="reportForm" action="https://docs.google.com/forms/u/0/d/e/1FAIpQLSfw2H0lzEAvt7niVxRhpkPQTLOaOfXz3SoI3IC9NfNxnY33Ag/formResponse" method="POST" target="hidden_iframe">
             <div class="form-group"><label for="email" class="required">Email</label><input type="email" id="email" name="entry.1494559432" required placeholder="votre.email@domaine.com"></div>
             <div class="form-group"><label for="name" class="required">Nom & Prénom</label><input type="text" id="name" name="entry.36162321" required placeholder="Ex: Jean Dupont"></div>
             <div class="form-group"><label for="operation" class="required">Opération</label><input type="text" id="operation" name="entry.1034050778" required placeholder="Ex: ENEDIS"></div>
             <div class="form-group"><label for="machine" class="required">Machine Défectueuse</label><select id="machine" name="entry.212638394" required><option value="" disabled selected>Choisissez la machine...</option><option value="DEV125543 (E-1)">DEV125543 (E-1)</option><option value="BBRD0152 (E-1)">BBRD0152 (E-1)</option><!-- ... autres options ... --><option value="B72ES1977 (E3)">B72ES1977 (E3)</option></select></div>
             <div class="form-group"><label for="problem" class="required">Nature du Problème</label><select id="problem" name="entry.1333521310" required><option value="" disabled selected>Choisissez le problème...</option><option value="Pas de gobelet">Pas de gobelet</option><option value="Gobelet vide">Gobelet vide (produit OK)</option><option value="Produit non conforme">Produit non conforme (mauvais goût, etc)</option><option value="Problème de rechargement">Problème de rechargement clé/badge</option><option value="Autre">Autre (préciser en commentaire)</option></select></div>
             <fieldset class="form-group nested-group"> <legend>Si problème de rechargement :</legend> <label for="date">Date</label><input type="date" id="date" name="entry.789458747"><label for="time">Heure</label><input type="time" id="time" name="entry.1519520523"><label for="payment">Moyen Paiement</label><select id="payment" name="entry.1578764886"><option value="">Non applicable</option><option value="CB">CB</option><option value="Pluxee">Pluxee</option><option value="Espece">Espèce</option><option value="Badge">Badge CSE</option></select></fieldset>
             <div class="form-group"><label for="comment">Commentaire (optionnel)</label><textarea id="comment" name="entry.1120842974" rows="4" placeholder="Plus de détails si besoin..."></textarea></div>
             <button type="submit" class="submit-button"><i class="fas fa-paper-plane"></i> Envoyer le Signalement</button>
             <div class="form-status-sending" style="display: none;">Transmission en cours...</div>
             <div id="confirmation" class="confirmation-message" style="display: none;">Signalement reçu ! L'équipe est sur le coup.</div>
         </form>
         <iframe name="hidden_iframe" id="hidden_iframe" style="display:none;" onload="if(window.isFormSubmitting) { onFormSubmit('reportForm'); }"></iframe>
        </div>`;
     mainContent.innerHTML = formHTML;
     attachFormEvents('reportForm'); // Attacher les écouteurs JS au formulaire injecté
}

function injectContactForm() {
    if (!mainContent) return;
    const formHTML = `
         <h2>Holocom' CSE <i class="fas fa-headset"></i></h2>
        <div class="form-container card-style">
         <h3>Contacter l'équipage CSE</h3>
         <p>Une question ? Une suggestion ? Une envie de partager une blague (appropriée) ? Utilisez ce canal !</p>
         <form id="contactForm" action="https://docs.google.com/forms/u/0/d/e/1FAIpQLSd9cPzMspmgCVEx3vLSVDiYIrX3fwFTrO3zjntnU1ZmX01w4g/formResponse" method="POST" target="hidden_iframe">
            <div class="form-group"><label for="contact_nomPrenom" class="required">Nom & Prénom</label><input type="text" id="contact_nomPrenom" name="entry.55828962" required placeholder="Ex: Leïa Organa"></div>
            <div class="form-group"><label for="contact_email" class="required">Email</label><input type="email" id="contact_email" name="entry.1334830157" required placeholder="Ex: leia.organa@alliance.reb"></div>
            <div class="form-group"><label for="contact_operation" class="required">Votre Opération/Base</label><select id="contact_operation" name="entry.506750242" required><option value="" disabled selected>Sélectionnez votre base...</option><option value="Direction / Service généraux / IT">Commandement</option><option value="AG2R">Base AG2R</option><option value="UCPA">Avant-Poste UCPA</option><!-- ... autres ... --></select></div>
            <fieldset class="form-group"><legend class="required">Objet Principal de la Demande</legend><div class="checkbox-group">
                <label class="checkbox-label"><input type="checkbox" name="entry.296933228" value="Clé café"> Clé café (Perdue/Défectueuse)</label>
                <label class="checkbox-label"><input type="checkbox" name="entry.296933228" value="Carte AccèsCE"> Carte AccèsCE</label>
                <label class="checkbox-label"><input type="checkbox" name="entry.296933228" value="Carte cadeau naissance"> Événement: Nouvelle recrue ! (Naissance)</label>
                <label class="checkbox-label"><input type="checkbox" name="entry.296933228" value="Carte cadeau mariage"> Événement: Union Scellée (Mariage/PACS)</label>
                <label class="checkbox-label"><input type="checkbox" name="entry.296933228" value="Carte cadeau retraite"> Événement: Départ pour nouvelles aventures (Retraite)</label>
                <label class="checkbox-label"><input type="checkbox" name="entry.296933228" value="Autre"> Autre Transmission</label>
             </div></fieldset>
            <div class="form-group"><label for="contact_message">Votre Message Intergalactique</label><textarea id="contact_message" name="entry.2046101959" rows="5" placeholder="Développez votre transmission ici... Que la Force soit avec votre clavier !"></textarea></div>
            <button type="submit" class="submit-button"><i class="fas fa-satellite"></i> Envoyer la Transmission</button>
            <div class="form-status-sending" style="display: none;">Cryptage et envoi subspatial...</div>
            <div id="confirmation" class="confirmation-message" style="display: none;">Message reçu 5/5 ! L'équipage vous répondra dès que possible.</div>
        </form>
         <iframe name="hidden_iframe" id="hidden_iframe" style="display:none;" onload="if(window.isFormSubmitting) { onFormSubmit('contactForm'); }"></iframe>
        </div>`;
    mainContent.innerHTML = formHTML;
    attachFormEvents('contactForm');
}

// --- FORM EVENT HANDLING ---

function attachFormEvents(formId) {
    const form = document.getElementById(formId);
    if (!form) { console.error(`Formulaire #${formId} introuvable après injection.`); return; }

    const submitButton = form.querySelector('button[type="submit"]');
    const sendingStatus = form.querySelector('.form-status-sending');
    const confirmationDiv = form.querySelector('.confirmation-message'); // Classe générique

    form.addEventListener('submit', (event) => {
        // Optionnel: Ajouter une validation JS basique ici avant l'envoi
        // if (!form.checkValidity()) { event.preventDefault(); alert("Veuillez remplir tous les champs requis."); return; }

        window.isFormSubmitting = true; // Flag global pour l'iframe onload
        if (submitButton) submitButton.disabled = true;
        if (sendingStatus) sendingStatus.style.display = 'block';
        if (confirmationDiv) confirmationDiv.style.display = 'none';
         // Laisser l'action par défaut (submit vers l'iframe) se produire
    });
}

function onFormSubmit(formId) {
    // Ne rien faire si le formulaire n'est pas en cours de soumission via notre logique
    // (Cela évite de déclencher cette fonction si l'iframe se charge pour une autre raison)
    if (!window.isFormSubmitting) return;

    // Réinitialiser le flag immédiatement pour éviter les déclenchements multiples
    window.isFormSubmitting = false;

    console.log(`[Form Submit] Réponse reçue de l'iframe pour ${formId}.`);

    // Retrouver les éléments du DOM liés à ce formulaire
    const form = document.getElementById(formId);
    if (!form) {
        console.warn(`[Form Submit] Impossible de trouver le formulaire #${formId} pour afficher la confirmation.`);
        return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    const sendingStatus = form.querySelector('.form-status-sending');
    const confirmationDiv = form.querySelector('.confirmation-message');

    // --- Afficher la confirmation et masquer le reste ---
    if (sendingStatus) {
        sendingStatus.style.display = 'none';
        console.log(`[Form Submit] Masqué: indicateur d'envoi pour ${formId}.`);
    }
    if (confirmationDiv) {
        confirmationDiv.style.display = 'block';
         console.log(`[Form Submit] Affiché: message de confirmation pour ${formId}.`);
    } else {
         console.warn(`[Form Submit] Message de confirmation introuvable pour ${formId}.`);
    }
    if (form) {
        form.style.display = 'none'; // Cacher le formulaire lui-même après l'envoi réussi
        console.log(`[Form Submit] Masqué: formulaire ${formId}.`);
    }

    // --- Calcul et Scroll (Partie Corrigée) ---
    try {
        // 1. Obtenir les styles calculés du body (hérite des variables :root)
        const bodyStyles = window.getComputedStyle(document.body);

        // 2. Obtenir la valeur de la variable CSS --header-height (ex: "65px")
        //    Ajout d'une valeur par défaut de '65px' au cas où la variable n'existerait pas
        const headerHeightString = bodyStyles.getPropertyValue('--header-height').trim() || '65px';

        // 3. Convertir la chaîne en nombre, en supprimant 'px'.
        //    Utilise 65 comme fallback robuste si la conversion échoue.
        const headerHeight = parseFloat(headerHeightString) || 65;

        // Debug : Affiche la valeur calculée
        console.log(`[Form Submit] Hauteur header calculée depuis CSS: ${headerHeight}px (Source: '${headerHeightString}')`);

        // 4. Remonter en haut de la section principale, en laissant de l'espace pour le header fixe
        //    Utilisation de la valeur 'headerHeight' qui est maintenant un nombre.
        //    Assure que mainContent existe avant de calculer son offsetTop.
        if (mainContent) {
            const scrollTopTarget = mainContent.offsetTop - headerHeight - 10; // -10px pour petite marge
            console.log(`[Form Submit] Scrolling vers ${scrollTopTarget}px.`);
            window.scrollTo({
                top: scrollTopTarget > 0 ? scrollTopTarget : 0, // Ne pas scroller à une valeur négative
                behavior: 'smooth'
            });
        } else {
            console.warn("[Form Submit] Element #main-content introuvable pour le scroll.");
        }
    } catch (error) {
         console.error("[Form Submit] Erreur lors du calcul/scroll après soumission:", error);
         // En cas d'erreur ici, le scroll ne se fera pas, mais la confirmation reste visible.
    }

    // --- Réinitialisation Optionnelle (peut rester commenté) ---
    // Si vous souhaitez que l'utilisateur puisse resoumettre facilement
    /*
    setTimeout(() => {
        if (submitButton) submitButton.disabled = false;
        if (form) {
            // Décommentez si vous voulez réinitialiser et réafficher le formulaire
            // form.reset();
            // form.style.display = 'block'; // ou 'flex'/'grid' selon votre CSS de base pour le form
        }
        if (confirmationDiv) {
            // Décommentez si vous voulez cacher la confirmation après le délai
            // confirmationDiv.style.display = 'none';
        }
         console.log(`[Form Submit] Fin du délai de réinitialisation pour ${formId}.`);
    }, 5000); // Délai de 5 secondes
    */
}
// --- STATIC PAGE INJECTION ---

function injectAccueilPage() {
    if (!mainContent) return;
    mainContent.innerHTML = `
        <h2>Sas d'Accueil <i class="fas fa-door-open"></i></h2>
        <div class="card-style text-center">
            <p style="text-align:center; margin: 20px 0 30px;"><i class="fas fa-satellite-dish fa-4x animation-pulse" style="color:var(--color-primary);"></i></p>
            <h3>Bienvenue Pilote !</h3>
            <p>Vous avez accosté au <strong>Réacteur CSE</strong>, votre plateforme centrale pour naviguer dans l'univers des avantages et informations de votre CSE CRM59.</p>
            <p>Utilisez le menu de navigation <i class="fas fa-bars"></i> pour explorer les différentes sections :</p>
            <ul style="list-style:none; padding: 0; margin: 15px auto; max-width: 400px; text-align: left;">
                <li><i class="fas fa-bullhorn icon-list"></i> Découvrez les derniers <strong>Scoops Brûlants</strong>.</li>
                <li><i class="fas fa-calendar-days icon-list"></i> Ne manquez aucun événement grâce au <strong>Vortex Temporel</strong>.</li>
                <li><i class="fas fa-star icon-list"></i> Explorez notre <strong>Galaxie d'Avantages</strong> Partenaires.</li>
                <li><i class="fas fa-headset icon-list"></i> Contactez l'équipage via l'<strong>Holocom'</strong>.</li>
                 <li><i class="fas fa-palette icon-list"></i> Et n'oubliez pas de tester les différents <strong>thèmes visuels</strong> !</li>
            </ul>
             <p style="font-size: 0.9em; color: var(--color-text-muted);">Prêt pour le décollage ?</p>
        </div>`;
     // Ajouter un peu de style pour l'icône animée et la liste
     const style = document.createElement('style');
     style.textContent = `
         .icon-list { color: var(--color-accent); margin-right: 8px; width: 15px; text-align: center; }
         .animation-pulse { animation: simplePulse 1.5s infinite ease-in-out; }
         @keyframes simplePulse { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
         .text-center { text-align: center; }
     `;
     mainContent.appendChild(style);
}

function injectBoostersPage() {
    // Cette fonction combine les infos AccèsCE et Action Logement
     if (!mainContent) return;
    // Récupérer le HTML des sections AccèsCE et ActionLogement de AppliCSE.txt
    // On les place dans des sous-sections distinctes pour la clarté.
    mainContent.innerHTML = `
         <h2>Boosters <i class="fas fa-bolt"></i> Pouvoir d'Achat & Habitat</h2>
         <p style="text-align:center; margin-bottom: 30px;">Rechargez vos boucliers financiers et trouvez votre base idéale grâce aux aides proposées.</p>

        <section id="accesce-section" class="sub-section card-style">
             <h3><i class="fas fa-ticket-alt icon-boost"></i> AccèsCE : Vos Avantages Centralisés</h3>
             <p><strong>AccèsCE</strong> est la plateforme choisie par votre CSE pour accéder à une multitude d'offres et réductions négociées !</p>
            <h4>Avantages Spécifiques via le CSE :</h4>
             <div class="highlight-box">
                 <ul>
                     <li>🎟️ <strong>Cinéma + Bonus :</strong> Tarifs négociés AccèsCE + <strong>2€ de participation CSE</strong> sur 1 place/mois !</li>
                     <li>💳 <strong>Frais Bancaires Offerts :</strong> Votre CSE prend intégralement en charge les frais bancaires AccèsCE.</li>
                 </ul>
             </div>
             <h4>Que trouverez-vous sur AccèsCE ?</h4>
             <ul class="bullet-list">
                 <li>Billetterie (cinés, parcs, concerts...)</li>
                 <li>Cartes Cadeaux & Bons d'Achat</li>
                 <li>Shopping avec réductions exclusives</li>
                 <li>Vacances & Loisirs...</li>
             </ul>
             <h4>Comment en profiter ?</h4>
             <p>Connectez-vous à votre espace personnel :</p>
             <p style="text-align: center; margin: 20px 0;">
                 <a href="https://acces-ce.fr/" target="_blank" rel="noopener noreferrer" class="action-button">
                     Plateforme AccèsCE <i class="fas fa-external-link-alt"></i>
                 </a>
             </p>
             <p><small>Besoin de votre code d'activation ? Utilisez l'Holocom' CSE.</small></p>
             <div class="contact-prompt">
                 <p><strong>Question ?</strong> Contactez le CSE via <button class="inline-link-button" onclick="loadPage('holocom')">l'Holocom'</button>.</p>
             </div>
         </section>

        <section id="action-logement-section" class="sub-section card-style">
            <h3><i class="fas fa-house-user icon-boost"></i> Action Logement : Votre Allié Habitat</h3>
             <p>Salarié cherchant un logement social ? <strong>Action Logement</strong> vous accompagne !</p>
             <h4>Solutions Principales :</h4>
             <ul class="bullet-list">
                 <li><strong>🏡 Logement social/intermédiaire :</strong> Postulez via <a href="https://www.al-in.fr" target="_blank" rel="noopener noreferrer">AL'in.fr</a>.</li>
                 <li><strong>🔑 Garant :</strong> La <strong>Garantie Visale</strong> gratuite (sous conditions).</li>
                 <li><strong>💰 Aide Dépôt Garantie :</strong> Prêt <strong>Avance LOCA-PASS®</strong> sans intérêt (jusqu'à 1200€, sous conditions).</li>
                 <li><strong>📦 Aide Mobilité :</strong> Jusqu'à 1000€ pour déménager (nouvel emploi/mutation, sous conditions).</li>
             </ul>
             <h4>Démarche Logement Social :</h4>
             <ol class="step-list">
                 <li>Obtenez votre Numéro Unique sur <a href="https://www.demande-logement-social.gouv.fr" target="_blank" rel="noopener noreferrer">demande-logement-social.gouv.fr</a>.</li>
                 <li>Créez votre compte sur <a href="https://www.al-in.fr" target="_blank" rel="noopener noreferrer">AL'in.fr</a> avec ce numéro.</li>
                 <li>Postulez aux offres sur AL'in !</li>
             </ol>
             <div class="contact-prompt">
                 <p><strong>Commission Logement à votre écoute :</strong> Sabrina G., David V., Julien N.<br>Contactez-les via <button class="inline-link-button" onclick="loadPage('holocom')">l'Holocom'</button>.</p>
             </div>
         </section>
     `;
      // Ajout styles pour cette page spécifique
      const style = document.createElement('style');
      style.textContent = `
         .sub-section { margin-bottom: 30px; }
         .sub-section h3 { font-family: var(--font-heading); color: var(--color-primary); font-size: 1.5em; margin-bottom: 15px; padding-bottom: 5px; border-bottom: 2px solid var(--color-secondary); display: flex; align-items: center; gap: 10px;}
         .icon-boost { font-size: 0.9em; opacity: 0.8;}
         body.theme-pixel .sub-section h3 { border-bottom: 3px solid var(--color-border); }
         .highlight-box { background-color: color-mix(in srgb, var(--color-accent) 15%, var(--color-background)); border-left: 5px solid var(--color-accent); padding: 15px; margin: 20px 0; border-radius: var(--base-border-radius); }
         body.theme-pixel .highlight-box { border-radius: 0; border: 2px solid var(--color-accent); border-left-width: 5px; background-color: var(--color-surface); }
         .highlight-box ul { list-style: none; padding: 0; margin: 0; } .highlight-box li { margin-bottom: 5px; }
         .bullet-list, .step-list { margin: 15px 0 15px 25px; padding: 0; } .bullet-list li, .step-list li { margin-bottom: 8px; }
         .action-button { display: inline-block; padding: 10px 20px; background-color: var(--color-primary); color: var(--color-text-on-primary); border: none; border-radius: var(--base-border-radius); font-weight: bold; text-decoration: none; transition: var(--transition-fast); cursor: pointer; }
         .action-button:hover { background-color: color-mix(in srgb, var(--color-primary) 85%, black); transform: translateY(-2px); }
         body.theme-pixel .action-button { border: 2px solid var(--color-text-on-primary); border-radius: 0; box-shadow: 2px 2px 0px var(--color-secondary); }
         body.theme-pixel .action-button:hover { transform: translate(1px, 1px); box-shadow: 1px 1px 0px var(--color-secondary); }
         .contact-prompt { margin-top: 25px; padding: 10px; background-color: var(--color-secondary); border-radius: var(--base-border-radius); border-left: 4px solid var(--color-accent); font-size:0.9em; color: var(--color-text-muted);}
         body.theme-pixel .contact-prompt { border-radius: 0; border: 2px solid var(--color-accent); border-left-width: 4px; background-color: var(--color-surface); }
         button.inline-link-button { background: none; border: none; padding: 0; margin: 0; font: inherit; color: var(--color-primary); text-decoration: underline; cursor: pointer; font-weight: bold; }
         button.inline-link-button:hover { color: var(--color-accent); }
         body.theme-pixel button.inline-link-button { color: var(--color-accent); text-decoration: none; border-bottom: 2px dotted var(--color-accent); }
         body.theme-pixel button.inline-link-button:hover { color: var(--color-primary); border-bottom-color: var(--color-primary); }
      `;
      mainContent.appendChild(style);
}


/** Fonction générique pour afficher le contenu Placeholder */
function loadPlaceholderPage(pageId) {
     setTimeout(() => {
        let title = pageId.charAt(0).toUpperCase() + pageId.slice(1).replace(/-/g, ' ');
        let iconClass = 'fa-wrench'; // Icône "en construction"
        mainContent.innerHTML = `
             <h2 style="text-align: center;">Section : ${title}</h2>
             <div class="card-style text-center">
                <p style="text-align:center; margin: 20px 0;"><i class="fas ${iconClass} fa-3x fa-spin" style="color:var(--color-accent);"></i></p>
                 <p>Le module '${title}' est en cours de construction dans nos chantiers spatiaux.</p>
                 <p>Revenez bientôt pour découvrir cette fonctionnalité !</p>
             </div>
              <style>.text-center{text-align:center;} .fa-spin{animation: fa-spin 2s infinite linear;} @keyframes fa-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); }}</style>
             `;
     }, 300);
}

// --- HELPER FUNCTIONS ---

/** Parse une date (Robuste) */
function parseDateBestEffort(dateString) { /* ... (identique à la version précédente) ... */
     if (!dateString || typeof dateString !== 'string') return null; const normalizedDate = dateString.trim().replace(/[\.\-]/g, '/'); let parts = normalizedDate.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/); if (parts) { const d = parseInt(parts[1], 10), m = parseInt(parts[2], 10) - 1, y = parseInt(parts[3], 10); const date = new Date(Date.UTC(y, m, d)); if (date.getUTCFullYear() === y && date.getUTCMonth() === m && date.getUTCDate() === d) return date; } parts = normalizedDate.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/); if (parts) { const y = parseInt(parts[1], 10), m = parseInt(parts[2], 10) - 1, d = parseInt(parts[3], 10); const date = new Date(Date.UTC(y, m, d)); if (date.getUTCFullYear() === y && date.getUTCMonth() === m && date.getUTCDate() === d) return date; } try { const timestamp = Date.parse(dateString); if (!isNaN(timestamp)) return new Date(timestamp); } catch (e) {} console.warn(`Impossible de parser la date: "${dateString}"`); return null;
 }

/** Affiche une erreur générique dans un conteneur donné */
function displayGenericError(message, containerId) {
    const container = document.getElementById(containerId);
    if (container) {
         container.classList.remove('loading-state');
         container.innerHTML = `<div class="error-message"><i class="fas fa-exclamation-triangle"></i> Oups! ${message}</div>`;
    } else {
        console.error(`Conteneur #${containerId} introuvable pour afficher l'erreur : ${message}`);
         // Fallback: afficher dans mainContent si le conteneur spécifique n'existe pas (ex: pendant chargement initial)
        if (mainContent) mainContent.innerHTML = `<div class="error-message"><i class="fas fa-exclamation-triangle"></i> Oups! ${message}</div>`;
    }
}


// --- THEME HANDLING FUNCTIONS ---
// ... (applyTheme, loadSavedTheme, updateThemeButtonStates, initializeThemeSwitcher - Identiques) ...
function applyTheme(themeName) { const validThemeName = KNOWN_THEMES.includes(themeName) ? themeName : DEFAULT_THEME; console.log(`App Thème : ${validThemeName}`); document.body.classList.remove(...KNOWN_THEMES); document.body.classList.add(validThemeName); try {localStorage.setItem(THEME_STORAGE_KEY, validThemeName); } catch (e) { console.warn("LocalStorage non dispo:", e); } updateThemeButtonStates(validThemeName); }
function loadSavedTheme() { let savedTheme = DEFAULT_THEME; try {savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || DEFAULT_THEME; } catch (e) {} if (!KNOWN_THEMES.includes(savedTheme)) savedTheme = DEFAULT_THEME; applyTheme(savedTheme); }
function updateThemeButtonStates(activeTheme) { const btns = document.querySelectorAll('.theme-buttons-wrapper button.theme-button'); btns.forEach(b => { b.classList.toggle('active-theme', b.dataset.theme === activeTheme); }); }
function initializeThemeSwitcher() { if (!themeButtonsWrapper) {console.error("Conteneur boutons thème introuvable."); return;} themeButtonsWrapper.addEventListener('click', (e) => { const btn = e.target.closest('button[data-theme]'); if (btn) { e.preventDefault(); applyTheme(btn.dataset.theme); }});}


// --- PWA HANDLING FUNCTIONS ---
// ... (beforeinstallprompt listener, handleInstallClick, appinstalled listener - Identiques) ...
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; if (installButton) { console.log('PWA install dispo.'); installButton.style.display = 'inline-block'; }});
function handleInstallClick() { if (!deferredPrompt) return; if(installButton) installButton.style.display = 'none'; deferredPrompt.prompt(); deferredPrompt.userChoice.then((choice) => { console.log('PWA install outcome:', choice.outcome); deferredPrompt = null; }); }
window.addEventListener('appinstalled', () => { console.log('PWA installée!'); if(installButton) installButton.style.display = 'none'; deferredPrompt = null;});


// --- DOMContentLoaded INITIALIZER ---
document.addEventListener('DOMContentLoaded', () => {
    if (hamburger) hamburger.addEventListener('click', toggleMenu);
    else console.error("Hamburger manquant.");

    if (installButton) installButton.addEventListener('click', handleInstallClick);
    else console.info("Bouton PWA non trouvé initialement.");

    updateFooterYear();
    initializeThemeSwitcher();
    loadSavedTheme();
    loadPage('accueil'); // Démarrer sur l'accueil

    if(mainContent) { // Fermer sidebar si clic dans main
        mainContent.addEventListener('click', () => { if(sidebar && sidebar.classList.contains('active')) { closeMenu(); } });
    }

    if ('serviceWorker' in navigator) { // Enregistrer SW
        navigator.serviceWorker.register('sw.js').then(() => console.log('SW OK.')).catch(err => console.error('SW Échec:', err));
    } else { console.warn('SW non supporté.'); }

    console.log("Réacteur CSE Initialisé et Paré.");
});

// Fin du script complet
