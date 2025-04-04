// script.js - VERSION COMPLÈTE (Après ajout Styles + HTML Thèmes)

// --- Variables Globales ---
let deferredPrompt = null; // Pour l'installation PWA
const sidebar = document.getElementById('sidebar');
const hamburger = document.querySelector('.hamburger');
const mainContent = document.getElementById('main-content');
const headerLogo = document.getElementById('header-logo');
const installButton = document.getElementById('install-button');
const currentYearSpan = document.getElementById('current-year');
const themeButtonsWrapper = document.getElementById('theme-buttons'); // Cibler le conteneur des boutons de thème

// === CONSTANTES POUR LES THEMES ===
const THEME_STORAGE_KEY = 'reacteur-cse-selected-theme';
const DEFAULT_THEME = 'theme-nebula'; // Thème sombre par défaut
const KNOWN_THEMES = ['theme-nebula', 'theme-daylight', 'theme-pixel']; // Mise à jour !

// --- Fonctions ---

/** Ferme le menu sidebar */
function closeMenu() {
    if (sidebar) sidebar.classList.remove('active');
    if (hamburger) hamburger.classList.remove('active');
}

/** Ouvre/Ferme le menu sidebar */
function toggleMenu() {
    if (sidebar && hamburger) {
        sidebar.classList.toggle('active');
        hamburger.classList.toggle('active');
    } else {
        console.error("Sidebar ou Hamburger introuvable.");
    }
}

