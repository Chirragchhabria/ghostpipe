import { useMemo, useState } from 'react';
import { TRIPS, PLANT, DUMP_CELL } from './data/mock';
import { reconcileTrip } from './lib/reconciler';
import { buildDossierPrompt, mockDossier } from './lib/dossier';
import { spectralWipeScore } from './lib/spectral';

const css = `
body{margin:0;font-family:system-ui;background:#0a0f0d;color:#e8f0ec}
.wrap{max-width:1000px;margin:0 auto;padding:20px}
.hero{background:linear-gradient(135deg,#10231c,#1a3a2d);border:1px solid #2a5544;border-radius:14px;padding:20px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px}
@media(max-width:760px){.grid{grid-template-columns:1fr}}
.card{background:#0f1a15;border:1px solid #24473a;border-radius:12px;padding:14px}
table{width:100%;border-collapse:collapse;font-size:13px}
th,td{padding:7px;border-bottom:1px solid #1e352c;text-align:left}
.badge{padding:2px 8px;border-radius:999px;font-size:11px;font-weight:700}
.FLAG{background:#ff4d4d33;color:#ff8080}.WATCH{background:#ffbb0033;color:#ffd97d}.CLEAN{background:#00ff8833;color:#7dffa8}
button{background:#00e676;border:0;border-radius:8px;padding:9px 14px;font-weight:800;cursor:pointer}
pre{white-space:pre-wrap;background:#08110d;border:1px solid #24473a;border-radius:8px;padding:10px;font-size:12px;max-height:260px;overflow:auto}
.muted{color:#9db8ad;font-size:13px}.wipe{height:130px;display:flex;border-radius:8px;overflow:hidden;border:1px solid #24473a}
.wipe div{flex:1;display:flex;align-items:center;justify-content:center;font-weight:800}
`;

export default function App() {
  const verdicts = useMemo(() => TRIPS.map(reconcileTrip), []);
  const [sel, setSel] = useState(TRIPS[0].tripId);
  const trip = TRIPS.find((t) => t.tripId === sel)!;
  const verdict = verdicts.find((v) => v.tripId === sel)!;
  const [mix, setMix] = useState(50);
  const wipe = useMemo(() => {
    const mk = (ash: boolean, i: number) => ({ b8a: ash ? 0.28 : 0.22, b11: ash ? 0.32 : 0.18 + (i % 5) * 0.002, b12: ash ? 0.16 : 0.15 });
    const before = Array.from({ length: 200 }, (_, i) => mk(false, i));
    const after = Array.from({ length: 200 }, (_, i) => mk(i < 76, i));
    return spectralWipeScore(before, after);
  }, []);
  const dossier = mockDossier(trip, verdict);
  const prompt = buildDossierPrompt(trip, verdict, wipe.meanFadiDelta);

  return (
    <div className="wrap"><style>{css}</style>
      <div className="hero">
        <div className="muted">BHARAT BUILDS 2026 · TRACK 03 · {PLANT.name} → {DUMP_CELL.name}</div>
        <h1>👻 GhostPipe</h1>
        <p className="muted">Truck claims 40 MT subsidy, dumps in Yamuna. We check satellite physics + weighbridge weight + GPS — then draft the court brief.</p>
      </div>
      <div className="grid">
        <div className="card">
          <h3>1 · Satellite wipe</h3>
          <p className="muted">{wipe.pctNewAsh.toFixed(1)}% flipped soil→ash · ΔFADI +{wipe.meanFadiDelta.toFixed(3)}</p>
          <div className="wipe"><div style={{ background: '#5a4a33' }}>BEFORE soil</div><div style={{ background: '#8a8f96', flex: mix / 50 }}>AFTER ash</div></div>
          <input type="range" value={mix} onChange={(e) => setMix(Number(e.target.value))} style={{ width: '100%' }} />
        </div>
        <div className="card">
          <h3>2 · Weight checker</h3>
          <table><thead><tr><th>Trip</th><th>Paper→Scale</th><th>Risk</th></tr></thead><tbody>
            {verdicts.map((v) => {
              const t = TRIPS.find((x) => x.tripId === v.tripId)!;
              return <tr key={v.tripId} onClick={() => setSel(v.tripId)} style={{ cursor: 'pointer', background: v.tripId === sel ? '#163023' : 'transparent' }}><td>{v.tripId}</td><td>{t.manifestMt}→{t.weighbridgeMt}</td><td><span className={`badge ${v.risk}`}>{v.risk}</span></td></tr>;
            })}
          </tbody></table>
          <p className="muted">{trip.tripId}: missing {verdict.missingMt.toFixed(1)} MT · ₹{verdict.subsidyAtRisk.toLocaleString('en-IN')} · {verdict.reasons.join('; ') || 'clean'}</p>
        </div>
      </div>
      <div className="card" style={{ marginTop: 12 }}>
        <h3>3 · Court brief button</h3>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <button onClick={() => { navigator.clipboard?.writeText(prompt); alert('Bedrock prompt copied'); }}>Copy Bedrock prompt</button>
          <button onClick={() => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([dossier], { type: 'text/plain' })); a.download = `${trip.tripId}-brief.txt`; a.click(); }}>Download brief</button>
        </div>
        <pre>{dossier}</pre>
      </div>
    </div>
  );
}
