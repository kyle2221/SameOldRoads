// Seed portfolio used by the PORT screen. Quantities and average cost are fixed;
// market value and P&L are computed live from the quote engine.
export const ACCOUNT = {
  id: 'NXT-0001',
  name: 'Model Portfolio',
  cash: 184_320.55,
  currency: 'USD',
}

export const POSITIONS = [
  { symbol: 'AAPL',  qty: 600,  avgCost: 182.40 },
  { symbol: 'MSFT',  qty: 280,  avgCost: 405.10 },
  { symbol: 'NVDA',  qty: 1500, avgCost: 92.30 },
  { symbol: 'AMZN',  qty: 420,  avgCost: 168.75 },
  { symbol: 'GOOGL', qty: 500,  avgCost: 158.20 },
  { symbol: 'META',  qty: 180,  avgCost: 498.60 },
  { symbol: 'AVGO',  qty: 350,  avgCost: 165.40 },
  { symbol: 'LLY',   qty: 90,   avgCost: 712.10 },
  { symbol: 'JPM',   qty: 320,  avgCost: 214.50 },
  { symbol: 'COST',  qty: 60,   avgCost: 842.30 },
  { symbol: 'XOM',   qty: 700,  avgCost: 108.20 },
  { symbol: 'SPY',   qty: 250,  avgCost: 548.90 },
  { symbol: 'BTC',   qty: 2.5,  avgCost: 71_200 },
  { symbol: 'GLD',   qty: 300,  avgCost: 244.10 },
]
