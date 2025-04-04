// ==================================================
//    SCRIPT COMPLET - LE RÉACTEUR CSE (Visuel Dinguerie - Full Content)
//    (Multi-Sections, Multi-Thèmes, PAS DE SON, Contenu HTML Intégré)
// ==================================================

/*
 * Prérequis :
 * 1. PapaParse inclus dans index.html.
 * 2. Font Awesome (ou autre set d'icônes) inclus.
 * 3. **REMPLACER LES URLs CSV PLACEHOLDERS CI-DESSOUS**.
 * 4. **VÉRIFIER LES NOMS DE COLONNES CSV** dans les fonctions display[Section].
 * 5. **VÉRIFIER URLS ET entry.XXXX DES FORMULAIRES GOOGLE**.
*/

// --- CONSTANTES ET VARIABLES GLOBALES ---

// !!! === URLs CSV à remplacer === !!!
const newsCsvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQcKo9WOqdnefe5z7QpaM5XtdkGs7pBeWNFrcy1crwW18Jn_KkR1IxV_KMhatedR5lmaASfeIlEsUF9/pub?gid=0&single=true&output=csv';
const eventsCsvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQcKo9WOqdnefe5z7QpaM5XtdkGs7pBeWNFrcy1crwW18Jn_KkR1IxV_KMhatedR5lmaASfeIlEsUF9/pub?gid=377066785&single=true&output=csv';
const partnersCsvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQcKo9WOqdnefe5z7QpaM5XtdkGs7pBeWNFrcy1crwW18Jn_KkR1IxV_KMhatedR5lmaASfeIlEsUF9/pub?gid=1082465411&single=true&output=csv';
const membersCsvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQcKo9WOqdnefe5z7QpaM5XtdkGs7pBeWNFrcy1crwW18Jn_KkR1IxV_KMhatedR5lmaASfeIlEsUF9/pub?gid=1265664324&single=true&output=csv';
// !!! ========================== !!!

// DOM Elements
const sidebar = document.getElementById('sidebar');
const hamburger = document.querySelector('.hamburger');
const mainContent = document.getElementById('main-content');
const headerLogo = document.getElementById('header-logo');
const installButton = document.getElementById('install-button');
const currentYearSpan = document.getElementById('current-year');
const themeButtonsWrapper = document.getElementById('theme-buttons');

// State
let deferredPrompt = null;
let isFormSubmitting = false;
let activeCountdownIntervals = [];

// Theme Constants
const THEME_STORAGE_KEY = 'reacteur-cse-selected-theme';
const DEFAULT_THEME = 'theme-nebula';
const KNOWN_THEMES = ['theme-nebula', 'theme-daylight', 'theme-pixel'];


// --- NAVIGATION & CORE UI ---

function closeMenu() { if (sidebar) sidebar.classList.remove('active'); if (hamburger) hamburger.classList.remove('active'); }
function toggleMenu() { if (sidebar && hamburger) { sidebar.classList.toggle('active'); hamburger.classList.toggle('active'); } else { console.error("Sidebar/Hamburger manquant."); } }
function updateFooterYear() { if (currentYearSpan) { currentYearSpan.textContent = new Date().getFullYear(); } }
function clearActiveNavButton() { if (!sidebar) return; sidebar.querySelectorAll('ul li button:not(.theme-button)').forEach(b => b.classList.remove('active-page'));}
function updateActiveNavButton(pageId) { if (!sidebar) return; const tBtn = sidebar.querySelector(`button[onclick*="loadPage('${pageId}')"]`); if (tBtn) { tBtn.classList.add('active-page'); } else { console.warn(`Bouton nav '${pageId}' non trouvé.`); }}


// --- PAGE LOADING ORCHESTRATOR ---

function loadPage(pageId) {
    closeMenu();
    if (!mainContent) { console.error("#main-content manquant."); return; }
    clearAllCountdowns(); // Nettoyer timers
    console.log(`Chargement : ${pageId}`);
    mainContent.innerHTML = `<p class="loading-message">Chargement module ${pageId}...</p>`;
    clearActiveNavButton();

    setTimeout(() => { // Léger délai pour UX
        let success = injectPageContent(pageId);
        if(success) {
            animatePageTitle();
            // Attachers spécifiques
            if (pageId === 'scoops') initializeVibeOMeter();
        }
    }, 50);

    updateActiveNavButton(pageId);
}

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

function animatePageTitle() { /* ... (Identique - Ajoute classe pour animation CSS) ... */
     const titleElement = mainContent.querySelector('h2'); if (titleElement) { titleElement.classList.remove('title-animate'); void titleElement.offsetWidth; titleElement.classList.add('title-animate'); }
}


// --- DATA LOADING & DISPLAY FUNCTIONS (CSV) ---

