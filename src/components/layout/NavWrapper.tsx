import React from 'react';
import { getRacesBySeries } from '@/services/race.service';
import Nav from './Nav';

export default async function NavWrapper() {
  const [f1Races, motogpRaces] = await Promise.all([
    getRacesBySeries('f1'),
    getRacesBySeries('motogp'),
  ]);

  // Keep this deterministic for static prerender paths (e.g. _not-found).
  const upcomingF1 = f1Races
    .filter(r => r.isActive)
    .slice(0, 4);

  const upcomingMotogp = motogpRaces
    .filter(r => r.isActive)
    .slice(0, 4);

  return <Nav upcomingF1={upcomingF1} upcomingMotogp={upcomingMotogp} />;
}
