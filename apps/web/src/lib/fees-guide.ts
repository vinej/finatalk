import type { Lang } from "@/lib/lang";

export type FeeLink = { title: string; url: string };

export type FeeTopic = {
  key: string;
  label: string;
  summary: string;
  howItWorks: string;
  typicalCost: string;
  howToMinimize: string;
  links: FeeLink[];
};

export const FEE_TOPICS = [
  "commissions",
  "mer",
  "trailers",
  "fxConversion",
  "adminFees",
  "transferFees",
  "advisorFees",
  "bidAskSpread",
  "bondGicCosts",
  "hiddenCosts",
] as const;

export type FeeTopicKey = (typeof FEE_TOPICS)[number];

export const FEES_GENERAL_LINKS: Record<Lang, FeeLink[]> = {
  en: [
    { title: "Canada.ca — Investment fees", url: "https://www.canada.ca/en/financial-consumer-agency/services/savings-investments/investments-fees.html" },
    { title: "CSA — Fund Facts explained", url: "https://www.securities-administrators.ca/investor-tools/understanding-disclosure/fund-facts/" },
    { title: "AMF Québec — Frais de placement", url: "https://lautorite.qc.ca/grand-public/investissements/frais-des-placements" },
    { title: "Investopedia — MER", url: "https://www.investopedia.com/terms/m/mer.asp" },
    { title: "Canadian Couch Potato — Cost of investing", url: "https://canadiancouchpotato.com/faq/" },
  ],
  fr: [
    { title: "Canada.ca — Frais de placement", url: "https://www.canada.ca/fr/agence-consommation-matiere-financiere/services/epargne-investissements/frais-placements.html" },
    { title: "ACVM — Aperçu du fonds expliqué", url: "https://www.securities-administrators.ca/investor-tools/understanding-disclosure/fund-facts/?lang=fr-ca" },
    { title: "AMF Québec — Frais des placements", url: "https://lautorite.qc.ca/grand-public/investissements/frais-des-placements" },
    { title: "Investopedia — RFG", url: "https://www.investopedia.com/terms/m/mer.asp" },
    { title: "Canadian Couch Potato — Coûts d'investissement", url: "https://canadiancouchpotato.com/faq/" },
  ],
};