// ≈≈≈ NEWS (Scoops Brûlants) ≈≈≈
function loadNews() { /* ... (Identique) ... */ if(!mainContent) return; mainContent.innerHTML = `<h2>Scoops Brûlants <i class="fas fa-fire"></i></h2><div id="news-container" class="loading-state"><p class="loading-message">...</p></div>`; loadNewsLogic(); }
function loadNewsLogic(){ /* ... (Identique - Appel PapaParse) ... */ if(typeof Papa==='undefined'){displayGenericError("Biblio manquante.","news-container");return;}Papa.parse(newsCsvUrl,{/*...*/complete:(res)=>{if(res.errors.length){/*...*/displayNewsError(/*...*/);return;}if(!res.data||!res.data.length){displayNewsError(/*...*/);return;}displayNews(res.data);},error:(err)=>{/*...*/displayNewsError(/*...*/);}});}
function displayNews(newsData) { /* ... (Identique - Avec Vibe-O-Mètre HTML simulé) ... */ const container=document.getElementById('news-container');if(!container)return;container.classList.remove('loading-state');container.innerHTML=''; const validSort=newsData.filter(i=>i&&(i.Titre||i.titre)).sort((a,b)=>(parseDateBestEffort(b.Date||b.date)?.getTime()??0)-(parseDateBestEffort(a.Date||a.date)?.getTime()??0)); if(!validSort.length){container.innerHTML='<p>Rien de neuf.</p>';return;} validSort.forEach((item, index)=>{const el=document.createElement('article');const articleId=`news-${index}-${Date.now()}`;el.className='news-item card-style';el.id=articleId;const title=item.Titre||item.titre||'';const dateStr=item.Date||item.date||''; const desc=(item.Description||'').replace(/\n/g,'<br>');const imgUrl=item.Lien_image||item['Lien image']||''; const pDate=parseDateBestEffort(dateStr); const dDate=pDate?pDate.toLocaleDateString('fr-FR',{/*...*/day:'numeric',month:'long',year:'numeric'}):dateStr; const img=imgUrl?`<div class="news-image-container"><img src="${imgUrl}" alt="" loading="lazy" onerror="this.parentElement.style.display='none';"></div>`:''; const vibes=[{k:'idea',i:'fa-lightbulb',t:'Intéressant!',c:~~(Math.random()*5)},{k:'lol',i:'fa-laugh-squint',t:'Haha!',c:~~(Math.random()*3)},{k:'cool',i:'fa-meteor',t:'Cool!',c:~~(Math.random()*8)},{k:'hmm',i:'fa-question',t:'Hmm?',c:~~(Math.random()*2)}]; const vibeBtn=vibes.map(v=>`<button class="vibe-btn" data-vibe="${v.k}" data-article-ref="${articleId}" title="${v.t}"><i class="fas ${v.i}"></i> <span class="count">(${v.c})</span></button>`).join(''); const vibeHtml=`<div class="vibe-o-meter"><span>Vibes:</span> ${vibeBtn}</div>`; el.innerHTML=`<h3 class="news-title">${title}</h3>${dDate?`<p class="news-date"><i class="fas fa-calendar-alt"></i> ${dDate}</p>`:''}${img}<div class="news-content"><p>${desc}</p></div>${vibeHtml}`; container.appendChild(el); }); }
function initializeVibeOMeter() { /* ... (Identique - Attache listener au conteneur) ... */ const newsCont = document.getElementById('news-container'); if(newsCont) newsCont.addEventListener('click', handleVibeClick); }
function handleVibeClick(event) { /* ... (Identique - Gère clic, effet, compteur, anti-spam) ... */ const vibeBtn=event.target.closest('.vibe-btn');if(!vibeBtn)return;event.preventDefault();vibeBtn.classList.add('vibe-btn--clicked');setTimeout(()=>{vibeBtn.classList.remove('vibe-btn--clicked');},200); const countSpan=vibeBtn.querySelector('.count');if(countSpan){let count=parseInt(countSpan.textContent.replace(/[()]/g,''))||0;count++;countSpan.textContent=`(${count})`;} vibeBtn.disabled=true;setTimeout(()=>{vibeBtn.disabled=false;},500); console.log(`[Vibe] ${vibeBtn.dataset.vibe} pour ${vibeBtn.dataset.articleRef}`); /* Future saveVibe() ici */ }
function displayNewsError(message) { displayGenericError(message, "news-container"); }


