// script.js

// --- Variables Globales ---
let deferredPrompt = null; // Pour l'installation PWA
const sidebar = document.getElementById('sidebar');
const hamburger = document.querySelector('.hamburger');
const mainContent = document.getElementById('main-content');
const headerLogo = document.getElementById('header-logo');
const installButton = document.getElementById('install-button');
const currentYearSpan = document.getElementById('current-year');

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
    closeMenu(); // Ferme le menu quand on charge une page
    if (!mainContent) {
        console.error("Element #main-content introuvable.");
        return;
    }
    console.log(`Chargement de la page : ${pageId}`); // Log pour debug
    mainContent.innerHTML = `<p class="loading-message">Activation des circuits pour la section : ${pageId}...</p>`;

    // Placeholder: Simule un chargement et affiche du contenu basique
    setTimeout(() => {
        let content = `<h2 style="text-align: center;">Section : ${pageId}</h2>`;
        content += `<p>Contenu de la page "${pageId}" à venir ici. Préparez-vous pour la dinguerie !</p>`;
        if(pageId === 'accueil') {
            content += `<p>Bienvenue à bord du Réacteur CSE ! Utilisez le panneau de navigation (☰) pour explorer.</p>`;
        }
        mainContent.innerHTML = content;

        // Mettre à jour le bouton actif dans la sidebar (logique simple pour l'instant)
        updateActiveNavButton(pageId);

    }, 500); // Simule un petit délai réseau
}

/** Met en surbrillance le bouton de navigation correspondant à la page chargée */
function updateActiveNavButton(pageId) {
    if (!sidebar) return;
    const buttons = sidebar.querySelectorAll('ul li button:not(.theme-button)');
    buttons.forEach(button => {
        // Très simple: vérifie si l'attribut onclick contient l'ID de la page
        const onclickAttr = button.getAttribute('onclick');
        if (onclickAttr && onclickAttr.includes(`loadPage('${pageId}')`)) {
            button.classList.add('active-page');
        } else {
            button.classList.remove('active-page');
        }
    });
}


/** Met à jour l'année dans le footer */
function updateFooterYear() {
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }
}

// --- Logique PWA ---

/** Gère l'événement pour proposer l'installation */
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // Empêche l'invite Chrome auto
    deferredPrompt = e; // Stocke l'event
    if (installButton) {
        console.log('Prêt à installer la PWA ! Affichage du bouton.');
        installButton.style.display = 'inline-block'; // Affiche le bouton
    } else {
        console.warn("Bouton d'installation non trouvé au moment de 'beforeinstallprompt'.");
    }
});

/** Gère le clic sur le bouton d'installation */
function handleInstallClick() {
    if (!deferredPrompt) {
        console.log("Pas d'invite d'installation disponible.");
        return;
    }
    // Cache le bouton (même si l'utilisateur refuse, on ne veut pas le remontrer tout de suite)
    if(installButton) installButton.style.display = 'none';

    // Affiche l'invite
    deferredPrompt.prompt();

    // Attend la réponse de l'utilisateur
    deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
            console.log('Utilisateur a accepté l\'installation ! Wouhou !');
        } else {
            console.log('Utilisateur a refusé l\'installation.');
        }
        deferredPrompt = null; // L'invite ne peut être utilisée qu'une fois
    });
}

/** Cache le bouton si l'app est déjà installée */
window.addEventListener('appinstalled', () => {
    console.log('PWA installée avec succès !');
    if(installButton) installButton.style.display = 'none';
    deferredPrompt = null; // Assure qu'on ne la repropose pas
});

// --- Initialisation au Chargement de la Page ---
document.addEventListener('DOMContentLoaded', () => {
    // Attacher les écouteurs d'événements
    if (hamburger) {
        hamburger.addEventListener('click', toggleMenu);
    } else {
        console.error("Hamburger introuvable pour l'event listener.");
    }

    if (installButton) {
        installButton.addEventListener('click', handleInstallClick);
    } else {
        // Le bouton peut ne pas exister si PWA non supportée ou déjà installée, donc pas une erreur critique
        console.info("Bouton d'installation non trouvé au chargement DOM initial (ce peut être normal).");
    }


    // Mettre à jour l'année
    updateFooterYear();

    // Charger la page d'accueil par défaut
    loadPage('accueil');

    // Fermer le menu si on clique en dehors (sur main content par exemple)
    if(mainContent) {
        mainContent.addEventListener('click', () => {
            if(sidebar && sidebar.classList.contains('active')) {
                closeMenu();
            }
        });
    }

    // Ajouter un petit effet rigolo sur le logo ? (juste pour le fun)
    if(headerLogo) {
        headerLogo.addEventListener('mouseenter', () => {
            // On pourrait jouer un petit son ici, ou une autre animation...
        });
    }

    // Enregistrer le Service Worker pour la PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(() => console.log('Service Worker enregistré pour la conquête !'))
            .catch(err => console.error('Échec enregistrement Service Worker:', err));
    } else {
         console.warn('Service Worker non supporté par ce navigateur.');
    }
});

console.log("Réacteur JS initialisé. Prêt pour la téléportation !");
