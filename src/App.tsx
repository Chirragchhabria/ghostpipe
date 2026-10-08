import { useMemo, useState } from 'react';
import { TRIPS } from './data/mock';
import { reconcileTrip } from './lib/reconciler';
import { buildDossierPrompt, mockDossier } from './lib/dossier';
import { spectralWipeScore } from './lib/spectral';

const css = `
:root { color-scheme: dark; }
* { box-sizing: border-box; }
::selection { background: #34e07a; color: #06110b; }
body { margin: 0; background: #0b100e; color: #e9f2ec; font-family: ui-sans-serif, system-ui, "Segoe UI", Roboto, sans-serif; }
button, input { font: inherit; }
button { cursor: pointer; }
button:focus-visible, tr:focus-visible, input:focus-visible, summary:focus-visible { outline: 2px solid #34e07a; outline-offset: 2px; }
.wrap { max-width: 1120px; margin: 0 auto; padding: 20px 20px 48px; }
.mast { display: flex; align-items: center; gap: 14px; padding: 18px 0 14px; border-bottom: 1px solid #223129; }
.mast h1 { margin: 0; font-size: 28px; letter-spacing: -0.02em; }
.mast .sub { color: #93a89c; font-size: 13.5px; margin-top: 2px; }
.live { margin-left: auto; display: flex; align-items: center; gap: 8px; color: #93a89c; font-size: 12.5px; font-variant-numeric: tabular-nums; }
.dot { width: 9px; height: 9px; border-radius: 50%; background: #34e07a; box-shadow: 0 0 12px #34e07a; }
.ledger { display: flex; border: 1px solid #223129; border-radius: 12px; background: #0e1512; margin-top: 16px; overflow: hidden; }
.ledger > div { flex: 1; padding: 14px 18px; }
.ledger > div + div { border-left: 1px solid #223129; }
.ledger b { display: block; font-size: 24px; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
.ledger span { color: #93a89c; font-size: 12.5px; }
.ledger .good { color: #34e07a; } .ledger .bad { color: #ff6b6b; }
.main { display: grid; grid-template-columns: 1.05fr 1fr; gap: 16px; margin-top: 16px; }
@media (max-width: 860px) { .main { grid-template-columns: 1fr; } .ledger { flex-wrap: wrap; } .ledger > div { flex: 1 1 40%; } }
.panel { background: #0e1512; border: 1px solid #223129; border-radius: 12px; padding: 18px; }
.panel h2 { margin: 0 0 4px; font-size: 17px; letter-spacing: -0.01em; }
.panel .note { color: #93a89c; font-size: 13px; margin: 0 0 12px; font-variant-numeric: tabular-nums; }
.tile { display: grid; grid-template-columns: repeat(20, 1fr); gap: 2px; border-radius: 8px; overflow: hidden; }
.tile i { aspect-ratio: 1; border-radius: 2px; display: block; }
.legend { display: flex; gap: 14px; margin-top: 10px; font-size: 12.5px; color: #93a89c; }
.sw { display: inline-block; width: 11px; height: 11px; border-radius: 3px; margin-right: 6px; vertical-align: -1px; }
input[type="range"] { width: 100%; margin-top: 12px; accent-color: #34e07a; }
table.hauls { width: 100%; border-collapse: collapse; font-size: 13.5px; font-variant-numeric: tabular-nums; }
.hauls th { text-align: left; color: #93a89c; font-weight: 600; font-size: 12px; padding: 8px 10px; border-bottom: 1px solid #223129; }
.hauls td { padding: 10px; border-bottom: 1px solid #182420; }
.hauls tbody tr { cursor: pointer; }
.hauls tbody tr:hover { background: #132019; }
.hauls tbody tr[aria-selected="true"] { background: #14261c; }
.badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 11.5px; font-weight: 700; letter-spacing: 0.02em; }
.FLAG { background: #ff6b6b22; color: #ff8080; border: 1px solid #ff6b6b55; }
.WATCH { background: #ffc44d22; color: #ffd97d; border: 1px solid #ffc44d55; }
.CLEAN { background: #34e07a22; color: #7dffab; border: 1px solid #34e07a55; }
.detail { margin-top: 12px; border-top: 1px dashed #2a3d33; padding-top: 12px; font-size: 13.5px; }
.detail .math { font-variant-numeric: tabular-nums; }
.paper { margin-top: 16px; background: #f2efe6; color: #1c1a14; border-radius: 12px; padding: 22px 24px; }
.paper h2 { margin: 0 0 2px; font-size: 18px; }
.paper .sub { color: #6d675a; font-size: 13px; margin-bottom: 12px; }
.paper pre { white-space: pre-wrap; font-family: Georgia, "Times New Roman", serif; font-size: 13.5px; line-height: 1.55; background: transparent; border: 0; padding: 0; margin: 12px 0 0; max-height: none; }
.actions { display: flex; gap: 10px; flex-wrap: wrap; }
.btn { background: #123524; color: #7dffab; border: 1px solid #2c5a42; border-radius: 10px; padding: 10px 16px; font-weight: 700; }
.btn.primary { background: #34e07a; border-color: #34e07a; color: #06110b; }
.btn:hover { filter: brightness(1.12); }
details.prompt { margin-top: 12px; font-size: 12.5px; color: #4c483c; }
details.prompt code { display: block; margin-top: 6px; font-family: ui-monospace, monospace; font-size: 11.5px; background: #e7e2d4; border-radius: 8px; padding: 10px; white-space: pre-wrap; }
.foot { margin-top: 16px; color: #93a89c; font-size: 12.5px; display: flex; gap: 8px; flex-wrap: wrap; justify-content: space-between; }
::-webkit-scrollbar { width: 10px; }
::-webkit-scrollbar-thumb { background: #24473a; border-radius: 8px; }
`;

