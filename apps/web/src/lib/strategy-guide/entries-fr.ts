import type { StrategyEntry, StrategyKind } from "./kinds";

export const STRATEGY_GUIDE_FR: Record<StrategyKind, StrategyEntry> = {
  buyAndHold: {
    label: "Buy and Hold (Acheter et conserver)",
    summary: "Acheter des placements de qualité et les conserver pendant des années ou des décennies, en ignorant les fluctuations à court terme.",
    description:
      "Buy and Hold est la stratégie à long terme la plus simple : sélectionner des placements fondamentalement solides — fonds indiciels diversifiés, actions de premier ordre ou FNB diversifiés — et les conserver quelles que soient les conditions du marché. Le principe central est que les marchés montent sur le long terme, et que le coût des tentatives de synchronisation (frais de transaction, impôts, rallyes manqués) dépasse le bénéfice. Les données historiques montrent que manquer seulement les 10 meilleures journées de bourse sur une période de 20 ans peut réduire le rendement total d'environ la moitié. En restant investi, vous captez la trajectoire complète de capitalisation et minimisez les coûts de friction.",
    whenToUse:
      "Utilisez Buy and Hold lorsque votre horizon de placement est de 10 ans ou plus et que vous croyez à la croissance à long terme de l'économie. C'est idéal pour les comptes enregistrés (CELI, REER) où les gains se capitalisent à l'abri de l'impôt. Cette stratégie convient aux investisseurs qui préfèrent la simplicité et peuvent tolérer des baisses sans vendre dans la panique.",
    prosAndCons:
      "Avantages : coûts de transaction très faibles, efficacité fiscale maximale (moins d'événements imposables), exploite la puissance de la capitalisation, nécessite peu de temps et d'attention. Inconvénients : exige une forte discipline émotionnelle lors des marchés baissiers, vous conservez les perdants avec les gagnants, et il n'y a aucune protection contre la baisse — un repli prolongé près de la retraite peut être dommageable sans ajustement progressif.",
    coreIdea:
      "Le temps dans le marché bat la synchronisation du marché. Choisissez la qualité, restez investi, laissez la capitalisation faire le travail.",
    steps: [
      {
        title: "Étape 1 : confirmer un horizon de 10 ans ou plus",
        body:
          "L'argent dont vous pourriez avoir besoin dans moins de 10 ans ne devrait pas être en actions. Si votre horizon est plus court, Buy and Hold est la mauvaise stratégie — utilisez des CPG ou des obligations court terme pour cette portion.",
      },
      {
        title: "Étape 2 : choisir un véhicule diversifié",
        body:
          "Pour la plupart des investisseurs, un seul FNB tout-en-un (XEQT pour 100 % actions, VGRO pour 80/20, VBAL pour 60/40) est la stratégie complète. Le Buy and Hold sur titres individuels ne fonctionne que si vous savez déjà lire les états financiers.",
      },
      {
        title: "Étape 3 : utiliser le bon type de compte",
        body:
          "CELI en premier (libre d'impôt pour toujours), puis REER (imposition différée, réduit le revenu imposable). Utilisez les comptes non enregistrés seulement une fois les droits enregistrés épuisés.",
      },
      {
        title: "Étape 4 : automatiser les cotisations",
        body:
          "Programmez un transfert mensuel automatique vers votre courtier (même 100 $). L'automatisation élimine la question émotionnelle « devrais-je acheter aujourd'hui ? » et constitue le meilleur prédicteur du succès à long terme.",
      },
      {
        title: "Étape 5 : éteindre le bruit",
        body:
          "Désabonnez-vous des actualités boursières, retirez les applications de trading de votre écran d'accueil, et consultez votre portefeuille au maximum une fois par trimestre. La pire chose à faire est de vendre pendant un krach.",
      },
      {
        title: "Étape 6 : rééquilibrer une fois par an",
        body:
          "Si vous détenez un seul FNB tout-en-un, il se rééquilibre lui-même. Sinon, à une date fixe chaque année (votre anniversaire fonctionne), ramenez votre allocation vers la cible — vendez ce qui dépasse, achetez ce qui manque.",
      },
    ],
    whyItWorks:
      "Sur de longues périodes, les marchés actions capitalisent à ~7–9 % réels. Manquer les 10 meilleures journées coupe le rendement de moitié, mais prédire ces journées est essentiellement impossible. Rester investi garantit que vous les captez.",
    links: [
      { title: "Investopedia — Buy and Hold (anglais)", url: "https://www.investopedia.com/terms/b/buyandhold.asp" },
      { title: "Canadian Couch Potato — Rester le cap (anglais)", url: "https://canadiancouchpotato.com/getting-started/" },
      { title: "Vanguard Canada — Principes pour réussir ses placements", url: "https://www.vanguard.ca/fr/investor/investment-principles" },
    ],
  },

  dollarCostAveraging: {
    label: "Dollar-Cost Averaging, DCA (Achats périodiques par sommes fixes)",
    summary: "Investir un montant fixe à intervalles réguliers, quel que soit le prix, pour lisser le coût moyen d'acquisition au fil du temps.",
    description:
      "Le Dollar-Cost Averaging consiste à investir un montant fixe — disons 500 $ par mois — dans le même placement selon un calendrier régulier (aux deux semaines, mensuellement). Quand les prix sont élevés, vous achetez moins d'unités ; quand ils sont bas, vous en achetez davantage. Sur la durée, cela produit un coût moyen par unité inférieur au prix moyen sur la même période, parce que vous accumulez naturellement plus d'unités aux prix les plus bas. Le DCA est intégré dans de nombreux régimes de travail et configurations de cotisation automatique au CELI/REER, ce qui en fait la stratégie par défaut de la plupart des épargnants canadiens.",
    whenToUse:
      "Utilisez le DCA lorsque vous investissez à partir de revenus réguliers (cotisations sur la paie) ou lorsque vous souhaitez déployer une somme forfaitaire progressivement pour réduire le risque de synchronisation. C'est particulièrement efficace pour les débutants, car cela élimine la question paralysante « est-ce le bon moment pour investir ? » et impose une habitude d'épargne.",
    prosAndCons:
      "Avantages : élimine la synchronisation émotionnelle du marché, accessible à tous les budgets, s'associe parfaitement aux cotisations automatiques CELI/REER, et réduit l'impact de la volatilité à court terme. Inconvénients : dans un marché en hausse régulière, le DCA sous-performe un investissement forfaitaire environ deux fois sur trois (recherche Vanguard), car l'argent en attente rapporte moins que l'argent investi. Le confort psychologique du DCA a un coût mesurable en rendement espéré.",
    coreIdea:
      "Vous ne pouvez pas synchroniser le marché, alors n'essayez pas. Investissez le même montant le même jour chaque mois — vous achetez automatiquement plus quand les prix sont bas et moins quand ils sont hauts.",
    steps: [
      {
        title: "Étape 1 : choisir un montant fixe qui ne vous manquera pas",
        body:
          "Commencez avec un montant à peine perceptible (5–10 % du salaire net est un ancrage courant). Le montant importe moins que la régularité. 100 $/mois pendant 30 ans bat 500 $/mois pendant 3 ans.",
      },
      {
        title: "Étape 2 : choisir un calendrier fixe",
        body:
          "Mensuel le jour de paie est le plus simple. Aux deux semaines fonctionne aussi. Ne choisissez jamais un calendrier qui exige de « décider » chaque fois — le but est d'éliminer la décision.",
      },
      {
        title: "Étape 3 : choisir une seule cible diversifiée",
        body:
          "Un FNB large (XEQT, VFV, VEQT) ou un tout-en-un (VGRO, XBAL) est idéal. N'essayez pas de faire du DCA sur des actions individuelles — le risque de concentration annule l'effet de lissage.",
      },
      {
        title: "Étape 4 : automatiser le transfert ET l'achat",
        body:
          "Programmez un virement automatique de la banque au courtier, et — si le courtier le permet — un achat automatique (Wealthsimple, Questrade, la plupart des robots-conseillers). Aucune étape manuelle ne devrait être requise.",
      },
      {
        title: "Étape 5 : continuer d'acheter pendant les krachs",
        body:
          "C'est là que le DCA gagne sa réputation. Quand le marché chute de 30 %, votre cotisation fixe achète 30 % de plus d'unités. Si vous ne supportez pas d'acheter pendant un krach, ajoutez un rappel écrit à votre calendrier : « les krachs font fonctionner le DCA ».",
      },
      {
        title: "Étape 6 : réviser annuellement, pas mensuellement",
        body:
          "Vérifiez une fois par an (p. ex. chaque janvier) que le calendrier tourne et que le montant correspond encore à votre budget. Augmentez les cotisations après une hausse salariale.",
      },
    ],
    whyItWorks:
      "Le DCA élimine deux des plus grands modes d'échec pour les investisseurs particuliers : mauvaise synchronisation et paralysie émotionnelle. Il ne battra pas un achat forfaitaire chanceux au creux du marché, mais il surpasse largement l'attente du « bon moment » — que presque personne n'attrape.",
    links: [
      { title: "Investopedia — Dollar-Cost Averaging (anglais)", url: "https://www.investopedia.com/terms/d/dollarcostaveraging.asp" },
      { title: "Vanguard — DCA vs somme forfaitaire (anglais)", url: "https://corporate.vanguard.com/content/corporatesite/us/en/corp/articles/lump-sum-versus-systematic-investing-which-approach-better.html" },
      { title: "Wealthsimple — Le DCA expliqué", url: "https://www.wealthsimple.com/fr-ca/apprendre/achats-periodiques-par-sommes-fixes" },
    ],
  },

  valueInvesting: {
    label: "Value Investing (Investissement valeur)",
    summary: "Acheter des actions cotées en dessous de leur valeur intrinsèque estimée et attendre que le marché reconnaisse leur juste prix.",
    description:
      "Le Value Investing, lancé par Benjamin Graham et popularisé par Warren Buffett, recherche des actions dont le prix de marché est nettement inférieur à leur valeur intrinsèque calculée — un concept appelé la « marge de sécurité ». Les adeptes analysent les états financiers en examinant des ratios comme le cours/bénéfice (C/B), le cours/valeur comptable, le rendement du flux de trésorerie disponible et le niveau d'endettement pour repérer des entreprises sous-évaluées. La stratégie suppose que les marchés ne sont pas toujours efficients à court terme : la peur, la négligence ou des revers temporaires peuvent pousser les prix sous leur juste valeur, créant des occasions d'achat pour les investisseurs patients.",
    whenToUse:
      "Utilisez le Value Investing lorsque vous avez la compétence et la patience de lire les états financiers, que vous pouvez tolérer des périodes de détention de plusieurs années et que vous êtes à l'aise d'acheter quand le sentiment est négatif. Cela fonctionne particulièrement bien après les corrections du marché ou dans des secteurs en défaveur. Les banques et services publics canadiens apparaissent souvent comme des aubaines lors de corrections généralisées.",
    prosAndCons:
      "Avantages : rendements à long terme historiquement solides dans de nombreux marchés, cadre discipliné ancré dans les fondamentaux, et la marge de sécurité limite le risque de baisse. Inconvénients : les actions valeur peuvent rester sous-évaluées pendant des années (« pièges à valeur »), la stratégie exige un effort analytique important, et elle a sous-performé l'investissement croissance pendant des périodes prolongées (notamment 2010–2020). Distinguer une vraie aubaine d'une entreprise en déclin permanent est le défi central.",
    coreIdea:
      "Le prix est ce que vous payez, la valeur est ce que vous obtenez. Achetez 1 $ d'entreprise pour 60 ¢ ; attendez que le marché comble l'écart.",
    steps: [
      {
        title: "Étape 1 : filtrer les fondamentaux bon marché",
        body:
          "Commencez par des filtres : C/B < 15, C/VC < 1,5, dette/capitaux propres < 1, flux de trésorerie disponible positif, rendement du dividende > 2 %. Beaucoup de filtres de courtier font cela gratuitement. Cela donne une liste de candidats d'environ 30 à 50 entreprises.",
      },
      {
        title: "Étape 2 : lire le rapport annuel",
        body:
          "Parcourez le 10-K/rapport annuel le plus récent. Vous cherchez : revenus constants, flux de trésorerie disponible stable ou en croissance, modèle d'affaires compréhensible, direction qui discute de vrais risques (pas juste de relations publiques). Si vous ne pouvez pas expliquer ce que fait l'entreprise en une phrase, passez.",
      },
      {
        title: "Étape 3 : estimer la valeur intrinsèque",
        body:
          "Méthode la plus simple : flux de trésorerie disponible moyen sur 10 ans × 12–15 (multiple conservateur), divisé par le nombre d'actions. Si le prix du marché est à 30 %+ en dessous de ce chiffre, vous avez une marge de sécurité.",
      },
      {
        title: "Étape 4 : vérifier pourquoi c'est bon marché",
        body:
          "Bon marché pour une raison (industrie en déclin, poursuite, fraude) = piège à valeur. Bon marché à cause d'une panique temporaire (rotation sectorielle, déception ponctuelle sur les résultats, correction généralisée) = opportunité. Lisez les manchettes récentes et comprenez l'histoire.",
      },
      {
        title: "Étape 5 : acheter en tranches",
        body:
          "Divisez votre position en 3 parts. Achetez 1/3 à la cible initiale, 1/3 si le prix baisse encore de 15 %, 1/3 s'il baisse encore de 15 %. Cela vous protège d'être en avance (ce qui est l'issue normale).",
      },
      {
        title: "Étape 6 : fixer une date d'expiration de la thèse",
        body:
          "Notez pourquoi vous avez acheté et ce qui vous ferait changer d'avis. Si la thèse se brise (détérioration permanente, coupure de dividende, spirale de la dette), vendez — ne vous ancrez pas sur le coût. Si le prix atteint la juste valeur, envisagez de réduire.",
      },
    ],
    whyItWorks:
      "Les marchés sont efficients à long terme mais émotionnels à court terme. Une marge de sécurité vous protège quand vous avez tort et vous récompense quand vous avez raison. La recherche Fama–French montre que la valeur a été une prime de risque persistante sur des décennies.",
    links: [
      { title: "Investopedia — Value Investing (anglais)", url: "https://www.investopedia.com/terms/v/valueinvesting.asp" },
      { title: "Morningstar — Guide du Value Investing (anglais)", url: "https://www.morningstar.com/investing-definitions/value-investing" },
      { title: "The Intelligent Investor — Résumé (anglais)", url: "https://www.investopedia.com/articles/07/ben_graham.asp" },
    ],
  },

  growthInvesting: {
    label: "Growth Investing (Investissement croissance)",
    summary: "Cibler des entreprises à croissance des revenus ou des bénéfices supérieure à la moyenne, en acceptant des valorisations plus élevées pour une capitalisation plus rapide.",
    description:
      "Le Growth Investing se concentre sur les entreprises dont les revenus et les bénéfices croissent nettement plus vite que la moyenne du marché. Les investisseurs croissance acceptent des multiples de prix plus élevés (C/B, prix/ventes) parce qu'ils s'attendent à ce que la capitalisation rapide justifie la prime actuelle. La stratégie met l'accent sur le marché adressable total, les avantages concurrentiels, les revenus récurrents et l'exécution de la direction plutôt que sur la rentabilité actuelle. La technologie, l'innovation en santé et les énergies propres sont des secteurs typiques.",
    whenToUse:
      "Utilisez le Growth Investing lorsque vous avez un horizon long (10 ans et plus), que vous pouvez tolérer des baisses prononcées (les actions croissance chutent souvent de 30 à 50 % lors des corrections), et que vous souhaitez maximiser l'appréciation du capital. C'est particulièrement efficace dans un CELI, où tous les gains sont définitivement libres d'impôt. L'investissement croissance complète un portefeuille indiciel de base comme allocation satellite.",
    prosAndCons:
      "Avantages : potentiel de rendements exceptionnels qui dépassent l'inflation et le marché dans son ensemble, capture l'innovation et les tendances séculaires tôt. Inconvénients : les valorisations élevées rendent les actions croissance vulnérables aux hausses de taux d'intérêt et aux changements de sentiment, la plupart des entreprises de croissance versent peu ou pas de dividendes, et les gagnants sont difficiles à identifier à l'avance — de nombreuses histoires de forte croissance échouent. Le risque de concentration est élevé si vous choisissez des titres individuels.",
    coreIdea:
      "Payez plus cher pour des entreprises qui capitalisent leurs revenus à 20 %+. Une grande entreprise à un prix juste bat une entreprise juste à un grand prix.",
    steps: [
      {
        title: "Étape 1 : filtrer sur la croissance soutenue",
        body:
          "Filtres : croissance des revenus > 15 % sur 3 années consécutives, marge brute > 50 % (logiciels) ou > 30 % (matériel), marge opérationnelle positive ou en amélioration. Beaucoup d'entreprises à forte croissance perdantes n'atteignent jamais la rentabilité — la trajectoire de marge est déterminante.",
      },
      {
        title: "Étape 2 : identifier le rempart concurrentiel",
        body:
          "Demandez-vous : pourquoi un concurrent ne peut pas faire cela demain ? Effets de réseau (plus d'utilisateurs = plus de valeur), coûts de changement (verrouillage des données), économies d'échelle, brevets, marque. Pas de rempart durable = pas de croissance durable.",
      },
      {
        title: "Étape 3 : dimensionner le marché adressable",
        body:
          "Si l'entreprise détient déjà la moitié de son marché, la croissance future doit venir de nouveaux marchés — ce qui est difficile. Préférez les entreprises avec < 10 % de pénétration d'un grand marché en croissance.",
      },
      {
        title: "Étape 4 : limiter la taille des positions",
        body:
          "Les actions de croissance individuelles devraient représenter 2–5 % maximum du portefeuille, même pour les noms à forte conviction. Pour une exposition plus large, utilisez un FNB croissance (VUG, QQQ, XIT) — rendements similaires, risque idiosyncratique bien moindre.",
      },
      {
        title: "Étape 5 : utiliser le CELI",
        body:
          "Les gagnants de la croissance peuvent multiplier 10× ou plus sur une décennie. Tout ce gain est libre d'impôt dans un CELI. Ne détenez jamais d'actions de croissance individuelles dans un compte non enregistré si des droits CELI sont disponibles.",
      },
      {
        title: "Étape 6 : tenir malgré la volatilité, vendre sur thèse brisée",
        body:
          "Des baisses de 30–50 % sont normales pour les actions de croissance en plein marché haussier. Ne vendez que si la thèse se brise : la croissance décélère matériellement, un dirigeant clé part, le rempart s'érode. Ne vendez pas simplement parce que l'action a chuté.",
      },
    ],
    whyItWorks:
      "Une entreprise qui capitalise à 25 % double tous les ~3 ans. Même une valorisation riche aujourd'hui devient bon marché si les bénéfices suivent. Le défi est d'identifier les rares entreprises qui peuvent réellement soutenir cette croissance.",
    links: [
      { title: "Investopedia — Growth Investing (anglais)", url: "https://www.investopedia.com/terms/g/growthinvesting.asp" },
      { title: "Fidelity — Croissance vs valeur (anglais)", url: "https://www.fidelity.com/learning-center/investment-products/mutual-funds/growth-vs-value-investing" },
      { title: "Forbes Advisor — Guide Growth Investing (anglais)", url: "https://www.forbes.com/advisor/investing/growth-investing/" },
    ],
  },

  dividendInvesting: {
    label: "Dividend Investing (Investissement en dividendes)",
    summary: "Construire un portefeuille d'actions à dividendes fiables et croissants pour générer un revenu passif et profiter du crédit d'impôt pour dividendes canadien.",
    description:
      "Le Dividend Investing cible des entreprises qui versent des dividendes constants et idéalement croissants — typiquement des entreprises matures et génératrices de liquidités comme les banques canadiennes, les services publics, les télécommunications, les pipelines et les FPI. La stratégie fournit un flux de revenus croissant indépendant des fluctuations du cours de l'action. Au Canada, les dividendes déterminés bénéficient d'un traitement fiscal préférentiel grâce au crédit d'impôt fédéral et provincial pour dividendes, les rendant nettement plus avantageux que les revenus d'intérêts dans les comptes non enregistrés. Un portefeuille d'Aristocrates canadiens du dividende (entreprises ayant augmenté leurs dividendes pendant 5 années consécutives ou plus) constitue un point de départ courant.",
    whenToUse:
      "Utilisez le Dividend Investing pour la génération de revenus (retraités), la stabilité du portefeuille, ou pour profiter du crédit d'impôt pour dividendes canadien dans les comptes non enregistrés. Cela fonctionne aussi bien dans un CELI (revenu libre d'impôt) et un REER (capitalisation à imposition différée). Cette stratégie convient aux investisseurs qui préfèrent des rendements tangibles en espèces et trouvent psychologiquement plus facile de tenir pendant les baisses quand les dividendes continuent de couler.",
    prosAndCons:
      "Avantages : flux de revenus stable et croissant, le crédit d'impôt pour dividendes au Québec/Canada porte le taux d'imposition effectif à environ 25–35 % sur les dividendes déterminés contre jusqu'à 53 % sur les revenus d'intérêts, les dividendes signalent la santé financière de l'entreprise, et les entreprises qui augmentent leurs dividendes ont historiquement surperformé avec une volatilité moindre. Inconvénients : exposition sectorielle concentrée (les financières, les services publics et l'énergie dominent les dividendes canadiens), un rendement élevé peut signaler de la détresse (« piège à rendement »), et les dividendes réinvestis dans les comptes non enregistrés déclenchent quand même de l'impôt annuel.",
    coreIdea:
      "Construisez un flux de trésorerie croissant que vous n'avez pas à vendre d'actions pour recevoir. Laissez l'entreprise vous payer directement.",
    steps: [
      {
        title: "Étape 1 : viser des rendements soutenables (2,5–5 %)",
        body:
          "Les rendements supérieurs à 7 % signalent souvent un problème (prix effondré, dividende en danger). Les rendements sous 2 % signifient que vous payez des prix de croissance. La zone idéale pour les payeurs matures est 2,5–5 %.",
      },
      {
        title: "Étape 2 : vérifier le ratio de distribution",
        body:
          "Ratio = dividendes ÷ bénéfices. Sous 60 % est sain pour la plupart des secteurs ; les FPI et services publics peuvent aller plus haut (70–85 %). Au-dessus de 100 %, le dividende est financé par la dette — drapeau rouge.",
      },
      {
        title: "Étape 3 : prioriser la croissance du dividende plutôt que le rendement",
        body:
          "Une entreprise qui augmente son dividende de 6–10 % par an pendant une décennie vaut bien plus qu'un stagnant à 7 %. Les Aristocrates canadiens du dividende (5 années d'augmentations) et les Dividend Kings (25 années) sont un univers de départ organisé.",
      },
      {
        title: "Étape 4 : diversifier entre secteurs",
        body:
          "Les dividendes canadiens se concentrent dans 3 secteurs : financières, services publics, énergie/pipelines. Répartissez sur les trois plus télécoms et FPI — ou utilisez un FNB de dividendes (VDY, CDZ, XEI) pour une diversification instantanée.",
      },
      {
        title: "Étape 5 : utiliser les comptes fiscalement avantageux",
        body:
          "Dividendes déterminés canadiens : meilleurs dans les comptes non enregistrés (crédit d'impôt). Dividendes américains : meilleurs dans le REER (pas de retenue américaine de 15 %). Dividendes étrangers : CELI si aucun traité de retenue, sinon REER.",
      },
      {
        title: "Étape 6 : réinvestir (PAD) jusqu'à ce que vous ayez besoin du revenu",
        body:
          "La plupart des courtiers canadiens offrent gratuitement le PAD (programme de réinvestissement automatique). Activez-le pendant les années d'accumulation — il capitalise automatiquement sans frais. Passez aux versements en espèces seulement quand vous avez réellement besoin du revenu.",
      },
    ],
    whyItWorks:
      "Les dividendes sont de l'argent réel qui ne dépend pas de la vente d'actions. Un rendement de 4 % croissant de 7 %/an devient un rendement sur coût de 7–8 % en une décennie. La discipline de payer des dividendes filtre aussi pour les entreprises financièrement saines.",
    links: [
      { title: "Investopedia — Dividend Investing (anglais)", url: "https://www.investopedia.com/terms/d/dividendinvesting.asp" },
      { title: "TMX — Aristocrates canadiens du dividende S&P/TSX", url: "https://money.tmx.com/fr/quote/CDZ" },
      { title: "Revenu Québec — Crédit d'impôt pour dividendes", url: "https://www.revenuquebec.ca/fr/citoyens/declaration-de-revenus/produire-votre-declaration-de-revenus/comment-remplir-votre-declaration/aide-par-ligne/451-a-480-credits-dimpot-non-remboursables/ligne-415/" },
    ],
  },

  indexInvesting: {
    label: "Index / Passive Investing (Investissement indiciel / passif)",
    summary: "Répliquer un indice de marché large à travers des FNB ou fonds indiciels à faible coût, en acceptant les rendements du marché au coût minimal.",
    description:
      "L'investissement indiciel consiste à acheter un fonds qui reproduit un indice de marché — le S&P/TSX Composite, le S&P 500 ou un indice mondial comme MSCI World — plutôt que de choisir des actions individuelles. La stratégie s'appuie sur la recherche démontrant que la plupart des gestionnaires actifs sous-performent leur indice de référence après frais sur le long terme. En minimisant les ratios de frais de gestion (RFG) et la rotation, les investisseurs indiciels conservent une plus grande part du rendement du marché. Au Canada, les choix populaires incluent XIC (TSX), VFV ou ZSP (S&P 500), ZAG (obligations) et les FNB tout-en-un comme XEQT, VGRO ou VBAL qui combinent plusieurs indices en un seul titre.",
    whenToUse:
      "Utilisez l'investissement indiciel comme stratégie par défaut pour tout investisseur qui ne veut pas — ou ne peut pas — consacrer un temps significatif à la recherche. Cela fonctionne dans tous les types de comptes (CELI, REER, REEE, non enregistré). Pour une simplicité maximale, un seul FNB d'allocation d'actifs (XEQT pour 100 % actions, VBAL pour 60/40) suffit. C'est l'approche Canadian Couch Potato.",
    prosAndCons:
      "Avantages : coût le plus bas (RFG de 0,05 à 0,25 %), rendement garanti du marché moins des frais minimes, ne nécessite pratiquement aucune recherche continue, la large diversification réduit le risque lié à un seul titre. Inconvénients : aucune possibilité de surperformer le marché, pleine exposition à chaque baisse, aucune capacité d'éviter les secteurs surévalués ou les perdants individuels, et émotionnellement, cela peut sembler insatisfaisant par rapport au choix de gagnants.",
    coreIdea:
      "Ne cherchez pas l'aiguille, achetez la meule de foin. Répliquez le marché à bas coût et laissez les frais, et non les choix, décider du résultat de votre vie.",
    steps: [
      {
        title: "Étape 1 : décider du mix actions vs obligations",
        body:
          "Moins de 40 ans, recherche de croissance : 100 % actions (XEQT, VEQT). 40–55 ans, approche de la retraite : 80/20 (VGRO, XGRO). Proche de la retraite : 60/40 (VBAL, XBAL). Le FNB spécifique importe moins que le bon mix.",
      },
      {
        title: "Étape 2 : choisir UN seul FNB tout-en-un",
        body:
          "Ne compliquez pas. XEQT et VEQT sont presque identiques ; XBAL et VBAL aussi. Un titre, une décision, terminé. Résistez à la tentation de choisir 5 FNB différents « pour diversifier » — le tout-en-un est déjà diversifié.",
      },
      {
        title: "Étape 3 : ouvrir un compte chez un courtier à bas coût",
        body:
          "Questrade (achat de FNB gratuit), Wealthsimple Trade (transactions gratuites), Banque Nationale Courtage direct (FNB gratuits). Évitez les RFG de fonds communs à 2 %+ des banques traditionnelles — c'est 2 % de votre argent qui disparaît chaque année pour toujours.",
      },
      {
        title: "Étape 4 : programmer des cotisations automatiques",
        body:
          "Transfert automatique du compte courant vers le courtier à chaque paie. Achat automatique du FNB si possible. Cela transforme l'investissement indiciel d'une série de décisions en une seule configuration initiale.",
      },
      {
        title: "Étape 5 : l'ignorer pendant 10 à 30 ans",
        body:
          "Vraiment l'étape la plus difficile. L'indice chutera de 30 %+ plusieurs fois dans votre vie. Le tout-en-un se rééquilibre lui-même. Votre travail est de ne pas vendre. Vérifiez le solde une fois par an, pas une fois par jour.",
      },
      {
        title: "Étape 6 : glisser vers les obligations à l'approche de la retraite",
        body:
          "5 à 10 ans avant la retraite, envisagez de passer de XEQT à XGRO, puis à XBAL. Un seul basculement dans un CELI n'a aucun impact fiscal ; dans un compte non enregistré, faites-le graduellement avec les nouvelles cotisations.",
      },
    ],
    whyItWorks:
      "Les données SPIVA montrent qu'environ 80 % des gestionnaires actifs sous-performent l'indice sur 10 ans et plus après frais. L'indiciel garantit que vous captez le rendement du marché moins des frais minimes — ce qui sur des décennies bat 80 % des professionnels.",
    links: [
      { title: "Investopedia — Fonds indiciels (anglais)", url: "https://www.investopedia.com/terms/i/indexfund.asp" },
      { title: "Canadian Couch Potato — Portefeuilles modèles (anglais)", url: "https://canadiancouchpotato.com/model-portfolios/" },
      { title: "Vanguard Canada — FNB", url: "https://www.vanguard.ca/fr/investor/products/products-group/etfs" },
    ],
  },

  bondLaddering: {
    label: "Bond Laddering (Échelonnement obligataire)",
    summary: "Échelonner les échéances d'obligations ou de CPG sur plusieurs années pour qu'une portion arrive à échéance chaque année, offrant liquidité et réduction du risque de taux.",
    description:
      "Un échelonnement obligataire répartit votre allocation en revenu fixe sur plusieurs dates d'échéance — par exemple, des montants égaux dans des CPG de 1, 2, 3, 4 et 5 ans. Chaque année, l'échelon le plus court arrive à échéance et est réinvesti à l'échéance la plus longue, maintenant l'échelle. Cette structure lisse l'effet des variations de taux d'intérêt : si les taux montent, l'échelon qui arrive à échéance capte le taux plus élevé ; si les taux baissent, les échelons plus longs verrouillent les taux précédents, plus élevés. Au Canada, les échelles de CPG sont particulièrement populaires parce que les CPG dans les banques de l'annexe I sont assurés par la SADC jusqu'à 100 000 $ par catégorie admissible.",
    whenToUse:
      "Utilisez un échelonnement obligataire pour la partie conservatrice ou à revenu fixe de votre portefeuille, pour les retraités ayant besoin d'un revenu prévisible, ou lorsque vous voulez éviter de deviner la direction des taux d'intérêt. C'est particulièrement utile en période de hausse des taux, où tout bloquer dans des obligations à long terme signifierait manquer des taux plus élevés plus tard.",
    prosAndCons:
      "Avantages : réduit le risque de réinvestissement et le risque de synchronisation des taux, simple à mettre en place avec des CPG dans n'importe quelle banque ou caisse populaire canadienne, assurance SADC sur les CPG admissibles, et procure une liquidité régulière à mesure que les échelons arrivent à échéance. Inconvénients : rendements inférieurs aux actions sur le long terme, l'inflation peut éroder le pouvoir d'achat si les taux réels sont négatifs, les CPG non rachetables immobilisent le capital jusqu'à l'échéance, et construire/maintenir une échelle demande une attention périodique.",
    coreIdea:
      "Arrêtez de deviner où vont les taux. Répartissez votre revenu fixe sur plusieurs échéances pour qu'un échelon arrive à échéance chaque année et que vous réinvestissiez toujours aux taux courants.",
    steps: [
      {
        title: "Étape 1 : décider de la longueur de l'échelle",
        body:
          "Une échelle de 5 ans (1/2/3/4/5 ans) est standard et simple. Plus courte (1–3 ans) si vous anticipez une poursuite de la hausse des taux ; plus longue (1–10 ans) si vous anticipez une baisse.",
      },
      {
        title: "Étape 2 : diviser votre capital en revenu fixe en échelons égaux",
        body:
          "Si vous avez 50 000 $ et une échelle de 5 ans : 10 000 $ dans chacun des CPG de 1, 2, 3, 4 et 5 ans. Des échelons égaux gardent les mathématiques simples et lissent le réinvestissement.",
      },
      {
        title: "Étape 3 : utiliser des CPG assurés SADC dans une banque canadienne",
        body:
          "Les banques de l'annexe I et la plupart des caisses populaires sont couvertes par la SADC/SCAD jusqu'à 100 000 $ par catégorie. Répartissez entre institutions si vous dépassez ce plafond.",
      },
      {
        title: "Étape 4 : programmer des rappels calendaires pour chaque échéance",
        body:
          "Chaque année, quand l'échelon de 1 an arrive à échéance, réinvestissez-le dans un nouveau CPG de 5 ans (le plus long). Sans rappel, l'argent dort dans un compte d'épargne à faible taux et l'échelle se brise.",
      },
      {
        title: "Étape 5 : s'adapter aux régimes de taux",
        body:
          "En forte hausse des taux, raccourcissez temporairement les nouveaux achats (1–2 ans) pour pouvoir repricer rapidement. En forte baisse, étendez à 5 ans pour verrouiller le taux élevé d'aujourd'hui.",
      },
      {
        title: "Étape 6 : envisager les FNB d'échelle obligataire",
        body:
          "RBC et BMO offrent des FNB obligataires à échéance cible (ZTM, RBEQ) qui se comportent comme des obligations mais se négocient comme des actions. Ils donnent la mécanique d'échelle avec une liquidité quotidienne, au coût d'un certain RFG.",
      },
    ],
    whyItWorks:
      "Vous ne pouvez pas prévoir les taux, mais vous pouvez structurer autour de votre ignorance. Une échelle garantit qu'un échelon arrive toujours à échéance — vous n'êtes jamais forcé de vendre à perte ni de réinvestir tout le portefeuille à un mauvais taux.",
    links: [
      { title: "Investopedia — Bond Ladder (anglais)", url: "https://www.investopedia.com/terms/b/bondladder.asp" },
      { title: "Canada.ca — CPG", url: "https://www.canada.ca/fr/agence-consommation-matiere-financiere/services/epargne-investissements/certificats-placement-garanti.html" },
      { title: "SADC — Protection de vos dépôts", url: "https://www.sadc.ca/votre-couverture/proteger-votre-depot/" },
    ],
  },

  barbellStrategy: {
    label: "Barbell Strategy (Stratégie haltère)",
    summary: "Concentrer les avoirs à deux extrêmes — actifs à très court terme très sûrs et actifs à long terme plus risqués — avec peu au milieu.",
    description:
      "La stratégie haltère, popularisée par Nassim Nicholas Taleb, alloue le capital aux deux extrémités du spectre de risque tout en évitant le milieu. En revenu fixe, cela signifie des obligations ou CPG à court terme (1–2 ans) plus des obligations à long terme (20–30 ans), en sautant les échéances intermédiaires. Dans un contexte de portefeuille plus large, cela signifie détenir des actifs très sûrs (liquidités, CPG, obligations gouvernementales à court terme) aux côtés d'actifs agressifs (actions, paris de type capital-risque), sans positions équilibrées ou modérées. La logique : l'extrémité sûre protège contre les pertes catastrophiques tandis que l'extrémité agressive capte les gains exceptionnels — et le milieu n'offre ni protection ni croissance significative.",
    whenToUse:
      "Utilisez la stratégie haltère lorsque vous voulez une séparation nette entre votre filet de sécurité et votre moteur de croissance. Elle convient aux investisseurs à l'aise avec une approche binaire et qui résistent à l'envie d'ajouter des positions « modérées ». C'est particulièrement utile lorsque les courbes de rendement sont plates ou inversées, rendant les obligations intermédiaires peu attrayantes par rapport à leur risque.",
    prosAndCons:
      "Avantages : allocation de risque explicite (vous savez exactement ce qui est sûr et ce qui ne l'est pas), l'extrémité courte fournit liquidité et optionnalité pour redéployer le capital, et l'extrémité longue bénéficie de la convexité ou de la hausse des actions. Inconvénients : manque les occasions à terme intermédiaire, nécessite un rééquilibrage actif à mesure que les échelons arrivent à échéance ou que les actions dérivent, peut sembler psychologiquement inconfortable de détenir des extrêmes, et la stratégie sous-performe si les actifs intermédiaires offrent le meilleur rendement ajusté au risque.",
    coreIdea:
      "Protégez ce que vous ne pouvez pas vous permettre de perdre, puis prenez du vrai risque avec le reste. Le milieu vous donne le pire des deux mondes.",
    steps: [
      {
        title: "Étape 1 : définir le capital « sûr »",
        body:
          "Sûr = argent que vous ne pouvez absolument pas perdre : fonds d'urgence (3–6 mois de dépenses), objectifs à court terme (1–3 ans), plancher de retraite. Dans des CELI de liquidités, CPG rachetables ou FNB de bons du Trésor à court terme (CBIL, XSB).",
      },
      {
        title: "Étape 2 : définir le capital « à risque »",
        body:
          "À risque = argent dont la perte ne changerait pas votre mode de vie. C'est là que vous prenez de vrais paris : actions, titres de croissance, positions concentrées, éventuellement crypto ou investissements de type capital-risque. Acceptez qu'une partie puisse aller à zéro.",
      },
      {
        title: "Étape 3 : sauter le milieu",
        body:
          "Pas de fonds 60/40 « modérés », pas de portefeuilles équilibrés. Le milieu vous donne des baisses de type actions avec des rendements de type obligations. Soit sûr, soit risqué — rien entre les deux.",
      },
      {
        title: "Étape 4 : dimensionner les deux extrémités",
        body:
          "Formulation classique de Taleb : 80–90 % sûr, 10–20 % risqué (avec le risqué hautement asymétrique à la hausse). Version modérée : 60 % sûr, 40 % actions de forte conviction. Adaptez à votre plancher personnel.",
      },
      {
        title: "Étape 5 : rééquilibrer sur les grands mouvements",
        body:
          "Si l'extrémité risquée triple, rééquilibrez des gains partiels vers l'extrémité sûre pour verrouiller une sécurité permanente. Si elle chute brutalement, envisagez de déplacer une partie du capital sûr vers le risque — mais seulement si votre plancher reste intact.",
      },
      {
        title: "Étape 6 : protéger le plancher à tout prix",
        body:
          "Tout l'intérêt de l'haltère est que l'extrémité sûre est intouchable. Ne laissez jamais un pari risqué perdant saigner dans le capital sûr. Si cela arrive, la stratégie a échoué — vous n'avez plus de plancher.",
      },
    ],
    whyItWorks:
      "L'exposition à la hausse convexe (extrémité risquée) est mathématiquement précieuse. L'exposition au plancher (extrémité sûre) est psychologiquement précieuse. Les actifs à risque moyen ne vous donnent ni l'un ni l'autre — vous sous-performez les actifs sûrs en crise et les risqués en boom.",
    links: [
      { title: "Investopedia — Barbell Strategy (anglais)", url: "https://www.investopedia.com/terms/b/barbell.asp" },
      { title: "NerdWallet — Stratégie obligataire haltère (anglais)", url: "https://www.nerdwallet.com/article/investing/barbell-strategy" },
      { title: "Fidelity — Stratégies d'investissement obligataire (anglais)", url: "https://www.fidelity.com/learning-center/investment-products/fixed-income-bonds/bond-investment-strategies" },
    ],
  },

  assetAllocation: {
    label: "Asset Allocation & Rebalancing (Répartition d'actifs et rééquilibrage)",
    summary: "Fixer des pourcentages cibles pour les actions, les obligations et les autres actifs selon votre tolérance au risque, puis rééquilibrer périodiquement vers ces cibles.",
    description:
      "La répartition d'actifs est la décision fondamentale qui détermine la majeure partie du risque et du rendement de votre portefeuille : quel pourcentage va aux actions, au revenu fixe et aux autres catégories d'actifs. Un point de départ courant est votre âge en obligations (une personne de 30 ans détient 30 % d'obligations, 70 % d'actions), bien que les approches modernes soient plus nuancées. Le rééquilibrage est l'étape d'entretien : lorsque les mouvements du marché éloignent votre allocation réelle des cibles (p. ex., un rallye pousse les actions de 70 % à 80 %), vous vendez les gagnants et achetez les retardataires pour restaurer l'équilibre. Cela impose systématiquement « acheter bas, vendre haut ». Au Canada, les FNB tout-en-un (VBAL, VGRO, XEQT, XBAL) rééquilibrent automatiquement.",
    whenToUse:
      "Utilisez la répartition d'actifs comme première étape de tout plan d'investissement — décidez votre mix avant de choisir les instruments. Rééquilibrez annuellement ou lorsqu'une catégorie d'actifs s'écarte de plus de 5 points de pourcentage de sa cible. Le rééquilibrage calendaire (une fois par an, p. ex. le jour de votre anniversaire) est le plus simple. Les nouvelles cotisations peuvent aussi être dirigées vers la catégorie sous-pondérée, réduisant le besoin de vendre.",
    prosAndCons:
      "Avantages : discipline systématique qui élimine l'émotion, le rééquilibrage force un comportement à contre-courant (acheter ce qui a baissé), le mix est adapté à votre tolérance au risque personnelle et à votre horizon. Inconvénients : le rééquilibrage dans les comptes non enregistrés déclenche de l'impôt sur les gains en capital, choisir la « bonne » allocation est intrinsèquement subjectif, et dans les marchés haussiers prolongés, vendre les gagnants pour acheter des obligations semble contre-productif. Un rééquilibrage trop fréquent ajoute des coûts sans améliorer les rendements.",
    coreIdea:
      "Ce que vous détenez (mix actions vs obligations) compte plus que quelles actions ou obligations spécifiques vous détenez. Fixez le mix, puis défendez-le.",
    steps: [
      {
        title: "Étape 1 : évaluer votre tolérance au risque honnête",
        body:
          "Pas la réponse confortable — la vraie. Pourriez-vous voir 40 % de votre portefeuille disparaître en 2 mois sans rien faire ? Si non, plafonnez les actions à 60 %. Si oui, vous pouvez aller à 80–100 %.",
      },
      {
        title: "Étape 2 : fixer des pourcentages cibles",
        body:
          "Formule simple : 110 − âge = % en actions. 30 ans → 80 % actions / 20 % obligations. Ajustez ±10 % selon la tolérance au risque. Notez les cibles — c'est votre constitution.",
      },
      {
        title: "Étape 3 : choisir des instruments qui correspondent",
        body:
          "Poche actions : FNB larges (XEQT, VFV). Poche obligations : FNB obligataires larges (XBB, ZAG). Ou sautez cette étape avec un FNB tout-en-un (VBAL = 60/40, VGRO = 80/20) qui correspond à votre cible.",
      },
      {
        title: "Étape 4 : calculer les seuils de dérive",
        body:
          "Rééquilibrez quand une poche dérive de plus de 5 points de pourcentage de la cible (70 % actions → 75 % déclenche). Des seuils plus sensibles (3 %) ajoutent des coûts sans améliorer les résultats.",
      },
      {
        title: "Étape 5 : rééquilibrer à une date fixe",
        body:
          "Choisissez un jour par an (anniversaire, 2 janvier, date de déclaration fiscale). Vérifiez la dérive, rééquilibrez seulement si au-delà du seuil. Utilisez les nouvelles cotisations pour acheter d'abord la poche sous-pondérée — cela évite la vente et minimise l'impôt.",
      },
      {
        title: "Étape 6 : trajectoire de glissement vers la retraite",
        body:
          "5 à 10 ans avant la retraite, commencez à déplacer 1–2 % par an des actions vers les obligations. À la retraite, une allocation de 40–60 % en actions est courante. En début de retraite, remontez graduellement les actions (la « trajectoire ascendante » protège contre le risque de séquence de rendement).",
      },
    ],
    whyItWorks:
      "La recherche Brinson/Singer/Beebower suggère que ~90 % de la variabilité du rendement vient de la répartition d'actifs, pas de la sélection de titres. Le rééquilibrage « vend haut et achète bas » systématiquement sans exiger la moindre compétence de prévision du marché.",
    links: [
      { title: "Investopedia — Asset Allocation (anglais)", url: "https://www.investopedia.com/terms/a/assetallocation.asp" },
      { title: "Vanguard — Modèles de répartition d'actifs (anglais)", url: "https://investor.vanguard.com/investor-resources-education/education/model-portfolio-allocation" },
      { title: "Canadian Couch Potato — Rééquilibrage (anglais)", url: "https://canadiancouchpotato.com/rebalancing/" },
    ],
  },

  coreSatellite: {
    label: "Core-Satellite Strategy (Stratégie noyau-satellite)",
    summary: "Détenir un noyau indiciel diversifié à faible coût (70–80 % du portefeuille) et le compléter avec des positions satellites plus petites dans des secteurs, des thèmes ou des titres individuels.",
    description:
      "L'approche noyau-satellite divise votre portefeuille en deux niveaux. Le noyau (typiquement 70–80 %) est un portefeuille indiciel large et à faible coût — un FNB tout-en-un comme XEQT ou VGRO, ou un simple mix de 3 fonds (actions canadiennes, actions américaines, obligations). Les satellites (20–30 %) sont des positions plus petites où vous exprimez une conviction : un FNB technologique, une poignée d'actions à dividendes individuelles, un FNB de FPI, ou un secteur que vous pensez surperformer. Le noyau garantit que vous captez toujours les rendements du marché à faible coût, tandis que les satellites vous permettent de pencher vers des occasions sans mettre tout le portefeuille en danger.",
    whenToUse:
      "Utilisez la stratégie noyau-satellite lorsque vous voulez la fiabilité de l'investissement passif mais aimez aussi faire de la recherche et détenir des positions individuelles. C'est idéal pour les investisseurs intermédiaires qui ont maîtrisé les bases et veulent ajouter une dose mesurée de gestion active. Gardez les satellites assez petits pour qu'une perte totale d'une position n'affecte pas matériellement le portefeuille.",
    prosAndCons:
      "Avantages : combine le faible coût et la diversification de l'indiciel avec de la place pour des paris actifs de conviction, limite les dégâts des mauvais choix à une petite allocation, et maintient les frais globaux bas. Inconvénients : les choix satellites peuvent sous-performer le noyau (la plupart des choix actifs le font sur la durée), ajoute de la complexité et un effort de suivi, et la tentation d'étendre la portion satellite au-delà de 20–30 % peut éroder les avantages de la stratégie.",
    coreIdea:
      "Garantissez le rendement du marché sur 80 % de votre argent, puis amusez-vous avec 20 %. Laissez le noyau faire le travail ; laissez les satellites gratter la démangeaison.",
    steps: [
      {
        title: "Étape 1 : construire le noyau d'abord (70–80 %)",
        body:
          "Commencez avec un FNB tout-en-un ou un mix de 3 fonds à 100 % de votre portefeuille pendant la première année. N'ajoutez des satellites qu'une fois le noyau pleinement financé et après avoir vécu au moins une petite correction.",
      },
      {
        title: "Étape 2 : plafonner les satellites à 20–30 %",
        body:
          "Notez le plafond dans votre plan d'investissement. Le mode d'échec le plus courant est « juste une position de plus » jusqu'à ce que les satellites deviennent 50 %+ du portefeuille et détruisent le bénéfice de diversification.",
      },
      {
        title: "Étape 3 : définir les catégories de satellites",
        body:
          "Trois compartiments courants : (1) FNB sectoriels/thématiques (tech, santé, énergies propres), (2) inclinaisons factorielles (petite cap valeur, qualité, momentum), (3) actions individuelles à forte conviction. Choisissez 2–5 satellites au total — plus dilue la conviction.",
      },
      {
        title: "Étape 4 : dimensionner les satellites par conviction, pas par enthousiasme",
        body:
          "Maximum 5 % par satellite en action unique, 10 % par FNB satellite. Si un satellite triple et dépasse son plafond, ramenez-le à la cible — c'est de l'alpha verrouillé.",
      },
      {
        title: "Étape 5 : comparer les satellites au noyau chaque trimestre",
        body:
          "Tous les 3 mois, comparez le rendement de chaque satellite à celui du noyau. Un satellite qui sous-performe sur 3 années complètes n'est pas un satellite — c'est un frein. Remplacez ou vendez.",
      },
      {
        title: "Étape 6 : ne jamais toucher au noyau pour financer un satellite",
        body:
          "Financez les nouveaux satellites à partir de nouvelles cotisations, pas en vendant le noyau. Vendre le noyau signifie augmenter le risque pour poursuivre une idée — exactement l'erreur que noyau-satellite est conçu pour prévenir.",
      },
    ],
    whyItWorks:
      "Le noyau garantit que vous n'êtes pas catastrophiquement dans l'erreur — vous égalerez toujours le marché sur 70–80 % du capital. Les satellites plafonnent le risque de gestion active à 20–30 %, donc même une perte totale de satellite ne coûte qu'une fraction du portefeuille.",
    links: [
      { title: "Investopedia — Core-Satellite Investing (anglais)", url: "https://www.investopedia.com/terms/c/coreplus.asp" },
      { title: "Morningstar — Approche noyau-satellite (anglais)", url: "https://www.morningstar.com/investing-definitions/core-satellite" },
      { title: "BlackRock — Construction de portefeuille (anglais)", url: "https://www.blackrock.com/ca/investors/en/strategies/core-satellite-investing" },
    ],
  },

  momentumInvesting: {
    label: "Momentum Investing (Investissement momentum)",
    summary: "Acheter les actifs en hausse et vendre ceux en baisse, en pariant que les tendances récentes se poursuivront.",
    description:
      "Le Momentum Investing exploite l'observation empirique que les actifs ayant bien performé au cours des 3 à 12 derniers mois tendent à continuer de surperformer à court terme, et inversement. La base académique a été établie par Jegadeesh et Titman (1993), et le momentum a été l'un des facteurs de risque les plus robustes et persistants en recherche financière. En pratique, la plupart des investisseurs particuliers accèdent au momentum via des FNB factoriels plutôt que par la sélection manuelle d'actions, car la stratégie nécessite une rotation élevée et un rééquilibrage discipliné. Le momentum fonctionne à travers les catégories d'actifs — actions, obligations, devises, matières premières.",
    whenToUse:
      "Utilisez le momentum comme inclinaison factorielle au sein d'un portefeuille diversifié, typiquement via un FNB momentum, plutôt que comme stratégie autonome. Il fonctionne mieux lorsqu'il est combiné avec d'autres facteurs (valeur, qualité, faible volatilité) pour diversifier l'exposition factorielle. Le momentum pur n'est pas recommandé pour la sélection manuelle d'actions par la plupart des investisseurs particuliers en raison de la rotation élevée et des retournements brusques impliqués.",
    prosAndCons:
      "Avantages : historiquement l'un des facteurs de risque les plus forts et les plus persistants, capte le comportement de tendance systématiquement, et les FNB factoriels le rendent accessible. Inconvénients : sujet à des retournements soudains et sévères (« crashes de momentum »), la rotation élevée génère des coûts de transaction et de l'impôt sur les gains en capital à court terme, le moment d'entrée et de sortie est critique, et le momentum comme facteur autonome peut connaître des baisses de plusieurs années.",
    indicatorsUsed: ["Rendement sur 12 mois (glissant)", "Rendement sur 6 mois", "Moyenne mobile 200 jours", "Force relative vs indice"],
    coreIdea:
      "Ce qui monte tend à continuer de monter pendant un certain temps. Suivez la tendance, sortez quand elle se brise — ne prédisez pas les sommets.",
    steps: [
      {
        title: "Étape 1 : décider — FNB ou choix manuels ?",
        body:
          "Pour la plupart des investisseurs, un FNB momentum (MTUM aux É.-U., XMU ou ZMU au Canada) est la bonne réponse — vous obtenez le facteur sans le travail de rotation. N'allez manuel que si vous aimez la recherche et pouvez tenir la mécanique.",
      },
      {
        title: "Étape 2 : définir la fenêtre de momentum (manuel)",
        body:
          "Définition académique standard : classer les actions par leur rendement sur 12 mois en excluant le mois le plus récent (momentum 12-1). Acheter le décile supérieur, tenir 1–3 mois, rééquilibrer. Exclure le dernier mois évite les retournements à court terme.",
      },
      {
        title: "Étape 3 : appliquer un filtre de tendance",
        body:
          "Ne passez long que lorsque l'indice large est au-dessus de sa moyenne mobile 200 jours. Le momentum fonctionne brillamment dans les marchés en tendance et s'écrase dans ceux qui oscillent/se retournent. Ce seul filtre élimine la plupart des pires baisses.",
      },
      {
        title: "Étape 4 : fixer des règles de sortie strictes",
        body:
          "Sortez de toute position qui passe sous sa MM50, ou dont le classement momentum 12-1 sort de la moitié supérieure. Pas de réflexion, pas de « peut-être ça va rebondir » — le momentum échoue quand on hésite.",
      },
      {
        title: "Étape 5 : dimensionner les positions également, pas par conviction",
        body:
          "Le momentum est statistique, pas narratif. Ne surpondérez pas un nom parce que vous aimez l'histoire — ce n'est pas comme ça que le facteur fonctionne. Équipondérez 10–20 positions.",
      },
      {
        title: "Étape 6 : accepter les crashes de momentum",
        body:
          "Tous les 5 à 10 ans, le momentum connaît un retournement violent (Q2 2009, mars 2020). Des baisses de 20–30 % en quelques semaines font partie du facteur. Si vous ne pouvez pas tenir à travers ça, utilisez un FNB ou sautez le momentum.",
      },
    ],
    whyItWorks:
      "Des biais comportementaux (ancrage, sous-réaction aux nouvelles, comportement grégaire) maintiennent les prix en tendance plus longtemps que la théorie des marchés efficients ne le prédit. Le momentum est l'exploitation systématique de cette réaction lente.",
    links: [
      { title: "Investopedia — Momentum Investing (anglais)", url: "https://www.investopedia.com/terms/m/momentum_investing.asp" },
      { title: "AQR — Recherche sur le facteur momentum (anglais)", url: "https://www.aqr.com/Insights/Research/Journal-Article/Fact-Fiction-and-Momentum-Investing" },
      { title: "MSCI — Indice facteur momentum (anglais)", url: "https://www.msci.com/msci-momentum-indexes" },
    ],
  },

  contrarianInvesting: {
    label: "Contrarian Investing (Investissement à contre-courant)",
    summary: "Aller à l'encontre du sentiment dominant — acheter quand les autres ont peur, vendre quand les autres sont avides — en supposant que la foule exagère.",
    description:
      "L'investissement à contre-courant repose sur l'observation que le sentiment du marché oscille vers les extrêmes : la panique pousse les prix en dessous de la valeur intrinsèque, et l'euphorie les pousse au-dessus. Les investisseurs à contre-courant achètent délibérément des actifs largement détestés, négligés ou en crise, et vendent ou évitent ceux qui sont populaires et chers. Le célèbre conseil de Warren Buffett — « soyez avide quand les autres sont craintifs » — en capture l'essence. Des indicateurs de sentiment comme le VIX (indice de la peur), les ratios put/call, les données de flux de fonds et les sondages d'investisseurs aident à identifier le pessimisme ou l'optimisme extrême. Il y a un chevauchement important avec le Value Investing lors des krachs boursiers.",
    whenToUse:
      "Utilisez l'investissement à contre-courant lors des corrections du marché, des krachs sectoriels, ou lorsque les indicateurs de sentiment atteignent un pessimisme extrême. Cela exige une forte conviction, une analyse indépendante et un horizon long — vous serez en avance, et être en avance ressemble exactement à avoir tort. Cette stratégie convient mieux aux investisseurs expérimentés qui peuvent distinguer la panique temporaire de la détérioration fondamentale réelle.",
    prosAndCons:
      "Avantages : achète à des rabais créés par la foule, historiquement récompensé sur des cycles de marché complets, et force une analyse fondamentale disciplinée. Inconvénients : risque extrême d'« attraper un couteau qui tombe » — les actifs peuvent continuer à baisser longtemps après votre achat, émotionnellement très difficile d'agir contre le consensus, peut sous-performer pendant de longues périodes en attendant que la foule revienne, et nécessite la compétence de séparer la panique du déclin structurel.",
    indicatorsUsed: ["VIX (indice de la peur)", "Ratio put/call", "Sondage de sentiment AAII", "Flux de fonds", "Nombre de plus bas 52 semaines"],
    coreIdea:
      "La foule a raison pendant la tendance et tort aux tournants. Achetez ce que tout le monde déteste ; vendez ce que tout le monde aime.",
    steps: [
      {
        title: "Étape 1 : surveiller les extrêmes de sentiment, pas seulement le prix",
        body:
          "VIX > 30 (peur), AAII baissier > 50 % (capitulation), sorties de fonds à des plus hauts pluriannuels — ce sont les setups. Une baisse de 20 % avec un sentiment toujours complaisant n'est pas encore une occasion.",
      },
      {
        title: "Étape 2 : distinguer la panique du déclin",
        body:
          "Panique = pessimisme généralisé + fondamentaux intacts + vente forcée. Déclin = détérioration d'entreprise + ventes d'initiés + consommation de trésorerie. La première est une opportunité ; le second est un piège. Consultez le 10-K, pas le graphique.",
      },
      {
        title: "Étape 3 : construire une liste de courses AVANT le krach",
        body:
          "Pendant les marchés calmes, notez les entreprises de qualité que vous voudriez posséder si elles étaient 30–50 % moins chères. Quand la panique frappe, la liste vous dit quoi faire — vous n'avez pas à réfléchir, juste à exécuter.",
      },
      {
        title: "Étape 4 : acheter en tranches, pas d'un coup",
        body:
          "Divisez votre capital à contre-courant en 3–4 tranches. Déployez-en une quand la peur pointe, une autre sur une capitulation confirmée (forte baisse à gros volume), une troisième sur un faux rallye qui s'inverse. Gardez-en une en réserve — les paniques deviennent pires que prévu.",
      },
      {
        title: "Étape 5 : ignorer les manchettes après avoir acheté",
        body:
          "Les pires jours d'achat semblent apocalyptiques. Les médias financiers seront uniformément baissiers. C'est la caractéristique, pas le bug. Si vous attendez de bonnes nouvelles avant d'acheter, vous paierez 40 % de plus.",
      },
      {
        title: "Étape 6 : vendre dans l'avidité, pas dans la force",
        body:
          "L'inverse s'applique aussi. Quand les mêmes actifs sont aimés de tous, les valorisations étirées et les médias haussiers — commencez à réduire. Vous n'attraperez pas le sommet, et c'est bien.",
      },
    ],
    whyItWorks:
      "Les marchés sont efficients en moyenne mais se trompent aux extrêmes. Quand tout le monde a déjà vendu, il ne reste personne pour vendre ; quand tout le monde a déjà acheté, il ne reste personne pour acheter. Les tournants sont des trades encombrés qui se dénouent.",
    links: [
      { title: "Investopedia — Contrarian Investing (anglais)", url: "https://www.investopedia.com/terms/c/contrarian.asp" },
      { title: "Howard Marks — Mémos Oaktree (anglais)", url: "https://www.oaktreecapital.com/insights/memos" },
      { title: "Morningstar — Approche à contre-courant (anglais)", url: "https://www.morningstar.com/investing-definitions/contrarian-investing" },
    ],
  },

  trendPullback: {
    label: "Stratégie de repli sur tendance (EMA + RSI + VWAP)",
    summary: "Attendre une tendance claire, un repli vers un support dynamique, puis une bougie de confirmation avant de rejoindre la tendance. Utilisée par les traders swing et intraday pour éviter d'acheter les sommets et de vendre les creux.",
    description:
      "La stratégie de repli sur tendance est une approche disciplinée, guidée par des indicateurs, pour suivre les tendances existantes plutôt que de courir après le prix. Elle combine un filtre de tendance (EMA 20 et EMA 50), un outil de timing (RSI 14) et un prix de référence institutionnel (VWAP pour l'intraday). La stratégie refuse délibérément de trader les marchés oscillants et sans tendance — là où la plupart des débutants perdent de l'argent. Les entrées ne se produisent qu'après une triple confirmation : tendance claire + repli + bougie de retournement. Elle fonctionne à la fois sur les graphiques journaliers (swing) et intraday (day-trade), et sur les instruments liquides (FNB indiciels, grandes capitalisations, paires de devises majeures).",
    whenToUse:
      "Utilisez le repli sur tendance quand l'instrument est clairement en tendance (ADX > 20 est un bon test de cohérence), l'action des prix est liquide (pas de microcaps illiquides), et que vous pouvez attendre patiemment le setup. Convient mieux aux trades swing (jours à semaines) avec EMA 20/50 sur bougies journalières, ou intraday avec VWAP comme ancrage. Sautez-la sur les marchés oscillants en range — la stratégie va fouetter et faire mal.",
    prosAndCons:
      "Avantages : setups à haute probabilité car vous exigez trois confirmations indépendantes (tendance, repli, retournement), placement de stop-loss bien défini (sous le creux), s'associe à des règles claires de risque/rendement, fonctionne sur plusieurs horizons. Inconvénients : vous manquez les mouvements les plus forts (ceux qui ne se replient jamais), beaucoup de setups qui « presque » se déclenchent mais ne le font pas, exige patience et discipline, échoue en régime oscillant, et la version intraday demande un temps d'écran actif.",
    indicatorsUsed: ["EMA 20 (tendance court terme)", "EMA 50 (filtre de tendance)", "RSI (14) (timing/momentum)", "VWAP (ancrage intraday)", "Canaux de Keltner (support dynamique basé sur l'ATR au pullback)", "Aroon ou Vortex (confirmation de la force de tendance)", "Trend Intensity Index (filtre de régime — on évite les trades quand le TII est faible)"],
    coreIdea:
      "Vous ne courez pas après le prix. Vous attendez une tendance claire, puis un repli, puis une confirmation pour rejoindre la tendance.",
    steps: [
      {
        title: "Étape 1 : identifier la tendance",
        body:
          "Tendance haussière : prix au-dessus de l'EMA 50 ET EMA 20 au-dessus de l'EMA 50.\nTendance baissière : prix sous l'EMA 50 ET EMA 20 sous l'EMA 50.\nSi aucune n'est vraie (EMA plates ou enchevêtrées), l'instrument n'est pas en tendance — ne faites rien. C'est là que la plupart des gens perdent de l'argent : essayer de forcer un trade sur un graphique latéral.",
      },
      {
        title: "Étape 2 : attendre un repli",
        body:
          "En tendance haussière : le prix recule vers l'EMA 20 ou le VWAP, et le RSI descend vers la zone 40–50 (PAS sous 30 — vous ne voulez pas une survente extrême, vous voulez un repli normal dans une tendance haussière).\nEn tendance baissière : le prix rallie vers l'EMA 20 ou le VWAP, et le RSI monte vers la zone 50–60.\nCela évite d'acheter les sommets et de vendre les creux.",
      },
      {
        title: "Étape 3 : déclencheur d'entrée (confirmation)",
        body:
          "N'entrez pas aveuglément sur l'EMA. Attendez les trois :\nPour un ACHAT (tendance haussière) :\n• Le prix tient au-dessus de l'EMA 20 ou du VWAP (touche et rebond, pas cassure)\n• Le RSI repart à la hausse (p. ex. de ~45 → 50+)\n• Une bougie haussière se forme (clôture plus haute, idéalement un marteau ou un englobement haussier)\nPour une VENTE (tendance baissière) :\n• Le prix rejette l'EMA 20 ou le VWAP par en dessous\n• Le RSI repart à la baisse\n• Confirmation par bougie baissière (clôture plus basse, englobement baissier)",
      },
      {
        title: "Étape 4 : placer votre stop-loss",
        body:
          "Simple et mécanique :\n• Pour les achats : stop sous le dernier creux (le creux du repli que vous venez d'acheter)\n• Pour les ventes : stop au-dessus du dernier sommet\nCela place le stop là où votre thèse est invalidée — si le prix y revient, la tendance se brise.",
      },
      {
        title: "Étape 5 : prendre le profit",
        body:
          "Trois approches courantes, choisissez-en une et tenez-vous-y :\n• R:R fixe — prenez le profit à 2× la distance du stop (p. ex. stop 1 %, cible 2 %). Objectif et fiscalement efficace.\n• Sortie par structure — réduisez près du dernier sommet/creux.\n• Sortie par momentum — sortez quand le RSI atteint un extrême (70+ pour les longs, 30− pour les shorts).\nMélanger les méthodes en cours de trade est le chemin le plus rapide vers les sorties émotionnelles.",
      },
      {
        title: "Étape 6 : journaliser le trade",
        body:
          "Pour chaque trade, enregistrez : setup (direction de la tendance), entrée (prix, RSI, relation au VWAP), stop, cible, résultat, leçon. Après 30–50 trades, passez en revue : quel filtre (EMA, RSI, VWAP) contribue le plus aux gagnants ? C'est là que vit réellement votre edge.",
      },
    ],
    whyItWorks:
      "L'EMA définit la tendance (réduit le bruit aléatoire). Le RSI évite le mauvais timing (vous n'achetez pas quand tout le monde vient d'acheter). Le VWAP vous aligne avec le prix institutionnel (pupitres et algos exécutent autour du VWAP). Ensemble, les trois filtres éliminent les trois plus grosses erreurs de débutant : trader les marchés oscillants, entrées émotionnelles, et courir après les mouvements tardifs.",
    links: [
      { title: "Investopedia — EMA (Moyenne mobile exponentielle) (anglais)", url: "https://www.investopedia.com/terms/e/ema.asp" },
      { title: "Investopedia — Relative Strength Index (RSI) (anglais)", url: "https://www.investopedia.com/terms/r/rsi.asp" },
      { title: "Investopedia — Volume-Weighted Average Price (VWAP) (anglais)", url: "https://www.investopedia.com/terms/v/vwap.asp" },
      { title: "StockCharts — Suivi de tendance avec moyennes mobiles (anglais)", url: "https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-overlays/moving-averages-ema-sma-wma" },
    ],
  },

  breakoutMomentum: {
    label: "Stratégie de cassure (momentum)",
    summary: "Acheter quand le prix sort d'un range défini avec force et volume. Capte le début de grands mouvements, mais exige de la discipline pour éviter les fausses cassures.",
    description:
      "Une stratégie de cassure entre sur le marché quand le prix quitte clairement une zone de consolidation — un range, un triangle, une résistance horizontale — signalant que l'offre et la demande ont basculé. Bien exécutée, elle capte très tôt les grands mouvements de tendance. Mal exécutée, elle fait acheter les sommets. L'art consiste à définir le niveau clairement, à exiger une confirmation par le volume, et à décider d'avance si vous entrez sur la cassure ou si vous attendez un retest.",
    whenToUse:
      "Utilisez les cassures sur des instruments liquides avec une structure de range claire — consolidation après une tendance, ranges serrés après une nouvelle digérée, figures techniques (triangles, drapeaux, tasses avec anse). Fonctionne mieux quand la volatilité implicite est basse (le range est sous tension) et qu'un catalyseur est attendu. Évitez les cassures sur des titres peu liquides où le mouvement peut être manipulé.",
    prosAndCons:
      "Avantages : capte le début de grands mouvements directionnels, règles claires, stop naturel (sous le niveau cassé), fonctionne sur toutes les échelles de temps. Inconvénients : les fausses cassures sont extrêmement fréquentes (surtout intraday), whipsaws dans les marchés à faible conviction, demande de la patience, risque/rendement mauvais si vous chassez loin du niveau.",
    indicatorsUsed: ["Support/résistance horizontale", "Canaux de Donchian (plus haut/plus bas sur N barres comme range)", "Volume (confirmation)", "Oscillateur de Volume, ligne A/D, CMF (qualité de la participation)", "Chaikin Volatility (contraction du range avant la cassure)", "ATR (taille du stop)", "RSI ou MACD (filtre de momentum facultatif)"],
    coreIdea:
      "Un prix qui casse un range serré avec un volume fort signale qu'un côté a gagné. Tradez dans le sens de la cassure, pas contre elle.",
    steps: [
      {
        title: "Étape 1 : identifier un range clair",
        body:
          "Marquez visuellement les supports et résistances horizontaux sur au moins 5–10 bougies de consolidation. Plus le range est propre et plat, plus la cassure sera significative. Ignorez les ranges confus, inclinés ou étroits — ils produisent du bruit, pas des signaux.",
      },
      {
        title: "Étape 2 : attendre la cassure",
        body:
          "N'anticipez pas. Attendez que le prix clôture au-dessus de la résistance (pour un long) ou sous le support (pour un short). En intraday, exigez que la cassure tienne au moins une bougie complète ; en swing, exigez une clôture journalière au-delà du niveau.",
      },
      {
        title: "Étape 3 : confirmer la force",
        body:
          "Une vraie cassure a deux signatures :\n• Une bougie forte (corps large, peu de mèche contre le sens de la cassure)\n• Un volume clairement au-dessus de la moyenne récente (souvent 1,5–2× la moyenne 20 bougies)\nPas de volume = probablement une fausse cassure. Passez votre tour.",
      },
      {
        title: "Étape 4 : entrer sur cassure ou sur retest",
        body:
          "Deux entrées valables, choisissez-en une :\n• Entrée sur cassure — achetez à la clôture de la bougie de cassure. Capte le mouvement tôt mais paie un moins bon prix.\n• Entrée sur retest — attendez que le prix revienne au niveau cassé et tienne. Meilleur prix, meilleur R:R, mais vous manquerez les cassures qui ne reviennent jamais.\nBeaucoup de professionnels privilégient le retest pour filtrer les faux signaux.",
      },
      {
        title: "Étape 5 : placer le stop sous le niveau",
        body:
          "Pour les longs : stop juste sous la résistance cassée (qui agit maintenant comme support). Pour les shorts : stop juste au-dessus du support cassé. Si le prix rentre dans le range, la cassure a échoué — sortez sans hésiter.",
      },
      {
        title: "Étape 6 : gérer le trade",
        body:
          "Cibles classiques : 1× la hauteur du range (mouvement mesuré) pour une sortie conservatrice, 2–3× pour les runners. Remontez le stop sous chaque nouveau creux (pour les longs) à mesure que le mouvement s'étend. Ne rendez pas un gros profit ouvert en espérant plus.",
      },
    ],
    whyItWorks:
      "Les ranges accumulent des ordres en attente des deux côtés (stops au-dessus des résistances, stops sous les supports). Quand le prix casse, ces stops se déclenchent et alimentent le mouvement — une poussée auto-renforçante. Exiger du volume et une bougie propre filtre les tests de faible conviction des teneurs de marché.",
    links: [
      { title: "Investopedia — Breakout (anglais)", url: "https://www.investopedia.com/terms/b/breakout.asp" },
      { title: "StockCharts — Figures graphiques et cassures (anglais)", url: "https://chartschool.stockcharts.com/table-of-contents/chart-analysis/chart-patterns" },
    ],
  },

  meanReversion: {
    label: "Retour à la moyenne (RSI / Bandes de Bollinger)",
    summary: "Contrer les mouvements extrêmes — acheter la survente, vendre la surachat — en supposant que le prix retourne vers sa moyenne. Haut taux de réussite en range ; dangereux en tendance forte.",
    description:
      "Le retour à la moyenne est le cousin statistique de l'investissement contrarien appliqué au niveau des indicateurs. L'hypothèse : après une déviation extrême par rapport à une moyenne mobile, le prix a tendance à revenir. Le plus souvent implémenté avec le RSI entrant en zone surachat/survente, ou les bandes de Bollinger étirées au-delà de leur enveloppe habituelle. La stratégie récompense la patience et des sorties strictes, et punit quiconque l'utilise aveuglément dans un marché en tendance.",
    whenToUse:
      "Utilisez le retour à la moyenne sur des instruments en régime de range clair — pas de tendance directionnelle forte, ADX stable sous 20, supports/résistances bien définis. Fonctionne mieux sur les indices, les grandes capitalisations et les paires FX majeures en période de faible volatilité. Évitez-le pendant la saison des résultats pour les titres individuels et sur tout ce qui a un catalyseur directionnel fort.",
    prosAndCons:
      "Avantages : taux de réussite élevé (souvent 60–70 %), entrées et sorties bien définies, règles simples, excellent dans les marchés oscillants où les cassures échouent. Inconvénients : le gain moyen est plus petit que la perte moyenne (un grand mouvement de tendance peut effacer beaucoup de petits gains), dangereux en tendance (« la survente devient plus survendue »), exige une lecture de régime.",
    indicatorsUsed: ["RSI (14)", "Bandes de Bollinger (20, 2σ)", "Bollinger %B (normalisé)", "Z-Score du prix (|Z| > 2)", "Canaux de Keltner (alternative basée sur l'ATR)", "ADX (filtre de régime)", "Exposant de Hurst (H < 0,5 = régime de retour à la moyenne)", "Moyenne mobile 20"],
    coreIdea:
      "Les mouvements extrêmes s'épuisent. Acheter la peur, vendre la cupidité — mais seulement quand le marché oscille, jamais en tendance forte.",
    steps: [
      {
        title: "Étape 1 : confirmer un régime de range",
        body:
          "Avant de regarder le RSI ou les bandes de Bollinger, vérifiez l'ADX. Si l'ADX > 25, l'instrument est en tendance — évitez le retour à la moyenne. Les bandes de Bollinger devraient être relativement plates et parallèles. Trader la moyenne dans une tendance forte est le moyen le plus rapide de perdre.",
      },
      {
        title: "Étape 2 : repérer les extrêmes",
        body:
          "Setup long : RSI sous 30 ET le prix touche ou clôture sous la bande inférieure.\nSetup short : RSI au-dessus de 70 ET le prix touche ou clôture au-dessus de la bande supérieure.\nExiger les deux filtres évite les faux signaux — le RSI seul se déclenche trop souvent.",
      },
      {
        title: "Étape 3 : attendre la bougie de retournement",
        body:
          "N'attrapez pas le couteau qui tombe. Attendez une bougie de retournement : marteau, englobement haussier, ou toute bougie qui clôture de retour dans la bande. Pour les shorts, attendez une étoile filante ou un englobement baissier. La bougie est votre « permission » d'entrer.",
      },
      {
        title: "Étape 4 : entrer avec un stop serré",
        body:
          "Entrez à la clôture de la bougie de confirmation ou à l'ouverture de la suivante. Stop : juste au-delà de l'extrême (bas pour long, haut pour short) de la bougie de retournement. Les stops sont serrés car si le prix pousse encore, le range se casse et la stratégie est invalide.",
      },
      {
        title: "Étape 5 : viser la moyenne",
        body:
          "Cible principale : la bande médiane (SMA 20) ou le RSI revenant à 50. Les traders conservateurs sortent là. Les agressifs laissent courir jusqu'à la bande opposée. Ne laissez pas un trade gagnant redevenir perdant — déplacez le stop à seuil de rentabilité dès que le prix atteint la moyenne.",
      },
      {
        title: "Étape 6 : suivre votre taux par régime",
        body:
          "Sur 30–50 trades, séparez vos résultats par régime (ADX à l'entrée). Vous verrez que l'edge de la stratégie se concentre dans les environnements à faible ADX. Cet audit vous protège de l'appliquer en tendance par habitude.",
      },
    ],
    whyItWorks:
      "Sur de courts horizons, les prix des actifs montrent un comportement statistiquement significatif de retour à la moyenne en régime de range — porté par les teneurs de liquidité, le rééquilibrage d'inventaire des market makers et la surréaction court terme au bruit. La stratégie exploite systématiquement cette tendance. L'edge disparaît (et s'inverse) quand une vraie tendance s'installe.",
    links: [
      { title: "Investopedia — Mean reversion (anglais)", url: "https://www.investopedia.com/terms/m/meanreversion.asp" },
      { title: "Investopedia — Bandes de Bollinger (anglais)", url: "https://www.investopedia.com/terms/b/bollingerbands.asp" },
      { title: "Investopedia — RSI (anglais)", url: "https://www.investopedia.com/terms/r/rsi.asp" },
    ],
  },

  maCrossover: {
    label: "Croisement de moyennes mobiles",
    summary: "Aller long quand une moyenne mobile courte croise au-dessus d'une moyenne longue ; short sur le croisement inverse. Simple, systématique, en retard — excellent filtre de tendance, faible déclencheur autonome.",
    description:
      "Un croisement de moyennes mobiles signale les changements de tendance en comparant deux moyennes de longueurs différentes. Le « golden cross » classique (EMA 50 croisant au-dessus de l'EMA 200) et le « death cross » (inverse) font partie du folklore du trading depuis des décennies. Comme les moyennes lissent le bruit, les croisements sont retardés par construction — ils confirment une tendance bien après son début et tardent sur les sorties. Utilisés seuls comme déclencheurs, ils se font hacher en marché latéral. Utilisés comme filtre combinés à une autre méthode d'entrée, c'est un edge robuste.",
    whenToUse:
      "Utilisez les croisements sur des instruments en tendance (indices, ETF sectoriels, leaders de momentum) pour du swing ou du position trading. Fonctionnent mieux en hebdomadaire ou journalier où le retard importe moins. Pattern très courant : utiliser le croisement 50/200 EMA comme filtre de régime (ne trader les longs qu'au-dessus du golden cross) et combiner avec un déclencheur plus rapide comme un repli ou une cassure.",
    prosAndCons:
      "Avantages : règles extrêmement simples, entièrement systématique (facile à automatiser et backtester), objectif, excellent comme filtre de tendance. Inconvénients : signaux en retard par construction, très mauvais en marché latéral (nombreux whipsaws), rend de gros morceaux sur les retournements, ne dit rien sur la taille de risque ou les cibles.",
    indicatorsUsed: ["EMA courte (p. ex. 20 ou 50)", "EMA longue (p. ex. 100 ou 200)", "Aroon (croisement Up/Down comme confirmation)", "Vortex (croisement +VI / −VI)", "Trend Intensity Index (filtre de régime)"],
    coreIdea:
      "Quand une moyenne rapide monte au-dessus d'une lente, le momentum court terme bat la moyenne long terme — un changement de tendance. Trader avec la pente.",
    steps: [
      {
        title: "Étape 1 : choisir vos deux moyennes",
        body:
          "Paires courantes : 9/21 EMA en intraday, 20/50 EMA en swing, 50/200 EMA en long terme. Les paires plus courtes sont plus réactives mais whipsaw plus ; les plus longues sont plus lentes mais plus propres. Choisissez-en une pour votre horizon et tenez-vous-y — tester toutes les combinaisons est du curve-fitting.",
      },
      {
        title: "Étape 2 : identifier le croisement",
        body:
          "Haussier (long) : l'EMA rapide croise au-dessus de la lente.\nBaissier (short ou cash) : l'EMA rapide croise sous la lente.\nExiger une clôture complète après le croisement — des mèches qui croisent ne sont pas un signal.",
      },
      {
        title: "Étape 3 : confirmer avec la structure des prix",
        body:
          "N'entrez pas sur le croisement seul. Vérifiez que le prix lui-même respecte l'EMA rapide (clôtures du bon côté) et que la pente des deux moyennes va dans le sens du croisement. Un croisement sur des moyennes plates et horizontales est presque toujours un faux signal.",
      },
      {
        title: "Étape 4 : entrer et poser un stop",
        body:
          "Entrez à la clôture de la bougie confirmatrice. Stop : sous l'EMA rapide (longs) ou au-dessus (shorts), plus un petit tampon (p. ex. 1× ATR) pour éviter d'être sorti sur du bruit. N'utilisez pas de stops trop serrés — les stratégies de moyenne ont besoin d'espace.",
      },
      {
        title: "Étape 5 : tenir tant que le régime tient",
        body:
          "Sortez uniquement sur un croisement inverse (rapide croise sous lente pour les longs) ou quand le prix casse nettement l'EMA lente. C'est un système de suivi de tendance — les overrides fréquents détruisent l'edge. Acceptez de rendre une partie du mouvement à chaque sortie.",
      },
      {
        title: "Étape 6 : utiliser comme filtre, pas seulement déclencheur",
        body:
          "Meilleur pattern pour la plupart des traders : utiliser le croisement 50/200 EMA comme filtre de régime (ne prendre que des longs en régime haussier, shorts en baissier) et utiliser un déclencheur plus rapide (repli, cassure, chandelier) pour les entrées. Cela réduit considérablement les whipsaws.",
      },
    ],
    whyItWorks:
      "Les moyennes mobiles encodent le chemin récent du prix en un signal lissé. Un croisement entre deux moyennes de longueurs différentes exige mathématiquement un changement de momentum dans la fenêtre plus courte. Ce changement corrèle avec les changements de régime de tendance — particulièrement sur les unités de temps élevées où le bruit est amorti et où le positionnement institutionnel entraîne des cycles plus lents.",
    links: [
      { title: "Investopedia — Golden Cross / Death Cross (anglais)", url: "https://www.investopedia.com/terms/g/goldencross.asp" },
      { title: "Investopedia — Moving Average Crossover (anglais)", url: "https://www.investopedia.com/terms/c/crossover.asp" },
      { title: "StockCharts — Moyennes mobiles (anglais)", url: "https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-overlays/moving-averages-ema-sma-wma" },
    ],
  },

  supportResistancePullback: {
    label: "Repli sur support/résistance",
    summary: "Après la cassure d'un niveau clé, attendre que le prix revienne dessus et trader le retest. Basé sur la psychologie de marché qui convertit une ancienne résistance en nouveau support.",
    description:
      "Cette stratégie exploite l'un des phénomènes les mieux observés en analyse technique : une fois un niveau significatif cassé, il a tendance à « basculer » et à agir de l'autre côté. Une ancienne résistance devient support ; un ancien support devient résistance. Le trade n'est pas pris sur la cassure elle-même — il est pris quand le prix revient sur le niveau cassé et confirme qu'il tient. Cela produit moins de trades, mais avec un risque/rendement plus clair et moins de fausses cassures.",
    whenToUse:
      "Utilisable sur tout instrument liquide avec des niveaux horizontaux ou des trendlines clairs touchés plusieurs fois. Particulièrement puissant autour des chiffres ronds psychologiques (100 $, milliers d'indice), des précédents plus hauts historiques ou des niveaux de gaps sur résultats. Fonctionne sur toutes les échelles de temps — plus l'UT est élevée, plus le retest est fiable.",
    prosAndCons:
      "Avantages : excellent risque/rendement (stop juste au-delà du niveau, cible potentiellement loin), filtre automatiquement beaucoup de fausses cassures, aligné avec le flux institutionnel (les desks bâtissent sur le retest), toutes classes d'actifs. Inconvénients : vous manquez les cassures qui ne reviennent jamais (souvent les plus fortes), le retest peut prendre des jours ou semaines, demande de la patience.",
    indicatorsUsed: ["Support/résistance horizontale", "Trendlines", "Volume (confirme le tenue)", "Figures de retournement en chandeliers"],
    coreIdea:
      "Les niveaux cassés inversent leur polarité à cause de la psychologie de marché. Attendez que le prix revienne et confirme, puis tradez avec un risque serré contre ce niveau.",
    steps: [
      {
        title: "Étape 1 : identifier un niveau significatif",
        body:
          "Repérez des niveaux horizontaux que le prix a respectés au moins 2–3 fois. Les anciens swing highs/lows, les ranges de consolidation, les bords de gap et les chiffres ronds qualifient. Plus il y a de touches avant la cassure, plus la bascule sera significative au retest.",
      },
      {
        title: "Étape 2 : attendre la cassure",
        body:
          "Laissez le prix casser le niveau avec une bougie forte et du volume. N'entrez PAS sur la cassure elle-même — cette stratégie attend explicitement. Marquez le niveau cassé et placez une alerte.",
      },
      {
        title: "Étape 3 : attendre le retest",
        body:
          "Le prix revient sur le niveau cassé. Cela peut arriver en quelques heures en intraday ou en jours/semaines sur les UT élevées. Soyez patient — si le retest n'arrive jamais, il n'y avait pas de trade. Acceptez ce résultat.",
      },
      {
        title: "Étape 4 : exiger un maintien et une bougie de confirmation",
        body:
          "Entrer aveuglément sur le niveau est imprudent. Attendez :\n• Que le prix touche et réagisse (mèche, rebond, stagnation) au niveau cassé\n• Une bougie de confirmation dans le sens de la cassure initiale (haussière pour un retest long, baissière pour un short)\n• Idéalement, du volume sur la bougie de confirmation au-dessus de la moyenne récente\nSi le prix traverse le niveau sans résistance, la bascule a échoué — pas de trade.",
      },
      {
        title: "Étape 5 : entrer avec un stop serré",
        body:
          "Entrez à la clôture de la bougie de confirmation. Stop juste au-delà du niveau (sous pour un long, au-dessus pour un short), avec un petit tampon. C'est l'un des grands avantages de la stratégie : le stop est mécanique et petit, produisant un excellent R:R.",
      },
      {
        title: "Étape 6 : viser le prochain niveau structurel",
        body:
          "Cibles naturelles : la prochaine résistance horizontale (long), le prochain support (short), ou un mouvement mesuré à partir de la taille du range précédent. Remontez le stop sous chaque nouveau swing à mesure que le mouvement s'étend. Prenez un partiel à la première cible et laissez courir un runner.",
      },
    ],
    whyItWorks:
      "Quand un niveau casse, les traders short sur la résistance couvrent leurs pertes ; ceux qui ont manqué la cassure attendent un repli pour rejoindre ; les institutions bâtissent sur le retest. Ces trois flux convergent sur le niveau basculé — créant le comportement auto-renforçant que la stratégie exploite. L'exigence d'une bougie de confirmation filtre les cas où la bascule échoue et laisse les gagnants se dérouler proprement.",
    links: [
      { title: "Investopedia — Supports et résistances (anglais)", url: "https://www.investopedia.com/trading/support-and-resistance-basics/" },
      { title: "Investopedia — Retest (anglais)", url: "https://www.investopedia.com/terms/r/retest.asp" },
    ],
  },

  openingRangeBreakout: {
    label: "Cassure de range d'ouverture (day trading)",
    summary: "Définir un range sur les 5–30 premières minutes de la séance et trader la cassure de ce range. Simple, règles claires, populaire chez les day traders actifs.",
    description:
      "L'Opening Range Breakout (ORB) utilise le haut et le bas des premières minutes de la séance comme cadre de référence pour la journée. La théorie : les 5–30 premières minutes capturent la digestion de l'information overnight, et une fois que le prix quitte clairement ce range, le flux directionnel pour la séance a plus de chances de continuer. L'ORB a été popularisé par des traders comme Toby Crabel et reste très utilisé sur les actions américaines à fort volume et les futures d'indice.",
    whenToUse:
      "Utilisable sur des instruments liquides qui gappent ou ont des catalyseurs overnight — grandes capitalisations avec nouvelle, futures d'indice majeurs (ES/NQ), ETF à fort volume (SPY, QQQ). Meilleur les jours avec volume pré-marché supérieur à la moyenne et narrative overnight claire. Évitez les instruments peu liquides et les journées calmes — les cassures deviennent du bruit.",
    prosAndCons:
      "Avantages : très simple, règles claires, fonctionne intraday quand on voit le range se former, stops et cibles objectifs, adapté à l'automatisation. Inconvénients : ne fonctionne que durant les heures d'ouverture, vulnérable aux fausses cassures sur journées molles, peut sous-performer en faible volatilité, demande une attention active durant une fenêtre étroite.",
    indicatorsUsed: ["Haut/bas du range d'ouverture (5/15/30 min)", "Volume (confirmation)", "ATR ou range de la veille (taille)"],
    coreIdea:
      "Les premières minutes de la séance définissent un range de référence. Quand le prix le casse avec force, le reste de la journée tend à suivre cette direction.",
    steps: [
      {
        title: "Étape 1 : définir votre fenêtre d'ouverture",
        body:
          "Choisissez une fenêtre fixe et tenez-vous-y. Choix courants : 5 premières minutes (agressif), 15 minutes (équilibré), 30 minutes (conservateur). Les fenêtres plus courtes donnent des entrées plus précoces et plus de trades mais plus de bruit. Ne changez pas de fenêtre au feeling — vous ferez du curve-fitting en temps réel.",
      },
      {
        title: "Étape 2 : marquer le haut et le bas du range",
        body:
          "À la fin de votre fenêtre, notez le haut et le bas exacts. Ce sont vos deux niveaux de déclenchement pour le reste de la séance. Certains traders notent aussi la taille du range — s'il est déjà plus grand que la moyenne ATR journalière, le setup est probablement épuisé.",
      },
      {
        title: "Étape 3 : attendre la cassure",
        body:
          "Déclencheur long : le prix clôture au-dessus du haut du range d'ouverture (sur votre UT intraday, typiquement 1–5 min).\nDéclencheur short : le prix clôture sous le bas du range.\nExigez une clôture complète à travers le niveau, pas juste une mèche. La première cassure prend le trade ; ne chassez pas la deuxième cassure de la même journée.",
      },
      {
        title: "Étape 4 : confirmer avec le volume",
        body:
          "Un vrai ORB a du volume sur la bougie de cassure au moins égal à la moyenne avant cassure. Les cassures sans volume du range d'ouverture sont le faux signal le plus courant en day trading. Si le volume ne confirme pas, restez à l'écart.",
      },
      {
        title: "Étape 5 : stop de l'autre côté du range",
        body:
          "Pour les longs : stop au ou juste sous le bas du range d'ouverture. Pour les shorts : stop au haut du range. Les traders agressifs utilisent le point médian. Dans tous les cas, le stop est mécanique et la perte max par trade est bornée par la taille du range.",
      },
      {
        title: "Étape 6 : cibles et gestion",
        body:
          "Cibles courantes : 1× la hauteur du range (scalp rapide), 2–3× (runner), ou haut/bas de la veille. Prenez des partiels à la première cible et remontez le stop sous chaque nouveau swing intraday. Beaucoup de traders ORB ont une règle stricte « plus de nouveau trade après X h XX » (p. ex. 11 h 30) — l'edge de la stratégie est concentré sur les premières heures.",
      },
    ],
    whyItWorks:
      "Le flux d'ordres overnight — nouvelles, résultats, événements macro — se compresse dans les premières minutes de la séance quand la liquidité se rééquilibre. Une fois cet inventaire absorbé et que le prix casse le range précoce avec participation, la journée prolonge souvent cette direction. L'edge est maximal les jours à catalyseurs forts et s'estompe les séances calmes.",
    links: [
      { title: "Investopedia — Opening range (anglais)", url: "https://www.investopedia.com/terms/o/openingrange.asp" },
      { title: "Investopedia — Day trading breakouts (anglais)", url: "https://www.investopedia.com/articles/trading/10/day-trade-breakout.asp" },
    ],
  },

  vwapStrategy: {
    label: "Stratégie VWAP (repli / tendance)",
    summary: "Utiliser le VWAP comme ancre intraday — trader les replis vers le VWAP en tendance, ou fader une distance extrême au VWAP en range.",
    description:
      "Le VWAP (Volume-Weighted Average Price) est le prix moyen d'un instrument pondéré par le volume traité, réinitialisé à chaque séance. Contrairement à une moyenne mobile simple, le VWAP reflète où l'argent a réellement changé de mains, ce qui explique pourquoi les grandes institutions l'utilisent comme benchmark d'exécution. Les traders peuvent l'utiliser de deux façons : comme support/résistance de tendance (les replis vers le VWAP sont des entrées dans le sens de la tendance), ou comme ancre de retour (une distance extrême au-dessus/en dessous du VWAP revient souvent). Les deux versions sont très utilisées par les desks intraday et les algos.",
    whenToUse:
      "Utilisez le VWAP strictement en intraday — il se réinitialise chaque séance et n'a pas de sens d'un jour à l'autre. Fonctionne mieux sur les actions US liquides, les futures d'indice et les ETF majeurs en heures régulières. La version tendance s'applique quand il y a un biais directionnel clair depuis l'ouverture ; la version retour s'applique quand le prix oscille autour du VWAP sans tendance claire.",
    prosAndCons:
      "Avantages : benchmark institutionnel (votre contrepartie regarde souvent la même ligne), objectif et réinitialisé chaque jour, fonctionne pour tendance et retour, intègre le volume, simple à automatiser. Inconvénients : intraday uniquement, moins utile dans les 30 premières minutes (volume faible), mauvais les jours d'événements extrêmes, les deux variantes demandent des lectures de régime différentes.",
    indicatorsUsed: ["VWAP (séance)", "Bandes d'écart-type VWAP (1σ, 2σ)", "Volume", "RSI ou MACD (filtre de momentum facultatif)"],
    coreIdea:
      "Le VWAP, c'est là où le « trade moyen » de la journée s'est fait. Le prix le respecte en tendance (les replis tiennent) et revient vers lui après les extrêmes.",
    steps: [
      {
        title: "Étape 1 : choisir tendance ou retour — ne pas mélanger",
        body:
          "Regardez les 30–60 premières minutes. Si le prix tend proprement au-dessus ou en dessous du VWAP avec des hauts/bas croissants (ou décroissants), utilisez la variante tendance. S'il oscille à travers le VWAP sans direction claire, utilisez la variante retour. S'engager sur une seule garde vos règles cohérentes.",
      },
      {
        title: "Étape 2 (tendance) : attendre un repli vers le VWAP",
        body:
          "En tendance haussière intraday (prix au-dessus du VWAP) : attendez un repli vers le VWAP. Le repli doit tenir le VWAP comme support — le prix touche, méchage, puis clôture au-dessus. Bougie haussière de retournement = signal d'entrée. Pour les tendances baissières, symétrique : le prix rallie au VWAP et rejette par en dessous.",
      },
      {
        title: "Étape 3 (retour) : attendre une distance extrême au VWAP",
        body:
          "Utilisez les bandes VWAP (1σ et 2σ). Quand le prix s'étire à 2σ au-dessus du VWAP sans tendance claire et que le RSI est en surachat (>70), cherchez un short de retour vers le VWAP. Symétrique pour les longs : prix à 2σ sous, RSI survendu, cherchez un rebond. Exigez toujours une bougie de retournement — pas d'attrapage de couteau.",
      },
      {
        title: "Étape 4 : entrer avec le VWAP comme référence du stop",
        body:
          "Version tendance : stop juste au-delà de l'extrême du repli (sous la mèche pour long, au-dessus pour short). Version retour : stop au-delà de la bande 2σ si l'étirement continue. Dans les deux cas, le stop est serré car si le VWAP casse, la thèse est invalidée.",
      },
      {
        title: "Étape 5 : viser la structure ou l'autre côté",
        body:
          "Version tendance : viser le précédent swing high intraday (long) ou low (short). Trailer sur chaque nouveau swing. Version retour : viser le VWAP lui-même — prendre le profit au retour à la moyenne. Ne tenez pas un trade de retour en espérant une tendance complète — l'edge est dans le retour au VWAP, pas au-delà.",
      },
      {
        title: "Étape 6 : sortir avant la clôture",
        body:
          "Le VWAP se réinitialise à l'ouverture suivante, donc votre point de référence disparaît du jour au lendemain. La plupart des traders VWAP clôturent avant la fin de séance, quel que soit le P/L. Tenir un setup VWAP sur la nuit transforme un trade VWAP en pari directionnel sans ancre.",
      },
    ],
    whyItWorks:
      "Les desks institutionnels sont souvent jugés contre le VWAP — un acheteur veut exécuter sous, un vendeur au-dessus. Cela crée un flux d'ordres réel et récurrent autour de la ligne : acheteurs sur les replis, vendeurs sur les étirements. Les algorithmes appliquent structurellement cette logique. Les traders retail qui s'alignent sur le flux VWAP tradent avec les institutions, pas contre elles.",
    links: [
      { title: "Investopedia — VWAP (anglais)", url: "https://www.investopedia.com/terms/v/vwap.asp" },
      { title: "Investopedia — Trading avec VWAP (anglais)", url: "https://www.investopedia.com/articles/trading/11/trading-with-vwap-mvwap.asp" },
    ],
  },

  volumeProfileRotation: {
    label: "Rotation Volume Profile (VAL / POC / VAH)",
    summary: "Trader à l'intérieur de la Value Area — acheter les replis sur le VAL, fader les poussées sur le VAH, cibler le POC. Exploite la rotation autour des prix les plus acceptés.",
    description:
      "Le Volume Profile découpe le marché en zones d'acceptation (Value Area) et de rejet (Low-Volume Nodes). En régime rotationnel, le prix oscille entre le Value Area Low (VAL) et le Value Area High (VAH), revenant sans cesse vers le Point of Control (POC) — le bin au volume traité le plus élevé. La stratégie achète les replis sur le VAL avec retournement, prend profit au POC et allège au VAH ; le short miroire. Plus efficace en marché clairement en range (ADX < 20) avec un profil à POC unique et bien formé (distribution normale). Sur un profil bimodal ou une journée de tendance, à éviter — c'est un changement structurel, pas une rotation.",
    whenToUse:
      "À utiliser sur des instruments liquides en régime rotationnel — futures d'indices, grandes capitalisations, paires Forex majeures — quand l'ADX est bas et que le profil courant présente un POC unique clairement identifié. Fonctionne sur profils de séance (intraday) et profils multi-jours / semaines (swing). À éviter les jours à fort catalyseur, les fenêtres de résultats, ou si le profil est bimodal (deux POC concurrents) — l'edge s'effondre dès que la rotation cesse.",
    prosAndCons:
      "Avantages : niveaux dérivés objectivement (VAL/POC/VAH viennent du volume, pas d'un tracé manuel), invalidation mécanique serrée (acceptation au-delà de la Value Area tue la thèse), fonctionne sur tous les horizons, taux de réussite élevé dans les ranges stables, cibles naturelles (POC puis bord opposé). Inconvénients : échoue sévèrement en tendance (le prix reste collé à un extrême), le POC peut migrer en séance, exige un filtrage de régime rigoureux, le seuil de 70 % de la Value Area est arbitraire.",
    indicatorsUsed: ["Volume Profile (POC, VAH, VAL)", "ADX (filtre de régime)", "RSI (confirmation aux extrêmes)", "Bougies de retournement"],
    coreIdea:
      "Le prix tourne autour des niveaux où le plus de volume s'est échangé. Fader les bords de la Value Area quand le momentum échoue, cibler le POC.",
    steps: [
      {
        title: "Étape 1 : confirmer un régime rotationnel",
        body:
          "Vérifier : ADX < 20, bandes de Bollinger relativement plates, profil courant à POC unique bien défini (volume clairement supérieur aux bins voisins). Si le profil est bimodal ou si l'ADX monte, l'instrument est en transition — passer.",
      },
      {
        title: "Étape 2 : marquer VAL, POC, VAH",
        body:
          "L'indicateur Volume Profile les trace. Notez les prix exacts — ce sont vos niveaux de déclenchement et de cible pour la séance (ou la fenêtre de swing). Recalculez au passage de période.",
      },
      {
        title: "Étape 3 : attendre le tag du bord + retournement",
        body:
          "Setup long : le prix tague le VAL, imprime une bougie de rejet (marteau, englobante haussière) et RSI < 35. Setup short : miroir au VAH avec RSI > 65. Ne pas courir après — exigez BOTH le tag ET la bougie de confirmation sur votre timeframe d'exécution.",
      },
      {
        title: "Étape 4 : entrée avec stop serré au-delà du bord",
        body:
          "Long : entrée à la clôture de la bougie, stop sous le VAL moins un petit buffer ATR. Short : miroir au-dessus du VAH. Invalidation mécanique : si le prix accepte hors de la Value Area (clôture au-delà avec suivi), la rotation est terminée — sortir immédiatement.",
      },
      {
        title: "Étape 5 : cible principale — POC",
        body:
          "Allégez 50–75 % au POC. C'est la sortie du pain-quotidien ; le mouvement complet vers le bord opposé ne se produit qu'environ 30 % du temps. Remonter le stop au break-even sur le reste dès l'atteinte du POC.",
      },
      {
        title: "Étape 6 : runner — bord opposé, ou sortie sur bascule du POC",
        body:
          "Laissez un runner vers le VAH (long) ou le VAL (short). Si le POC bascule de support à résistance en séance (le prix échoue à le reconquérir par le bas, ou tient au-dessus par le haut — inverse de la thèse), la rotation casse. Fermez le runner quel que soit le P/L.",
      },
    ],
    whyItWorks:
      "La Value Area représente ~70 % du volume traité — par construction, c'est là où les participants sont à l'aise pour transiger. Le POC est le centre de gravité de la séance parce que c'est là que le plus de positions ont été ouvertes et doivent être défendues. Les teneurs de marché et les algos de rééquilibrage d'inventaire poussent activement le prix vers le POC quand il s'en éloigne, produisant la rotation que la stratégie exploite. L'edge s'effondre dès qu'un vrai catalyseur arrive et que le prix *accepte* hors de la Value Area précédente — c'est par définition un changement de régime, et le trader de rotation doit sortir immédiatement.",
    links: [
      { title: "Investopedia — Volume Profile / VWAP (anglais)", url: "https://www.investopedia.com/terms/v/volume-weighted-average-price-vwap.asp" },
      { title: "CME Group — Market Profile (anglais)", url: "https://www.cmegroup.com/education/courses/introduction-to-market-profile.html" },
      { title: "TradingView — Volume Profile (anglais)", url: "https://www.tradingview.com/support/solutions/43000502040-volume-profile/" },
    ],
  },

  orderBlockRetest: {
    label: "Retest d'Order Block (SMC)",
    summary: "Trader les replis dans des order blocks non mitigés dans le sens de la tendance en timeframe supérieure. Stops serrés, excellent R:R si filtré par le biais HTF.",
    description:
      "Un Order Block est la dernière bougie de couleur opposée précédant une forte impulsion — l'empreinte laissée par les institutions qui ont probablement accumulé (OB haussier) ou distribué (OB baissier) avant de pousser le marché. Dans le cadre Smart Money Concepts (SMC), les order blocks non mitigés dans le sens de la tendance de la timeframe supérieure sont des zones de retest à haute probabilité : le prix revient dans le bloc, réagit et reprend la direction de la tendance. La stratégie entre au premier retest propre avec un déclencheur de retournement (idéalement un sweep de liquidité ou un FVG à l'intérieur du bloc), stop juste au-delà du bord opposé du bloc, cible le swing précédent. Optimal sur instruments liquides avec structure HTF claire.",
    whenToUse:
      "À utiliser sur instruments liquides présentant une structure claire de tendance sur la timeframe supérieure (D1 pour entrées H1, W1 pour entrées D1). Convient pour swing et intraday. À éviter en chop : trop d'impulsions qui s'inversent créent des « blocs » bruyants sans suivi. Ignorer les blocs déjà touchés (mitigés) : l'edge est largement consommé. Plus puissant quand le retest coïncide avec un S/R de timeframe supérieure, un niveau de Pivot, ou un bord de Value Area.",
    prosAndCons:
      "Avantages : stops très serrés (immédiatement au-delà du bord opposé), règles objectives, naturellement aligné avec la tendance HTF, amplifié par l'empilement avec les liquidity sweeps et les FVG. Inconvénients : exige de la patience — beaucoup de blocs qualitatifs ne se font jamais retester ; forcer des entrées sur des blocs médiocres ruine l'edge. Très sensible au choix de timeframe — les blocs sur timeframes courtes sont bruyants. Discipline HTF non négociable ; aller contre la tendance HTF détruit l'edge.",
    indicatorsUsed: ["Order Blocks", "Filtre de tendance HTF (EMA 50/200)", "Liquidity Sweeps", "Fair Value Gaps", "ATR (dimensionnement du stop)"],
    coreIdea:
      "Les institutions ne peuvent pas remplir toute leur taille d'un coup. Elles laissent une empreinte (l'order block), poussent le prix, puis reviennent remplir les ordres restants. Entrée à ce retour dans le sens de la tendance HTF.",
    steps: [
      {
        title: "Étape 1 : fixer le biais de timeframe supérieure",
        body:
          "Long uniquement au-dessus de l'EMA 50 de la timeframe supérieure (D1 pour H1, W1 pour D1) ; short uniquement en dessous. Aller contre le biais HTF détruit l'edge — ce filtre est non négociable.",
      },
      {
        title: "Étape 2 : marquer les blocs non mitigés dans le sens du biais",
        body:
          "L'indicateur Order Block signale les zones non mitigées. Privilégiez les blocs qui coïncident aussi avec un cluster S/R antérieur, un niveau de Pivot ou un bord de Value Area. Ignorez tout bloc déjà touché — il est consommé.",
      },
      {
        title: "Étape 3 : attendre le retest (ne pas anticiper)",
        body:
          "Le prix doit réellement revenir dans la plage du bloc. Posez une alerte au bord du bloc et attendez. Beaucoup de blocs qualitatifs ne retestent jamais — acceptez-le et passez. Ne pas entrer en anticipation du retest.",
      },
      {
        title: "Étape 4 : exiger un déclencheur de confirmation dans le bloc",
        body:
          "Bloc seul = veille. Bloc + déclencheur = setup. Déclencheurs préférés : un sweep de liquidité d'un creux local (pour OB haussier) dans le bloc, un Fair Value Gap formé à l'intérieur, ou une bougie englobante haussière / marteau propre sur la timeframe d'exécution. Un seul suffit ; deux empilés est idéal.",
      },
      {
        title: "Étape 5 : entrée avec stop au-delà du bloc",
        body:
          "Long : entrée à la clôture de la bougie de retournement, stop sous le bas du bloc moins un petit buffer ATR. Short : miroir au-dessus du haut. Si le prix clôture à travers le bloc, la position institutionnelle est déjà remplie — sortir sans hésiter.",
      },
      {
        title: "Étape 6 : cible = swing précédent ; allègement et trailing",
        body:
          "Cible principale : le plus haut (ou plus bas) de swing précédent. Allégez 50 % là, remontez le stop au break-even, laissez le runner viser le prochain niveau HTF (S/R, Pivot, bord de Value Area). Sortez avant tout catalyseur connu (résultats, FOMC) quel que soit le P/L — les order blocks n'offrent aucun edge face aux chocs fondamentaux.",
      },
    ],
    whyItWorks:
      "Les gros participants accumulent leurs positions en plusieurs exécutions sur une zone de prix, puis poussent le prix en impulsion — le mouvement qui crée le bloc. Pour compléter leur taille restante, ils ont souvent besoin que le prix revienne sur la même zone, produisant le retest caractéristique. Le bloc est l'empreinte structurelle de ce processus. Combiné au biais HTF, les ordres institutionnels en attente s'empilent au niveau de retest — d'où la réaction nette que la stratégie capture. Sans biais HTF, l'edge statistique disparaît car les blocs se forment aussi dans les ranges, où le suivi est aléatoire.",
    links: [
      { title: "Babypips — Order Blocks (anglais)", url: "https://www.babypips.com/learn/forex/what-is-an-order-block" },
      { title: "Investopedia — Zones d'offre et de demande (anglais)", url: "https://www.investopedia.com/articles/forex/101215/forex-trading-primer-supply-and-demand.asp" },
    ],
  },

  pivotPointReaction: {
    label: "Réaction sur Pivot Points (pivots de floor trader)",
    summary: "Utiliser le PP comme ligne de biais de la période. Fader les réactions sur R1/S1 en régime de range ; traiter R2/S2 et R3/S3 comme cibles d'extension les jours de tendance.",
    description:
      "Les Pivot Points calculent les niveaux clés de la prochaine période à partir des H/B/C précédents : PP (ligne de biais), R1/S1, R2/S2, R3/S3 (ou variantes Fibonacci / Camarilla). Les traders de floor les utilisaient avant l'électronique ; les algos institutionnels s'y réfèrent encore aujourd'hui. La stratégie utilise le PP comme filtre de biais (biais long au-dessus, short en dessous), puis fade les réactions sur R1/S1 quand le momentum s'essouffle, et suit les cassures vers R2/S2/R3/S3 quand le momentum tient. Simple, mécanique, particulièrement efficace sur futures d'indices, paires Forex majeures et grandes capitalisations liquides en volatilité normale.",
    whenToUse:
      "À utiliser sur instruments très liquides à participation constante — futures d'indices (ES/NQ), Forex majeur, grandes capitalisations liquides. Pivots hebdomadaires pour graphes journaliers, mensuels pour hebdomadaires. Meilleur en régime de volatilité normale ; en vol extrême (VIX > 30 ou post-catalyseur) les pivots sont débordés et la stratégie whipsaw. Camarilla (niveaux plus serrés) pour le mean-reversion intraday ; classique pour le biais de swing ; Fibonacci entre les deux.",
    prosAndCons:
      "Avantages : niveaux entièrement précalculés (pas de jugement), entrées et cibles mécaniques, reconnus par les institutions donc le flux s'y concentre vraiment, stops naturels (niveau suivant), marche sur toutes les classes d'actifs. Inconvénients : moins utile sur instruments peu liquides, régulièrement débordés les jours à catalyseur, les pivots classiques purs n'ont pas de filtre de régime intégré (il faut superposer ADX ou un filtre de tendance), le choix de formule (classique / Fib / Camarilla) peut mener au curve-fitting si on switche.",
    indicatorsUsed: ["Pivot Points (classique / Fibonacci / Camarilla)", "ADX (filtre de régime)", "Volume (confirmation)", "Bougies de retournement"],
    coreIdea:
      "Des niveaux de prix précalculés ancrent le flux institutionnel pour la période. Le PP est la ligne de biais ; R1/S1 sont les zones de première réaction ; R2/S2/R3/S3 sont les cibles d'extension.",
    steps: [
      {
        title: "Étape 1 : tracer les pivots sur la bonne période",
        body:
          "Pivots hebdomadaires pour le trading journalier, mensuels pour le swing hebdomadaire. Choisissez la méthode une fois et tenez-vous-y — classique pour une approche équilibrée, Fibonacci pour des niveaux plus fluides, Camarilla pour le mean-reversion intraday serré. Switcher pour coller au dernier trade = curve-fitting.",
      },
      {
        title: "Étape 2 : fixer le biais de période à partir du PP",
        body:
          "Ouverture au-dessus du PP = biais haussier pour la période. Ouverture en dessous = biais baissier. Ne prenez que des setups alignés avec le biais — prendre des trades contre-biais écrase immédiatement le taux de réussite.",
      },
      {
        title: "Étape 3 : fader sur R1/S1 avec confluence",
        body:
          "En biais haussier, le premier repli significatif atteint souvent PP ou S1. Long sur une bougie de retournement, idéalement empilé avec RSI survendu, un Order Block non mitigé, ou un cluster S/R antérieur. Miroir sur R1 en biais baissier. Passer si l'ADX monte fortement — ça signale tendance, pas rotation.",
      },
      {
        title: "Étape 4 : placer le stop au niveau suivant",
        body:
          "Long depuis S1 : stop sous S2 (plus buffer ATR). Short depuis R1 : stop au-dessus de R2. Cela garde l'invalidation mécanique : si le niveau suivant est pris, la thèse est fausse. Ne pas élargir le stop parce que le trade est « proche ».",
      },
      {
        title: "Étape 5 : cible PP → R1 (ou S1) → R2",
        body:
          "Allégez à chaque niveau. En journée de range, attendez-vous à réaction au PP et prenez profit. En journée de tendance, R2/R3 (ou S2/S3) deviennent les cibles objectives — laissez le runner courir avec un stop suiveur sous le dernier swing.",
      },
      {
        title: "Étape 6 : basculer le biais sur cassure nette du PP",
        body:
          "Une clôture propre à travers le PP (à l'opposé du biais initial, sur volume) est le signal de bascule de biais. Évitez les trades contre-biais après une cassure fraîche — les niveaux fonctionnent désormais à l'envers. Attendez le recalcul du pivot de la prochaine période plutôt que de forcer un trade contre le nouveau biais.",
      },
    ],
    whyItWorks:
      "Les pivots encodent la plage de la période précédente en une grille objective et largement publiée. Parce que les mêmes niveaux sont surveillés par les desks, les algos et le retail, un flux d'ordres réel s'y concentre : stops juste au-delà, ordres limit sur les niveaux, algorithmes qui fadent les approches. Le composant auto-réalisateur est fort. Combinée au PP comme filtre de biais directionnel, la stratégie capture la rotation d'une période de trading normale et s'écarte des cassures en tendance en basculant le biais quand le PP cède.",
    links: [
      { title: "Investopedia — Pivot Points (anglais)", url: "https://www.investopedia.com/terms/p/pivotpoint.asp" },
      { title: "StockCharts — Pivot Points (anglais)", url: "https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-overlays/pivot-points" },
    ],
  },

  liqSweepReversal: {
    label: "Retournement sur Liquidity Sweep (fade de chasse aux stops)",
    summary: "Fader le faux signal — quand le prix perce un plus haut/bas de swing et reclôt à l'intérieur, entrer contre la cassure avec un stop serré juste au-delà de la mèche.",
    description:
      "Un sweep de liquidité se produit quand le prix dépasse brièvement un plus haut ou plus bas de swing antérieur — déclenchant les ordres stop et les ordres limit placés juste au-delà — puis revient à l'intérieur de la plage. Ce pattern est l'empreinte de participants institutionnels qui chassent les stops évidents pour générer la liquidité nécessaire avant d'entrer dans le sens opposé. La stratégie attend le sweep, exige une clôture de rejet à l'intérieur de la plage, puis entre contre la cassure avec un stop juste au-delà de la mèche. Très efficace sur des niveaux bien surveillés (plus hauts/bas de la veille, sommets de séance, chiffres ronds, bords de Value Area) et en régime d'ADX bas.",
    whenToUse:
      "À utiliser sur instruments liquides autour de pools de liquidité bien définis — plus hauts/bas de swing, extrêmes de la veille / semaine, chiffres ronds psychologiques, bords de Value Area. Fonctionne sur tous les horizons, mais plus la timeframe est haute plus c'est fiable. À éviter les jours de forte tendance, immédiatement après un catalyseur majeur, ou quand l'ADX monte — dans ces régimes, les « sweeps » sont souvent de vraies continuations, pas des retournements. Plus puissant quand le sweep tombe dans un order block ou un FVG haussier/baissier.",
    prosAndCons:
      "Avantages : stops extrêmement serrés (immédiatement au-delà de la mèche) qui produisent un R:R remarquable, déclencheur d'entrée objectif (clôture de rejet à l'intérieur), aligné avec le flux institutionnel, s'empile proprement avec order blocks et FVG pour la confluence. Inconvénients : en forte tendance, les « sweeps » de niveaux évidents sont fréquemment des continuations — les fader produit des pertes ; exige une conscience de régime disciplinée (ADX / tendance HTF) pour les éviter. Les sweeps à faible volume sont bruyants et peuvent être engineerés par les market makers sur des instruments peu liquides.",
    indicatorsUsed: ["Liquidity Sweeps", "Filtre de tendance HTF / ADX", "Order Blocks", "Fair Value Gaps", "Volume"],
    coreIdea:
      "La liquidité s'empile là où vivent les stops évidents — juste au-delà des plus hauts/bas antérieurs. Un sweep qui échoue à tenir = quelqu'un de gros vient de courir ces stops et est parti dans l'autre sens.",
    steps: [
      {
        title: "Étape 1 : identifier un pool de liquidité clair",
        body:
          "Plus haut / bas de swing multi-touches, plus haut / bas de la veille, chiffre rond, Value Area High/Low, ou sommets / creux égaux d'une range récente. Plus le niveau est évident, plus il y a de stops parqués derrière. Ignorer les niveaux bruyants de milieu de plage.",
      },
      {
        title: "Étape 2 : attendre la barre de sweep",
        body:
          "Le prix doit dépasser le niveau en séance (mèche à travers, déclenchement des stops). L'indicateur Liquidity Sweep signale la barre. Une barre qui clôture au-delà du niveau est une cassure, pas un sweep — s'abstenir.",
      },
      {
        title: "Étape 3 : exiger une clôture de retournement à l'intérieur",
        body:
          "La barre de sweep (ou la suivante sur la timeframe d'entrée) doit reclôt dans la plage, rejetant l'excursion. Attendez la fin de la bougie — front-runner la clôture transforme un trade de sweep en pari directionnel.",
      },
      {
        title: "Étape 4 : confirmer avec régime + confluence",
        body:
          "Les sweeps les plus qualitatifs surviennent en régime d'ADX bas (< 25) et tombent dans un Order Block non mitigé, un Fair Value Gap, ou un cluster S/R antérieur. Les sweeps en ADX haut sont généralement des continuations, pas des retournements — passer. Un volume au-dessus de la moyenne récente sur la bougie de retournement renforce la lecture.",
      },
      {
        title: "Étape 5 : entrée et stop serré au-delà de la mèche",
        body:
          "Long (après sweep bas) : entrée à la clôture de la bougie de retournement, stop sous la mèche du sweep moins un petit buffer ATR. Short (après sweep haut) : miroir. Le stop serré à la mèche est l'edge de la stratégie — ne pas l'élargir.",
      },
      {
        title: "Étape 6 : cible mi-plage → côté opposé",
        body:
          "Première cible : 50 % de retour dans la plage précédente. Stop au break-even à T1. Cible runner : niveau structurel opposé (autre côté de la plage, ou cluster Pivot / S/R). Si le momentum s'essouffle en route, sortir le runner — l'edge du sweep est concentré au début, pas à la fin.",
      },
    ],
    whyItWorks:
      "Les niveaux évidents attirent les stops évidents. Les gros participants qui ont besoin de remplir de la taille poussent le prix à travers ces niveaux pour déclencher les stops, absorber le flux résultant, puis retourner. La mèche de rejet est l'empreinte de cette absorption. La stratégie se range essentiellement du côté des institutions qui ont ingénieré la chasse aux stops — contre les traders retail qui se sont fait stopper. L'edge dépend de ce que le niveau soit un vrai pool de liquidité en régime rotationnel ; en régime de tendance, le même sweep est une continuation — d'où l'importance des filtres tendance HTF et ADX.",
    links: [
      { title: "Babypips — Liquidity Grabs / Stop Hunts (anglais)", url: "https://www.babypips.com/learn/forex/what-is-liquidity" },
      { title: "Investopedia — Stop Hunting (anglais)", url: "https://www.investopedia.com/terms/s/stop-hunting.asp" },
    ],
  },

  donchianTurtleBreakout: {
    label: "Cassure Donchian / Turtle Trading",
    summary: "Système original des Turtle traders (années 1980) — entrer sur un plus haut Donchian 20 ou 55 jours, sortir sur un plus bas 10 ou 20 jours. Suivi de tendance mécanique, taille basée sur l'ATR.",
    description:
      "Le système Turtle a été enseigné par Richard Dennis à un groupe de novices en 1983 pour régler un pari avec son associé William Eckhardt sur la possibilité d'enseigner le trading. Les règles sont brutalement simples : entrée long à la clôture au-dessus du plus haut Donchian 20 jours (Système 1) ou 55 jours (Système 2) ; sortie long à la clôture sous le plus bas 10 jours (S1) ou 20 jours (S2). Miroir pour les shorts. Le dimensionnement est intégré : une « unité » = 1 % du compte divisé par N, où N est l'ATR 20 jours. On peut pyramider jusqu'à 4 unités, en ajoutant tous les 0,5N de mouvement favorable. L'edge est une pure capture de fat tails : taux de réussite bas (~30–35 %) couplé à des gagnants rares mais très gros qui paient pour de nombreuses petites pertes.",
    whenToUse:
      "À utiliser sur un panier diversifié de 10–20 marchés liquides décorrélés — futures, Forex, crypto, indices actions, matières premières. Le Turtle sur instrument unique est beaucoup plus volatile et perd souvent son edge. Fonctionne mieux sur horizons longs (années), où les tendances fat-tail multi-mois ont le temps de se matérialiser. Peu adapté à ceux qui ne peuvent pas tolérer émotionnellement de longues périodes de drawdown ; excellent pour les traders systématiques, rule-based, qui peuvent laisser tourner sans intervenir.",
    prosAndCons:
      "Avantages : entièrement mécanique, aucune discrétion, des décennies de résultats en argent réel, capture les tendances fat-tail que quasi toute autre stratégie manque, dimensionnement intégré, logique identique long/short. Inconvénients : taux de réussite bas (30–35 %) psychologiquement éprouvant, nécessite la diversification du panier — le Turtle sur instrument unique whipsaw violemment, drawdowns de 20–40 % entre tendances sont normaux, historiquement moins efficace sur indices actions que sur matières/Forex/crypto, besoin en capital significatif car le N-sizing suppose de pouvoir tenir 4 unités sur 10+ marchés.",
    indicatorsUsed: ["Donchian Channels (20/55/10 périodes)", "ATR (dimensionnement N)", "Matrice de corrélation du panier"],
    coreIdea:
      "Les marchés passent ~80 % du temps dans le bruit et ~20 % en tendances soutenues qui font l'essentiel du P&L long terme. Acceptez de nombreuses petites pertes dans le bruit pour être positionné tôt, correctement dimensionné, et tenir jusqu'au bout quand une tendance arrive.",
    steps: [
      {
        title: "Étape 1 : construire un panier diversifié",
        body:
          "Choisissez 10–20 instruments liquides décorrélés — p. ex. plusieurs indices actions, Forex majeur, obligations, énergie, métaux, grains, quelques cryptos. La corrélation détruit la performance Turtle : deux positions corrélées = une position dimensionnée 2×. Recalculez les corrélations trimestriellement et élaguez.",
      },
      {
        title: "Étape 2 : calculer N (ATR 20 jours) pour chaque instrument",
        body:
          "N est l'unité de volatilité qui dimensionne chaque trade. 1 unité = (1 % du compte) / (N × taille contrat). Cela met chaque position à la même volatilité en dollars, peu importe l'instrument. Si N double, le nombre d'unités est divisé par deux — la clé pour survivre aux expansions de volatilité.",
      },
      {
        title: "Étape 3 : entrée — cassure Donchian haut/bas",
        body:
          "Système 1 (plus rapide) : entrée long à la clôture au-dessus du plus haut Donchian 20 jours, short sous le plus bas 20 jours. Système 2 (plus lent) : canaux 55 jours. Beaucoup mixent : S1 par défaut, mais sautent un signal S1 si le dernier trade S1 était gagnant (pour éviter de courir après les cassures choppy en fin de tendance forte).",
      },
      {
        title: "Étape 4 : stop dur à 2N, pyramider tous les 0,5N",
        body:
          "Stop initial : 2N sous l'entrée (pour un long). Ajoutez une unité tous les 0,5N de mouvement favorable, jusqu'à 4 unités totales. Chaque unité ajoutée remonte le stop à 2N sous la dernière entrée. Cela pyramide le risque sur les gagnants tout en plafonnant l'exposition totale.",
      },
      {
        title: "Étape 5 : sortie — plus bas Donchian (ou plus haut pour short)",
        body:
          "Sortie S1 : clôturer les longs sous le plus bas Donchian 10 jours, couvrir les shorts au-dessus du plus haut 10 jours. Sortie S2 : canaux 20 jours. La sortie est non négociable — pas de tenue, pas de « bougie de prière ». L'exit mécanique est ce qui fait fonctionner l'arithmétique fat-tail.",
      },
      {
        title: "Étape 6 : faire tourner le système sans modification et suivre les drawdowns honnêtement",
        body:
          "Le plus dur du Turtle est de ne rien faire entre les tendances. La plupart du temps, les petites pertes s'accumulent en attendant les 1–2 mouvements fat-tail par an par instrument qui paient tout. Suivre les drawdowns dans un journal séparé — et savoir qu'ils sont normaux — est l'équipement psychologique nécessaire pour ne pas paniquer sur un repli de 20 % normal.",
      },
    ],
    whyItWorks:
      "Les rendements d'actifs sont leptokurtiques : ils ont des queues épaisses. Un petit nombre de très gros mouvements fait l'essentiel de la performance long terme, le reste est du bruit. Les cassures Donchian positionnent structurellement le système long quand un instrument fait de nouveaux plus hauts et short sur de nouveaux plus bas — exactement quand les mouvements fat-tail commencent. Le dimensionnement basé sur l'ATR égalise le risque entre marchés, pour qu'un future obligataire calme et une crypto volatile contribuent à la même volatilité en dollars. La diversification sur des marchés décorrélés donne toujours plusieurs « essais » pour la prochaine fat tail — vous ne savez pas lequel partira, mais quelque chose part généralement. Le faible taux de réussite est une caractéristique, pas un bug : c'est le prix à payer pour capturer les rares outliers qui comptent.",
    links: [
      { title: "Investopedia — Turtle Trading (anglais)", url: "https://www.investopedia.com/articles/trading/08/turtle-trading.asp" },
      { title: "Investopedia — Donchian Channels (anglais)", url: "https://www.investopedia.com/terms/d/donchianchannels.asp" },
      { title: "Livre — Curtis Faith, Way of the Turtle (anglais)", url: "https://www.amazon.com/Way-Turtle-Secret-Methods-Legendary/dp/007148664X" },
      { title: "Règles Turtle originales (PDF, anglais, archivé)", url: "https://web.archive.org/web/20210304144604/https://bigpicture.typepad.com/comments/files/turtlerules.pdf" },
    ],
  },

  trendStructureVolatility: {
    label: "Tendance + Structure + Expansion de volatilité",
    summary: "Système swing/intraday à six filtres — n'entre que lorsque tendance (EMA 50), force (ADX 14), pullback (RSI 14), structure (VWAP ou Volume Profile) et expansion de volatilité (clôture à travers la médiane Keltner) sont tous alignés. Stops à 1,5× ATR, objectifs 2R ou trailing Keltner/RSI.",
    description:
      "Tendance + Structure + Expansion de volatilité est un système rule-based qui empile six filtres indépendants avant d'autoriser un trade : direction de tendance (EMA 50), force du régime (ADX 14 > 25 et en hausse), timing du pullback (RSI 14 revenant en zone 40–50 en uptrend ou 50–60 en downtrend), structure de marché (prix au-dessus/au-dessous du VWAP, ou réaction sur un nœud à fort volume du Volume Profile) et un déclencheur d'expansion de volatilité — une bougie qui reclôture à travers la médiane Keltner(20, 2× ATR) dans le sens de la tendance après le pullback. Le dimensionnement est piloté par l'ATR pour que chaque trade risque le même montant en dollars quel que soit l'instrument ou le régime. L'edge vient de la capacité combinée des filtres à refuser des trades : la porte écarte la plupart des setups, et c'est précisément le but — les trades que vous ne prenez pas sont ceux qui vous auraient fait mal.",
    whenToUse:
      "À utiliser sur des instruments liquides (Forex majeur, futures d'indices, grandes capitalisations, cryptos très liquides) sur unités de temps 15 min à daily. Idéal pour les traders swing et intraday actifs capables d'attendre patiemment l'alignement complet des filtres. Rester totalement à l'écart quand l'ADX est sous 20, quand le prix scie l'EMA 50, quand l'ADX est élevé mais en baisse (tendance qui s'épuise), ou quand l'ATR est tombé à des plus bas pluri-mensuels — le système est conçu pour sauter ces régimes, pas pour y forcer un trade.",
    prosAndCons:
      "Avantages : six filtres indépendants tuent la majorité des mauvais setups avant qu'ils vous tentent ; stops et dimensionnement à base d'ATR qui normalisent le risque en dollars entre instruments et régimes de volatilité ; deux options de sortie (2R fixe ou trailing Keltner/RSI) pour s'adapter au tempérament ; logique totalement symétrique long/short. Inconvénients : très peu de trades en régime calme ou choppy — il faut tenir les bras croisés longtemps ; demande de la patience pour attendre le pullback RSI plutôt que de chasser le mouvement initial ; la performance dépend fortement du respect des règles « skip » — chaque override est ce qui transforme un système profitable en système perdant.",
    indicatorsUsed: [
      "EMA (50) — direction de tendance",
      "ADX (14) — filtre de force du régime (> 25 et en hausse)",
      "RSI (14) — filtre de timing du pullback",
      "ATR (14) — dimensionnement du stop et de la position",
      "Canaux de Keltner (20, 2× ATR) — déclencheur d'expansion de volatilité sur la médiane",
      "VWAP ou Volume Profile — référence structurelle (POC / VAH / VAL)",
    ],
    coreIdea:
      "N'entrez pas avant que tendance, pullback de momentum, structure et volatilité soient tous d'accord. Six filtres, c'est une barre haute — et cette barre, c'est l'edge. La plupart des traders manquent cet alignement parce qu'ils tradent chacun des signaux pris isolément.",
    steps: [
      {
        title: "Étape 1 : filtrer le régime — trader uniquement si ADX > 25 et prix clairement d'un côté de l'EMA 50",
        body:
          "Premier garde-fou : est-ce un régime tradable ? Exiger ADX(14) > 25 ET prix visiblement au-dessus (longs) ou en dessous (shorts) de l'EMA 50. Sauter si l'ADX est sous 20 (chop), si le prix scie l'EMA, ou si l'ADX est élevé mais en baisse (tendance qui s'épuise). Cette seule règle élimine une large part des trades perdants avant même qu'ils se présentent.",
      },
      {
        title: "Étape 2 : attendre un pullback de momentum sur le RSI",
        body:
          "Après le filtre de régime, ne pas courir après le prix. Attendre que le RSI(14) revienne dans la zone 40–50 en uptrend, ou monte vers 50–60 en downtrend. C'est le filtre de timing qui évite d'acheter les sommets et de vendre les creux. Ce qui compte, c'est que le momentum ait refroidi — entrer frais dans un print surtaché ou sursold est exactement ce que cette étape doit empêcher.",
      },
      {
        title: "Étape 3 : confirmer le niveau structurel",
        body:
          "Vérifier la structure avant d'appuyer. Pour un long : prix au-dessus du VWAP, ou rebond sur un nœud à fort volume du Volume Profile. Pour un short : sous le VWAP, ou rejet d'une zone à fort volume au-dessus. Si la structure ne confirme pas le tableau tendance + momentum, rester à l'écart — un filtre manquant suffit à invalider le setup.",
      },
      {
        title: "Étape 4 : déclencheur — clôture à travers la médiane Keltner",
        body:
          "La bougie d'entrée est celle qui reclôture à travers la médiane Keltner(20, 2× ATR) (la 20-EMA) dans le sens de la tendance après le pullback RSI. Entrée à la clôture de cette bougie de confirmation. Cette séquence — pullback d'abord, clôture d'expansion de volatilité ensuite — capture la reprise du mouvement plutôt que le pullback lui-même. Pour un short, miroir : clôture sous la médiane après un RSI revenu en 50–60.",
      },
      {
        title: "Étape 5 : stop à 1,5× ATR, take profit à 2R ou trailing Keltner/RSI",
        body:
          "Stop-loss : 1,5 × ATR(14) depuis l'entrée (en dessous pour les longs, au-dessus pour les shorts). Deux options de sortie — en choisir une et s'y tenir : (A) TP fixe à 2× le risque (2R), mécanique et simple ; (B) trailing — sortir quand le prix reclôture contre vous à travers la médiane Keltner, ou quand le RSI dépasse 70 (long) / passe sous 30 (short) puis se retourne. Les traders de suivi de tendance préfèrent (B) ; les traders à RR probabiliste préfèrent (A).",
      },
      {
        title: "Étape 6 : dimensionnement par ATR et respect des règles de skip",
        body:
          "Risquer 0,5–1 % du compte par trade. Taille = (compte × risque %) / (1,5 × ATR × valeur du point). Cela normalise le risque en dollars entre instruments et régimes. Règles de skip strictes : ADX en baisse même si > 25, prix trop éloigné de l'EMA 50 (sur-étendu), news majeure imminente, ATR comprimé à des plus bas pluri-mensuels (marché mort). Améliorations optionnelles : n'autoriser les longs qu'au-dessus du pivot quotidien et les shorts en dessous ; ajouter une zone de non-trade autour du VWAP ± une petite tolérance ; utiliser l'EMA 50 de l'unité de temps supérieure comme biais. Erreurs fréquentes à éviter : entrer sans pullback RSI (chasing), ignorer un ADX qui baisse, utiliser des stops plus serrés que 1,5× ATR, outrepasser manuellement les règles par « conviction ».",
      },
    ],
    whyItWorks:
      "Chaque filtre bloque un mode d'échec précis. L'ADX élimine le chop — là où la plupart des stratégies saignent. L'EMA 50 choisit le côté du marché. Le pullback RSI force une meilleure entrée que courir après le mouvement initial. VWAP / Volume Profile ancre le trade à un niveau où des flux réels transigent. La clôture sur la médiane Keltner attend que la volatilité s'étende réellement dans votre sens avant de s'engager. Le dimensionnement et les stops à base d'ATR égalisent le risque entre régimes, pour qu'une semaine calme et une semaine volatile contribuent à la même exposition en dollars. Pris isolément, chaque filtre est banal ; empilés, ils écartent les trades qui auraient détruit l'edge — c'est pour cela que le système survit entre instruments et cycles de marché.",
    links: [
      { title: "Investopedia — ADX (anglais)", url: "https://www.investopedia.com/terms/a/adx.asp" },
      { title: "Investopedia — Canaux de Keltner (anglais)", url: "https://www.investopedia.com/terms/k/keltnerchannel.asp" },
      { title: "Investopedia — ATR et dimensionnement (anglais)", url: "https://www.investopedia.com/articles/trading/08/atr.asp" },
      { title: "Investopedia — Volume Profile (anglais)", url: "https://www.investopedia.com/terms/v/volume-profile.asp" },
    ],
  },
};
