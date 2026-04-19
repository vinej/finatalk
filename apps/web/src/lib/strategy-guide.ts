import type { Lang } from "@/lib/lang";

export type StrategyLink = { title: string; url: string };

export type StrategyStep = {
  title: string;
  body: string;
};

export type StrategyEntry = {
  label: string;
  summary: string;
  description: string;
  whenToUse: string;
  prosAndCons: string;
  links: StrategyLink[];
  indicatorsUsed?: string[];
  coreIdea?: string;
  steps?: StrategyStep[];
  whyItWorks?: string;
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
  "trendPullback",
  "breakoutMomentum",
  "meanReversion",
  "maCrossover",
  "supportResistancePullback",
  "openingRangeBreakout",
  "vwapStrategy",
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
    coreIdea:
      "Time in the market beats timing the market. Pick quality, stay invested, let compounding do the work.",
    steps: [
      {
        title: "Step 1: Confirm your horizon is 10+ years",
        body:
          "Money you might need in under 10 years should not be in equities. If your horizon is shorter, Buy and Hold is the wrong strategy — use GICs or short-term bonds for that portion.",
      },
      {
        title: "Step 2: Choose a diversified vehicle",
        body:
          "For most investors, a single all-in-one ETF (XEQT for 100% equities, VGRO for 80/20, VBAL for 60/40) is the whole strategy. Individual-stock Buy and Hold works only if you already know how to read financial statements.",
      },
      {
        title: "Step 3: Use the right account type",
        body:
          "TFSA first (tax-free forever), then RRSP (tax-deferred, reduces taxable income). Only use non-registered accounts once registered room is full.",
      },
      {
        title: "Step 4: Automate contributions",
        body:
          "Set a monthly automatic transfer to your brokerage (even $100). Automation removes the emotional question of 'should I buy today?' and is the single biggest predictor of long-term success.",
      },
      {
        title: "Step 5: Turn off the noise",
        body:
          "Unsubscribe from market news, delete trading apps from your phone's home screen, and check your portfolio at most once per quarter. The worst thing you can do is sell during a crash.",
      },
      {
        title: "Step 6: Rebalance once a year",
        body:
          "If you hold a single all-in-one ETF, it rebalances itself. Otherwise, on a fixed date each year (your birthday works), bring your allocation back to target — sell what's over, buy what's under.",
      },
    ],
    whyItWorks:
      "Over long periods, equity markets compound at ~7–9% real. Missing the best 10 days cuts returns by half, but predicting those days is essentially impossible. Staying invested guarantees you capture them.",
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
    coreIdea:
      "You can't time the market, so don't try. Invest the same amount on the same day every month — you automatically buy more when prices are low and less when they're high.",
    steps: [
      {
        title: "Step 1: Pick a fixed amount you won't miss",
        body:
          "Start with something you'd barely notice (5–10% of net pay is a common anchor). The amount is less important than consistency. $100/month for 30 years beats $500/month for 3 years.",
      },
      {
        title: "Step 2: Pick a fixed schedule",
        body:
          "Monthly on payday is the easiest. Bi-weekly also works. Never pick a schedule that requires you to 'decide' each time — the whole point is to remove the decision.",
      },
      {
        title: "Step 3: Pick a single diversified target",
        body:
          "A broad-market ETF (XEQT, VFV, VEQT) or all-in-one (VGRO, XBAL) is ideal. Don't try to DCA into individual stocks — concentration risk defeats the smoothing effect.",
      },
      {
        title: "Step 4: Automate the transfer and the buy",
        body:
          "Set up an automatic transfer from your bank to your brokerage, and — if your broker supports it — an automatic purchase (Wealthsimple, Questrade, most robo-advisors). No manual step should ever be required.",
      },
      {
        title: "Step 5: Keep buying during crashes",
        body:
          "This is where DCA earns its reputation. When the market drops 30%, your fixed contribution buys 30% more units. If you can't stomach buying during a crash, add a written reminder to your schedule: 'crashes make DCA work.'",
      },
      {
        title: "Step 6: Review yearly, not monthly",
        body:
          "Check once a year (e.g. every January) that the schedule is still running and the amount still fits your budget. Increase contributions after raises.",
      },
    ],
    whyItWorks:
      "DCA removes two of the biggest failure modes for retail investors: bad timing and emotional paralysis. It won't beat a lucky lump-sum buy at a market bottom, but it vastly outperforms waiting for 'the right moment' — which almost nobody catches.",
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
    coreIdea:
      "Price is what you pay, value is what you get. Buy $1 of business for 60 cents; wait for the market to close the gap.",
    steps: [
      {
        title: "Step 1: Screen for cheap fundamentals",
        body:
          "Start with filters: P/E < 15, P/B < 1.5, debt/equity < 1, positive free cash flow, dividend yield > 2%. Many broker screeners do this for free. This gives you a candidate list of ~30–50 companies.",
      },
      {
        title: "Step 2: Read the annual report",
        body:
          "Skim the 10-K/annual report for the most recent year. You're looking for: consistent revenue, growing or stable free cash flow, understandable business model, management discussing real risks (not just PR). If you can't explain what the company does in one sentence, pass.",
      },
      {
        title: "Step 3: Estimate intrinsic value",
        body:
          "Simplest method: 10-year average free cash flow × 12–15 (a conservative multiple), divided by share count. If the market price is 30%+ below this number, you have a margin of safety.",
      },
      {
        title: "Step 4: Check why it's cheap",
        body:
          "Cheap for a reason (declining industry, lawsuit, fraud) = value trap. Cheap because of temporary panic (sector rotation, one-time earnings miss, broad market sell-off) = opportunity. Read recent news headlines and understand the story.",
      },
      {
        title: "Step 5: Buy in tranches",
        body:
          "Split your position into 3 parts. Buy 1/3 at initial target, 1/3 if price drops another 15%, 1/3 if it drops another 15%. This protects against being early (which is the normal outcome).",
      },
      {
        title: "Step 6: Set a thesis expiration",
        body:
          "Write down why you bought and what would change your mind. If the thesis breaks (permanent deterioration, dividend cut, debt spiral), sell — don't anchor on cost. If price reaches fair value, consider trimming.",
      },
    ],
    whyItWorks:
      "Markets are efficient in the long run but emotional in the short run. A margin of safety protects you when you're wrong, and rewards you when you're right. The Fama–French research shows value has been a persistent risk premium over decades.",
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
    coreIdea:
      "Pay up for businesses compounding revenue at 20%+. A great company at a fair price beats a fair company at a great price.",
    steps: [
      {
        title: "Step 1: Screen for sustained growth",
        body:
          "Filters: revenue growth > 15% for 3+ consecutive years, gross margin > 50% (software) or > 30% (hardware), positive or improving operating margin. Many high-growth money-losers never reach profitability — margin trajectory matters.",
      },
      {
        title: "Step 2: Identify the moat",
        body:
          "Ask: why can't a competitor do this tomorrow? Network effects (more users = more value), switching costs (data lock-in), scale economies, patents, brand. No durable moat = no durable growth.",
      },
      {
        title: "Step 3: Size the addressable market",
        body:
          "If the company already owns half its market, future growth must come from new markets — which is hard. Prefer companies with < 10% penetration of a large, growing market.",
      },
      {
        title: "Step 4: Limit position size",
        body:
          "Single growth stocks should be 2–5% of portfolio max, even high-conviction names. For broader exposure, use a growth ETF (VUG, QQQ, XIT) instead — similar returns, far less idiosyncratic risk.",
      },
      {
        title: "Step 5: Use the TFSA",
        body:
          "Growth winners can multiply 10× or more over a decade. All of that gain is tax-free inside a TFSA. Never hold high-growth single stocks in a non-registered account if TFSA room is available.",
      },
      {
        title: "Step 6: Hold through volatility, sell on thesis breaks",
        body:
          "30–50% drawdowns are normal for growth stocks mid-bull-run. Sell only when the thesis breaks: growth decelerates materially, key executive leaves, moat erodes. Don't sell just because the stock fell.",
      },
    ],
    whyItWorks:
      "A company compounding at 25% doubles every ~3 years. Even a rich valuation today becomes cheap if earnings catch up. The challenge is identifying the rare businesses that can actually sustain that growth.",
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
    coreIdea:
      "Build a growing stream of cash flow you don't have to sell shares to receive. Let the business pay you directly.",
    steps: [
      {
        title: "Step 1: Target sustainable yields (2.5–5%)",
        body:
          "Yields over 7% often signal trouble (price collapsed, dividend at risk). Yields under 2% mean you're paying growth prices. The sweet spot for mature dividend payers is 2.5–5%.",
      },
      {
        title: "Step 2: Check the payout ratio",
        body:
          "Payout ratio = dividends ÷ earnings. Below 60% is healthy for most sectors; REITs and utilities can run higher (70–85%). Above 100% means the dividend is being funded by debt — a red flag.",
      },
      {
        title: "Step 3: Prioritize dividend growth over dividend yield",
        body:
          "A company raising its dividend 6–10% per year for a decade is far more valuable than a stagnant 7% yielder. Canadian Dividend Aristocrats (5+ years of increases) and Dividend Kings (25+ years) are a curated starting universe.",
      },
      {
        title: "Step 4: Diversify across sectors",
        body:
          "Canadian dividends concentrate in 3 sectors: financials, utilities, energy/pipelines. Spread across all three plus telecoms and REITs — or use a dividend ETF (VDY, CDZ, XEI) for instant diversification.",
      },
      {
        title: "Step 5: Use tax-smart accounts",
        body:
          "Canadian eligible dividends: best in non-registered accounts (dividend tax credit). US dividends: best in RRSP (no 15% US withholding). Foreign dividends: TFSA is fine if the country has no withholding treaty, otherwise RRSP.",
      },
      {
        title: "Step 6: Reinvest (DRIP) until you need the income",
        body:
          "Most Canadian brokers offer DRIP (dividend reinvestment) for free. Enable it during accumulation years — it compounds automatically without transaction fees. Switch to cash payouts only when you actually need the income.",
      },
    ],
    whyItWorks:
      "Dividends are real cash that doesn't depend on selling shares. A 4% yield growing 7%/year compounds to a 7–8% yield on cost in a decade. The discipline of paying dividends also filters for financially healthy businesses.",
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
    coreIdea:
      "Don't find the needle, buy the haystack. Match the market cheaply and let fees, not picks, decide your lifetime outcome.",
    steps: [
      {
        title: "Step 1: Decide stocks vs bonds mix",
        body:
          "Under 40, want growth: 100% stocks (XEQT, VEQT). 40–55, approaching retirement: 80/20 (VGRO, XGRO). Near retirement: 60/40 (VBAL, XBAL). The specific ETF matters less than getting the mix right.",
      },
      {
        title: "Step 2: Pick ONE all-in-one ETF",
        body:
          "Don't overthink it. XEQT and VEQT are nearly identical; XBAL and VBAL are nearly identical. One ticker, one decision, done. Resist the urge to pick 5 different ETFs 'for diversification' — the all-in-one already is diversified.",
      },
      {
        title: "Step 3: Open an account with a low-cost broker",
        body:
          "Questrade (free ETF buys), Wealthsimple Trade (free trades), National Bank Direct Brokerage (free ETFs). Avoid mutual-fund MERs of 2%+ from traditional banks — that's 2% of your money disappearing every year forever.",
      },
      {
        title: "Step 4: Set up automatic contributions",
        body:
          "Auto-transfer from chequing to brokerage every payday. Auto-buy the ETF if supported. This turns index investing from a series of decisions into a single one-time setup.",
      },
      {
        title: "Step 5: Ignore it for 10–30 years",
        body:
          "Truly the hardest step. The index will drop 30%+ multiple times during your life. The all-in-one rebalances itself. Your job is to not sell. Check the balance once a year, not once a day.",
      },
      {
        title: "Step 6: Glide toward bonds as retirement nears",
        body:
          "5–10 years before retirement, consider shifting from XEQT to XGRO, then XBAL. A single switch inside a TFSA has no tax impact; in non-registered accounts, do it gradually with new contributions.",
      },
    ],
    whyItWorks:
      "SPIVA data shows ~80% of active managers underperform the index over 10+ years after fees. Indexing guarantees you capture the market return minus a tiny fee — which over decades beats 80% of professionals.",
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
    coreIdea:
      "Stop guessing where rates are headed. Split your fixed income across maturities so one rung matures every year and you always reinvest at current rates.",
    steps: [
      {
        title: "Step 1: Decide the ladder length",
        body:
          "5-year ladder (1/2/3/4/5 years) is standard and easy. Shorter ladders (1–3 years) if you expect rates to keep rising; longer (1–10 years) if you expect them to fall.",
      },
      {
        title: "Step 2: Divide your fixed-income capital into equal rungs",
        body:
          "If you have $50,000 and a 5-year ladder: $10,000 in each of 1, 2, 3, 4, and 5-year GICs. Equal rungs keep the math simple and smooth the reinvestment.",
      },
      {
        title: "Step 3: Use CDIC-insured GICs at a Canadian bank",
        body:
          "Schedule I banks and most credit unions are CDIC/DGCM-covered up to $100,000 per category. Spread across institutions if you exceed that.",
      },
      {
        title: "Step 4: Set calendar reminders for each maturity",
        body:
          "Each year, when the 1-year rung matures, reinvest it into a new 5-year GIC (the longest rung). Without the reminder, the money sits in a low-interest savings account and the ladder breaks.",
      },
      {
        title: "Step 5: Adapt to rate regimes",
        body:
          "In aggressively rising rates, temporarily shorten new purchases (1–2 years) so you can reprice quickly. In aggressively falling rates, extend new purchases to 5 years to lock in today's higher rate.",
      },
      {
        title: "Step 6: Consider ETF bond ladders",
        body:
          "RBC and BMO offer target-maturity bond ETFs (ZTM, RBEQ) that behave like bonds but trade like stocks. They give you ladder mechanics with daily liquidity, at the cost of some MER.",
      },
    ],
    whyItWorks:
      "You can't predict rates, but you can structure around ignorance. A ladder guarantees you always have a rung maturing — so you're never forced to sell at a loss or reinvest the entire portfolio at a bad rate.",
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
    coreIdea:
      "Protect what you can't afford to lose, then take real risk with what's left. The middle is where you get the worst of both.",
    steps: [
      {
        title: "Step 1: Define 'safe' capital",
        body:
          "Safe = money you absolutely cannot lose: emergency fund (3–6 months expenses), near-term goals (1–3 years out), floor for retirement. Hold in HISAs, cashable GICs, or short-term treasury ETFs (CBIL, XSB).",
      },
      {
        title: "Step 2: Define 'risk' capital",
        body:
          "Risk = money whose loss you could tolerate without lifestyle impact. This is where you take real bets: equities, growth stocks, concentrated positions, possibly crypto or venture investments. Accept that some of it may go to zero.",
      },
      {
        title: "Step 3: Skip the middle",
        body:
          "No 'moderate' 60/40 funds, no balanced portfolios. The middle gives you equity-like drawdowns with bond-like returns. Either safe or risky — nothing in between.",
      },
      {
        title: "Step 4: Size the two ends",
        body:
          "Classic Taleb formulation: 80–90% safe, 10–20% risky (with risky being highly asymmetric upside). Moderate version: 60% safe, 40% high-conviction equities. Adapt to your personal floor.",
      },
      {
        title: "Step 5: Rebalance on large moves",
        body:
          "If the risk end triples, rebalance partial gains into the safe end to lock in permanent safety. If the risk end falls sharply, consider moving some safe capital into risk — but only if your floor is still intact.",
      },
      {
        title: "Step 6: Protect the floor at all costs",
        body:
          "The whole point of the barbell is that the safe end is untouchable. Never let a losing risky bet bleed into the safe capital. If it does, the strategy has failed — you no longer have a floor.",
      },
    ],
    whyItWorks:
      "Exposure to convex upside (risky end) is mathematically valuable. Exposure to downside floor (safe end) is psychologically valuable. Middle-risk assets give you neither — you underperform safe assets in crises and risky assets in booms.",
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
    coreIdea:
      "What you own (stocks vs bonds mix) matters more than which specific stocks or bonds you own. Set the mix, then defend it.",
    steps: [
      {
        title: "Step 1: Assess your honest risk tolerance",
        body:
          "Not the comfortable answer — the real one. Could you watch 40% of your portfolio disappear in 2 months and do nothing? If not, cap equities at 60%. If yes, you can go 80–100%.",
      },
      {
        title: "Step 2: Set target percentages",
        body:
          "Simple formula: 110 − age = % in equities. 30 years old → 80% equities / 20% bonds. Adjust ±10% for risk tolerance. Write the targets down — this is your constitution.",
      },
      {
        title: "Step 3: Pick instruments to match",
        body:
          "Equity sleeve: broad ETFs (XEQT, VFV). Bond sleeve: broad bond ETFs (XBB, ZAG). Or skip this step entirely with an all-in-one ETF (VBAL = 60/40, VGRO = 80/20) that matches your target.",
      },
      {
        title: "Step 4: Calculate drift thresholds",
        body:
          "Rebalance when any sleeve drifts more than 5 percentage points from target (70% equities → 75% triggers). More sensitive thresholds (3%) add trading cost without improving outcomes.",
      },
      {
        title: "Step 5: Rebalance on a fixed calendar",
        body:
          "Pick one day a year (birthday, January 2nd, tax-filing day). Check drift, rebalance only if beyond threshold. Use new contributions to buy the underweight sleeve first — this avoids selling and minimizes taxes.",
      },
      {
        title: "Step 6: Glide path toward retirement",
        body:
          "5–10 years before retirement, start shifting 1–2% per year from equities to bonds. By retirement, a 40–60% equity allocation is common. In early retirement, gradually re-raise equities (the 'rising glide path' guards against sequence-of-returns risk).",
      },
    ],
    whyItWorks:
      "Brinson/Singer/Beebower research suggests ~90% of return variability comes from asset allocation, not security selection. Rebalancing systematically 'sells high and buys low' without requiring any market forecasting skill.",
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
    coreIdea:
      "Guarantee the market return on 80% of your money, then have fun with 20%. Let the core do the work; let the satellites scratch the itch.",
    steps: [
      {
        title: "Step 1: Build the core first (70–80%)",
        body:
          "Start with an all-in-one ETF or 3-fund mix at 100% of your portfolio for the first year. Don't add satellites until the core is fully funded and you've lived through at least one small correction.",
      },
      {
        title: "Step 2: Cap satellites at 20–30%",
        body:
          "Write down the cap in your investment plan. The most common failure mode is 'just one more position' until satellites become 50%+ of the portfolio and eat the diversification benefit.",
      },
      {
        title: "Step 3: Define satellite categories",
        body:
          "Three common buckets: (1) sector/thematic ETFs (tech, healthcare, clean energy), (2) factor tilts (small-cap value, quality, momentum), (3) individual high-conviction stocks. Pick 2–5 satellites total — more just dilutes conviction.",
      },
      {
        title: "Step 4: Size satellites by conviction, not enthusiasm",
        body:
          "Max 5% per single-stock satellite, max 10% per ETF satellite. If a satellite triples and exceeds its cap, trim back to the target — that's locked-in alpha.",
      },
      {
        title: "Step 5: Benchmark satellites quarterly",
        body:
          "Every 3 months, compare each satellite's return vs. the core. A satellite that underperforms the core over 3 full years isn't a satellite — it's a drag. Replace or sell.",
      },
      {
        title: "Step 6: Never touch the core to fund a satellite",
        body:
          "Fund new satellites from fresh contributions, not by selling the core. Selling the core means you're increasing risk to chase an idea — the exact mistake Core-Satellite is designed to prevent.",
      },
    ],
    whyItWorks:
      "The core guarantees you're not catastrophically wrong — you'll always match the market on 70–80% of capital. The satellites cap active-management risk at 20–30%, so even a total satellite loss only costs you a fraction of the portfolio.",
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
      "Momentum Investing exploits the empirical observation that assets which have performed well over the past 3–12 months tend to continue outperforming in the near term, and vice versa. The academic foundation was laid by Jegadeesh and Titman (1993), and momentum has been one of the most robust and persistent risk factors in financial research. In practice, most retail investors access momentum through factor-based ETFs rather than manual stock selection, because the strategy requires high turnover and disciplined rebalancing. Momentum works across asset classes — stocks, bonds, currencies, commodities.",
    whenToUse:
      "Use Momentum as a factor tilt within a diversified portfolio, typically via a momentum ETF, rather than as a standalone strategy. It works best when combined with other factors (value, quality, low volatility) to diversify factor exposure. Pure momentum is not recommended for manual stock picking by most retail investors due to the high turnover and sharp reversals involved.",
    prosAndCons:
      "Pros: historically one of the strongest and most persistent risk factors, captures trending behaviour systematically, and factor-based ETFs make it accessible. Cons: subject to sudden, severe reversals (\"momentum crashes\"), high turnover generates transaction costs and short-term capital gains taxes, timing of entry and exit is critical, and momentum as a standalone factor can experience multi-year drawdowns.",
    indicatorsUsed: ["12-month price return (rolling)", "6-month price return", "200-day moving average", "Relative strength vs index"],
    coreIdea:
      "What's going up tends to keep going up for a while. Ride the trend, get out when it breaks — don't predict tops.",
    steps: [
      {
        title: "Step 1: Decide: ETF or manual picks?",
        body:
          "For most investors, a momentum ETF (MTUM in US, XMU or ZMU in Canada) is the right answer — you get the factor without the turnover work. Only go manual if you enjoy the research and can commit to the mechanics.",
      },
      {
        title: "Step 2: Define the momentum window (manual)",
        body:
          "Standard academic definition: rank stocks by their 12-month return skipping the most recent month (12-1 momentum). Buy the top decile, hold for 1–3 months, rebalance. Skipping the last month avoids short-term reversals.",
      },
      {
        title: "Step 3: Apply a trend filter",
        body:
          "Only go long when the broader index is above its 200-day moving average. Momentum works brilliantly in trending markets and crashes in choppy/reversing ones. This single filter eliminates most of the worst drawdowns.",
      },
      {
        title: "Step 4: Set strict exit rules",
        body:
          "Exit any position that drops below its 50-day MA, or when its 12-1 momentum rank falls out of the top half. No thinking, no 'maybe it'll bounce' — momentum fails when you hesitate.",
      },
      {
        title: "Step 5: Size positions equally, not by conviction",
        body:
          "Momentum is statistical, not narrative. Don't overweight a name because you like the story — that's not how the factor works. Equal-weight 10–20 positions.",
      },
      {
        title: "Step 6: Accept momentum crashes happen",
        body:
          "Every 5–10 years, momentum experiences a violent reversal (Q2 2009, March 2020). Drawdowns of 20–30% in a few weeks are part of the factor. If you can't hold through that, use an ETF or skip momentum entirely.",
      },
    ],
    whyItWorks:
      "Behavioural biases (anchoring, under-reaction to news, herding) keep prices trending longer than efficient-markets theory predicts. Momentum is the systematic exploitation of that slow reaction.",
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
    indicatorsUsed: ["VIX (fear index)", "Put/Call ratio", "AAII sentiment survey", "Fund flows", "52-week low count"],
    coreIdea:
      "The crowd is right during the trend and wrong at the turns. Buy what everyone hates; sell what everyone loves.",
    steps: [
      {
        title: "Step 1: Watch sentiment extremes, not price alone",
        body:
          "VIX > 30 (fear), AAII bearish > 50% (capitulation), fund outflows at multi-year highs — those are the setups. A 20% decline with sentiment still complacent is not yet an opportunity.",
      },
      {
        title: "Step 2: Distinguish panic from decline",
        body:
          "Panic = widespread pessimism + intact fundamentals + forced selling. Decline = business deterioration + insider selling + cash burn. The first is opportunity; the second is a trap. Check the 10-K, not the price chart.",
      },
      {
        title: "Step 3: Build a shopping list BEFORE the crash",
        body:
          "During calm markets, write down the quality companies you'd want to own if they were 30–50% cheaper. When panic hits, the list tells you what to do — you don't have to think, just execute.",
      },
      {
        title: "Step 4: Buy in tranches, not all at once",
        body:
          "Split your contrarian capital into 3–4 tranches. Deploy one when fear first spikes, another on confirmed capitulation (major down day on huge volume), a third on a false rally that rolls over. Keep one in reserve — panics get worse than you expect.",
      },
      {
        title: "Step 5: Ignore headlines after you buy",
        body:
          "The worst days to buy feel apocalyptic. Financial media will be uniformly bearish. That's the feature, not the bug. If you're waiting for good news before buying, you'll pay 40% more.",
      },
      {
        title: "Step 6: Sell into greed, not into strength",
        body:
          "The reverse also applies. When the same assets are loved by everyone, valuations stretched, and media bullish — start trimming. You won't catch the top, and that's fine.",
      },
    ],
    whyItWorks:
      "Markets are efficient on average but wrong at the extremes. When everyone already sold, there's no one left to sell; when everyone already bought, there's no one left to buy. Turning points are crowded trades unraveling.",
    links: [
      { title: "Investopedia — Contrarian Investing", url: "https://www.investopedia.com/terms/c/contrarian.asp" },
      { title: "Howard Marks — Oaktree memos", url: "https://www.oaktreecapital.com/insights/memos" },
      { title: "Morningstar — Contrarian approach", url: "https://www.morningstar.com/investing-definitions/contrarian-investing" },
    ],
  },

  trendPullback: {
    label: "Trend Pullback Strategy (EMA + RSI + VWAP)",
    summary: "Wait for a clear trend, a pullback toward dynamic support, then a confirmation candle before rejoining the trend. Used by swing and intraday traders to avoid buying tops and selling bottoms.",
    description:
      "The Trend Pullback Strategy is a disciplined, indicator-driven approach to riding existing trends instead of chasing price. It combines a trend filter (20 EMA and 50 EMA), a timing tool (RSI 14), and an institutional reference price (VWAP for intraday). The strategy deliberately refuses to trade choppy, non-trending markets — which is where most beginners lose money. Entries only happen on three-way confirmation: clear trend + pullback + reversal candle. It works on both daily (swing) and intraday (day-trade) timeframes, and on liquid instruments (index ETFs, large-cap stocks, major FX pairs).",
    whenToUse:
      "Use Trend Pullback when you have a clearly trending instrument (ADX > 20 is a useful sanity check), liquid price action (no illiquid microcaps), and you can wait patiently for the setup. Best suited to swing trades (days to weeks) using 20/50 EMAs on daily candles, or intraday trades using VWAP as the anchor. Skip it on choppy, range-bound markets — the strategy will whipsaw and hurt.",
    prosAndCons:
      "Pros: high-probability setups because you require three independent confirmations (trend, pullback, reversal), well-defined stop-loss placement (below swing low), pairs with clear risk/reward rules, works across timeframes. Cons: you miss the strongest moves (the ones that never pull back), lots of setups that 'almost' trigger but don't, requires patience and discipline, fails in choppy regimes, and intraday version requires active screen time.",
    indicatorsUsed: ["20 EMA (short-term trend)", "50 EMA (trend filter)", "RSI (14) (timing/momentum)", "VWAP (intraday anchor)"],
    coreIdea:
      "You don't chase price. You wait for a clear trend, then a pullback, then a confirmation to rejoin the trend.",
    steps: [
      {
        title: "Step 1: Identify the trend",
        body:
          "Uptrend: price above 50 EMA AND 20 EMA above 50 EMA.\nDowntrend: price below 50 EMA AND 20 EMA below 50 EMA.\nIf neither is true (EMAs flat or tangled), the instrument is not trending — do nothing. This is where most people lose money: trying to force a trade on a sideways chart.",
      },
      {
        title: "Step 2: Wait for a pullback",
        body:
          "In an uptrend: price pulls back toward the 20 EMA or VWAP, and RSI drops toward the 40–50 zone (NOT below 30 — you don't want extreme oversold, you want a normal pullback in an uptrend).\nIn a downtrend: price rallies toward the 20 EMA or VWAP, and RSI rises toward the 50–60 zone.\nThis avoids buying tops and selling bottoms.",
      },
      {
        title: "Step 3: Entry trigger (confirmation)",
        body:
          "Do not enter blindly at the EMA. Wait for all three:\nFor a BUY (uptrend):\n• Price holds above the 20 EMA or VWAP (touch and bounce, not break)\n• RSI turns upward (e.g. from ~45 → 50+)\n• A bullish candle forms (higher close, ideally a hammer or bullish engulfing)\nFor a SELL (downtrend):\n• Price rejects the 20 EMA or VWAP from below\n• RSI turns downward\n• Bearish candle confirmation (lower close, bearish engulfing)",
      },
      {
        title: "Step 4: Place your stop loss",
        body:
          "Keep it simple and mechanical:\n• For buys: stop below the recent swing low (the low of the pullback you just bought from)\n• For sells: stop above the recent swing high\nThis places the stop where your thesis is invalidated — if price returns there, the trend is breaking.",
      },
      {
        title: "Step 5: Take profit",
        body:
          "Three common approaches, pick one and stick with it:\n• Fixed R:R — take profit at 2× your stop distance (e.g. stop 1%, target 2%). Objective and tax-efficient.\n• Structure exit — scale out near the previous swing high/low.\n• Momentum exit — exit when RSI reaches an extreme (70+ for longs, 30− for shorts).\nMixing methods midway through a trade is the fastest route to emotional exits.",
      },
      {
        title: "Step 6: Journal the trade",
        body:
          "For every trade, record: setup (trend direction), entry (price, RSI, VWAP relation), stop, target, result, and lesson. After 30–50 trades, review: which filter (EMA, RSI, VWAP) contributes most to winners? That's where your edge actually lives.",
      },
    ],
    whyItWorks:
      "EMA defines the trend (reduces random noise). RSI avoids bad timing (you're not buying when everyone else just bought). VWAP aligns you with institutional pricing (desks and algos execute around VWAP). Together, the three filters eliminate the three biggest beginner mistakes: trading choppy markets, emotional entries, and chasing late moves.",
    links: [
      { title: "Investopedia — EMA (Exponential Moving Average)", url: "https://www.investopedia.com/terms/e/ema.asp" },
      { title: "Investopedia — Relative Strength Index (RSI)", url: "https://www.investopedia.com/terms/r/rsi.asp" },
      { title: "Investopedia — Volume-Weighted Average Price (VWAP)", url: "https://www.investopedia.com/terms/v/vwap.asp" },
      { title: "StockCharts — Trend following with moving averages", url: "https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-overlays/moving-averages-ema-sma-wma" },
    ],
  },

  breakoutMomentum: {
    label: "Breakout Strategy (Momentum)",
    summary: "Buy when price breaks out of a well-defined range with strength and volume. Captures the start of big moves but needs discipline to avoid fake breakouts.",
    description:
      "A breakout strategy enters the market when price decisively leaves a consolidation zone — a range, a triangle, a horizontal resistance — signaling that supply and demand have shifted. Done right, it catches big trending moves very early. Done wrong, it's a fast way to buy tops. The art is in defining the level clearly, requiring volume confirmation, and deciding in advance whether you'll enter on the break or wait for a retest.",
    whenToUse:
      "Use breakouts on liquid instruments with clear range structure — consolidation after a prior trend, tight ranges after news digestion, technical patterns (triangles, flags, cup-and-handle). Works best when implied volatility is low (the range is coiled) and there's a catalyst on the horizon. Avoid breakouts in illiquid names where the move can be engineered.",
    prosAndCons:
      "Pros: catches the start of big directional moves, rule-based and easy to define, naturally defines a stop (below the broken level), works across timeframes. Cons: fake breakouts are extremely common (especially intraday), whipsaws in low-conviction markets, requires patience to wait for real signals, poor risk/reward if you chase far from the level.",
    indicatorsUsed: ["Horizontal support/resistance", "Volume (confirmation)", "ATR (stop sizing)", "RSI or MACD (optional momentum filter)"],
    coreIdea:
      "Price breaking out of a tight range with strong volume signals that one side has won. Trade in the direction of the break, not against it.",
    steps: [
      {
        title: "Step 1: Identify a clear range",
        body:
          "Mark visually the horizontal support and resistance over at least 5–10 candles of consolidation. The cleaner and flatter the range, the more meaningful the breakout will be. Skip messy, slanted, or narrow ranges — they produce noise, not signals.",
      },
      {
        title: "Step 2: Wait for the breakout",
        body:
          "Don't anticipate. Wait for price to close above resistance (for longs) or below support (for shorts). Intraday, require the break to hold for at least one full candle on your timeframe; daily swing traders usually require a daily close beyond the level.",
      },
      {
        title: "Step 3: Confirm strength",
        body:
          "A real breakout has two fingerprints:\n• A strong candle (wide body, small wick against the direction of the break)\n• Volume clearly above the recent average (often 1.5–2× the 20-bar average)\nNo volume = likely fake breakout. Walk away.",
      },
      {
        title: "Step 4: Enter on break or on retest",
        body:
          "Two valid entries, pick one and commit:\n• Break entry — buy on the close of the breakout candle. Catches the move early but pays a worse price.\n• Retest entry — wait for price to return to the broken level and hold. Better price, better risk/reward, but you'll miss the breakouts that never look back.\nMany pros favor the retest to filter fakes.",
      },
      {
        title: "Step 5: Place the stop below the level",
        body:
          "For longs: stop just below the broken resistance (which now acts as support). For shorts: stop just above broken support. If price goes back inside the range, the breakout failed — exit without hesitation.",
      },
      {
        title: "Step 6: Manage the trade",
        body:
          "Classic targets: 1× the range height (measured move) for conservative exits, 2–3× for runners. Trail the stop under each new swing low (for longs) once the move extends. Don't give back a big open profit by hoping for more.",
      },
    ],
    whyItWorks:
      "Ranges accumulate pent-up orders on both sides (stop-losses above resistance, stops below support). When price breaks, those stops trigger and feed the move — a self-reinforcing push. Requiring volume and a clean candle filters out low-conviction probes by market makers.",
    links: [
      { title: "Investopedia — Breakout", url: "https://www.investopedia.com/terms/b/breakout.asp" },
      { title: "StockCharts — Chart patterns and breakouts", url: "https://chartschool.stockcharts.com/table-of-contents/chart-analysis/chart-patterns" },
    ],
  },

  meanReversion: {
    label: "Mean Reversion (RSI / Bollinger Bands)",
    summary: "Fade extreme moves — buy oversold, sell overbought — assuming price returns to its average. High win rate in ranges; dangerous in strong trends.",
    description:
      "Mean reversion is the statistical cousin of contrarian investing applied at the indicator level. The assumption: after an extreme deviation from a moving average, price tends to snap back. Most commonly implemented with RSI (relative strength index) crossing into oversold/overbought zones, or Bollinger Bands stretched beyond their usual envelope. The strategy rewards patience and strict exits, and punishes anyone who uses it blindly in a trending market.",
    whenToUse:
      "Use mean reversion on instruments in clear ranging regimes — no strong directional trend, stable ADX below 20, well-defined support and resistance. Works best on indices, large-cap stocks, and major FX pairs during low-volatility periods. Avoid it during earnings season for individual names, and in anything with a strong directional catalyst.",
    prosAndCons:
      "Pros: high win rate (often 60–70%), well-defined entries and exits, simple rules, works great in choppy markets where breakout strategies fail. Cons: average win is smaller than average loss (one big trend move can wipe out many small wins), dangerous in trending markets where 'oversold gets more oversold', requires regime awareness.",
    indicatorsUsed: ["RSI (14)", "Bollinger Bands (20, 2σ)", "ADX (regime filter)", "20-period moving average"],
    coreIdea:
      "Extreme moves exhaust themselves. Buy fear, sell greed — but only when the market is ranging, never in a strong trend.",
    steps: [
      {
        title: "Step 1: Confirm a ranging regime",
        body:
          "Before looking at RSI or Bollinger Bands, check ADX. If ADX > 25, the instrument is trending — skip mean reversion entirely. Bollinger Bands should be relatively flat and parallel. A mean-reversion trade in a strong trend is the fastest way to lose money.",
      },
      {
        title: "Step 2: Watch for extremes",
        body:
          "Long setup: RSI drops below 30 AND price touches or closes below the lower Bollinger Band.\nShort setup: RSI rises above 70 AND price touches or closes above the upper Bollinger Band.\nRequiring both filters avoids false signals — RSI alone triggers too often.",
      },
      {
        title: "Step 3: Wait for the reversal candle",
        body:
          "Don't catch the falling knife. Wait for price to print a reversal candle: hammer, bullish engulfing, or any candle that closes back inside the band. For shorts, wait for a shooting star or bearish engulfing. The candle is your 'permission slip' to enter.",
      },
      {
        title: "Step 4: Enter and place a tight stop",
        body:
          "Enter on the close of the confirmation candle or the open of the next bar. Stop: just beyond the extreme low (for longs) or high (for shorts) of the reversal candle. Mean-reversion stops are tight because if price pushes further, the range is probably breaking and the strategy is invalid.",
      },
      {
        title: "Step 5: Target the mean",
        body:
          "Primary target: the middle Bollinger Band (20 SMA) or RSI returning to 50. Conservative traders exit there. Aggressive traders let winners run to the opposite band. Don't let a winning trade turn into a loser — move stop to breakeven once price reaches the mean.",
      },
      {
        title: "Step 6: Track your regime hit-rate",
        body:
          "Over 30–50 trades, separate your results by regime (ADX at entry). You'll see the strategy's edge concentrates entirely in low-ADX environments. That audit is what protects you from applying it in trending markets out of habit.",
      },
    ],
    whyItWorks:
      "Over short horizons, asset prices show statistically significant mean-reverting behavior in ranging regimes — driven by liquidity providers, market-maker inventory balancing, and short-term overreactions to noise. The strategy exploits that tendency systematically. The edge disappears (and inverts) when a genuine trend takes over.",
    links: [
      { title: "Investopedia — Mean reversion", url: "https://www.investopedia.com/terms/m/meanreversion.asp" },
      { title: "Investopedia — Bollinger Bands", url: "https://www.investopedia.com/terms/b/bollingerbands.asp" },
      { title: "Investopedia — RSI", url: "https://www.investopedia.com/terms/r/rsi.asp" },
    ],
  },

  maCrossover: {
    label: "Moving Average Crossover",
    summary: "Go long when a short-term moving average crosses above a long-term one; short on the opposite cross. Simple, systematic, late — great as a trend filter, weak as a standalone trigger.",
    description:
      "A moving-average crossover flags trend changes by comparing two moving averages of different lengths. The classic 'golden cross' (50 EMA crossing above 200 EMA) and 'death cross' (opposite) have been part of trading lore for decades. Because moving averages smooth noise, crossovers are lagging by construction — they confirm a trend well after it starts and lag on exits. Used as a trigger alone, they get chopped up in sideways markets. Used as a filter combined with another entry method, they're a robust edge.",
    whenToUse:
      "Use crossovers on trending instruments (indices, sector ETFs, momentum leaders) for swing or position trading. Work best on weekly or daily timeframes where the lag matters less. A very common pattern: use 50/200 EMA crossover as a regime filter (only trade longs above the golden cross) and combine with a faster entry trigger like a pullback or breakout.",
    prosAndCons:
      "Pros: extremely simple rules, fully systematic (easy to automate and backtest), objective, no interpretation needed, great as a trend filter. Cons: signals are late by design, very poor in sideways/choppy markets (lots of whipsaws), gives back large chunks on reversals, doesn't tell you about risk sizing or targets.",
    indicatorsUsed: ["Short EMA (e.g. 20 or 50)", "Long EMA (e.g. 100 or 200)"],
    coreIdea:
      "When a fast moving average rises above a slow one, the short-term momentum is beating the long-term average — a trend shift. Trade with the slope.",
    steps: [
      {
        title: "Step 1: Pick your two averages",
        body:
          "Common pairs: 9/21 EMA for intraday, 20/50 EMA for swing, 50/200 EMA for long-term. Shorter pairs are more responsive but whipsaw more; longer pairs are slower but cleaner. Pick one for your timeframe and stick with it — backtesting every combination is curve-fitting.",
      },
      {
        title: "Step 2: Identify the cross",
        body:
          "Bullish (go long): fast EMA crosses above the slow EMA.\nBearish (go short or flat): fast EMA crosses below the slow EMA.\nRequire a full candle close after the cross — wicks crossing are not a signal.",
      },
      {
        title: "Step 3: Confirm with price structure",
        body:
          "Don't enter on the cross alone. Check that price itself is respecting the fast EMA (closing on the right side of it) and the slope of both averages is in the direction of the cross. A cross happening on flat, horizontal averages is almost always a false signal.",
      },
      {
        title: "Step 4: Enter and set a stop",
        body:
          "Enter on the close of the confirming candle. Stop: below the fast EMA (for longs) or above it (for shorts), plus a small buffer (e.g. 1× ATR) to avoid being wicked out on noise. Don't use extremely tight stops — moving-average strategies need room to breathe.",
      },
      {
        title: "Step 5: Hold while the regime holds",
        body:
          "Exit only on an opposing cross (fast crosses back below slow for longs), or when price decisively breaks the slow EMA. This is a trend-following rule set — frequent overrides destroy the edge. Accept that you'll give back a portion of the move on every exit.",
      },
      {
        title: "Step 6: Use as a filter, not just a trigger",
        body:
          "A better pattern for most traders: use the 50/200 EMA cross as a regime filter (only take long setups in a bull regime, only shorts in a bear regime) and use a faster trigger (pullback, breakout, candlestick) for actual entries. This reduces whipsaws dramatically.",
      },
    ],
    whyItWorks:
      "Moving averages encode the recent price path as a smoothed signal. A cross between two averages of different lengths mathematically requires a shift in momentum from the shorter window to dominate. That shift correlates with trend regime changes — especially on higher timeframes where noise is damped and institutional positioning drives slower cycles.",
    links: [
      { title: "Investopedia — Golden Cross / Death Cross", url: "https://www.investopedia.com/terms/g/goldencross.asp" },
      { title: "Investopedia — Moving Average Crossover", url: "https://www.investopedia.com/terms/c/crossover.asp" },
      { title: "StockCharts — Moving averages", url: "https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-overlays/moving-averages-ema-sma-wma" },
    ],
  },

  supportResistancePullback: {
    label: "Pullback to Support/Resistance",
    summary: "After a break of a key level, wait for price to return to it and trade the retest. Based on how market psychology converts old resistance into new support.",
    description:
      "This strategy exploits one of the most well-observed phenomena in technical analysis: once a significant level is broken, it tends to 'flip' and act as the opposite side. Old resistance becomes support; old support becomes resistance. The trade isn't taken on the breakout itself — it's taken when price pulls back to the broken level and confirms it's holding. This produces fewer trades but with clearer risk/reward and fewer fake breakouts.",
    whenToUse:
      "Use pullback-to-level on any liquid instrument with clearly visible horizontal levels or trendlines that have been touched multiple times. Particularly powerful around round psychological numbers ($100, index thousands), prior all-time highs, or earnings gap levels. Works across timeframes — the higher the timeframe, the more reliable the retest.",
    prosAndCons:
      "Pros: excellent risk/reward (stop goes just beyond the level, target can be far), filters out many fake breakouts automatically, aligns with institutional order flow (desks scale into positions at the retest), works on any asset class. Cons: you miss the breakouts that never pull back (often the strongest ones), can take days or weeks for the retest to materialize, requires patience and the ability to leave a trade alert for days.",
    indicatorsUsed: ["Horizontal support/resistance", "Trendlines", "Volume (confirms hold)", "Candlestick reversal patterns"],
    coreIdea:
      "Broken levels flip polarity because of market psychology. Wait for price to come back and confirm, then trade with tight risk against that level.",
    steps: [
      {
        title: "Step 1: Identify a significant level",
        body:
          "Look for horizontal levels that price has respected at least 2–3 times before. Prior swing highs/lows, consolidation ranges, gap edges, and round numbers all qualify. The more touches before the break, the more significant the flip will be on retest.",
      },
      {
        title: "Step 2: Wait for the break",
        body:
          "Let price break the level with a strong candle and good volume. Do NOT enter on the break itself — this strategy explicitly waits. Mark the broken level and set an alert.",
      },
      {
        title: "Step 3: Wait for the retest",
        body:
          "Price comes back to the broken level. This may happen within hours on intraday charts or over days/weeks on higher timeframes. Be patient — if the retest never happens, there was no trade. Accept that outcome.",
      },
      {
        title: "Step 4: Require a hold and a confirmation candle",
        body:
          "Entering blindly at the level is reckless. Wait for:\n• Price to touch and react (wick, bounce, or stall) at the broken level\n• A confirmation candle in the direction of the original break (bullish candle for long retests, bearish for short retests)\n• Ideally, volume on the confirmation candle above recent average\nIf price blows straight through the level, the flip failed — no trade.",
      },
      {
        title: "Step 5: Enter with a tight stop",
        body:
          "Enter on the close of the confirmation candle. Stop just beyond the level (below, for longs; above, for shorts), with a small buffer to avoid being wicked out. This is one of the strategy's biggest advantages: the stop is mechanical and small, producing excellent R:R.",
      },
      {
        title: "Step 6: Target the next structural level",
        body:
          "Natural targets: the next horizontal resistance (for longs), the next support (for shorts), or a measured move from the size of the prior range. Trail the stop below each new swing as the move extends. Book partial profits at the first target and let a runner ride to the next level.",
      },
    ],
    whyItWorks:
      "When a level breaks, traders who were short at resistance cover losses; traders who missed the break wait for a pullback to join; institutions scale in on the retest. All three flows converge at the flipped level — creating the self-reinforcing behavior the strategy trades. The confirmation candle requirement filters cases where the flip fails (market structure changes) and lets winners play out cleanly.",
    links: [
      { title: "Investopedia — Support and resistance", url: "https://www.investopedia.com/trading/support-and-resistance-basics/" },
      { title: "Investopedia — Retest", url: "https://www.investopedia.com/terms/r/retest.asp" },
    ],
  },

  openingRangeBreakout: {
    label: "Opening Range Breakout (Day Trading)",
    summary: "Define a range from the first 5–30 minutes of the session and trade the break of that range. Simple, rule-based, popular with active day traders.",
    description:
      "The Opening Range Breakout (ORB) uses the high and low of the first few minutes of the trading session as a reference frame for the day. The theory: the first 5–30 minutes capture the day's overnight information digestion, and once price clearly leaves that range, directional flow for the session is more likely to continue. ORB was popularized by traders like Toby Crabel and is still widely used on high-volume US equities and futures.",
    whenToUse:
      "Use ORB on liquid instruments that gap or have overnight catalysts — large-cap stocks with news, major index futures (ES/NQ), high-volume ETFs (SPY, QQQ). Best on days with above-average pre-market volume and a clear overnight narrative. Skip low-volume instruments and very quiet market days — the range breaks become random noise.",
    prosAndCons:
      "Pros: very simple, fully rule-based, works intraday where you can see the range form, objective stops and targets, suitable for automation. Cons: only works during market open hours, prone to fake breakouts on slow days, can underperform in low-volatility regimes, requires active attention during a narrow window.",
    indicatorsUsed: ["Opening range high/low (5/15/30 min)", "Volume (confirmation)", "ATR or previous day's range (sizing)"],
    coreIdea:
      "The first minutes of the session define a reference range. When price breaks it with strength, the rest of the day tends to follow that direction.",
    steps: [
      {
        title: "Step 1: Define your opening window",
        body:
          "Pick a fixed window and stick with it. Common choices: first 5 minutes (aggressive), 15 minutes (balanced), 30 minutes (conservative). Shorter windows give earlier entries and more trades but more noise. Don't switch windows based on gut feel — you'll curve-fit in real time.",
      },
      {
        title: "Step 2: Mark the opening range high and low",
        body:
          "At the end of your window, note the exact high and low price. These are your two trigger levels for the rest of the session. Some traders also note the range size — if it's already larger than the average daily true range, the setup is likely played out.",
      },
      {
        title: "Step 3: Wait for the breakout",
        body:
          "Long trigger: price closes above the opening range high (on your intraday timeframe, typically 1–5 min).\nShort trigger: price closes below the opening range low.\nRequire a full candle close through the level, not just a wick. First break gets the trade; don't chase the second break of the same day.",
      },
      {
        title: "Step 4: Confirm with volume",
        body:
          "A real ORB has volume on the breakout candle at or above the pre-break average. Low-volume breaks out of the opening range are the most common fake signal in day trading. If volume doesn't confirm, sit out.",
      },
      {
        title: "Step 5: Stop at the opposite side of the range",
        body:
          "For longs: stop at or just below the opening range low. For shorts: stop at the opening range high. Aggressive traders use the midpoint of the range. Either way, the stop is mechanical and the max loss per trade is defined by the range size.",
      },
      {
        title: "Step 6: Targets and trade management",
        body:
          "Common targets: 1× range height (fast scalp), 2–3× range height (runner), or previous day's high/low. Scale out partials at the first target and trail the stop under each new intraday swing. Many ORB traders set a hard 'no new trade after X:XX' rule (e.g. 11:30 AM) — the strategy's edge is concentrated in the first hours.",
      },
    ],
    whyItWorks:
      "Overnight order flow — news, earnings, macro events — gets compressed into the first minutes of the session as liquidity rebalances. Once that inventory clears and price breaks the early range with participation, the rest of the day often extends in the same direction. The edge is highest on days with strong catalysts and fades on quiet sessions.",
    links: [
      { title: "Investopedia — Opening range", url: "https://www.investopedia.com/terms/o/openingrange.asp" },
      { title: "Investopedia — Day trading breakouts", url: "https://www.investopedia.com/articles/trading/10/day-trade-breakout.asp" },
    ],
  },

  vwapStrategy: {
    label: "VWAP Reversion / Trend Strategy",
    summary: "Use Volume-Weighted Average Price as an intraday anchor — trade pullbacks to VWAP in a trend, or fade extreme distance from VWAP in a range.",
    description:
      "VWAP (Volume-Weighted Average Price) is the average price of an instrument weighted by traded volume, reset each session. Unlike a simple moving average, VWAP reflects where actual money changed hands, which is why large institutions use it as an execution benchmark and reference price. Traders can use VWAP two ways: as a trend support/resistance (pullbacks to VWAP are entries in the trend direction), or as a reversion anchor (extreme distance above/below VWAP often reverts). Both versions are widely used by intraday desks and algos.",
    whenToUse:
      "Use VWAP strictly intraday — it resets each session and has no meaning across days. Works best on liquid US equities, index futures, and major ETFs during regular market hours. The trend version applies when there's a clear directional bias (up or down) since the open; the reversion version applies when price is oscillating around VWAP without a clear trend.",
    prosAndCons:
      "Pros: institutional benchmark (your counterparty is often watching the same line), objective and reset daily, works for both trend and reversion, naturally incorporates volume, simple to automate. Cons: only intraday, less useful in the first 30 minutes (low volume), poor at extreme event-driven days, the two variants (trend vs reversion) require different regime calls.",
    indicatorsUsed: ["VWAP (session)", "VWAP standard deviation bands (1σ, 2σ)", "Volume", "RSI or MACD (optional momentum filter)"],
    coreIdea:
      "VWAP is where the 'average trade' of the day happened. Price tends to respect it in trends (pullbacks hold) and revert toward it after extremes.",
    steps: [
      {
        title: "Step 1: Pick trend or reversion — don't mix",
        body:
          "Look at the first 30–60 minutes. If price is trending cleanly above or below VWAP with higher highs/lows (or lower lows), use the trend variant. If price is oscillating through VWAP with no clear direction, use the reversion variant. Committing to one keeps your rules coherent.",
      },
      {
        title: "Step 2 (Trend): Wait for a pullback to VWAP",
        body:
          "In an uptrend intraday (price holding above VWAP): wait for price to pull back to VWAP. The pullback should hold VWAP as support — price touches, wicks, and closes back above. Bullish reversal candle = entry signal. For downtrends, mirror: price rallies to VWAP and rejects from below.",
      },
      {
        title: "Step 3 (Reversion): Wait for extreme distance from VWAP",
        body:
          "Use VWAP bands (1σ and 2σ). When price stretches to 2σ above VWAP with no clear trend and RSI is overbought (>70), look for a short reversion trade back to VWAP. Mirror for longs: price at 2σ below VWAP, RSI oversold, look for a bounce. Always require a reversal candle — no catching knives.",
      },
      {
        title: "Step 4: Enter with VWAP as reference for the stop",
        body:
          "Trend version: stop just beyond the pullback's extreme (below the wick for longs, above for shorts). Reversion version: stop beyond the 2σ band if the stretch continues. In both cases, the stop is tight because if VWAP breaks, the trade thesis is invalid.",
      },
      {
        title: "Step 5: Set the target at structure or opposite side",
        body:
          "Trend version: target the prior intraday swing high (for longs) or low (for shorts). Trail with each new swing. Reversion version: target VWAP itself — take profit on the return to the mean. Don't hold reversion trades hoping for a full trend — the edge is in the return to VWAP, not beyond it.",
      },
      {
        title: "Step 6: Exit by end of session",
        body:
          "VWAP resets at the next open, so your reference point disappears overnight. Most intraday VWAP traders flatten positions before the close regardless of P/L. Carrying a VWAP setup into the next day turns a VWAP trade into a directional gamble with no anchor.",
      },
    ],
    whyItWorks:
      "Institutional desks often get graded against VWAP — a buyer wants to execute below VWAP, a seller above. That creates real, recurring order flow around the line: buyers stepping in on pullbacks, sellers fading stretches. Algorithms enforce this structurally. Retail traders who align with the VWAP flow are trading with the institutions, not against them.",
    links: [
      { title: "Investopedia — VWAP", url: "https://www.investopedia.com/terms/v/vwap.asp" },
      { title: "Investopedia — Using VWAP in trading", url: "https://www.investopedia.com/articles/trading/11/trading-with-vwap-mvwap.asp" },
    ],
  },
};

const STRATEGY_GUIDE_FR: Record<StrategyKind, StrategyEntry> = {
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
    indicatorsUsed: ["EMA 20 (tendance court terme)", "EMA 50 (filtre de tendance)", "RSI (14) (timing/momentum)", "VWAP (ancrage intraday)"],
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
    indicatorsUsed: ["Support/résistance horizontale", "Volume (confirmation)", "ATR (taille du stop)", "RSI ou MACD (filtre de momentum facultatif)"],
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
    indicatorsUsed: ["RSI (14)", "Bandes de Bollinger (20, 2σ)", "ADX (filtre de régime)", "Moyenne mobile 20"],
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
    indicatorsUsed: ["EMA courte (p. ex. 20 ou 50)", "EMA longue (p. ex. 100 ou 200)"],
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
};

export const STRATEGY_GUIDE: Record<Lang, Record<StrategyKind, StrategyEntry>> = {
  en: STRATEGY_GUIDE_EN,
  fr: STRATEGY_GUIDE_FR,
};