function PipeMark() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="30" height="30" rx="9" fill="#123524" stroke="#2c5a42" strokeWidth="1.5" />
      <path d="M10 22c4-1 5-8 9-9s7 1 7-3" stroke="#34e07a" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="10" cy="22" r="2.6" fill="#34e07a" />
    </svg>
  );
}

// Deterministic demo tile: 200 cells, 76 turn to ash after dumping.
const CELLS = Array.from({ length: 200 }, (_, i) => ({
  before: { b8a: 0.22 + ((i * 13) % 7) * 0.004, b11: 0.17 + ((i * 13) % 5) * 0.003, b12: 0.15 },
  after: { b8a: 0.28, b11: 0.32, b12: 0.16 },
  isAsh: (i * 37) % 200 < 76,
}));
const SOIL = ['#6b5844', '#655141', '#6f5c47', '#5d4c3b'];
const ASH = ['#9aa0a3', '#93989b', '#a3a8ab', '#8d9295'];

export default function App() {
  const verdicts = useMemo(() => TRIPS.map(reconcileTrip), []);
  const [sel, setSel] = useState(TRIPS[0].tripId);
  const [mix, setMix] = useState(55);
  const trip = TRIPS.find((t) => t.tripId === sel)!;
  const verdict = verdicts.find((v) => v.tripId === sel)!;
  const flagged = verdicts.filter((v) => v.risk === 'FLAG').length;
  const atRisk = verdicts.reduce((s, v) => s + v.subsidyAtRisk, 0);
  const missing = verdicts.reduce((s, v) => s + v.missingMt, 0);

  const wipe = useMemo(
    () => spectralWipeScore(CELLS.map((c) => c.before), CELLS.map((c) => (c.isAsh ? c.after : c.before))),
    [],
  );
  const dossier = mockDossier(trip, verdict);
  const prompt = buildDossierPrompt(trip, verdict, wipe.meanFadiDelta);

  return (
    <div className="wrap">
      <style>{css}</style>

      <header className="mast">
        <PipeMark />
        <div>
          <h1>GhostPipe</h1>
          <div className="sub">NTPC Dadri → Yamuna floodplain cell Y-7 · fly-ash diversion case board</div>
        </div>
        <div className="live"><span className="dot" /> LIVE · 4 hauls under audit</div>
      </header>

      <section className="ledger" aria-label="Case figures">
        <div><b>40 MT</b><span>audited per haul</span></div>
        <div><b className="bad">{flagged} flagged</b><span>of {verdicts.length} hauls this shift</span></div>
        <div><b className="bad">₹{atRisk.toLocaleString('en-IN')}</b><span>subsidy at risk · {missing.toFixed(1)} MT missing</span></div>
        <div><b className="good">35 km</b><span>riverbed under watch</span></div>
      </section>

      <div className="main">
        <section className="panel" aria-label="Satellite evidence">
          <h2>Fresh ash on the floodplain</h2>
          <p className="note">
            Sentinel-2 SWIR · {wipe.pctNewAsh.toFixed(1)}% of tile flipped soil → ash · ΔFADI +{wipe.meanFadiDelta.toFixed(3)}
          </p>
          <div className="tile" role="img" aria-label="Before and after satellite tile showing fresh ash deposition">
            {CELLS.map((c, i) => {
              const showAfter = (i / CELLS.length) * 100 < mix;
              const ash = showAfter && c.isAsh;
              const pal = ash ? ASH : SOIL;
              return <i key={i} style={{ background: pal[i % 4] }} />;
            })}
          </div>
          <div className="legend">
            <span><span className="sw" style={{ background: '#6b5844' }} />Soil</span>
            <span><span className="sw" style={{ background: '#9aa0a3' }} />Fresh ash</span>
            <span style={{ marginLeft: 'auto' }}>Drag to compare pre / post monsoon pass</span>
          </div>
          <input type="range" min={0} max={100} value={mix} onChange={(e) => setMix(Number(e.target.value))} aria-label="Reveal after image" />
          <p className="note" style={{ marginTop: 8 }}>Demo pixels are synthetic stand-ins; the FADI math is the production formula. Live feed: s3://sentinel-cogs.</p>
        </section>

        <section className="panel" aria-label="Haul ledger">
          <h2>Haul ledger</h2>
          <p className="note">Manifest vs NH weighbridge vs GPS. Select a row for the evidence math.</p>
          <table className="hauls">
            <thead><tr><th>Haul</th><th>Paper → scale</th><th>Route</th><th>Finding</th></tr></thead>
            <tbody>
              {verdicts.map((v) => {
                const t = TRIPS.find((x) => x.tripId === v.tripId)!;
                return (
                  <tr key={v.tripId} tabIndex={0} aria-selected={v.tripId === sel}
                    onClick={() => setSel(v.tripId)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSel(v.tripId); }}>
                    <td><strong>{v.tripId}</strong><br /><span style={{ color: '#93a89c', fontSize: 12 }}>{t.date}</span></td>
                    <td>{t.manifestMt} → {t.weighbridgeMt} MT</td>
                    <td>{v.routeDeviationKm.toFixed(0)} km off</td>
                    <td><span className={`badge ${v.risk}`}>{v.risk}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="detail">
            <strong>{trip.tripId}</strong> · {trip.date} · declared: {trip.declaredDest}
            <div className="math" style={{ marginTop: 6 }}>
              Missing {verdict.missingMt.toFixed(1)} MT ({verdict.diversionPct.toFixed(0)}%) ·
              GPS {verdict.routeDeviationKm.toFixed(1)} km off route ·
              ₹{verdict.subsidyAtRisk.toLocaleString('en-IN')} at risk
            </div>
            <div style={{ color: '#93a89c', marginTop: 4 }}>{verdict.reasons.join(' · ') || 'All three sources agree — clean delivery.'}</div>
          </div>
        </section>
      </div>

      <section className="paper" aria-label="Prosecution brief">
        <h2>Prosecution brief — {trip.tripId}</h2>
        <div className="sub">Drafted from the three evidence sources above · ready for NGT filing · Bedrock prose plugs in later</div>
        <div className="actions">
          <button className="btn primary" onClick={() => {
            const blob = new Blob([dossier], { type: 'text/plain' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `${trip.tripId}-NGT-brief.txt`;
            a.click();
          }}>Download brief</button>
          <button className="btn" onClick={() => { navigator.clipboard?.writeText(prompt); }}>Copy Bedrock prompt</button>
        </div>
        <pre>{dossier}</pre>
        <details className="prompt">
          <summary>Bedrock prompt (sent to Claude 3.5 when AWS is wired)</summary>
          <code>{prompt}</code>
        </details>
      </section>

      <footer className="foot">
        <span>Bharat Builds Tour 2026 · Track 03 Waste &amp; Energy · DTU Delhi</span>
        <span>AWS path: Amplify → API Gateway → Lambda (FADI + reconciler) → DynamoDB → Bedrock</span>
      </footer>
    </div>
  );
}
