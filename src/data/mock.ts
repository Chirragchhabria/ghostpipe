import type { AshTrip } from '../lib/reconciler';

// Dadri + Yamuna focus. Approx public coords for demo narrative.
export const PLANT = { name: 'NTPC Dadri', lat: 28.602, lng: 77.608, capacityMw: 2637 };
export const DUMP_CELL = { name: 'Yamuna floodplain cell Y-7', lat: 28.72, lng: 77.45 };

export const TRIPS: AshTrip[] = [
  { tripId: 'ASH-1042', plant: 'NTPC Dadri', date: '2026-10-06', manifestMt: 40, weighbridgeMt: 14.6, declaredDest: 'Khurja brick cluster', gpsDropLat: 28.72, gpsDropLng: 77.45, destLat: 28.25, destLng: 77.85, subsidyPerMt: 4500 },
  { tripId: 'ASH-1043', plant: 'NTPC Dadri', date: '2026-10-06', manifestMt: 40, weighbridgeMt: 39.2, declaredDest: 'Khurja brick cluster', gpsDropLat: 28.27, gpsDropLng: 77.83, destLat: 28.25, destLng: 77.85, subsidyPerMt: 4500 },
  { tripId: 'ASH-1045', plant: 'NTPC Dadri', date: '2026-10-07', manifestMt: 40, weighbridgeMt: 40.5, declaredDest: 'NHAI embankment Lot 7', gpsDropLat: 28.58, gpsDropLng: 77.62, destLat: 28.59, destLng: 77.61, subsidyPerMt: 4500 },
  { tripId: 'ASH-1048', plant: 'NTPC Dadri', date: '2026-10-08', manifestMt: 40, weighbridgeMt: 22.3, declaredDest: 'Khurja brick cluster', gpsDropLat: 28.7, gpsDropLng: 77.47, destLat: 28.25, destLng: 77.85, subsidyPerMt: 4500 },
];
