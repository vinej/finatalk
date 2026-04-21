export type CryptoCategory = "majors" | "largeCap" | "layer1" | "defi" | "stablecoins" | "memes";

export type CryptoDef = {
  symbol: string;
  nameKey: string;
  category: CryptoCategory;
};

export const CRYPTOS: CryptoDef[] = [
  { symbol: "BTC-USD", nameKey: "crypto.name.btc", category: "majors" },
  { symbol: "ETH-USD", nameKey: "crypto.name.eth", category: "majors" },

  { symbol: "SOL-USD", nameKey: "crypto.name.sol", category: "layer1" },
  { symbol: "ADA-USD", nameKey: "crypto.name.ada", category: "layer1" },
  { symbol: "AVAX-USD", nameKey: "crypto.name.avax", category: "layer1" },
  { symbol: "DOT-USD", nameKey: "crypto.name.dot", category: "layer1" },
  { symbol: "NEAR-USD", nameKey: "crypto.name.near", category: "layer1" },
  { symbol: "ATOM-USD", nameKey: "crypto.name.atom", category: "layer1" },
  { symbol: "APT-USD", nameKey: "crypto.name.apt", category: "layer1" },
  { symbol: "SUI-USD", nameKey: "crypto.name.sui", category: "layer1" },

  { symbol: "BNB-USD", nameKey: "crypto.name.bnb", category: "largeCap" },
  { symbol: "XRP-USD", nameKey: "crypto.name.xrp", category: "largeCap" },
  { symbol: "DOGE-USD", nameKey: "crypto.name.doge", category: "largeCap" },
  { symbol: "TRX-USD", nameKey: "crypto.name.trx", category: "largeCap" },
  { symbol: "LTC-USD", nameKey: "crypto.name.ltc", category: "largeCap" },
  { symbol: "BCH-USD", nameKey: "crypto.name.bch", category: "largeCap" },
  { symbol: "LINK-USD", nameKey: "crypto.name.link", category: "largeCap" },
  { symbol: "XLM-USD", nameKey: "crypto.name.xlm", category: "largeCap" },

  { symbol: "UNI-USD", nameKey: "crypto.name.uni", category: "defi" },
  { symbol: "AAVE-USD", nameKey: "crypto.name.aave", category: "defi" },
  { symbol: "MKR-USD", nameKey: "crypto.name.mkr", category: "defi" },
  { symbol: "CRV-USD", nameKey: "crypto.name.crv", category: "defi" },
  { symbol: "LDO-USD", nameKey: "crypto.name.ldo", category: "defi" },

  { symbol: "USDT-USD", nameKey: "crypto.name.usdt", category: "stablecoins" },
  { symbol: "USDC-USD", nameKey: "crypto.name.usdc", category: "stablecoins" },
  { symbol: "DAI-USD", nameKey: "crypto.name.dai", category: "stablecoins" },

  { symbol: "SHIB-USD", nameKey: "crypto.name.shib", category: "memes" },
  { symbol: "PEPE-USD", nameKey: "crypto.name.pepe", category: "memes" },
  { symbol: "WIF-USD", nameKey: "crypto.name.wif", category: "memes" },
  { symbol: "BONK-USD", nameKey: "crypto.name.bonk", category: "memes" },
];

export const CRYPTO_CATEGORY_ORDER: CryptoCategory[] = [
  "majors",
  "largeCap",
  "layer1",
  "defi",
  "stablecoins",
  "memes",
];

export const CRYPTO_SYMBOLS = new Set(CRYPTOS.map((c) => c.symbol));
