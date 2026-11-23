import {
  CATEGORIES,
  WORKSHOPS,
  CategoryId,
  WorkshopDefinition,
  SavedCreation,
  QuizQuestion,
  InteractiveChapter,
} from '../data/workshops';

export const FONT_SCALE_VALUES = [16, 18, 20, 22] as const;

export function getNextFontScale(currentIndex: number, direction: 'up' | 'down'): number {
  if (direction === 'up') {
    return Math.min(FONT_SCALE_VALUES.length - 1, currentIndex + 1);
  }
  return Math.max(0, currentIndex - 1);
}

export function getWorkshopsByCategory(categoryId: CategoryId): WorkshopDefinition[] {
  return WORKSHOPS.filter((w) => w.categoryId === categoryId);
}

export function getWorkshopById(workshopId: string): WorkshopDefinition | undefined {
  return WORKSHOPS.find((w) => w.id === workshopId);
}

export function getCategoryById(categoryId: CategoryId) {
  return CATEGORIES.find((c) => c.id === categoryId);
}

export function buildWorkshopUserPrompt(
  workshop: WorkshopDefinition,
  selections: { step1: string; step2: string; step3: string }
): string {
  const s1 = workshop.steps[0];
  const s2 = workshop.steps[1];
  const s3 = workshop.steps[2];

  return `Atelier : "${workshop.title}" (${workshop.shortDescription})
1. ${s1.question} -> Réponse choisie : "${selections.step1}"
2. ${s2.question} -> Réponse choisie : "${selections.step2}"
3. ${s3.question} -> Réponse choisie : "${selections.step3}"

Rédige une création complète, chaleureuse, bien structurée et directement prête à être lue ou imprimée par une personne âgée.`;
}

/**
 * Rich, instant French fallback generator for every single one of the 20 workshops
 * so the app always produces warm, tailor-made results even offline or without API key.
 */
