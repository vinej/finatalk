import type { Lang } from "@/lib/lang";
import type { TaLink } from "@/lib/ta-guide";

export type BuySellSection = {
  id: string;
  title: string;
  body: string;
};

export type BuySellGuide = {
  intro: string;
  sections: BuySellSection[];
  links: TaLink[];
};

const EN: BuySellGuide = {
  intro:
    "Technical indicators never say *buy now* or *sell now* — they describe the state of supply and demand and shift the probabilities. The signals below are the ones established TA literature (Murphy, Pring, Elder, Wilder, Appel, Bollinger) and modern trading desks actually use. Combine two or three, check the market regime, confirm the fundamentals, size the risk — then act.",
  sections: [
    {
      id: "regime",
      title: "1. Identify the market regime first",
      body:
        "The **same indicator flips meaning depending on regime**. Check this before reading any signal:\n\n" +
        "- **Trending market** — ADX > 25, Bollinger Bands expanding, price making higher highs (or lower lows). Oscillator extremes (RSI > 70, Stoch > 80) can stay pinned for weeks — do not fade them. Trade with moving-average crossovers, MACD, and pullbacks to trend support.\n" +
        "- **Range-bound market** — ADX < 20, Bollinger Bands contracting, price oscillating between support and resistance. This is where oscillators shine: buy oversold near support, sell overbought near resistance. Avoid trend-following signals, they produce whipsaws.\n" +
        "- **Transition / squeeze** — Bollinger Band width at multi-month lows signals an imminent breakout but not direction. Wait for the first strong candle + volume to confirm the side.",
    },
    {
      id: "entry",
      title: "2. Buy signals (long entries)",
      body:
        "Higher-probability long setups share **confluence** — multiple independent signals agreeing at the same price.\n\n" +
        "- **Oversold + reversal candle at support** — RSI < 30 (or Williams %R < −80, Stoch < 20) AND a bullish hammer/engulfing AND a prior support or the 200-day MA. Classic swing-trade long.\n" +
        "- **Bullish divergence** — price makes a lower low, oscillator (RSI, MACD) makes a higher low. Strongest when it forms at major support.\n" +
        "- **Breakout with volume** — close above a horizontal resistance or descending trendline on volume ≥ 1.5× the 20-day average. Wait for the close, not the intrabar wick.\n" +
        "- **Pullback to rising moving average** — in a confirmed uptrend (ADX > 25, price above 200-day MA), a dip to the 20- or 50-day MA with oversold stochastics and a reversal candle is a high-quality add point.\n" +
        "- **Golden cross confirmed** — 50-day MA crosses above 200-day MA with ADX rising. Avoid if the cross happens on a tight, flat pair — that's not a trend.\n" +
        "- **MACD zero-line cross up** — bullish MACD crossovers are stronger when the MACD line is below zero than when it's already extended above.\n" +
        "- **PSAR flip to below price** + rising ADX — trend-following entry trigger.",
    },
    {
      id: "exit",
      title: "3. Sell signals (exits and shorts)",
      body:
        "The exit is harder than the entry. Plan it *before* you enter.\n\n" +
        "- **Overbought is a warning, not a trigger.** Exit on the *turn*: RSI back under 70, MACD rolling over, bearish divergence — not the first overbought print.\n" +
        "- **Bearish divergence at resistance** — price makes a higher high, oscillator makes a lower high, and you're into known overhead supply. High-probability fade or exit.\n" +
        "- **Break below trend support** — loss of the 20- or 50-day MA in an uptrend, especially on expanding volume, is often the first real sell signal.\n" +
        "- **Death cross confirmed** — 50-day crosses below 200-day MA, ADX rising. Lagging but reliable regime-change signal for long-term holders.\n" +
        "- **MACD bearish cross above zero** — strongest when MACD has been extended well above zero and then crosses its signal line down.\n" +
        "- **Trailing stop triggered** — the most underrated exit. ATR-based stop (e.g. 2× ATR below recent swing high) lets winners run while capping give-back.\n" +
        "- **Volatility expansion on bad news** — a 3σ move on negative catalyst usually continues 1–3 days; don't try to catch the first bounce.",
    },
    {
      id: "confirmation",
      title: "4. Confirmation and confluence",
      body:
        "A single indicator firing is noise. Two agreeing is a signal. Three aligning at the same price is a setup.\n\n" +
        "- **Pair a trend filter with a trigger** — e.g. price above 200-day MA (filter) + MACD bullish cross (trigger). Ignore triggers that fight the filter.\n" +
        "- **Pair a momentum oscillator with price structure** — RSI oversold is better at support than in mid-range.\n" +
        "- **Volume confirms price** — breakouts without volume usually fail. Distribution (price up, volume drying up) precedes tops.\n" +
        "- **Multi-timeframe agreement** — a daily buy signal aligned with a weekly uptrend has much higher odds than a daily signal fighting the weekly trend.\n" +
        "- **Avoid redundant confirmation** — RSI, Stoch, Williams %R, StochRSI all say essentially the same thing. Confluence means *different* signal families agreeing (trend + momentum + volume + structure).",
    },
    {
      id: "fundamentals",
      title: "5. Company fundamentals",
      body:
        "TA tells you **when**; fundamentals tell you **what**. Ignore either at your peril.\n\n" +
        "- **Strong fundamentals + TA weakness = accumulation opportunity.** A high-quality company pulling back to major support with oversold signals is the textbook long.\n" +
        "- **Weak fundamentals + TA strength = suspicious.** Short squeezes, meme runs, and sector rotations can lift junk — but reversion tends to be violent. Reduce size and tighten stops.\n" +
        "- **Earnings-season rules**: reduce size or flatten before reports unless the thesis *is* the earnings surprise. Post-earnings drift (stocks continuing in the report's direction for 20–60 days) is one of the most documented anomalies in finance.\n" +
        "- **Valuation context** — an RSI-oversold signal on a stock trading at 50× earnings and falling revenue is not the same as one on a stock at 10× with growing cash flow. Cheap + oversold ≫ expensive + oversold.\n" +
        "- **Check the financial-health basics** — debt trend, interest coverage, free cash flow direction, insider transactions, short interest. A TA signal against deteriorating fundamentals is a value trap.",
    },
    {
      id: "news",
      title: "6. News, catalysts and macro",
      body:
        "Price leads news, but news accelerates price.\n\n" +
        "- **Gaps on news** — gap up/down on a real catalyst (earnings, FDA, guidance) usually continues in the gap direction for 1–3 sessions. Don't fade day one.\n" +
        "- **Analyst upgrades/downgrades** — move stocks 2–5% initially, then fade over 2–6 weeks. Not a reason to enter alone.\n" +
        "- **Insider buying > selling** as a signal — clusters of insider purchases at a support level are a high-quality long filter. Insider selling is noisier (taxes, diversification).\n" +
        "- **Macro overrides TA in stress** — FOMC days, CPI prints, and major geopolitical events trump individual chart patterns. Reduce exposure around known calendar risks.\n" +
        "- **Sector and market context** — a bullish stock setup in a falling sector has lower odds. Check the sector ETF and the broad index regime before taking a single-stock signal.\n" +
        "- **News exhaustion** — when a stock stops reacting to good news (or stops falling on bad), the next move tends to be the opposite of the recent trend.",
    },
    {
      id: "risk",
      title: "7. Risk management (the only non-negotiable)",
      body:
        "You don't control price, you control size and stops. Every professional book stresses this more than any indicator.\n\n" +
        "- **Risk ≤ 1–2% of account per trade.** Position size = (account × risk%) ÷ stop distance. This lets you be wrong repeatedly and still be in the game.\n" +
        "- **Stops go where the thesis is wrong** — under a support, under a swing low, or 1–2× ATR away. Not at a round-number dollar amount.\n" +
        "- **R:R ≥ 2:1** — expected reward at least twice the expected risk. A 40% win rate at 2:1 is profitable.\n" +
        "- **Never average down on a losing thesis.** Averaging in to a *plan* (pre-set scaled entries) is different from averaging to avoid admitting you're wrong.\n" +
        "- **Trail stops in the direction of the trend** — Chandelier Exit, Parabolic SAR, or 20-day MA. Take the market out, don't predict the top.\n" +
        "- **Diversify timeframes and sectors** — if three of your positions share one thesis (e.g. long-duration tech), you have one position, not three.",
    },
    {
      id: "psychology",
      title: "8. Psychological pitfalls",
      body:
        "Most losing trades are correctly-spotted setups executed badly.\n\n" +
        "- **Confirmation bias** — you find the one indicator that supports your existing view. Defense: decide the criteria before you look at the chart.\n" +
        "- **FOMO entries** — chasing a bar that already ran. Almost always pays worse than waiting for a pullback to the moving average.\n" +
        "- **Revenge trading** — taking the next trade to recover the last loss. Best response to a loss is a *smaller* next position, not a larger one.\n" +
        "- **Anchoring to the entry price** — once filled, 'I'll sell when it gets back to even' is the worst reason to hold. Your cost basis is not a signal.\n" +
        "- **Overtrading the news** — every hour of CNBC feels like a signal. It isn't. Stick to your timeframe.\n" +
        "- **Journal every trade** — setup, thesis, risk, outcome, lesson. The journal is where edge actually compounds.",
    },
  ],
  links: [
    { title: "Investopedia — How to Use Technical Analysis", url: "https://www.investopedia.com/articles/trading/04/110304.asp" },
    { title: "Investopedia — Combining Fundamental and Technical Analysis", url: "https://www.investopedia.com/articles/trading/07/tech_fund_analysis.asp" },
    { title: "Investopedia — Position Sizing in Investment", url: "https://www.investopedia.com/terms/p/positionsizing.asp" },
    { title: "Investopedia — Risk/Reward Ratio", url: "https://www.investopedia.com/terms/r/riskrewardratio.asp" },
    { title: "Investopedia — Post-Earnings Announcement Drift (PEAD)", url: "https://www.investopedia.com/terms/p/postearnings-announcement-drift-pead.asp" },
    { title: "StockCharts ChartSchool — Trading Strategies", url: "https://chartschool.stockcharts.com/table-of-contents/trading-strategies-and-models" },
    { title: "Fidelity — Combining Fundamentals and Technicals", url: "https://www.fidelity.com/learning-center/trading-investing/technical-analysis/technical-and-fundamental-analysis" },
    { title: "Book — Murphy, Technical Analysis of the Financial Markets", url: "https://www.amazon.com/Technical-Analysis-Financial-Markets-Comprehensive/dp/0735200661" },
    { title: "Book — Elder, Trading for a Living", url: "https://www.amazon.com/Trading-Living-Psychology-Tactics-Management/dp/0471592242" },
    { title: "Book — Pring, Technical Analysis Explained", url: "https://www.amazon.com/Technical-Analysis-Explained-Fifth-Successful/dp/0071825177" },
  ],
};

