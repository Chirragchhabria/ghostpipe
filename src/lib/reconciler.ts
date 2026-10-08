export interface AshTrip {
  tripId: string; plant: string; date: string;
  manifestMt: number; weighbridgeMt: number;
  declaredDest: string;
  gpsDropLat: number; gpsDropLng: number;
  destLat: number; destLng: number;
  subsidyPerMt: number;
}

export interface TripVerdict {
  tripId: string; missingMt: number; diversionPct: number;
  routeDeviationKm: number; subsidyAtRisk: number;
  risk: 'CLEAN' | 'WATCH' | 'FLAG'; reasons: string[];
}

function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const s = Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export function reconcileTrip(t: AshTrip): TripVerdict {
  const missingMt = Math.max(0, t.manifestMt - t.weighbridgeMt);
  const diversionPct = t.manifestMt ? (missingMt / t.manifestMt) * 100 : 0;
  const routeDeviationKm = haversineKm(t.gpsDropLat, t.gpsDropLng, t.destLat, t.destLng);
  const subsidyAtRisk = Math.round(missingMt * t.subsidyPerMt);
  const reasons: string[] = [];
  if (missingMt >= 5) reasons.push(`${missingMt.toFixed(1)} MT vanished vs manifest`);
  if (routeDeviationKm > 5) reasons.push(`${routeDeviationKm.toFixed(1)} km off destination`);
  let risk: TripVerdict['risk'] = 'CLEAN';
  if (missingMt >= 10 || routeDeviationKm > 10) risk = 'FLAG';
  else if (missingMt >= 3 || routeDeviationKm > 5) risk = 'WATCH';
  return { tripId: t.tripId, missingMt, diversionPct, routeDeviationKm, subsidyAtRisk, risk, reasons };
}
