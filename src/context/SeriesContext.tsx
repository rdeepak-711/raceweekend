'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type Series = 'f1' | 'motogp';

interface SeriesContextValue {
  activeSeries: Series;
  setActiveSeries: (s: Series) => void;
}

const SeriesContext = createContext<SeriesContextValue>({
  activeSeries: 'f1',
  setActiveSeries: () => {},
});

export function SeriesProvider({ children }: { children: ReactNode }) {
  const [activeSeries, setActiveSeries] = useState<Series>('f1');
  return (
    <SeriesContext.Provider value={{ activeSeries, setActiveSeries }}>
      {children}
    </SeriesContext.Provider>
  );
}

export function useSeriesContext() {
  return useContext(SeriesContext);
}