// ≈≈≈ EVENTS (Vortex Temporel) ≈≈≈
function loadEvents() { /* ... (Identique) ... */ if(!mainContent) return; mainContent.innerHTML = `<h2>Vortex Temporel <i class="fas fa-calendar-days"></i></h2><div id="events-container" class="loading-state"><p class="loading-message">...</p></div>`; loadEventsLogic();}
function loadEventsLogic(){ /* ... (Identique - Appel PapaParse) ... */ if(typeof Papa==='undefined'){displayGenericError("Biblio manquante.","events-container");return;}Papa.parse(eventsCsvUrl,{/*...*/complete:(res)=>{if(res.errors.length){/*...*/displayEventsError(/*...*/);return;}if(!res.data){/*...*/displayEventsError(/*...*/);return;}processAndDisplayEvents(res.data);},error:(err)=>{/*...*/displayEventsError(/*...*/);}});}
function processAndDisplayEvents(rawEventsData) { /* ... (Identique - Calcule targetTimestamp avec heure) ... */ const c=document.getElementById('events-container');if(!c)return;c.classList.remove('loading-state');c.innerHTML='';const now=new Date(),today=new Date(Date.UTC(now.getFullYear(),now.getMonth(),now.getDate())); const validUpc=(rawEventsData||[]).map(e=>{const sStr=e.DateDebut||e.Date,eStr=e.DateFin,t=e.Titre;const sD=parseDateBestEffort(sStr);let eD=parseDateBestEffort(eStr);if(eD&&sD&&eD<sD)eD=null;if(!sD||!t)return null; const tmStr=e.Heure||e.heure||'';let targetDT=new Date(sD);if(tmStr){const tmP=tmStr.match(/^(\d{1,2}):(\d{2})$/);if(tmP){try{targetDT.setUTCHours(parseInt(tmP[1]),parseInt(tmP[2]),0,0);}catch(err){}}}return{...e,pStartDate:sD,pEndDate:eD,targetTimestamp:targetDT.getTime()};}).filter(e=>e&&(e.pEndDate||e.pStartDate)>=today).sort((a,b)=>a.pStartDate.getTime()-b.pStartDate.getTime()); displayEvents(validUpc);}
function displayEvents(events) { /* ... (Identique - Injecte countdown HTML & appelle startCountdown) ... */ const c=document.getElementById('events-container');if(!c)return;c.innerHTML='';if(!events.length){c.innerHTML='<p>Aucun event futur.</p>';return;}const nowTs=Date.now(),dOptS={/*...*/year:'numeric',month:'numeric',day:'numeric',timeZone:'UTC'},dOptL={/*...*/weekday:'long',year:'numeric',month:'long',day:'numeric',timeZone:'UTC'}; events.forEach((e, idx)=>{const item=document.createElement('div');item.className='event-item card-style';let dStr='';const sFmt=e.pStartDate.toLocaleDateString('fr-FR',dOptL);if(e.pEndDate&&e.pEndDate.getTime()!==e.pStartDate.getTime()){const eFmt=e.pEndDate.toLocaleDateString('fr-FR',dOptS);const sSrt=e.pStartDate.toLocaleDateString('fr-FR',dOptS);dStr=`Du ${sSrt} au ${eFmt}`;}else{dStr=sFmt;} let tmStr='';const tm=e.Heure||e.heure;if(tm){const tmP=String(tm).match(/^(\d{1,2}):(\d{2})$/);tmStr=tmP?` à ${tmP[1]}h${tmP[2]}`:'';}const t=e.Titre||'';const desc=(e.Description||'').replace(/\n/g,'<br>');const loc=e.Lieu||''; let cdHtml='';const cdThr=90*86400*1000;if(e.targetTimestamp>nowTs&&(e.targetTimestamp-nowTs<cdThr)){const cdId=`countdown-${idx}`;cdHtml=`<div class="countdown-container">Début dans: <span class="countdown-timer" id="${cdId}" data-target-ts="${e.targetTimestamp}">...</span></div>`;setTimeout(()=>startCountdown(cdId, e.targetTimestamp),0);}item.innerHTML=`<div class="event-date-time">${dStr}${tmStr}</div><div class="event-details"><h4>${t}</h4>${loc?`<p class="event-location"><i class="fas fa-map-marker-alt"></i> ${loc}</p>`:''}${desc?`<p class="event-description">${desc}</p>`:''} ${cdHtml}</div>`; c.appendChild(item); }); }
function startCountdown(elementId, targetTimestamp) { /* ... (Identique - Met à jour timer) ... */ const el=document.getElementById(elementId);if(!el)return; const update=()=>{const now=Date.now(), diff=targetTimestamp-now; if(diff<=0){el.textContent="Commencé!";const intInfo=activeCountdownIntervals.find(i=>i.elementId===elementId);if(intInfo)clearInterval(intInfo.intervalId);activeCountdownIntervals=activeCountdownIntervals.filter(i=>i.elementId!==elementId);return;}el.textContent=formatTimeDifference(diff);};update();const intId=setInterval(update,1000);activeCountdownIntervals.push({elementId, intervalId:intId}); }
function clearAllCountdowns() { /* ... (Identique - Nettoie intervals) ... */ console.log(`[CD] Clear ${activeCountdownIntervals.length} timers.`); activeCountdownIntervals.forEach(i=>clearInterval(i.intervalId)); activeCountdownIntervals=[]; }
function formatTimeDifference(ms) { /* ... (Identique - Format J/H/M/S) ... */ if(ms<=0)return"0s"; const s=Math.floor(ms/1000),d=Math.floor(s/86400),h=Math.floor((s%86400)/3600),m=Math.floor((s%3600)/60),sec=s%60; let r='';if(d>0)r+=`${d}j `;if(h>0||d>0)r+=`${String(h).padStart(d>0?2:1,'0')}h `; if(m>0||h>0||d>0)r+=`${String(m).padStart(2,'0')}m `;r+=`${String(sec).padStart(2,'0')}s`;return r.trim();}
function displayEventsError(message) { displayGenericError(message, "events-container"); }

// ≈≈≈ PARTNERS (Galaxie Avantages) ≈≈≈
function loadPartners() { /* ... (Identique) ... */ if(!mainContent) return; mainContent.innerHTML = `<h2>Galaxie Avantages <i class="fas fa-star"></i></h2><div id="partners-container" class="loading-state"><p class="loading-message">...</p></div>`; loadPartnersLogic(); }
function loadPartnersLogic(){ /* ... (Identique - Appel PapaParse) ... */ if(typeof Papa==='undefined'){/*...*/displayGenericError(/*...*/);return;} Papa.parse(partnersCsvUrl, {/*...*/complete:(res)=>{if(res.errors.length){/*...*/displayPartnersError(/*...*/);return;}if(!res.data){/*...*/displayPartnersError(/*...*/);return;} displayPartners(groupPartnersByCategory(res.data));}, error:(err)=>{/*...*/displayPartnersError(/*...*/);}}); }
function groupPartnersByCategory(partnersData) { /* ... (Identique - Groupe par catégorie) ... */ const g={};const def="Autres Pépites";partnersData.forEach(p=>{if(!p||!p.Nom||!String(p.Nom).trim())return; const cat=(p.Categorie||'').trim()||def;if(!g[cat])g[cat]=[];g[cat].push(p);}); const keys=Object.keys(g).sort((a,b)=>(a===def)?1:(b===def)?-1:a.localeCompare(b,'fr'));const sG={};keys.forEach(k=>{sG[k]=g[k].sort((a,b)=>(a.Nom||'').localeCompare(b.Nom||'','fr'));});return sG;}
function displayPartners(groupedPartners) { /* ... (Identique - Affiche catégories et cartes) ... */ const c=document.getElementById('partners-container');if(!c)return;c.classList.remove('loading-state');c.innerHTML='';if(!Object.keys(groupedPartners).length){c.innerHTML='<p>Aucun partenaire.</p>';return;} for(const cat in groupedPartners){ const t=document.createElement('h3');t.className='partner-category-title';t.textContent=cat;c.appendChild(t);const grid=document.createElement('div');grid.className='partner-category-grid';c.appendChild(grid); groupedPartners[cat].forEach(p=>{ const card=document.createElement('div');card.className='partner-card card-style';const n=p.Nom||'';const d=(p.Description||'').replace(/\n/g,'<br>');const l=p.Lien||p.URL||'';const o=p.Logo||'';const logo=o?`<img src="${o}" alt="${n}" class="partner-logo" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"><div class="logo-placeholder placeholder-error" style="display:none;"><i class="fas fa-image-slash"></i></div>`:`<div class="logo-placeholder placeholder-default"><i class="fas fa-store"></i></div>`; card.innerHTML=`${logo}<h4>${n}</h4>${d?`<p class="partner-description">${d}</p>`:''}`; if(l){const link=document.createElement('a');link.href=l;link.target='_blank';link.rel='noopener noreferrer';link.className='partner-link';link.appendChild(card);grid.appendChild(link);}else{grid.appendChild(card);}});}}
function displayPartnersError(message) { displayGenericError(message, "partners-container"); }