export function generateLocalCreationFallback(
  workshop: WorkshopDefinition,
  selections: { step1: string; step2: string; step3: string },
  adjustment?: string
): Omit<SavedCreation, 'id' | 'createdAt'> {
  const isJoyful = adjustment?.toLowerCase().includes('joyeux');
  const isAlternative = adjustment?.toLowerCase().includes('autre');
  const suffixTitle = isJoyful ? ' (Édition Ensoleillée)' : isAlternative ? ' (Nouvelle Inspiration)' : '';

  const s1 = selections.step1 || workshop.steps[0].options[0].label;
  const s2 = selections.step2 || workshop.steps[1].options[0].label;
  const s3 = selections.step3 || workshop.steps[2].options[0].label;

  let title = `${workshop.title}${suffixTitle}`;
  let subtitle = `${s1} · ${s2}`;
  let content = '';
  let tips: string[] = [];

  switch (workshop.id) {
    case 'contes-petits-enfants':
      title = `La Merveilleuse Histoire : ${s1}${suffixTitle}`;
      subtitle = `Un conte tendre imaginé pour mes petits-enfants`;
      content = `Il était une fois, ${s2.toLowerCase()}, ${s1.toLowerCase()} qui avait le cœur rempli de curiosité et les yeux pétillants comme deux noisettes dorées.\n\nChaque matin, dès que les premiers rayons du soleil caressaient les feuilles, notre petit héros partait à la rencontre des merveilles du monde. Ce jour-là, un doux parfum de noisette et de fleurs sauvages flottait dans l'air. Au détour d'un sentier bordé de mousse tendre, il découvrit un secret que seuls les cœurs patients savent voir.\n\n« Regarde autour de toi avec douceur », lui murmura le vent léger. En aidant ses compagnons de route et en prenant le temps d'écouter le chant de la nature, tout s'éclaira d'une joie nouvelle.${isJoyful ? ' Tout le village se mit alors à danser et à chanter sous une pluie de pétales dorés !' : ''}\n\nMorale de l'histoire : ${s3}.`;
      tips = [
        'À lire d’une voix douce avant de dormir',
        'Demandez à vos petits-enfants de dessiner le héros',
        'Un conte unique à conserver dans votre album',
      ];
      break;

    case 'livre-souvenirs':
      title = `Chapitre de Vie : ${s1}${suffixTitle}`;
      subtitle = `Une page précieuse de mon livre de souvenirs`;
      content = `Quand je ferme les yeux un instant, je revois avec une clarté émouvante ce temps précieux : ${s1.toLowerCase()}.\n\nCe qui me revient d'abord au cœur, c'est cette atmosphère unique — ${s2.toLowerCase()}. On prenait alors le temps de savourer chaque instant. Les voix familières résonnaient dans la pièce, les gestes étaient simples, vrais et pleins de cette chaleur humaine que l'on n'oublie jamais.\n\nAvec le recul des années, je mesure combien ces heures ont façonné qui je suis. C'est avec un ton ${s3.toLowerCase()} que je dépose aujourd'hui ces mots sur le papier, comme on confie un petit trésor à ceux qui viendront après nous.`;
      tips = [
        'Notez au dos de la feuille l’année exacte si elle vous revient',
        'Partagez cette page lors du prochain repas de famille',
      ];
      break;

    case 'gazette-famille':
      title = `LE PETIT ÉCHO DE LA FAMILLE${suffixTitle}`;
      subtitle = `Édition Spéciale · ${s3}`;
      content = `À LA UNE AUJOURD'HUI : ${s1.toUpperCase()}\nC'est l'événement qui met tous les cœurs en fête cette semaine ! Petits et grands se réjouissent de cette belle nouvelle qui apporte un grand souffle de bonne humeur dans toute la maison. Les sourires étaient sur toutes les lèvres et l'on en parlera encore longtemps.\n\nLA RUBRIQUE DU QUOTIDIEN : ${s2}\nNos envoyés spéciaux au salon et à la cuisine confirment que l'ambiance est au beau fixe. Entre confidences, gourmandise et éclats de rire, le baromètre familial affiche un grand soleil permanent !\n\nLE MOT DE LA RÉDACTION\n« Qu'il est doux de voir notre famille écrire chaque jour de si belles petites histoires ! »`;
      tips = [
        'Imprimez cette Gazette pour la poser sur la table du salon',
        'Ajoutez une petite photo de famille à côté',
      ];
      break;

    case 'cartes-voeux':
      title = `Pour vous : ${s1}${suffixTitle}`;
      subtitle = `Une pensée affectueuse — ${s2}`;
      content = `Chers vous,\n\nEn cette belle occasion (${s1.toLowerCase()}), je tenais à vous envoyer ce bouquet de pensées les plus chaleureuses.\n\nQue cette journée vous apporte autant de joie, de douceur et de lumière que vous en semez autour de vous tout au long de l'année. Chaque moment partagé ensemble est un cadeau précieux que je garde tout près du cœur.\n\nJe vous embrasse bien affectueusement et vous souhaite mille bonheurs doux !`;
      tips = ['Décor de la carte : ' + s3, 'Prête à imprimer ou à copier dans un message'];
      break;

    case 'lettres-coeur':
      title = `Lettre du Cœur${suffixTitle}`;
      subtitle = `Destinataire : ${s1}`;
      content = `Bonjour de tout cœur,\n\nJe prends un moment au calme aujourd'hui pour t'écrire ces quelques lignes, avec l'envie toute simple de ${s2.toLowerCase()}.\n\nIci, les journées s'écoulent paisiblement et mes pensées s'envolent très souvent vers toi. Les beaux moments que nous avons partagés me donnent toujours le sourire, et j'espère de tout cœur que tout va pour le mieux de ton côté.\n\nAu plaisir immense de nous revoir très bientôt autour d'une bonne tasse de café ou d'un bon repas.\n\n${s3}.`;
      break;

    case 'atelier-peinture':
      title = `Toile d'Artiste : ${s2}${suffixTitle}`;
      subtitle = `Technique : ${s1} · Lumière : ${s3}`;
      content = `Voici votre œuvre imaginée à L'Atelier de Peinture :\n\nAu centre de la toile, ${s2.toLowerCase()} se dévoile avec une délicatesse remarquable. Grâce à la technique choisie (${s1.toLowerCase()}), les touches de couleur semblent vibrer doucement sur le grain du papier et de la toile.\n\nTout le charme du tableau repose sur son éclairage : ${s3.toLowerCase()} enveloppe la scène d'un voile poétique, faisant danser les reflets dorés et les ombres tendres. C'est une œuvre apaisante qui invite à la contemplation.`;
      tips = [
        'Couleurs dominantes : Bleu céleste, ocre doré et vert tendre',
        'Style : École impressionniste française',
        'Conseil : Admirez ou imprimez cette carte artistique',
      ];
      break;

    case 'coloriages-mesure':
      title = `Planche de Coloriage : ${s1}${suffixTitle}`;
      subtitle = `${s2} · ${s3}`;
      content = `Votre dessin en noir et blanc aux contours bien nets est prêt ci-dessus !\n\nCe motif (« ${s1} ») a été tracé avec ${s2.toLowerCase()} pour vous offrir un moment de création reposant et agréable, sans fatiguer les yeux.\n\nPrenez vos plus beaux crayons de couleur ou vos feutres, respirez calmement et laissez parler votre imagination.`;
      tips = [
        'Astuce couleur 1 : Commencez par les teintes claires au centre',
        'Astuce couleur 2 : Mélangez deux nuances de vert ou de bleu pour donner du relief',
        'Cliquez sur « Imprimer / PDF » pour colorier sur papier',
      ];
      break;

    case 'jardin-reve':
      title = `Mon Jardin Rêvé : ${s1}${suffixTitle}`;
      subtitle = `Plantations : ${s2} · Saison : ${s3}`;
      content = `Imaginez cet espace plein de vie : ${s1.toLowerCase()}, baigné par la douce atmosphère ${s3.toLowerCase()}.\n\nLes plantations choisies (${s2.toLowerCase()}) s'harmonisent à merveille. Leurs feuillages offrent un spectacle reposant pour les yeux tandis que leurs parfums subtils attirent les oiseaux et les papillons dès les beaux jours.\n\nC'est un véritable petit coin de paradis, pensé pour être admiré depuis un fauteuil confortable sans demander d'efforts fatigants.`;
      tips = [
        'Conseil du jardinier 1 : Arrosez de préférence le matin ou à la fraîcheur du soir au pied des plantes.',
        'Conseil du jardinier 2 : Placez un lit de billes d’argile ou de paillage pour garder la fraîcheur sans désherber.',
        'Conseil du jardinier 3 : Coupez simplement les fleurs fanées au fur et à mesure pour prolonger la floraison.',
      ];
      break;

    case 'affiches-invitations':
      title = `GRANDE INVITATION : ${s1.toUpperCase()}${suffixTitle}`;
      subtitle = `Rendez-vous : ${s2}`;
      content = `VOUS ÊTES CHALEUREUSEMENT INVITÉS !\n\nÀ l'occasion de : ${s1}\nQuand : ${s2}\nAmbiance : ${s3}\n\nVenez partager un moment de pure convivialité, de sourires et de bonne humeur ! Tout est prévu pour passer une excellente heure ensemble : de belles discussions, des rires partagés et le plaisir simple d'être réunis.\n\nVotre présence sera notre plus beau cadeau. À très vite !`;
      tips = [
        'Mise en page grands caractères prête à afficher',
        'Vous pouvez l’imprimer ou la copier pour vos invités',
      ];
      break;

    case 'motifs-tricot':
      title = `Inspiration Tricot & Ouvrage : ${s3}${suffixTitle}`;
      subtitle = `${s1} · ${s2}`;
      content = `Voici votre fiche d'ouvrage textile imaginée sur mesure :\n\nProjet : ${s3}\nPalette de fils : ${s1}\nMotif & Point : ${s2}\n\nCet ouvrage marie la douceur des teintes choisies avec le relief régulier et apaisant du motif. Maille après maille, le dessin se forme naturellement sous les doigts pour créer une pièce unique, chaude et pleine de tendresse à offrir ou à garder sur les épaules.`;
      tips = [
        'Aiguilles conseillées : N° 4,5 ou 5 pour une maille souple et agréable à tricoter',
        'Fils recommandés : Laine mérinos douce ou coton peigné lavable',
        'Astuce : Tricotez une bordure de 4 rangs au point mousse pour que l’ouvrage ne roule pas',
      ];
      break;

    case 'chanson-guinguette':
      title = `Chanson : L'Air des Beaux Jours${suffixTitle}`;
      subtitle = `${s1} · Accompagnement : ${s3}`;
      content = `(Couplet 1)\nQuand résonne au loin ${s3.toLowerCase()},\nLe cœur s'éveille dès le matin,\nOn se souvient de la chanson,\nQui faisait danser toute la maison !\nAutour du thème « ${s2.toLowerCase()} »,\nTout le monde reprend avec bonheur.\n\n(Refrain — À chanter tous ensemble !)\nTournez, tournez les beaux souvenirs,\nSur ${s1.toLowerCase()} qui fait plaisir !\nTant qu'on a des amis et un brin de soleil,\nChaque journée est une merveille !\n\n(Couplet 2)\nLes verres tintent, les rires s'envolent,\nPlus besoin de grandes paroles,\nUne mélodie suffit parfois,\nPour remplir tout le salon de joie !`;
      tips = [
        'Fredonnez le refrain en battant doucement la mesure',
        'Cliquez sur « Écouter » pour entendre la lecture à voix haute',
      ];
      break;

    case 'atelier-poesie':
      title = `Poème : ${s1}${suffixTitle}`;
      subtitle = `Inspiré par : ${s2}`;
      content = `Dans la douce clarté d'une heure printanière,\nS'éveillent trois joyaux : ${s1.toLowerCase()},\nComme un souffle léger qui traverse les airs,\nEt dépose au jardin sa plus tendre merveille.\n\nLe temps glisse sans bruit sur le rebord du jour,\nOffrant à notre cœur ${s2.toLowerCase()},\nChaque instant devient pur, chaque regard est amour,\nDans la paix retrouvée d'une heure de sagesse.\n\nGardons au creux de l'âme ce rayon précieux,\nQui fait fleurir l'espoir sous la voûte des cieux.`;
      break;

    case 'boite-blagues':
      title = `La Boîte à Sourires : ${s1}${suffixTitle}`;
      subtitle = `${s2} · ${s3}`;
      content = `1. La première pour mettre en joie :\nDans la cuisine, Grand-Père regarde attentivement le thermomètre fixé au mur et dit à Grand-Mère :\n— Dis donc, c'est extraordinaire comme ce petit appareil est puissant... Dès qu'il monte au-dessus de 25 degrés, il fait chaud dans toute la maison !\n\n2. La devinette malicieuse :\n« Je traverse les vitres sans jamais les casser, je réchauffe le jardin sans jamais brûler le bois, et je donne le sourire dès le matin. Qui suis-je ? »\n-> Réponse : Le rayon de soleil !\n\n3. Le mot de la fin autour de « ${s1} » :\nUn petit-fils demande à sa grand-mère :\n— Mamie, comment fais-tu pour ne jamais oublier tes recettes et tes histoires ?\n— C'est très simple mon trésor : je les range dans mon cœur, c'est le seul tiroir dont on ne perd jamais la clé !`;
      tips = [
        'Racontez la devinette en laissant vos proches chercher la réponse !',
      ];
      break;

    case 'belles-pensees':
      title = `La Belle Pensée du Jour${suffixTitle}`;
      subtitle = `${s1} · ${s2}`;
      content = `« Le bonheur n'est pas un grand feu d'artifice lointain : c'est la douce chaleur d'une tasse partagée, le chant d'un oiseau sur la branche et la tendresse d'un souvenir qui sourit. »\n\nMéditation du jour :\nEn choisissant aujourd'hui de regarder la vie avec un esprit ${s1.toLowerCase()}, vous ouvrez grand la fenêtre à la sérénité. Comme nous le rappelle ${s2.toLowerCase()}, chaque journée possède sa propre lumière : il suffit de l'accueillir avec douceur.`;
      tips = ['Décor de la carte : ' + s3];
      break;

    case 'carnet-recettes':
      title = `Fiche Recette : ${s1}${suffixTitle}`;
      subtitle = `À l'honneur : ${s2} · ${s3}`;
      content = `INGRÉDIENTS POUR 4 PERSONNES :\n• Les ingrédients vedettes : ${s2}\n• 2 belles cuillères de beurre doux ou d'huile d'olive vierge\n• Une pincée de fleur de sel ou de sucre vanillé selon la recette\n• Beaucoup d'amour et un tour de main traditionnel\n\nPRÉPARATION PAS À PAS :\n1. Préparez tranquillement vos ingrédients sur la table de cuisine en les coupant en morceaux réguliers.\n2. Faites revenir ou mélangez délicatement à feu doux pour que tous les arômes se libèrent sans jamais brusquer la cuisson.\n3. Laissez dorer ou mijoter jusqu'à ce qu'un parfum irrésistible embaume toute la cuisine. Servez bien chaud dans votre plus beau plat !`;
      tips = [
        'Le Secret du Chef : Préparez ce plat un peu à l’avance, il n’en sera que plus savoureux réchauffé doucement.',
        'Conservation : Se garde très bien 2 jours au frais.',
      ];
      break;

    case 'inventeur-dimanche':
      title = `Médaille d'Or du Concours Lépine !${suffixTitle}`;
      subtitle = `Mariage ingénieux : ${s1} + ${s2}`;
      content = `BREVET D'INVENTION OFFICIEL ALPHABETTE\n\nComment personne n'y avait-il pensé plus tôt ? En associant « ${s1.toLowerCase()} » avec « ${s2.toLowerCase()} », vous venez d'inventer l'appareil le plus malicieux de l'année !\n\nFONCTIONNEMENT :\nD'une simple pression sur son bouton doré ergonomique, l'appareil combine l'utilité du premier objet avec l'astuce du second. Sa mission est remplie à 100 % : ${s3.toLowerCase()}.\n\nMODE D'EMPLOI :\n1. Posez l'appareil à portée de main près de votre fauteuil.\n2. Actionnez le levier en souriant.\n3. Savourez l'admiration ébahie de vos voisins et de toute la famille !`;
      tips = [
        'Garantie : 100 % bonne humeur et zéro panne électronique !',
      ];
      break;

    default:
      title = `${workshop.title}${suffixTitle}`;
      subtitle = `${s1} · ${s2}`;
      content = `Voici votre création personnalisée pour l'atelier « ${workshop.title} ».\n\nVous avez choisi de réunir : ${s1}, avec ${s2} et ${s3}.\n\nChaque détail a été assemblé avec soin et bienveillance pour vous offrir un moment de plaisir, de partage et de découverte au cœur de L'Atelier Alphabette.`;
      break;
  }

  return {
    workshopId: workshop.id,
    workshopTitle: workshop.title,
    workshopEmoji: workshop.emoji,
    categoryId: workshop.categoryId,
    selections,
    title,
    subtitle,
    content,
    tips,
    visualStyle: workshop.visualStyle,
  };
}