const FR: BuySellGuide = {
  intro:
    "Les indicateurs techniques ne disent jamais *achetez maintenant* ou *vendez maintenant* — ils décrivent l'état de l'offre et de la demande et font pencher les probabilités. Les signaux ci-dessous sont ceux qu'utilisent réellement la littérature établie (Murphy, Pring, Elder, Wilder, Appel, Bollinger) et les salles de marché modernes. Combinez-en deux ou trois, vérifiez le régime de marché, confirmez avec les fondamentaux, dimensionnez le risque — puis agissez.",
  sections: [
    {
      id: "regime",
      title: "1. Identifier d'abord le régime de marché",
      body:
        "Le **même indicateur change de sens selon le régime**. À vérifier avant de lire n'importe quel signal :\n\n" +
        "- **Marché en tendance** — ADX > 25, bandes de Bollinger qui s'élargissent, prix qui fait de nouveaux sommets (ou creux). Les extrêmes d'oscillateurs (RSI > 70, Stoch > 80) peuvent rester collés des semaines — ne les fadez pas. Privilégiez les croisements de moyennes mobiles, le MACD et les replis sur le support de tendance.\n" +
        "- **Marché sans tendance (range)** — ADX < 20, bandes de Bollinger qui se resserrent, prix qui oscille entre support et résistance. C'est là que les oscillateurs brillent : achetez survendu près du support, vendez suracheté près de la résistance. Évitez les signaux de suivi de tendance (faux signaux).\n" +
        "- **Transition / squeeze** — largeur des bandes de Bollinger au plus bas de plusieurs mois : cassure imminente, mais direction inconnue. Attendez la première bougie forte + volume pour confirmer le côté.",
    },
    {
      id: "entry",
      title: "2. Signaux d'achat (entrées longues)",
      body:
        "Les meilleures entrées longues partagent un principe de **confluence** — plusieurs signaux indépendants qui s'accordent au même prix.\n\n" +
        "- **Survente + bougie de retournement sur support** — RSI < 30 (ou Williams %R < −80, Stoch < 20) ET bougie haussière (marteau, englobante) ET support horizontal ou MM200. Setup classique de swing trading.\n" +
        "- **Divergence haussière** — prix fait un creux plus bas, oscillateur (RSI, MACD) fait un creux plus haut. Plus fort quand il se forme sur un support majeur.\n" +
        "- **Cassure avec volume** — clôture au-dessus d'une résistance horizontale ou d'une ligne de tendance descendante, volume ≥ 1,5× la moyenne 20 jours. Attendez la clôture, pas la mèche intrabarre.\n" +
        "- **Repli sur moyenne mobile haussière** — en tendance haussière confirmée (ADX > 25, prix au-dessus de la MM200), un repli sur la MM20 ou MM50 avec stochastique en survente et bougie de retournement est un excellent point de renforcement.\n" +
        "- **Golden cross confirmé** — MM50 passe au-dessus de la MM200 avec ADX qui monte. À ignorer si le croisement survient sur un couple plat — ce n'est pas une tendance.\n" +
        "- **MACD franchit zéro à la hausse** — un croisement MACD haussier est plus fort quand la ligne MACD est sous zéro qu'au-dessus.\n" +
        "- **PSAR qui bascule sous le prix** + ADX qui monte — déclencheur d'entrée en suivi de tendance.",
    },
    {
      id: "exit",
      title: "3. Signaux de vente (sorties et shorts)",
      body:
        "La sortie est plus difficile que l'entrée. Planifiez-la *avant* d'entrer.\n\n" +
        "- **Suracheté est un avertissement, pas un déclencheur.** Sortez au *retournement* : RSI qui repasse sous 70, MACD qui roule à la baisse, divergence baissière — pas sur le premier suracheté.\n" +
        "- **Divergence baissière sur résistance** — prix fait un sommet plus haut, oscillateur fait un sommet plus bas, dans une zone de vendeurs connus. Fade ou sortie haute probabilité.\n" +
        "- **Cassure du support de tendance** — perte de la MM20 ou MM50 en tendance haussière, surtout sur volume qui s'élargit, est souvent le premier vrai signal de vente.\n" +
        "- **Death cross confirmé** — MM50 sous MM200, ADX qui monte. Signal tardif mais fiable de changement de régime pour les porteurs long terme.\n" +
        "- **MACD croisement baissier au-dessus de zéro** — plus fort quand le MACD est étendu bien au-dessus de zéro puis coupe sa ligne de signal à la baisse.\n" +
        "- **Stop suiveur déclenché** — la sortie la plus sous-estimée. Un stop basé sur l'ATR (p. ex. 2× ATR sous le plus haut récent) laisse courir les gagnants tout en limitant le give-back.\n" +
        "- **Expansion de volatilité sur mauvaise nouvelle** — un mouvement de 3σ sur catalyseur négatif continue souvent 1–3 jours ; ne pas essayer d'attraper le premier rebond.",
    },
    {
      id: "confirmation",
      title: "4. Confirmation et confluence",
      body:
        "Un seul indicateur qui parle = du bruit. Deux qui s'accordent = un signal. Trois qui s'alignent au même prix = un setup.\n\n" +
        "- **Associez un filtre de tendance et un déclencheur** — p. ex. prix au-dessus de la MM200 (filtre) + croisement haussier MACD (déclencheur). Ignorez les déclencheurs qui vont contre le filtre.\n" +
        "- **Associez oscillateur de momentum et structure de prix** — RSI survendu est bien meilleur sur support qu'en milieu de fourchette.\n" +
        "- **Le volume confirme le prix** — les cassures sans volume échouent souvent. La distribution (prix qui monte, volume qui s'assèche) précède les sommets.\n" +
        "- **Accord multi-horizons** — un signal d'achat journalier aligné avec une tendance haussière hebdomadaire a de bien meilleures chances qu'un signal journalier contre la tendance hebdo.\n" +
        "- **Évitez la confirmation redondante** — RSI, Stoch, Williams %R, StochRSI disent essentiellement la même chose. La confluence, c'est *différentes* familles de signaux (tendance + momentum + volume + structure) qui s'accordent.",
    },
    {
      id: "fundamentals",
      title: "5. Fondamentaux de l'entreprise",
      body:
        "L'AT dit **quand** ; les fondamentaux disent **quoi**. Ignorer l'un ou l'autre coûte cher.\n\n" +
        "- **Bons fondamentaux + AT faible = opportunité d'accumulation.** Une entreprise de qualité qui se replie sur un support majeur avec signaux de survente est le long classique.\n" +
        "- **Fondamentaux faibles + AT forte = suspect.** Les short squeezes, mèmes et rotations sectorielles peuvent soulever des titres de piètre qualité — mais le retour à la moyenne est violent. Réduisez la taille, resserrez les stops.\n" +
        "- **Règles en saison des résultats** : réduisez la taille ou fermez avant les rapports, sauf si la thèse *est* la surprise sur les résultats. Le post-earnings drift (le titre continue dans la direction du rapport 20–60 jours) est l'une des anomalies les mieux documentées.\n" +
        "- **Contexte de valorisation** — un RSI survendu sur un titre à 50× les bénéfices avec revenus en baisse n'a rien à voir avec un titre à 10× avec cash-flow en hausse. Bon marché + survendu ≫ cher + survendu.\n" +
        "- **Vérifiez les bases de santé financière** — tendance de la dette, couverture des intérêts, direction du free cash-flow, transactions d'initiés, short interest. Un signal AT contre des fondamentaux qui se détériorent, c'est un piège à valeur.",
    },
    {
      id: "news",
      title: "6. Nouvelles, catalyseurs et macro",
      body:
        "Le prix précède la nouvelle, mais la nouvelle accélère le prix.\n\n" +
        "- **Gaps sur nouvelle** — un gap haussier/baissier sur un vrai catalyseur (résultats, FDA, guidance) continue généralement dans le sens du gap 1–3 séances. Ne pas fader le jour 1.\n" +
        "- **Upgrades/downgrades d'analystes** — bougent les titres de 2–5% initialement, puis s'estompent sur 2–6 semaines. Pas une raison d'entrer seul.\n" +
        "- **Achats d'initiés > ventes** comme signal — des grappes d'achats d'initiés sur un support sont un excellent filtre long. Les ventes sont plus bruyantes (fiscalité, diversification).\n" +
        "- **La macro écrase l'AT en stress** — jours de FOMC, CPI, événements géopolitiques majeurs l'emportent sur les patrons graphiques individuels. Réduisez l'exposition autour des risques de calendrier connus.\n" +
        "- **Contexte sectoriel et marché** — un setup haussier dans un secteur baissier a de moins bonnes chances. Vérifiez l'ETF sectoriel et le régime de l'indice large avant d'exécuter un signal single-stock.\n" +
        "- **Épuisement des nouvelles** — quand un titre cesse de réagir aux bonnes nouvelles (ou cesse de chuter sur les mauvaises), le prochain mouvement va souvent à l'opposé de la tendance récente.",
    },
    {
      id: "risk",
      title: "7. Gestion du risque (non négociable)",
      body:
        "Vous ne contrôlez pas le prix, vous contrôlez la taille et les stops. C'est ce que tout livre professionnel souligne plus que n'importe quel indicateur.\n\n" +
        "- **Risque ≤ 1–2% du compte par trade.** Taille = (compte × risque%) ÷ distance du stop. Cela vous permet de vous tromper à répétition et de rester dans la partie.\n" +
        "- **Le stop va là où la thèse est invalidée** — sous un support, sous un creux, ou à 1–2× ATR. Pas à un montant rond en dollars.\n" +
        "- **R:R ≥ 2:1** — espérance de gain au moins deux fois le risque. Un taux de réussite de 40% à 2:1 est profitable.\n" +
        "- **Ne jamais moyenner à la baisse sur une thèse perdante.** Moyenner selon un *plan* (entrées échelonnées prédéfinies) est différent de moyenner pour ne pas admettre qu'on a tort.\n" +
        "- **Trainez les stops dans le sens de la tendance** — Chandelier Exit, Parabolic SAR, ou MM20. Laissez le marché vous sortir, ne prédisez pas le sommet.\n" +
        "- **Diversifiez horizons et secteurs** — si trois positions partagent une seule thèse (p. ex. tech longue durée), vous avez une seule position, pas trois.",
    },
    {
      id: "psychology",
      title: "8. Pièges psychologiques",
      body:
        "La plupart des trades perdants sont des setups correctement identifiés mais mal exécutés.\n\n" +
        "- **Biais de confirmation** — vous trouvez l'indicateur qui appuie votre opinion. Parade : décidez des critères avant de regarder le graphique.\n" +
        "- **FOMO** — courir après une bougie déjà partie. Attendre un repli sur la moyenne mobile paie presque toujours mieux.\n" +
        "- **Trading de revanche** — prendre le trade suivant pour récupérer la perte. La bonne réponse à une perte est une taille *plus petite*, pas plus grande.\n" +
        "- **Ancrage au prix d'entrée** — une fois servi, « je vendrai quand ça reviendra au break-even » est la pire raison de tenir. Votre prix de revient n'est pas un signal.\n" +
        "- **Sur-trading sur les nouvelles** — chaque heure de CNBC ressemble à un signal. Ça n'en est pas un. Tenez votre horizon.\n" +
        "- **Journal de trades** — setup, thèse, risque, résultat, leçon. C'est là que l'edge se construit vraiment.",
    },
  ],
  links: [
    { title: "Investopedia — How to Use Technical Analysis (anglais)", url: "https://www.investopedia.com/articles/trading/04/110304.asp" },
    { title: "Investopedia — Combining Fundamental and Technical Analysis (anglais)", url: "https://www.investopedia.com/articles/trading/07/tech_fund_analysis.asp" },
    { title: "Investopedia — Position Sizing (anglais)", url: "https://www.investopedia.com/terms/p/positionsizing.asp" },
    { title: "Investopedia — Ratio risque/rendement (anglais)", url: "https://www.investopedia.com/terms/r/riskrewardratio.asp" },
    { title: "Investopedia — Post-Earnings Announcement Drift (anglais)", url: "https://www.investopedia.com/terms/p/postearnings-announcement-drift-pead.asp" },
    { title: "StockCharts ChartSchool — Trading Strategies (anglais)", url: "https://chartschool.stockcharts.com/table-of-contents/trading-strategies-and-models" },
    { title: "Fidelity — Combining Fundamentals and Technicals (anglais)", url: "https://www.fidelity.com/learning-center/trading-investing/technical-analysis/technical-and-fundamental-analysis" },
    { title: "Livre — Murphy, Technical Analysis of the Financial Markets", url: "https://www.amazon.com/Technical-Analysis-Financial-Markets-Comprehensive/dp/0735200661" },
    { title: "Livre — Elder, Trading for a Living", url: "https://www.amazon.com/Trading-Living-Psychology-Tactics-Management/dp/0471592242" },
    { title: "Livre — Pring, Technical Analysis Explained", url: "https://www.amazon.com/Technical-Analysis-Explained-Fifth-Successful/dp/0071825177" },
  ],
};

export const BUY_SELL_GUIDE: Record<Lang, BuySellGuide> = { en: EN, fr: FR };
