import type { Lang } from "@/lib/lang";

export type InvLink = { title: string; url: string };

export type InvestmentEntry = {
  label: string;
  summary: string;
  characteristics: string;
  whenToBuy: string;
  whyBuy: string;
  profitsQuebec: string;
  links: InvLink[];
};

export const INVESTMENT_KINDS = [
  "savings",
  "gic",
  "bond",
  "stock",
  "preferredShare",
  "etf",
  "mutualFund",
  "fundOfFunds",
  "reit",
  "registeredAccounts",
] as const;

export type InvestmentKind = (typeof INVESTMENT_KINDS)[number];

export const INVESTMENT_GENERAL_LINKS: Record<Lang, InvLink[]> = {
  en: [
    {
      title: "Canada.ca — Investing basics",
      url: "https://www.canada.ca/en/financial-consumer-agency/services/savings-investments.html",
    },
    {
      title: "AMF Québec — L'investissement",
      url: "https://lautorite.qc.ca/grand-public/investissements",
    },
    {
      title: "Revenu Québec — Investment income",
      url: "https://www.revenuquebec.ca/en/citizens/income-tax-return/completing-your-income-tax-return/how-to-complete-your-income-tax-return/income/investment-income/",
    },
    {
      title: "Canada.ca — Registered plans (TFSA/RRSP/FHSA)",
      url: "https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/registered-plans-administrators.html",
    },
  ],
  fr: [
    {
      title: "Canada.ca — Notions de base sur l'investissement",
      url: "https://www.canada.ca/fr/agence-consommation-matiere-financiere/services/epargne-investissements.html",
    },
    {
      title: "AMF Québec — L'investissement",
      url: "https://lautorite.qc.ca/grand-public/investissements",
    },
    {
      title: "Revenu Québec — Revenus de placement",
      url: "https://www.revenuquebec.ca/fr/citoyens/declaration-de-revenus/remplir-votre-declaration-de-revenus/comment-remplir-votre-declaration/revenus/revenus-de-placement/",
    },
    {
      title: "Canada.ca — Régimes enregistrés (CELI/REER/CELIAPP)",
      url: "https://www.canada.ca/fr/agence-revenu/services/impot/particuliers/sujets/administrateurs-regimes-enregistres.html",
    },
  ],
};

