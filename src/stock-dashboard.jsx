import { useState, useEffect, useCallback } from "react";
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis,
  Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";

const STOCKS = [
  { symbol: "NVDA", name: "NVIDIA Corp",    price: 874.15, change:  3.42, pct:  0.39, vol: "42.1M", mkt: "2.15T", sector: "Tech" },
  { symbol: "AAPL", name: "Apple Inc",      price: 189.30, change: -1.22, pct: -0.64, vol: "61.4M", mkt: "2.93T", sector: "Tech" },
  { symbol: "MSFT", name: "Microsoft",      price: 415.20, change:  2.87, pct:  0.70, vol: "21.9M", mkt: "3.09T", sector: "Tech" },
  { symbol: "TSLA", name: "Tesla Inc",      price: 168.42, change: -5.63, pct: -3.24, vol: "98.3M", mkt: "537B",  sector: "Auto" },
  { symbol: "AMZN", name: "Amazon.com",     price: 185.07, change:  1.14, pct:  0.62, vol: "33.7M", mkt: "1.93T", sector: "Retail" },
  { symbol: "META", name: "Meta Platforms", price: 512.60, change:  8.33, pct:  1.65, vol: "18.2M", mkt: "1.30T", sector: "Tech" },
  { symbol: "GOOGL", name: "Alphabet Inc",  price: 165.84, change: -0.44, pct: -0.26, vol: "25.6M", mkt: "2.04T", sector: "Tech" },
  { symbol: "JPM",  name: "JPMorgan Chase", price: 198.77, change:  0.93, pct:  0.47, vol: "9.8M",  mkt: "574B",  sector: "Finance" },
];

const INDICES = [
  { name: "S&P 500",   value: "5,204.34",  change: "+0.51%", up: true  },
  { name: "NASDAQ",    value: "16,248.52", change: "+0.83%", up: true  },
  { name: "DOW",       value: "38,904.04", change: "+0.23%", up: true  },
  { name: "VIX",       value: "14.82",     change: "-2.11%", up: false },
  { name: "10Y YIELD", value: "4.312%",    change: "+0.04",  up: true  },
  { name: "DXY",       value: "104.23",    change: "-0.18%", up: false },
];

const NEWS = [
  { tag: "MACRO", headline: "Fed holds rates steady, signals two cuts in 2025 amid cooling inflation data", time: "9:42 AM" },
  { tag: "NVDA",  headline: "NVIDIA surpasses $2T market cap milestone, Blackwell chip demand exceeds supply", time: "9:38 AM" },
  { tag: "TSLA",  headline: "Tesla Q1 deliveries miss estimates by 8.5%, shares slide pre-market", time: "9:15 AM" },
  { tag: "META",  headline: "Meta AI assistant reaches 1 billion users, ad revenue outlook raised", time: "8:57 AM" },
  { tag: "MACRO", headline: "March jobs report: 272K added vs 215K estimate, unemployment holds at 3.8%", time: "8:30 AM" },
  { tag: "AAPL",  headline: "Apple Vision Pro 2 launch confirmed for Q3; spatial computing revenue projected at $4B", time: "8:14 AM" },
];

const HEATMAP = [
  { symbol: "NVDA",  pct:  3.42, size: 3   },
  { symbol: "META",  pct:  1.65, size: 2.5 },
  { symbol: "MSFT",  pct:  0.70, size: 3.5 },
  { symbol: "AMZN",  pct:  0.62, size: 3   },
  { symbol: "GOOGL", pct: -0.26, size: 2.8 },
  { symbol: "AAPL",  pct: -0.64, size: 3.5 },
  { symbol: "JPM",   pct:  0.47, size: 2   },
  { symbol: "TSLA",  pct: -3.24, size: 2.5 },
  { symbol: "AMD",   pct:  2.11, size: 2   },
  { symbol: "NFLX",  pct: -1.07, size: 1.8 },
  { symbol: "DIS",   pct:  0.34, size: 1.8 },
  { symbol: "BAC",   pct: -0.82, size: 1.8 },
];

