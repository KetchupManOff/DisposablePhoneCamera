/**
 * i18n — Dictionnaires français / anglais + helpers.
 * Usage : translate(lang, key, params) ou, dans un composant React, useI18n() -> { t, tp }.
 */

export type Lang = 'fr' | 'en';

export interface I18nParams {
  [key: string]: string | number;
}

/** Signature du helper `t` retourné par useI18n(). */
export type TFunction = (key: string, params?: I18nParams) => string;

const fr: Record<string, string> = {
  /* --- App / À propos --- */
  'app.about': 'À propos',
  'app.aboutTagline':
    "L'appareil photo jetable vintage dans votre poche. Créez plusieurs pellicules avec différents films, prenez vos poses et développez plus tard.",
  'app.aboutFree': '100% gratuit. Fonctionne hors-ligne. PWA installable.',

  /* --- Guide / Accueil --- */
  'guide.title': 'Bienvenue',
  'guide.tab.philosophy': 'Philosophie',
  'guide.tab.guide': 'Guide',
  'guide.tab.install': 'Installer',

  /* -- Philosophie -- */
  'guide.philosophy.intro':
    "DispoCam recrée l'expérience magique et imparfaite d'un appareil photo jetable argentique — directement dans votre téléphone.",
  'guide.philosophy.limited':
    "Un nombre de poses limité : chaque déclenchement compte. Comme un vrai jetable, vous avez un rouleau fini avant de pouvoir le développer.",
  'guide.philosophy.wait':
    "Un temps de développement obligatoire : vos photos restent cachées pendant plusieurs heures. L'impatience fait partie du jeu.",
  'guide.philosophy.private':
    "Vos photos sont chiffrées et verrouillées jusqu'au développement. Personne ne peut les voir avant l'heure — pas même vous.",
  'guide.philosophy.surprise':
    "La magie de la découverte : quand le minuteur arrive à zéro, vous redécouvrez vos souvenirs, comme en ouvrant une enveloppe de tirages.",
  'guide.philosophy.vintage':
    "Un rendu vintage authentique avec des films simulés (Kodak, Fuji, Ilford, Polaroid…) pour retrouver le grain et les couleurs de l'argentique.",
  'guide.philosophy.footer':
    'Pas d\'algorithme, pas de filtres instantanés, pas de retouche. Juste le plaisir de photographier et la patience de découvrir.',

  /* -- Guide d\'utilisation -- */
  'guide.steps.intro':
    "Voici comment utiliser DispoCam en 5 étapes simples :",
  'guide.steps.create.title': 'Créez une pellicule',
  'guide.steps.create.desc':
    "Donnez un nom à votre pellicule. C'est comme choisir une nouvelle pellicule photo dans votre appareil jetable.",
  'guide.steps.settings.title': 'Choisissez votre film et vos réglages',
  'guide.steps.settings.desc':
    "Sélectionnez un film parmi nos profils couleur (Kodak Gold, Fuji Superia, Polaroid…) et définissez le nombre de poses, le ratio et le temps de développement.",
  'guide.steps.shoot.title': 'Prenez vos photos',
  'guide.steps.shoot.desc':
    "Cadrez, déclenchez. Vous pouvez aussi utiliser les boutons de volume pour prendre une photo. Le compteur de poses vous indique combien il vous en reste.",
  'guide.steps.develop.title': 'Patientez pendant le développement',
  'guide.steps.develop.desc':
    "Une fois la pellicule terminée (ou le temps de prise de vue écoulé), le développement commence automatiquement. Vos photos restent inaccessibles pendant cette période.",
  'guide.steps.discover.title': 'Découvrez et exportez vos photos',
  'guide.steps.discover.desc':
    "Quand le développement est terminé, déverrouillez votre galerie et admirez vos clichés. Téléchargez-les d'un coup dans votre pellicule photo.",
  'guide.steps.tip':
    "Astuce : créez une pellicule avant une sortie, prenez vos photos sans vous soucier du résultat, et découvrez-les le lendemain — comme à l'époque de l'argentique !",

  /* -- Installation PWA -- */
  'guide.install.intro':
    "DispoCam est une PWA (Progressive Web App). Installez-la sur votre écran d'accueil pour l'utiliser comme une vraie application, même sans réseau.",
  'guide.install.benefits.offline.icon': '📡',
  'guide.install.benefits.offline.label': 'Hors ligne',
  'guide.install.benefits.fullscreen.icon': '📱',
  'guide.install.benefits.fullscreen.label': 'Plein écran',
  'guide.install.benefits.app.icon': '🚀',
  'guide.install.benefits.app.label': 'Comme une app',

  'guide.install.iphone.title': 'iPhone & iPad (Safari)',
  'guide.install.iphone.step1':
    'Ouvrez DispoCam <span class="text-vintage-accent">dans Safari</span> (cela ne fonctionne pas avec Chrome sur iOS).',
  'guide.install.iphone.step2':
    'Tapez sur le bouton <span class="text-vintage-accent">Partager</span> (le carré avec une flèche vers le haut) dans la barre de Safari.',
  'guide.install.iphone.step3':
    'Dans le menu qui apparaît, faites défiler et sélectionnez <span class="text-vintage-accent">Sur l\'écran d\'accueil</span> (ou "Ajouter à l\'écran d\'accueil").',
  'guide.install.iphone.step4':
    'Tapez sur <span class="text-vintage-accent">Ajouter</span> en haut à droite. L\'app DispoCam apparaîtra sur votre écran d\'accueil comme une vraie app.',
  'guide.install.iphone.safariNote':
    '⚠️ Important : vous devez impérativement ouvrir le site dans Safari. L\'option "Sur l\'écran d\'accueil" n\'apparaît pas dans d\'autres navigateurs sur iOS.',

  'guide.install.android.title': 'Android (Chrome)',
  'guide.install.android.step1':
    'Ouvrez DispoCam <span class="text-vintage-accent">dans Chrome</span> sur votre appareil Android.',
  'guide.install.android.step2':
    'Tapez sur les <span class="text-vintage-accent">trois points ⋮</span> (menu) en haut à droite de Chrome.',
  'guide.install.android.step3':
    'Sélectionnez <span class="text-vintage-accent">Installer l\'application</span> ou <span class="text-vintage-accent">Ajouter à l\'écran d\'accueil</span>. Confirmez, et DispoCam sera ajoutée à vos apps.',
  'guide.install.android.chromeNote':
    '💡 Sur Android, Chrome peut également proposer un bandeau "Ajouter à l\'écran d\'accueil" en bas de la page lors de votre première visite.',

  /* --- Menu principal (liste des pellicules) --- */
  'projects.title': 'Mes pellicules',
  'projects.new': '+ Nouvelle',
  'projects.empty': 'Aucune pellicule pour le moment.',
  'projects.emptyHint': 'Créez votre première pellicule pour commencer !',
  'projects.create': '📸 Créer une pellicule',
  'projects.timeRemaining.noLimit': 'Pas de limite',
  'projects.timeRemaining.finished': 'Terminé',
  'projects.timeRemaining.hours': '{hours}h {minutes}m restantes',
  'projects.timeRemaining.minutes': '{minutes} min restantes',
  'projects.timeRemaining.lessThan': '< 1 min',
  'projects.devTime.developed': 'Développé ✓',
  'projects.devTime.ready': 'Prêt ! 🎉',
  'projects.devTime.hours': 'Développement dans {hours}h {minutes}m',
  'projects.devTime.minutes': 'Développement dans {minutes}m',
  'projects.devTime.soon': 'Bientôt...',
  'projects.open': 'Ouvrir',
  'projects.active': 'Actif ✓',

  /* --- Création d'une pellicule --- */
  'createProject.title': 'Nouvelle pellicule',
  'createProject.name': 'Nom du projet',
  'createProject.namePlaceholder': 'Nom de la pellicule...',
  'createProject.mode': 'Mode',
  'createProject.modeSimple': '📷 Simple',
  'createProject.modeSimpleDesc': 'Choisir une caméra',
  'createProject.modeControl': '🎛️ Control freak',
  'createProject.modeControlDesc': 'Tout régler soi-même',
  'createProject.cameraSection': 'Caméra rétro / jetable',
  'createProject.cameraSettings': 'Réglages de la caméra',
  'createProject.film': 'Film',
  'createProject.ratio': 'Ratio',
  'createProject.poses': 'Poses',
  'createProject.fixedByCamera':
    'Le ratio et le film suivent la vraie caméra — non modifiables ici.',
  'createProject.filmLut': 'Film (LUT)',
  'createProject.ratioSquare': 'Carré — style Polaroid',
  'createProject.ratioClassic': 'Classique 35 mm',
  'createProject.ratioDigital': 'Standard numérique',
  'createProject.ratioCinema': 'Cinéma panoramique',
  'createProject.posesCount': 'Nombre de poses',
  'createProject.takingWindow': '⏱ Temps pour prendre les photos',
  'createProject.taking.30': '30 minutes',
  'createProject.taking.1h': '1 heure',
  'createProject.taking.2h': '2 heures',
  'createProject.taking.noLimit': 'Pas de limite',
  'createProject.custom': 'Personnalisé :',
  'createProject.dev.instant': 'Instantané',
  'createProject.dev.1h': '1 heure',
  'createProject.dev.3h': '3 heures',
  'createProject.dev.6h': '6 heures',
  'createProject.dev.tonight': 'Ce soir 20h',
  'createProject.dev.tomorrow': 'Demain 9h',
  'createProject.development': '🧪 Développement (quand les photos seront visibles)',
  'createProject.create': '📸 Créer la pellicule',
  'createProject.defaultName': 'Pellicule {count}',

  /* --- Viewfinder (caméra) --- */
  'viewfinder.loading': 'Chargement...',
  'viewfinder.switchCamera': 'Changer de caméra',
  'viewfinder.backCamera': 'Caméra arrière (dos)',
  'viewfinder.frontCamera': 'Caméra avant (selfie)',
  'viewfinder.timer': 'Minuteur de développement',
  'viewfinder.about': 'À propos',
  'viewfinder.viewRoll': 'Voir le rouleau',
  'viewfinder.timeUp': '⏰ Temps écoulé',
  'viewfinder.rollFull': 'Rouleau plein — {max}/{max} 📸',
  'viewfinder.shootingOver': '⏰ Fenêtre de prise de vue terminée',

  /* --- Orientation --- */
  'orientation.toLandscape': 'Passer en paysage',
  'orientation.toPortrait': 'Passer en portrait',
  'orientation.portrait': 'Orientation : portrait',
  'orientation.landscape': 'Orientation : paysage',

  /* --- Molette d'armement --- */
  'crank.aria': "Molette d'armement du film",
  'crank.cocked': 'Film armé',
  'crank.armProgress': 'Armez : {detents}/{total}',
  'crank.armed': 'Armé ✓',
  'crank.arm': 'Armez ↻',

  /* --- Déclencheur --- */
  'shutter.empty': 'Rouleau vide',
  'shutter.crankFirst': 'Armez la molette avant de photographier',
  'shutter.take': 'Prendre une photo',

  /* --- Sélecteur de film --- */
  'rollSelector.title': 'Choisir un film',
  'rollSelector.footer':
    "Le filtre est appliqué à la prise de vue, pas d'aperçu avant développement.",

  /* --- Galerie --- */
  'gallery.photoNotFound': 'Photo introuvable',
  'gallery.saveFailed': 'Échec de la sauvegarde',
  'gallery.photoCount': 'Photo {index} / {total}',
  'gallery.saved': 'Enregistrée dans vos photos ✓',
  'gallery.save': '💾 Sauvegarder',
  'gallery.rollName': 'Rouleau',
  'gallery.locked': 'Photos verrouillées',
  'gallery.lockedTime': 'Temps restant avant développement :',
  'gallery.lockedHint':
    "Revenez à l'heure du développement pour découvrir vos photos !",
  'gallery.prev': 'Photo précédente',
  'gallery.next': 'Photo suivante',
  'gallery.saveImage': '💾 Enregistrer',
  'gallery.delete': '🗑️ Supprimer',
  'gallery.empty': 'Aucune photo pour le moment.',
  'gallery.tapToView': 'Appuyez sur une photo pour la voir en grand',
  'gallery.prints.title': 'Vos tirages',
  'gallery.prints.emptyTitle': 'Tirages',
  'gallery.prints.empty': 'Aucun tirage pour le moment.',
  'gallery.prints.emptyHint': 'Prenez votre première photo !',
  'gallery.prints.count.one': '{count} tirage',
  'gallery.prints.count.other': '{count} tirages',
  'gallery.prints.saved.one': '{count} sauvegardé',
  'gallery.prints.saved.other': '{count} sauvegardés',
  'gallery.prints.guidePre': 'Comme de vrais tirages, vos photos sont masquées.',
  'gallery.prints.guideDownload': "Téléchargez-les d'un coup",
  'gallery.prints.guideMid': 'dans votre pellicule pour les voir,',
  'gallery.prints.guideTrash': 'jetez',
  'gallery.prints.guidePost': "celles que vous n'aimez pas.",
  'gallery.prints.downloading': '⏳ Téléchargement…',
  'gallery.prints.allSaved': '✅ Tout est dans vos photos',
  'gallery.prints.downloadAll': '📥 Tout télécharger dans mes photos',
  'gallery.prints.exportInfo.one':
    'La photo sera exportée en une fois dans votre pellicule photo.',
  'gallery.prints.exportInfo.other':
    'Les {count} photos seront exportées en une fois dans votre pellicule photo.',
  'gallery.prints.downloadError': 'Échec du téléchargement. Réessayez.',

  /* --- Minuteur de développement --- */
  'devTimer.title': 'Développement',
  'devTimer.activeRoll': 'Pellicule active',
  'devTimer.remaining': 'Temps restant avant développement',
  'devTimer.cancelLock': 'Annuler le verrouillage',
  'devTimer.takingWindow': 'Fenêtre de prise de vue',
  'devTimer.quick': 'Durées rapides',
  'devTimer.custom': 'Délai personnalisé',
  'devTimer.footer': "Les photos resteront masquées jusqu'au développement.",
  'devTimer.option.1h': '1 heure',
  'devTimer.option.3h': '3 heures',
  'devTimer.option.6h': '6 heures',
  'devTimer.option.tonight': 'Ce soir 20h',
  'devTimer.option.tomorrow': 'Demain 9h',
  'devTimer.option.noLock': 'Pas de verrou',

  /* --- Temps restants --- */
  'lockTimer.developed': 'Développement prêt ! 🎉',
  'lockTimer.hours': '{hours}h {minutes}m',
  'lockTimer.minutes': '{minutes} min',
  'lockTimer.lessThan': "Moins d'une minute",
  'lockTimer.takingFinished': 'Terminé',
  'lockTimer.takingHours': '📷 {hours}h {minutes}m restantes',
  'lockTimer.takingMinutes': '📷 {minutes} min restantes',
  'lockTimer.takingLessThan': "📷 Moins d'une minute",

  /* --- Erreurs caméra --- */
  'cameraError.secureContext':
    "L'appareil photo nécessite une connexion sécurisée (https). Ouvrez l'app en https:// depuis votre téléphone (ou en \"http://localhost\" sur un ordinateur).",
  'cameraError.permission':
    "Permission caméra refusée. Autorisez l'accès dans les paramètres.",
  'cameraError.noDevice': 'Aucune caméra détectée.',
  'cameraError.constraints': 'Caméra introuvable avec les réglages demandés.',
  'cameraError.unknown': "Erreur inconnue lors de l'accès à la caméra.",

  /* --- Divers --- */
  'tip.buyCoffee': 'Offrir un café',
  'meta.title': 'DispoCam — Appareil Jetable',
};