const GUIDE_EN: Record<FeeTopicKey, FeeTopic> = {
  commissions: {
    key: "commissions",
    label: "Trading commissions (buy / sell)",
    summary:
      "A flat fee charged every time you buy or sell a stock, ETF, or option through a broker. Applies on both sides of a round trip.",
    howItWorks:
      "Charged per transaction, regardless of size. Market and limit orders cost the same. ECN fees may apply on some limit orders placed at Canadian brokers. Options add a per-contract fee on top of (or instead of) a flat base. Mutual funds are commission-free at most brokers (trailer/MER embedded instead).",
    typicalCost:
      "Stocks & ETFs: $0 at Wealthsimple, Questrade (ETFs free to buy), National Bank Direct Brokerage, Desjardins Disnat (for members), CIBC Investor's Edge (ages 18–24). $4.95–$9.99 at big-bank brokers (TD Direct, RBC Direct, BMO InvestorLine, Scotia iTRADE). Options: $0.75–$1.25 per contract + $0–$9.99 base. Mutual funds: typically $0.",
    howToMinimize:
      "Use a commission-free broker for stock/ETF trading — 5+ Canadian brokers now offer this. Batch purchases: fewer, larger trades beat many small trades. For dollar-cost-averaging, a $0-commission ETF buy lets you invest weekly without drag. Avoid brokers that charge ECN fees for retail limit orders.",
    links: [
      { title: "Finder — Canadian brokerage comparison", url: "https://www.finder.com/ca/trading-platforms" },
      { title: "MoneySense — Best online brokers", url: "https://www.moneysense.ca/save/investing/best-online-brokers-in-canada/" },
    ],
  },
  mer: {
    key: "mer",
    label: "MER — Management Expense Ratio",
    summary:
      "An annual percentage quietly deducted from a fund's assets every day. You never see a charge — it just reduces the fund's return. The single biggest cost in most portfolios.",
    howItWorks:
      "Published on Fund Facts and ETF Facts. Includes: management fee (paid to the manager) + operating expenses (custody, audit, legal, filing fees) + trailer commission (paid to the selling dealer, if any) + GST/HST. Deducted daily from NAV, so the quoted return is always net of MER. Separate from the TER (Trading Expense Ratio) which covers internal trading costs.",
    typicalCost:
      "Bank mutual funds A-series: 1.70%–2.50% per year. D-series (discount broker): 1.00%–1.50%. F-series (fee-based): 0.60%–1.00%. Broad-market index ETFs: 0.03%–0.25% (XIC 0.06%, VFV 0.09%, XUU 0.07%). Asset-allocation ETFs: 0.20%–0.25% (VEQT, VBAL, XEQT). Active ETFs: 0.25%–0.85%. Sector/thematic ETFs: 0.30%–0.80%.",
    howToMinimize:
      "A 1.5% MER gap over 30 years compounds to roughly 36% less money at the end. Index ETFs over active mutual funds is the single biggest savings. If you prefer mutual funds, use D-series (discount broker) or F-series (fee-based advisor) — same strategy, half the MER of the A-series.",
    links: [
      { title: "CSA — Understanding Fund Facts", url: "https://www.securities-administrators.ca/investor-tools/understanding-disclosure/fund-facts/" },
      { title: "Morningstar — Fund fee research", url: "https://www.morningstar.ca/ca/research" },
    ],
  },
  trailers: {
    key: "trailers",
    label: "Trailer commissions & sales loads",
    summary:
      "Ongoing payments from a mutual fund to your dealer or advisor, carved out of the MER. Sales loads are upfront or deferred commissions on top.",
    howItWorks:
      "A-series mutual funds pay a 0.50%–1.00% annual trailer commission to the dealer for as long as you hold, embedded in the MER. F-series have zero trailer — the advisor bills you directly. D-series have a reduced trailer (0.15%–0.25%) for discount-broker distribution. Deferred Sales Charge (DSC) funds are banned on new purchases in Canada since June 2022; legacy DSC holdings still charge a declining backend penalty if sold early. Short-term trading fees apply when you redeem within 30–90 days.",
    typicalCost:
      "Trailer: 0.50% (bond funds) to 1.00% (equity funds) per year of AUM, indefinitely. Legacy DSC backend: 5.5%–6% year 1, declining ~1%/yr to 0 after 6–7 years. Short-term trading fee: 1%–2% if redeemed within the window.",
    howToMinimize:
      "Avoid A-series unless you actively use the advisor's services. Switch to F-series (and pay the advisor directly) or D-series (self-directed at a discount broker) for the same strategy at roughly half the cost. If you hold legacy DSC funds, check the schedule before selling — sometimes waiting 1–2 more years to let the DSC hit zero is the right call.",
    links: [
      { title: "OSC — Trailing commissions", url: "https://www.getsmarteraboutmoney.ca/invest/investment-products/mutual-funds-segregated-funds/understanding-mutual-fund-fees/" },
      { title: "CSA — DSC ban announcement", url: "https://www.securities-administrators.ca/news/canadian-securities-regulators-finalize-a-ban-on-deferred-sales-charges-and-prohibit-mutual-fund-trailing-commissions-for-discount-brokers/" },
    ],
  },
  fxConversion: {
    key: "fxConversion",
    label: "FX conversion fees",
    summary:
      "A spread (not a commission) charged every time CAD is converted to USD or vice versa — to buy US securities, receive USD dividends, or repatriate cash.",
    howItWorks:
      "Broker uses an internal rate at mid-market plus a 1.5–2% markup. Triggered on: (a) buying a USD security from a CAD account; (b) receiving USD dividends in a CAD-only account (auto-converted back); (c) selling a USD security and leaving cash in CAD. Brokers offering USD-side accounts (most do) let you hold USD directly — no conversion triggered until you actually move money across sides.",
    typicalCost:
      "Discount brokers: 1.50%–2.00% each way (so round-trip ≈ 3–4% on a buy-then-sell). Wealthsimple: ~1.5%. Big-bank branches (consumer): 2.5%–3.5%. Norbert's Gambit (DLR/DLR.U, RY/RY.TO, or similar dual-listed pairs): effective FX cost ~0.05% + 2 commissions (~$10 round-trip at a $9.99 broker, $0 at a commission-free one).",
    howToMinimize:
      "(1) Open the USD side of your account (usually free) and keep USD dividends in USD. (2) Use Norbert's Gambit for conversions over ~$5,000 — saves $75–$100+ per $10,000. (3) If you don't want USD management, buy CAD-listed versions of US indices (VFV, XUU, VUN) — FX happens inside the fund at institutional rates. (4) Questrade and some brokers auto-apply journal transfers that reduce FX cost on dividends; ask support.",
    links: [
      { title: "Canadian Portfolio Manager — Norbert's Gambit", url: "https://www.canadianportfoliomanagerblog.com/category/norberts-gambit/" },
      { title: "Wealthsimple — FX explained", url: "https://www.wealthsimple.com/en-ca/learn/foreign-exchange" },
    ],
  },
  adminFees: {
    key: "adminFees",
    label: "Account administration fees",
    summary:
      "Annual or monthly charges just for having an account open — independent of trading activity. Most are waived above asset thresholds.",
    howItWorks:
      "Billed annually in fall/spring for registered plans (RRSP, TFSA, FHSA), usually deducted from the account's cash balance. Inactivity fees apply to non-registered accounts with no trades for 12+ months. Paper statement fees if you don't opt into electronic delivery.",
    typicalCost:
      "Big-bank brokers (TD Direct, RBC Direct, BMO InvestorLine, Scotia iTRADE): $100/yr RRSP admin fee waived above $25k, $25/qtr inactivity fee waived above $10k–$15k or with 1+ trade per quarter. Questrade: $0 admin; $24.95/qtr inactivity fee waived above $5k or with 1+ trade. Wealthsimple: $0 admin, $0 inactivity. National Bank Direct Brokerage, Desjardins Disnat: $0 admin. Paper statements: $2–$4/quarter.",
    howToMinimize:
      "(1) Opt into electronic statements (always). (2) Consolidate accounts at one institution to cross the asset threshold that waives admin fees. (3) For small balances (< $25k), use Questrade, Wealthsimple, National Bank Direct Brokerage, or Desjardins Disnat — all have $0 admin regardless of balance.",
    links: [
      { title: "FCAC — Account fees", url: "https://itools-ioutils.fcac-acfc.gc.ca/acsat-ostcs/asol-osao-eng.aspx" },
      { title: "MoneySense — Broker fee comparison", url: "https://www.moneysense.ca/save/investing/best-online-brokers-in-canada/" },
    ],
  },
  transferFees: {
    key: "transferFees",
    label: "Transfer-out & deregistration fees",
    summary:
      "One-time charges when moving an account to another institution, or when withdrawing from a registered plan outside its intended use.",
    howItWorks:
      "Transfer-out: charged per account by the sending institution when you move a TFSA/RRSP/FHSA/non-registered account to a competitor (in-kind, keeping the shelter). Partial transfer usually costs the same as full. Deregistration: charged when you collapse or take a cash withdrawal from a registered plan (not HBP/LLP). Losing institutions typically charge; receiving institutions often reimburse to win your business.",
    typicalCost:
      "Transfer-out (full or partial): $135–$150 + GST/HST per account at most brokers ($5 extra at some). RRSP/RRIF deregistration: $50–$100 per cash withdrawal on top of withholding tax. Transfer-IN reimbursement: up to $150 at Questrade, Wealthsimple, National Bank Direct Brokerage, TD Direct (promotions change — confirm before moving). Banks typically reimburse on a $25k+ transfer.",
    howToMinimize:
      "(1) Ask the receiving broker to reimburse the transfer-out fee — standard at multiple brokers (keep receipts). (2) Always transfer in-kind, never sell and re-buy — avoids triggering a taxable sale in non-registered accounts and preserves your adjusted cost base. (3) Minimize deregistration: borrow from your RRSP via HBP/LLP (no fee, no tax) rather than straight withdrawal.",
    links: [
      { title: "Questrade — Transfer promo", url: "https://www.questrade.com/account-transfer" },
      { title: "Canada.ca — HBP/LLP", url: "https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/rrsps-related-plans/what-home-buyers-plan.html" },
    ],
  },
  advisorFees: {
    key: "advisorFees",
    label: "Advisor & management fees",
    summary:
      "What you pay a human or robo-advisor to manage your money. Either embedded in fund MERs (commission-based), billed separately as a percentage of assets (fee-based), or charged as a flat fee.",
    howItWorks:
      "Fee-based advisor: quarterly bill = AUM × annual rate ÷ 4, tax-deductible in non-registered accounts (not in registered). Commission-based: advisor compensated through trailers inside the mutual fund MER — no separate bill, but fund MER is higher. Robo-advisor: flat AUM fee + the MERs of the underlying ETFs. Fee-only planner: pay for the plan once, you manage the money yourself.",
    typicalCost:
      "Full-service IIROC advisor (RBC DS, BMO NB, etc.): 1.00%–1.50% AUM, often with $500k minimum. Independent fee-based advisor: 0.75%–1.25%. Robo-advisors: Wealthsimple Invest 0.40%–0.50%, Questwealth 0.20%–0.25% + underlying ETF MER (~0.20%). Fee-only planner: $1,500–$5,000 flat for a plan, or $200–$400/hr. Commission-based: embedded ~1% trailer inside mutual fund MER.",
    howToMinimize:
      "For portfolios under ~$500k with straightforward needs, robo-advisors deliver similar diversification and rebalancing at roughly 70% less cost than full-service advisors. For complex needs (incorporation, estate, US-Canada cross-border), a fee-only planner paid once is cheaper over time than 1% AUM forever. Always ask: 'What is the all-in cost — your fee PLUS the fund MERs?'",
    links: [
      { title: "FP Canada — Find a planner", url: "https://www.fpcanada.ca/findaplanner" },
      { title: "MoneySense — Robo-advisor comparison", url: "https://www.moneysense.ca/save/investing/best-robo-advisors-canada/" },
    ],
  },
  bidAskSpread: {
    key: "bidAskSpread",
    label: "Bid-ask spread (implicit)",
    summary:
      "The gap between the best buy price (bid) and best sell price (ask) — you effectively pay half the spread every time you cross the market.",
    howItWorks:
      "Market orders to buy fill at the ask (the lowest seller), market orders to sell fill at the bid (the highest buyer). Spread = ask − bid. Widens during the first/last 15 min of the trading day, after news, and on low-volume securities. Does NOT apply to mutual funds (priced once at NAV). ETFs and stocks: always present.",
    typicalCost:
      "Large-cap Canadian stocks (RY, TD, ENB, SHOP): 1–2¢ on a $50 stock ≈ 0.02%–0.04%. Highly-liquid ETFs (VFV, XIC, VEQT, VBAL): 1–3¢ ≈ 0.02%–0.06%. Mid-cap TSX stocks: 5–10¢ ≈ 0.2%–0.5%. Small-cap TSX / TSX Venture: 10–50¢ ≈ 1%–5%. Illiquid sector ETFs: 0.2%–1%.",
    howToMinimize:
      "(1) Use limit orders (not market orders), especially on anything outside the top 100 TSX names. (2) Trade between 10am–3pm ET — avoid the open/close. (3) Prefer high-volume ETFs over low-volume equivalents with the same exposure. (4) For large orders in low-volume ETFs, split into pieces or call the broker to request a 'market-maker indication' via the fund sponsor.",
    links: [
      { title: "Investopedia — Bid-ask spread", url: "https://www.investopedia.com/terms/b/bid-askspread.asp" },
      { title: "CI Global — ETF trading tips", url: "https://www.ci.com/en/advisors/insights/etf-trading-tips" },
    ],
  },
  bondGicCosts: {
    key: "bondGicCosts",
    label: "Bond markups & GIC penalties",
    summary:
      "Individual bonds are sold 'net' — the dealer's profit is hidden in the price, not shown as a commission. GICs carry redemption penalties on cashable versions and are locked on non-redeemable.",
    howItWorks:
      "Bond prices quoted to retail buyers include a built-in markup; dealers buy wholesale in institutional lots and resell smaller lots at a higher price. No line item on the confirmation. GICs: cashable (or 'redeemable') ones let you break early at a reduced rate; non-redeemable are locked to maturity.",
    typicalCost:
      "Retail individual bonds: 0.50%–2.00% markup on small lots under $25k, shrinking toward 0.10% on $100k+ lots. Cashable GIC early redemption: keep interest only to the break date, usually at a specified reduced rate (often half the posted rate). Non-redeemable GIC: no sale possible. Bond ETFs: zero markup (priced live at institutional spreads inside the fund); the only cost is the ETF's MER and bid-ask.",
    howToMinimize:
      "Use bond ETFs (ZAG, VAB, XBB, ZDB for tax-efficient non-reg) instead of individual bonds — the portfolio manager gets institutional pricing you can't access. For GICs, only use cashable if you genuinely might need the money early; otherwise non-redeemable pays 20–50 bps more. Ladder non-redeemable GICs for predictable liquidity without the penalty.",
    links: [
      { title: "CSA — Bond market facts", url: "https://www.securities-administrators.ca/investor-tools/" },
      { title: "Ratehub — GIC comparison", url: "https://www.ratehub.ca/gics" },
    ],
  },
  hiddenCosts: {
    key: "hiddenCosts",
    label: "Hidden & indirect costs",
    summary:
      "Real money that leaks out of your returns without ever appearing on a statement: withholding tax, TER, cash drag, DRIP pricing, securities lending.",
    howItWorks:
      "US withholding tax: 15% deducted at source on US-stock/ETF dividends, unless held in an RRSP (treaty-exempt for direct US-listed holdings only). TER (Trading Expense Ratio): a fund's internal trading costs, published yearly but NOT included in MER. Cash drag: funds holding 1–3% cash that earns near nothing. DRIP pricing: some brokers apply a small premium on shares bought through dividend reinvestment. Securities lending: fund lends your shares to short-sellers and keeps some of the revenue.",
    typicalCost:
      "US withholding: 15% of US dividends in TFSA and non-reg (non-reg gets a foreign tax credit, TFSA does not). TER: 0.00%–0.25% extra on top of MER for actively-managed funds (see fund's annual report, not Fund Facts). Cash drag: invisible; estimated 0.05–0.20% annual performance drag on active funds. Securities lending revenue kept by manager: 5–30% depending on fund policy.",
    howToMinimize:
      "(1) Hold US-listed US stocks/ETFs in an RRSP to avoid the 15% withholding — but note that CAD-listed 'wrapped' US funds (VFV, XUU) still lose withholding inside the fund even in an RRSP. (2) Check fund's TER in addition to MER — total cost of some active funds is 1.8% MER + 0.4% TER = 2.2%. (3) For US dividend strategies, hold US-listed ETFs (VYM, SCHD) directly in RRSP, not CAD-hedged versions.",
    links: [
      { title: "Canadian Portfolio Manager — Foreign withholding tax guide", url: "https://www.canadianportfoliomanagerblog.com/foreign-withholding-taxes/" },
      { title: "PWL Capital — True cost of investing", url: "https://www.pwlcapital.com/" },
    ],
  },
};

