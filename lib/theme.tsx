'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeMode = 'dark' | 'light';

const darkTheme = {
  bg: '#0B0D10', surface: '#12151A', card: '#171B21', elevated: '#1D2228',
  border: 'rgba(255,255,255,0.06)', borderLit: 'rgba(255,255,255,0.10)',
  blue: '#5A9CF5', blueHot: '#78B4FF', blueWash: 'rgba(90,156,245,0.06)',
  blueBorder: 'rgba(90,156,245,0.15)', blueGlow: 'rgba(90,156,245,0.08)',
  text: '#DFE1E5', textBright: '#F2F3F5', textMid: '#9DA3AE',
  textDim: '#606878', textFaint: '#3A4050',
  green: '#2DD881', greenDim: 'rgba(45,216,129,0.12)',
  red: '#FF5C5C', redDim: 'rgba(255,92,92,0.12)',
  amber: '#FFB340', amberDim: 'rgba(255,179,64,0.12)',
  purple: '#B07CFF', purpleDim: 'rgba(176,124,255,0.12)',
  mono: "'SF Mono', 'Fira Code', 'Consolas', monospace",
};

const lightTheme = {
  bg: '#F5F5F7', surface: '#FFFFFF', card: '#FFFFFF', elevated: '#F0F0F2',
  border: 'rgba(0,0,0,0.08)', borderLit: 'rgba(0,0,0,0.12)',
  blue: '#2563EB', blueHot: '#1D4ED8', blueWash: 'rgba(37,99,235,0.06)',
  blueBorder: 'rgba(37,99,235,0.15)', blueGlow: 'rgba(37,99,235,0.08)',
  text: '#1A1A1A', textBright: '#000000', textMid: '#555555',
  textDim: '#888888', textFaint: '#C0C0C0',
  green: '#16A34A', greenDim: 'rgba(22,163,74,0.10)',
  red: '#DC2626', redDim: 'rgba(220,38,38,0.10)',
  amber: '#D97706', amberDim: 'rgba(217,119,6,0.10)',
  purple: '#7C3AED', purpleDim: 'rgba(124,58,237,0.10)',
  mono: "'SF Mono', 'Fira Code', 'Consolas', monospace",
};

export type Theme = typeof darkTheme;

interface ThemeContextType {
  theme: Theme;
  mode: ThemeMode;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: darkTheme,
  mode: 'dark',
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('delivrd-theme') as ThemeMode | null;
    if (saved) setMode(saved);
  }, []);

  const toggle = () => {
    const next = mode === 'dark' ? 'light' : 'dark';
    setMode(next);
    localStorage.setItem('delivrd-theme', next);
  };

  const theme = mode === 'dark' ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, mode, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

// Toggle button component for use in any page
export function ThemeToggle() {
  const { mode, toggle } = useTheme();
  return (
    <button onClick={toggle} style={{
      fontSize: '11px', fontWeight: 500, padding: '4px 10px',
      background: 'none', border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
      borderRadius: '6px', cursor: 'pointer',
      color: mode === 'dark' ? '#9DA3AE' : '#555555',
    }}>
      {mode === 'dark' ? '☀️ Light' : '🌙 Dark'}
    </button>
  );
}
