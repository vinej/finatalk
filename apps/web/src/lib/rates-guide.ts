import type { Lang } from "@/lib/lang";

export type RatesLink = { title: string; url: string };

export type RatesTopic = {
  key: string;
  label: string;
  summary: string;
  howToRead: string;
  whatItMeans: string;
  investorAction: string;
  links: RatesLink[];
};

export const RATES_TOPICS = [
  "yieldCurve",
  "spreads",
  "fedPolicy",
  "bocPolicy",
  "globalPolicy",
  "impactEquities",
  "impactBonds",
  "impactCash",
  "impactHousing",
  "impactCurrency",
] as const;

export type RatesTopicKey = (typeof RATES_TOPICS)[number];

export const RATES_GENERAL_LINKS: Record<Lang, RatesLink[]> = {
  en: [
    { title: "Bank of Canada — Understanding interest rates", url: "https://www.bankofcanada.ca/core-functions/monetary-policy/" },
    { title: "Federal Reserve — How the Fed guides rates", url: "https://www.federalreserve.gov/monetarypolicy.htm" },
    { title: "Investopedia — Yield curve", url: "https://www.investopedia.com/terms/y/yieldcurve.asp" },
    { title: "FRED — 10Y–3M spread", url: "https://fred.stlouisfed.org/series/T10Y3M" },
    { title: "Canada.ca — Interest rates and how they affect you", url: "https://www.canada.ca/en/financial-consumer-agency/services/loans/interest-rates-mortgages.html" },
  ],
  fr: [
    { title: "Banque du Canada — Comprendre les taux d'intérêt", url: "https://www.banqueducanada.ca/fonctions-de-base/politique-monetaire/" },
    { title: "Réserve fédérale américaine — Politique monétaire", url: "https://www.federalreserve.gov/monetarypolicy.htm" },
    { title: "Investopedia — Courbe des taux", url: "https://www.investopedia.com/terms/y/yieldcurve.asp" },
    { title: "FRED — Écart 10A–3M", url: "https://fred.stlouisfed.org/series/T10Y3M" },
    { title: "Canada.ca — Les taux d'intérêt et leur effet sur vous", url: "https://www.canada.ca/fr/agence-consommation-matiere-financiere/services/prets/taux-interet-prets-hypothecaires.html" },
  ],
};