// ≈≈≈ MEMBERS (L'Équipage) ≈≈≈
function loadMembers() { /* ... (Identique) ... */ if(!mainContent)return; mainContent.innerHTML = `<h2>L'Équipage <i class="fas fa-user-astronaut"></i></h2><div id="members-container" class="loading-state"><p class="loading-message">...</p></div>`; loadMembersLogic(); }
function loadMembersLogic(){ /* ... (Identique - Appel PapaParse) ... */ if(typeof Papa==='undefined'){/*...*/displayGenericError(/*...*/);return;} Papa.parse(membersCsvUrl, {/*...*/complete:(res)=>{if(res.errors.length){/*...*/displayMembersError(/*...*/);return;}if(!res.data){/*...*/displayMembersError(/*...*/);return;} displayMembers(res.data);},error:(err)=>{/*...*/displayMembersError(/*...*/);}});}
function displayMembers(membersData) { /* ... (Identique - Affiche grille membres) ... */ const c=document.getElementById('members-container');if(!c)return;c.classList.remove('loading-state');c.innerHTML='';const vM=(membersData||[]).filter(m=>m&&m.Nom&&m.Prenom&&String(m.Nom).trim()&&String(m.Prenom).trim()).sort((a,b)=>{const nA=(a.Nom||'').toLowerCase(),nB=(b.Nom||'').toLowerCase(),pA=(a.Prenom||'').toLowerCase(),pB=(b.Prenom||'').toLowerCase();if(nA<nB)return -1;if(nA>nB)return 1;if(pA<pB)return -1;if(pA>pB)return 1;return 0;});if(!vM.length){c.innerHTML='<p>Équipage non listé.</p>';return;} const grid=document.createElement('div');grid.className='members-grid';c.appendChild(grid); vM.forEach(m=>{const card=document.createElement('div');card.className='member-card card-style';const nom=m.Nom; const pren=m.Prenom; const op=m.Operation||'';const rS=m.Role||'Membre'; const ph=m.PhotoURL||'';const r=rS.split(',').map(r=>r.trim()).filter(r=>r).join('<br>');let phH='';if(ph){phH=`<img src="${ph}" alt="${pren} ${nom}" loading="lazy" class="member-photo" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"><div class="member-placeholder placeholder-error" style="display:none;"><i class="fas fa-user-slash"></i></div>`;}else{phH=`<div class="member-placeholder placeholder-default"><i class="fas fa-user-secret"></i></div>`;}card.innerHTML=`${phH}<h4>${pren} ${nom}</h4><p class="member-role">${r}</p>${op?`<p class="member-operation">${op}</p>`:''}`;grid.appendChild(card);}); }
function displayMembersError(message) { displayGenericError(message, "members-container"); }


// --- FORM INJECTION & HANDLING ---