const GUIDE_FR: Record<FeeTopicKey, FeeTopic> = {
  commissions: {
    key: "commissions",
    label: "Commissions de négociation (achat / vente)",
    summary:
      "Frais fixes prélevés chaque fois que vous achetez ou vendez une action, un FNB ou une option via un courtier. S'appliquent aux deux côtés d'un aller-retour.",
    howItWorks:
      "Facturés par transaction, peu importe le montant. Les ordres au marché et à cours limité coûtent le même prix. Certains courtiers canadiens facturent des frais ECN sur des ordres à cours limité. Les options ajoutent des frais par contrat en plus (ou à la place) d'un frais de base fixe. Les fonds communs sont sans commission chez la plupart des courtiers (la rémunération de suivi/RFG est intégrée à la place).",
    typicalCost:
      "Actions et FNB : 0 $ chez Wealthsimple, Questrade (achats de FNB gratuits), Courtage direct Banque Nationale, Desjardins Disnat (pour les membres), Pro-Investisseurs CIBC (18–24 ans). 4,95 $ à 9,99 $ chez les courtiers bancaires (Courtage direct TD, RBC Placements en direct, BMO Ligne d'action, Scotia iTRADE). Options : 0,75 $ à 1,25 $ par contrat + 0 à 9,99 $ de base. Fonds communs : généralement 0 $.",
    howToMinimize:
      "Utilisez un courtier sans commission pour les actions/FNB — plus de 5 courtiers canadiens offrent cela. Regroupez les achats : moins de transactions plus importantes battent plusieurs petites. Pour l'achat périodique, un achat de FNB à 0 $ permet d'investir chaque semaine sans traînée. Évitez les courtiers qui facturent des frais ECN aux ordres à cours limité des particuliers.",
    links: [
      { title: "Finder — Comparaison des courtiers canadiens", url: "https://www.finder.com/ca/trading-platforms" },
      { title: "MoneySense — Meilleurs courtiers en ligne", url: "https://www.moneysense.ca/save/investing/best-online-brokers-in-canada/" },
    ],
  },
  mer: {
    key: "mer",
    label: "RFG — Ratio des frais de gestion",
    summary:
      "Pourcentage annuel discrètement prélevé sur l'actif d'un fonds chaque jour. Vous ne voyez jamais de facture — il réduit simplement le rendement du fonds. Le plus grand coût unique dans la plupart des portefeuilles.",
    howItWorks:
      "Publié dans l'Aperçu du fonds et l'Aperçu du FNB. Comprend : frais de gestion (au gestionnaire) + frais d'exploitation (dépôt, audit, juridique, dépôts réglementaires) + commission de suivi (au courtier distributeur, le cas échéant) + TPS/TVH. Prélevé quotidiennement de la VL, donc le rendement affiché est toujours net du RFG. Distinct du ratio des frais de transaction (RFO) qui couvre les coûts de négociation internes.",
    typicalCost:
      "Fonds communs bancaires série A : 1,70 %–2,50 % par an. Série D (courtier à escompte) : 1,00 %–1,50 %. Série F (honoraires) : 0,60 %–1,00 %. FNB indiciels de marché large : 0,03 %–0,25 % (XIC 0,06 %, VFV 0,09 %, XUU 0,07 %). FNB à répartition d'actifs : 0,20 %–0,25 % (VEQT, VBAL, XEQT). FNB actifs : 0,25 %–0,85 %. FNB sectoriels/thématiques : 0,30 %–0,80 %.",
    howToMinimize:
      "Un écart de RFG de 1,5 % sur 30 ans se compose à environ 36 % de moins à la fin. Les FNB indiciels plutôt que les fonds communs actifs, c'est la plus grande économie unique. Si vous préférez les fonds communs, utilisez la série D (courtier à escompte) ou F (conseiller à honoraires) — même stratégie, RFG réduit de moitié par rapport à la série A.",
    links: [
      { title: "ACVM — Comprendre l'Aperçu du fonds", url: "https://www.securities-administrators.ca/investor-tools/understanding-disclosure/fund-facts/?lang=fr-ca" },
      { title: "Morningstar Canada — Recherche sur les frais", url: "https://www.morningstar.ca/ca/research" },
    ],
  },
  trailers: {
    key: "trailers",
    label: "Commissions de suivi et frais de vente",
    summary:
      "Versements continus d'un fonds commun au courtier ou conseiller, prélevés sur le RFG. Les frais de vente sont des commissions initiales ou différées qui s'ajoutent.",
    howItWorks:
      "Les fonds série A versent une commission de suivi annuelle de 0,50 %–1,00 % au courtier tant que vous détenez, intégrée au RFG. La série F n'a aucune commission de suivi — le conseiller vous facture directement. La série D a une commission de suivi réduite (0,15 %–0,25 %) pour la distribution en courtage à escompte. Les fonds à frais de vente reportés (FSR/DSC) sont interdits à l'achat au Canada depuis juin 2022 ; les détentions anciennes de FSR facturent encore une pénalité arrière dégressive en cas de vente hâtive. Des frais de négociation à court terme s'appliquent si vous rachetez dans les 30 à 90 jours.",
    typicalCost:
      "Commission de suivi : 0,50 % (fonds obligataires) à 1,00 % (fonds d'actions) par an de l'actif, indéfiniment. FSR historiques : 5,5 %–6 % la 1re année, dégressifs d'environ 1 %/an jusqu'à 0 après 6–7 ans. Frais de négociation à court terme : 1 %–2 % si rachat dans la fenêtre.",
    howToMinimize:
      "Évitez la série A à moins d'utiliser réellement les services du conseiller. Passez à la série F (et payez le conseiller directement) ou D (autonome chez un courtier à escompte) pour la même stratégie à environ la moitié du coût. Si vous détenez d'anciens FSR, vérifiez le barème avant de vendre — parfois attendre 1 à 2 ans pour que la pénalité atteigne zéro est le bon choix.",
    links: [
      { title: "CVMO — Commissions de suivi", url: "https://www.getsmarteraboutmoney.ca/invest/investment-products/mutual-funds-segregated-funds/understanding-mutual-fund-fees/" },
      { title: "ACVM — Interdiction des FSR", url: "https://www.securities-administrators.ca/news/canadian-securities-regulators-finalize-a-ban-on-deferred-sales-charges-and-prohibit-mutual-fund-trailing-commissions-for-discount-brokers/" },
    ],
  },
  fxConversion: {
    key: "fxConversion",
    label: "Frais de conversion de devises",
    summary:
      "Un écart (pas une commission) facturé chaque fois que le CAD est converti en USD ou vice versa — pour acheter des titres américains, recevoir des dividendes en USD ou rapatrier des liquidités.",
    howItWorks:
      "Le courtier utilise un taux interne au milieu du marché plus une marge de 1,5 à 2 %. Déclenché lors de : (a) l'achat d'un titre en USD depuis un compte en CAD ; (b) la réception de dividendes en USD dans un compte uniquement en CAD (converti automatiquement) ; (c) la vente d'un titre en USD en laissant les liquidités en CAD. Les courtiers offrant un côté USD (la plupart) permettent de détenir l'USD directement — aucune conversion déclenchée tant que vous ne déplacez pas d'argent entre les côtés.",
    typicalCost:
      "Courtiers à escompte : 1,50 %–2,00 % dans chaque sens (aller-retour ≈ 3–4 % sur un achat-puis-vente). Wealthsimple : environ 1,5 %. Succursales bancaires (particuliers) : 2,5 %–3,5 %. Tour de passe-passe de Norbert (DLR/DLR.U, RY/RY.TO ou autres paires cotées double) : coût de change effectif d'environ 0,05 % + 2 commissions (environ 10 $ aller-retour chez un courtier à 9,99 $, 0 $ chez un sans commission).",
    howToMinimize:
      "(1) Ouvrez le côté USD de votre compte (habituellement gratuit) et gardez les dividendes en USD en USD. (2) Utilisez le tour de passe-passe de Norbert pour des conversions de plus de 5 000 $ — économise 75 $ à 100 $ ou plus par 10 000 $. (3) Si vous ne voulez pas gérer d'USD, achetez les versions cotées en CAD des indices américains (VFV, XUU, VUN) — la conversion se fait à l'interne du fonds aux taux institutionnels. (4) Questrade et quelques courtiers appliquent automatiquement des transferts de journal qui réduisent le coût de change sur les dividendes ; demandez au soutien.",
    links: [
      { title: "Canadian Portfolio Manager — Tour de passe-passe de Norbert", url: "https://www.canadianportfoliomanagerblog.com/category/norberts-gambit/" },
      { title: "Wealthsimple — Change expliqué", url: "https://www.wealthsimple.com/fr-ca/learn/foreign-exchange" },
    ],
  },
  adminFees: {
    key: "adminFees",
    label: "Frais d'administration de compte",
    summary:
      "Frais annuels ou mensuels uniquement pour avoir un compte ouvert — indépendants de l'activité de négociation. La plupart sont dispensés au-dessus d'un seuil d'actifs.",
    howItWorks:
      "Facturés annuellement à l'automne/printemps pour les régimes enregistrés (REER, CELI, CELIAPP), habituellement prélevés sur le solde en espèces. Des frais d'inactivité s'appliquent aux comptes non enregistrés sans transaction pendant 12 mois ou plus. Frais de relevés papier si vous n'optez pas pour la livraison électronique.",
    typicalCost:
      "Courtiers bancaires (Courtage direct TD, RBC Placements en direct, BMO Ligne d'action, Scotia iTRADE) : 100 $/an de frais d'administration REER dispensés au-dessus de 25 000 $, 25 $/trimestre de frais d'inactivité dispensés au-dessus de 10 000 $–15 000 $ ou avec 1 transaction ou plus par trimestre. Questrade : 0 $ d'admin ; 24,95 $/trimestre de frais d'inactivité dispensés au-dessus de 5 000 $ ou avec 1 transaction ou plus. Wealthsimple : 0 $ d'admin, 0 $ d'inactivité. Courtage direct Banque Nationale, Desjardins Disnat : 0 $ d'admin. Relevés papier : 2 $–4 $/trimestre.",
    howToMinimize:
      "(1) Optez pour les relevés électroniques (toujours). (2) Regroupez les comptes dans une seule institution pour dépasser le seuil qui dispense les frais d'administration. (3) Pour les petits soldes (< 25 000 $), utilisez Questrade, Wealthsimple, Courtage direct Banque Nationale ou Desjardins Disnat — tous à 0 $ d'admin peu importe le solde.",
    links: [
      { title: "ACFC — Frais de compte", url: "https://itools-ioutils.fcac-acfc.gc.ca/acsat-ostcs/asol-osao-fra.aspx" },
      { title: "MoneySense — Comparaison des frais", url: "https://www.moneysense.ca/save/investing/best-online-brokers-in-canada/" },
    ],
  },
  transferFees: {
    key: "transferFees",
    label: "Frais de transfert et de désenregistrement",
    summary:
      "Frais uniques lors du déplacement d'un compte vers une autre institution, ou lors du retrait d'un régime enregistré en dehors de son usage prévu.",
    howItWorks:
      "Transfert sortant : facturé par compte par l'institution d'origine lorsque vous déplacez un CELI/REER/CELIAPP/compte non enregistré vers un concurrent (en nature, en conservant l'abri fiscal). Un transfert partiel coûte habituellement autant qu'un transfert complet. Désenregistrement : facturé lorsque vous effondrez ou effectuez un retrait en espèces d'un régime enregistré (autre que RAP/REEP). Les institutions qui perdent le compte facturent ; celles qui le reçoivent remboursent souvent pour gagner votre clientèle.",
    typicalCost:
      "Transfert sortant (complet ou partiel) : 135 $–150 $ + TPS/TVH par compte chez la plupart des courtiers (5 $ de plus chez certains). Désenregistrement REER/FERR : 50 $–100 $ par retrait en espèces en plus de la retenue d'impôt. Remboursement de transfert ENTRANT : jusqu'à 150 $ chez Questrade, Wealthsimple, Courtage direct Banque Nationale, Courtage direct TD (les promotions changent — confirmez avant le déplacement). Les banques remboursent généralement sur un transfert de 25 000 $ et plus.",
    howToMinimize:
      "(1) Demandez au courtier receveur de rembourser les frais de transfert sortant — pratique courante chez plusieurs courtiers (gardez les reçus). (2) Transférez toujours en nature, jamais en vendant puis en rachetant — évite de déclencher une vente imposable dans les comptes non enregistrés et préserve le prix de base rajusté. (3) Minimisez les désenregistrements : empruntez à votre REER via RAP/REEP (aucuns frais, aucun impôt) plutôt qu'un retrait direct.",
    links: [
      { title: "Questrade — Promo de transfert", url: "https://www.questrade.com/account-transfer" },
      { title: "Canada.ca — RAP / REEP", url: "https://www.canada.ca/fr/agence-revenu/services/impot/particuliers/sujets/reer-regimes-connexes/regime-accession-propriete-rap.html" },
    ],
  },
  advisorFees: {
    key: "advisorFees",
    label: "Frais de conseiller et de gestion",
    summary:
      "Ce que vous payez à un conseiller humain ou à un robot-conseiller pour gérer votre argent. Soit intégré au RFG des fonds (rémunération par commission), facturé séparément en pourcentage des actifs (à honoraires), soit facturé en frais fixes.",
    howItWorks:
      "Conseiller à honoraires : facture trimestrielle = actif × taux annuel ÷ 4, déductible d'impôt dans un compte non enregistré (pas dans un compte enregistré). À commission : conseiller rémunéré via la commission de suivi à l'intérieur du RFG du fonds commun — pas de facture séparée, mais le RFG du fonds est plus élevé. Robot-conseiller : frais fixes sur l'actif + le RFG des FNB sous-jacents. Planificateur à honoraires forfaitaires : payez une fois pour le plan, vous gérez ensuite l'argent vous-même.",
    typicalCost:
      "Conseiller OCRCVM plein exercice (RBC DVM, BMO NB, etc.) : 1,00 %–1,50 % de l'actif, souvent avec un minimum de 500 000 $. Conseiller indépendant à honoraires : 0,75 %–1,25 %. Robots-conseillers : Wealthsimple Invest 0,40 %–0,50 %, Questwealth 0,20 %–0,25 % + RFG des FNB sous-jacents (environ 0,20 %). Planificateur forfaitaire : 1 500 $–5 000 $ pour un plan, ou 200 $–400 $/h. À commission : commission de suivi d'environ 1 % intégrée au RFG du fonds commun.",
    howToMinimize:
      "Pour les portefeuilles de moins de 500 000 $ environ avec des besoins simples, les robots-conseillers offrent une diversification et un rééquilibrage similaires à environ 70 % de moins que les conseillers plein exercice. Pour les besoins complexes (incorporation, succession, transfrontalier É.-U.–Canada), un planificateur à honoraires forfaitaires payé une fois coûte moins cher à terme qu'un conseiller à 1 % de l'actif pour toujours. Demandez toujours : « Quel est le coût tout compris — vos frais PLUS les RFG des fonds ? »",
    links: [
      { title: "FP Canada — Trouvez un planificateur", url: "https://www.fpcanada.ca/findaplanner" },
      { title: "MoneySense — Comparaison des robots-conseillers", url: "https://www.moneysense.ca/save/investing/best-robo-advisors-canada/" },
    ],
  },
  bidAskSpread: {
    key: "bidAskSpread",
    label: "Écart acheteur-vendeur (implicite)",
    summary:
      "L'écart entre le meilleur prix d'achat (cours acheteur) et le meilleur prix de vente (cours vendeur) — vous payez effectivement la moitié de l'écart chaque fois que vous traversez le marché.",
    howItWorks:
      "Les ordres au marché pour acheter sont exécutés au cours vendeur (le vendeur le moins cher), les ordres au marché pour vendre sont exécutés au cours acheteur (l'acheteur le plus élevé). Écart = vendeur − acheteur. S'élargit pendant les 15 premières et dernières minutes de la journée, après des nouvelles, et sur les titres à faible volume. NE s'applique PAS aux fonds communs (évalués une fois à la VL). FNB et actions : toujours présent.",
    typicalCost:
      "Actions canadiennes à grande capitalisation (RY, TD, ENB, SHOP) : 1–2 ¢ sur une action de 50 $ ≈ 0,02 %–0,04 %. FNB très liquides (VFV, XIC, VEQT, VBAL) : 1–3 ¢ ≈ 0,02 %–0,06 %. Actions TSX à moyenne capitalisation : 5–10 ¢ ≈ 0,2 %–0,5 %. Petite capitalisation TSX / TSX Croissance : 10–50 ¢ ≈ 1 %–5 %. FNB sectoriels illiquides : 0,2 %–1 %.",
    howToMinimize:
      "(1) Utilisez des ordres à cours limité (pas au marché), surtout sur tout ce qui est en dehors des 100 plus grands titres du TSX. (2) Négociez entre 10 h et 15 h HE — évitez l'ouverture et la fermeture. (3) Privilégiez les FNB à volume élevé plutôt que leurs équivalents à faible volume avec la même exposition. (4) Pour les gros ordres dans des FNB à faible volume, fractionnez en morceaux ou appelez le courtier pour demander une « indication du teneur de marché » via le promoteur du fonds.",
    links: [
      { title: "Investopedia — Écart acheteur-vendeur", url: "https://www.investopedia.com/terms/b/bid-askspread.asp" },
      { title: "CI Global — Conseils de négociation des FNB", url: "https://www.ci.com/en/advisors/insights/etf-trading-tips" },
    ],
  },
  bondGicCosts: {
    key: "bondGicCosts",
    label: "Majorations obligataires et pénalités de CPG",
    summary:
      "Les obligations individuelles sont vendues « net » — le profit du courtier est caché dans le prix, pas affiché comme commission. Les CPG comportent des pénalités de rachat sur les versions encaissables et sont bloqués sur les non rachetables.",
    howItWorks:
      "Les prix des obligations cotés aux particuliers incluent une majoration intégrée ; les courtiers achètent en gros par lots institutionnels et revendent les plus petits lots à un prix plus élevé. Aucune ligne distincte sur la confirmation. CPG : les CPG encaissables (ou « rachetables ») permettent une sortie anticipée à un taux réduit ; les non rachetables sont bloqués jusqu'à l'échéance.",
    typicalCost:
      "Obligations individuelles au détail : majoration de 0,50 %–2,00 % sur les petits lots de moins de 25 000 $, se réduisant vers 0,10 % sur les lots de 100 000 $ et plus. Rachat anticipé d'un CPG encaissable : ne conserve que les intérêts jusqu'à la date de rachat, habituellement à un taux réduit spécifié (souvent la moitié du taux affiché). CPG non rachetable : aucune vente possible. FNB obligataires : aucune majoration (cotés en direct aux écarts institutionnels à l'interne du fonds) ; le seul coût est le RFG et l'écart acheteur-vendeur du FNB.",
    howToMinimize:
      "Utilisez des FNB obligataires (ZAG, VAB, XBB, ZDB pour l'efficience fiscale en non enregistré) plutôt que des obligations individuelles — le gestionnaire de portefeuille obtient des prix institutionnels inaccessibles autrement. Pour les CPG, n'utilisez d'encaissables que si vous pourriez vraiment avoir besoin de l'argent ; sinon, les non rachetables paient 20–50 pb de plus. Échelonnez les CPG non rachetables pour une liquidité prévisible sans pénalité.",
    links: [
      { title: "ACVM — Faits sur le marché obligataire", url: "https://www.securities-administrators.ca/investor-tools/" },
      { title: "Ratehub — Comparateur de CPG", url: "https://www.ratehub.ca/fr/cpg" },
    ],
  },
  hiddenCosts: {
    key: "hiddenCosts",
    label: "Coûts cachés et indirects",
    summary:
      "De l'argent réel qui s'échappe de vos rendements sans jamais apparaître sur un relevé : retenue d'impôt, RFO, traînée de liquidités, prix du PRD, prêt de titres.",
    howItWorks:
      "Retenue d'impôt américaine : 15 % prélevés à la source sur les dividendes d'actions/FNB américains, sauf si détenus dans un REER (exempté par traité pour les détentions cotées en USD directement seulement). RFO (ratio des frais de transaction) : les coûts de négociation internes d'un fonds, publiés annuellement mais PAS inclus dans le RFG. Traînée de liquidités : les fonds détiennent 1–3 % de liquidités qui ne rapportent presque rien. Prix du PRD : certains courtiers appliquent une légère prime sur les actions achetées par réinvestissement des dividendes. Prêt de titres : le fonds prête vos actions aux vendeurs à découvert et en garde une partie du revenu.",
    typicalCost:
      "Retenue américaine : 15 % des dividendes américains dans un CELI et un compte non enregistré (le non enregistré obtient un crédit pour impôt étranger, pas le CELI). RFO : 0,00 %–0,25 % additionnels au-dessus du RFG pour les fonds gérés activement (voir le rapport annuel du fonds, pas l'Aperçu du fonds). Traînée de liquidités : invisible ; estimée à 0,05–0,20 % de traînée annuelle de performance sur les fonds actifs. Revenu de prêt de titres conservé par le gestionnaire : 5–30 % selon la politique du fonds.",
    howToMinimize:
      "(1) Détenez les actions/FNB américains cotés en USD dans un REER pour éviter la retenue de 15 % — notez toutefois que les fonds américains « emballés » cotés en CAD (VFV, XUU) perdent encore la retenue à l'interne du fonds, même en REER. (2) Vérifiez le RFO d'un fonds en plus du RFG — le coût total de certains fonds actifs est de 1,8 % RFG + 0,4 % RFO = 2,2 %. (3) Pour les stratégies de dividendes américains, détenez directement les FNB cotés en USD (VYM, SCHD) dans un REER, pas les versions couvertes en CAD.",
    links: [
      { title: "Canadian Portfolio Manager — Guide de la retenue étrangère", url: "https://www.canadianportfoliomanagerblog.com/foreign-withholding-taxes/" },
      { title: "PWL Capital — Vrai coût d'investir", url: "https://www.pwlcapital.com/" },
    ],
  },
};

export const FEES_GUIDE: Record<Lang, Record<FeeTopicKey, FeeTopic>> = {
  en: GUIDE_EN,
  fr: GUIDE_FR,
};