export const en: Record<string, string> = {
  /* --- App / About --- */
  'app.about': 'About',
  'app.aboutTagline':
    'The vintage disposable camera in your pocket. Create multiple rolls with different films, take your shots, and develop them later.',
  'app.aboutFree': '100% free. Works offline. Installable PWA.',

  /* --- Guide / Welcome --- */
  'guide.title': 'Welcome',
  'guide.tab.philosophy': 'Philosophy',
  'guide.tab.guide': 'Guide',
  'guide.tab.install': 'Install',

  /* -- Philosophy -- */
  'guide.philosophy.intro':
    'DispoCam recreates the magical and imperfect experience of a disposable film camera — right inside your phone.',
  'guide.philosophy.limited':
    'Limited exposures: every shot counts. Just like a real disposable, you have a finite roll before you can develop it.',
  'guide.philosophy.wait':
    'Mandatory development time: your photos stay hidden for several hours. The anticipation is part of the fun.',
  'guide.philosophy.private':
    'Your photos are encrypted and locked until development. Nobody can see them before the timer runs out — not even you.',
  'guide.philosophy.surprise':
    'The magic of discovery: when the timer hits zero, you rediscover your memories, just like opening an envelope of prints.',
  'guide.philosophy.vintage':
    'Authentic vintage rendering with simulated film stocks (Kodak, Fuji, Ilford, Polaroid…) to bring back the grain and colors of analog photography.',
  'guide.philosophy.footer':
    'No algorithm, no instant filters, no editing. Just the joy of taking photos and the patience of discovering them.',

  /* -- Usage Guide -- */
  'guide.steps.intro':
    'Here is how to use DispoCam in 5 simple steps:',
  'guide.steps.create.title': 'Create a roll',
  'guide.steps.create.desc':
    'Give your roll a name. It is like loading a fresh film roll into your disposable camera.',
  'guide.steps.settings.title': 'Choose your film and settings',
  'guide.steps.settings.desc':
    'Pick a film from our color profiles (Kodak Gold, Fuji Superia, Polaroid…) and set the number of exposures, aspect ratio, and development time.',
  'guide.steps.shoot.title': 'Take your photos',
  'guide.steps.shoot.desc':
    'Frame, shoot. You can also use the volume buttons to capture. The exposure counter shows how many shots you have left.',
  'guide.steps.develop.title': 'Wait for development',
  'guide.steps.develop.desc':
    'Once the roll is full (or the shooting window expires), development starts automatically. Your photos remain locked during this period.',
  'guide.steps.discover.title': 'Discover and export your photos',
  'guide.steps.discover.desc':
    'When development is complete, unlock your gallery and admire your shots. Download them all at once to your photo library.',
  'guide.steps.tip':
    'Tip: create a roll before going out, take your photos without worrying about the result, and discover them the next day — just like the film era!',

  /* -- PWA Installation -- */
  'guide.install.intro':
    'DispoCam is a PWA (Progressive Web App). Install it on your home screen to use it like a native app, even offline.',
  'guide.install.benefits.offline.icon': '📡',
  'guide.install.benefits.offline.label': 'Offline',
  'guide.install.benefits.fullscreen.icon': '📱',
  'guide.install.benefits.fullscreen.label': 'Full screen',
  'guide.install.benefits.app.icon': '🚀',
  'guide.install.benefits.app.label': 'Like an app',

  'guide.install.iphone.title': 'iPhone & iPad (Safari)',
  'guide.install.iphone.step1':
    'Open DispoCam <span class="text-vintage-accent">in Safari</span> (this does not work with Chrome on iOS).',
  'guide.install.iphone.step2':
    'Tap the <span class="text-vintage-accent">Share</span> button (the square with an upward arrow) in the Safari toolbar.',
  'guide.install.iphone.step3':
    'In the menu that appears, scroll down and select <span class="text-vintage-accent">Add to Home Screen</span>.',
  'guide.install.iphone.step4':
    'Tap <span class="text-vintage-accent">Add</span> in the top right corner. The DispoCam app will appear on your home screen like a native app.',
  'guide.install.iphone.safariNote':
    '⚠️ Important: you must open the website in Safari. The "Add to Home Screen" option does not appear in other browsers on iOS.',

  'guide.install.android.title': 'Android (Chrome)',
  'guide.install.android.step1':
    'Open DispoCam <span class="text-vintage-accent">in Chrome</span> on your Android device.',
  'guide.install.android.step2':
    'Tap the <span class="text-vintage-accent">three dots ⋮</span> (menu) in the top right corner of Chrome.',
  'guide.install.android.step3':
    'Select <span class="text-vintage-accent">Install app</span> or <span class="text-vintage-accent">Add to Home screen</span>. Confirm, and DispoCam will be added to your apps.',
  'guide.install.android.chromeNote':
    '💡 On Android, Chrome may also show an "Add to Home screen" banner at the bottom of the page on your first visit.',

  /* --- Main menu (roll list) --- */
  'projects.title': 'My rolls',
  'projects.new': '+ New',
  'projects.empty': 'No rolls yet.',
  'projects.emptyHint': 'Create your first roll to get started!',
  'projects.create': '📸 Create a roll',
  'projects.timeRemaining.noLimit': 'No limit',
  'projects.timeRemaining.finished': 'Finished',
  'projects.timeRemaining.hours': '{hours}h {minutes}m remaining',
  'projects.timeRemaining.minutes': '{minutes} min remaining',
  'projects.timeRemaining.lessThan': '< 1 min',
  'projects.devTime.developed': 'Developed ✓',
  'projects.devTime.ready': 'Ready! 🎉',
  'projects.devTime.hours': 'Developing in {hours}h {minutes}m',
  'projects.devTime.minutes': 'Developing in {minutes}m',
  'projects.devTime.soon': 'Soon...',
  'projects.open': 'Open',
  'projects.active': 'Active ✓',

  /* --- Create project --- */
  'createProject.title': 'New roll',
  'createProject.name': 'Project name',
  'createProject.namePlaceholder': 'Roll name...',
  'createProject.mode': 'Mode',
  'createProject.modeSimple': '📷 Simple',
  'createProject.modeSimpleDesc': 'Choose a camera',
  'createProject.modeControl': '🎛️ Control freak',
  'createProject.modeControlDesc': 'Adjust everything yourself',
  'createProject.cameraSection': 'Retro / disposable camera',
  'createProject.cameraSettings': 'Camera settings',
  'createProject.film': 'Film',
  'createProject.ratio': 'Ratio',
  'createProject.poses': 'Exposures',
  'createProject.fixedByCamera':
    'The ratio and film follow the real camera — not editable here.',
  'createProject.filmLut': 'Film (LUT)',
  'createProject.ratioSquare': 'Square — Polaroid style',
  'createProject.ratioClassic': 'Classic 35 mm',
  'createProject.ratioDigital': 'Digital standard',
  'createProject.ratioCinema': 'Panoramic cinema',
  'createProject.posesCount': 'Number of exposures',
  'createProject.takingWindow': '⏱ Time to take the photos',
  'createProject.taking.30': '30 minutes',
  'createProject.taking.1h': '1 hour',
  'createProject.taking.2h': '2 hours',
  'createProject.taking.noLimit': 'No limit',
  'createProject.custom': 'Custom:',
  'createProject.dev.instant': 'Instant',
  'createProject.dev.1h': '1 hour',
  'createProject.dev.3h': '3 hours',
  'createProject.dev.6h': '6 hours',
  'createProject.dev.tonight': 'Tonight 8 pm',
  'createProject.dev.tomorrow': 'Tomorrow 9 am',
  'createProject.development': '🧪 Development (when photos become visible)',
  'createProject.create': '📸 Create the roll',
  'createProject.defaultName': 'Roll {count}',

  /* --- Viewfinder --- */
  'viewfinder.loading': 'Loading...',
  'viewfinder.switchCamera': 'Switch camera',
  'viewfinder.backCamera': 'Back camera',
  'viewfinder.frontCamera': 'Front camera (selfie)',
  'viewfinder.timer': 'Development timer',
  'viewfinder.about': 'About',
  'viewfinder.viewRoll': 'View the roll',
  'viewfinder.timeUp': '⏰ Time is up',
  'viewfinder.rollFull': 'Roll full — {max}/{max} 📸',
  'viewfinder.shootingOver': '⏰ Shooting window is over',

  /* --- Orientation --- */
  'orientation.toLandscape': 'Switch to landscape',
  'orientation.toPortrait': 'Switch to portrait',
  'orientation.portrait': 'Orientation: portrait',
  'orientation.landscape': 'Orientation: landscape',

  /* --- Crank wheel --- */
  'crank.aria': 'Film advance wheel',
  'crank.cocked': 'Film cocked',
  'crank.armProgress': 'Cock: {detents}/{total}',
  'crank.armed': 'Armed ✓',
  'crank.arm': 'Cock ↻',

  /* --- Shutter --- */
  'shutter.empty': 'Roll is empty',
  'shutter.crankFirst': 'Cock the film before shooting',
  'shutter.take': 'Take a photo',

  /* --- Roll selector --- */
  'rollSelector.title': 'Choose a film',
  'rollSelector.footer':
    'The filter is applied at capture time — no preview before development.',

  /* --- Gallery --- */
  'gallery.photoNotFound': 'Photo not found',
  'gallery.saveFailed': 'Save failed',
  'gallery.photoCount': 'Photo {index} / {total}',
  'gallery.saved': 'Saved to your photos ✓',
  'gallery.save': '💾 Save',
  'gallery.rollName': 'Roll',
  'gallery.locked': 'Photos locked',
  'gallery.lockedTime': 'Time remaining before development:',
  'gallery.lockedHint': 'Come back when development is done to discover your photos!',
  'gallery.prev': 'Previous photo',
  'gallery.next': 'Next photo',
  'gallery.saveImage': '💾 Save',
  'gallery.delete': '🗑️ Delete',
  'gallery.empty': 'No photos yet.',
  'gallery.tapToView': 'Tap a photo to view it larger',
  'gallery.prints.title': 'Your prints',
  'gallery.prints.emptyTitle': 'Prints',
  'gallery.prints.empty': 'No prints yet.',
  'gallery.prints.emptyHint': 'Take your first photo!',
  'gallery.prints.count.one': '{count} print',
  'gallery.prints.count.other': '{count} prints',
  'gallery.prints.saved.one': '{count} saved',
  'gallery.prints.saved.other': '{count} saved',
  'gallery.prints.guidePre': 'Like real prints, your photos stay hidden.',
  'gallery.prints.guideDownload': 'Download them all at once',
  'gallery.prints.guideMid': 'into your roll to see them,',
  'gallery.prints.guideTrash': 'throw away',
  'gallery.prints.guidePost': "the ones you don't like.",
  'gallery.prints.downloading': '⏳ Downloading…',
  'gallery.prints.allSaved': '✅ Everything is in your photos',
  'gallery.prints.downloadAll': '📥 Download all to my photos',
  'gallery.prints.exportInfo.one': 'The photo will be exported to your photo library.',
  'gallery.prints.exportInfo.other':
    'All {count} photos will be exported at once to your photo library.',
  'gallery.prints.downloadError': 'Download failed. Try again.',

  /* --- Development timer --- */
  'devTimer.title': 'Development',
  'devTimer.activeRoll': 'Active roll',
  'devTimer.remaining': 'Time remaining before development',
  'devTimer.cancelLock': 'Cancel lock',
  'devTimer.takingWindow': 'Shooting window',
  'devTimer.quick': 'Quick durations',
  'devTimer.custom': 'Custom delay',
  'devTimer.footer': 'Photos will stay hidden until development.',
  'devTimer.option.1h': '1 hour',
  'devTimer.option.3h': '3 hours',
  'devTimer.option.6h': '6 hours',
  'devTimer.option.tonight': 'Tonight 8 pm',
  'devTimer.option.tomorrow': 'Tomorrow 9 am',
  'devTimer.option.noLock': 'No lock',

  /* --- Lock timer --- */
  'lockTimer.developed': 'Development ready! 🎉',
  'lockTimer.hours': '{hours}h {minutes}m',
  'lockTimer.minutes': '{minutes} min',
  'lockTimer.lessThan': 'Less than a minute',
  'lockTimer.takingFinished': 'Finished',
  'lockTimer.takingHours': '📷 {hours}h {minutes}m remaining',
  'lockTimer.takingMinutes': '📷 {minutes} min remaining',
  'lockTimer.takingLessThan': '📷 Less than a minute',

  /* --- Camera errors --- */
  'cameraError.secureContext':
    'The camera requires a secure connection (https). Open the app over https:// from your phone (or "http://localhost" on a computer).',
  'cameraError.permission':
    'Camera permission denied. Allow access in your settings.',
  'cameraError.noDevice': 'No camera detected.',
  'cameraError.constraints': 'No camera found with the requested settings.',
  'cameraError.unknown': 'Unknown error while accessing the camera.',

  /* --- Misc --- */
  'tip.buyCoffee': 'Buy me a coffee',
  'meta.title': 'DispoCam — Disposable Camera',
};

export const translations: Record<Lang, Record<string, string>> = { fr, en };

/**
 * Remplace les clés de traduction en interpolant les paramètres `{key}`.
 * Repli sur le français si la clé est absente du dictionnaire choisi.
 */
export function translate(lang: Lang, key: string, params?: I18nParams): string {
  const dict = translations[lang];
  let str = dict[key] !== undefined ? dict[key] : translations.fr[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      str = str.split(`{${k}}`).join(String(v));
    }
  }
  return str;
}

/**
 * Traduction avec pluriels selon les règles de la langue (Intl.PluralRules).
 * Attend des clés suffixées `.one` / `.other` (ex: 'gallery.prints.count.one').
 */
export function plural(
  lang: Lang,
  key: string,
  count: number,
  params: I18nParams = {},
): string {
  const form = new Intl.PluralRules(lang).select(count);
  const pluralKey = `${key}.${form}`;
  const dict = translations[lang];
  const target = dict[pluralKey] !== undefined ? pluralKey : `${key}.other`;
  return translate(lang, target, { ...params, count });
}