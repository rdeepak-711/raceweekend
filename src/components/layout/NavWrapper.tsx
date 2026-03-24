import React from 'react';
import { getRacesBySeries } from '@/services/race.service';
import Nav from './Nav';

export default async function NavWrapper() {
  const [f1Races, motogpRaces] = await Promise.all([
    getRacesBySeries('f1'),
    getRacesBySeries('motogp'),
  ]);

  // Just take the next 4 for each to keep nav clean
  const today = new Date().toISOString().slice(0, 10);
  const upcomingF1 = f1Races
    .filter(r => r.isActive && r.raceDate >= today)
    .slice(0, 4);

  const upcomingMotogp = motogpRaces
    .filter(r => r.isActive && r.raceDate >= today)
    .slice(0, 4);

  return <Nav upcomingF1={upcomingF1} upcomingMotogp={upcomingMotogp} />;
}