function injectCoffeeForm() {
     if (!mainContent) return;
     // *** HTML Formulaire Café Complet ICI ***
     const formHTML = `
        <h2>SOS Caféine <i class="fas fa-meteor"></i></h2>
        <div class="form-container card-style">
        <h3>Signalement Machine à Café</h3>
        <p>Un souci avec votre dose de carburant ? Signalez-le ici !</p>
        <form id="reportForm" action="https://docs.google.com/forms/u/0/d/e/1FAIpQLSfw2H0lzEAvt7niVxRhpkPQTLOaOfXz3SoI3IC9NfNxnY33Ag/formResponse" method="POST" target="hidden_iframe">
             <div class="form-group"><label for="email" class="required">Email</label><input type="email" id="email" name="entry.1494559432" required placeholder="votre.email@domaine.com"></div>
             <div class="form-group"><label for="name" class="required">Nom & Prénom</label><input type="text" id="name" name="entry.36162321" required placeholder="Ex: Jean Dupont"></div>
             <div class="form-group"><label for="operation" class="required">Opération</label><input type="text" id="operation" name="entry.1034050778" required placeholder="Ex: ENEDIS"></div>
             <div class="form-group"><label for="machine" class="required">Machine Défectueuse</label><select id="machine" name="entry.212638394" required><option value="" disabled selected>Choisissez la machine...</option><option value="DEV125543 (E-1)">DEV125543 (E-1)</option><option value="BBRD0152 (E-1)">BBRD0152 (E-1)</option><option value="DEV16567 (E-1)">DEV16567 (E-1)</option><option value="BBRDL0196 (E-1)">BBRDL0196 (E-1)</option><option value="DBIC799 (E0)">DBIC799 (E0)</option><option value="B72ES1979 (E1)">B72ES1979 (E1)</option><option value="B72ES1903 (E2)">B72ES1903 (E2)</option><option value="DEV95042 (E2)">DEV95042 (E2)</option><option value="B72ES1977 (E3)">B72ES1977 (E3)</option></select></div>
             <div class="form-group"><label for="problem" class="required">Nature du Problème</label><select id="problem" name="entry.1333521310" required><option value="" disabled selected>Choisissez le problème...</option><option value="Pas de gobelet">Pas de gobelet</option><option value="Gobelet vide">Gobelet vide (produit OK)</option><option value="Produit non conforme">Produit non conforme (goût, etc)</option><option value="Problème de rechargement">Problème rechargement clé/badge</option><option value="Autre">Autre (préciser)</option></select></div>
             <fieldset class="form-group nested-group"> <legend>Si problème de rechargement :</legend> <label for="date">Date</label><input type="date" id="date" name="entry.789458747"><label for="time">Heure</label><input type="time" id="time" name="entry.1519520523"><label for="payment">Moyen Paiement</label><select id="payment" name="entry.1578764886"><option value="">N/A</option><option value="CB">CB</option><option value="Pluxee">Pluxee</option><option value="Espece">Espèce</option><option value="Badge">Badge CSE</option></select></fieldset>
             <div class="form-group"><label for="comment">Commentaire (optionnel)</label><textarea id="comment" name="entry.1120842974" rows="4" placeholder="Plus de détails..."></textarea></div>
             <button type="submit" class="submit-button"><i class="fas fa-paper-plane"></i> Envoyer Signalement</button>
             <div class="form-status-sending" style="display: none;">Transmission en cours...</div>
             <div id="confirmation" class="confirmation-message" style="display: none;">Signalement reçu ! Merci !</div>
         </form>
         <iframe name="hidden_iframe" id="hidden_iframe" style="display:none;" onload="if(window.isFormSubmitting) { onFormSubmit('reportForm'); }"></iframe>
        </div>`;
     mainContent.innerHTML = formHTML;
     attachFormEvents('reportForm');
}

function injectContactForm() {
    if (!mainContent) return;
    // *** HTML Formulaire Contact Complet ICI ***
    const formHTML = `
         <h2>Holocom' CSE <i class="fas fa-headset"></i></h2>
        <div class="form-container card-style">
         <h3>Contacter l'équipage CSE</h3>
         <p>Une question ? Une suggestion ? C'est par ici !</p>
         <form id="contactForm" action="https://docs.google.com/forms/u/0/d/e/1FAIpQLSd9cPzMspmgCVEx3vLSVDiYIrX3fwFTrO3zjntnU1ZmX01w4g/formResponse" method="POST" target="hidden_iframe">
            <div class="form-group"><label for="contact_nomPrenom" class="required">Nom & Prénom</label><input type="text" id="contact_nomPrenom" name="entry.55828962" required placeholder="Ex: Luke Skywalker"></div>
            <div class="form-group"><label for="contact_email" class="required">Email</label><input type="email" id="contact_email" name="entry.1334830157" required placeholder="luke.s@rebellion.org"></div>
            <div class="form-group"><label for="contact_operation" class="required">Votre Opération/Base</label><select id="contact_operation" name="entry.506750242" required><option value="" disabled selected>Sélectionnez...</option><option value="Direction / Service généraux / IT">Commandement</option><option value="AG2R">Base AG2R</option><option value="UCPA">Avant-Poste UCPA</option><option value="CNAV">Secteur CNAV</option><option value="IRP Auto">Flotte IRP Auto</option><option value="Abeille">Ruche Abeille</option><option value="EHS">Unité EHS</option><option value="DCP">Zone DCP</option><option value="Enedis">Station Enedis</option></select></div>
            <fieldset class="form-group"><legend class="required">Objet Principal</legend><div class="checkbox-group">
                <label class="checkbox-label"><input type="checkbox" name="entry.296933228" value="Clé café"><span class="checkmark"></span> Clé café (Perdue/Défect.)</label>
                <label class="checkbox-label"><input type="checkbox" name="entry.296933228" value="Carte AccèsCE"><span class="checkmark"></span> Carte AccèsCE</label>
                <label class="checkbox-label"><input type="checkbox" name="entry.296933228" value="Carte cadeau naissance"><span class="checkmark"></span> Événement: Naissance</label>
                <label class="checkbox-label"><input type="checkbox" name="entry.296933228" value="Carte cadeau mariage"><span class="checkmark"></span> Événement: Mariage/PACS</label>
                <label class="checkbox-label"><input type="checkbox" name="entry.296933228" value="Carte cadeau retraite"><span class="checkmark"></span> Événement: Retraite</label>
                <label class="checkbox-label"><input type="checkbox" name="entry.296933228" value="Autre"><span class="checkmark"></span> Autre Transmission</label>
             </div></fieldset>
            <div class="form-group"><label for="contact_message">Votre Message</label><textarea id="contact_message" name="entry.2046101959" rows="5" placeholder="Écrivez votre message ici..."></textarea></div>
            <button type="submit" class="submit-button"><i class="fas fa-satellite"></i> Envoyer Transmission</button>
            <div class="form-status-sending" style="display: none;">Cryptage et envoi...</div>
            <div id="confirmation" class="confirmation-message" style="display: none;">Transmission réussie ! Merci.</div>
        </form>
         <iframe name="hidden_iframe" id="hidden_iframe" style="display:none;" onload="if(window.isFormSubmitting) { onFormSubmit('contactForm'); }"></iframe>
        </div>`;
    mainContent.innerHTML = formHTML;
    attachFormEvents('contactForm');
}