const GUIDE_EN: Record<RatesTopicKey, RatesTopic> = {
  yieldCurve: {
    key: "yieldCurve",
    label: "The yield curve",
    summary:
      "A plot of government bond yields by maturity (1M, 3M, 6M, 1Y, 2Y, 5Y, 10Y, 30Y) on a single date. The curve's shape reveals what the bond market expects about growth, inflation, and future policy.",
    howToRead:
      "Three classic shapes: NORMAL (upward-sloping — long rates above short rates) signals healthy growth with mild inflation. FLAT (all maturities roughly equal) signals uncertainty or a turning point. INVERTED (short rates above long rates) signals the market expects a slowdown and future rate cuts.\n\nCompare today's curve to 1M, 6M, and 1Y ago overlays to see if the curve is steepening (growth expectations improving) or flattening (slowdown fears building).",
    whatItMeans:
      "The curve aggregates millions of bond-market decisions. A steepening curve usually means investors expect stronger nominal growth ahead; a flattening or inverting curve means they expect the opposite. Historical data: every US recession since 1955 was preceded by an inverted curve 6–24 months earlier.",
    investorAction:
      "Normal/steepening → favour equities, cyclicals, credit. Flattening → reduce risk gradually, extend bond duration modestly. Inverted → increase cash/short-duration bonds, trim economically sensitive stocks (banks, industrials), consider defensives (utilities, staples, healthcare).",
    links: [
      { title: "US Treasury — Daily yield curve rates", url: "https://home.treasury.gov/resource-center/data-chart-center/interest-rates/TextView?type=daily_treasury_yield_curve" },
      { title: "Bank of Canada — Government bond yields", url: "https://www.bankofcanada.ca/rates/interest-rates/canadian-bonds/" },
    ],
  },
  spreads: {
    key: "spreads",
    label: "Key spreads (10Y–3M, 10Y–2Y)",
    summary:
      "The difference between a long-term Treasury yield and a short-term one. The 10Y–3M spread is the NY Fed's preferred recession indicator; the 10Y–2Y is the most popular among market commentators.",
    howToRead:
      "Positive spread (green) = normal curve, growth expected. Negative spread (red) = inverted curve, recession signal. The wider the inversion and the longer it persists, the stronger the signal.\n\nTime lag: recessions typically start 6–24 months AFTER the first inversion, not immediately. False positives exist (notably 1966), but the base rate is high.",
    whatItMeans:
      "An inversion says the bond market expects the central bank will need to cut rates soon — usually because growth is slowing. It does NOT mean sell everything today. It means the clock is ticking.",
    investorAction:
      "First inversion: begin rebalancing toward defensives and quality. Sustained inversion (3+ months): reduce cyclical exposure, lengthen bond duration to lock in yields before cuts, build a cash buffer for opportunities. Un-inversion (spread returning to positive) — historically the riskiest window, often right before a recession starts.",
    links: [
      { title: "FRED — 10Y–3M spread (T10Y3M)", url: "https://fred.stlouisfed.org/series/T10Y3M" },
      { title: "FRED — 10Y–2Y spread (T10Y2Y)", url: "https://fred.stlouisfed.org/series/T10Y2Y" },
      { title: "NY Fed — Probability of recession model", url: "https://www.newyorkfed.org/research/capital_markets/ycfaq" },
    ],
  },
  fedPolicy: {
    key: "fedPolicy",
    label: "US policy rates (EFFR, SOFR)",
    summary:
      "EFFR (Effective Federal Funds Rate) is the weighted average overnight rate at which US banks lend reserves to each other — the Fed's primary policy tool. SOFR (Secured Overnight Financing Rate) is the collateralized equivalent that replaced LIBOR for most USD-denominated debt.",
    howToRead:
      "The Fed sets a target RANGE (e.g., 4.25%–4.50%); EFFR trades within that band. Watch the Target Range field on the card. Changes in ±25 bps increments are standard; ±50 or ±75 bps signal urgency. SOFR and EFFR track closely — a divergence signals funding stress.",
    whatItMeans:
      "Rising EFFR = Fed tightening (fighting inflation, cooling growth). Falling EFFR = Fed easing (supporting growth, often because unemployment is rising). The Fed's dual mandate is price stability (~2% inflation) and maximum employment.",
    investorAction:
      "Hiking cycle starts → shorten bond duration, favour value/cash-rich equities, defensives outperform later in the cycle. Cutting cycle starts → lengthen duration, growth stocks and REITs historically benefit, small-caps and cyclicals rebound once cuts are priced in. The first cut after a long hold is usually a good time to extend duration.",
    links: [
      { title: "Federal Reserve — FOMC calendar", url: "https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm" },
      { title: "NY Fed — SOFR data", url: "https://www.newyorkfed.org/markets/reference-rates/sofr" },
      { title: "CME FedWatch — Rate probabilities", url: "https://www.cmegroup.com/markets/interest-rates/cme-fedwatch-tool.html" },
    ],
  },
  bocPolicy: {
    key: "bocPolicy",
    label: "Canadian policy rate (BoC overnight)",
    summary:
      "The Bank of Canada's policy interest rate — the midpoint of the operating band. It directly drives the prime rate at Canadian banks, which in turn sets variable-rate mortgages, HELOCs, lines of credit, and savings account yields.",
    howToRead:
      "The BoC announces eight fixed dates per year. Moves are typically ±25 bps; the 2022–2023 cycle included ±75 and ±100 bps moves. The OECD monthly series in this panel lags the announcement dates slightly but captures the trend. Compare to the Fed — historically the BoC follows the Fed with a 0–150 bps deviation.",
    whatItMeans:
      "Rising BoC rate → mortgage payments increase, consumer spending slows, CAD strengthens (usually), Canadian banks' net interest margins expand. Falling BoC rate → mortgage relief, housing rebounds, CAD weakens, bond prices rise.",
    investorAction:
      "For Canadian investors: when the BoC is cutting, lock in GIC rates EARLY (before banks reprice down), lengthen bond duration, consider Canadian REITs and utilities (interest-rate sensitive). When hiking: variable-rate mortgages become expensive — convert to fixed, favour Canadian banks (BMO, TD, RY, BNS, CM, NA) which benefit from wider margins, and Canadian dividend-paying energy/materials.",
    links: [
      { title: "Bank of Canada — Policy rate schedule", url: "https://www.bankofcanada.ca/core-functions/monetary-policy/key-interest-rate/" },
      { title: "Bank of Canada — Monetary policy report", url: "https://www.bankofcanada.ca/publications/mpr/" },
      { title: "Canadian Bankers Association — Prime rates", url: "https://cba.ca/prime-rate" },
    ],
  },
  globalPolicy: {
    key: "globalPolicy",
    label: "Global policy rates (ECB, SONIA, €STR)",
    summary:
      "Policy rates from the European Central Bank (ECB main refinancing rate), the Bank of England (SONIA — Sterling Overnight Index Average), and the eurozone short-term rate (€STR). These matter for Canadian investors holding international ETFs or multinationals.",
    howToRead:
      "Compare trajectories: if the Fed is hiking but the ECB is holding, USD strengthens vs EUR. Divergence creates currency-translation effects in international funds. The ECB is typically more dovish than the Fed historically, meaning European equities can lag US equities during Fed tightening.",
    whatItMeans:
      "These rates anchor global bond markets. Widening Canada–Europe rate gaps affect hedging costs on CAD-hedged international ETFs (XEF, VEF, etc.). A strong USD (from Fed tightening) historically pressures emerging markets and commodities priced in USD.",
    investorAction:
      "Monitor rate differentials when choosing currency-hedged vs unhedged international ETFs. If you expect USD strength, unhedged international exposure hurts; if you expect USD weakness, unhedged adds return. Most long-term passive investors should default to unhedged for diversification, and hedged only for known-short-term holdings.",
    links: [
      { title: "ECB — Key interest rates", url: "https://www.ecb.europa.eu/stats/policy_and_exchange_rates/key_ecb_interest_rates/html/index.en.html" },
      { title: "Bank of England — SONIA", url: "https://www.bankofengland.co.uk/markets/sonia-benchmark" },
      { title: "ECB — €STR", url: "https://www.ecb.europa.eu/stats/financial_markets_and_interest_rates/euro_short-term_rate/html/index.en.html" },
    ],
  },
  impactEquities: {
    key: "impactEquities",
    label: "Impact on equities",
    summary:
      "Stock prices discount future cash flows at a rate derived from bond yields. When yields rise, that discount rate rises and present values fall — especially for stocks whose cash flows are far in the future (growth/tech).",
    howToRead:
      "A 1% rise in the 10Y Treasury yield compresses long-duration growth stock P/E multiples by roughly 10–20% (all else equal). Value stocks (banks, energy, staples) are less sensitive because their cash flows arrive sooner. Dividend stocks compete with bonds — when the 10Y yield exceeds major dividend yields, capital rotates out.",
    whatItMeans:
      "Rising rates environment → value > growth, banks benefit from wider net interest margins, commodity producers often rally (inflation link), REITs and utilities suffer (rate-sensitive debt). Falling rates environment → growth > value, tech leads, housing-adjacent stocks rally, REITs rebound.",
    investorAction:
      "Align equity tilt to the rate cycle, but don't overdo it — rates are one factor among many. For Canadian investors: the TSX is ~30% financials and ~15% energy, both benefit from moderate rate rises. US S&P 500 is ~30% tech, which struggles with rising rates. This is why diversification between TSX and S&P 500 smooths returns across rate regimes.",
    links: [
      { title: "Investopedia — Interest rates' impact on stocks", url: "https://www.investopedia.com/articles/stocks/09/how-interest-rates-affect-markets.asp" },
      { title: "BlackRock — Rates and equity styles", url: "https://www.blackrock.com/ca/investors/en/insights" },
    ],
  },
  impactBonds: {
    key: "impactBonds",
    label: "Impact on bonds",
    summary:
      "Bond prices move inversely to yields. Duration measures how much a bond's price falls when yields rise. A 10-year bond has a duration of ~8–9 years, meaning a +1% yield change ≈ -8 to -9% price change.",
    howToRead:
      "Short-duration bonds (1–3Y) are safer when rates are rising; long-duration bonds (10Y+) gain the most when rates are falling. The yield curve's shape tells you the best place on the curve — avoid the belly (5–7Y) in a flat curve since you give up yield without duration benefit.",
    whatItMeans:
      "A rising-rate environment is the worst environment for bonds. 2022 saw the largest bond drawdown in 40 years (Canadian aggregate -11.7%) as rates rose rapidly. A falling-rate environment is the best — bonds deliver coupon + price appreciation.",
    investorAction:
      "Before BoC/Fed cuts: extend duration (VGLB, XLB for Canadians; TLT, EDV for US). Before hikes: shorten to 1–3Y (VSB, XSB) or floating-rate (ZFH). GICs offer equivalent safety to bonds with no interest-rate risk (held to maturity) — consider a GIC ladder in rising environments. The first meaningful rate cut is typically the best time to add long-duration bonds.",
    links: [
      { title: "Investopedia — Duration", url: "https://www.investopedia.com/terms/d/duration.asp" },
      { title: "PIMCO — Understanding bond duration", url: "https://www.pimco.com/en-us/resources/education/understanding-duration" },
    ],
  },
  impactCash: {
    key: "impactCash",
    label: "Impact on cash, HISA, GICs",
    summary:
      "Cash yields (HISA, money market ETFs, GICs) track the policy rate closely. A BoC rate of 3% means HISAs typically pay 2.5–3.5%, 1-year GICs 3.5–4.5%.",
    howToRead:
      "Rising rate environment → cash becomes attractive vs bonds (which lose price on rising rates) and vs low-yield dividend stocks. Falling rate environment → cash yields drop quickly; reinvestment risk (earning less on future cash) becomes a concern.",
    whatItMeans:
      "High rates = 'cash is king' narrative. In 2023–2024, T-bills and HISA ETFs (CASH.TO, PSA.TO) delivered 4.5–5.5% risk-free. But that window closes when the central bank cuts.",
    investorAction:
      "When rates are near a peak (BoC done hiking): lock in GICs at 2–5Y terms before they reprice down. Use a GIC ladder (equal amounts maturing 1Y, 2Y, 3Y, 4Y, 5Y) to balance liquidity and yield. HISA ETFs like CASH.TO are fine for short-term parking but will see yields drop within weeks of BoC cuts. Avoid locking in 5Y GICs at cycle lows.",
    links: [
      { title: "Highinterestsavings.ca — HISA rates", url: "https://www.highinterestsavings.ca/chart/" },
      { title: "Ratehub — GIC comparison", url: "https://www.ratehub.ca/gics" },
    ],
  },
  impactHousing: {
    key: "impactHousing",
    label: "Impact on housing and REITs",
    summary:
      "In Canada, 5-year fixed mortgages track the 5-year Government of Canada bond yield + a spread (~150–200 bps). Variable-rate mortgages track the BoC policy rate + the bank's prime rate spread. Rate changes flow directly into affordability.",
    howToRead:
      "Watch the 5Y yield on the curve — a 100 bps rise translates to ~10–12% less borrowing capacity at the same monthly payment. REITs are especially rate-sensitive because (1) their financing costs change and (2) they compete with bonds on yield.",
    whatItMeans:
      "Rate hikes → housing prices soften or fall, fewer new builds, REIT prices fall. Rate cuts → housing often rebounds within 6–12 months, REITs rally. Canadian residential REITs (CAR.UN, IIP.UN) are especially sensitive due to the Canadian mortgage-renewal cycle.",
    investorAction:
      "If you hold a variable-rate mortgage and rates are peaking, consider converting to fixed to stop the bleeding. If you're a REIT investor, the best entries are typically right before the first rate cut of a cycle. Canadian REITs to study: residential (CAR.UN, IIP.UN), industrial (DIR.UN, GRT.UN), retail (CRT.UN, REI.UN). Avoid highly-leveraged REITs during rising-rate cycles.",
    links: [
      { title: "CMHC — Mortgage consumer reports", url: "https://www.cmhc-schl.gc.ca/professionals/housing-markets-data-and-research" },
      { title: "Ratehub — Mortgage rate history", url: "https://www.ratehub.ca/best-mortgage-rates" },
      { title: "BMO — REIT investing primer", url: "https://www.bmo.com/main/personal/investments/learning-centre/" },
    ],
  },
  impactCurrency: {
    key: "impactCurrency",
    label: "Impact on CAD/USD and foreign holdings",
    summary:
      "The rate differential between Canada and the US is the #1 driver of the CAD/USD exchange rate over 6–24 month horizons (alongside oil prices). When the Fed hikes faster than the BoC, USD strengthens vs CAD.",
    howToRead:
      "Compare the BoC overnight rate vs EFFR on the US tab: if Fed rate > BoC rate by more than ~100 bps for several months, CAD weakens. If BoC > Fed, CAD strengthens. Oil prices add a second effect: rising oil = strong CAD (Canada is a net oil exporter).",
    whatItMeans:
      "For Canadian investors holding US stocks directly (e.g., AAPL, MSFT in USD): a strong USD boosts CAD-converted returns; a weak USD reduces them. Over a full rate cycle, currency effects largely wash out — but over 1–3 years they can dominate.",
    investorAction:
      "Default to unhedged US exposure (XUU, VFV, VUN) for long-term holdings — cheaper fees, and you benefit from USD strength when the Fed leads the hiking cycle. Use hedged ETFs (XSP, VSP) only for tactical or short-horizon positions. For emergency funds or short-term US travel savings, hold actual USD in a USD HISA to avoid FX conversion costs twice.",
    links: [
      { title: "Bank of Canada — CAD exchange rates", url: "https://www.bankofcanada.ca/rates/exchange/" },
      { title: "Questrade — Currency hedging explained", url: "https://www.questrade.com/learning/questrade-basics/currency-hedging" },
    ],
  },
};

