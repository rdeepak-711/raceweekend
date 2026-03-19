'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Currency = 'USD' | 'EUR' | 'GBP' | 'AUD' | 'CAD' | 'JPY';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  convertPrice: (amount: number, from?: string) => { amount: number; label: string };
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const SYMBOLS: Record<Currency, string> = {
  USD: '$', EUR: '€', GBP: '£', AUD: 'A$', CAD: 'C$', JPY: '¥'
};

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('USD');
  const [rates, setRates] = useState<Record<string, number>>({ USD: 1 });

  useEffect(() => {
    const saved = localStorage.getItem('rw-currency') as Currency;
    if (saved) setCurrencyState(saved);

    fetch('/api/exchange-rates')
      .then(res => res.json())
      .then(data => {
        if (data.rates) setRates(data.rates);
      })
      .catch(e => console.error('Failed to fetch exchange rates:', e));
  }, []);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem('rw-currency', c);
  };

  const convertPrice = (amount: number, from: string = 'USD') => {
    // Basic conversion logic: amount is assumed to be in the 'from' currency (default USD)
    // and converted to the globally selected 'currency'.
    const rateInUSD = 1 / (rates[from] || 1);
    const amountInUSD = amount * rateInUSD;
    const targetRate = rates[currency] || 1;
    const convertedAmount = amountInUSD * targetRate;

    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    });

    return {
      amount: convertedAmount,
      label: formatter.format(convertedAmount)
    };
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convertPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
