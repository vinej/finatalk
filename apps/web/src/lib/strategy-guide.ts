import type { Lang } from "@/lib/lang";

export type StrategyLink = { title: string; url: string };

export type StrategyEntry = {
  label: string;
  summary: string;
  description: string;
  whenToUse: string;
  prosAndCons: string;
  links: StrategyLink[];
};

export const STRATEGY_KINDS = [
  "buyAndHold",
  "dollarCostAveraging",
  "valueInvesting",
  "growthInvesting",
  "dividendInvesting",
  "indexInvesting",
  "bondLaddering",
  "barbellStrategy",
  "assetAllocation",
  "coreSatellite",
  "momentumInvesting",
  "contrarianInvesting",
] as const;

export type StrategyKind = (typeof STRATEGY_KINDS)[number];

export const STRATEGY_GENERAL_LINKS: Record<Lang, StrategyLink[]> = {
  en: [
    { title: "Investopedia — Investment strategies", url: "https://www.investopedia.com/terms/i/investmentstrategy.asp" },
    { title: "Canada.ca — Savings and investments", url: "https://www.canada.ca/en/financial-consumer-agency/services/savings-investments.html" },
    { title: "AMF Quebec — Investing", url: "https://lautorite.qc.ca/en/general-public/investments" },
    { title: "Canadian Couch Potato", url: "https://canadiancouchpotato.com/" },
  ],
  fr: [
    { title: "Investopedia — Stratégies d'investissement (anglais)", url: "https://www.investopedia.com/terms/i/investmentstrategy.asp" },
    { title: "Canada.ca — Épargne et investissements", url: "https://www.canada.ca/fr/agence-consommation-matiere-financiere/services/epargne-investissements.html" },
    { title: "AMF Québec — Investissements", url: "https://lautorite.qc.ca/grand-public/investissements" },
    { title: "Canadian Couch Potato (anglais)", url: "https://canadiancouchpotato.com/" },
  ],
};