const KINGS = [
  { symbol: "KO",   name: "Coca-Cola" },
  { symbol: "PG",   name: "Procter & Gamble" },
  { symbol: "JNJ",  name: "Johnson & Johnson" },
  { symbol: "MMM",  name: "3M Company" },
  { symbol: "CL",   name: "Colgate-Palmolive" },
  { symbol: "EMR",  name: "Emerson Electric" },
  { symbol: "GPC",  name: "Genuine Parts" },
  { symbol: "LOW",  name: "Lowe's" },
  { symbol: "ITW",  name: "Illinois Tool Works" },
  { symbol: "SWK",  name: "Stanley Black & Decker" },
  { symbol: "PH",   name: "Parker-Hannifin" },
  { symbol: "GWW",  name: "W.W. Grainger" },
  { symbol: "BDX",  name: "Becton Dickinson" },
  { symbol: "ADP",  name: "ADP" },
  { symbol: "MKC",  name: "McCormick" },
  { symbol: "ABT",  name: "Abbott Labs" },
  { symbol: "SYY",  name: "Sysco" },
  { symbol: "CINF", name: "Cincinnati Financial" },
  { symbol: "DOV",  name: "Dover Corp" },
  { symbol: "NDSN", name: "Nordson" },
  { symbol: "ABBV", name: "AbbVie" },
  { symbol: "WMT",  name: "Walmart" },
  { symbol: "SPGI", name: "S&P Global" },
  { symbol: "NUE",  name: "Nucor" },
  { symbol: "ADM",  name: "Archer-Daniels-Midland" },
];
const KING_SET = new Set(KINGS.map(k => k.symbol));

function generateChart(base, len = 60, vol = 1) {
  const pts = []; let v = base;
  for (let i = 0; i < len; i++) {
    v += (Math.random() - 0.5) * vol * (base / 100);
    pts.push({ t: i, v: parseFloat(v.toFixed(2)) });
  }
  return pts;
}

const sparkData = {};
STOCKS.forEach(s => { sparkData[s.symbol] = generateChart(s.price, 40, 0.8); });

function heatColor(pct) {
  if (pct > 2) return "#00e676";
  if (pct > 0.5) return "#69f0ae";
  if (pct > 0) return "#2e7d5e";
  if (pct > -0.5) return "#7b3030";
  if (pct > -2) return "#ef5350";
  return "#b71c1c";
}

function daysUntil(s) {
  const t = new Date(); t.setHours(0,0,0,0);
  const d = new Date(s); d.setHours(0,0,0,0);
  return Math.round((d - t) / 86400000);
}

function divBadge(days) {
  if (days < 0)   return { bg: "#21262d", col: "#8b949e", txt: "Passed" };
  if (days <= 2)  return { bg: "#3d1111", col: "#ff6b6b", txt: `Buy TODAY — ${days}d left` };
  if (days <= 7)  return { bg: "#3d1111", col: "#ff6b6b", txt: `${days}d to ex-date` };
  if (days <= 14) return { bg: "#2d2200", col: "#f0b429", txt: `${days}d to ex-date` };
  return               { bg: "#0d2818", col: "#69f0ae", txt: `${days}d to ex-date` };
}

function fmtDate(d) { return d.toISOString().split("T")[0]; }

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0d1117", border: "1px solid #30363d", padding: "6px 10px", fontSize: 11, color: "#e6edf3", fontFamily: "monospace" }}>
      <div style={{ color: "#f0b429" }}>{payload[0]?.value?.toFixed(2)}</div>
    </div>
  );
};

