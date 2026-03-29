import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const etfs = [
  {
    ticker: "SPY",
    name: "SPDR S&P 500 ETF",
    assetClass: "Equities",
    subCategory: "US Large Cap",
    historicalAnnualReturn: 0.1042,
    historicalVolatility: 0.1512,
    expenseRatio: 0.0009,
    esgEligible: false,
    minimumInvestment: 1.0,
  },
  {
    ticker: "QQQ",
    name: "Invesco Nasdaq 100 ETF",
    assetClass: "Equities",
    subCategory: "US Tech",
    historicalAnnualReturn: 0.1402,
    historicalVolatility: 0.2001,
    expenseRatio: 0.002,
    esgEligible: false,
    minimumInvestment: 1.0,
  },
  {
    ticker: "VTI",
    name: "Vanguard Total Stock Market",
    assetClass: "Equities",
    subCategory: "US Total Market",
    historicalAnnualReturn: 0.1031,
    historicalVolatility: 0.1489,
    expenseRatio: 0.0003,
    esgEligible: false,
    minimumInvestment: 1.0,
  },
  {
    ticker: "VEA",
    name: "Vanguard Developed Markets",
    assetClass: "Equities",
    subCategory: "International Developed",
    historicalAnnualReturn: 0.0601,
    historicalVolatility: 0.1621,
    expenseRatio: 0.0005,
    esgEligible: false,
    minimumInvestment: 1.0,
  },
  {
    ticker: "VWO",
    name: "Vanguard Emerging Markets",
    assetClass: "Equities",
    subCategory: "Emerging Markets",
    historicalAnnualReturn: 0.0421,
    historicalVolatility: 0.1923,
    expenseRatio: 0.0008,
    esgEligible: false,
    minimumInvestment: 1.0,
  },
  {
    ticker: "ESGU",
    name: "iShares MSCI USA ESG ETF",
    assetClass: "Equities",
    subCategory: "US ESG",
    historicalAnnualReturn: 0.1022,
    historicalVolatility: 0.1499,
    expenseRatio: 0.0015,
    esgEligible: true,
    minimumInvestment: 1.0,
  },
  {
    ticker: "BND",
    name: "Vanguard Total Bond Market",
    assetClass: "Bonds",
    subCategory: "US Total Bond",
    historicalAnnualReturn: 0.0301,
    historicalVolatility: 0.0521,
    expenseRatio: 0.0003,
    esgEligible: false,
    minimumInvestment: 1.0,
  },
  {
    ticker: "AGG",
    name: "iShares US Aggregate Bond",
    assetClass: "Bonds",
    subCategory: "US Aggregate",
    historicalAnnualReturn: 0.0289,
    historicalVolatility: 0.0512,
    expenseRatio: 0.0003,
    esgEligible: false,
    minimumInvestment: 1.0,
  },
  {
    ticker: "BNDX",
    name: "Vanguard International Bond",
    assetClass: "Bonds",
    subCategory: "International Bond",
    historicalAnnualReturn: 0.0198,
    historicalVolatility: 0.0612,
    expenseRatio: 0.0007,
    esgEligible: false,
    minimumInvestment: 1.0,
  },
  {
    ticker: "TIP",
    name: "iShares TIPS Bond ETF",
    assetClass: "Bonds",
    subCategory: "Inflation Protected",
    historicalAnnualReturn: 0.0341,
    historicalVolatility: 0.0701,
    expenseRatio: 0.0019,
    esgEligible: false,
    minimumInvestment: 1.0,
  },
  {
    ticker: "VNQ",
    name: "Vanguard Real Estate ETF",
    assetClass: "Real Estate",
    subCategory: "US REITs",
    historicalAnnualReturn: 0.0821,
    historicalVolatility: 0.1812,
    expenseRatio: 0.0012,
    esgEligible: false,
    minimumInvestment: 1.0,
  },
  {
    ticker: "GLD",
    name: "SPDR Gold Shares",
    assetClass: "Commodities",
    subCategory: "Gold",
    historicalAnnualReturn: 0.0712,
    historicalVolatility: 0.1421,
    expenseRatio: 0.004,
    esgEligible: false,
    minimumInvestment: 1.0,
  },
  {
    ticker: "IAU",
    name: "iShares Gold Trust",
    assetClass: "Commodities",
    subCategory: "Gold",
    historicalAnnualReturn: 0.0701,
    historicalVolatility: 0.1418,
    expenseRatio: 0.0025,
    esgEligible: false,
    minimumInvestment: 1.0,
  },
  {
    ticker: "DJP",
    name: "iPath Bloomberg Commodity",
    assetClass: "Commodities",
    subCategory: "Broad Commodities",
    historicalAnnualReturn: 0.0312,
    historicalVolatility: 0.1621,
    expenseRatio: 0.0075,
    esgEligible: false,
    minimumInvestment: 1.0,
  },
  {
    ticker: "SHV",
    name: "iShares Short Treasury",
    assetClass: "Cash",
    subCategory: "Short-Term Treasury",
    historicalAnnualReturn: 0.0421,
    historicalVolatility: 0.0051,
    expenseRatio: 0.0015,
    esgEligible: false,
    minimumInvestment: 1.0,
  },
];