const STRATEGY_GUIDE_EN: Record<StrategyKind, StrategyEntry> = {
  buyAndHold: {
    label: "Buy and Hold",
    summary: "Purchase quality investments and hold them for years or decades, ignoring short-term market fluctuations.",
    description:
      "Buy and Hold is the simplest long-term strategy: select fundamentally sound investments — broad-market index funds, blue-chip stocks, or diversified ETFs — and hold them through all market conditions. The core premise is that markets rise over time, and the cost of trying to time entries and exits (transaction fees, taxes, missed rallies) exceeds the benefit. Historical data shows that missing just the 10 best trading days in a 20-year period can cut total returns roughly in half. By staying invested, you capture the full compounding trajectory and minimize frictional costs.",
    whenToUse:
      "Use Buy and Hold when your investment horizon is 10 years or longer and you believe in the long-term growth of the economy. It is ideal for registered accounts (TFSA, RRSP) where gains compound tax-free or tax-deferred. This strategy suits investors who prefer simplicity and can tolerate drawdowns without panic-selling.",
    prosAndCons:
      "Pros: very low transaction costs, maximum tax efficiency (fewer taxable events), harnesses the power of compounding, requires minimal time and attention. Cons: requires strong emotional discipline during bear markets, you hold underperformers along with winners, and there is no downside protection — a prolonged downturn near retirement can be damaging without a glide-path adjustment.",
    links: [
      { title: "Investopedia — Buy and Hold", url: "https://www.investopedia.com/terms/b/buyandhold.asp" },
      { title: "Canadian Couch Potato — Stay the Course", url: "https://canadiancouchpotato.com/getting-started/" },
      { title: "Vanguard Canada — Principles for investing success", url: "https://www.vanguard.ca/en/investor/investment-principles" },
    ],
  },

  dollarCostAveraging: {
    label: "Dollar-Cost Averaging (DCA)",
    summary: "Invest a fixed dollar amount at regular intervals regardless of price, smoothing your average entry cost over time.",
    description:
      "Dollar-Cost Averaging means committing a fixed amount — say $500 per month — to the same investment on a set schedule (bi-weekly, monthly). When prices are high you buy fewer units; when prices are low you buy more. Over time, this produces an average cost per unit that is lower than the average price over the same period, because you naturally accumulate more units at cheaper prices. DCA is built into many workplace plans and automatic TFSA/RRSP contribution setups, making it the default strategy for most Canadian savers.",
    whenToUse:
      "Use DCA when you invest from regular income (paycheque contributions) or when you want to deploy a lump sum gradually to reduce timing risk. It is especially effective for beginners because it removes the paralyzing question of \"is now the right time to invest?\" and enforces a savings habit.",
    prosAndCons:
      "Pros: eliminates emotional market timing, accessible to any budget, pairs perfectly with automatic TFSA/RRSP contributions, and reduces the impact of short-term volatility. Cons: in a steadily rising market, DCA underperforms a lump-sum investment about two-thirds of the time (Vanguard research), because money on the sidelines earns less than money in the market. The psychological comfort of DCA has a measurable cost in expected returns.",
    links: [
      { title: "Investopedia — Dollar-Cost Averaging", url: "https://www.investopedia.com/terms/d/dollarcostaveraging.asp" },
      { title: "Vanguard — DCA vs lump sum", url: "https://corporate.vanguard.com/content/corporatesite/us/en/corp/articles/lump-sum-versus-systematic-investing-which-approach-better.html" },
      { title: "Wealthsimple — What is DCA?", url: "https://www.wealthsimple.com/en-ca/learn/dollar-cost-averaging" },
    ],
  },

  valueInvesting: {
    label: "Value Investing",
    summary: "Buy stocks trading below their estimated intrinsic value and wait for the market to recognize their true worth.",
    description:
      "Value Investing, pioneered by Benjamin Graham and popularized by Warren Buffett, seeks stocks whose market price is significantly below their calculated intrinsic value — a concept called the \"margin of safety.\" Practitioners analyze financial statements, looking at metrics like price-to-earnings (P/E), price-to-book (P/B), free cash flow yield, and debt levels to find underappreciated companies. The strategy assumes that markets are not always efficient in the short term: fear, neglect, or temporary setbacks can push prices below fair value, creating buying opportunities for patient investors.",
    whenToUse:
      "Use Value Investing when you have the skill and patience to read financial statements, can tolerate multi-year holding periods, and are comfortable buying when sentiment is negative. It works best after market sell-offs or in sectors that are out of favour. Canadian banks and utilities often appear as value picks during broad corrections.",
    prosAndCons:
      "Pros: historically strong long-term returns across many markets, provides a disciplined framework grounded in fundamentals, and the margin of safety limits downside. Cons: value stocks can remain undervalued for years (\"value traps\"), the strategy requires significant analytical effort, and it has underperformed growth investing for extended periods (notably 2010–2020). Distinguishing a genuine bargain from a company in permanent decline is the central challenge.",
    links: [
      { title: "Investopedia — Value Investing", url: "https://www.investopedia.com/terms/v/valueinvesting.asp" },
      { title: "Morningstar — Value investing guide", url: "https://www.morningstar.com/investing-definitions/value-investing" },
      { title: "The Intelligent Investor — Summary", url: "https://www.investopedia.com/articles/07/ben_graham.asp" },
    ],
  },

  growthInvesting: {
    label: "Growth Investing",
    summary: "Target companies with above-average earnings or revenue growth, accepting higher valuations for faster compounding.",
    description:
      "Growth Investing focuses on companies whose revenues and earnings are expanding significantly faster than the market average. Growth investors accept higher price multiples (P/E, P/S) because they expect rapid compounding to justify today's premium. The strategy emphasizes total addressable market, competitive moats, recurring revenue, and management execution over current profitability. Sectors like technology, healthcare innovation, and clean energy are typical hunting grounds.",
    whenToUse:
      "Use Growth Investing when you have a long time horizon (10+ years), can tolerate sharp drawdowns (growth stocks often fall 30–50% in corrections), and want to maximize capital appreciation. It is particularly effective inside a TFSA, where all gains are permanently tax-free. Growth investing complements a core index portfolio as a satellite allocation.",
    prosAndCons:
      "Pros: potential for outsized returns that outpace inflation and the broad market, captures innovation and secular trends early. Cons: high valuations make growth stocks vulnerable to rising interest rates and sentiment shifts, most growth companies pay little or no dividends, and the winners are hard to identify in advance — many high-growth stories fail. Concentration risk is high if you pick individual names.",
    links: [
      { title: "Investopedia — Growth Investing", url: "https://www.investopedia.com/terms/g/growthinvesting.asp" },
      { title: "Fidelity — Growth vs value", url: "https://www.fidelity.com/learning-center/investment-products/mutual-funds/growth-vs-value-investing" },
      { title: "Forbes Advisor — Growth investing guide", url: "https://www.forbes.com/advisor/investing/growth-investing/" },
    ],
  },

  dividendInvesting: {
    label: "Dividend Investing",
    summary: "Build a portfolio of stocks with reliable, growing dividends to generate passive income and benefit from the Canadian dividend tax credit.",
    description:
      "Dividend Investing targets companies that pay consistent and ideally growing dividends — typically mature, cash-generating businesses like Canadian banks, utilities, telecoms, pipelines, and REITs. The strategy provides a growing income stream independent of share-price fluctuations. In Canada, eligible dividends receive preferential tax treatment through the federal and provincial dividend tax credit, making them significantly more tax-efficient than interest income in non-registered accounts. A portfolio of Canadian Dividend Aristocrats (companies that have raised dividends for 5+ consecutive years) forms a common starting point.",
    whenToUse:
      "Use Dividend Investing for income generation (retirees), portfolio stability, or to take advantage of the Canadian dividend tax credit in non-registered accounts. It also works well in TFSA (tax-free income) and RRSP (tax-deferred compounding). This strategy suits investors who prefer tangible cash returns and find it psychologically easier to hold through downturns when dividends keep flowing.",
    prosAndCons:
      "Pros: steady and growing income stream, dividend tax credit in Quebec/Canada makes effective tax rate roughly 25–35% on eligible dividends vs. up to 53% on interest income, dividends signal corporate financial health, and dividend growers have historically outperformed with lower volatility. Cons: concentrated sector exposure (financials, utilities, energy dominate Canadian dividends), high yield can signal distress (\"yield trap\"), and reinvested dividends in non-registered accounts still trigger annual tax.",
    links: [
      { title: "Investopedia — Dividend Investing", url: "https://www.investopedia.com/terms/d/dividendinvesting.asp" },
      { title: "TMX — S&P/TSX Canadian Dividend Aristocrats", url: "https://money.tmx.com/en/quote/CDZ" },
      { title: "Revenu Québec — Dividend tax credit", url: "https://www.revenuquebec.ca/en/citizens/income-tax-return/completing-your-income-tax-return/completing-your-income-tax-return/line-by-line-help/451-to-480-non-refundable-tax-credits/line-415/" },
    ],
  },

  indexInvesting: {
    label: "Index / Passive Investing",
    summary: "Replicate a broad market index through low-cost ETFs or index funds, accepting market returns at minimal cost.",
    description:
      "Index Investing means buying a fund that tracks a market index — the S&P/TSX Composite, S&P 500, or a global index like MSCI World — rather than picking individual stocks. The strategy is grounded in research showing that most active managers underperform their benchmark after fees over the long term. By minimizing management expense ratios (MER) and turnover, index investors keep more of the market's return. In Canada, popular choices include XIC (TSX), VFV or ZSP (S&P 500), ZAG (bonds), and all-in-one ETFs like XEQT, VGRO, or VBAL that combine multiple indexes in a single ticker.",
    whenToUse:
      "Use Index Investing as the default strategy for any investor who doesn't want to — or cannot — dedicate significant time to research. It works in any account type (TFSA, RRSP, RESP, non-registered). For maximum simplicity, a single asset-allocation ETF (XEQT for 100% equity, VBAL for 60/40) is all you need. This is the Canadian Couch Potato approach.",
    prosAndCons:
      "Pros: lowest cost (MERs of 0.05–0.25%), guaranteed to match market returns minus tiny fees, requires virtually no ongoing research, broad diversification reduces single-stock risk. Cons: no possibility of outperforming the market, full exposure to every downturn, no ability to avoid overvalued sectors or individual losers, and emotionally it can feel unsatisfying compared to picking winners.",
    links: [
      { title: "Investopedia — Index Fund", url: "https://www.investopedia.com/terms/i/indexfund.asp" },
      { title: "Canadian Couch Potato — Model portfolios", url: "https://canadiancouchpotato.com/model-portfolios/" },
      { title: "Vanguard Canada — ETFs", url: "https://www.vanguard.ca/en/investor/products/products-group/etfs" },
    ],
  },

  bondLaddering: {
    label: "Bond Laddering",
    summary: "Stagger bond or GIC maturities across multiple years so a portion matures each year, providing liquidity and reducing interest-rate risk.",
    description:
      "A Bond Ladder splits your fixed-income allocation across several maturity dates — for example, equal amounts in 1-, 2-, 3-, 4-, and 5-year GICs or bonds. Each year, the shortest-maturity rung matures and is reinvested at the longest maturity, maintaining the ladder. This structure smooths out the effect of interest-rate changes: if rates rise, the maturing rung captures the higher rate; if rates fall, the longer rungs lock in the previous, higher rates. In Canada, GIC ladders are especially popular because GICs at Schedule I banks are insured by CDIC up to $100,000 per eligible category.",
    whenToUse:
      "Use a Bond Ladder for the conservative or fixed-income portion of your portfolio, for retirees who need predictable income, or when you want to avoid guessing where interest rates are headed. It is especially useful in rising-rate environments where locking everything into long-term bonds would mean missing higher rates later.",
    prosAndCons:
      "Pros: reduces reinvestment risk and interest-rate timing, simple to implement with GICs at any Canadian bank or credit union, CDIC insurance on qualifying GICs, and provides regular liquidity as rungs mature. Cons: returns are lower than equities over the long term, inflation can erode purchasing power if real rates are negative, non-redeemable GICs lock capital until maturity, and building/maintaining a ladder requires periodic attention.",
    links: [
      { title: "Investopedia — Bond Ladder", url: "https://www.investopedia.com/terms/b/bondladder.asp" },
      { title: "Canada.ca — GICs", url: "https://www.canada.ca/en/financial-consumer-agency/services/savings-investments/guaranteed-investment-certificates.html" },
      { title: "CDIC — Protection for your deposits", url: "https://www.cdic.ca/your-coverage/protecting-your-deposit/" },
    ],
  },

  barbellStrategy: {
    label: "Barbell Strategy",
    summary: "Concentrate holdings at two extremes — very safe short-term assets and higher-risk long-term assets — with little in the middle.",
    description:
      "The Barbell Strategy, popularized by Nassim Nicholas Taleb, allocates capital to two ends of the risk spectrum while avoiding the middle. In a fixed-income context, this means short-term bonds or GICs (1–2 years) plus long-term bonds (20–30 years), skipping the intermediate maturities. In a broader portfolio context, it means holding very safe assets (cash, GICs, short-term government bonds) alongside aggressive assets (equities, venture-style bets), with no balanced or moderate positions. The rationale: the safe end protects against catastrophic loss while the aggressive end captures outsized upside — and the middle offers neither protection nor meaningful growth.",
    whenToUse:
      "Use the Barbell Strategy when you want clear separation between your safety net and your growth engine. It suits investors who are comfortable with a binary approach and can resist the urge to add \"moderate\" positions. It is particularly useful when yield curves are flat or inverted, making intermediate bonds unattractive relative to their risk.",
    prosAndCons:
      "Pros: explicit risk allocation (you know exactly what's safe and what's not), the short end provides liquidity and optionality to redeploy capital, and the long end benefits from convexity or equity upside. Cons: misses intermediate-term opportunities, requires active rebalancing as rungs mature or equities drift, can feel psychologically uncomfortable holding extremes, and the strategy underperforms if intermediate assets happen to deliver the best risk-adjusted returns.",
    links: [
      { title: "Investopedia — Barbell Strategy", url: "https://www.investopedia.com/terms/b/barbell.asp" },
      { title: "NerdWallet — Barbell bond strategy", url: "https://www.nerdwallet.com/article/investing/barbell-strategy" },
      { title: "Fidelity — Bond investment strategies", url: "https://www.fidelity.com/learning-center/investment-products/fixed-income-bonds/bond-investment-strategies" },
    ],
  },

  assetAllocation: {
    label: "Asset Allocation & Rebalancing",
    summary: "Set target percentages for stocks, bonds, and other assets based on your risk tolerance, then periodically rebalance back to those targets.",
    description:
      "Asset Allocation is the foundational decision that drives most of your portfolio's risk and return: what percentage goes to equities, fixed income, and other asset classes. A common starting point is your age in bonds (a 30-year-old holds 30% bonds, 70% equities), though modern approaches are more nuanced. Rebalancing is the maintenance step: when market moves push your actual allocation away from targets (e.g., a rally pushes equities from 70% to 80%), you sell the winners and buy the laggards to restore balance. This systematically enforces \"buy low, sell high.\" In Canada, all-in-one ETFs (VBAL, VGRO, XEQT, XBAL) rebalance automatically.",
    whenToUse:
      "Use Asset Allocation as the first step in any investment plan — decide your mix before choosing instruments. Rebalance annually or when any asset class drifts more than 5 percentage points from its target. Calendar rebalancing (once per year, e.g., on your birthday) is simplest. New contributions can also be directed to the underweight asset class, reducing the need to sell.",
    prosAndCons:
      "Pros: systematic discipline removes emotion, rebalancing forces contrarian behaviour (buying what's fallen), the mix is tailored to your personal risk tolerance and timeline. Cons: rebalancing in non-registered accounts triggers capital gains tax, choosing the \"right\" allocation is inherently subjective, and in prolonged bull markets, selling winners to buy bonds feels counterproductive. Over-rebalancing (too frequently) adds cost without improving returns.",
    links: [
      { title: "Investopedia — Asset Allocation", url: "https://www.investopedia.com/terms/a/assetallocation.asp" },
      { title: "Vanguard — Asset allocation models", url: "https://investor.vanguard.com/investor-resources-education/education/model-portfolio-allocation" },
      { title: "Canadian Couch Potato — Rebalancing", url: "https://canadiancouchpotato.com/rebalancing/" },
    ],
  },

  coreSatellite: {
    label: "Core-Satellite Strategy",
    summary: "Hold a diversified, low-cost index core (70–80% of portfolio) and complement it with smaller satellite positions in sectors, themes, or individual stocks.",
    description:
      "The Core-Satellite approach splits your portfolio into two tiers. The core (typically 70–80%) is a broad, low-cost index portfolio — an all-in-one ETF like XEQT or VGRO, or a simple 3-fund mix (Canadian equity, US equity, bonds). The satellites (20–30%) are smaller positions where you express conviction: a tech ETF, a handful of individual dividend stocks, a REIT ETF, or a sector you believe will outperform. The core ensures you always capture market returns at low cost, while the satellites let you tilt toward opportunities without putting the whole portfolio at risk.",
    whenToUse:
      "Use Core-Satellite when you want the reliability of passive investing but also enjoy researching and holding individual positions. It is ideal for intermediate investors who have mastered the basics and want to add a measured amount of active management. Keep satellites small enough that a total loss of any one position won't materially harm the portfolio.",
    prosAndCons:
      "Pros: combines the low cost and diversification of indexing with room for active conviction bets, limits the damage from bad picks to a small allocation, and keeps overall fees low. Cons: satellite picks may underperform the core (most active picks do over time), adds complexity and monitoring effort, and the temptation to expand the satellite portion beyond 20–30% can erode the strategy's benefits.",
    links: [
      { title: "Investopedia — Core-Satellite Investing", url: "https://www.investopedia.com/terms/c/coreplus.asp" },
      { title: "Morningstar — Core-satellite approach", url: "https://www.morningstar.com/investing-definitions/core-satellite" },
      { title: "BlackRock — Portfolio construction", url: "https://www.blackrock.com/ca/investors/en/strategies/core-satellite-investing" },
    ],
  },

  momentumInvesting: {
    label: "Momentum Investing",
    summary: "Buy assets that have been rising in price and sell those that have been falling, betting that recent trends will continue.",
    description:
      "Momentum Investing exploits the empirical observation that assets which have performed well over the past 3–12 months tend to continue outperforming in the near term, and vice versa. The academic foundation was laid by Jegadeesh and Titman (1993), and momentum has been one of the most robust and persistent risk factors in financial research. In practice, most retail investors access momentum through factor-based ETFs rather than manual stock selection, because the strategy requires high turnover and disciplined rebalancing. Momentum works across asset classes ��� stocks, bonds, currencies, commodities.",
    whenToUse:
      "Use Momentum as a factor tilt within a diversified portfolio, typically via a momentum ETF, rather than as a standalone strategy. It works best when combined with other factors (value, quality, low volatility) to diversify factor exposure. Pure momentum is not recommended for manual stock picking by most retail investors due to the high turnover and sharp reversals involved.",
    prosAndCons:
      "Pros: historically one of the strongest and most persistent risk factors, captures trending behaviour systematically, and factor-based ETFs make it accessible. Cons: subject to sudden, severe reversals (\"momentum crashes\"), high turnover generates transaction costs and short-term capital gains taxes, timing of entry and exit is critical, and momentum as a standalone factor can experience multi-year drawdowns.",
    links: [
      { title: "Investopedia — Momentum Investing", url: "https://www.investopedia.com/terms/m/momentum_investing.asp" },
      { title: "AQR — Momentum factor research", url: "https://www.aqr.com/Insights/Research/Journal-Article/Fact-Fiction-and-Momentum-Investing" },
      { title: "MSCI — Momentum factor index", url: "https://www.msci.com/msci-momentum-indexes" },
    ],
  },

  contrarianInvesting: {
    label: "Contrarian Investing",
    summary: "Go against prevailing market sentiment — buy when others are fearful, sell when others are greedy — on the premise that crowds overshoot.",
    description:
      "Contrarian Investing is built on the observation that market sentiment swings to extremes: panic drives prices below intrinsic value, and euphoria drives them above it. Contrarians deliberately buy assets that are widely hated, neglected, or in crisis, and sell or avoid those that are popular and expensive. Warren Buffett's famous advice — \"be greedy when others are fearful\" — captures the essence. Sentiment indicators like the VIX (fear index), put/call ratios, fund flow data, and investor surveys help identify extreme pessimism or optimism. There is significant overlap with Value Investing during market crashes.",
    whenToUse:
      "Use Contrarian Investing during market sell-offs, sector-specific crashes, or when sentiment indicators reach extreme pessimism. It requires strong conviction, independent analysis, and a long time horizon — you will be early, and being early feels identical to being wrong. This strategy is best suited to experienced investors who can distinguish temporary panic from genuine fundamental deterioration.",
    prosAndCons:
      "Pros: buys at discounts that the crowd creates, historically rewarded over full market cycles, and forces disciplined fundamental analysis. Cons: extreme \"catching a falling knife\" risk — assets can keep falling long after you buy, emotionally very difficult to act against consensus, can underperform for extended periods while waiting for the crowd to come around, and requires the skill to separate panic from structural decline.",
    links: [
      { title: "Investopedia — Contrarian Investing", url: "https://www.investopedia.com/terms/c/contrarian.asp" },
      { title: "Howard Marks — Oaktree memos", url: "https://www.oaktreecapital.com/insights/memos" },
      { title: "Morningstar — Contrarian approach", url: "https://www.morningstar.com/investing-definitions/contrarian-investing" },
    ],
  },
};