/** Charge une "page" dans la zone main-content (version placeholder) */
function loadPage(pageId) {
    closeMenu();
    if (!mainContent) {
        console.error("Element #main-content introuvable.");
        return;
    }
    console.log(`Chargement de la page : ${pageId}`);
    mainContent.innerHTML = `<p class="loading-message">Recalibrage des propulseurs pour la section : ${pageId}...</p>`; // Message fun
    clearActiveNavButton();

    // Vraie logique de chargement (API, CSV, HTML Statique...) viendra ici plus tard
    // Pour l'instant, simulation :
    setTimeout(() => {
        let title = pageId.charAt(0).toUpperCase() + pageId.slice(1).replace(/-/g, ' '); // Gère les tirets aussi
        let content = `<h2 style="text-align: center;">Section : ${title}</h2>`;

        // Contenu Placeholder spécifique par page
        switch (pageId) {
            case 'accueil':
                content += `<p style="text-align:center; margin: 20px 0;"><i class="fas fa-satellite-dish fa-3x" style="color:var(--color-primary);"></i></p>`;
                content += `<p>Bienvenue Pilote ! Le <strong>Réacteur CSE</strong> est prêt à vous propulser vers les infos essentielles et les avantages exclusifs. Utilisez le panneau de navigation (☰) pour explorer les différentes sections.</p>`;
                content += `<p style="font-size: 0.9em; text-align: center; color: var(--color-text-muted);">PS: Testez les thèmes visuels ci-dessous dans la nav !</p>`;
                break;
            case 'scoops':
                content += `<p style="text-align:center; margin: 20px 0;"><i class="fas fa-fire-flame-curved fa-3x" style="color:var(--color-accent);"></i></p>`;
                content += `<p>Ici bientôt : les actualités les plus fraîches (ou brûlantes 🔥) du CSE ! Préparez-vous à des annonces qui décoiffent.</p>`;
                // Placeholder Vibe-O-Mètre
                content += `<div style="margin-top:30px; padding:10px; background: color-mix(in srgb, var(--color-surface) 80%, var(--color-background) 20%); border:1px solid var(--color-border); border-radius: var(--base-border-radius);"><strong>Placeholder:</strong> Futur 'Vibe-O-Mètre' <i class="fas fa-heart-pulse"></i><i class="fas fa-poo"></i><i class="fas fa-face-grin-squint-tears"></i></div>`;
                break;
            case 'vortex':
                content += `<p style="text-align:center; margin: 20px 0;"><i class="fas fa-ghost fa-3x" style="color:var(--color-primary);"></i></p>`;
                content += `<p>Accrochez-vous ! Le Vortex Temporel vous révèlera bientôt les dates clés et événements à ne pas manquer. Synchronisation en cours...</p>`;
                // Placeholder Countdown
                content += `<div style="margin-top:30px; text-align: center; font-family: var(--font-heading); font-size: 1.5em;">Prochain Événement dans : <span style="color: var(--color-accent);">XXj XXh XXm XXs</span></div>`;
                break;
            case 'sos-cafeine':
                content += `<p style="text-align:center; margin: 20px 0;"><i class="fas fa-meteor fa-3x" style="color:var(--color-error);"></i></p>`;
                content += `<p>ALERTE ROUGE ! Besoin de signaler un dysfonctionnement de la machine à café ? Le formulaire de signalement 'Mission Expresso' sera bientôt opérationnel ici.</p>`;
                 // Placeholder Rage-O-Mètre
                content += `<label for="rage" style="display:block; text-align:center; margin-top:20px;">Niveau de Rage Caféinée (0-100): </label><input type="range" id="rage" name="rage" min="0" max="100" value="50" style="width:80%; margin: 5px auto; display:block;">`;
                break;
            case 'holocom':
                 content += `<p style="text-align:center; margin: 20px 0;"><i class="fas fa-headset fa-3x" style="color:var(--color-success);"></i></p>`;
                content += `<p>Canal de communication direct avec l'équipage du CSE en cours d'établissement. Patientez pendant que nous alignons les transpondeurs sub-spatiaux...</p>`;
                break;
             case 'galaxie':
                 content += `<p style="text-align:center; margin: 20px 0;"><i class="fas fa-star-shooting fa-3x" style="color:var(--color-accent);"></i></p>`;
                content += `<p>Préparez-vous à explorer la constellation scintillante des avantages partenaires ! Carte galactique en cours de chargement.</p>`;
                 break;
            case 'boosters':
                 content += `<p style="text-align:center; margin: 20px 0;"><i class="fas fa-charging-station fa-3x" style="color:var(--color-primary);"></i></p>`;
                 content += `<p>Boostez votre pouvoir d'achat et trouvez votre base idéale ! Les infos AccèsCE et Action Logement atterrissent ici très bientôt.</p>`;
                 break;
             case 'equipage':
                 content += `<p style="text-align:center; margin: 20px 0;"><i class="fas fa-user-astronaut fa-3x" style="color:var(--color-text-muted);"></i></p>`;
                 content += `<p>Présentation de l'équipage ! Qui sont les braves âmes aux commandes du vaisseau CSE ? Profils en cours de compilation holographique.</p>`;
                 break;
            default:
                content += `<p>Section "${pageId}" en construction. Revenez bientôt pour découvrir les merveilles (ou les boulons apparents) !</p>`;
        }

        mainContent.innerHTML = content;
        updateActiveNavButton(pageId);

    }, 300); // Simule un délai
}

/** Retire la classe active de tous les boutons de nav */
function clearActiveNavButton() {
    if (!sidebar) return;
    const buttons = sidebar.querySelectorAll('ul li button:not(.theme-button)');
    buttons.forEach(button => button.classList.remove('active-page'));
}

/** Met en surbrillance le bouton de navigation correspondant */
function updateActiveNavButton(pageId) {
    if (!sidebar) return;
    const targetButton = sidebar.querySelector(`button[onclick*="loadPage('${pageId}')"]`);
    if (targetButton) {
        targetButton.classList.add('active-page');
    } else {
        console.warn(`Bouton pour page '${pageId}' non trouvé dans la sidebar.`);
    }
}


/** Met à jour l'année dans le footer */
function updateFooterYear() {
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }
}

// --- Logique PWA (Identique) ---
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installButton) {
        console.log('Prêt à installer la PWA ! Affichage du bouton.');
        installButton.style.display = 'inline-block';
    } else {
        console.warn("Bouton d'installation non trouvé au moment de 'beforeinstallprompt'.");
    }
});