const GUIDE_FR: Record<RatesTopicKey, RatesTopic> = {
  yieldCurve: {
    key: "yieldCurve",
    label: "La courbe des taux",
    summary:
      "Graphique des rendements des obligations gouvernementales par échéance (1M, 3M, 6M, 1A, 2A, 5A, 10A, 30A) à une date donnée. La forme de la courbe reflète les attentes du marché obligataire sur la croissance, l'inflation et la politique monétaire future.",
    howToRead:
      "Trois formes classiques : NORMALE (pente ascendante — taux longs au-dessus des taux courts) signale une croissance saine avec inflation modérée. PLATE (maturités proches) signale incertitude ou point d'inflexion. INVERSÉE (taux courts au-dessus des taux longs) signale que le marché anticipe un ralentissement et de futures baisses.\n\nComparez la courbe du jour aux superpositions 1M, 6M et 1A pour voir si la courbe se pentifie (meilleures attentes) ou s'aplatit (crainte de ralentissement).",
    whatItMeans:
      "La courbe agrège des millions de décisions du marché obligataire. Une courbe qui se pentifie suggère généralement de meilleures attentes de croissance nominale ; à l'inverse pour une courbe qui s'aplatit ou s'inverse. Fait historique : toutes les récessions américaines depuis 1955 ont été précédées d'une courbe inversée 6–24 mois avant.",
    investorAction:
      "Normale/pentification → privilégier actions, cycliques, crédit. Aplatissement → réduire le risque progressivement, allonger modérément la durée obligataire. Inversée → augmenter la liquidité/obligations courtes, réduire les actions cycliques (banques, industrielles), considérer les défensives (services publics, consommation de base, santé).",
    links: [
      { title: "Département du Trésor US — Courbe des taux quotidienne", url: "https://home.treasury.gov/resource-center/data-chart-center/interest-rates/TextView?type=daily_treasury_yield_curve" },
      { title: "Banque du Canada — Rendements obligataires", url: "https://www.banqueducanada.ca/taux/taux-dinteret/obligations-canadiennes/" },
    ],
  },
  spreads: {
    key: "spreads",
    label: "Écarts clés (10A–3M, 10A–2A)",
    summary:
      "Différence entre un rendement du Trésor long et un rendement court. L'écart 10A–3M est l'indicateur de récession préféré de la Fed de NY ; le 10A–2A est le plus utilisé par les commentateurs.",
    howToRead:
      "Écart positif (vert) = courbe normale, croissance attendue. Écart négatif (rouge) = courbe inversée, signal de récession. Plus l'inversion est profonde et durable, plus le signal est fort.\n\nDélai : les récessions débutent typiquement 6–24 mois APRÈS la première inversion, pas immédiatement. Des faux positifs existent (notamment 1966), mais le taux de base est élevé.",
    whatItMeans:
      "Une inversion dit que le marché obligataire anticipe que la banque centrale devra baisser les taux bientôt — généralement parce que la croissance ralentit. Cela ne veut PAS dire de tout vendre aujourd'hui. Cela signifie que l'horloge tourne.",
    investorAction:
      "Première inversion : commencez à rééquilibrer vers les défensives et la qualité. Inversion soutenue (3+ mois) : réduisez l'exposition cyclique, allongez la durée obligataire pour verrouiller les rendements avant les baisses, constituez un coussin de liquidités. Dés-inversion (écart qui redevient positif) — historiquement la fenêtre la plus risquée, souvent juste avant le début d'une récession.",
    links: [
      { title: "FRED — Écart 10A–3M (T10Y3M)", url: "https://fred.stlouisfed.org/series/T10Y3M" },
      { title: "FRED — Écart 10A–2A (T10Y2Y)", url: "https://fred.stlouisfed.org/series/T10Y2Y" },
      { title: "Fed de NY — Modèle de probabilité de récession", url: "https://www.newyorkfed.org/research/capital_markets/ycfaq" },
    ],
  },
  fedPolicy: {
    key: "fedPolicy",
    label: "Taux directeurs US (EFFR, SOFR)",
    summary:
      "Le EFFR (Effective Federal Funds Rate) est le taux moyen pondéré au jour le jour auquel les banques américaines se prêtent leurs réserves — l'outil principal de la Fed. Le SOFR (Secured Overnight Financing Rate) est l'équivalent garanti qui a remplacé le LIBOR pour la plupart de la dette en USD.",
    howToRead:
      "La Fed fixe une plage cible (ex. 4,25 %–4,50 %) ; le EFFR se négocie à l'intérieur. Surveillez le champ Plage cible sur la carte. Les variations standard sont ±25 pb ; ±50 ou ±75 pb signalent l'urgence. SOFR et EFFR se suivent — une divergence signale un stress de financement.",
    whatItMeans:
      "EFFR qui monte = Fed resserre (combat l'inflation, refroidit la croissance). EFFR qui baisse = Fed assouplit (soutient la croissance, souvent parce que le chômage monte). Le double mandat de la Fed : stabilité des prix (~2 % d'inflation) et plein emploi.",
    investorAction:
      "Début du cycle de hausses → raccourcir la durée obligataire, privilégier la valeur/actions riches en liquidités, les défensives surperforment plus tard dans le cycle. Début du cycle de baisses → allonger la durée, les actions de croissance et les FPI profitent historiquement, les petites capitalisations et cycliques rebondissent quand les baisses sont anticipées. La première baisse après une longue pause est souvent un bon moment pour allonger la durée.",
    links: [
      { title: "Réserve fédérale — Calendrier FOMC", url: "https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm" },
      { title: "Fed de NY — Données SOFR", url: "https://www.newyorkfed.org/markets/reference-rates/sofr" },
      { title: "CME FedWatch — Probabilités de taux", url: "https://www.cmegroup.com/markets/interest-rates/cme-fedwatch-tool.html" },
    ],
  },
  bocPolicy: {
    key: "bocPolicy",
    label: "Taux directeur canadien (BdC)",
    summary:
      "Le taux directeur de la Banque du Canada — le milieu de la fourchette opérationnelle. Il entraîne directement le taux préférentiel des banques canadiennes, qui fixe les hypothèques à taux variable, les marges de crédit hypothécaire, les lignes de crédit et les rendements des comptes d'épargne.",
    howToRead:
      "La BdC annonce huit dates fixes par année. Les mouvements sont typiquement ±25 pb ; le cycle 2022–2023 a inclus des ±75 et ±100 pb. La série mensuelle OCDE dans ce panneau est légèrement en retard sur les dates d'annonce mais reflète la tendance. Comparez à la Fed — historiquement, la BdC suit la Fed avec un écart de 0–150 pb.",
    whatItMeans:
      "Taux BdC qui monte → paiements hypothécaires plus élevés, dépenses de consommation qui ralentissent, CAD qui se renforce (généralement), marges d'intérêt net des banques canadiennes qui s'élargissent. Taux BdC qui baisse → allégement hypothécaire, rebond immobilier, CAD qui s'affaiblit, prix des obligations qui montent.",
    investorAction:
      "Pour l'investisseur canadien : quand la BdC baisse, verrouillez TÔT des taux de CPG (avant que les banques ne revoient à la baisse), allongez la durée obligataire, considérez les FPI et services publics canadiens (sensibles aux taux). Quand elle hausse : les hypothèques à taux variable deviennent coûteuses — convertissez en fixe, privilégiez les banques canadiennes (BMO, TD, RY, BNS, CM, NA) qui profitent de marges plus larges, et les dividendes énergétiques/matériaux canadiens.",
    links: [
      { title: "Banque du Canada — Dates d'annonce", url: "https://www.banqueducanada.ca/fonctions-de-base/politique-monetaire/taux-directeur/" },
      { title: "Banque du Canada — Rapport sur la politique monétaire", url: "https://www.banqueducanada.ca/publications/rpm/" },
      { title: "Association des banquiers canadiens — Taux préférentiel", url: "https://cba.ca/prime-rate" },
    ],
  },
  globalPolicy: {
    key: "globalPolicy",
    label: "Taux mondiaux (BCE, SONIA, €STR)",
    summary:
      "Taux directeurs de la BCE (taux de refinancement principal), de la Banque d'Angleterre (SONIA — Sterling Overnight Index Average) et de la zone euro (€STR). Importants pour les investisseurs canadiens détenant des FNB internationaux ou des multinationales.",
    howToRead:
      "Comparez les trajectoires : si la Fed hausse mais la BCE maintient, l'USD se renforce contre l'EUR. La divergence crée des effets de conversion de devises dans les fonds internationaux. La BCE est historiquement plus accommodante que la Fed, ce qui fait que les actions européennes peuvent sous-performer pendant le resserrement de la Fed.",
    whatItMeans:
      "Ces taux ancrent les marchés obligataires mondiaux. L'élargissement des écarts Canada–Europe affecte les coûts de couverture des FNB internationaux couverts en CAD (XEF, VEF, etc.). Un USD fort (par resserrement de la Fed) pèse historiquement sur les marchés émergents et les matières premières cotées en USD.",
    investorAction:
      "Surveillez les différentiels de taux lors du choix entre FNB internationaux couverts et non couverts en devises. Si vous anticipez un USD fort, une exposition internationale non couverte est pénalisante ; si vous anticipez un USD faible, la non-couverture ajoute au rendement. La plupart des investisseurs passifs à long terme devraient privilégier le non-couvert pour la diversification, et le couvert seulement pour les positions à court terme connues.",
    links: [
      { title: "BCE — Taux d'intérêt clés", url: "https://www.ecb.europa.eu/stats/policy_and_exchange_rates/key_ecb_interest_rates/html/index.fr.html" },
      { title: "Banque d'Angleterre — SONIA", url: "https://www.bankofengland.co.uk/markets/sonia-benchmark" },
      { title: "BCE — €STR", url: "https://www.ecb.europa.eu/stats/financial_markets_and_interest_rates/euro_short-term_rate/html/index.en.html" },
    ],
  },
  impactEquities: {
    key: "impactEquities",
    label: "Impact sur les actions",
    summary:
      "Les cours des actions actualisent les flux de trésorerie futurs à un taux dérivé des rendements obligataires. Quand les rendements montent, le taux d'actualisation monte et les valeurs actuelles baissent — surtout pour les titres dont les flux sont éloignés (croissance/tech).",
    howToRead:
      "Une hausse de 1 % du rendement 10 ans compresse les multiples C/B des titres de croissance à longue durée de 10 à 20 % environ (toutes choses égales). Les titres de valeur (banques, énergie, consommation de base) sont moins sensibles car leurs flux arrivent plus tôt. Les titres à dividende concurrencent les obligations — quand le 10 ans dépasse les principaux rendements de dividendes, le capital se déplace.",
    whatItMeans:
      "Environnement de taux en hausse → valeur > croissance, les banques profitent de marges plus larges, les producteurs de matières premières rallient souvent (lien avec l'inflation), les FPI et services publics souffrent (dette sensible aux taux). Environnement de taux en baisse → croissance > valeur, la tech mène, les titres liés à l'habitation rallient, les FPI rebondissent.",
    investorAction:
      "Alignez l'inclinaison de votre portefeuille actions au cycle des taux, sans excès — les taux sont un facteur parmi d'autres. Pour les investisseurs canadiens : le TSX est ~30 % financières et ~15 % énergie, qui profitent tous deux de hausses modérées. Le S&P 500 américain est ~30 % tech, qui souffre de hausses. C'est pourquoi la diversification TSX/S&P 500 lisse les rendements à travers les régimes de taux.",
    links: [
      { title: "Investopedia — Impact des taux sur les actions", url: "https://www.investopedia.com/articles/stocks/09/how-interest-rates-affect-markets.asp" },
      { title: "BlackRock — Taux et styles d'actions", url: "https://www.blackrock.com/ca/investors/fr/insights" },
    ],
  },
  impactBonds: {
    key: "impactBonds",
    label: "Impact sur les obligations",
    summary:
      "Les prix des obligations évoluent inversement aux rendements. La durée mesure de combien le prix d'une obligation baisse quand les rendements montent. Une obligation 10 ans a une durée d'environ 8–9 ans : une hausse de +1 % de rendement ≈ -8 à -9 % de prix.",
    howToRead:
      "Les obligations courtes (1–3 ans) sont plus sûres quand les taux montent ; les longues (10 ans+) gagnent le plus quand les taux baissent. La forme de la courbe indique le meilleur point — évitez le ventre (5–7 ans) sur une courbe plate car vous abandonnez du rendement sans bénéfice de durée.",
    whatItMeans:
      "Un environnement de hausse de taux est le pire pour les obligations. 2022 a vu le plus grand recul obligataire en 40 ans (indice agrégé canadien -11,7 %) avec la hausse rapide des taux. Un environnement de baisse est le meilleur — les obligations donnent coupon + appréciation du prix.",
    investorAction:
      "Avant les baisses BdC/Fed : allongez la durée (VGLB, XLB pour les Canadiens ; TLT, EDV aux É-U). Avant les hausses : raccourcissez à 1–3 ans (VSB, XSB) ou taux variable (ZFH). Les CPG offrent la même sûreté que les obligations sans risque de taux (détenus jusqu'à échéance) — considérez une échelle de CPG dans un environnement de hausse. La première baisse significative est typiquement le meilleur moment pour ajouter des obligations à longue durée.",
    links: [
      { title: "Investopedia — Durée", url: "https://www.investopedia.com/terms/d/duration.asp" },
      { title: "PIMCO — Comprendre la durée obligataire", url: "https://www.pimco.com/en-us/resources/education/understanding-duration" },
    ],
  },
  impactCash: {
    key: "impactCash",
    label: "Impact sur liquidités, CEIE, CPG",
    summary:
      "Les rendements sur liquidités (CEIE, FNB de marché monétaire, CPG) suivent étroitement le taux directeur. Un taux BdC de 3 % signifie des CEIE typiquement à 2,5–3,5 %, et des CPG 1 an à 3,5–4,5 %.",
    howToRead:
      "Environnement de hausse → les liquidités deviennent attractives par rapport aux obligations (qui perdent du prix) et aux actions à faible dividende. Environnement de baisse → les rendements sur liquidités chutent rapidement ; le risque de réinvestissement (gagner moins sur les liquidités futures) devient une préoccupation.",
    whatItMeans:
      "Des taux élevés = narratif « cash is king ». En 2023–2024, les bons du Trésor et FNB CEIE (CASH.TO, PSA.TO) ont livré 4,5–5,5 % sans risque. Mais cette fenêtre se ferme quand la banque centrale baisse.",
    investorAction:
      "Quand les taux sont près du sommet (BdC en fin de hausses) : verrouillez des CPG 2–5 ans avant le repricing. Utilisez une échelle de CPG (montants égaux arrivant à 1A, 2A, 3A, 4A, 5A) pour équilibrer liquidité et rendement. Les FNB CEIE comme CASH.TO conviennent pour le stationnement court terme mais verront leurs rendements chuter dans les semaines suivant les baisses BdC. Évitez de verrouiller des CPG 5 ans aux creux du cycle.",
    links: [
      { title: "Highinterestsavings.ca — Taux CEIE", url: "https://www.highinterestsavings.ca/chart/" },
      { title: "Ratehub — Comparateur CPG", url: "https://www.ratehub.ca/fr/cpg" },
    ],
  },
  impactHousing: {
    key: "impactHousing",
    label: "Impact sur l'immobilier et FPI",
    summary:
      "Au Canada, les hypothèques fixes 5 ans suivent le rendement de l'obligation 5 ans du gouvernement du Canada + un écart (~150–200 pb). Les hypothèques variables suivent le taux BdC + l'écart prime de la banque. Les changements de taux coulent directement dans l'accessibilité.",
    howToRead:
      "Surveillez le rendement 5 ans sur la courbe — une hausse de 100 pb se traduit par environ 10–12 % de capacité d'emprunt en moins au même paiement mensuel. Les FPI sont particulièrement sensibles aux taux car (1) leurs coûts de financement changent et (2) ils concurrencent les obligations sur le rendement.",
    whatItMeans:
      "Hausses de taux → prix immobiliers qui se ramollissent ou baissent, moins de nouvelles constructions, prix des FPI qui baissent. Baisses de taux → rebond immobilier souvent dans les 6–12 mois, rallye FPI. Les FPI résidentielles canadiennes (CAR.UN, IIP.UN) sont particulièrement sensibles en raison du cycle de renouvellement hypothécaire canadien.",
    investorAction:
      "Si vous détenez une hypothèque variable et que les taux culminent, envisagez la conversion en fixe pour stopper l'hémorragie. Si vous investissez dans les FPI, les meilleurs points d'entrée sont typiquement juste avant la première baisse d'un cycle. FPI canadiennes à étudier : résidentielles (CAR.UN, IIP.UN), industrielles (DIR.UN, GRT.UN), détail (CRT.UN, REI.UN). Évitez les FPI très endettées en cycle de hausse.",
    links: [
      { title: "SCHL — Rapports hypothécaires", url: "https://www.cmhc-schl.gc.ca/fr/professionals/housing-markets-data-and-research" },
      { title: "Ratehub — Historique des taux hypothécaires", url: "https://www.ratehub.ca/fr/meilleurs-taux-hypothecaires" },
      { title: "BMO — Guide d'investissement FPI", url: "https://www.bmo.com/principal/particuliers/placements/centre-apprentissage/" },
    ],
  },
  impactCurrency: {
    key: "impactCurrency",
    label: "Impact sur CAD/USD et titres étrangers",
    summary:
      "Le différentiel de taux Canada–É-U est le principal moteur du taux de change CAD/USD sur des horizons de 6–24 mois (avec le prix du pétrole). Quand la Fed hausse plus vite que la BdC, l'USD se renforce vs le CAD.",
    howToRead:
      "Comparez le taux BdC vs EFFR dans l'onglet US : si le taux Fed > taux BdC de plus de ~100 pb pendant plusieurs mois, le CAD s'affaiblit. Si BdC > Fed, le CAD se renforce. Le prix du pétrole ajoute un second effet : pétrole en hausse = CAD fort (le Canada est exportateur net de pétrole).",
    whatItMeans:
      "Pour les investisseurs canadiens détenant des actions américaines directement (ex. AAPL, MSFT en USD) : un USD fort augmente les rendements convertis en CAD ; un USD faible les réduit. Sur un cycle complet, les effets de change s'annulent largement — mais sur 1–3 ans ils peuvent dominer.",
    investorAction:
      "Privilégiez par défaut l'exposition US non couverte (XUU, VFV, VUN) pour les détentions à long terme — frais moindres, et vous profitez de la force de l'USD quand la Fed mène le cycle. Utilisez les FNB couverts (XSP, VSP) seulement pour positions tactiques ou court terme. Pour fonds d'urgence ou épargne voyage US, détenez des USD réels dans un CEIE USD pour éviter les coûts de conversion deux fois.",
    links: [
      { title: "Banque du Canada — Taux de change CAD", url: "https://www.banqueducanada.ca/taux/taux-de-change/" },
      { title: "Questrade — Couverture de change expliquée", url: "https://www.questrade.com/learning/questrade-basics/currency-hedging" },
    ],
  },
};

export const RATES_GUIDE: Record<Lang, Record<RatesTopicKey, RatesTopic>> = {
  en: GUIDE_EN,
  fr: GUIDE_FR,
};
