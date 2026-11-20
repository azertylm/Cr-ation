export type CategoryId = 'memoire' | 'arts' | 'musique' | 'cuisine';

export type WorkshopMode = 'standard' | 'visual' | 'quiz' | 'interactive';

export type VisualCardStyle =
  | 'storybook'
  | 'newspaper'
  | 'greeting-card'
  | 'painting'
  | 'coloring-page'
  | 'garden-plan'
  | 'event-poster'
  | 'knitting-pattern'
  | 'thought-card'
  | 'recipe-card';

export interface ChoiceOption {
  id: string;
  label: string;
  emoji: string;
  description?: string;
}

export interface WorkshopStep {
  id: 'step1' | 'step2' | 'step3';
  question: string;
  helperText: string;
  allowVoiceDictation?: boolean;
  voicePromptPlaceholder?: string;
  options: ChoiceOption[];
}

export interface WorkshopDefinition {
  id: string;
  number: number;
  categoryId: CategoryId;
  title: string;
  shortDescription: string;
  emoji: string;
  mode: WorkshopMode;
  visualStyle?: VisualCardStyle;
  steps: [WorkshopStep, WorkshopStep, WorkshopStep];
  systemPrompt: string;
}

export interface CategoryDefinition {
  id: CategoryId;
  number: number;
  title: string;
  subtitle: string;
  emoji: string;
  accentColor: string;
  bgLightClass: string;
  borderClass: string;
  badgeTextClass: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface InteractiveChapter {
  chapterTitle: string;
  content: string;
  choiceMade?: string;
  choices: string[];
}

export interface SavedCreation {
  id: string;
  workshopId: string;
  workshopTitle: string;
  workshopEmoji: string;
  categoryId: CategoryId;
  createdAt: string;
  selections: {
    step1: string;
    step2: string;
    step3: string;
  };
  title: string;
  subtitle: string;
  content: string;
  tips?: string[];
  imageUrl?: string;
  visualStyle?: VisualCardStyle;
  quizQuestions?: QuizQuestion[];
  interactiveHistory?: InteractiveChapter[];
}

export const CATEGORIES: CategoryDefinition[] = [
  {
    id: 'memoire',
    number: 1,
    title: 'Mémoire & Transmission',
    subtitle: 'Contes, souvenirs de vie, gazette familiale, cartes et lettres du cœur',
    emoji: '📖',
    accentColor: '#1E40AF',
    bgLightClass: 'bg-blue-50 dark:bg-blue-950/60',
    borderClass: 'border-blue-800 dark:border-blue-300',
    badgeTextClass: 'text-blue-950 dark:text-blue-200',
  },
  {
    id: 'arts',
    number: 2,
    title: 'Arts Visuels & Création',
    subtitle: 'Tableaux peints, coloriages à imprimer, jardin rêvé, affiches et tricot',
    emoji: '🎨',
    accentColor: '#065F46',
    bgLightClass: 'bg-emerald-50 dark:bg-emerald-950/60',
    borderClass: 'border-emerald-800 dark:border-emerald-300',
    badgeTextClass: 'text-emerald-950 dark:text-emerald-200',
  },
  {
    id: 'musique',
    number: 3,
    title: 'Musique, Poésie & Humour',
    subtitle: 'Chansons de guinguette, poèmes doux, blagues, quiz et belles pensées',
    emoji: '🪗',
    accentColor: '#9A3412',
    bgLightClass: 'bg-amber-50 dark:bg-amber-950/60',
    borderClass: 'border-amber-800 dark:border-amber-300',
    badgeTextClass: 'text-amber-950 dark:text-amber-200',
  },
  {
    id: 'cuisine',
    number: 4,
    title: 'Cuisine, Voyages & Curiosité',
    subtitle: 'Carnet de recettes, voyages en fauteuil, inventions et café historique',
    emoji: '🍲',
    accentColor: '#881337',
    bgLightClass: 'bg-rose-50 dark:bg-rose-950/60',
    borderClass: 'border-rose-800 dark:border-rose-300',
    badgeTextClass: 'text-rose-950 dark:text-rose-200',
  },
];

export const WORKSHOPS: WorkshopDefinition[] = [
  // ============================================================================
  // CATÉGORIE 1 : MÉMOIRE, HISTOIRES & TRANSMISSION (1 à 5)
  // ============================================================================
  {
    id: 'contes-petits-enfants',
    number: 1,
    categoryId: 'memoire',
    title: 'Contes pour mes petits-enfants',
    shortDescription: 'Inventez une histoire tendre et illustrée avec un héros attachant et une belle morale.',
    emoji: '🧸',
    mode: 'visual',
    visualStyle: 'storybook',
    systemPrompt:
      "Tu es un grand-parent conteur plein de tendresse. Écris un conte merveilleux, rassurant et facile à lire à voix haute pour des petits-enfants (environ 220 mots), suivi de sa douce morale.",
    steps: [
      {
        id: 'step1',
        question: 'Qui est le héros de votre histoire ?',
        helperText: 'Touchez un personnage ou dites son nom à voix haute.',
        allowVoiceDictation: true,
        voicePromptPlaceholder: 'Ex: Un petit hérisson appelé Arthur...',
        options: [
          { id: 'ecureuil', label: 'Un petit écureuil curieux', emoji: '🐿️' },
          { id: 'ourson', label: 'Un ourson gourmand de miel', emoji: '🐻' },
          { id: 'hirondelle', label: 'Une hirondelle voyageuse', emoji: '🐦' },
          { id: 'chaton', label: 'Un chaton qui aimait la musique', emoji: '🐱' },
          { id: 'petit-fils', label: 'Un enfant courageux et rêveur', emoji: '🧒' },
          { id: 'tortue', label: 'Une tortue très sage', emoji: '🐢' },
        ],
      },
      {
        id: 'step2',
        question: 'Où se déroule cette aventure ?',
        helperText: 'Choisissez le décor magique de votre conte.',
        allowVoiceDictation: true,
        options: [
          { id: 'foret', label: 'Dans une forêt dorée d’automne', emoji: '🍂' },
          { id: 'grenier', label: 'Dans le grenier aux mille trésors', emoji: '🕰️' },
          { id: 'potager', label: 'Au cœur d’un grand jardin potager', emoji: '🥕' },
          { id: 'phare', label: 'Près d’un vieux phare au bord de mer', emoji: '🌊' },
          { id: 'moulin', label: 'Au vieux moulin de la rivière', emoji: '🌾' },
          { id: 'nuages', label: 'Sur un nuage au-dessus du village', emoji: '☁️' },
        ],
      },
      {
        id: 'step3',
        question: 'Quel beau message souhaitez-vous transmettre ?',
        helperText: 'La petite leçon de vie qui terminera le conte.',
        allowVoiceDictation: true,
        options: [
          { id: 'partage', label: 'Le bonheur de partager avec ses amis', emoji: '🤝' },
          { id: 'patience', label: 'La patience fait éclore les plus belles fleurs', emoji: '🌱' },
          { id: 'courage', label: 'Même tout petit, on peut être très grand', emoji: '⭐' },
          { id: 'ecoute', label: 'Savoir écouter les conseils des anciens', emoji: '💛' },
          { id: 'curiosite', label: 'La curiosité ouvre toutes les portes', emoji: '🔑' },
          { id: 'famille', label: 'L’amour de la famille est le plus doux refuge', emoji: '🏡' },
        ],
      },
    ],
  },
  {
    id: 'livre-souvenirs',
    number: 2,
    categoryId: 'memoire',
    title: 'Mon Livre de Souvenirs',
    shortDescription: 'Racontez une anecdote de jeunesse ou un souvenir : il sera mis au propre avec élégance.',
    emoji: '🖋️',
    mode: 'standard',
    systemPrompt:
      "Tu es un biographe familial respectueux. Remets au propre et enrichis délicatement le souvenir raconté sans jamais trahir le ton sincère et authentique de la personne âgée. Propose un beau titre de chapitre.",
    steps: [
      {
        id: 'step1',
        question: 'Quelle époque de votre vie souhaitez-vous évoquer ?',
        helperText: 'Choisissez un moment ou dictez librement votre souvenir.',
        allowVoiceDictation: true,
        voicePromptPlaceholder: 'Racontez votre souvenir avec vos propres mots...',
        options: [
          { id: 'ecole', label: 'Les années d’école et la cour de récréation', emoji: '🎒' },
          { id: 'vacances', label: 'Les grandes vacances d’été en famille', emoji: '☀️' },
          { id: 'metier', label: 'Mon premier métier et mes collègues', emoji: '⚒️' },
          { id: 'fete', label: 'Un grand repas de fête ou un bal', emoji: '💃' },
          { id: 'maison', label: 'La maison de mon enfance', emoji: '🏠' },
          { id: 'rencontre', label: 'Une rencontre inoubliable', emoji: '💐' },
        ],
      },
      {
        id: 'step2',
        question: 'Quel détail vous revient en premier à l’esprit ?',
        helperText: 'Vous pouvez aussi toucher le micro pour raconter les détails.',
        allowVoiceDictation: true,
        options: [
          { id: 'odeur', label: 'Les parfums de cuisine et du jardin', emoji: '🥖' },
          { id: 'rires', label: 'Les éclats de rire et les chansons', emoji: '😊' },
          { id: 'trajet', label: 'Les chemins à vélo ou en train', emoji: '🚲' },
          { id: 'saisons', label: 'Les hivers au coin du feu ou les moissons', emoji: '🔥' },
          { id: 'jeux', label: 'Nos jeux simples avec trois fois rien', emoji: '🪁' },
          { id: 'conseil', label: 'Les paroles sages de mes parents', emoji: '🕯️' },
        ],
      },
      {
        id: 'step3',
        question: 'Quel ton souhaitez-vous donner à cette page ?',
        helperText: 'Le style d’écriture de votre souvenir.',
        allowVoiceDictation: false,
        options: [
          { id: 'tendre', label: 'Tendre, émouvant et nostalgique', emoji: '💌' },
          { id: 'joyeux', label: 'Joyeux, vivant et plein d’humour', emoji: '😄' },
          { id: 'poetique', label: 'Poétique et contemplatif', emoji: '🌿' },
          { id: 'transmission', label: 'Comme un récit pour mes petits-enfants', emoji: '👨‍👩‍👧‍👦' },
        ],
      },
    ],
  },
  {
    id: 'gazette-famille',
    number: 3,
    categoryId: 'memoire',
    title: 'La Gazette de la Famille',
    shortDescription: 'Créez une vraie « Une » de journal rétro avec les petites et grandes nouvelles de la famille.',
    emoji: '🗞️',
    mode: 'visual',
    visualStyle: 'newspaper',
    systemPrompt:
      "Tu es le rédacteur en chef d'un charmant journal familial rétro à la française ('Le Petit Écho de la Famille'). Rédige 3 courts articles chaleureux avec des gros titres accrocheurs et bienveillants.",
    steps: [
      {
        id: 'step1',
        question: 'Quelle est la grande nouvelle en « Une » du journal ?',
        helperText: 'Choisissez un événement ou dictez votre propre nouvelle.',
        allowVoiceDictation: true,
        voicePromptPlaceholder: 'Ex: L’anniversaire de mariage ou la visite des enfants...',
        options: [
          { id: 'repas', label: 'Grand rassemblement familial autour de la table', emoji: '🍽️' },
          { id: 'anniversaire', label: 'Un bel anniversaire fêté dans la joie', emoji: '🎂' },
          { id: 'jardin', label: 'Récolte exceptionnelle au jardin cette saison', emoji: '🍅' },
          { id: 'visite', label: 'La visite surprise des enfants et petits-enfants', emoji: '🚗' },
          { id: 'voyage', label: 'Une belle escapade ou promenade mémorable', emoji: '🗺️' },
          { id: 'naissance', label: 'Une heureuse nouvelle qui agrandit la famille', emoji: '👶' },
        ],
      },
      {
        id: 'step2',
        question: 'Quelle est la deuxième petite rubrique du jour ?',
        helperText: 'Un clin d’œil du quotidien pour sourire.',
        allowVoiceDictation: true,
        options: [
          { id: 'meteo', label: 'Bulletin météo du cœur : grand soleil à la maison', emoji: '🌤️' },
          { id: 'gourmandise', label: 'Le secret de la tarte maison enfin dévoilé', emoji: '🥧' },
          { id: 'jeux', label: 'Victoire historique à la belote ou au scrabble', emoji: '🃏' },
          { id: 'animaux', label: 'Les dernières facéties du chat ou du chien', emoji: '🐾' },
        ],
      },
      {
        id: 'step3',
        question: 'Quel style de journal préférez-vous ?',
        helperText: 'L’esprit de votre gazette familiale.',
        allowVoiceDictation: false,
        options: [
          { id: 'retro', label: 'Gazette rétro pleine de charme d’antan', emoji: '📜' },
          { id: 'humour', label: 'Journal joyeux et plein de clins d’œil', emoji: '🎭' },
          { id: 'affectueux', label: 'Chronique tendre et affectueuse', emoji: '❤️' },
          { id: 'officiel', label: 'Édition spéciale grand événement', emoji: '🎺' },
        ],
      },
    ],
  },
  {
    id: 'cartes-voeux',
    number: 4,
    categoryId: 'memoire',
    title: 'Cartes de Vœux Magiques',
    shortDescription: 'Composez une jolie carte illustrée prête à imprimer ou envoyer pour chaque occasion.',
    emoji: '💐',
    mode: 'visual',
    visualStyle: 'greeting-card',
    systemPrompt:
      "Tu es un créateur de cartes de vœux françaises élégantes et chaleureuses. Rédige un texte de carte sincère, lumineux et touchant, prêt à être offert ou imprimé.",
    steps: [
      {
        id: 'step1',
        question: 'Quelle occasion souhaitez-vous célébrer ?',
        helperText: 'Choisissez la fête ou l’attention du jour.',
        allowVoiceDictation: true,
        options: [
          { id: 'anniversaire', label: 'Un Joyeux Anniversaire', emoji: '🎂' },
          { id: 'fete', label: 'Une Bonne Fête ou un doux bonjour', emoji: '🌸' },
          { id: 'remerciement', label: 'Dire un grand Merci du fond du cœur', emoji: '🙏' },
          { id: 'noel', label: 'Belles fêtes de fin d’année et Nouvel An', emoji: '🎄' },
          { id: 'retablissement', label: 'Prompt rétablissement et doux courage', emoji: '🌞' },
          { id: 'naissance', label: 'Félicitations pour un heureux événement', emoji: '🎀' },
        ],
      },
      {
        id: 'step2',
        question: 'Pour qui est cette carte ?',
        helperText: 'Vous pouvez aussi dicter le prénom du destinataire.',
        allowVoiceDictation: true,
        voicePromptPlaceholder: 'Ex: Pour ma petite-fille Clara...',
        options: [
          { id: 'petits-enfants', label: 'Pour mes petits-enfants adorés', emoji: '🧒' },
          { id: 'enfants', label: 'Pour mes enfants chéris', emoji: '💝' },
          { id: 'ami', label: 'Pour un(e) ami(e) fidèle de toujours', emoji: '☕' },
          { id: 'voisin', label: 'Pour un voisin ou une personne serviable', emoji: '🏡' },
        ],
      },
      {
        id: 'step3',
        question: 'Quelle ambiance visuelle voulez-vous sur la carte ?',
        helperText: 'Le décor qui entourera votre message.',
        allowVoiceDictation: false,
        options: [
          { id: 'fleurs', label: 'Bouquet champêtre et fleurs d’aquarelle', emoji: '🌷' },
          { id: 'dorure', label: 'Cadre doré classique et élégant', emoji: '✨' },
          { id: 'oiseaux', label: 'Jardin ensoleillé et oiseaux chanteurs', emoji: '🐦' },
          { id: 'festif', label: 'Couleurs joyeuses et fête', emoji: '🎈' },
        ],
      },
    ],
  },
  {
    id: 'lettres-coeur',
    number: 5,
    categoryId: 'memoire',
    title: 'Lettres du Cœur',
    shortDescription: 'Écrivez une lettre affectueuse à un proche ou un courrier clair sans aucun stress.',
    emoji: '✉️',
    mode: 'standard',
    systemPrompt:
      "Tu es une plume française délicate et attentive. Rédige une lettre chaleureuse, bien formulée, respectueuse et naturelle selon le destinataire et l'intention choisis.",
    steps: [
      {
        id: 'step1',
        question: 'À qui souhaitez-vous écrire aujourd’hui ?',
        helperText: 'Choisissez votre destinataire ou dictez son prénom.',
        allowVoiceDictation: true,
        options: [
          { id: 'famille-proche', label: 'À un membre de ma famille que j’aime fort', emoji: '❤️' },
          { id: 'ami-lointain', label: 'À un(e) ami(e) que je n’ai pas vu(e) depuis longtemps', emoji: '📮' },
          { id: 'soignant', label: 'À une personne qui m’aide au quotidien', emoji: '🤝' },
          { id: 'courrier-simple', label: 'Un courrier pratique ou administratif simple', emoji: '📋' },
        ],
      },
      {
        id: 'step2',
        question: 'Quel est le message principal de votre lettre ?',
        helperText: 'Touchez une intention ou dictez ce que vous avez sur le cœur.',
        allowVoiceDictation: true,
        options: [
          { id: 'nouvelles', label: 'Donner de mes nouvelles et prendre des siennes', emoji: '☕' },
          { id: 'tendresse', label: 'Dire combien je pense à eux avec tendresse', emoji: '🌹' },
          { id: 'invitation', label: 'Proposer de se retrouver bientôt pour un bon moment', emoji: '🍰' },
          { id: 'souvenir-commun', label: 'Rappeler un beau souvenir partagé ensemble', emoji: '📸' },
        ],
      },
      {
        id: 'step3',
        question: 'Comment souhaitez-vous signer votre lettre ?',
        helperText: 'La tonalité finale de votre courrier.',
        allowVoiceDictation: false,
        options: [
          { id: 'affectueux', label: 'Avec toute mon affection et mes baisers', emoji: '💋' },
          { id: 'chaleureux', label: 'Chaleureusement et avec amitié', emoji: '🌞' },
          { id: 'poetique', label: 'Doucement et avec poésie', emoji: '🪶' },
          { id: 'courtois', label: 'Simple, clair et très courtois', emoji: '✒️' },
        ],
      },
    ],
  },

  // ============================================================================
  // CATÉGORIE 2 : ARTS VISUELS & CRÉATION GRAPHIQUE (6 à 10)
  // ============================================================================
  {
    id: 'atelier-peinture',
    number: 6,
    categoryId: 'arts',
    title: "L'Atelier de Peinture",
    shortDescription: 'Choisissez la technique, le paysage et la lumière pour faire naître un beau tableau.',
    emoji: '🖼️',
    mode: 'visual',
    visualStyle: 'painting',
    systemPrompt:
      "Tu es un maître peintre et guide de musée bienveillant. Décris avec poésie le tableau créé selon la technique, le sujet et la lumière choisis, comme un cartel d'exposition inspirant accompagné de secrets d'artiste.",
    steps: [
      {
        id: 'step1',
        question: 'Quelle technique de peinture préférez-vous ?',
        helperText: 'Choisissez la matière de votre toile.',
        allowVoiceDictation: false,
        options: [
          { id: 'aquarelle', label: 'Aquarelle douce et lumineuse', emoji: '💧' },
          { id: 'huile', label: 'Peinture à l’huile façon impressionniste', emoji: '🎨' },
          { id: 'pastel', label: 'Pastels tendres et veloutés', emoji: '🖍️' },
          { id: 'gouache', label: 'Gouache aux couleurs franches et joyeuses', emoji: '🖌️' },
        ],
      },
      {
        id: 'step2',
        question: 'Quel sujet souhaitez-vous peindre ?',
        helperText: 'Choisissez une scène ou décrivez-la à voix haute.',
        allowVoiceDictation: true,
        options: [
          { id: 'provence', label: 'Un village de Provence bordé de lavandes', emoji: '🌿' },
          { id: 'mer', label: 'Des voiliers dans un petit port breton', emoji: '⛵' },
          { id: 'bouquet', label: 'Un grand bouquet de pivoines près de la fenêtre', emoji: '🌺' },
          { id: 'campagne', label: 'Un chemin de campagne sous les coquelicots', emoji: '🌾' },
          { id: 'cafe', label: 'Une terrasse de café parisien sous les arbres', emoji: '🥐' },
          { id: 'montagne', label: 'Un chalet paisible face aux sommets enneigés', emoji: '🏔️' },
        ],
      },
      {
        id: 'step3',
        question: 'Quelle lumière éclaire votre tableau ?',
        helperText: 'L’heure et l’atmosphère de votre œuvre.',
        allowVoiceDictation: false,
        options: [
          { id: 'matin', label: 'La fraîcheur rosée du petit matin', emoji: '🌅' },
          { id: 'soleil', label: 'Le plein soleil doré d’un après-midi d’été', emoji: '☀️' },
          { id: 'couchant', label: 'Les couleurs ambrées du soleil couchant', emoji: '🌇' },
          { id: 'clair-de-lune', label: 'La douceur étoilée d’un soir paisible', emoji: '🌙' },
        ],
      },
    ],
  },
  {
    id: 'coloriages-mesure',
    number: 7,
    categoryId: 'arts',
    title: 'Coloriages sur Mesure',
    shortDescription: 'Créez un beau dessin en noir et blanc aux traits nets, prêt à imprimer et colorier.',
    emoji: '✏️',
    mode: 'visual',
    visualStyle: 'coloring-page',
    systemPrompt:
      "Tu es un illustrateur de cahiers de coloriage d'art-thérapie pour seniors et petits-enfants. Présente le dessin à colorier et propose une belle harmonie de crayons de couleur ou feutres pour lui donner vie.",
    steps: [
      {
        id: 'step1',
        question: 'Quel thème avez-vous envie de colorier ?',
        helperText: 'Choisissez un motif apaisant.',
        allowVoiceDictation: true,
        options: [
          { id: 'fleurs-jardin', label: 'Rosace florale et papillons du jardin', emoji: '🦋' },
          { id: 'oiseaux', label: 'Oiseaux perchés dans un arbre fruitier', emoji: '🐦' },
          { id: 'village', label: 'Maisons de village et petites ruelles', emoji: '🏘️' },
          { id: 'chat-salon', label: 'Un chat endormi près d’une théière fleurie', emoji: '🐱' },
          { id: 'marin', label: 'Coquillages, phare et bateaux sur l’eau', emoji: '🐚' },
          { id: 'mandala', label: 'Motif géométrique doux façon vitrail', emoji: '🏵️' },
        ],
      },
      {
        id: 'step2',
        question: 'Quelle épaisseur de traits préférez-vous ?',
        helperText: 'Pour un confort visuel adapté à vos envies.',
        allowVoiceDictation: false,
        options: [
          { id: 'epais', label: 'Traits bien épais et grands espaces faciles', emoji: '🖊️' },
          { id: 'moyen', label: 'Traits équilibrés, ni trop fins ni trop larges', emoji: '✏️' },
          { id: 'detaille', label: 'Dessin riche avec de jolis petits détails', emoji: '✒️' },
          { id: 'vitrail', label: 'Contours très marqués façon vitrail', emoji: '🪟' },
        ],
      },
      {
        id: 'step3',
        question: 'Pour qui préparez-vous ce coloriage ?',
        helperText: 'Cela nous aide à suggérer des idées de couleurs.',
        allowVoiceDictation: false,
        options: [
          { id: 'detente', label: 'Pour mon moment de détente au calme', emoji: '🍵' },
          { id: 'quatre-mains', label: 'Pour colorier avec mes petits-enfants', emoji: '👧' },
          { id: 'offrir', label: 'Pour l’encadrer ou l’offrir une fois coloré', emoji: '🎁' },
          { id: 'album', label: 'Pour mon cahier créatif personnel', emoji: '📒' },
        ],
      },
    ],
  },
  {
    id: 'jardin-reve',
    number: 8,
    categoryId: 'arts',
    title: 'Mon Jardin Rêvé',
    shortDescription: 'Imaginez votre coin de verdure idéal avec une planche visuelle et 3 conseils de jardinier.',
    emoji: '🌻',
    mode: 'visual',
    visualStyle: 'garden-plan',
    systemPrompt:
      "Tu es un maître jardinier français passionné et bienveillant. Décris avec amour le jardin ou balcon rêvé de l'utilisateur et donne-lui exactement 3 conseils simples, pratiques et écologiques pour l'entretenir sans effort.",
    steps: [
      {
        id: 'step1',
        question: 'Quel espace souhaitez-vous fleurir ?',
        helperText: 'Petit rebord ou grand jardin, tout peut fleurir !',
        allowVoiceDictation: false,
        options: [
          { id: 'balcon', label: 'Un balcon ou un rebord de fenêtre ensoleillé', emoji: '🪴' },
          { id: 'cour', label: 'Une petite cour ou terrasse en pots', emoji: '🏡' },
          { id: 'potager', label: 'Un coin potager gourmand et aromatique', emoji: '🍅' },
          { id: 'massif', label: 'Un grand jardin fleuri avec banc à l’ombre', emoji: '🌳' },
        ],
      },
      {
        id: 'step2',
        question: 'Quelles plantes vous donnent le sourire ?',
        helperText: 'Choisissez vos fleurs ou récoltes préférées.',
        allowVoiceDictation: true,
        options: [
          { id: 'roses', label: 'Roses anciennes, géraniums et hortensias', emoji: '🌹' },
          { id: 'aromates', label: 'Thym, romarin, menthe et basilic parfumé', emoji: '🌿' },
          { id: 'fruits', label: 'Fraisiers, tomates cerises et framboisiers', emoji: '🍓' },
          { id: 'mellifere', label: 'Lavande, marguerites et fleurs pour papillons', emoji: '🐝' },
        ],
      },
      {
        id: 'step3',
        question: 'À quelle saison voulez-vous l’admirer ?',
        helperText: 'Les couleurs changent avec les saisons.',
        allowVoiceDictation: false,
        options: [
          { id: 'printemps', label: 'Au réveil joyeux du printemps', emoji: '🌷' },
          { id: 'ete', label: 'Sous la lumière généreuse de l’été', emoji: '☀️' },
          { id: 'automne', label: 'Aux teintes dorées de l’automne', emoji: '🍁' },
          { id: 'quatre-saisons', label: 'Un jardin facile toute l’année sans fatigue', emoji: '🌲' },
        ],
      },
    ],
  },
  {
    id: 'affiches-invitations',
    number: 9,
    categoryId: 'arts',
    title: "L'Atelier Affiches & Invitations",
    shortDescription: 'Créez une affiche joyeuse et très lisible pour un goûter, un tournoi de belote ou une fête.',
    emoji: '🎪',
    mode: 'visual',
    visualStyle: 'event-poster',
    systemPrompt:
      "Tu es un créateur d'affiches festives et ultra-lisibles. Rédige le texte complet d'une affiche d'invitation conviviale avec un grand titre accrocheur, le programme gourmand ou joyeux, et un mot d'accueil chaleureux.",
    steps: [
      {
        id: 'step1',
        question: 'Quel événement organisez-vous ?',
        helperText: 'Choisissez la rencontre ou dictez son titre.',
        allowVoiceDictation: true,
        options: [
          { id: 'gouter', label: 'Un grand goûter crêpes ou pâtisseries', emoji: '🥞' },
          { id: 'belote', label: 'Après-midi jeux de cartes, belote ou loto', emoji: '🃏' },
          { id: 'repas', label: 'Un déjeuner convivial entre amis ou voisins', emoji: '🍲' },
          { id: 'anniversaire', label: 'Une fête d’anniversaire en chanson', emoji: '🎂' },
          { id: 'chorale', label: 'Un après-midi chansons, poésie ou lecture', emoji: '🎶' },
          { id: 'jardinage', label: 'Troc de plantes et café au jardin', emoji: '🌱' },
        ],
      },
      {
        id: 'step2',
        question: 'Quand aura lieu ce bon moment ?',
        helperText: 'Touchez un moment ou dictez la date exacte.',
        allowVoiceDictation: true,
        voicePromptPlaceholder: 'Ex: Ce dimanche à 15 heures dans la salle commune...',
        options: [
          { id: 'dimanche', label: 'Ce dimanche après-midi dès 15h00', emoji: '🕒' },
          { id: 'samedi', label: 'Samedi midi autour d’une belle table', emoji: '🕛' },
          { id: 'jeudi', label: 'Jeudi à l’heure du thé et du café (16h00)', emoji: '☕' },
          { id: 'bientot', label: 'Très bientôt — date à compléter à la main', emoji: '📅' },
        ],
      },
      {
        id: 'step3',
        question: 'Quelle ambiance souhaitez-vous sur l’affiche ?',
        helperText: 'Le style décoratif de votre invitation.',
        allowVoiceDictation: false,
        options: [
          { id: 'guinguette', label: 'Esprit guinguette, fanions et bonne humeur', emoji: '🏮' },
          { id: 'champetre', label: 'Style champêtre, fleurs et nappes à carreaux', emoji: '🌼' },
          { id: 'elegant', label: 'Présentation chic et encadrée', emoji: '✨' },
          { id: 'gourmand', label: 'Couleurs chaudes et gourmandes', emoji: '🍒' },
        ],
      },
    ],
  },
  {
    id: 'motifs-tricot',
    number: 10,
    categoryId: 'arts',
    title: 'Créateur de Motifs & Tricot',
    shortDescription: 'Composez une planche d’inspiration de couleurs et de motifs pour tricot, crochet ou couture.',
    emoji: '🧶',
    mode: 'visual',
    visualStyle: 'knitting-pattern',
    systemPrompt:
      "Tu es une créatrice textile experte en tricot, crochet et broderie traditionnelle. Propose une fiche d'inspiration claire avec l'harmonie des couleurs, le point conseillé, et 3 astuces simples pour réaliser un ouvrage tout doux.",
    steps: [
      {
        id: 'step1',
        question: 'Quelle harmonie de couleurs vous inspire ?',
        helperText: 'Les teintes de vos pelotes ou tissus.',
        allowVoiceDictation: false,
        options: [
          { id: 'pastel', label: 'Douceur pastel : bleu ciel, écru et rose poudré', emoji: '🌸' },
          { id: 'automne', label: 'Tons chauds : ocre, terracotta et vert mousse', emoji: '🍂' },
          { id: 'marin', label: 'Esprit marin : bleu marine, blanc pur et rouge', emoji: '⚓' },
          { id: 'joyeux', label: 'Arc-en-ciel joyeux et couleurs vives', emoji: '🌈' },
        ],
      },
      {
        id: 'step2',
        question: 'Quel style de motif aimez-vous ?',
        helperText: 'Le dessin de votre maille ou tissu.',
        allowVoiceDictation: false,
        options: [
          { id: 'torsades', label: 'Torsades classiques et point mousse', emoji: '🪢' },
          { id: 'floral', label: 'Petites fleurs et motifs jacquard rétro', emoji: '🌼' },
          { id: 'geometrique', label: 'Carrés au crochet (granny) et rayures', emoji: '💠' },
          { id: 'ajoure', label: 'Point ajouré léger comme une dentelle', emoji: '❄️' },
        ],
      },
      {
        id: 'step3',
        question: 'Quel ouvrage aimeriez-vous imaginer ?',
        helperText: 'Ce que vous souhaitez confectionner.',
        allowVoiceDictation: true,
        options: [
          { id: 'echarpe', label: 'Une grande écharpe ou un châle bien chaud', emoji: '🧣' },
          { id: 'couverture', label: 'Un plaid tout doux pour le fauteuil ou bébé', emoji: '🛋️' },
          { id: 'brassiere', label: 'Un petit gilet ou chaussons pour enfant', emoji: '🧦' },
          { id: 'coussin', label: 'Une housse de coussin décorative', emoji: '🪡' },
        ],
      },
    ],
  },

  // ============================================================================
  // CATÉGORIE 3 : MUSIQUE, POÉSIE & HUMOUR (11 à 15)
  // ============================================================================
  {
    id: 'chanson-guinguette',
    number: 11,
    categoryId: 'musique',
    title: 'Ma Chanson de Guinguette',
    shortDescription: 'Créez des couplets et un refrain en rimes faciles à chantonner sur un air d’accordéon.',
    emoji: '🪗',
    mode: 'standard',
    systemPrompt:
      "Tu es un parolier de chanson française traditionnelle (façon Charles Trenet, Bourvil ou Édith Piaf). Écris une chanson joyeuse ou tendre avec 2 couplets et un refrain entraînant très facile à chantonner en rimes.",
    steps: [
      {
        id: 'step1',
        question: 'Sur quel rythme voulez-vous chanter ?',
        helperText: 'L’air qui fera battre la mesure.',
        allowVoiceDictation: false,
        options: [
          { id: 'valse', label: 'Une valse musette à trois temps (1, 2, 3...)', emoji: '💃' },
          { id: 'balade', label: 'Une chanson douce façon cabaret parisien', emoji: '🎶' },
          { id: 'marche', label: 'Un air joyeux et entraînant à reprendre en chœur', emoji: '🎺' },
          { id: 'berceuse', label: 'Une mélodie tendre pour la fin de journée', emoji: '🌙' },
        ],
      },
      {
        id: 'step2',
        question: 'De quoi parle votre chanson ?',
        helperText: 'Choisissez un sujet ou dictez une idée.',
        allowVoiceDictation: true,
        options: [
          { id: 'bords-marne', label: 'Les dimanches au bord de l’eau et les guinguettes', emoji: '🚣' },
          { id: 'amitie', label: 'Les copains d’abord et la joie de se retrouver', emoji: '🍷' },
          { id: 'jeunesse', label: 'Les premiers bals et les amoureux sur les bancs', emoji: '💑' },
          { id: 'soleil', label: 'Le bonheur des petites choses de chaque matin', emoji: '☀️' },
        ],
      },
      {
        id: 'step3',
        question: 'Quel instrument accompagne votre refrain ?',
        helperText: 'Pour donner la couleur musicale aux paroles.',
        allowVoiceDictation: false,
        options: [
          { id: 'accordeon', label: 'Un accordéon bretelle plein d’entrain', emoji: '🪗' },
          { id: 'piano', label: 'Un piano droit aux notes cristallines', emoji: '🎹' },
          { id: 'guitare', label: 'Une guitare acoustique au coin du feu', emoji: '🎸' },
          { id: 'violon', label: 'Un violon léger et romantique', emoji: '🎻' },
        ],
      },
    ],
  },
  {
    id: 'atelier-poesie',
    number: 12,
    categoryId: 'musique',
    title: "L'Atelier Poésie",
    shortDescription: 'Choisissez 3 mots inspirants et une émotion pour composer un poème tout en douceur.',
    emoji: '🪶',
    mode: 'standard',
    systemPrompt:
      "Tu es un poète français délicat et accessible. Écris un poème harmonieux en rimes claires (3 ou 4 strophes) qui intègre naturellement les mots et l'émotion choisis par l'utilisateur.",
    steps: [
      {
        id: 'step1',
        question: 'Quel premier bouquet de mots vous inspire ?',
        helperText: 'Choisissez 3 mots ou dictez les vôtres.',
        allowVoiceDictation: true,
        options: [
          { id: 'lumiere', label: 'Lumière · Horizon · Hirondelle', emoji: '🕊️' },
          { id: 'jardin', label: 'Rosée · Pivoine · Silence', emoji: '🌹' },
          { id: 'temps', label: 'Horloge · Souvenir · Sourire', emoji: '🕰️' },
          { id: 'mer', label: 'Écume · Coquillage · Vent doux', emoji: '🌊' },
          { id: 'foyer', label: 'Flamme · Tasse chaude · Tendresse', emoji: '🕯️' },
          { id: 'etoiles', label: 'Clair de lune · Rêve · Velours', emoji: '✨' },
        ],
      },
      {
        id: 'step2',
        question: 'Quelle émotion souhaitez-vous faire passer ?',
        helperText: 'Le cœur de votre poème.',
        allowVoiceDictation: false,
        options: [
          { id: 'serenite', label: 'La paix intérieure et la sérénité', emoji: '🌿' },
          { id: 'gratitude', label: 'L’émerveillement devant la beauté de la vie', emoji: '☀️' },
          { id: 'amour', label: 'La tendresse pour ceux qui nous sont chers', emoji: '💝' },
          { id: 'reverie', label: 'Une douce rêverie au fil des saisons', emoji: '🍂' },
        ],
      },
      {
        id: 'step3',
        question: 'Quelle forme de poème préférez-vous ?',
        helperText: 'La musique des vers.',
        allowVoiceDictation: false,
        options: [
          { id: 'classique', label: 'De belles rimes classiques et chantantes', emoji: '📜' },
          { id: 'court', label: 'Un poème court, simple et lumineux', emoji: '🌸' },
          { id: 'fable', label: 'Une petite fable malicieuse avec morale', emoji: '🦊' },
          { id: 'lettre-poeme', label: 'Un poème tendre à offrir en cadeau', emoji: '🎁' },
        ],
      },
    ],
  },
  {
    id: 'boite-blagues',
    number: 13,
    categoryId: 'musique',
    title: 'La Boîte à Blagues & Devinettes',
    shortDescription: 'Découvrez 3 blagues bienveillantes ou devinettes amusantes à raconter au prochain repas.',
    emoji: '😄',
    mode: 'standard',
    systemPrompt:
      "Tu es un humoriste familial français plein d'esprit, de finesse et de bienveillance (humour bon enfant, jamais vulgaire). Rédige 3 blagues courtes ou devinettes savoureuses faciles à retenir et à raconter.",
    steps: [
      {
        id: 'step1',
        question: 'Sur quel thème avez-vous envie de rire ?',
        helperText: 'Vous pouvez aussi dicter le prénom d’un proche pour un clin d’œil !',
        allowVoiceDictation: true,
        voicePromptPlaceholder: 'Ex: Une blague gentille sur le jardinage ou pour Gérard...',
        options: [
          { id: 'jardin-cuisine', label: 'Les gourmands, la cuisine et le potager', emoji: '🥘' },
          { id: 'animaux', label: 'Nos amis les chats, les chiens et les oiseaux', emoji: '🐶' },
          { id: 'petits-enfants', label: 'Les mots d’enfants et les grands-parents', emoji: '🧒' },
          { id: 'quotidien', label: 'Les petites étourderies de la vie quotidienne', emoji: '👓' },
          { id: 'vacances', label: 'La pêche à la ligne, le camping et les voyages', emoji: '🎣' },
          { id: 'jeux-mots', label: 'Les bons jeux de mots à la française', emoji: '🎩' },
        ],
      },
      {
        id: 'step2',
        question: 'Que préférez-vous lire ?',
        helperText: 'Le format de votre moment d’humour.',
        allowVoiceDictation: false,
        options: [
          { id: 'blagues', label: '3 petites histoires drôles à raconter à table', emoji: '😂' },
          { id: 'devinettes', label: '3 devinettes malicieuses avec leurs réponses', emoji: '❓' },
          { id: 'charades', label: 'Des charades amusantes (Mon premier, mon tout...)', emoji: '🧩' },
          { id: 'proverbes', label: 'Des dictons détournés avec humour', emoji: '🎭' },
        ],
      },
      {
        id: 'step3',
        question: 'Pour quel public voulez-vous ces sourires ?',
        helperText: 'Pour adapter le ton.',
        allowVoiceDictation: false,
        options: [
          { id: 'tous', label: 'Pour toute la famille, de 7 à 97 ans', emoji: '👨‍👩‍👧‍👦' },
          { id: 'amis', label: 'Pour faire sourire mes amis au café', emoji: '☕' },
          { id: 'enfants', label: 'Spécialement pour faire rire les petits', emoji: '🎈' },
          { id: 'repas-fete', label: 'Pour animer un grand repas du dimanche', emoji: '🥂' },
        ],
      },
    ],
  },
  {
    id: 'quiz-maison',
    number: 14,
    categoryId: 'musique',
    title: 'Mes Quiz & Mots Croisés Maison',
    shortDescription: 'Jouez avec un quiz interactif de 5 questions sur vos passions avec de gros boutons.',
    emoji: '🏆',
    mode: 'quiz',
    systemPrompt:
      "Tu es un animateur de jeu culturel bienveillant pour les seniors français.",
    steps: [
      {
        id: 'step1',
        question: 'Quel sujet vous passionne le plus ?',
        helperText: 'Choisissez le thème de vos 5 questions.',
        allowVoiceDictation: true,
        options: [
          { id: 'cinema', label: 'Le grand cinéma français (Gabin, De Funès, Bourvil...)', emoji: '🎬' },
          { id: 'chanson', label: 'Les chansons françaises d’hier et d’aujourd’hui', emoji: '📻' },
          { id: 'cuisine', label: 'La gastronomie et les spécialités de nos régions', emoji: '🧀' },
          { id: 'geographie', label: 'Les beaux villages, fleuves et monuments de France', emoji: '🏰' },
          { id: 'nature', label: 'Les fleurs, les oiseaux et les proverbes d’antan', emoji: '🌻' },
          { id: 'histoire', label: 'Les grandes figures de l’Histoire de France', emoji: '👑' },
        ],
      },
      {
        id: 'step2',
        question: 'Quel niveau de jeu souhaitez-vous ?',
        helperText: 'L’important est de passer un bon moment !',
        allowVoiceDictation: false,
        options: [
          { id: 'doux', label: 'Détente et plaisir : questions faciles et connues', emoji: '😊' },
          { id: 'curieux', label: 'Curieux : pour se rafraîchir la mémoire', emoji: '🧠' },
          { id: 'expert', label: 'Connaisseur : avec de belles anecdotes à découvrir', emoji: '🎓' },
          { id: 'surprise', label: 'Panaché : un mélange de questions faciles et surprises', emoji: '🎲' },
        ],
      },
      {
        id: 'step3',
        question: 'Comment jouez-vous aujourd’hui ?',
        helperText: 'Seul au calme ou à plusieurs.',
        allowVoiceDictation: false,
        options: [
          { id: 'seul', label: 'Tranquillement pour mon plaisir personnel', emoji: '☕' },
          { id: 'amis', label: 'À voix haute avec des amis ou des voisins', emoji: '🎉' },
          { id: 'famille', label: 'En défi amical avec mes enfants ou petits-enfants', emoji: '🏆' },
          { id: 'detente-soir', label: 'Pour ma petite gymnastique de l’esprit du jour', emoji: '🌟' },
        ],
      },
    ],
  },
  {
    id: 'belles-pensees',
    number: 15,
    categoryId: 'musique',
    title: 'Le Club des Belles Pensées',
    shortDescription: 'Créez une citation lumineuse et apaisante mise en page sur une jolie carte illustrée.',
    emoji: '🌞',
    mode: 'visual',
    visualStyle: 'thought-card',
    systemPrompt:
      "Tu es un philosophe bienveillant du quotidien. Crée une belle pensée originale, lumineuse et réconfortante en français, accompagnée d'une courte méditation pleine de douceur pour éclairer la journée.",
    steps: [
      {
        id: 'step1',
        question: 'Quelle est votre humeur en cet instant ?',
        helperText: 'Choisissez ce qui résonne en vous aujourd’hui.',
        allowVoiceDictation: false,
        options: [
          { id: 'paisible', label: 'Paisible et reconnaissant(e)', emoji: '🌿' },
          { id: 'besoin-soleil', label: 'Envie d’un rayon de soleil et d’encouragement', emoji: '☀️' },
          { id: 'nostalgique', label: 'Rêveur(se) et tourné(e) vers les beaux souvenirs', emoji: '🕰️' },
          { id: 'joyeux', label: 'D’humeur joyeuse avec l’envie de partager', emoji: '🌺' },
        ],
      },
      {
        id: 'step2',
        question: 'Quelle source d’inspiration préférez-vous ?',
        helperText: 'L’esprit de votre belle pensée.',
        allowVoiceDictation: false,
        options: [
          { id: 'nature', label: 'La sagesse de la nature et des saisons', emoji: '🌳' },
          { id: 'amitie', label: 'La chaleur de l’amitié et des sourires', emoji: '🤝' },
          { id: 'bonheur-simple', label: 'L’art de savourer les petits bonheurs', emoji: '☕' },
          { id: 'esperance', label: 'La confiance et l’espérance en demain', emoji: '🕊️' },
        ],
      },
      {
        id: 'step3',
        question: 'Quel décor souhaitez-vous autour de votre citation ?',
        helperText: 'Le style de votre carte illustrée.',
        allowVoiceDictation: false,
        options: [
          { id: 'aquarelle-or', label: 'Lumière dorée et feuillages délicats', emoji: '✨' },
          { id: 'ciel-bleu', label: 'Horizon bleu apaisant et oiseaux libres', emoji: '🌤️' },
          { id: 'fleuri', label: 'Couronne de fleurs champêtres', emoji: '🌼' },
          { id: 'parchemin', label: 'Beau papier parchemin et écriture de plume', emoji: '📜' },
        ],
      },
    ],
  },

  // ============================================================================
  // CATÉGORIE 4 : CUISINE, VOYAGES & CURIOSITÉ (16 à 20)
  // ============================================================================
  {
    id: 'carnet-recettes',
    number: 16,
    categoryId: 'cuisine',
    title: 'Mon Carnet de Recettes Illustré',
    shortDescription: 'Mettez au propre vos meilleures recettes ou créez un bon plat avec ce que vous avez.',
    emoji: '🥧',
    mode: 'visual',
    visualStyle: 'recipe-card',
    systemPrompt:
      "Tu es un chef cuisinier de tradition française, amoureux des recettes de grand-mère simples et savoureuses. Rédige une fiche recette très claire (Ingrédients bien listés, Étapes numérotées faciles, et le Petit Secret du Chef).",
    steps: [
      {
        id: 'step1',
        question: 'Quel type de recette souhaitez-vous préparer ?',
        helperText: 'Choisissez une envie gourmande.',
        allowVoiceDictation: true,
        options: [
          { id: 'dessert', label: 'Un gâteau moelleux, une tarte ou une crème d’antan', emoji: '🍰' },
          { id: 'mijote', label: 'Un bon plat mijoté familial et réconfortant', emoji: '🥘' },
          { id: 'soupe', label: 'Un velouté de saison ou un dîner léger du soir', emoji: '🥣' },
          { id: 'confiture', label: 'Confitures, crêpes ou douceurs du goûter', emoji: '🍯' },
        ],
      },
      {
        id: 'step2',
        question: 'Quels ingrédients voulez-vous mettre à l’honneur ?',
        helperText: 'Touchez un choix ou dictez vos ingrédients au micro !',
        allowVoiceDictation: true,
        voicePromptPlaceholder: 'Dites vos ingrédients ou votre secret de famille...',
        options: [
          { id: 'pommes', label: 'Pommes, poires, cannelle et vanille', emoji: '🍎' },
          { id: 'legumes', label: 'Légumes du jardin, herbes fines et beurre doux', emoji: '🥕' },
          { id: 'chocolat', label: 'Bon chocolat noir, œufs frais et noisettes', emoji: '🍫' },
          { id: 'terroir', label: 'Fromage fondant, pommes de terre et oignons doux', emoji: '🧀' },
        ],
      },
      {
        id: 'step3',
        question: 'Quelle est la particularité de cette fiche ?',
        helperText: 'Pour personnaliser votre carnet.',
        allowVoiceDictation: false,
        options: [
          { id: 'facile', label: 'Recette rapide, inratable et peu de vaisselle', emoji: '👌' },
          { id: 'tradition', label: 'La vraie recette traditionnelle à transmettre', emoji: '📖' },
          { id: 'leger', label: 'Gourmand mais léger et équilibré', emoji: '🌿' },
          { id: 'fete', label: 'Version festive pour recevoir la famille', emoji: '🍽️' },
        ],
      },
    ],
  },
  {
    id: 'voyage-fauteuil',
    number: 17,
    categoryId: 'cuisine',
    title: 'Voyage en Fauteuil',
    shortDescription: 'Partez en promenade immersive dans une belle région ou une époque, étape par étape.',
    emoji: '🚂',
    mode: 'interactive',
    systemPrompt:
      "Tu es un guide de voyage littéraire et sensoriel. Fais voyager l'utilisateur depuis son fauteuil avec des descriptions vivantes (couleurs, parfums, sons, rencontres) et 2 choix simples à chaque étape.",
    steps: [
      {
        id: 'step1',
        question: 'Quelle destination vous fait rêver aujourd’hui ?',
        helperText: 'Installez-vous confortablement, le départ est immédiat.',
        allowVoiceDictation: true,
        options: [
          { id: 'italie', label: 'Les lacs italiens et les ruelles de Toscane', emoji: '🍋' },
          { id: 'bretagne', label: 'La côte de Granit Rose et les îles bretonnes', emoji: '🌊' },
          { id: 'train-orient', label: 'Un grand voyage à bord d’un train panoramique', emoji: '🚂' },
          { id: 'provence-marche', label: 'Un marché provençal au pied du Luberon', emoji: '🫒' },
          { id: 'japon', label: 'Les jardins de cerisiers en fleurs à Kyoto', emoji: '🌸' },
          { id: 'vienne', label: 'Les grands cafés et palais de Vienne en musique', emoji: '🎻' },
        ],
      },
      {
        id: 'step2',
        question: 'À quelle époque souhaitez-vous voyager ?',
        helperText: 'Notre voyage en fauteuil traverse aussi le temps !',
        allowVoiceDictation: false,
        options: [
          { id: 'aujourdhui', label: 'Aujourd’hui, sous un beau soleil printanier', emoji: '☀️' },
          { id: 'annees-60', label: 'Dans la douceur de vivre des années 1960', emoji: '🛵' },
          { id: 'belle-epoque', label: 'En 1900, à l’heure de la Belle Époque', emoji: '🎩' },
          { id: 'renaissance', label: 'Au temps des grands châteaux et jardins royaux', emoji: '🏰' },
        ],
      },
      {
        id: 'step3',
        question: 'Par quoi aimez-vous commencer une visite ?',
        helperText: 'Votre première étape sur place.',
        allowVoiceDictation: false,
        options: [
          { id: 'terrasse', label: 'S’installer en terrasse pour observer la vie locale', emoji: '☕' },
          { id: 'jardin-port', label: 'Flâner tranquillement le long de l’eau ou des jardins', emoji: '🌿' },
          { id: 'specialite', label: 'Goûter une spécialité gourmande au marché', emoji: '🥐' },
          { id: 'musique-place', label: 'Écouter les musiciens sur la grande place', emoji: '🎶' },
        ],
      },
    ],
  },
  {
    id: 'inventeur-dimanche',
    number: 18,
    categoryId: 'cuisine',
    title: "L'Inventeur du Dimanche",
    shortDescription: 'Combinez deux objets du quotidien pour inventer une machine malicieuse façon Concours Lépine !',
    emoji: '💡',
    mode: 'standard',
    systemPrompt:
      "Tu es le jury enthousiaste du Concours Lépine. À partir des deux objets choisis, invente un appareil astucieux, charmant et drôle, avec son nom d'invention officiel, sa description et son mode d'emploi plein d'humour.",
    steps: [
      {
        id: 'step1',
        question: 'Choisissez un premier objet du quotidien :',
        helperText: 'La base de votre future grande invention !',
        allowVoiceDictation: false,
        options: [
          { id: 'parapluie', label: 'Un grand parapluie de promenade', emoji: '☂️' },
          { id: 'lunettes', label: 'Une paire de lunettes de lecture', emoji: '👓' },
          { id: 'theiere', label: 'Une théière sifflante en porcelaine', emoji: '🫖' },
          { id: 'arrosoir', label: 'Un arrosoir de jardinier', emoji: '🚿' },
        ],
      },
      {
        id: 'step2',
        question: 'Avec quel second objet allons-nous le combiner ?',
        helperText: 'C’est là que la magie opère !',
        allowVoiceDictation: false,
        options: [
          { id: 'radio', label: 'Un petit poste de radio musical', emoji: '📻' },
          { id: 'boussole', label: 'Un chercheur de clés et de télécommande', emoji: '🔑' },
          { id: 'chauffant', label: 'Un chauffe-mains tout doux pour l’hiver', emoji: '🧤' },
          { id: 'reveil', label: 'Une horloge parlante de bonne humeur', emoji: '⏰' },
        ],
      },
      {
        id: 'step3',
        question: 'Quelle est la mission principale de votre invention ?',
        helperText: 'Le service qu’elle rendra tous les jours.',
        allowVoiceDictation: false,
        options: [
          { id: 'pratique', label: 'Rendre la vie à la maison cent fois plus simple', emoji: '✨' },
          { id: 'drole', label: 'Faire rire toute la famille au repas du dimanche', emoji: '😄' },
          { id: 'confort', label: 'Offrir un confort royal sans bouger du fauteuil', emoji: '👑' },
          { id: 'jardin', label: 'Épater tous les voisins au jardin', emoji: '🌻' },
        ],
      },
    ],
  },
  {
    id: 'cafe-histoire',
    number: 19,
    categoryId: 'cuisine',
    title: "Café avec l'Histoire",
    shortDescription: 'Prenez une tasse de café avec un personnage célèbre et posez-lui des questions en un clic.',
    emoji: '☕',
    mode: 'interactive',
    systemPrompt:
      "Tu incarnes avec chaleur, courtoisie et vérité historique la grande figure choisie par l'utilisateur lors d'une conversation autour d'un café.",
    steps: [
      {
        id: 'step1',
        question: 'Avec quelle personnalité aimeriez-vous prendre le café ?',
        helperText: 'Un invité prestigieux s’assoit à votre table.',
        allowVoiceDictation: false,
        options: [
          { id: 'Victor Hugo', label: 'Victor Hugo — Le grand poète et romancier', emoji: '🖋️' },
          { id: 'Marie Curie', label: 'Marie Curie — La savante aux deux prix Nobel', emoji: '🔬' },
          { id: 'Édith Piaf', label: 'Édith Piaf — La Môme à la voix inoubliable', emoji: '🎤' },
          { id: 'Claude Monet', label: 'Claude Monet — Le peintre des jardins de Giverny', emoji: '🎨' },
          { id: 'Colette', label: 'Colette — L’écrivaine amoureuse de la nature et des chats', emoji: '🐱' },
          { id: 'Jean de La Fontaine', label: 'Jean de La Fontaine — Le conteur des Fables', emoji: '🦊' },
        ],
      },
      {
        id: 'step2',
        question: 'Où souhaitez-vous vous installer pour discuter ?',
        helperText: 'Le décor de votre rencontre.',
        allowVoiceDictation: false,
        options: [
          { id: 'Un grand café parisien', label: 'Dans un café historique aux banquettes de velours', emoji: '🥐' },
          { id: 'Un jardin fleuri au soleil', label: 'Sur un banc à l’ombre d’un jardin fleuri', emoji: '🌳' },
          { id: 'Au coin de la cheminée', label: 'Dans un salon calme au coin du feu', emoji: '🔥' },
          { id: 'Une bibliothèque ancienne', label: 'Dans une belle bibliothèque entourée de livres', emoji: '📚' },
        ],
      },
      {
        id: 'step3',
        question: 'Quelle première question souhaitez-vous lui poser ?',
        helperText: 'Vous pourrez continuer la conversation juste après !',
        allowVoiceDictation: true,
        voicePromptPlaceholder: 'Ou posez votre propre question à voix haute...',
        options: [
          { id: 'Quel est votre plus beau souvenir de jeunesse ?', label: '« Quel est votre plus beau souvenir de jeunesse ? »', emoji: '🌟' },
          { id: 'Où trouviez-vous votre inspiration chaque matin ?', label: '« Où trouviez-vous votre inspiration chaque matin ? »', emoji: '💡' },
          { id: 'Quel conseil donneriez-vous pour être heureux ?', label: '« Quel conseil donneriez-vous pour être heureux ? »', emoji: '💛' },
          { id: 'Quelle a été la plus belle rencontre de votre vie ?', label: '« Quelle a été la plus belle rencontre de votre vie ? »', emoji: '🤝' },
        ],
      },
    ],
  },
  {
    id: 'histoire-heros',
    number: 20,
    categoryId: 'cuisine',
    title: "L'Histoire dont vous êtes le Héros",
    shortDescription: 'Vivez une aventure douce par petits chapitres où vous choisissez la suite en cliquant.',
    emoji: '🧭',
    mode: 'interactive',
    systemPrompt:
      "Tu es un auteur de romans d'aventure bienveillants à la française. Écris des chapitres courts où le lecteur est le héros et propose toujours 2 choix clairs pour la suite.",
    steps: [
      {
        id: 'step1',
        question: 'Quelle aventure avez-vous envie de vivre ?',
        helperText: 'Vous serez le personnage principal de l’histoire.',
        allowVoiceDictation: false,
        options: [
          { id: 'Le mystère de la lettre ancienne au village', label: 'Le mystère d’une lettre ancienne trouvée au village', emoji: '✉️' },
          { id: 'La recette secrète du pâtissier royal', label: 'À la recherche de la recette secrète du pâtissier', emoji: '🥧' },
          { id: 'Balade enchantée dans les alpages fleuris', label: 'Une balade pleine de surprises dans les montagnes', emoji: '🏔️' },
          { id: 'Le trésor caché du vieux château familial', label: 'Une chasse au trésor douce dans un château', emoji: '🗝️' },
        ],
      },
      {
        id: 'step2',
        question: 'Qui vous accompagne dans cette aventure ?',
        helperText: 'Un fidèle compagnon de route.',
        allowVoiceDictation: false,
        options: [
          { id: 'Un chien malicieux au flair infaillible', label: 'Un petit chien malicieux au flair infaillible', emoji: '🐕' },
          { id: 'Mon petit-fils curieux et débrouillard', label: 'Un petit-enfant curieux et débrouillard', emoji: '🧒' },
          { id: 'Le libraire érudit du village', label: 'Le vieux libraire érudit du village', emoji: '📚' },
          { id: 'Une voisine pleine d’humour et d’astuce', label: 'Une amie d’enfance pleine d’humour et d’astuce', emoji: '👒' },
        ],
      },
      {
        id: 'step3',
        question: 'Quel objet glissez-vous dans votre poche au départ ?',
        helperText: 'Il vous servira dès le premier chapitre !',
        allowVoiceDictation: false,
        options: [
          { id: 'Une loupe ancienne à manche de bois', label: 'Une belle loupe ancienne', emoji: '🔍' },
          { id: 'Un carnet de croquis et un crayon', label: 'Un petit carnet de notes et un crayon', emoji: '📓' },
          { id: 'Une clé dorée mystérieuse', label: 'Une petite clé dorée mystérieuse', emoji: '🔑' },
          { id: 'Une boussole en laiton', label: 'Une boussole ancienne en laiton', emoji: '🧭' },
        ],
      },
    ],
  },
];
