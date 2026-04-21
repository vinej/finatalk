import type { StrategyEntry, StrategyKind } from "./kinds";

export const STRATEGY_GUIDE_EN: Record<StrategyKind, StrategyEntry> = {
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
    indicatorsUsed: ["20 EMA (short-term trend)", "50 EMA (trend filter)", "RSI (14) (timing/momentum)", "VWAP (intraday anchor)", "Keltner Channels (ATR-scaled dynamic support on the pullback)", "Aroon or Vortex (trend-strength confirmation)", "Trend Intensity Index (regime filter — skip trades when TII is low)"],
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
    indicatorsUsed: ["Horizontal support/resistance", "Donchian Channels (N-bar high/low as the range)", "Volume (confirmation)", "Volume Oscillator, A/D Line, CMF (participation quality)", "Chaikin Volatility (range contraction before break)", "ATR (stop sizing)", "RSI or MACD (optional momentum filter)"],
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
    indicatorsUsed: ["RSI (14)", "Bollinger Bands (20, 2σ)", "Bollinger %B (normalised)", "Price Z-Score (|Z| > 2)", "Keltner Channels (ATR-scaled alternative)", "ADX (regime filter)", "Hurst Exponent (H < 0.5 = mean-reverting regime)", "20-period moving average"],
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
    indicatorsUsed: ["Short EMA (e.g. 20 or 50)", "Long EMA (e.g. 100 or 200)", "Aroon (Up/Down crossover as confirmation)", "Vortex (+VI / −VI crossover)", "Trend Intensity Index (regime filter)"],
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

  volumeProfileRotation: {
    label: "Volume Profile Rotation (VAL / POC / VAH)",
    summary: "Trade inside the Value Area — buy dips to VAL, fade pushes to VAH, target POC. Exploits rotation around the most-accepted prices.",
    description:
      "Volume Profile carves the market into zones of acceptance (Value Area) and rejection (Low-Volume Nodes). In rotational regimes, price oscillates between Value Area Low (VAL) and Value Area High (VAH), repeatedly gravitating back to the Point of Control (POC) — the bin with the highest traded volume. The rotation strategy buys dips to VAL with a reversal, takes profit at POC, and scales out at VAH; the short side mirrors. Most effective when the market is clearly range-bound (ADX < 20) and the profile has a single, well-formed POC (normal distribution shape). On bimodal profiles or trend days, skip — those are structural shifts, not rotations.",
    whenToUse:
      "Use on liquid instruments in rotational regimes — index futures, large-cap stocks, major FX pairs — when ADX is low and the current Volume Profile shows a single, clearly identifiable POC. Works on session profiles (intraday) and multi-day/week profiles (swing). Avoid on days with strong catalysts, earnings windows, or when the profile is bimodal (two competing POCs) — the edge collapses when rotation breaks down.",
    prosAndCons:
      "Pros: objectively derived levels (VAL/POC/VAH come from volume, not hand-drawn), tight mechanical invalidation (acceptance beyond the Value Area kills the thesis), works across timeframes, high win-rate in stable ranges, naturally defines a target (POC) and a stretch target (opposite edge). Cons: fails badly in trends (price stays pinned at one extreme), POC can migrate mid-session as new volume stacks at a different price, requires diligent regime filtering, the 70% Value Area threshold is somewhat arbitrary.",
    indicatorsUsed: ["Volume Profile (POC, VAH, VAL)", "ADX (regime filter)", "RSI (confirmation at extremes)", "Reversal candle patterns"],
    coreIdea:
      "Price rotates around the prices where the most volume traded. Fade the edges of the Value Area when momentum fails, target POC.",
    steps: [
      {
        title: "Step 1: Confirm rotational regime",
        body:
          "Check: ADX < 20, Bollinger Bands relatively flat, current Volume Profile has a single well-defined POC (clearly higher-volume than neighbouring bins). If the profile is bimodal or ADX is rising, the instrument is in transition — skip.",
      },
      {
        title: "Step 2: Mark VAL, POC, VAH",
        body:
          "The Volume Profile indicator renders all three. Note the exact prices. These are your trigger and target levels for the session (or the swing window). Recompute if you roll to a new period.",
      },
      {
        title: "Step 3: Wait for the edge tag + reversal",
        body:
          "Long setup: price tags VAL, prints a rejection candle (hammer, bullish engulfing) and RSI < 35. Short setup: mirror at VAH with RSI > 65. Don't chase — require BOTH the tag AND a confirmation candle on your execution timeframe.",
      },
      {
        title: "Step 4: Enter with tight stop beyond the edge",
        body:
          "Long: entry at reversal candle close, stop below VAL minus a small ATR buffer. Short: mirror above VAH. Invalidation is mechanical: if price accepts outside the Value Area (closes beyond with follow-through), rotation is over — exit immediately.",
      },
      {
        title: "Step 5: Primary target — POC",
        body:
          "Scale out 50–75% at POC. This is the bread-and-butter exit; the full move to the opposite edge only plays out ~30% of the time. Move the stop to breakeven on the remainder once POC is reached.",
      },
      {
        title: "Step 6: Runner — opposite edge, or exit on POC flip",
        body:
          "Leave a runner toward VAH (long) or VAL (short). If POC flips from support to resistance mid-trade (price fails to reclaim it from below, or holds above it from above — opposite of what the thesis requires), rotation is breaking. Close the runner regardless of P/L.",
      },
    ],
    whyItWorks:
      "The Value Area represents ~70% of traded volume — by construction, it's where participants are comfortable transacting. POC is the session's centre of gravity because that's where the most positions were opened and need to be defended. Market makers and inventory-balancing algorithms actively push price back toward POC when it strays, producing the rotational behaviour the strategy exploits. The edge collapses the moment a genuine catalyst arrives and price *accepts* outside the prior Value Area — that's by definition a regime change, and rotation traders must exit immediately.",
    links: [
      { title: "Investopedia — Volume Profile / VWAP", url: "https://www.investopedia.com/terms/v/volume-weighted-average-price-vwap.asp" },
      { title: "CME Group — Market Profile basics", url: "https://www.cmegroup.com/education/courses/introduction-to-market-profile.html" },
      { title: "TradingView — Volume Profile help", url: "https://www.tradingview.com/support/solutions/43000502040-volume-profile/" },
    ],
  },

  orderBlockRetest: {
    label: "Order Block Retest (SMC)",
    summary: "Trade pullbacks into unmitigated order blocks in the direction of the higher-timeframe trend. Tight stops, excellent R:R when filtered by HTF bias.",
    description:
      "An Order Block is the last opposite-colour candle before a strong impulse — a footprint of where institutions likely accumulated (bullish OB) or distributed (bearish OB) before driving the market. In a Smart Money Concepts (SMC) framework, unmitigated order blocks in the direction of the higher-timeframe trend are high-probability retest zones: price returns to the block, reacts, and continues in the trend direction. The strategy enters on the first clean retest with a reversal trigger (ideally a liquidity sweep or FVG inside the block), stops just beyond the block's far side, and targets the prior swing. Works best on liquid instruments with clear HTF structure.",
    whenToUse:
      "Use on liquid instruments showing clear trending structure on the higher timeframe (D1 for H1 entries, W1 for D1 entries). Suitable for both swing and intraday. Avoid in chop — too many impulses that reverse create noisy 'blocks' with no follow-through. Skip blocks that have already been touched (mitigated): the edge is largely spent. Most powerful when the retest happens at a higher-timeframe S/R, Pivot level, or Value Area edge.",
    prosAndCons:
      "Pros: very tight stops (immediately beyond the block's opposite side), objective rules, naturally aligned with HTF trend, dramatically enhanced by stacking with liquidity sweeps and FVGs. Cons: requires patience — many high-quality blocks never get retested; forcing low-quality entries ruins the edge. Very timeframe-sensitive — blocks on short timeframes are noisy. Demands higher-timeframe bias discipline; fighting the HTF trend destroys the edge.",
    indicatorsUsed: ["Order Blocks", "HTF trend filter (50/200 EMA)", "Liquidity Sweeps", "Fair Value Gaps", "ATR (stop sizing)"],
    coreIdea:
      "Institutions can't fill their full size in one move. They leave a footprint (the order block), push price away, then return to fill remaining orders. Enter on that return in the direction of the HTF trend.",
    steps: [
      {
        title: "Step 1: Set the higher-timeframe bias",
        body:
          "Long only above the 50 EMA on the higher timeframe (D1 for H1 entries, W1 for D1 entries); short only below. Fighting the HTF bias destroys the strategy's edge — this filter is non-negotiable.",
      },
      {
        title: "Step 2: Mark unmitigated blocks in bias direction",
        body:
          "The Order Block indicator flags unmitigated zones. Prefer blocks that also coincide with a prior S/R cluster, a Pivot level, or the Value Area edge. Skip any block that has already been touched — it's spent.",
      },
      {
        title: "Step 3: Wait for the retest (don't anticipate)",
        body:
          "Price must actually return to the block's range. Set an alert at the block's edge and wait. Many high-quality blocks never retest — accept that and move on. Do not enter in anticipation of a retest.",
      },
      {
        title: "Step 4: Require a confirmation trigger inside the block",
        body:
          "Block alone = watch. Block + trigger = setup. Preferred triggers: a liquidity sweep of a local low (for bullish OB) into the block, a Fair Value Gap that forms inside the block, or a clean bullish engulfing / hammer on the execution timeframe. Any one is enough; two stacked is ideal.",
      },
      {
        title: "Step 5: Enter with stop beyond the block",
        body:
          "Long: entry at the reversal candle close, stop below the block's low minus a small ATR buffer. Short: mirror above the block's high. If price closes through the block, the institutional position is already filled — exit without hesitation.",
      },
      {
        title: "Step 6: Target prior swing; scale and trail",
        body:
          "Primary target: the prior swing high (or low). Scale out 50% there, move stop to breakeven, let the runner target the next HTF level (S/R, Pivot, Value Area edge). Exit before any known catalyst (earnings, FOMC) regardless of P/L — order blocks provide no edge across fundamental shocks.",
      },
    ],
    whyItWorks:
      "Large participants accumulate positions over multiple fills at a price zone, then push price away in an impulse — the move that creates the block. To complete unfilled size, they often need price to return to the same zone, producing the characteristic retest. The block is the structural footprint of that process. Combined with HTF bias, pending institutional orders stack at the retest level — yielding the sharp reaction the strategy enters. Without HTF bias, the statistical edge disappears because blocks form in ranges too, where follow-through is random.",
    links: [
      { title: "Babypips — Order Blocks explained", url: "https://www.babypips.com/learn/forex/what-is-an-order-block" },
      { title: "Investopedia — Supply and Demand Zones", url: "https://www.investopedia.com/articles/forex/101215/forex-trading-primer-supply-and-demand.asp" },
    ],
  },

  pivotPointReaction: {
    label: "Pivot Point Reaction (Floor Trader Pivots)",
    summary: "Use PP as the period's bias line. Fade reactions at R1/S1 in range regimes; treat R2/S2 and R3/S3 as extension targets on trend days.",
    description:
      "Pivot Points compute the next period's key levels from the prior period's H/L/C: PP (bias line), R1/S1, R2/S2, R3/S3 (or the Fibonacci / Camarilla variants). Floor traders used them before electronic markets; institutional algorithms still reference them today. The strategy uses PP as the session/week bias filter — long bias above PP, short below — then fades reactions at R1/S1 when momentum stalls and runs with breakouts toward R2/S2/R3/S3 when momentum holds. Simple, mechanical, and particularly effective on index futures, major FX pairs, and liquid large-cap stocks during normal volatility.",
    whenToUse:
      "Use on deeply liquid instruments with consistent participation — index futures (ES/NQ), major FX, liquid large caps. Weekly pivots for daily charts, monthly for weekly. Best in normal-volatility regimes; in extreme vol (VIX > 30 or post-catalyst) pivots get overrun and the strategy whipsaws. Camarilla's tighter levels suit intraday mean-reversion; classic pivots suit swing bias; Fibonacci pivots sit in between.",
    prosAndCons:
      "Pros: fully pre-computed (no judgment in placing levels), mechanical entries and targets, recognised by institutions so flow actually clusters at the levels, naturally defines stops (next level beyond), works across asset classes. Cons: less useful on illiquid instruments, regularly overrun on strong catalyst days, pure classical pivots have no built-in regime filter (must be overlaid with ADX or a trend filter), arbitrary formula choice (classic vs Fib vs Camarilla) can curve-fit if chopped and changed.",
    indicatorsUsed: ["Pivot Points (classic / Fibonacci / Camarilla)", "ADX (regime filter)", "Volume (confirmation)", "Reversal candles"],
    coreIdea:
      "Pre-computed price levels anchor institutional flow for the period. PP is the bias line; R1/S1 are first-reaction zones; R2/S2/R3/S3 are extension targets.",
    steps: [
      {
        title: "Step 1: Plot pivots for the right period",
        body:
          "Weekly pivots for daily trading, monthly for weekly swing. Pick the method once and stick with it — classic for a balanced approach, Fibonacci for smoother levels, Camarilla for tight intraday mean-reversion. Switching methods to match the last trade is curve-fitting.",
      },
      {
        title: "Step 2: Set the period bias from PP",
        body:
          "Open above PP = bullish bias for the period. Open below PP = bearish bias. Take setups aligned with the bias only — taking counter-bias trades immediately slashes the win rate.",
      },
      {
        title: "Step 3: Fade at R1/S1 with confluence",
        body:
          "In bullish bias, the first meaningful pullback often reaches PP or S1. Long on a reversal candle there, ideally stacked with oversold RSI, an unmitigated Order Block, or a prior S/R cluster. Mirror at R1 in bearish bias. Skip if ADX is rising sharply — that signals trend, not rotation.",
      },
      {
        title: "Step 4: Place stop at the next level",
        body:
          "Long from S1: stop below S2 (plus ATR buffer). Short from R1: stop above R2. This keeps invalidation mechanical: if the next level is taken, the thesis is wrong. Do not widen the stop because the trade is 'close'.",
      },
      {
        title: "Step 5: Target PP → R1 (or S1) → R2",
        body:
          "Scale out at each level. On range days, expect reaction at PP and take profit there. On trend days, R2/R3 (or S2/S3) become the objective targets — let the runner ride with a stop trailed behind the most recent swing.",
      },
      {
        title: "Step 6: Flip bias on decisive PP break",
        body:
          "A clean close through PP (opposite of the initial bias, on volume) is the bias-flip signal. Avoid counter-bias trades after a fresh break — the levels now work in reverse. Wait for the next period's pivot recomputation rather than forcing a trade against the new bias.",
      },
    ],
    whyItWorks:
      "Pivots encode the prior period's range into an objective, widely-published grid. Because the same levels are watched by desks, algos, and retail alike, real order flow clusters at them: stops placed just beyond, limit orders at them, algorithms fading approaches. The self-fulfilling component is strong. Combined with PP as a directional bias filter, the strategy captures the rotational flow of a normal trading period and steps aside on trending breakouts by flipping bias when PP gives way.",
    links: [
      { title: "Investopedia — Pivot Points", url: "https://www.investopedia.com/terms/p/pivotpoint.asp" },
      { title: "StockCharts — Pivot Points", url: "https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-overlays/pivot-points" },
    ],
  },

  liqSweepReversal: {
    label: "Liquidity Sweep Reversal (Stop-Hunt Fade)",
    summary: "Fade the fake-out — when price pierces a clear swing high/low and closes back inside, enter against the breakout with a tight stop just beyond the sweep wick.",
    description:
      "A liquidity sweep occurs when price briefly exceeds a prior swing high or low — triggering resting stop orders and any limit orders placed just beyond — then reverses back inside the range. The pattern is the footprint of institutional participants running obvious stops to generate the liquidity they need before entering in the opposite direction. The strategy waits for the sweep, requires a rejection close back inside the range, then enters against the breakout direction with a stop just beyond the sweep wick. Very effective at well-watched levels (prior-day highs/lows, session highs, round numbers, Value Area edges) and in low-ADX regimes.",
    whenToUse:
      "Use on liquid instruments around well-defined liquidity pools — prior swing highs/lows, prior-day/week extremes, round-number psychological levels, Value Area edges. Works across timeframes, but the higher the timeframe the more reliable. Avoid on strong trend days, immediately after major catalysts, or when ADX is rising — in those regimes, 'sweeps' are often genuine continuations, not reversals. Most powerful when the sweep lands into an order block or bullish/bearish FVG.",
    prosAndCons:
      "Pros: extremely tight stops (immediately beyond the wick) produce outstanding risk/reward, objective entry trigger (reversal close back inside), aligns with institutional flow, stacks cleanly with order blocks and FVGs for confluence. Cons: in strong trends, obvious-level 'sweeps' are frequently continuations — fighting them produces losses; requires disciplined regime awareness (ADX / HTF trend) to skip those. Low-volume sweeps are noisier and can be engineered by market makers on illiquid names.",
    indicatorsUsed: ["Liquidity Sweeps", "HTF trend filter / ADX", "Order Blocks", "Fair Value Gaps", "Volume"],
    coreIdea:
      "Liquidity sits where obvious stops live — just beyond prior highs/lows. A sweep that fails to hold means someone big just ran those stops and went the other way.",
    steps: [
      {
        title: "Step 1: Identify a clear liquidity pool",
        body:
          "Prior swing high/low with multiple touches, prior-day high/low, round number, Value Area High/Low, or the equal highs/lows of a recent range. The more obvious the level, the more stops are parked beyond it. Skip noisy, mid-range levels.",
      },
      {
        title: "Step 2: Wait for the sweep bar",
        body:
          "Price must exceed the level intraday (wick through, trigger the stops). The Liquidity Sweep indicator flags the bar. A bar that closes beyond the level is a breakout, not a sweep — stand down.",
      },
      {
        title: "Step 3: Require a reversal close back inside",
        body:
          "The sweep bar (or the next bar on your entry timeframe) must close back inside the prior range, rejecting the excursion. Wait for the candle to finish — front-running the close turns a sweep trade into a directional gamble.",
      },
      {
        title: "Step 4: Confirm with regime + confluence",
        body:
          "Best-quality sweeps happen in low-ADX regimes (ADX < 25) and land into an unmitigated Order Block, a Fair Value Gap, or a prior S/R cluster. Sweeps in high-ADX trends are usually continuation, not reversal — skip. Volume above recent average on the reversal bar strengthens the read.",
      },
      {
        title: "Step 5: Enter and set a tight stop beyond the wick",
        body:
          "Long (after a low sweep): entry at the reversal candle close, stop below the sweep wick minus a small ATR buffer. Short (after a high sweep): mirror. The wick-tight stop is the strategy's edge — do not widen it.",
      },
      {
        title: "Step 6: Target midpoint → opposite side",
        body:
          "First target: 50% back into the prior range. Move stop to breakeven at T1. Runner target: opposite structural level (the other side of the range, or a Pivot / S/R cluster). If momentum stalls mid-move, exit the runner — the sweep edge is front-loaded, not terminal.",
      },
    ],
    whyItWorks:
      "Obvious levels attract obvious stops. Larger participants who need to fill size push price through those levels to trigger the stops, absorb the resulting flow, and reverse. The rejection wick is the footprint of that absorption. The strategy essentially sides with the institutions who engineered the stop run — against the retail breakout traders who got stopped out. The edge depends on the level being a genuine liquidity pool in a rotational regime; in a trending regime the same sweep is continuation, which is why HTF trend and ADX filters are critical.",
    links: [
      { title: "Babypips — Liquidity Grabs / Stop Hunts", url: "https://www.babypips.com/learn/forex/what-is-liquidity" },
      { title: "Investopedia — Stop Hunting", url: "https://www.investopedia.com/terms/s/stop-hunting.asp" },
    ],
  },

  donchianTurtleBreakout: {
    label: "Donchian Turtle Breakout",
    summary: "Original 1980s Turtle-trader system — enter on a 20- or 55-day Donchian high, exit on a 10- or 20-day low. Fully mechanical trend-following with ATR-based sizing.",
    description:
      "The Turtle system was taught by Richard Dennis to a group of novice traders in 1983 to settle a bet with partner William Eckhardt that trading could be taught. The rules are brutally simple: enter long when price closes above the 20-day Donchian high (System 1) or 55-day high (System 2), exit long when price closes below the 10-day low (System 1) or 20-day low (System 2). Shorts mirror. Position sizing is built into the system — one 'unit' equals 1% of account divided by N, where N is the 20-day ATR. You can pyramid up to 4 units, adding every 0.5N of favourable movement. The edge is pure fat-tail capture: a low win rate (~30–35%) paired with rare but very large winners that pay for many small losses.",
    whenToUse:
      "Use on a diversified basket of 10–20 uncorrelated liquid markets — futures, FX, crypto, equity indices, commodities. Single-instrument Turtle is far more volatile and often loses its edge. Works best across long time horizons (years) where the fat-tail multi-month trends have time to materialise. Poor fit for anyone who cannot emotionally tolerate long drawdown stretches; excellent fit for systematic, rules-based traders who can let the system run untouched.",
    prosAndCons:
      "Pros: fully mechanical with no discretion, decades of real-money backtested track record, captures fat-tail trends that virtually every other strategy misses, position sizing baked into the rules, identical logic for longs and shorts. Cons: low win rate (30–35%) is psychologically brutal for most traders, requires basket diversification to work — single-instrument Turtle whipsaws hard, drawdowns of 20–40% between trends are normal, historically less effective on equity indices than on commodities/FX/crypto, capital requirement is meaningful because N-unit sizing assumes enough account size to hold 4 units across 10+ markets.",
    indicatorsUsed: ["Donchian Channels (20/55/10 period)", "ATR (N-unit position sizing)", "Basket correlation matrix"],
    coreIdea:
      "Markets spend ~80% of time in noise and ~20% in sustained trends that account for most of the long-term P&L. Accept many small losses in the noise so that when a trend arrives you are positioned early, scaled correctly, and held all the way through.",
    steps: [
      {
        title: "Step 1: Build a diversified basket",
        body:
          "Pick 10–20 uncorrelated liquid instruments — e.g. several equity indices, FX majors, treasuries, energy, metals, grains, a couple of crypto. Correlation is the destroyer of Turtle performance: two correlated positions = one position sized at 2x. Recompute correlations quarterly and prune.",
      },
      {
        title: "Step 2: Compute N (20-day ATR) for each instrument",
        body:
          "N is the volatility unit that sizes every trade. 1 unit = (1% of account) / (N × contract size). This scales each position to the same dollar volatility regardless of the instrument. If N doubles, your unit count halves — that's the key to surviving vol expansion.",
      },
      {
        title: "Step 3: Entry — Donchian high/low breakout",
        body:
          "System 1 (faster): enter long on a close above the 20-day Donchian high, short on a close below the 20-day Donchian low. System 2 (slower): use 55-day channels. Many traders run a blend: System 1 by default, but skip a System 1 signal if the last System 1 trade was a winner (to avoid chasing choppy breakouts after strong trends exhaust).",
      },
      {
        title: "Step 4: Hard stop at 2N and pyramid every 0.5N",
        body:
          "Initial stop: 2N below entry (for longs). Add a unit every 0.5N of favourable move, up to 4 total units. Each added unit moves the stop up to 2N below the latest entry. This pyramids risk into winners while capping total exposure.",
      },
      {
        title: "Step 5: Exit — Donchian low (or high for shorts)",
        body:
          "System 1 exit: close longs on a close below the 10-day Donchian low, cover shorts on a close above the 10-day high. System 2 exit: 20-day channels. The exit is non-negotiable — no holding, no prayer candles. Mechanical exit is what makes the fat-tail math work.",
      },
      {
        title: "Step 6: Run the system unchanged and track drawdowns honestly",
        body:
          "The hardest part of Turtle is doing nothing between trends. Most of the time, small losses accumulate while you wait for the 1–2 fat-tail moves per year per instrument that pay for everything. Tracking drawdowns in a separate journal — and knowing they're normal — is the psychological equipment you need to not bail during a normal 20% equity dip.",
      },
    ],
    whyItWorks:
      "Asset-price returns are leptokurtic: they have fat tails. A small number of very large moves account for most of the long-term return, while the rest is noise. Donchian breakouts structurally position the system to be long when an instrument starts making new highs and short when it makes new lows — exactly when fat-tail moves start. ATR-based sizing equalises risk across markets, so a quiet bond future and a volatile crypto both contribute the same dollar volatility. Diversification across uncorrelated markets means the system always has multiple 'tries' for the next fat tail — you don't know which instrument will go, but something usually does. The low win rate is a feature, not a bug: it's the price paid for capturing the rare outliers that matter.",
    links: [
      { title: "Investopedia — Turtle Trading", url: "https://www.investopedia.com/articles/trading/08/turtle-trading.asp" },
      { title: "Investopedia — Donchian Channels", url: "https://www.investopedia.com/terms/d/donchianchannels.asp" },
      { title: "Book — Curtis Faith, Way of the Turtle", url: "https://www.amazon.com/Way-Turtle-Secret-Methods-Legendary/dp/007148664X" },
      { title: "Original Turtle rules (PDF, archived)", url: "https://web.archive.org/web/20210304144604/https://bigpicture.typepad.com/comments/files/turtlerules.pdf" },
    ],
  },

  trendStructureVolatility: {
    label: "Trend + Structure + Volatility Expansion",
    summary: "Six-filter swing/intraday system — only trades when trend (EMA 50), strength (ADX 14), pullback (RSI 14), structure (VWAP or Volume Profile), and volatility expansion (close back through the Keltner mid-line) all agree. 1.5× ATR stops, 2R targets or Keltner/RSI trail.",
    description:
      "Trend + Structure + Volatility Expansion is a rules-based system that stacks six independent filters before allowing any trade: trend direction (EMA 50), regime strength (ADX 14 > 25 and rising), pullback timing (RSI 14 returning to the 40–50 zone in an uptrend or 50–60 in a downtrend), market structure (price above/below VWAP, or reacting at a high-volume node on the Volume Profile), and a volatility-expansion trigger — a candle that closes back through the Keltner(20, 2× ATR) mid-line in the direction of trend after the pullback. Position sizing is driven by ATR so every trade risks the same dollar amount across instruments and regimes. The edge comes from the filters' combined ability to refuse trades: the gate turns away most setups, which is exactly the design goal — the trades you don't take are the ones that would have hurt you.",
    whenToUse:
      "Use on liquid instruments (major FX, index futures, large-cap equities, high-liquidity crypto) on the 15-minute to daily timeframe. Best suited to swing and active intraday traders who can patiently wait for full filter alignment. Stand aside entirely when ADX is below 20, when price is criss-crossing EMA 50, when ADX is high but falling (trend exhausting), or when ATR has collapsed to multi-month lows — the system is engineered to skip those regimes, not to squeeze trades out of them.",
    prosAndCons:
      "Pros: six independent filters kill most bad setups before they tempt you; ATR-scaled stops and position sizing normalise dollar risk across instruments and volatility regimes; two exit styles (fixed 2R or Keltner/RSI trail) let you match the system to your temperament; logic is fully symmetric long/short. Cons: very few trades in calm or choppy regimes — long stretches of sitting on your hands are normal; requires the patience to wait for the RSI pullback instead of chasing the initial move; performance depends heavily on respecting the 'skip' rules — every override is what turns a profitable system into a losing one.",
    indicatorsUsed: [
      "EMA (50) — trend direction",
      "ADX (14) — regime-strength gate (> 25 and rising)",
      "RSI (14) — pullback-timing filter",
      "ATR (14) — stop sizing and position sizing",
      "Keltner Channels (20, 2× ATR) — volatility-expansion trigger on the mid-line",
      "VWAP or Volume Profile — structural reference (POC / VAH / VAL)",
    ],
    coreIdea:
      "Don't enter until trend, momentum pullback, structure, and volatility all agree. Six filters is a high bar — and that bar is the edge. Most traders miss the alignment because they trade any one of the signals on its own.",
    steps: [
      {
        title: "Step 1: Regime filter — trade only when ADX > 25 and price is clearly on one side of EMA 50",
        body:
          "First gate: is this a tradable regime at all? Require ADX(14) above 25 AND price visibly above (for longs) or below (for shorts) the 50 EMA. Skip if ADX is under 20 (chop), if price keeps crossing the EMA, or if ADX is high but falling (trend exhausting). This single rule removes a large share of losing trades before they happen.",
      },
      {
        title: "Step 2: Wait for a momentum pullback on RSI",
        body:
          "After the regime gate, do not chase. Wait for RSI(14) to pull back to the 40–50 zone in an uptrend, or rally to the 50–60 zone in a downtrend. This is the timing filter that keeps you from buying tops and selling bottoms. What matters is that momentum has cooled — entering fresh into an overbought or oversold print is exactly what this step is designed to prevent.",
      },
      {
        title: "Step 3: Confirm the structural level",
        body:
          "Check structure before pulling the trigger. For longs: price above VWAP, or bouncing from a high-volume node on the Volume Profile. For shorts: below VWAP, or rejecting a high-volume zone overhead. If structure does not agree with the trend-and-momentum picture, stand aside — one missing filter is enough to invalidate the setup.",
      },
      {
        title: "Step 4: Trigger — close back through the Keltner mid-line",
        body:
          "The entry candle is the one that closes back through the Keltner(20, 2× ATR) mid-line (the 20-EMA) in the direction of the trend after the RSI pullback. Enter at the close of that confirmation candle. This sequence — pullback first, volatility-expansion close second — catches the resumption of the move rather than the pullback itself. For shorts, mirror the logic: close below the mid-line after RSI rallies into 50–60.",
      },
      {
        title: "Step 5: Stop at 1.5× ATR, take profit at 2R or trail with Keltner/RSI",
        body:
          "Stop-loss: 1.5 × ATR(14) from entry (below for longs, above for shorts). Two exit options — pick one and keep it consistent: (A) fixed 2× risk take-profit (2R), mechanical and simple; (B) trail and hold — exit when price closes back through the Keltner mid-line against you, or when RSI prints > 70 (long) / < 30 (short) and turns. Trend-following traders prefer (B); probabilistic / RR-minded traders prefer (A).",
      },
      {
        title: "Step 6: Size by ATR and respect the hard-skip rules",
        body:
          "Risk 0.5–1% of account per trade. Position size = (account × risk%) / (1.5 × ATR × point value). This normalises dollar risk across instruments and volatility regimes. Hard skip rules: ADX falling even if > 25, price extended too far from EMA 50 (overstretched), imminent major news, ATR compressed to multi-month lows (dead market). Optional enhancements: only take longs above the daily pivot and shorts below; add a no-trade band around VWAP ± a small tolerance; use the higher-timeframe EMA 50 as a bias filter. Common mistakes to avoid: entering without the RSI pullback (chasing), ignoring a falling ADX, using stops tighter than 1.5× ATR, and manually overriding any rule on 'conviction'.",
      },
    ],
    whyItWorks:
      "Each filter blocks a specific failure mode. ADX kills chop — where most strategies bleed. EMA 50 picks the side of the market. The RSI pullback forces a better entry than chasing the initial move. VWAP / Volume Profile anchors the trade to a level where real flow transacts. The Keltner mid-line close waits for volatility to actually expand in your direction before committing. ATR-based sizing and stops equalise risk across regimes so a quiet week and a volatile week both contribute the same dollar exposure. Individually each filter is ordinary; stacked, they turn away the trades that would have destroyed the edge — which is why the system survives across instruments and market cycles.",
    links: [
      { title: "Investopedia — ADX (Average Directional Index)", url: "https://www.investopedia.com/terms/a/adx.asp" },
      { title: "Investopedia — Keltner Channel", url: "https://www.investopedia.com/terms/k/keltnerchannel.asp" },
      { title: "Investopedia — ATR and position sizing", url: "https://www.investopedia.com/articles/trading/08/atr.asp" },
      { title: "Investopedia — Volume Profile", url: "https://www.investopedia.com/terms/v/volume-profile.asp" },
    ],
  },
};