function handleInstallClick() {
    if (!deferredPrompt) {
        console.log("Pas d'invite d'installation disponible.");
        return;
    }
    if(installButton) installButton.style.display = 'none';
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
            console.log('Utilisateur a accepté l\'installation ! Wouhou !');
        } else {
            console.log('Utilisateur a refusé l\'installation.');
        }
        deferredPrompt = null;
    });
}

window.addEventListener('appinstalled', () => {
    console.log('PWA installée avec succès !');
    if(installButton) installButton.style.display = 'none';
    deferredPrompt = null;
});


// --- Gestion des Thèmes (Identique) ---

/** Applique un thème au body et le sauvegarde */
function applyTheme(themeName) {
    const validThemeName = KNOWN_THEMES.includes(themeName) ? themeName : DEFAULT_THEME;
    console.log(`Application du thème : ${validThemeName}`);
    document.body.classList.remove(...KNOWN_THEMES);
    document.body.classList.add(validThemeName);
    try {
        localStorage.setItem(THEME_STORAGE_KEY, validThemeName);
    } catch (e) {
        console.warn("LocalStorage non disponible ou quota atteint:", e);
    }
    updateThemeButtonStates(validThemeName);
}

/** Charge le thème sauvegardé au démarrage */
function loadSavedTheme() {
    let savedTheme = DEFAULT_THEME;
    try {
        savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || DEFAULT_THEME;
    } catch (e) {
        console.warn("Erreur lecture LocalStorage pour le thème:", e);
    }
    if (!KNOWN_THEMES.includes(savedTheme)) {
        console.warn(`Thème sauvegardé "${savedTheme}" invalide, retour au défaut.`);
        savedTheme = DEFAULT_THEME;
    }
    applyTheme(savedTheme);
}

/** Met à jour l'apparence des boutons de thème */
function updateThemeButtonStates(activeTheme) {
    const themeButtons = document.querySelectorAll('.theme-buttons-wrapper button.theme-button');
    themeButtons.forEach(button => {
        button.classList.toggle('active-theme', button.dataset.theme === activeTheme);
    });
}

/** Attache les écouteurs aux boutons de thème */
function initializeThemeSwitcher() {
    if (!themeButtonsWrapper) {
         console.error("Conteneur de boutons de thème '#theme-buttons' introuvable.");
         return;
    }
    themeButtonsWrapper.addEventListener('click', (e) => {
        const themeButton = e.target.closest('button[data-theme]');
        if (themeButton) {
            e.preventDefault();
            const themeToApply = themeButton.dataset.theme;
            applyTheme(themeToApply);
        }
    });
}


// --- Initialisation au Chargement de la Page ---
document.addEventListener('DOMContentLoaded', () => {
    // Attacher écouteurs Hamburger et Bouton Install
    if (hamburger) hamburger.addEventListener('click', toggleMenu);
    else console.error("Hamburger introuvable pour l'event listener.");

    if (installButton) installButton.addEventListener('click', handleInstallClick);
    else console.info("Bouton d'installation non trouvé au chargement DOM (normal si PWA non dispo/installée).");


    // Mettre à jour l'année Footer
    updateFooterYear();

    // Initialiser et charger le Thème
    initializeThemeSwitcher();
    loadSavedTheme();

    // Charger la page d'accueil initiale
    loadPage('accueil');

    // Fermer menu si clic extérieur
    if(mainContent) {
        mainContent.addEventListener('click', () => {
            if(sidebar && sidebar.classList.contains('active')) {
                closeMenu();
            }
        });
    }

    // Enregistrer le Service Worker PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(() => console.log('Service Worker enregistré. Prêt pour l\'offline !'))
            .catch(err => console.error('Échec enregistrement Service Worker:', err));
    } else {
         console.warn('Service Worker non supporté par ce navigateur.');
    }

    console.log("Systèmes du Réacteur CSE opérationnels.");
});

// Fin du script.js