const INVESTMENT_GUIDE_EN: Record<InvestmentKind, InvestmentEntry> = {
  savings: {
    label: "Savings account / HISA",
    summary:
      "Cash deposited at a federally or provincially regulated institution, paying a variable interest rate. Capital is not at risk; deposits are insured.",
    characteristics:
      "Highly liquid — withdraw anytime. Principal is guaranteed by CDIC (banks) up to $100,000 per category or by the Autorité des marchés financiers via AMF/FQDR for credit unions in Québec. Rates float with the Bank of Canada policy rate. High-interest savings accounts (HISA) pay more than a chequing account but less than a GIC or bond.",
    whenToBuy:
      "Always keep 3–6 months of expenses in a HISA as an emergency fund before investing in anything riskier. Also useful as a holding place for short-term goals (<1 year) or dry powder waiting to be deployed.",
    whyBuy:
      "Stability and instant access. Not a growth vehicle — real return (after inflation) is usually near zero or slightly negative — but it protects your downside and your liquidity.",
    profitsQuebec:
      "Interest is paid monthly or quarterly and is 100% taxable as ordinary income at your marginal federal + Québec rate (combined top bracket ≈ 53.31% in 2025). No preferential treatment. Inside a TFSA (CELI) or RRSP (REER), interest is sheltered from tax.",
    links: [
      { title: "CDIC — Deposit insurance", url: "https://www.cdic.ca/your-coverage/list-of-insured-products/" },
      { title: "AMF Québec — Épargne et dépôts", url: "https://lautorite.qc.ca/grand-public/investissements/epargne-et-depots" },
      { title: "Investopedia — High-Yield Savings Account", url: "https://www.investopedia.com/terms/h/high-yield-savings-account.asp" },
    ],
  },

  gic: {
    label: "GIC (Guaranteed Investment Certificate)",
    summary:
      "A term deposit: you lend money to a bank for a fixed term (30 days to 5 years typically) in exchange for a guaranteed interest rate.",
    characteristics:
      "Principal is guaranteed and CDIC-insured up to $100,000 per category. Rates are fixed for the term — longer terms usually pay more. 'Non-redeemable' GICs lock your money up; 'redeemable' or 'cashable' GICs let you break early at a lower rate. Market-linked GICs pay a variable return tied to an index, often with a floor and cap.",
    whenToBuy:
      "When you have a known future expense with a matching timeline (down payment in 3 years, tuition next fall) and don't want any risk of loss. Also useful as a 'GIC ladder' — stagger maturities every year — for retirees who need predictable income.",
    whyBuy:
      "Absolute certainty of the nominal return. Beats a savings account rate when you can commit to locking the money for the term. Poor choice if inflation or rates rise sharply during your term.",
    profitsQuebec:
      "Interest paid at maturity (short terms) or annually (longer terms) — but CRA/Revenu Québec require you to report interest as it accrues each year, even if not received yet (T5 / Relevé 3). Fully taxed at your marginal rate. Shelter inside a TFSA/RRSP to avoid the tax drag.",
    links: [
      { title: "Canada.ca — GICs", url: "https://www.canada.ca/en/financial-consumer-agency/services/savings-investments/guaranteed-investment-certificate.html" },
      { title: "AMF Québec — Certificats de placement garanti", url: "https://lautorite.qc.ca/grand-public/investissements/autres-produits-dinvestissement/certificat-de-placement-garanti" },
      { title: "Investopedia — GIC", url: "https://www.investopedia.com/terms/g/gic.asp" },
    ],
  },

  bond: {
    label: "Bonds",
    summary:
      "A loan you make to a government or corporation. The issuer pays you periodic interest (the 'coupon') and returns your principal at maturity.",
    characteristics:
      "Three main types in Canada: Government of Canada bonds (lowest risk), provincial bonds (e.g. Québec, Ontario), and corporate bonds (higher yield, higher risk). Price moves inversely to interest rates: rates up → bond prices down. Credit rating (AAA to junk) measures default risk. Most retail investors hold bonds via bond ETFs rather than individual bonds, because the individual-bond market has poor pricing transparency for small lots.",
    whenToBuy:
      "When you want steady income and lower volatility than stocks. Common allocations range from 20% of portfolio (young aggressive investor) to 60%+ (retiree drawing income). Buy during high-rate environments to lock in attractive yields; avoid long-duration bonds when rates are expected to rise.",
    whyBuy:
      "Diversification — bonds often (not always) zig when stocks zag, cushioning drawdowns. Predictable cashflow for retirees. Capital preservation relative to equities.",
    profitsQuebec:
      "Coupon interest is paid semi-annually and taxed as ordinary income (fully taxable, marginal rate). Capital gains from selling a bond above par are 50% taxable (inclusion rate). Accrued interest on strip/zero-coupon bonds is taxable yearly even without cash payment. Shelter bond income in an RRSP/TFSA to avoid the tax drag. Foreign bond interest from US/overseas may have 15% withholding tax in a non-registered account.",
    links: [
      { title: "Bank of Canada — Canada bonds", url: "https://www.bankofcanada.ca/rates/interest-rates/canadian-bonds/" },
      { title: "AMF Québec — Obligations", url: "https://lautorite.qc.ca/grand-public/investissements/produits-dinvestissement/obligations" },
      { title: "Investopedia — Bond Basics", url: "https://www.investopedia.com/terms/b/bond.asp" },
    ],
  },

  stock: {
    label: "Stocks (common shares)",
    summary:
      "Partial ownership of a publicly-listed company. You share in the profits (via dividends) and in the price appreciation (capital gains).",
    characteristics:
      "Highest expected long-term return of mainstream asset classes, but also the highest volatility. Priced continuously on exchanges (TSX, NYSE, NASDAQ). Returns come from two sources: dividends (periodic cash paid by the company) and capital gains (price goes up). Individual stocks carry idiosyncratic risk — a single company can drop 50%+ in a day on bad news. Diversification across 20+ names drastically reduces this.",
    whenToBuy:
      "When your horizon is 5+ years. Stocks are the asset class most likely to outpace inflation over long periods. Buy through a registered account first (TFSA, then RRSP), then non-registered once those are full. Avoid putting money you'll need within 2 years into stocks.",
    whyBuy:
      "Long-term wealth growth. Equity ownership means you benefit directly from productivity gains and corporate earnings compounding. Historically the S&P/TSX Composite has returned ~7% annually after inflation over long horizons, though any individual decade can be very different.",
    profitsQuebec:
      "Two tax streams: (1) Canadian eligible dividends get a dividend tax credit (federal + Québec), so they're taxed lighter than interest — effective Québec top rate ~40% vs. 53% for interest. (2) Capital gains on sale: only 50% of the gain is taxable (inclusion rate); combined with the marginal rate, top effective ≈ 26.65% in Québec. Foreign (US) dividends are fully taxable and face 15% US withholding tax in a non-registered account — waived in RRSP, not in TFSA.",
    links: [
      { title: "Canada.ca — Investing in stocks", url: "https://www.canada.ca/en/financial-consumer-agency/services/savings-investments/stocks.html" },
      { title: "AMF Québec — Actions", url: "https://lautorite.qc.ca/grand-public/investissements/produits-dinvestissement/actions" },
      { title: "Revenu Québec — Dividends and capital gains", url: "https://www.revenuquebec.ca/en/citizens/income-tax-return/completing-your-income-tax-return/how-to-complete-your-income-tax-return/income/investment-income/" },
    ],
  },

  preferredShare: {
    label: "Preferred shares",
    summary:
      "A hybrid between a bond and a stock: pays a fixed dividend like a bond coupon, but trades on an exchange like a stock and ranks below bonds in bankruptcy.",
    characteristics:
      "Canadian preferred shares commonly have features like 'rate-reset' (dividend resets every 5 years based on the Government of Canada 5-year yield + a spread), 'perpetual' (fixed dividend forever), or 'floating-rate'. Lower volatility than common shares but can still fluctuate meaningfully when interest rates or credit spreads move. Pays eligible Canadian dividends, qualifying for the dividend tax credit.",
    whenToBuy:
      "When you want higher income than bonds offer without taking full equity risk, and you already have exposure to common shares and bonds. Most retail investors who want preferred exposure hold them through a preferred-share ETF (e.g. CPD.TO, ZPR.TO) to diversify issuer risk.",
    whyBuy:
      "Income enhancement — preferred yields often exceed investment-grade bond yields. Plus the Canadian dividend tax credit makes the after-tax yield more attractive than bond interest for non-registered accounts.",
    profitsQuebec:
      "Dividends from Canadian preferreds qualify as eligible dividends — dividend tax credit applies (federal + Québec). Capital gains on sale: 50% inclusion rate. US-issued preferreds don't qualify — those dividends are taxed as ordinary foreign income with 15% US withholding.",
    links: [
      { title: "Investopedia — Preferred Stock", url: "https://www.investopedia.com/terms/p/preferredstock.asp" },
      { title: "TMX Money — Preferred shares", url: "https://money.tmx.com/en/quote/search" },
      { title: "AMF Québec — Actions privilégiées", url: "https://lautorite.qc.ca/grand-public/investissements/produits-dinvestissement/actions" },
    ],
  },

  etf: {
    label: "ETF (Exchange-Traded Fund)",
    summary:
      "A basket of securities (stocks, bonds, or both) that trades on an exchange like a single stock. Most ETFs track a published index.",
    characteristics:
      "Low management fees (MER often 0.03%–0.30% for index ETFs). Intra-day trading — buy and sell any time the market is open. Fully transparent holdings (published daily). Enormous variety: broad-market index (VFV, XIC), sector (XIT tech, XEG energy), bond (ZAG, XBB), dividend (VDY), single-country, commodity, thematic. Some ETFs are actively managed (higher MER). Canadian-listed ETFs generally more tax-efficient than US-listed for Canadian investors.",
    whenToBuy:
      "As a building block for almost any portfolio. Ideal for investors who want diversification without picking individual stocks. Three-ETF portfolios (Canadian equity + US equity + international equity) cover most needs. Add a bond ETF for balance. Use a broad-market ETF inside a TFSA/RRSP for simplest setup.",
    whyBuy:
      "Instant diversification at minimal cost. Lower fees than mutual funds (typically 1–2% cheaper MER), which compounds into a large retirement-age difference. Tax-efficient structure (in-kind creation/redemption reduces distributed capital gains).",
    profitsQuebec:
      "ETFs distribute income periodically: dividends pass through and keep their character (Canadian eligible, foreign, etc.), interest passes through as interest, and realized capital gains inside the fund pass through as capital gains. Tax treatment follows the underlying source. Capital gains on sale of the ETF itself: 50% inclusion rate. You'll receive a T3/Relevé 16 in March for distributions.",
    links: [
      { title: "Canada.ca — Exchange-traded funds", url: "https://www.canada.ca/en/financial-consumer-agency/services/savings-investments/exchange-traded-funds.html" },
      { title: "AMF Québec — Fonds négociés en bourse (FNB)", url: "https://lautorite.qc.ca/grand-public/investissements/produits-dinvestissement/fonds-negocies-en-bourse-fnb" },
      { title: "Investopedia — ETF", url: "https://www.investopedia.com/terms/e/etf.asp" },
    ],
  },

  mutualFund: {
    label: "Mutual funds",
    summary:
      "A professionally-managed pool of money that buys a portfolio of securities. You own units priced once per day at net asset value (NAV).",
    characteristics:
      "Historically the default retail investment in Canada. Bought and sold at end-of-day NAV, not intra-day. Management fees (MER) typically 1.5%–2.5% — much higher than ETFs. Many are 'series' — series A (with trailer commission to advisor), series F (no trailer, fee-based advisor), series D (discount-broker). Actively managed funds aim to beat an index (most don't, long-term). Minimum buys can be low ($500–$1,000) making them accessible.",
    whenToBuy:
      "When you want professional management and don't want to trade an ETF yourself, or when you're investing regularly through an employer RRSP/REER plan that only offers mutual funds. Avoid high-MER funds in taxable accounts — the drag compounds.",
    whyBuy:
      "Simplicity: one purchase gives you a diversified, actively managed portfolio. Useful for automatic pre-authorized contributions. Historically dominant in Québec via the caisses populaires Desjardins fund families.",
    profitsQuebec:
      "Same pass-through tax treatment as ETFs — distributions keep the character of their source (dividends, interest, capital gains) and are taxable the year received, even if automatically reinvested (DRIP). Capital gains on unit sale: 50% inclusion rate. High-turnover active funds tend to distribute more capital gains year-to-year than index ETFs, which matters only in non-registered accounts.",
    links: [
      { title: "Canada.ca — Mutual funds", url: "https://www.canada.ca/en/financial-consumer-agency/services/savings-investments/mutual-funds-segregated.html" },
      { title: "AMF Québec — Fonds communs de placement", url: "https://lautorite.qc.ca/grand-public/investissements/produits-dinvestissement/fonds-communs-de-placement" },
      { title: "Investopedia — Mutual Fund", url: "https://www.investopedia.com/terms/m/mutualfund.asp" },
    ],
  },

  fundOfFunds: {
    label: "Fund of funds / Asset-allocation funds",
    summary:
      "A fund that holds other funds instead of individual securities — a one-ticket balanced portfolio, rebalanced automatically.",
    characteristics:
      "Most popular form in Canada: Vanguard's VEQT (100% equity), VGRO (80/20), VBAL (60/40), VCNS (40/60), and iShares equivalents (XEQT, XGRO, XBAL). Internally they hold 5–10 underlying ETFs covering Canadian, US, international, and (for balanced variants) bonds. MER typically 0.20%–0.25%. Target-date funds (e.g. 2050, 2060) are another variant that glide from stocks toward bonds as the target date approaches.",
    whenToBuy:
      "When you want a complete portfolio in a single ETF and don't want to rebalance manually. Ideal for beginners, busy professionals, or inside TFSAs/RRSPs where simplicity matters. Pick the risk level matching your horizon — VEQT for 20+ year horizons, VBAL for balanced retirement investing, VCNS for near-retirement.",
    whyBuy:
      "Set-and-forget investing. Auto-rebalancing means you hold target weights at all times without transaction costs. All the diversification of a 3-ETF portfolio in one purchase — no spreadsheet needed.",
    profitsQuebec:
      "Same pass-through as regular ETFs: the underlying dividends, interest, and capital gains flow to you keeping their character. Because internal rebalancing happens in-kind, distributed capital gains are typically small. T3/Relevé 16 at tax time. Capital gains on sale: 50% inclusion rate.",
    links: [
      { title: "Investopedia — Fund of Funds (FoF)", url: "https://www.investopedia.com/terms/f/fundsoffunds.asp" },
      { title: "Vanguard Canada — Asset allocation ETFs", url: "https://www.vanguard.ca/en/investor/products/products-group/etfs/asset-allocation-etfs" },
      { title: "Canadian Couch Potato — One-fund portfolios", url: "https://canadiancouchpotato.com/model-portfolios/" },
    ],
  },

  reit: {
    label: "REIT (Real Estate Investment Trust)",
    summary:
      "A trust that owns and operates income-producing real estate — apartments, offices, malls, warehouses — and pays out most of its rental income as distributions.",
    characteristics:
      "Canadian REITs (e.g. REI.UN, HR.UN, CAR.UN) must by law distribute at least 90% of taxable income to unitholders to maintain their flow-through status. Yields are typically 3%–7%. Traded on the TSX like stocks. Price is sensitive to interest rates (higher rates = lower REIT prices) and real-estate fundamentals. Can also be held via REIT ETFs (XRE, ZRE) for diversified exposure.",
    whenToBuy:
      "When you want real-estate exposure without buying property, and you want high current income. Works as a diversifier within a stock sleeve — real estate has historically had moderate correlation to broad equities.",
    whyBuy:
      "Income + inflation hedge (rents reset over time). Access to commercial real estate at small dollar amounts. Liquid, unlike direct property.",
    profitsQuebec:
      "REIT distributions are a blended mix: part 'other income' (fully taxable like interest), part 'return of capital' (not taxed now, reduces your adjusted cost base and is taxed as a capital gain on sale), sometimes part 'capital gains' and part 'foreign income'. The T3/Relevé 16 breaks this down. Because of the ordinary-income portion, REITs are most tax-efficient inside a TFSA or RRSP.",
    links: [
      { title: "Canada.ca — REITs", url: "https://www.canada.ca/en/financial-consumer-agency/services/savings-investments.html" },
      { title: "Investopedia — REIT", url: "https://www.investopedia.com/terms/r/reit.asp" },
      { title: "TMX Money — Canadian REITs", url: "https://money.tmx.com/en/quote/search" },
    ],
  },

  registeredAccounts: {
    label: "Registered accounts (TFSA / RRSP / FHSA)",
    summary:
      "Not an investment itself — a tax wrapper that changes how any underlying investment is taxed. Choosing the right wrapper is often more impactful than choosing the investment.",
    characteristics:
      "• TFSA / CELI (Tax-Free Savings Account): contributions not deductible, withdrawals tax-free, growth tax-free. 2025 room: $7,000/yr; lifetime accumulated from 2009. " +
      "• RRSP / REER (Registered Retirement Savings Plan): contributions deductible from income, growth tax-deferred, withdrawals fully taxable. Max 18% of previous-year earned income, up to $32,490 (2025). " +
      "• FHSA / CELIAPP (First Home Savings Account): combines both — deductible contribution AND tax-free withdrawal (for first home). $8,000/yr, $40,000 lifetime. Unused deduction carries forward. " +
      "• RESP / REEE (Registered Education Savings Plan): for kids' post-secondary. Contributions not deductible but government grants (CESG) add up to $7,200 per child. " +
      "• Non-registered (taxable): everything else — use only after the above are full.",
    whenToBuy:
      "Priority order for most Québec residents: (1) FHSA if you don't own a home, (2) RRSP if your current marginal rate is higher than expected retirement rate, (3) TFSA, (4) non-registered. For low/moderate earners, TFSA often beats RRSP. Use RESP for kids to capture the 20% government grant.",
    whyBuy:
      "Tax drag is the largest controllable cost in a long-term portfolio. Sheltering high-tax income (interest, foreign dividends, REITs) inside TFSA/RRSP can add hundreds of thousands over a career compared to holding the same investments in a taxable account.",
    profitsQuebec:
      "TFSA / CELI: no tax, ever, on growth or withdrawals (Canadian residents). " +
      "RRSP / REER: no tax while inside; withdrawals taxed at your full marginal rate (target: lower retirement rate). " +
      "FHSA: no tax if used for a qualifying first home purchase; otherwise transfers to RRSP tax-free. " +
      "Non-registered: tax depends on the income type (interest 100%, Canadian dividends with credit, capital gains 50% inclusion — all at marginal federal + Québec rates).",
    links: [
      { title: "Canada.ca — TFSA", url: "https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/tax-free-savings-account.html" },
      { title: "Canada.ca — RRSP", url: "https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/rrsps-related-plans.html" },
      { title: "Canada.ca — FHSA (First Home Savings)", url: "https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/first-home-savings-account.html" },
      { title: "Revenu Québec — Régimes enregistrés", url: "https://www.revenuquebec.ca/fr/citoyens/declaration-de-revenus/remplir-votre-declaration-de-revenus/comment-remplir-votre-declaration/revenus/revenus-de-placement/" },
    ],
  },
};

