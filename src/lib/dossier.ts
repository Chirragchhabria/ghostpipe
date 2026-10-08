import type { AshTrip, TripVerdict } from './reconciler';

// AWS switch: set VITE_API_URL to API Gateway to go live, else local mock.
export const API_URL = (import.meta as any).env?.VITE_API_URL as string | undefined;

export function buildDossierPrompt(trip: AshTrip, verdict: TripVerdict, fadiDelta: number): string {
  return `NGT evidence brief. Plant ${trip.plant}, Trip ${trip.tripId} ${trip.date}. Manifest ${trip.manifestMt} MT vs weighbridge ${trip.weighbridgeMt} MT (missing ${verdict.missingMt.toFixed(1)} MT). GPS off ${verdict.routeDeviationKm.toFixed(1)} km from ${trip.declaredDest}. FADI delta +${fadiDelta.toFixed(3)}. Subsidy at risk Rs.${verdict.subsidyAtRisk}. Draft 300-word brief: facts, EPA 1986 s15 / NGT Act s14 / Fly Ash Notification 2021, relief, annexes.`;
}

export function mockDossier(trip: AshTrip, verdict: TripVerdict): string {
  return `NGT EVIDENCE BRIEF (DRAFT) — ${trip.tripId} | ${trip.plant} | ${trip.date}\n\nManifest ${trip.manifestMt} MT vs weighbridge ${trip.weighbridgeMt} MT → ${verdict.missingMt.toFixed(1)} MT missing (${verdict.diversionPct.toFixed(0)}%).\nGPS ${verdict.routeDeviationKm.toFixed(1)} km from ${trip.declaredDest}.\nSubsidy exposure: Rs.${verdict.subsidyAtRisk.toLocaleString('en-IN')}.\n\nStatutes: EPA 1986 s15; NGT Act 2010 s14/15; Fly Ash Notification 2021 (100% utilisation, fine to Rs.1000/MT).\nRelief: remediate Yamuna cell Y-7, penalty on ${verdict.missingMt.toFixed(1)} MT, suspend subsidy 90 days.\nAnnex: manifest, weigh slip, GPS KML, Sentinel-2 FADI chips.\n\n(Wire VITE_API_URL → Bedrock Claude 3.5 for full prose.)`;
}

export async function fetchDossier(prompt: string, fallback: string): Promise<string> {
  if (!API_URL) return fallback;
  const r = await fetch(`${API_URL}/dossier`, { method: 'POST', body: JSON.stringify({ prompt }) });
  const j = await r.json();
  return j.text ?? fallback;
}
