// Seed universe for NXT Terminal. Prices are starting points; the market-data
// engine evolves them live. Fundamentals power the security-overview (DES) screen.
//
// type:  equity | etf | index | fx | crypto | future | rate
// fields: symbol, name, type, sector, exchange, currency, price, prevClose,
//         mktCap, pe, eps, divYield, beta, high52, low52, desc

const E = (symbol, name, sector, price, prevClose, mktCap, pe, eps, divYield, beta, high52, low52, desc) =>
  ({ symbol, name, type: 'equity', sector, exchange: 'NASDAQ/NYSE', currency: 'USD',
     price, prevClose, mktCap, pe, eps, divYield, beta, high52, low52, desc })

export const UNIVERSE = [
  // ---- Mega-cap technology / communication ----
  E('AAPL','Apple Inc.','Technology', 251.40, 249.18, 3_780e9, 33.1, 7.59, 0.42, 1.18, 268.10, 196.20,
    'Designs and sells smartphones, personal computers, tablets, wearables and accessories, and a fast-growing services franchise spanning the App Store, iCloud, advertising and payments.'),
  E('MSFT','Microsoft Corp.','Technology', 478.55, 475.10, 3_560e9, 36.4, 13.15, 0.68, 0.92, 498.00, 388.00,
    'Develops software, cloud (Azure), productivity (Microsoft 365), gaming (Xbox) and is a leading platform provider for enterprise AI.'),
  E('NVDA','NVIDIA Corp.','Technology', 174.20, 170.85, 4_250e9, 51.8, 3.36, 0.02, 1.74, 195.00, 86.60,
    'Designs accelerated-computing GPUs and networking that power AI training and inference, gaming, data centers and autonomous systems.'),
  E('GOOGL','Alphabet Inc. Class A','Communication', 196.80, 195.02, 2_390e9, 25.9, 7.60, 0.45, 1.04, 208.70, 147.00,
    'Parent of Google Search, YouTube, Android, Google Cloud and the DeepMind/Gemini AI effort; revenue is led by advertising.'),
  E('AMZN','Amazon.com Inc.','Consumer Disc.', 224.30, 221.95, 2_360e9, 38.7, 5.80, 0.00, 1.15, 242.50, 161.40,
    'Global e-commerce marketplace and logistics network, plus AWS cloud computing, advertising, devices and streaming media.'),
  E('META','Meta Platforms Inc.','Communication', 712.40, 705.10, 1_800e9, 27.2, 26.19, 0.34, 1.21, 755.00, 442.00,
    'Operates Facebook, Instagram, WhatsApp and Messenger, monetized through advertising, while investing in AI and the metaverse (Reality Labs).'),
  E('TSLA','Tesla Inc.','Consumer Disc.', 342.10, 349.80, 1_095e9, 88.6, 3.86, 0.00, 2.07, 415.00, 178.00,
    'Designs and manufactures electric vehicles, battery energy storage, solar, and is developing autonomy and humanoid robotics.'),
  E('AVGO','Broadcom Inc.','Technology', 232.70, 229.40, 1_090e9, 41.2, 5.65, 0.98, 1.12, 251.00, 138.00,
    'Designs semiconductors and infrastructure software, a key supplier of custom AI accelerators and networking silicon.'),
  E('ORCL','Oracle Corp.','Technology', 184.90, 182.30, 515e9, 39.0, 4.74, 0.92, 1.01, 198.30, 112.10,
    'Enterprise database, applications and a rapidly scaling Oracle Cloud Infrastructure business serving AI workloads.'),
  E('CRM','Salesforce Inc.','Technology', 271.50, 269.10, 260e9, 41.8, 6.49, 0.58, 1.28, 369.00, 230.00,
    'Leading customer-relationship-management cloud platform spanning sales, service, marketing and the Agentforce AI suite.'),
  E('AMD','Advanced Micro Devices','Technology', 142.80, 140.20, 231e9, 95.0, 1.50, 0.00, 1.69, 187.00, 76.50,
    'Designs CPUs, GPUs and adaptive computing for data centers, PCs, gaming and embedded markets.'),
  E('ADBE','Adobe Inc.','Technology', 384.20, 381.40, 165e9, 28.4, 13.53, 0.00, 1.30, 587.00, 332.00,
    'Creative, document and digital-experience software, increasingly powered by generative-AI features (Firefly).'),
  E('NFLX','Netflix Inc.','Communication', 1024.50, 1010.20, 438e9, 44.0, 23.28, 0.00, 1.30, 1100.00, 588.00,
    'Subscription streaming entertainment service with a growing ad-supported tier and games initiative.'),
  E('INTC','Intel Corp.','Technology', 23.40, 23.85, 101e9, null, -0.40, 0.00, 1.05, 37.20, 18.50,
    'Designs and manufactures microprocessors and is building a foundry business to make chips for external customers.'),
  E('CSCO','Cisco Systems Inc.','Technology', 64.10, 63.55, 256e9, 24.8, 2.58, 2.55, 0.86, 66.50, 44.50,
    'Networking hardware, security and collaboration software for enterprise and service-provider infrastructure.'),

  // ---- Financials ----
  E('JPM','JPMorgan Chase & Co.','Financials', 268.40, 266.10, 745e9, 13.2, 20.33, 2.05, 1.10, 280.00, 190.00,
    'Largest U.S. bank by assets, spanning consumer & community banking, investment banking, markets and asset management.'),
  E('V','Visa Inc.','Financials', 352.10, 349.80, 690e9, 31.0, 11.36, 0.74, 0.95, 366.00, 252.00,
    'Operates the worlds largest electronic payments network connecting consumers, merchants and financial institutions.'),
  E('MA','Mastercard Inc.','Financials', 558.20, 553.60, 510e9, 35.6, 15.68, 0.55, 1.06, 590.00, 428.00,
    'Global payments-technology company providing transaction processing and value-added services.'),
  E('BAC','Bank of America Corp.','Financials', 47.80, 47.35, 360e9, 13.6, 3.51, 2.30, 1.30, 50.10, 33.10,
    'Diversified financial institution serving consumers, businesses and institutional clients across banking and markets.'),
  E('GS','Goldman Sachs Group','Financials', 612.40, 606.80, 190e9, 14.5, 42.23, 2.10, 1.34, 660.00, 405.00,
    'Leading global investment bank in advisory, markets, asset & wealth management.'),
  E('BRK.B','Berkshire Hathaway B','Financials', 478.90, 476.20, 1_030e9, 22.0, 21.77, 0.00, 0.85, 491.00, 395.00,
    'Diversified holding company with insurance, railroad (BNSF), energy, manufacturing and a large equity portfolio.'),

  // ---- Healthcare ----
  E('LLY','Eli Lilly and Co.','Healthcare', 824.60, 818.20, 740e9, 62.0, 13.30, 0.62, 0.42, 972.00, 678.00,
    'Pharmaceutical leader in diabetes and obesity (incretin therapies), oncology, immunology and neuroscience.'),
  E('UNH','UnitedHealth Group','Healthcare', 528.40, 532.10, 485e9, 19.8, 26.69, 1.55, 0.55, 615.00, 436.00,
    'Health-benefits (UnitedHealthcare) and health-services (Optum) businesses spanning care delivery, pharmacy and data.'),
  E('JNJ','Johnson & Johnson','Healthcare', 162.30, 161.40, 390e9, 22.0, 7.38, 3.05, 0.52, 169.00, 140.00,
    'Diversified healthcare company across innovative pharmaceuticals and medical technology.'),
  E('PFE','Pfizer Inc.','Healthcare', 26.10, 25.95, 148e9, 9.5, 2.75, 6.60, 0.62, 31.50, 23.80,
    'Research-based biopharmaceutical company developing vaccines, oncology and specialty medicines.'),

  // ---- Consumer ----
  E('WMT','Walmart Inc.','Consumer Staples', 98.40, 97.85, 790e9, 38.0, 2.59, 0.95, 0.55, 105.00, 66.00,
    'Worlds largest retailer operating supercenters, warehouse clubs (Sam s Club) and a fast-growing e-commerce and ads business.'),
  E('COST','Costco Wholesale','Consumer Staples', 1012.30, 1006.40, 449e9, 54.0, 18.75, 0.50, 0.78, 1078.00, 840.00,
    'Membership-warehouse retailer known for high renewal rates and a growing e-commerce footprint.'),
  E('PG','Procter & Gamble','Consumer Staples', 168.20, 167.40, 396e9, 26.5, 6.35, 2.40, 0.40, 180.00, 155.00,
    'Consumer-packaged-goods leader across fabric & home care, beauty, grooming, health and baby care.'),
  E('KO','Coca-Cola Co.','Consumer Staples', 71.40, 71.05, 308e9, 27.0, 2.64, 2.85, 0.58, 74.00, 60.50,
    'Global non-alcoholic beverage company with a portfolio of sparkling, water, juice and coffee brands.'),
  E('HD','Home Depot Inc.','Consumer Disc.', 412.60, 409.30, 410e9, 26.0, 15.87, 2.35, 1.02, 440.00, 323.00,
    'Largest home-improvement retailer serving DIY consumers and professional contractors.'),
  E('MCD','McDonald s Corp.','Consumer Disc.', 312.80, 311.20, 224e9, 26.5, 11.80, 2.25, 0.62, 327.00, 270.00,
    'Worlds largest restaurant chain by revenue, operating a heavily franchised quick-service model.'),
  E('NKE','Nike Inc.','Consumer Disc.', 78.40, 79.10, 116e9, 28.0, 2.80, 2.05, 1.05, 98.00, 68.00,
    'Global designer and marketer of athletic footwear, apparel and equipment.'),
  E('DIS','Walt Disney Co.','Communication', 114.30, 113.20, 207e9, 21.0, 5.44, 0.85, 1.38, 124.00, 83.00,
    'Media and entertainment conglomerate spanning streaming (Disney+), studios, parks, experiences and sports (ESPN).'),

  // ---- Energy / Industrials / Materials ----
  E('XOM','Exxon Mobil Corp.','Energy', 116.80, 115.90, 510e9, 14.0, 8.34, 3.30, 0.85, 126.00, 99.00,
    'Integrated oil & gas major across upstream, downstream and chemicals, with low-carbon investments.'),
  E('CVX','Chevron Corp.','Energy', 158.40, 157.10, 285e9, 15.5, 10.22, 4.05, 0.92, 168.00, 132.00,
    'Integrated energy company in exploration, production, refining and renewable fuels.'),
  E('CAT','Caterpillar Inc.','Industrials', 398.20, 394.60, 188e9, 18.0, 22.12, 1.45, 1.05, 418.00, 290.00,
    'Worlds leading maker of construction and mining equipment, engines and industrial power systems.'),
  E('BA','Boeing Co.','Industrials', 212.40, 210.10, 158e9, null, -2.10, 0.00, 1.50, 228.00, 137.00,
    'Aerospace manufacturer of commercial jetliners, defense systems and space and security products.'),
  E('GE','GE Aerospace','Industrials', 248.60, 246.30, 264e9, 38.0, 6.54, 0.55, 1.18, 262.00, 158.00,
    'Designs and services jet engines and aerospace propulsion systems for commercial and military fleets.'),
  E('LIN','Linde plc','Materials', 468.10, 465.40, 222e9, 30.0, 15.60, 1.25, 0.78, 487.00, 408.00,
    'Worlds largest industrial-gases company supplying oxygen, nitrogen, hydrogen and engineering.'),

  // ---- ETFs ----
  { symbol:'SPY', name:'SPDR S&P 500 ETF Trust', type:'etf', sector:'Index ETF', exchange:'ARCA', currency:'USD',
    price: 612.30, prevClose: 609.80, mktCap: 640e9, pe:null, eps:null, divYield:1.25, beta:1.00, high52:625, low52:498,
    desc:'Tracks the S&P 500 index of large-cap U.S. equities; the most heavily traded ETF in the world.' },
  { symbol:'QQQ', name:'Invesco QQQ Trust', type:'etf', sector:'Index ETF', exchange:'NASDAQ', currency:'USD',
    price: 545.70, prevClose: 542.10, mktCap: 320e9, pe:null, eps:null, divYield:0.55, beta:1.12, high52:560, low52:402,
    desc:'Tracks the Nasdaq-100 index, heavily weighted to mega-cap technology and growth.' },
  { symbol:'IWM', name:'iShares Russell 2000 ETF', type:'etf', sector:'Index ETF', exchange:'ARCA', currency:'USD',
    price: 232.40, prevClose: 230.60, mktCap: 68e9, pe:null, eps:null, divYield:1.30, beta:1.18, high52:244, low52:188,
    desc:'Tracks the Russell 2000 index of U.S. small-cap equities.' },
  { symbol:'GLD', name:'SPDR Gold Shares', type:'etf', sector:'Commodity ETF', exchange:'ARCA', currency:'USD',
    price: 308.20, prevClose: 306.10, mktCap: 95e9, pe:null, eps:null, divYield:0.00, beta:0.12, high52:315, low52:218,
    desc:'Each share represents fractional ownership of physical gold bullion held in trust.' },
  { symbol:'TLT', name:'iShares 20+ Yr Treasury', type:'etf', sector:'Bond ETF', exchange:'NASDAQ', currency:'USD',
    price: 88.40, prevClose: 88.90, mktCap: 52e9, pe:null, eps:null, divYield:4.25, beta:-0.30, high52:101, low52:84,
    desc:'Tracks long-dated U.S. Treasury bonds; a common duration / rates expression.' },

  // ---- Indices ----
  { symbol:'SPX', name:'S&P 500 Index', type:'index', sector:'US Index', exchange:'CBOE', currency:'USD',
    price: 6124.50, prevClose: 6099.20, high52:6250, low52:4980 },
  { symbol:'NDX', name:'Nasdaq 100 Index', type:'index', sector:'US Index', exchange:'NASDAQ', currency:'USD',
    price: 22240.10, prevClose: 22090.40, high52:22800, low52:16400 },
  { symbol:'DJI', name:'Dow Jones Industrial Avg', type:'index', sector:'US Index', exchange:'DJ', currency:'USD',
    price: 43820.30, prevClose: 43710.10, high52:45100, low52:37200 },
  { symbol:'RUT', name:'Russell 2000 Index', type:'index', sector:'US Index', exchange:'RUS', currency:'USD',
    price: 2318.40, prevClose: 2301.10, high52:2440, low52:1860 },
  { symbol:'VIX', name:'CBOE Volatility Index', type:'index', sector:'Volatility', exchange:'CBOE', currency:'USD',
    price: 14.80, prevClose: 15.40, high52:65, low52:11.8, volMul: 4.5 },
  { symbol:'DAX', name:'DAX 40 Index', type:'index', sector:'EU Index', exchange:'XETRA', currency:'EUR',
    price: 23410.20, prevClose: 23330.10, high52:24100, low52:17800 },
  { symbol:'N225', name:'Nikkei 225 Index', type:'index', sector:'Asia Index', exchange:'TSE', currency:'JPY',
    price: 39820.40, prevClose: 39610.20, high52:42400, low52:31000 },

  // ---- FX ----
  { symbol:'EURUSD', name:'Euro / US Dollar', type:'fx', sector:'Major FX', exchange:'FX', currency:'USD',
    price: 1.0842, prevClose: 1.0831, high52:1.12, low52:1.018, volMul:0.35 },
  { symbol:'GBPUSD', name:'British Pound / US Dollar', type:'fx', sector:'Major FX', exchange:'FX', currency:'USD',
    price: 1.2710, prevClose: 1.2698, high52:1.34, low52:1.21, volMul:0.4 },
  { symbol:'USDJPY', name:'US Dollar / Japanese Yen', type:'fx', sector:'Major FX', exchange:'FX', currency:'JPY',
    price: 156.20, prevClose: 156.55, high52:162, low52:139, volMul:0.4 },
  { symbol:'USDCAD', name:'US Dollar / Canadian Dollar', type:'fx', sector:'Major FX', exchange:'FX', currency:'CAD',
    price: 1.3640, prevClose: 1.3655, high52:1.39, low52:1.33, volMul:0.3 },
  { symbol:'AUDUSD', name:'Australian Dollar / US Dollar', type:'fx', sector:'Major FX', exchange:'FX', currency:'USD',
    price: 0.6612, prevClose: 0.6601, high52:0.69, low52:0.61, volMul:0.4 },
  { symbol:'DXY', name:'US Dollar Index', type:'fx', sector:'FX Index', exchange:'ICE', currency:'USD',
    price: 104.80, prevClose: 104.95, high52:110, low52:100, volMul:0.3 },

  // ---- Crypto ----
  { symbol:'BTC', name:'Bitcoin / USD', type:'crypto', sector:'Crypto', exchange:'CRYPTO', currency:'USD',
    price: 104820, prevClose: 102640, high52:112000, low52:53000, volMul:2.4 },
  { symbol:'ETH', name:'Ethereum / USD', type:'crypto', sector:'Crypto', exchange:'CRYPTO', currency:'USD',
    price: 3842.50, prevClose: 3760.20, high52:4900, low52:2100, volMul:2.8 },
  { symbol:'SOL', name:'Solana / USD', type:'crypto', sector:'Crypto', exchange:'CRYPTO', currency:'USD',
    price: 214.30, prevClose: 206.80, high52:295, low52:98, volMul:3.4 },
  { symbol:'XRP', name:'XRP / USD', type:'crypto', sector:'Crypto', exchange:'CRYPTO', currency:'USD',
    price: 2.31, prevClose: 2.24, high52:3.40, low52:0.48, volMul:3.6 },
  { symbol:'DOGE', name:'Dogecoin / USD', type:'crypto', sector:'Crypto', exchange:'CRYPTO', currency:'USD',
    price: 0.3820, prevClose: 0.3710, high52:0.48, low52:0.10, volMul:4.0 },

  // ---- Futures / commodities ----
  { symbol:'CL', name:'Crude Oil WTI Front Month', type:'future', sector:'Energy', exchange:'NYMEX', currency:'USD',
    price: 71.40, prevClose: 70.85, high52:88, low52:63, volMul:1.6 },
  { symbol:'GC', name:'Gold Front Month', type:'future', sector:'Metals', exchange:'COMEX', currency:'USD',
    price: 3318.40, prevClose: 3296.10, high52:3400, low52:2350, volMul:1.0 },
  { symbol:'SI', name:'Silver Front Month', type:'future', sector:'Metals', exchange:'COMEX', currency:'USD',
    price: 38.20, prevClose: 37.65, high52:42, low52:26, volMul:1.8 },
  { symbol:'NG', name:'Natural Gas Front Month', type:'future', sector:'Energy', exchange:'NYMEX', currency:'USD',
    price: 3.42, prevClose: 3.51, high52:4.9, low52:1.8, volMul:3.2 },
  { symbol:'HG', name:'Copper Front Month', type:'future', sector:'Metals', exchange:'COMEX', currency:'USD',
    price: 4.82, prevClose: 4.78, high52:5.2, low52:3.9, volMul:1.6 },
  { symbol:'ES', name:'E-mini S&P 500 Future', type:'future', sector:'Equity Index', exchange:'CME', currency:'USD',
    price: 6128.50, prevClose: 6103.00, high52:6260, low52:4990, volMul:1.0 },

  // ---- Rates ----
  { symbol:'US10Y', name:'US 10-Year Treasury Yield', type:'rate', sector:'Rates', exchange:'GOVT', currency:'%',
    price: 4.282, prevClose: 4.305, high52:4.9, low52:3.6, volMul:0.8 },
  { symbol:'US02Y', name:'US 2-Year Treasury Yield', type:'rate', sector:'Rates', exchange:'GOVT', currency:'%',
    price: 3.910, prevClose: 3.935, high52:4.6, low52:3.5, volMul:0.7 },
  { symbol:'US30Y', name:'US 30-Year Treasury Yield', type:'rate', sector:'Rates', exchange:'GOVT', currency:'%',
    price: 4.612, prevClose: 4.628, high52:5.1, low52:3.9, volMul:0.8 },
]