export function generateLocalQuizFallback(selections: {
  step1: string;
  step2: string;
  step3: string;
}): { title: string; subtitle: string; questions: QuizQuestion[] } {
  const theme = selections.step1 || 'Culture et patrimoine français';
  const isCinema = theme.toLowerCase().includes('cinéma');
  const isChanson = theme.toLowerCase().includes('chanson');
  const isCuisine = theme.toLowerCase().includes('gastronomie') || theme.toLowerCase().includes('région');

  if (isCinema) {
    return {
      title: 'Grand Quiz du Cinéma Français',
      subtitle: `${selections.step2} · ${selections.step3}`,
      questions: [
        {
          question: 'Dans quel film célèbre Louis de Funès et Bourvil traversent-ils la France avec des pots de peinture ?',
          options: ['La Grande Vadrouille', 'Le Corniaud', 'La Traversée de Paris'],
          correctIndex: 0,
          explanation: 'Sorti en 1966, « La Grande Vadrouille » de Gérard Oury reste l’un des films les plus aimés des Français !',
        },
        {
          question: 'Quel grand acteur prononce la réplique célèbre : « T’as d’beaux yeux, tu sais » ?',
          options: ['Jean Gabin', 'Alain Delon', 'Jean Marais'],
          correctIndex: 0,
          explanation: 'Jean Gabin adresse cette réplique mythique à Michèle Morgan dans « Le Quai des brumes » en 1938.',
        },
        {
          question: 'Quel personnage plein d’humour Jacques Tati incarnait-il avec sa pipe et son imperméable ?',
          options: ['Monsieur Hulot', 'inspecteur Maigret', 'Don Camillo'],
          correctIndex: 0,
          explanation: 'Monsieur Hulot a enchanté le public dans « Les Vacances de Monsieur Hulot » et « Mon Oncle ».',
        },
        {
          question: 'Dans quelle ville provençale Fernandel incarne-t-il le célèbre curé Don Camillo... tourné en réalité en Italie ?',
          options: ['Brescello', 'Marseille', 'Avignon'],
          correctIndex: 0,
          explanation: 'Le village italien de Brescello a accueilli Fernandel et Gino Cervi pour toute la saga Don Camillo.',
        },
        {
          question: 'Quelle actrice chante en duo le tourbillon de la vie dans « Jules et Jim » ?',
          options: ['Jeanne Moreau', 'Brigitte Bardot', 'Catherine Deneuve'],
          correctIndex: 0,
          explanation: 'La voix chaleureuse de Jeanne Moreau a rendu cette chanson inoubliable.',
        },
      ],
    };
  }

  if (isChanson) {
    return {
      title: 'Grand Quiz des Chansons Françaises',
      subtitle: `${selections.step2} · ${selections.step3}`,
      questions: [
        {
          question: 'Qui chantait avec joie « Douce France, cher pays de mon enfance » ?',
          options: ['Charles Trenet', 'Yves Montand', 'Georges Brassens'],
          correctIndex: 0,
          explanation: 'Charles Trenet, surnommé « le Fou chantant », a composé cet hymne tendre et lumineux.',
        },
        {
          question: 'Quelle fleur Édith Piaf voyait-elle lorsqu’il la prenait dans ses bras ?',
          options: ['La Vie en rose', 'Les Lilas blancs', 'Le Temps des cerises'],
          correctIndex: 0,
          explanation: '« La Vie en rose », écrite en 1945, a fait le tour du monde entier.',
        },
        {
          question: 'Quel chanteur à moustache célébrait « Les Copains d’abord » ?',
          options: ['Georges Brassens', 'Jacques Brel', 'Jean Ferrat'],
          correctIndex: 0,
          explanation: 'Georges Brassens a écrit cette ode à l’amitié fidèle en 1964.',
        },
        {
          question: 'Sur quelle bicyclette Yves Montand dévalait-il les chemins avec Paulette ?',
          options: ['Une bicyclette bleue et chromée', 'Un grand bi ancien', 'Un tandem rouge'],
          correctIndex: 0,
          explanation: '« À bicyclette » évoque toute la liberté des balades de jeunesse entre amis.',
        },
        {
          question: 'Quelle chanteuse attendait le retour de son amour dans « L’Aigle noir » ?',
          options: ['Barbara', 'Dalida', 'Juliette Gréco'],
          correctIndex: 0,
          explanation: 'Barbara a signé en 1970 l’une des plus poétiques chansons du répertoire français.',
        },
      ],
    };
  }

  if (isCuisine) {
    return {
      title: 'Quiz Gourmand de nos Régions',
      subtitle: `${selections.step2} · ${selections.step3}`,
      questions: [
        {
          question: 'De quelle ville viennent les fameuses petites douceurs appelées « Calissons » ?',
          options: ['Aix-en-Provence', 'Montélimar', 'Cambrai'],
          correctIndex: 0,
          explanation: 'Les calissons d’Aix-en-Provence sont préparés avec du melon confit et des amandes douces.',
        },
        {
          question: 'Comment s’appelle la célèbre tarte aux pommes caramélisées cuite à l’envers ?',
          options: ['La tarte Tatin', 'La tarte Bourdaloue', 'La flognarde'],
          correctIndex: 0,
          explanation: 'Les sœurs Tatin l’ont créée en Sologne, à Lamotte-Beuvron, au XIXe siècle.',
        },
        {
          question: 'Quel ingrédient parfume traditionnellement la pâte à crêpes de la Chandeleur ?',
          options: ['La fleur d’oranger ou une goutte de rhum', 'La menthe poivrée', 'Le poivre vert'],
          correctIndex: 0,
          explanation: 'Une touche de fleur d’oranger ou de vanille embaume toute la cuisine lors de la Chandeleur.',
        },
        {
          question: 'Quel plat familial mijoté porte le nom d’une danse ou d’une couverture blanche ?',
          options: ['La blanquette de veau', 'Le pot-au-feu', 'La ratatouille'],
          correctIndex: 0,
          explanation: 'La blanquette doit son nom à sa sauce blanche onctueuse liée au jaune d’œuf.',
        },
        {
          question: 'Dans quelle région déguste-t-on le véritable Kouign-amann au bon beurre ?',
          options: ['En Bretagne (Douarnenez)', 'En Alsace', 'En Auvergne'],
          correctIndex: 0,
          explanation: 'En breton, « kouign-amann » signifie tout simplement « gâteau au beurre » !',
        },
      ],
    };
  }

  return {
    title: `Quiz Culture & Plaisir : ${theme}`,
    subtitle: `${selections.step2} · ${selections.step3}`,
    questions: [
      {
        question: 'Quel fleuve français traverse la ville de Lyon aux côtés du Rhône ?',
        options: ['La Saône', 'La Loire', 'La Garonne'],
        correctIndex: 0,
        explanation: 'La Saône rejoint le Rhône au sud de la presqu’île de Lyon, dans le quartier de la Confluence.',
      },
      {
        question: 'Quel oiseau annonce traditionnellement le retour du printemps sous nos toits ?',
        options: ['L’hirondelle', 'Le rouge-gorge', 'La chouette'],
        correctIndex: 0,
        explanation: 'L’hirondelle retrouve fidèlement son nid chaque printemps après un long voyage.',
      },
      {
        question: 'Quel château de la Loire est célèbre pour ses arches qui enjambent la rivière le Cher ?',
        options: ['Le château de Chenonceau', 'Le château de Chambord', 'Le château de Versailles'],
        correctIndex: 0,
        explanation: 'Surnommé le « Château des Dames », Chenonceau se reflète magnifiquement dans les eaux du Cher.',
      },
      {
        question: 'Quel proverbe complète la phrase : « En avril, ne te découvre pas... » ?',
        options: ['...d’un fil !', '...d’un chapeau !', '...le matin !'],
        correctIndex: 0,
        explanation: '« En avril, ne te découvre pas d’un fil ; en mai, fais ce qu’il te plaît ! »',
      },
      {
        question: 'Quelle fleur violette parfume les collines de Haute-Provence tout l’été ?',
        options: ['La lavande', 'La tulipe', 'Le muguet'],
        correctIndex: 0,
        explanation: 'L’or bleu de Provence fleurit de juin à août sous le chant des cigales.',
      },
    ],
  };
}