// Correlation matrix — well-known pairs specified, others default to 0.30
// Format: [tickerA, tickerB, correlation]
const knownCorrelations: [string, string, number][] = [
  // Equity-Equity
  ["SPY", "QQQ", 0.87],
  ["SPY", "VTI", 0.99],
  ["SPY", "VEA", 0.82],
  ["SPY", "VWO", 0.74],
  ["SPY", "ESGU", 0.97],
  ["QQQ", "VTI", 0.88],
  ["QQQ", "VEA", 0.73],
  ["QQQ", "VWO", 0.65],
  ["QQQ", "ESGU", 0.88],
  ["VTI", "VEA", 0.83],
  ["VTI", "VWO", 0.75],
  ["VTI", "ESGU", 0.98],
  ["VEA", "VWO", 0.83],
  ["VEA", "ESGU", 0.82],
  ["VWO", "ESGU", 0.74],
  // Bond-Bond
  ["BND", "AGG", 0.99],
  ["BND", "BNDX", 0.68],
  ["BND", "TIP", 0.72],
  ["AGG", "BNDX", 0.67],
  ["AGG", "TIP", 0.71],
  ["BNDX", "TIP", 0.53],
  // Equity-Bond (typically negative/low)
  ["SPY", "BND", -0.12],
  ["SPY", "AGG", -0.11],
  ["SPY", "TIP", 0.02],
  ["QQQ", "BND", -0.08],
  ["VTI", "BND", -0.10],
  ["ESGU", "BND", -0.11],
  // Gold
  ["GLD", "IAU", 0.99],
  ["GLD", "DJP", 0.62],
  ["IAU", "DJP", 0.61],
  ["GLD", "SPY", 0.04],
  ["GLD", "BND", 0.18],
  ["IAU", "SPY", 0.04],
  // Real Estate
  ["VNQ", "SPY", 0.71],
  ["VNQ", "BND", 0.01],
  ["VNQ", "GLD", 0.09],
  // Cash
  ["SHV", "BND", 0.21],
  ["SHV", "SPY", -0.05],
];

function buildCorrelationPairs(): {
  etfTickerA: string;
  etfTickerB: string;
  correlation: number;
}[] {
  const tickers = etfs.map((e) => e.ticker);
  const known = new Map<string, number>();

  for (const [a, b, c] of knownCorrelations) {
    known.set(`${a}|${b}`, c);
    known.set(`${b}|${a}`, c);
  }

  const pairs: { etfTickerA: string; etfTickerB: string; correlation: number }[] = [];

  for (let i = 0; i < tickers.length; i++) {
    for (let j = i + 1; j < tickers.length; j++) {
      const a = tickers[i];
      const b = tickers[j];
      const key = `${a}|${b}`;
      const correlation = known.get(key) ?? 0.3;
      pairs.push({ etfTickerA: a, etfTickerB: b, correlation });
    }
  }

  return pairs;
}

async function main() {
  console.log("🌱 Seeding Kuberaa database...");

  // Upsert ETFs
  for (const etf of etfs) {
    await prisma.eTF.upsert({
      where: { ticker: etf.ticker },
      update: etf,
      create: etf,
    });
  }
  console.log(`✅ ${etfs.length} ETFs seeded`);

  // Seed correlations
  const pairs = buildCorrelationPairs();
  for (const pair of pairs) {
    await prisma.eTFCorrelation.upsert({
      where: {
        etfTickerA_etfTickerB: {
          etfTickerA: pair.etfTickerA,
          etfTickerB: pair.etfTickerB,
        },
      },
      update: { correlation: pair.correlation },
      create: pair,
    });
  }
  console.log(`✅ ${pairs.length} ETF correlation pairs seeded`);

  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