function attachFormEvents(formId) { /* ... (Identique) ... */ const form=document.getElementById(formId);if(!form)return; const btn=form.querySelector('button[type="submit"]');const sts=form.querySelector('.form-status-sending');const conf=form.querySelector('.confirmation-message'); form.addEventListener('submit', (e) => { window.isFormSubmitting = true; if(btn) btn.disabled = true; if(sts) sts.style.display = 'block'; if(conf) conf.style.display = 'none'; }); }
function onFormSubmit(formId) { /* ... (Identique - version corrigée scroll) ... */ if(!window.isFormSubmitting)return;window.isFormSubmitting=false;console.log(`[Form] Reçu ${formId}`); const form=document.getElementById(formId); if(!form)return; const btn=form.querySelector('button[type="submit"]');const sts=form.querySelector('.form-status-sending');const conf=form.querySelector('.confirmation-message'); if(sts)sts.style.display='none'; if(conf)conf.style.display='block'; if(form)form.style.display='none'; try{ const bs=window.getComputedStyle(document.body); const hs=bs.getPropertyValue('--header-height').trim()||'65px'; const hh=parseFloat(hs)||65; if(mainContent){const st=mainContent.offsetTop-hh-10; window.scrollTo({top:st>0?st:0,behavior:'smooth'});}}catch(e){console.error("[Form] Err scroll:", e);} }


// --- STATIC PAGE INJECTION ---

function injectAccueilPage() {
    if (!mainContent) return;
    // *** HTML Accueil Complet ICI ***
    mainContent.innerHTML = `
        <h2>Sas d'Accueil <i class="fas fa-door-open"></i></h2>
        <div class="card-style text-center">
            <p style="text-align:center; margin: 20px 0 30px;"><i class="fas fa-satellite-dish fa-4x animation-pulse" style="color:var(--color-primary);"></i></p>
            <h3>Bienvenue Pilote !</h3>
            <p>Vous avez accosté au <strong>Réacteur CSE</strong>, votre plateforme centrale pour naviguer dans l'univers des avantages et informations de votre CSE CRM59.</p>
            <p>Utilisez le menu <i class="fas fa-bars"></i> pour explorer :</p>
            <ul class="accueil-list">
                <li><i class="fas fa-bullhorn icon-list"></i> Découvrez les derniers <strong>Scoops Brûlants</strong>.</li>
                <li><i class="fas fa-calendar-days icon-list"></i> Suivez le <strong>Vortex Temporel</strong> des événements.</li>
                <li><i class="fas fa-star icon-list"></i> Explorez la <strong>Galaxie d'Avantages</strong> Partenaires.</li>
                <li><i class="fas fa-headset icon-list"></i> Contactez via l'<strong>Holocom'</strong>.</li>
                 <li><i class="fas fa-palette icon-list"></i> Testez les <strong>thèmes visuels</strong> !</li>
            </ul>
             <p class="muted-text">Prêt pour le décollage ?</p>
        </div>`;
     // Styles spécifiques à cette page injectée (pour éviter conflits potentiels)
     const style = document.createElement('style');
     style.textContent = `
         .accueil-list { list-style:none; padding: 0; margin: 20px auto; max-width: 400px; text-align: left; }
         .accueil-list li { margin-bottom: 10px; }
         .icon-list { color: var(--color-accent); margin-right: 10px; width: 20px; text-align: center; }
         .animation-pulse { animation: simplePulse 1.8s infinite ease-in-out; }
         @keyframes simplePulse { 0%, 100% { transform: scale(1); opacity: 0.9; } 50% { transform: scale(1.1); opacity: 1; } }
         .text-center { text-align: center; }
         .muted-text { font-size: 0.9em; color: var(--color-text-muted); margin-top: 15px;}
     `;
     // Trouver où l'ajouter : à la fin de mainContent c'est ok ici
      mainContent.appendChild(style);
}