const STRATEGY_GUIDE_FR: Record<StrategyKind, StrategyEntry> = {
  buyAndHold: {
    label: "Buy and Hold (Acheter et conserver)",
    summary: "Acheter des placements de qualité et les conserver pendant des années ou des décennies, en ignorant les fluctuations à court terme.",
    description:
      "Buy and Hold est la stratégie à long terme la plus simple : sélectionner des placements fondamentalement solides �� fonds indiciels diversifiés, actions de premier ordre ou FNB diversifiés — et les conserver quelles que soient les conditions du marché. Le principe central est que les marchés montent sur le long terme, et que le coût des tentatives de synchronisation (frais de transaction, impôts, rallyes manqués) dépasse le bénéfice. Les données historiques montrent que manquer seulement les 10 meilleures journées de bourse sur une période de 20 ans peut réduire le rendement total d'environ la moitié. En restant investi, vous captez la trajectoire complète de capitalisation et minimisez les coûts de friction.",
    whenToUse:
      "Utilisez Buy and Hold lorsque votre horizon de placement est de 10 ans ou plus et que vous croyez à la croissance à long terme de l'économie. C'est idéal pour les comptes enregistrés (CELI, REER) où les gains se capitalisent à l'abri de l'impôt. Cette stratégie convient aux investisseurs qui préfèrent la simplicité et peuvent tolérer des baisses sans vendre dans la panique.",
    prosAndCons:
      "Avantages : coûts de transaction très faibles, efficacité fiscale maximale (moins d'événements imposables), exploite la puissance de la capitalisation, nécessite peu de temps et d'attention. Inconvénients : exige une forte discipline émotionnelle lors des marchés baissiers, vous conservez les perdants avec les gagnants, et il n'y a aucune protection contre la baisse — un repli prolongé près de la retraite peut être dommageable sans ajustement progressif.",
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
      "Avantages : élimine la synchronisation émotionnelle du marché, accessible �� tous les budgets, s'associe parfaitement aux cotisations automatiques CELI/REER, et réduit l'impact de la volatilité à court terme. Inconvénients : dans un marché en hausse régulière, le DCA sous-performe un investissement forfaitaire environ deux fois sur trois (recherche Vanguard), car l'argent en attente rapporte moins que l'argent investi. Le confort psychologique du DCA a un coût mesurable en rendement espéré.",
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
      "Un échelonnement obligataire répartit votre allocation en revenu fixe sur plusieurs dates d'échéance — par exemple, des montants égaux dans des CPG de 1, 2, 3, 4 et 5 ans. Chaque année, l'échelon le plus court arrive à échéance et est réinvesti à l'échéance la plus longue, maintenant l'échelle. Cette structure lisse l'effet des variations de taux d'intérêt : si les taux montent, l'échelon qui arrive à échéance capte le taux plus élevé ; si les taux baissent, les échelons plus longs verrouillent les taux précédents, plus élevés. Au Canada, les échelles de CPG sont particulièrement populaires parce que les CPG dans les banques de l'annexe I sont assur��s par la SADC jusqu'à 100 000 $ par catégorie admissible.",
    whenToUse:
      "Utilisez un échelonnement obligataire pour la partie conservatrice ou à revenu fixe de votre portefeuille, pour les retraités ayant besoin d'un revenu prévisible, ou lorsque vous voulez éviter de deviner la direction des taux d'intérêt. C'est particulièrement utile en période de hausse des taux, où tout bloquer dans des obligations à long terme signifierait manquer des taux plus élevés plus tard.",
    prosAndCons:
      "Avantages : réduit le risque de réinvestissement et le risque de synchronisation des taux, simple à mettre en place avec des CPG dans n'importe quelle banque ou caisse populaire canadienne, assurance SADC sur les CPG admissibles, et procure une liquidité régulière à mesure que les échelons arrivent à échéance. Inconvénients : rendements inférieurs aux actions sur le long terme, l'inflation peut éroder le pouvoir d'achat si les taux réels sont négatifs, les CPG non rachetables immobilisent le capital jusqu'à l'échéance, et construire/maintenir une échelle demande une attention périodique.",
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
      "La stratégie haltère, popularisée par Nassim Nicholas Taleb, alloue le capital aux deux extrémités du spectre de risque tout en évitant le milieu. En revenu fixe, cela signifie des obligations ou CPG à court terme (1–2 ans) plus des obligations à long terme (20–30 ans), en sautant les échéances intermédiaires. Dans un contexte de portefeuille plus large, cela signifie détenir des actifs très sûrs (liquidités, CPG, obligations gouvernementales à court terme) aux côtés d'actifs agressifs (actions, paris de type capital-risque), sans positions équilibr��es ou modérées. La logique : l'extrémité sûre protège contre les pertes catastrophiques tandis que l'extrémité agressive capte les gains exceptionnels — et le milieu n'offre ni protection ni croissance significative.",
    whenToUse:
      "Utilisez la stratégie haltère lorsque vous voulez une séparation nette entre votre filet de sécurité et votre moteur de croissance. Elle convient aux investisseurs à l'aise avec une approche binaire et qui résistent à l'envie d'ajouter des positions « modérées ». C'est particulièrement utile lorsque les courbes de rendement sont plates ou inversées, rendant les obligations intermédiaires peu attrayantes par rapport à leur risque.",
    prosAndCons:
      "Avantages : allocation de risque explicite (vous savez exactement ce qui est sûr et ce qui ne l'est pas), l'extrémité courte fournit liquidité et optionnalité pour redéployer le capital, et l'extrémité longue bénéficie de la convexité ou de la hausse des actions. Inconvénients : manque les occasions à terme intermédiaire, nécessite un rééquilibrage actif à mesure que les échelons arrivent à échéance ou que les actions dérivent, peut sembler psychologiquement inconfortable de détenir des extrêmes, et la stratégie sous-performe si les actifs intermédiaires offrent le meilleur rendement ajusté au risque.",
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
      "Le Momentum Investing exploite l'observation empirique que les actifs ayant bien performé au cours des 3 à 12 derniers mois tendent à continuer de surperformer à court terme, et inversement. La base académique a été établie par Jegadeesh et Titman (1993), et le momentum a été l'un des facteurs de risque les plus robustes et persistants en recherche financi��re. En pratique, la plupart des investisseurs particuliers accèdent au momentum via des FNB factoriels plutôt que par la sélection manuelle d'actions, car la stratégie nécessite une rotation élevée et un rééquilibrage discipliné. Le momentum fonctionne à travers les catégories d'actifs — actions, obligations, devises, mati��res premières.",
    whenToUse:
      "Utilisez le momentum comme inclinaison factorielle au sein d'un portefeuille diversifié, typiquement via un FNB momentum, plutôt que comme stratégie autonome. Il fonctionne mieux lorsqu'il est combiné avec d'autres facteurs (valeur, qualité, faible volatilité) pour diversifier l'exposition factorielle. Le momentum pur n'est pas recommandé pour la sélection manuelle d'actions par la plupart des investisseurs particuliers en raison de la rotation élevée et des retournements brusques impliqués.",
    prosAndCons:
      "Avantages : historiquement l'un des facteurs de risque les plus forts et les plus persistants, capte le comportement de tendance systématiquement, et les FNB factoriels le rendent accessible. Inconvénients : sujet à des retournements soudains et sévères (« crashes de momentum »), la rotation élevée génère des coûts de transaction et de l'impôt sur les gains en capital à court terme, le moment d'entrée et de sortie est critique, et le momentum comme facteur autonome peut connaître des baisses de plusieurs années.",
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
      "Avantages : achète à des rabais créés par la foule, historiquement r��compensé sur des cycles de marché complets, et force une analyse fondamentale disciplinée. Inconvénients : risque extrême d'« attraper un couteau qui tombe » — les actifs peuvent continuer à baisser longtemps après votre achat, émotionnellement très difficile d'agir contre le consensus, peut sous-performer pendant de longues périodes en attendant que la foule revienne, et nécessite la compétence de séparer la panique du déclin structurel.",
    links: [
      { title: "Investopedia — Contrarian Investing (anglais)", url: "https://www.investopedia.com/terms/c/contrarian.asp" },
      { title: "Howard Marks — Mémos Oaktree (anglais)", url: "https://www.oaktreecapital.com/insights/memos" },
      { title: "Morningstar — Approche à contre-courant (anglais)", url: "https://www.morningstar.com/investing-definitions/contrarian-investing" },
    ],
  },
};

export const STRATEGY_GUIDE: Record<Lang, Record<StrategyKind, StrategyEntry>> = {
  en: STRATEGY_GUIDE_EN,
  fr: STRATEGY_GUIDE_FR,
};