function DividendKingsPanel() {
  const [workerUrl, setWorkerUrl] = useState("https://fmp-proxy.caddyshackkidd.workers.dev");
  const [polyKey,   setPolyKey]   = useState("");
  const [winDays,   setWinDays]   = useState(60);
  const [status,    setStatus]    = useState("idle");
  const [msg,       setMsg]       = useState("");
  const [rows,      setRows]      = useState([]);

  const stats = {
    total:    rows.length,
    urgent:   rows.filter(r => { const d = daysUntil(r.exDate); return d >= 0 && d <= 7; }).length,
    soon:     rows.filter(r => { const d = daysUntil(r.exDate); return d > 7 && d <= 14; }).length,
    upcoming: rows.filter(r => daysUntil(r.exDate) > 14).length,
  };

  const fetchAll = useCallback(async () => {
    const base = workerUrl.trim().replace(/\/$/, "");
    const key  = polyKey.trim();
    if (!base || !key) { setMsg("Enter your Worker URL and Polygon key first."); return; }

    const today = new Date();
    const future = new Date(); future.setDate(future.getDate() + winDays);
    setStatus("loading"); setRows([]);
    setMsg("Step 1/2 — fetching dividend calendar...");

    try {
      const divUrl = `${base}/v3/reference/dividends?ex_dividend_date.gte=${fmtDate(today)}&ex_dividend_date.lte=${fmtDate(future)}&dividend_type=CD&order=asc&sort=ex_dividend_date&limit=1000&apiKey=${key}`;
      const r1 = await fetch(divUrl);
      if (!r1.ok) throw new Error(`Calendar fetch failed — HTTP ${r1.status}`);
      const d1 = await r1.json();
      if (d1.status === "NOT_AUTHORIZED" || d1.status === "ERROR") throw new Error(d1.message || "Polygon API error — check your key.");

      const hits = (d1.results || []).filter(d => KING_SET.has(d.ticker));
      if (!hits.length) {
        setMsg(`No Dividend Kings have ex-dates in the next ${winDays} days. Try a wider window.`);
        setStatus("done"); return;
      }

      const uniq = [...new Set(hits.map(d => d.ticker))];
      setMsg(`Step 2/2 — fetching prices for ${uniq.length} stocks...`);

      const priceMap = {};
      try {
        const r2 = await fetch(`${base}/v2/snapshot/locale/us/markets/stocks/tickers?tickers=${uniq.join(",")}&apiKey=${key}`);
        if (r2.ok) {
          const d2 = await r2.json();
          (d2.tickers || []).forEach(t => {
            const p = (t.day && t.day.c) || (t.prevDay && t.prevDay.c) || null;
            if (p) priceMap[t.ticker] = p;
          });
        }
      } catch (_) {}

      const result = hits.map(d => ({
        symbol:    d.ticker,
        dividend:  d.cash_amount,
        frequency: d.frequency || 4,
        exDate:    d.ex_dividend_date,
        payDate:   d.pay_date || null,
        price:     priceMap[d.ticker] || null,
      }));

      setRows(result);
      setMsg(`Found ${result.length} Dividend Kings with upcoming ex-dates. Prices loaded for ${Object.keys(priceMap).length} symbols.`);
      setStatus("done");
    } catch (e) {
      setMsg(`Error: ${e.message}`);
      setStatus("error");
    }
  }, [workerUrl, polyKey, winDays]);

  const sorted = rows.slice().sort((a, b) => new Date(a.exDate) - new Date(b.exDate));

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
      <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 8, padding: "14px 16px", marginBottom: 16 }}>
        <div style={{ fontSize: 9, color: "#8b949e", letterSpacing: "0.12em", marginBottom: 10 }}>POLYGON.IO VIA CLOUDFLARE WORKER</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
          <input value={workerUrl} onChange={e => setWorkerUrl(e.target.value)} placeholder="https://your-worker.workers.dev"
            style={{ flex: 2, minWidth: 200, height: 32, padding: "0 10px", fontSize: 11, fontFamily: "monospace", background: "#0d1117", border: "1px solid #30363d", borderRadius: 6, color: "#e6edf3" }} />
          <input value={polyKey} onChange={e => setPolyKey(e.target.value)} placeholder="Polygon API key..." type="password"
            style={{ flex: 1, minWidth: 150, height: 32, padding: "0 10px", fontSize: 11, fontFamily: "monospace", background: "#0d1117", border: "1px solid #30363d", borderRadius: 6, color: "#e6edf3" }} />
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select value={winDays} onChange={e => setWinDays(Number(e.target.value))}
            style={{ height: 32, padding: "0 10px", fontSize: 11, background: "#0d1117", border: "1px solid #30363d", borderRadius: 6, color: "#e6edf3" }}>
            <option value={30}>Next 30 days</option>
            <option value={60}>Next 60 days</option>
            <option value={90}>Next 90 days</option>
          </select>
          <button onClick={fetchAll} disabled={status === "loading"}
            style={{ height: 32, padding: "0 16px", fontSize: 11, fontWeight: 600, background: status === "loading" ? "#21262d" : "#f0b429", color: "#0d1117", border: "none", borderRadius: 6, cursor: status === "loading" ? "default" : "pointer", letterSpacing: "0.06em" }}>
            {status === "loading" ? "FETCHING..." : "FETCH LIVE"}
          </button>
        </div>
        {msg && <div style={{ fontSize: 10, color: status === "error" ? "#ef5350" : "#8b949e", marginTop: 8 }}>{msg}</div>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 16 }}>
        {[
          { label: "TRACKED",  val: stats.total,    col: "#e6edf3", bg: "#161b22" },
          { label: "BUY NOW",  val: stats.urgent,   col: "#ff6b6b", bg: "#3d1111" },
          { label: "ACT SOON", val: stats.soon,     col: "#f0b429", bg: "#2d2200" },
          { label: "ON RADAR", val: stats.upcoming, col: "#69f0ae", bg: "#0d2818" },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 6, padding: "10px 12px" }}>
            <div style={{ fontSize: 9, color: s.col, opacity: 0.7, letterSpacing: "0.1em", marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.col }}>{s.val || "—"}</div>
          </div>
        ))}
      </div>

      {sorted.length === 0 ? (
        <div style={{ textAlign: "center", color: "#8b949e", fontSize: 12, padding: "40px 0" }}>
          {status === "idle" ? "Enter your Worker URL and Polygon key above, then click Fetch Live." : status === "loading" ? "Loading..." : "No results — try a wider window."}
        </div>
      ) : (
        <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 8, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "58px 1fr 68px 68px 66px 70px 88px 1fr", gap: 8, padding: "7px 14px", background: "#0d1117", fontSize: 9, color: "#8b949e", letterSpacing: "0.1em" }}>
            <span>TICKER</span><span>COMPANY</span>
            <span style={{ textAlign: "right" }}>PRICE</span>
            <span style={{ textAlign: "right" }}>DIV/SH</span>
            <span style={{ textAlign: "right" }}>ANNUAL</span>
            <span style={{ textAlign: "right" }}>YIELD</span>
            <span style={{ textAlign: "right" }}>EX-DATE</span>
            <span style={{ textAlign: "center" }}>STATUS</span>
          </div>
          {sorted.map((r, i) => {
            const days     = daysUntil(r.exDate);
            const b        = divBadge(days);
            const king     = KINGS.find(k => k.symbol === r.symbol);
            const annual   = r.dividend * (r.frequency || 4);
            const yieldPct = r.price ? (annual / r.price * 100) : null;
            const yieldCol = yieldPct ? (yieldPct >= 4 ? "#69f0ae" : yieldPct >= 2.5 ? "#e6edf3" : "#8b949e") : "#8b949e";
            return (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "58px 1fr 68px 68px 66px 70px 88px 1fr", gap: 8, padding: "9px 14px", borderTop: "1px solid #21262d", fontSize: 12, alignItems: "center" }}>
                <span style={{ fontWeight: 700, color: "#f0b429" }}>{r.symbol}</span>
                <span style={{ fontSize: 11, color: "#8b949e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{king?.name || r.symbol}</span>
                <span style={{ textAlign: "right", color: "#8b949e", fontSize: 11 }}>{r.price ? `$${r.price.toFixed(2)}` : "—"}</span>
                <span style={{ textAlign: "right", fontWeight: 600 }}>${r.dividend.toFixed(4)}</span>
                <span style={{ textAlign: "right", color: "#8b949e", fontSize: 11 }}>${annual.toFixed(2)}</span>
                <span style={{ textAlign: "right", fontWeight: 600, color: yieldCol }}>{yieldPct ? `${yieldPct.toFixed(2)}%` : "—"}</span>
                <span style={{ textAlign: "right", fontSize: 11, color: "#8b949e" }}>{r.exDate}</span>
                <span style={{ textAlign: "center" }}>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 4, background: b.bg, color: b.col, whiteSpace: "nowrap" }}>{b.txt}</span>
                </span>
              </div>
            );
          })}
        </div>
      )}
      <div style={{ fontSize: 10, color: "#8b949e", marginTop: 10, textAlign: "center" }}>
        Annual = div/sh × frequency. Own shares before market close the day BEFORE ex-date (T+1 settlement).
      </div>
    </div>
  );
}