function injectBoostersPage() {
    if (!mainContent) return;
    // *** HTML Boosters (AccèsCE + ActionLogement) Complet ICI ***
    mainContent.innerHTML = `
         <h2>Boosters <i class="fas fa-bolt"></i> Pouvoir d'Achat & Habitat</h2>
         <p class="page-subtitle">Rechargez vos boucliers financiers et trouvez votre base idéale.</p>

        <section id="accesce-section" class="sub-section card-style">
             <h3><i class="fas fa-ticket-alt icon-boost"></i> AccèsCE : Vos Avantages Centralisés</h3>
             <p>La plateforme <strong>AccèsCE</strong> : votre portail unique vers des offres négociées par le CSE !</p>
            <h4>Vos Plus CSE :</h4>
             <div class="highlight-box">
                 <ul>
                     <li>🎟️ <strong>Cinéma + Bonus :</strong> Tarifs AccèsCE + <strong>2€ Participation CSE</strong> (1 place/mois).</li>
                     <li>💳 <strong>Frais Offerts :</strong> Frais bancaires AccèsCE pris en charge par le CSE.</li>
                 </ul>
             </div>
             <h4>Ce que vous y trouvez :</h4>
             <ul class="bullet-list">
                 <li>Billetterie (Ciné, Parcs, Concerts...), Cartes Cadeaux, Shopping, Vacances...</li>
             </ul>
             <h4>Accès :</h4>
             <p style="text-align: center; margin: 20px 0;">
                 <a href="https://acces-ce.fr/" target="_blank" rel="noopener noreferrer" class="action-button">
                     Accéder à AccèsCE <i class="fas fa-external-link-alt"></i>
                 </a>
             </p>
             <p class="small-note">Code d'activation perdu ? Contactez-nous via <button class="inline-link-button" onclick="loadPage('holocom')">l'Holocom'</button>.</p>
         </section>

        <section id="action-logement-section" class="sub-section card-style">
            <h3><i class="fas fa-house-user icon-boost"></i> Action Logement : Votre Allié Habitat</h3>
             <p>Besoin d'un coup de pouce pour le logement ? Action Logement est là.</p>
             <h4>Solutions Clés :</h4>
             <ul class="bullet-list">
                 <li><strong>🏡 Logement social/intermédiaire :</strong> Via <a href="https://www.al-in.fr" target="_blank" rel="noopener noreferrer">AL'in.fr</a>.</li>
                 <li><strong>🔑 Garant :</strong> Garantie <strong>Visale</strong> (gratuit, sous conditions).</li>
                 <li><strong>💰 Avance Dépôt Garantie :</strong> Prêt <strong>LOCA-PASS®</strong> (0%, jusqu'à 1200€, sous cond.).</li>
                 <li><strong>📦 Aide Mobilité :</strong> Jusqu'à 1000€ pour déménagement pro (sous cond.).</li>
             </ul>
             <h4>Démarche Logement Social Simplifiée :</h4>
             <ol class="step-list">
                 <li>Demandez votre Numéro Unique (<a href="https://www.demande-logement-social.gouv.fr" target="_blank" rel="noopener noreferrer">Site Officiel</a>).</li>
                 <li>Créez votre compte & déposez votre demande sur <a href="https://www.al-in.fr" target="_blank" rel="noopener noreferrer">AL'in.fr</a>.</li>
                 <li>Postulez et suivez !</li>
             </ol>
             <div class="contact-prompt">
                 <p><strong>Commission Logement :</strong> Sabrina G., David V., Julien N. Pour les contacter : <button class="inline-link-button" onclick="loadPage('holocom')">Holocom'</button>.</p>
             </div>
         </section>
     `;
      const style = document.createElement('style');
      // *** Styles Spécifiques Boosters Page ICI ***
      style.textContent = `
         .page-subtitle { text-align: center; margin-bottom: 30px; color: var(--color-text-muted); font-size: 1.1rem;}
         body.theme-pixel .page-subtitle { font-size: 1rem; }
         .sub-section { margin-bottom: 30px; }
         .sub-section h3 { /*...*/ font-family: var(--font-heading); color: var(--color-primary); font-size: 1.5rem; margin-bottom: 15px; padding-bottom: 5px; border-bottom: 2px solid var(--color-secondary); display: flex; align-items: center; gap: 10px; }
         body.theme-pixel .sub-section h3 { border-bottom: 3px solid var(--color-border); font-size: 1.4rem;}
         .sub-section h4 { font-family: var(--font-heading); color: var(--color-text); margin: 20px 0 10px 0; font-size: 1.1rem;}
         body.theme-pixel .sub-section h4 { font-size: 1rem;}
         .icon-boost { font-size: 0.9em; opacity: 0.8; }
         .highlight-box { /*...*/ background-color: color-mix(in srgb, var(--color-accent) 15%, var(--color-background)); border-left: 5px solid var(--color-accent); padding: 15px 20px; margin: 15px 0; border-radius: var(--base-border-radius); }
         body.theme-pixel .highlight-box { border-radius: 0; border: 2px solid var(--color-accent); border-left-width: 5px; background-color: var(--color-surface); }
         .highlight-box ul { list-style: none; padding: 0; margin: 0; } .highlight-box li { margin-bottom: 5px; }
         .bullet-list, .step-list { margin: 15px 0 15px 25px; padding: 0; } .bullet-list li, .step-list li { margin-bottom: 8px; line-height: 1.5; }
         body.theme-pixel .bullet-list { list-style: none; } body.theme-pixel .bullet-list li::before { content: "+ "; color: var(--color-primary); }
         body.theme-pixel .step-list { list-style-type: decimal; margin-left: 35px; }
         .action-button { /*...*/ display: inline-block; padding: 10px 20px; background-color: var(--color-primary); color: var(--color-text-on-primary); border: none; border-radius: var(--base-border-radius); font-weight: bold; text-decoration: none; transition: var(--transition-fast); cursor: pointer; font-family: var(--font-heading); }
         .action-button:hover { background-color: color-mix(in srgb, var(--color-primary) 85%, black); transform: translateY(-2px); }
         body.theme-pixel .action-button { border: 2px solid var(--color-text-on-primary); border-radius: 0; box-shadow: 2px 2px 0px var(--color-secondary); }
         body.theme-pixel .action-button:hover { transform: translate(1px, 1px); box-shadow: 1px 1px 0px var(--color-secondary); }
         .contact-prompt { /*...*/ margin-top: 25px; padding: 10px 15px; background-color: var(--color-secondary); border-radius: var(--base-border-radius); border-left: 4px solid var(--color-accent); font-size:0.9rem; color: var(--color-text-muted); }
         body.theme-pixel .contact-prompt { border-radius: 0; border: 2px solid var(--color-accent); border-left-width: 4px; background-color: var(--color-surface); }
         button.inline-link-button { /*...*/ background: none; border: none; padding: 0; margin: 0 2px; font: inherit; color: var(--color-primary); text-decoration: underline; cursor: pointer; font-weight: bold; }
         button.inline-link-button:hover { color: var(--color-accent); }
         body.theme-pixel button.inline-link-button { color: var(--color-accent); text-decoration: none; border-bottom: 2px dotted var(--color-accent); }
         body.theme-pixel button.inline-link-button:hover { color: var(--color-primary); border-bottom-color: var(--color-primary); }
         .small-note {font-size: 0.85rem; color: var(--color-text-muted); text-align: center;}
      `;
      mainContent.appendChild(style);
}


