-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvestorProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "experienceLevel" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "goalDescription" TEXT,
    "targetDate" TIMESTAMP(3),
    "timeHorizon" TEXT NOT NULL,
    "capitalUSD" DECIMAL(18,2) NOT NULL,
    "riskScore" INTEGER NOT NULL,
    "riskProfile" TEXT NOT NULL,
    "profileOverride" BOOLEAN NOT NULL DEFAULT false,
    "esgOnly" BOOLEAN NOT NULL DEFAULT false,
    "excludedSectors" TEXT[],
    "excludedAssets" TEXT[],
    "rebalanceThreshold" DECIMAL(5,4) NOT NULL DEFAULT 0.05,
    "currencyPreference" TEXT NOT NULL DEFAULT 'USD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvestorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Portfolio" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "virtualCash" DECIMAL(18,2) NOT NULL,
    "totalValue" DECIMAL(18,2) NOT NULL,
    "initialCapital" DECIMAL(18,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Portfolio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortfolioHolding" (
    "id" TEXT NOT NULL,
    "portfolioId" TEXT NOT NULL,
    "etfTicker" TEXT NOT NULL,
    "targetWeight" DECIMAL(8,6) NOT NULL,
    "currentWeight" DECIMAL(8,6) NOT NULL,
    "units" DECIMAL(18,6) NOT NULL,
    "averagePurchasePrice" DECIMAL(18,4) NOT NULL,
    "currentPrice" DECIMAL(18,4) NOT NULL,
    "currentValue" DECIMAL(18,2) NOT NULL,
    "gainLoss" DECIMAL(18,2) NOT NULL,
    "returnPct" DECIMAL(8,6) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PortfolioHolding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ETF" (
    "ticker" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "assetClass" TEXT NOT NULL,
    "subCategory" TEXT NOT NULL,
    "historicalAnnualReturn" DECIMAL(8,6) NOT NULL,
    "historicalVolatility" DECIMAL(8,6) NOT NULL,
    "expenseRatio" DECIMAL(8,6) NOT NULL,
    "esgEligible" BOOLEAN NOT NULL,
    "minimumInvestment" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "ETF_pkey" PRIMARY KEY ("ticker")
);

-- CreateTable
CREATE TABLE "ETFCorrelation" (
    "etfTickerA" TEXT NOT NULL,
    "etfTickerB" TEXT NOT NULL,
    "correlation" DECIMAL(6,4) NOT NULL,

    CONSTRAINT "ETFCorrelation_pkey" PRIMARY KEY ("etfTickerA","etfTickerB")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "portfolioId" TEXT NOT NULL,
    "etfTicker" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "units" DECIMAL(18,6) NOT NULL,
    "price" DECIMAL(18,4) NOT NULL,
    "totalValue" DECIMAL(18,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RebalancingLog" (
    "id" TEXT NOT NULL,
    "portfolioId" TEXT NOT NULL,
    "triggeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trades" JSONB NOT NULL,
    "approvedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL,

    CONSTRAINT "RebalancingLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceSnapshot" (
    "id" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "price" DECIMAL(18,4) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "takenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PriceSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CurrencySnapshot" (
    "id" TEXT NOT NULL,
    "fromCcy" TEXT NOT NULL,
    "toCcy" TEXT NOT NULL,
    "rate" DECIMAL(12,6) NOT NULL,
    "takenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CurrencySnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "InvestorProfile_userId_key" ON "InvestorProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Portfolio_userId_key" ON "Portfolio"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PortfolioHolding_portfolioId_etfTicker_key" ON "PortfolioHolding"("portfolioId", "etfTicker");

-- CreateIndex
CREATE INDEX "PriceSnapshot_ticker_takenAt_idx" ON "PriceSnapshot"("ticker", "takenAt");

-- CreateIndex
CREATE INDEX "CurrencySnapshot_fromCcy_toCcy_takenAt_idx" ON "CurrencySnapshot"("fromCcy", "toCcy", "takenAt");

-- AddForeignKey
ALTER TABLE "InvestorProfile" ADD CONSTRAINT "InvestorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Portfolio" ADD CONSTRAINT "Portfolio_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortfolioHolding" ADD CONSTRAINT "PortfolioHolding_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortfolioHolding" ADD CONSTRAINT "PortfolioHolding_etfTicker_fkey" FOREIGN KEY ("etfTicker") REFERENCES "ETF"("ticker") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ETFCorrelation" ADD CONSTRAINT "ETFCorrelation_etfTickerA_fkey" FOREIGN KEY ("etfTickerA") REFERENCES "ETF"("ticker") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ETFCorrelation" ADD CONSTRAINT "ETFCorrelation_etfTickerB_fkey" FOREIGN KEY ("etfTickerB") REFERENCES "ETF"("ticker") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_etfTicker_fkey" FOREIGN KEY ("etfTicker") REFERENCES "ETF"("ticker") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RebalancingLog" ADD CONSTRAINT "RebalancingLog_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceSnapshot" ADD CONSTRAINT "PriceSnapshot_ticker_fkey" FOREIGN KEY ("ticker") REFERENCES "ETF"("ticker") ON DELETE RESTRICT ON UPDATE CASCADE;