export default function StockDashboard() {
  const [selected, setSelected] = useState(STOCKS[0]);
  const [ticker,   setTicker]   = useState(0);
  const [prices,   setPrices]   = useState(() => Object.fromEntries(STOCKS.map(s => [s.symbol, s.price])));
  const [tab,      setTab]      = useState("chart");
  const [time,     setTime]     = useState("");

  useEffect(() => {
    const id = setInterval(() => setTicker(t => t + 1), 300);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setPrices(prev => {
        const next = { ...prev };
        STOCKS.forEach(s => { next[s.symbol] = parseFloat((prev[s.symbol] + (Math.random() - 0.5) * 0.08).toFixed(2)); });
        return next;
      });
    }, 5000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString("en-US", { hour12: false }));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const tickerItems = [...STOCKS, ...STOCKS];
  const offset      = (ticker * 0.02) % (tickerItems.length / 2 * 160);
  const selChart    = generateChart(selected.price, 80, 1.2);
  const selUp       = selected.change >= 0;

  return (
    <div style={{ background: "#0d1117", minHeight: "100vh", fontFamily: "'IBM Plex Mono','Courier New',monospace", color: "#e6edf3", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=Space+Grotesk:wght@400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0d1117; }
        ::-webkit-scrollbar-thumb { background: #30363d; border-radius: 2px; }
        .row-hover:hover { background: rgba(240,180,41,0.06) !important; cursor: pointer; }
        .tab-btn { background: none; border: none; cursor: pointer; font-family: inherit; font-size: 11px; letter-spacing: 0.08em; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
        .live-dot { animation: blink 1.4s ease infinite; }
        .news-item { animation: fadeIn 0.4s ease both; }
        input::placeholder { color: #484f58; }
        input:focus, select:focus { outline: 1px solid #f0b429; }
      `}</style>

      <div style={{ borderBottom: "1px solid #21262d", padding: "0 20px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", background: "#010409" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, background: "#f0b429", clipPath: "polygon(50% 0%,100% 38%,82% 100%,18% 100%,0% 38%)" }} />
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 15, letterSpacing: "0.03em", color: "#f0b429" }}>APEX<span style={{ color: "#e6edf3" }}>MARKETS</span></span>
          </div>
          <div style={{ width: 1, height: 20, background: "#21262d" }} />
          <span style={{ fontSize: 10, color: "#8b949e", letterSpacing: "0.12em" }}>TERMINAL v4.2</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div className="live-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "#00e676" }} />
            <span style={{ fontSize: 10, color: "#00e676", letterSpacing: "0.1em" }}>MARKETS OPEN</span>
          </div>
          <span style={{ fontSize: 12, color: "#8b949e", fontVariantNumeric: "tabular-nums" }}>{time} ET</span>
        </div>
      </div>

      <div style={{ borderBottom: "1px solid #21262d", padding: "8px 20px", display: "flex", gap: 28, background: "#010409", overflowX: "auto" }}>
        {INDICES.map(idx => (
          <div key={idx.name} style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: "fit-content" }}>
            <span style={{ fontSize: 9, color: "#8b949e", letterSpacing: "0.1em" }}>{idx.name}</span>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#e6edf3", fontVariantNumeric: "tabular-nums" }}>{idx.value}</span>
              <span style={{ fontSize: 10, color: idx.up ? "#00e676" : "#ef5350" }}>{idx.change}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: "#161b22", borderBottom: "1px solid #21262d", height: 32, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", height: "100%", transform: `translateX(-${offset}px)`, willChange: "transform", whiteSpace: "nowrap" }}>
          {tickerItems.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 24px", borderRight: "1px solid #21262d" }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#f0b429" }}>{s.symbol}</span>
              <span style={{ fontSize: 11, color: "#e6edf3", fontVariantNumeric: "tabular-nums" }}>{(prices[s.symbol] ?? s.price).toFixed(2)}</span>
              <span style={{ fontSize: 10, color: s.change >= 0 ? "#00e676" : "#ef5350" }}>{s.change >= 0 ? "▲" : "▼"} {Math.abs(s.pct).toFixed(2)}%</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr 280px", minHeight: "calc(100vh - 130px)" }}>

        <div style={{ borderRight: "1px solid #21262d", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "10px 14px", borderBottom: "1px solid #21262d", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 10, letterSpacing: "0.12em", color: "#8b949e" }}>WATCHLIST</span>
            <span style={{ fontSize: 9, color: "#f0b429" }}>8 SYMBOLS</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 70px 60px", padding: "6px 14px", borderBottom: "1px solid #21262d", fontSize: 9, color: "#8b949e", letterSpacing: "0.08em" }}>
            <span>SYMBOL</span><span style={{ textAlign: "right" }}>PRICE</span><span style={{ textAlign: "right" }}>CHG%</span>
          </div>
          {STOCKS.map(s => {
            const live  = prices[s.symbol] ?? s.price;
            const isSel = selected.symbol === s.symbol;
            return (
              <div key={s.symbol} className="row-hover" onClick={() => setSelected(s)}
                style={{ display: "grid", gridTemplateColumns: "1fr 70px 60px", padding: "9px 14px", borderBottom: "1px solid #161b22", background: isSel ? "rgba(240,180,41,0.09)" : "transparent", borderLeft: isSel ? "2px solid #f0b429" : "2px solid transparent", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: isSel ? "#f0b429" : "#e6edf3" }}>{s.symbol}</div>
                  <div style={{ fontSize: 9, color: "#8b949e", marginTop: 1 }}>{s.sector}</div>
                </div>
                <div style={{ textAlign: "right", fontSize: 12, fontVariantNumeric: "tabular-nums" }}>{live.toFixed(2)}</div>
                <div style={{ textAlign: "right", fontSize: 11, color: s.pct >= 0 ? "#00e676" : "#ef5350", fontVariantNumeric: "tabular-nums" }}>{s.pct >= 0 ? "+" : ""}{s.pct.toFixed(2)}%</div>
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {tab !== "dividends" && (
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #21262d", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                  <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 28, fontWeight: 700, color: "#f0b429" }}>{selected.symbol}</span>
                  <span style={{ fontSize: 13, color: "#8b949e" }}>{selected.name}</span>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 4 }}>
                  <span style={{ fontSize: 32, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>${(prices[selected.symbol] ?? selected.price).toFixed(2)}</span>
                  <span style={{ fontSize: 16, color: selUp ? "#00e676" : "#ef5350" }}>{selUp ? "▲" : "▼"} {Math.abs(selected.change).toFixed(2)} ({Math.abs(selected.pct).toFixed(2)}%)</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                {[["VOLUME", selected.vol], ["MKT CAP", selected.mkt], ["SECTOR", selected.sector]].map(([label, val]) => (
                  <div key={label} style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 9, color: "#8b949e", letterSpacing: "0.1em" }}>{label}</div>
                    <div style={{ fontSize: 13, marginTop: 2 }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: "flex", borderBottom: "1px solid #21262d", padding: "0 20px" }}>
            {[["chart","CHART"],["heatmap","HEAT MAP"],["dividends","DIV KINGS"]].map(([key, label]) => (
              <button key={key} className="tab-btn" onClick={() => setTab(key)}
                style={{ padding: "10px 16px", color: tab === key ? "#f0b429" : "#8b949e", borderBottom: tab === key ? "2px solid #f0b429" : "2px solid transparent", letterSpacing: "0.1em", marginBottom: -1 }}>
                {label}
              </button>
            ))}
          </div>

          {tab === "chart" && (
            <div style={{ flex: 1, padding: "16px 20px" }}>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={selChart} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={selUp ? "#00e676" : "#ef5350"} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={selUp ? "#00e676" : "#ef5350"} stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="t" hide />
                    <YAxis domain={["auto","auto"]} tick={{ fill: "#8b949e", fontSize: 10 }} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine y={selected.price} stroke="#30363d" strokeDasharray="3 3" />
                    <Area type="monotone" dataKey="v" stroke={selUp ? "#00e676" : "#ef5350"} strokeWidth={1.5} fill="url(#areaGrad)" dot={false} activeDot={{ r: 3, fill: "#f0b429", strokeWidth: 0 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 9, color: "#8b949e", letterSpacing: "0.12em", marginBottom: 10 }}>RELATED PERFORMANCE</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
                  {STOCKS.slice(0, 4).map(s => (
                    <div key={s.symbol} onClick={() => setSelected(s)} style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 6, padding: "8px 10px", cursor: "pointer" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 10, fontWeight: 600 }}>{s.symbol}</span>
                        <span style={{ fontSize: 9, color: s.pct >= 0 ? "#00e676" : "#ef5350" }}>{s.pct >= 0 ? "+" : ""}{s.pct.toFixed(2)}%</span>
                      </div>
                      <ResponsiveContainer width="100%" height={36}>
                        <LineChart data={sparkData[s.symbol]}>
                          <Line type="monotone" dataKey="v" stroke={s.pct >= 0 ? "#00e676" : "#ef5350"} strokeWidth={1} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "heatmap" && (
            <div style={{ flex: 1, padding: "20px" }}>
              <div style={{ fontSize: 9, color: "#8b949e", letterSpacing: "0.12em", marginBottom: 14 }}>S&P 500 HEAT MAP — TODAY</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {HEATMAP.map(h => (
                  <div key={h.symbol} style={{ background: heatColor(h.pct), borderRadius: 6, padding: `${h.size * 10}px ${h.size * 14}px`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", minWidth: h.size * 40 }}>
                    <span style={{ fontSize: h.size * 4 + 8, fontWeight: 700, color: "rgba(255,255,255,0.95)" }}>{h.symbol}</span>
                    <span style={{ fontSize: h.size * 3 + 7, color: "rgba(255,255,255,0.8)", marginTop: 2 }}>{h.pct >= 0 ? "+" : ""}{h.pct.toFixed(2)}%</span>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 20 }}>
                <span style={{ fontSize: 9, color: "#8b949e" }}>RANGE:</span>
                {[["≥+2%","#00e676"],["+0.5%","#69f0ae"],["0%","#2e7d5e"],["-0.5%","#7b3030"],["-2%","#ef5350"],["≤-2%","#b71c1c"]].map(([lbl,col]) => (
                  <div key={lbl} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{ width: 10, height: 10, background: col, borderRadius: 2 }} />
                    <span style={{ fontSize: 9, color: "#8b949e" }}>{lbl}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "dividends" && <DividendKingsPanel />}
        </div>

        <div style={{ borderLeft: "1px solid #21262d", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "10px 14px", borderBottom: "1px solid #21262d", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 10, letterSpacing: "0.12em", color: "#8b949e" }}>MARKET FEED</span>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div className="live-dot" style={{ width: 5, height: 5, borderRadius: "50%", background: "#f0b429" }} />
              <span style={{ fontSize: 9, color: "#f0b429" }}>LIVE</span>
            </div>
          </div>
          {NEWS.map((n, i) => (
            <div className="news-item" key={i} style={{ padding: "12px 14px", borderBottom: "1px solid #161b22", animationDelay: `${i * 0.07}s`, cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 9, fontWeight: 600, background: n.tag === "MACRO" ? "#1c2d40" : "#1a1a2e", color: n.tag === "MACRO" ? "#58a6ff" : "#f0b429", padding: "2px 6px", borderRadius: 3, letterSpacing: "0.08em" }}>{n.tag}</span>
                <span style={{ fontSize: 9, color: "#8b949e" }}>{n.time}</span>
              </div>
              <p style={{ fontSize: 11, color: "#c9d1d9", lineHeight: 1.5 }}>{n.headline}</p>
            </div>
          ))}
          <div style={{ marginTop: "auto", padding: "14px", borderTop: "1px solid #21262d" }}>
            <div style={{ fontSize: 9, color: "#8b949e", letterSpacing: "0.12em", marginBottom: 10 }}>MARKET BREADTH</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {[["ADVANCING","287","#00e676"],["DECLINING","198","#ef5350"],["UNCHANGED","15","#8b949e"]].map(([lbl,val,col]) => (
                <div key={lbl} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 600, color: col }}>{val}</div>
                  <div style={{ fontSize: 8, color: "#8b949e", marginTop: 2, letterSpacing: "0.06em" }}>{lbl}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10, height: 4, background: "#21262d", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ width: "59%", height: "100%", background: "linear-gradient(90deg,#00e676,#69f0ae)", borderRadius: 2 }} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