export interface HomeQuickProposition {
  id: string;
  workshopId: string;
  emoji: string;
  title: string;
  description: string;
  selections: {
    step1: string;
    step2: string;
    step3: string;
  };
}

export const HOME_QUICK_PROPOSITIONS: HomeQuickProposition[] = [
  {
    id: 'prop-conte-foret',
    workshopId: 'contes-petits-enfants',
    emoji: '🐿️',
    title: 'Conte du petit écureuil curieux',
    description: 'Dans une forêt dorée d’automne, sur le bonheur de partager.',
    selections: {
      step1: 'Un petit écureuil curieux',
      step2: 'Dans une forêt dorée d’automne',
      step3: 'Le bonheur de partager avec ses amis',
    },
  },
  {
    id: 'prop-cafe-hug',
    workshopId: 'cafe-histoire',
    emoji: '☕',
    title: 'Prendre le café avec Victor Hugo',
    description: 'Une discussion chaleureuse dans un café historique parisien.',
    selections: {
      step1: 'Victor Hugo — Le grand poète et romancier',
      step2: 'Dans un café historique aux banquettes de velours',
      step3: '« Quel est votre plus beau souvenir de jeunesse ? »',
    },
  },
  {
    id: 'prop-voyage-italie',
    workshopId: 'voyage-fauteuil',
    emoji: '🍋',
    title: 'Escapade en Toscane et aux lacs italiens',
    description: 'Une promenade sensorielle dans la douceur des années 1960.',
    selections: {
      step1: 'Les lacs italiens et les ruelles de Toscane',
      step2: 'Dans la douceur de vivre des années 1960',
      step3: 'S’installer en terrasse pour observer la vie locale',
    },
  },
  {
    id: 'prop-quiz-cinema',
    workshopId: 'quiz-maison',
    emoji: '🎬',
    title: 'Quiz du Grand Cinéma Français',
    description: '5 questions conviviales sur Gabin, De Funès et Bourvil.',
    selections: {
      step1: 'Le grand cinéma français (Gabin, De Funès, Bourvil...)',
      step2: 'Détente et plaisir : questions faciles et connues',
      step3: 'Tranquillement pour mon plaisir personnel',
    },
  },
  {
    id: 'prop-recette-pommes',
    workshopId: 'carnet-recettes',
    emoji: '🥧',
    title: 'Tarte douce aux pommes et cannelle',
    description: 'Fiche recette illustrée façon grand-mère, simple et inratable.',
    selections: {
      step1: 'Un gâteau moelleux, une tarte ou une crème d’antan',
      step2: 'Pommes, poires, cannelle et vanille',
      step3: 'Recette rapide, inratable et peu de vaisselle',
    },
  },
  {
    id: 'prop-chanson-marne',
    workshopId: 'chanson-guinguette',
    emoji: '🪗',
    title: 'Valse musette des bords de Marne',
    description: 'Couplets joyeux et refrain à chantonner à l’accordéon.',
    selections: {
      step1: 'Une valse musette à trois temps (1, 2, 3...)',
      step2: 'Les dimanches au bord de l’eau et les guinguettes',
      step3: 'Un accordéon bretelle plein d’entrain',
    },
  },
  {
    id: 'prop-peinture-provence',
    workshopId: 'atelier-peinture',
    emoji: '🎨',
    title: 'Aquarelle d’un village de Provence',
    description: 'Toile baignée par la lumière ambrée du soleil couchant.',
    selections: {
      step1: 'Aquarelle douce et lumineuse',
      step2: 'Un village de Provence bordé de lavandes',
      step3: 'Les couleurs ambrées du soleil couchant',
    },
  },
  {
    id: 'prop-cafe-piaf',
    workshopId: 'cafe-histoire',
    emoji: '🎤',
    title: 'Café en chanson avec Édith Piaf',
    description: 'Rencontre intime sous la tonnelle d’une guinguette.',
    selections: {
      step1: 'Édith Piaf — La Môme à la voix inoubliable',
      step2: 'À une table sous la tonnelle au bord de la rivière',
      step3: '« Où trouviez-vous votre inspiration chaque matin ? »',
    },
  },
  {
    id: 'prop-blagues-famille',
    workshopId: 'boite-blagues',
    emoji: '😄',
    title: '3 blagues douces pour le repas du dimanche',
    description: 'Humour bon enfant sur la cuisine, le jardin et les animaux.',
    selections: {
      step1: 'Les gourmands, la cuisine et le potager',
      step2: '3 petites histoires drôles à raconter à table',
      step3: 'Pour toute la famille, de 7 à 97 ans',
    },
  },
  {
    id: 'prop-poesie-jardin',
    workshopId: 'atelier-poesie',
    emoji: '🪶',
    title: 'Poème : Rosée, Pivoine & Silence',
    description: 'Des rimes chantantes et apaisantes au fil des saisons.',
    selections: {
      step1: 'Rosée · Pivoine · Silence',
      step2: 'La paix intérieure et la sérénité',
      step3: 'De belles rimes classiques et chantantes',
    },
  },
  {
    id: 'prop-jardin-balcon',
    workshopId: 'jardin-reve',
    emoji: '🌻',
    title: 'Balcon fleuri de roses et lavandes',
    description: 'Plan de jardin idéal avec 3 astuces écologiques faciles.',
    selections: {
      step1: 'Un balcon ou un rebord de fenêtre ensoleillé',
      step2: 'Lavande, marguerites et fleurs pour papillons',
      step3: 'Un jardin facile toute l’année sans fatigue',
    },
  },
  {
    id: 'prop-heros-lettre',
    workshopId: 'histoire-heros',
    emoji: '🧭',
    title: 'Le mystère de la lettre ancienne',
    description: 'Une aventure douce au village avec un petit chien malicieux.',
    selections: {
      step1: 'Le mystère d’une lettre ancienne trouvée au village',
      step2: 'Un petit chien malicieux au flair infaillible',
      step3: 'Une belle loupe ancienne',
    },
  },
];

