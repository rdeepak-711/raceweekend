import React from 'react';
import { getRacesBySeries } from '@/services/race.service';
import Nav from './Nav';

export default async function NavWrapper() {
  const [f1Races, motogpRaces] = await Promise.all([
    getRacesBySeries('f1'),
    getRacesBySeries('motogp'),
  ]);

  // Just take the next 4 for each to keep nav clean
  const upcomingF1 = f1Races
    .filter(r => new Date(r.raceDate) >= new Date())
    .slice(0, 4);
    
  const upcomingMotogp = motogpRaces
    .filter(r => new Date(r.raceDate) >= new Date())
    .slice(0, 4);

  return <Nav upcomingF1={upcomingF1} upcomingMotogp={upcomingMotogp} />;
}