export const BY_SYMBOL = Object.fromEntries(UNIVERSE.map((s) => [s.symbol, s]))

export const SYMBOLS = UNIVERSE.map((s) => s.symbol)

// Curated default watchlists shipped with the terminal.
export const DEFAULT_WATCHLISTS = {
  'My List': ['AAPL', 'MSFT', 'NVDA', 'AMZN', 'GOOGL', 'META', 'TSLA', 'AMD'],
  'Mega Cap': ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'META', 'AVGO', 'LLY', 'BRK.B', 'JPM'],
  'Indices': ['SPX', 'NDX', 'DJI', 'RUT', 'VIX', 'DAX', 'N225'],
  'FX & Rates': ['EURUSD', 'GBPUSD', 'USDJPY', 'DXY', 'US10Y', 'US02Y', 'US30Y'],
  'Crypto': ['BTC', 'ETH', 'SOL', 'XRP', 'DOGE'],
  'Commodities': ['CL', 'GC', 'SI', 'NG', 'HG', 'GLD'],
}

// Index membership used for movers / heatmap (equities only).
export const EQUITY_SYMBOLS = UNIVERSE.filter((s) => s.type === 'equity').map((s) => s.symbol)

export const SECTORS = [...new Set(UNIVERSE.filter((s) => s.type === 'equity').map((s) => s.sector))]