export function generateLocalStepSuggestionsFallback(
  workshop: WorkshopDefinition,
  stepIndex: 0 | 1 | 2,
  existingLabels: string[]
): { id: string; label: string; emoji: string }[] {
  const existingSet = new Set(existingLabels.map((l) => l.toLowerCase().trim()));
  const categoryExtras: Record<string, { label: string; emoji: string }[]> = {
    memoire: [
      { label: 'Un grand-père jardinier aux histoires merveilleuses', emoji: '🌻' },
      { label: 'Un dimanche pluvieux transformé en fête au salon', emoji: '☔' },
      { label: 'Le parfum d’un gâteau sorti tout chaud du four', emoji: '🥧' },
      { label: 'Une promenade main dans la main au bord du canal', emoji: '🚶' },
      { label: 'Une vieille boîte à biscuits remplie de photos jaunies', emoji: '📷' },
      { label: 'La joie simple d’écrire une carte postale de vacances', emoji: '📮' },
    ],
    arts: [
      { label: 'Un bouquet de tournesols et de bleuets dans un pichet en grès', emoji: '🌻' },
      { label: 'Des barques colorées posées sur le sable fin à marée basse', emoji: '⛵' },
      { label: 'Une couronne de feuilles d’automne et de pommes de pin', emoji: '🍁' },
      { label: 'Un motif champêtre avec coccinelles et brins de muguet', emoji: '🐞' },
      { label: 'Une pergola fleurie de glycines mauves au soleil', emoji: '🪻' },
      { label: 'Un joli coussin brodé aux couleurs de la campagne', emoji: '🪡' },
    ],
    musique: [
      { label: 'Les airs joyeux des bals populaires du 14 juillet', emoji: '🎆' },
      { label: 'Les chansons douces fredonnées en préparant le dîner', emoji: '🎶' },
      { label: 'Un clin d’œil malicieux sur les petites manies du quotidien', emoji: '😉' },
      { label: 'Les grands classiques du théâtre et de la télévision d’antan', emoji: '🎭' },
      { label: 'Une citation optimiste sur le bonheur à tout âge', emoji: '🌟' },
      { label: 'L’amitié fidèle qui traverse toutes les saisons', emoji: '🤝' },
    ],
    cuisine: [
      { label: 'Les marchés colorés du Sud-Ouest et leurs saveurs', emoji: '🧄' },
      { label: 'Une balade nostalgique dans les rues de Paris en 1955', emoji: '🗼' },
      { label: 'Une clafoutis aux cerises noires tiède et parfumé', emoji: '🍒' },
      { label: 'Une rencontre chaleureuse avec Marcel Pagnol en Provence', emoji: '🌿' },
      { label: 'Une machine à retrouver les lunettes en sifflant', emoji: '👓' },
      { label: 'Un thé parfumé à la menthe fraîche sous la véranda', emoji: '🍵' },
    ],
  };

  const pool = categoryExtras[workshop.categoryId] || categoryExtras.memoire;
  const fresh = pool.filter((item) => !existingSet.has(item.label.toLowerCase().trim()));
  const selected = fresh.slice(0, 4);

  if (selected.length < 4) {
    selected.push({
      label: `Idée originale pour « ${workshop.title} » (étape ${stepIndex + 1})`,
      emoji: workshop.emoji,
    });
  }

  return selected.map((item, idx) => ({
    id: `extra-${workshop.id}-${stepIndex}-${Date.now()}-${idx}`,
    label: item.label,
    emoji: item.emoji,
  }));
}