const INVESTMENT_GUIDE_FR: Record<InvestmentKind, InvestmentEntry> = {
  savings: {
    label: "Compte d'épargne / CEIE",
    summary:
      "Fonds déposés dans une institution réglementée (fédérale ou provinciale), portant un taux d'intérêt variable. Le capital n'est pas à risque ; les dépôts sont assurés.",
    characteristics:
      "Très liquide — retraits en tout temps. Le capital est garanti par la SADC (banques fédérales) jusqu'à 100 000 $ par catégorie, ou par l'Autorité des marchés financiers via le Fonds d'assurance-dépôts du Québec (FQDR) pour les caisses populaires. Les taux suivent le taux directeur de la Banque du Canada. Un compte d'épargne à intérêt élevé (CEIE) rapporte plus qu'un compte chèques, mais moins qu'un CPG ou qu'une obligation.",
    whenToBuy:
      "Conservez toujours 3 à 6 mois de dépenses dans un CEIE comme fonds d'urgence avant d'investir dans quoi que ce soit de plus risqué. Utile aussi comme point d'attente pour les objectifs à court terme (< 1 an) ou pour garder du capital prêt à être déployé.",
    whyBuy:
      "Stabilité et accès instantané. Ce n'est pas un outil de croissance — le rendement réel (après inflation) est généralement proche de zéro ou légèrement négatif — mais il protège votre capital et votre liquidité.",
    profitsQuebec:
      "Les intérêts sont versés mensuellement ou trimestriellement et sont 100 % imposables comme revenu ordinaire au taux marginal combiné fédéral + Québec (tranche supérieure ≈ 53,31 % en 2025). Aucun traitement préférentiel. À l'intérieur d'un CELI (TFSA) ou REER (RRSP), les intérêts sont à l'abri de l'impôt.",
    links: [
      { title: "SADC — Assurance-dépôts", url: "https://www.cdic.ca/fr/votre-couverture/liste-des-produits-assures/" },
      { title: "AMF Québec — Épargne et dépôts", url: "https://lautorite.qc.ca/grand-public/investissements/epargne-et-depots" },
      { title: "Investopedia — High-Yield Savings Account (anglais)", url: "https://www.investopedia.com/terms/h/high-yield-savings-account.asp" },
    ],
  },

  gic: {
    label: "CPG (Certificat de placement garanti)",
    summary:
      "Un dépôt à terme : vous prêtez de l'argent à une banque pour une durée fixe (typiquement 30 jours à 5 ans) en échange d'un taux d'intérêt garanti.",
    characteristics:
      "Le capital est garanti et assuré par la SADC jusqu'à 100 000 $ par catégorie. Les taux sont fixes pour la durée — les termes plus longs rapportent généralement plus. Les CPG « non rachetables » bloquent votre argent ; les CPG « rachetables » ou « encaissables » permettent une sortie anticipée à un taux moindre. Les CPG à rendement boursier offrent un rendement variable lié à un indice, souvent avec un plancher et un plafond.",
    whenToBuy:
      "Lorsque vous avez une dépense future connue avec un échéancier précis (mise de fonds dans 3 ans, frais de scolarité l'automne prochain) et ne voulez aucun risque de perte. Également utile sous forme de « échelle de CPG » — échelonner les échéances chaque année — pour les retraités qui ont besoin de revenus prévisibles.",
    whyBuy:
      "Certitude absolue du rendement nominal. Bat le taux d'un compte d'épargne lorsque vous pouvez bloquer l'argent pour la durée. Mauvais choix si l'inflation ou les taux montent fortement pendant votre terme.",
    profitsQuebec:
      "Intérêts versés à l'échéance (termes courts) ou annuellement (termes longs) — mais l'ARC et Revenu Québec exigent de déclarer les intérêts au fur et à mesure qu'ils courent chaque année, même s'ils ne sont pas encore reçus (T5 / Relevé 3). Entièrement imposés au taux marginal. Abritez-les dans un CELI/REER pour éviter la traînée fiscale.",
    links: [
      { title: "Canada.ca — CPG", url: "https://www.canada.ca/fr/agence-consommation-matiere-financiere/services/epargne-investissements/certificat-placement-garanti.html" },
      { title: "AMF Québec — Certificats de placement garanti", url: "https://lautorite.qc.ca/grand-public/investissements/autres-produits-dinvestissement/certificat-de-placement-garanti" },
      { title: "Investopedia — GIC (anglais)", url: "https://www.investopedia.com/terms/g/gic.asp" },
    ],
  },

  bond: {
    label: "Obligations",
    summary:
      "Un prêt que vous consentez à un gouvernement ou à une société. L'émetteur vous verse des intérêts périodiques (le « coupon ») et rembourse votre capital à l'échéance.",
    characteristics:
      "Trois grands types au Canada : obligations du gouvernement du Canada (risque le plus faible), obligations provinciales (p. ex. Québec, Ontario) et obligations de sociétés (rendement plus élevé, risque plus élevé). Le prix évolue inversement aux taux d'intérêt : taux ↑ → prix ↓. La cote de crédit (AAA à pacotille) mesure le risque de défaut. La plupart des investisseurs particuliers détiennent des obligations via des FNB obligataires plutôt qu'individuellement, car le marché des obligations individuelles offre une transparence de prix médiocre pour les petits lots.",
    whenToBuy:
      "Lorsque vous voulez un revenu régulier et une volatilité moindre que les actions. Les allocations typiques vont de 20 % du portefeuille (jeune investisseur agressif) à 60 % et plus (retraité qui tire un revenu). Achetez en contexte de taux élevés pour verrouiller des rendements attrayants ; évitez les obligations à longue durée quand les taux doivent monter.",
    whyBuy:
      "Diversification — les obligations zigzaguent souvent (pas toujours) à l'inverse des actions, amortissant les baisses. Flux de trésorerie prévisible pour les retraités. Préservation du capital par rapport aux actions.",
    profitsQuebec:
      "Les intérêts de coupon sont versés semestriellement et imposés comme revenu ordinaire (entièrement imposable, taux marginal). Les gains en capital d'une vente d'obligation au-dessus du pair sont imposables à 50 % (taux d'inclusion). Les intérêts courus sur les obligations à coupon détaché / zéro coupon sont imposables chaque année même sans paiement. Abritez les revenus obligataires dans un REER/CELI pour éviter la traînée fiscale. Les intérêts d'obligations étrangères (É.-U., outre-mer) peuvent subir une retenue d'impôt de 15 % dans un compte non enregistré.",
    links: [
      { title: "Banque du Canada — Obligations canadiennes", url: "https://www.banqueducanada.ca/taux/taux-dinteret/obligations-canadiennes/" },
      { title: "AMF Québec — Obligations", url: "https://lautorite.qc.ca/grand-public/investissements/produits-dinvestissement/obligations" },
      { title: "Investopedia — Bond Basics (anglais)", url: "https://www.investopedia.com/terms/b/bond.asp" },
    ],
  },

  stock: {
    label: "Actions ordinaires",
    summary:
      "Une participation partielle dans une société cotée en bourse. Vous partagez les profits (via les dividendes) et la plus-value (gains en capital).",
    characteristics:
      "Rendement attendu à long terme le plus élevé des grandes classes d'actifs, mais aussi la plus grande volatilité. Cotées en continu sur les bourses (TSX, NYSE, NASDAQ). Les rendements proviennent de deux sources : dividendes (versements périodiques en espèces) et gains en capital (hausse du cours). Les actions individuelles comportent un risque idiosyncrasique — une seule société peut chuter de 50 % en une journée sur une mauvaise nouvelle. Diversifier sur 20+ titres réduit fortement ce risque.",
    whenToBuy:
      "Quand votre horizon est de 5 ans ou plus. Les actions sont la classe d'actifs la plus susceptible de battre l'inflation sur de longues périodes. Achetez d'abord dans un compte enregistré (CELI, puis REER), puis en non enregistré une fois ces limites atteintes. Évitez d'investir en actions l'argent dont vous aurez besoin dans moins de 2 ans.",
    whyBuy:
      "Croissance de patrimoine à long terme. Posséder des actions signifie profiter directement des gains de productivité et de la capitalisation des bénéfices. Historiquement, le S&P/TSX Composite a rapporté environ 7 % par an après inflation sur de longues périodes, même si chaque décennie peut être très différente.",
    profitsQuebec:
      "Deux flux d'imposition : (1) les dividendes canadiens déterminés bénéficient du crédit d'impôt pour dividendes (fédéral + Québec), donc imposés plus légèrement que les intérêts — taux marginal québécois le plus élevé ≈ 40 % contre 53 % pour les intérêts. (2) Gains en capital à la vente : seulement 50 % du gain est imposable (taux d'inclusion) ; combiné au taux marginal, le taux effectif maximal ≈ 26,65 % au Québec. Les dividendes étrangers (É.-U.) sont entièrement imposables et subissent une retenue américaine de 15 % dans un compte non enregistré — levée dans un REER, mais pas dans un CELI.",
    links: [
      { title: "Canada.ca — Investir dans des actions", url: "https://www.canada.ca/fr/agence-consommation-matiere-financiere/services/epargne-investissements/actions.html" },
      { title: "AMF Québec — Actions", url: "https://lautorite.qc.ca/grand-public/investissements/produits-dinvestissement/actions" },
      { title: "Revenu Québec — Dividendes et gains en capital", url: "https://www.revenuquebec.ca/fr/citoyens/declaration-de-revenus/remplir-votre-declaration-de-revenus/comment-remplir-votre-declaration/revenus/revenus-de-placement/" },
    ],
  },

  preferredShare: {
    label: "Actions privilégiées",
    summary:
      "Un hybride entre une obligation et une action : verse un dividende fixe comme un coupon obligataire, mais se négocie en bourse comme une action et se classe après les obligations en cas de faillite.",
    characteristics:
      "Les actions privilégiées canadiennes comportent souvent des caractéristiques comme « à taux révisable » (dividende réinitialisé tous les 5 ans selon le rendement des obligations du gouvernement du Canada à 5 ans + un écart), « perpétuelles » (dividende fixe à perpétuité) ou « à taux variable ». Volatilité moindre que les actions ordinaires, mais peuvent fluctuer sensiblement quand les taux d'intérêt ou les écarts de crédit bougent. Versent des dividendes canadiens déterminés, admissibles au crédit d'impôt pour dividendes.",
    whenToBuy:
      "Lorsque vous voulez un revenu plus élevé que celui des obligations sans prendre le plein risque d'actions, et que vous avez déjà une exposition aux actions ordinaires et aux obligations. La plupart des investisseurs particuliers qui souhaitent une exposition aux privilégiées les détiennent via un FNB d'actions privilégiées (p. ex. CPD.TO, ZPR.TO) pour diversifier le risque émetteur.",
    whyBuy:
      "Bonification du revenu — les rendements des privilégiées dépassent souvent ceux des obligations de qualité. De plus, le crédit d'impôt pour dividendes canadiens rend le rendement après impôt plus attrayant que les intérêts obligataires dans un compte non enregistré.",
    profitsQuebec:
      "Les dividendes des privilégiées canadiennes sont des dividendes déterminés — le crédit d'impôt pour dividendes s'applique (fédéral + Québec). Gains en capital à la vente : taux d'inclusion de 50 %. Les privilégiées émises aux États-Unis n'y sont pas admissibles — ces dividendes sont imposés comme revenu étranger ordinaire avec une retenue américaine de 15 %.",
    links: [
      { title: "Investopedia — Preferred Stock (anglais)", url: "https://www.investopedia.com/terms/p/preferredstock.asp" },
      { title: "TMX Money — Actions privilégiées", url: "https://money.tmx.com/fr/quote/search" },
      { title: "AMF Québec — Actions privilégiées", url: "https://lautorite.qc.ca/grand-public/investissements/produits-dinvestissement/actions" },
    ],
  },

  etf: {
    label: "FNB (Fonds négocié en bourse)",
    summary:
      "Un panier de titres (actions, obligations ou les deux) qui se négocie en bourse comme une seule action. La plupart des FNB répliquent un indice publié.",
    characteristics:
      "Frais de gestion faibles (RFG souvent de 0,03 % à 0,30 % pour les FNB indiciels). Négociation intrajournalière — achat/vente à toute heure d'ouverture du marché. Avoirs pleinement transparents (publiés quotidiennement). Énorme variété : indice de marché large (VFV, XIC), sectoriel (XIT techno, XEG énergie), obligataire (ZAG, XBB), dividendes (VDY), mono-pays, matières premières, thématique. Certains FNB sont gérés activement (RFG plus élevé). Les FNB cotés au Canada sont généralement plus efficients fiscalement que les FNB cotés aux É.-U. pour les investisseurs canadiens.",
    whenToBuy:
      "Comme brique de base pour presque n'importe quel portefeuille. Idéal pour les investisseurs qui veulent une diversification sans choisir des actions individuelles. Un portefeuille de trois FNB (actions canadiennes + américaines + internationales) couvre la majorité des besoins. Ajoutez un FNB obligataire pour l'équilibre. Utilisez un FNB large dans un CELI/REER pour la configuration la plus simple.",
    whyBuy:
      "Diversification instantanée à coût minime. Frais inférieurs aux fonds communs (typiquement 1 à 2 % de RFG de moins), ce qui compose jusqu'à un écart important à la retraite. Structure fiscalement efficiente (création/rachat en nature réduit les gains en capital distribués).",
    profitsQuebec:
      "Les FNB distribuent des revenus périodiquement : les dividendes circulent en conservant leur nature (canadiens déterminés, étrangers, etc.), les intérêts circulent comme intérêts, et les gains en capital réalisés dans le fonds circulent comme gains en capital. Le traitement fiscal suit la source sous-jacente. Gains en capital à la vente du FNB lui-même : taux d'inclusion de 50 %. Vous recevrez un T3/Relevé 16 en mars pour les distributions.",
    links: [
      { title: "Canada.ca — Fonds négociés en bourse", url: "https://www.canada.ca/fr/agence-consommation-matiere-financiere/services/epargne-investissements/fonds-negocies-bourse.html" },
      { title: "AMF Québec — Fonds négociés en bourse (FNB)", url: "https://lautorite.qc.ca/grand-public/investissements/produits-dinvestissement/fonds-negocies-en-bourse-fnb" },
      { title: "Investopedia — ETF (anglais)", url: "https://www.investopedia.com/terms/e/etf.asp" },
    ],
  },

  mutualFund: {
    label: "Fonds communs de placement",
    summary:
      "Un pool d'argent géré professionnellement qui achète un portefeuille de titres. Vous détenez des parts évaluées une fois par jour à la valeur liquidative (VL).",
    characteristics:
      "Historiquement l'investissement de détail par défaut au Canada. Acheté et vendu à la VL de fin de journée, pas en intrajournalier. Frais de gestion (RFG) typiquement 1,5 % à 2,5 % — beaucoup plus élevés que les FNB. Beaucoup sont en « séries » — série A (avec commission de suivi au conseiller), série F (sans commission, conseiller à honoraires), série D (courtier à escompte). Les fonds gérés activement visent à battre un indice (la plupart n'y parviennent pas à long terme). Les achats minimaux sont parfois faibles (500 $ à 1 000 $), ce qui les rend accessibles.",
    whenToBuy:
      "Lorsque vous voulez une gestion professionnelle et ne voulez pas négocier un FNB vous-même, ou quand vous investissez régulièrement via un régime REER d'employeur qui n'offre que des fonds communs. Évitez les fonds à RFG élevé dans les comptes imposables — la traînée se compose.",
    whyBuy:
      "Simplicité : un seul achat vous donne un portefeuille diversifié et géré activement. Utile pour les cotisations préautorisées automatiques. Historiquement dominant au Québec via les familles de fonds des caisses populaires Desjardins.",
    profitsQuebec:
      "Même traitement fiscal par transparence que les FNB — les distributions conservent la nature de leur source (dividendes, intérêts, gains en capital) et sont imposables l'année reçue, même si automatiquement réinvesties (PRD/DRIP). Gains en capital à la vente de parts : taux d'inclusion de 50 %. Les fonds actifs à rotation élevée tendent à distribuer plus de gains en capital d'une année à l'autre que les FNB indiciels, ce qui ne compte que dans les comptes non enregistrés.",
    links: [
      { title: "Canada.ca — Fonds communs de placement", url: "https://www.canada.ca/fr/agence-consommation-matiere-financiere/services/epargne-investissements/fonds-communs-placement-distincts.html" },
      { title: "AMF Québec — Fonds communs de placement", url: "https://lautorite.qc.ca/grand-public/investissements/produits-dinvestissement/fonds-communs-de-placement" },
      { title: "Investopedia — Mutual Fund (anglais)", url: "https://www.investopedia.com/terms/m/mutualfund.asp" },
    ],
  },

  fundOfFunds: {
    label: "Fonds de fonds / Fonds à répartition d'actifs",
    summary:
      "Un fonds qui détient d'autres fonds plutôt que des titres individuels — un portefeuille équilibré « tout-en-un », rééquilibré automatiquement.",
    characteristics:
      "Formes les plus populaires au Canada : VEQT de Vanguard (100 % actions), VGRO (80/20), VBAL (60/40), VCNS (40/60), et les équivalents iShares (XEQT, XGRO, XBAL). Ils détiennent à l'interne 5 à 10 FNB sous-jacents couvrant les actions canadiennes, américaines, internationales et (pour les variantes équilibrées) des obligations. RFG typiquement 0,20 % à 0,25 %. Les fonds à date cible (p. ex. 2050, 2060) sont une autre variante qui glisse des actions vers les obligations à l'approche de la date cible.",
    whenToBuy:
      "Lorsque vous voulez un portefeuille complet dans un seul FNB et ne voulez pas rééquilibrer manuellement. Idéal pour les débutants, les professionnels occupés, ou à l'intérieur d'un CELI/REER où la simplicité compte. Choisissez le niveau de risque qui correspond à votre horizon — VEQT pour 20 ans et plus, VBAL pour un placement de retraite équilibré, VCNS près de la retraite.",
    whyBuy:
      "Investissement « posez et oubliez ». Le rééquilibrage automatique garde les pondérations cibles en tout temps sans coûts de transaction. Toute la diversification d'un portefeuille à 3 FNB en un seul achat — aucun tableur nécessaire.",
    profitsQuebec:
      "Même transparence fiscale que les FNB ordinaires : les dividendes, intérêts et gains en capital sous-jacents vous parviennent en conservant leur nature. Comme le rééquilibrage interne se fait en nature, les gains en capital distribués sont généralement faibles. T3/Relevé 16 au printemps. Gains en capital à la vente : taux d'inclusion de 50 %.",
    links: [
      { title: "Investopedia — Fund of Funds (FoF) (anglais)", url: "https://www.investopedia.com/terms/f/fundsoffunds.asp" },
      { title: "Vanguard Canada — FNB à répartition d'actifs", url: "https://www.vanguard.ca/fr/investisseur/produits/products-group/etfs/asset-allocation-etfs" },
      { title: "Canadian Couch Potato — Portefeuilles à un seul fonds (anglais)", url: "https://canadiancouchpotato.com/model-portfolios/" },
    ],
  },

  reit: {
    label: "FPI (Fiducie de placement immobilier)",
    summary:
      "Une fiducie qui détient et exploite des biens immobiliers générateurs de revenus — logements, bureaux, centres commerciaux, entrepôts — et qui distribue la majeure partie de ses revenus locatifs.",
    characteristics:
      "Les FPI canadiennes (p. ex. REI.UN, HR.UN, CAR.UN) doivent légalement distribuer au moins 90 % de leur revenu imposable aux porteurs de parts pour conserver leur statut de véhicule transparent. Les rendements sont typiquement de 3 % à 7 %. Négociées à la TSX comme des actions. Le prix est sensible aux taux d'intérêt (taux ↑ = prix des FPI ↓) et aux fondamentaux immobiliers. Peuvent aussi être détenues via des FNB de FPI (XRE, ZRE) pour une exposition diversifiée.",
    whenToBuy:
      "Lorsque vous voulez une exposition immobilière sans acheter de propriété, et que vous voulez un revenu courant élevé. Fonctionne comme diversificateur dans une poche d'actions — l'immobilier a historiquement une corrélation modérée avec les actions larges.",
    whyBuy:
      "Revenu + protection contre l'inflation (les loyers se réajustent avec le temps). Accès à l'immobilier commercial à partir de petits montants. Liquide, contrairement à la propriété directe.",
    profitsQuebec:
      "Les distributions de FPI sont un mélange : en partie « autres revenus » (entièrement imposables comme les intérêts), en partie « remboursement de capital » (non imposé immédiatement, réduit votre prix de base rajusté et sera imposé en gain en capital à la vente), parfois en partie « gains en capital » et en partie « revenus étrangers ». Le T3/Relevé 16 ventile le tout. En raison de la portion en revenu ordinaire, les FPI sont fiscalement plus efficientes à l'intérieur d'un CELI ou d'un REER.",
    links: [
      { title: "Canada.ca — FPI", url: "https://www.canada.ca/fr/agence-consommation-matiere-financiere/services/epargne-investissements.html" },
      { title: "Investopedia — REIT (anglais)", url: "https://www.investopedia.com/terms/r/reit.asp" },
      { title: "TMX Money — FPI canadiennes", url: "https://money.tmx.com/fr/quote/search" },
    ],
  },

  registeredAccounts: {
    label: "Comptes enregistrés (CELI / REER / CELIAPP)",
    summary:
      "Pas un investissement en soi — une enveloppe fiscale qui modifie la façon dont tout investissement sous-jacent est imposé. Choisir la bonne enveloppe est souvent plus important que choisir l'investissement.",
    characteristics:
      "• CELI / TFSA (Compte d'épargne libre d'impôt) : cotisations non déductibles, retraits libres d'impôt, croissance libre d'impôt. Droit 2025 : 7 000 $/an ; cumul à vie depuis 2009. " +
      "• REER / RRSP (Régime enregistré d'épargne-retraite) : cotisations déductibles du revenu, croissance à imposition reportée, retraits entièrement imposables. Maximum 18 % du revenu gagné l'année précédente, jusqu'à 32 490 $ (2025). " +
      "• CELIAPP / FHSA (Compte d'épargne libre d'impôt pour l'achat d'une première propriété) : combine les deux — cotisation déductible ET retrait libre d'impôt (pour une première propriété). 8 000 $/an, 40 000 $ à vie. La déduction inutilisée se reporte. " +
      "• REEE / RESP (Régime enregistré d'épargne-études) : pour les études postsecondaires des enfants. Cotisations non déductibles, mais les subventions gouvernementales (SCEE) ajoutent jusqu'à 7 200 $ par enfant. " +
      "• Non enregistré (imposable) : tout le reste — à n'utiliser qu'après avoir rempli les précédents.",
    whenToBuy:
      "Ordre de priorité pour la plupart des résidents du Québec : (1) CELIAPP si vous n'êtes pas propriétaire, (2) REER si votre taux marginal actuel est plus élevé que le taux prévu à la retraite, (3) CELI, (4) non enregistré. Pour les revenus faibles/modérés, le CELI bat souvent le REER. Utilisez le REEE pour les enfants afin de capter la subvention gouvernementale de 20 %.",
    whyBuy:
      "La traînée fiscale est le plus grand coût contrôlable d'un portefeuille à long terme. Abriter les revenus à forte imposition (intérêts, dividendes étrangers, FPI) dans un CELI/REER peut ajouter des centaines de milliers de dollars sur une carrière par rapport à détenir les mêmes placements dans un compte imposable.",
    profitsQuebec:
      "CELI / TFSA : aucun impôt, jamais, sur la croissance ni sur les retraits (résidents canadiens). " +
      "REER / RRSP : aucun impôt à l'intérieur ; les retraits sont imposés à votre plein taux marginal (cible : taux de retraite plus bas). " +
      "CELIAPP : aucun impôt si utilisé pour l'achat admissible d'une première propriété ; sinon transfert au REER sans impôt. " +
      "Non enregistré : l'impôt dépend du type de revenu (intérêts 100 %, dividendes canadiens avec crédit, gains en capital 50 % d'inclusion — tous aux taux marginaux combinés fédéral + Québec).",
    links: [
      { title: "Canada.ca — CELI", url: "https://www.canada.ca/fr/agence-revenu/services/impot/particuliers/sujets/compte-epargne-libre-impot.html" },
      { title: "Canada.ca — REER", url: "https://www.canada.ca/fr/agence-revenu/services/impot/particuliers/sujets/reer-regimes-connexes.html" },
      { title: "Canada.ca — CELIAPP (épargne première propriété)", url: "https://www.canada.ca/fr/agence-revenu/services/impot/particuliers/sujets/compte-epargne-libre-impot-achat-premiere-propriete.html" },
      { title: "Revenu Québec — Régimes enregistrés", url: "https://www.revenuquebec.ca/fr/citoyens/declaration-de-revenus/remplir-votre-declaration-de-revenus/comment-remplir-votre-declaration/revenus/revenus-de-placement/" },
    ],
  },
};

export const INVESTMENT_GUIDE: Record<Lang, Record<InvestmentKind, InvestmentEntry>> = {
  en: INVESTMENT_GUIDE_EN,
  fr: INVESTMENT_GUIDE_FR,
};