/** Charge un placeholder générique */
function loadPlaceholderPage(pageId) { /* ... (Identique) ... */
     setTimeout(() => { if(!mainContent) return; let title = pageId.charAt(0).toUpperCase() + pageId.slice(1).replace(/-/g,' '); let icon = 'fa-wrench'; mainContent.innerHTML = `<h2 style="text-align:center;">Section : ${title}</h2><div class="card-style text-center"><p style="margin:20px 0;"><i class="fas ${icon} fa-3x fa-spin" style="color:var(--color-accent);"></i></p><p>Module '${title}' en cours de dev.</p></div><style>.text-center{text-align:center;} .fa-spin{animation:fa-spin 2s infinite linear;} @keyframes fa-spin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}</style>`; }, 300);
}


// --- HELPER FUNCTIONS ---
function parseDateBestEffort(dateString) { /* ... (Identique) ... */ if(!dateString||typeof dateString!=='string')return null;const norm=dateString.trim().replace(/[\.\-]/g,'/');let p=norm.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);if(p){const d=parseInt(p[1]),m=parseInt(p[2])-1,y=parseInt(p[3]); const dt=new Date(Date.UTC(y,m,d));if(dt.getUTCFullYear()===y&&dt.getUTCMonth()===m&&dt.getUTCDate()===d)return dt;} p=norm.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);if(p){const y=parseInt(p[1]),m=parseInt(p[2])-1,d=parseInt(p[3]); const dt=new Date(Date.UTC(y,m,d));if(dt.getUTCFullYear()===y&&dt.getUTCMonth()===m&&dt.getUTCDate()===d)return dt;} try{const ts=Date.parse(dateString);if(!isNaN(ts))return new Date(ts);}catch(e){} console.warn(`ParseDate échec: "${dateString}"`);return null; }
function displayGenericError(message, containerId) { /* ... (Identique) ... */ const c=document.getElementById(containerId);if(c){c.classList.remove('loading-state');c.innerHTML=`<div class="error-message"><i class="fas fa-exclamation-triangle"></i> Oups! ${message}</div>`;}else{console.error(`Conteneur #${containerId} manquant pour err: ${message}`);if(mainContent) mainContent.innerHTML=`<div class="error-message"><i class="fas fa-exclamation-triangle"></i> Oups! ${message}</div>`;}}


// --- THEME HANDLING FUNCTIONS (Sans Son) ---
function applyTheme(themeName) { const v = KNOWN_THEMES.includes(themeName)?themeName:DEFAULT_THEME; document.body.classList.remove(...KNOWN_THEMES); document.body.classList.add(v); try {localStorage.setItem(THEME_STORAGE_KEY, v);}catch(e){} updateThemeButtonStates(v); }
function loadSavedTheme() { let s=DEFAULT_THEME; try{s=localStorage.getItem(THEME_STORAGE_KEY)||DEFAULT_THEME;}catch(e){} if(!KNOWN_THEMES.includes(s))s=DEFAULT_THEME; applyTheme(s);}
function updateThemeButtonStates(active) { const b=document.querySelectorAll('.theme-buttons-wrapper button.theme-button'); b.forEach(btn=>{btn.classList.toggle('active-theme', btn.dataset.theme === active);});}
function initializeThemeSwitcher() { if (!themeButtonsWrapper)return; themeButtonsWrapper.addEventListener('click', (e) => { const btn=e.target.closest('button[data-theme]'); if(btn){e.preventDefault(); applyTheme(btn.dataset.theme);}});}


// --- PWA HANDLING FUNCTIONS (Sans Son) ---
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; if (installButton) installButton.style.display = 'inline-block';});
function handleInstallClick() { if(!deferredPrompt)return; if(installButton)installButton.style.display='none'; deferredPrompt.prompt(); deferredPrompt.userChoice.then((choice)=>{ console.log('PWA install:',choice.outcome); deferredPrompt=null;});}
window.addEventListener('appinstalled', () => { console.log('PWA installée!'); if(installButton)installButton.style.display='none'; deferredPrompt = null;});


// --- DOMContentLoaded INITIALIZER ---
document.addEventListener('DOMContentLoaded', () => {
    if (hamburger) hamburger.addEventListener('click', toggleMenu);
    if (installButton) installButton.addEventListener('click', handleInstallClick);
    // initializeSidebarSound(); // <-- Retiré
    updateFooterYear();
    initializeThemeSwitcher();
    loadSavedTheme();
    // playSound('themeChange'); // <-- Retiré
    loadPage('accueil');
    if(mainContent) { mainContent.addEventListener('click', () => { if(sidebar && sidebar.classList.contains('active')) { closeMenu(); } }); }
    if ('serviceWorker' in navigator) { navigator.serviceWorker.register('sw.js').then(() => console.log('SW OK.')).catch(err => console.error('SW Échec:', err)); } else { console.warn('SW non supporté.'); }
    console.log("Réacteur CSE (Dinguerie Visuelle - Full Content) Prêt.");
});

// Fin du script complet (Sans Son, Contenu HTML intégré)