export function generateLocalInteractiveFallback(
  workshop: WorkshopDefinition,
  selections: { step1: string; step2: string; step3: string },
  stepIndex: number,
  userChoice?: string
): InteractiveChapter {
  if (workshop.id === 'cafe-histoire') {
    const figure = selections.step1.split(' — ')[0] || 'Victor Hugo';
    const place = selections.step2 || 'Un café parisien';
    const questionAsked = userChoice || selections.step3;

    if (stepIndex === 0) {
      return {
        chapterTitle: `Première tasse avec ${figure}`,
        content: `Installé(e) confortablement (${place.toLowerCase()}), ${figure} vous sourit chaleureusement en posant sa tasse en porcelaine.\n\n« Vous me demandez : ${questionAsked} Quelle belle question ! Voyez-vous, tout au long de ma vie, j'ai compris que les plus grandes œuvres naissent toujours de l'émerveillement devant les choses simples. Un rayon de lumière sur une table de bois, la voix d'un ami cher, la curiosité qui ne vieillit jamais... Voilà le véritable secret qui m'a guidé chaque matin. »`,
        choices: [
          'Quelle a été votre plus grande joie dans la vie ?',
          'Avez-vous une petite anecdote amusante à me confier ?',
          'Quel lieu aimiez-vous par-dessus tout pour vous reposer ?',
          'Que diriez-vous à un enfant curieux de tout aujourd’hui ?',
        ],
      };
    }

    return {
      chapterTitle: `Confidences de ${figure}`,
      choiceMade: userChoice,
      content: `${figure} hoche la tête avec des yeux pétillants de malice :\n\n« Ah, puisque vous me posez la question (${userChoice}), je vais vous confier un secret que peu de livres racontent ! Même aux heures les plus sérieuses de mon travail, je gardais toujours une place pour l'humour et la promenade. Rien n'apaise mieux l'esprit qu'une marche au grand air suivie d'une conversation sincère comme celle que nous partageons aujourd'hui. »`,
      choices: [
        'Quel message aimeriez-vous laisser aux jeunes d’aujourd’hui ?',
        'Que faisiez-vous les dimanches pour vous reposer ?',
        'Quelle personne vous a le plus inspiré(e) dans votre vie ?',
        'Si nous commandions une petite douceur, que choisiriez-vous ?',
      ],
    };
  }

  // Voyage en fauteuil (#17) ou Histoire dont vous êtes le héros (#20)
  const place = selections.step1;
  const stepNum = stepIndex + 1;

  if (stepIndex === 0) {
    return {
      chapterTitle: `Chapitre 1 : Le grand départ — ${place}`,
      content: `Une douce brise chargée de parfums printaniers vous accueille dès votre arrivée. Devant vous s'ouvre un décor magnifique : ${place.toLowerCase()}, accompagné de ${selections.step2.toLowerCase()}.\n\nEn prenant le temps de ${selections.step3.toLowerCase()}, vous remarquez plusieurs chemins tout aussi charmants les uns que les autres : une petite ruelle fleurie d'où s'échappe une douce musique, un belvédère lumineux où un artisan vous fait signe, un marché coloré et un vieux jardin ombragé.`,
      choices: [
        'Suivre la petite ruelle fleurie en musique',
        'Rejoindre le belvédère et saluer l’artisan',
        'Flâner au milieu des étals colorés du marché',
        'Pousser la grille du vieux jardin ombragé',
      ],
    };
  }

  return {
    chapterTitle: `Chapitre ${stepNum} : Une belle découverte`,
    choiceMade: userChoice,
    content: `Excellent choix ! En décidant de « ${userChoice?.toLowerCase()} », vous découvrez un coin secret préservé du tumulte. La lumière dorée illumine les pierres anciennes et une table accueillante vous invite à faire une halte.\n\nOn vous y raconte une vieille légende locale pleine de charme tout en vous offrant une spécialité fraîchement préparée. Quatre nouvelles possibilités s'offrent maintenant à votre curiosité :`,
    choices: [
      'Visiter le jardin secret derrière la fontaine',
      'Écouter la suite de la légende autour d’un thé',
      'Discuter avec le musicien installé sur le banc voisin',
      'Emprunter le petit sentier qui mène au point de vue',
    ],
  };
}
