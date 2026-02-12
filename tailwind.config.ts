import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // War Room Design System (#0a0a0b bg, #0066ff accent)
        'war': {
          bg: '#0a0a0b',
          surface: '#111113',
          elevated: '#1a1a1c',
          border: 'rgba(255,255,255,0.06)',
          'border-hover': 'rgba(255,255,255,0.12)',
          blue: '#0066ff',
          'blue-dim': 'rgba(0,102,255,0.15)',
          'blue-bright': 'rgba(0,102,255,0.25)',
        },
        
        // CRM Design System (#141517 bg, #2D7FF9 accent)
        'crm': {
          bg: '#141517',
          surface: '#1a1c1f',
          card: '#1e2024',
          elevated: '#24262a',
          border: 'rgba(255,255,255,0.08)',
          'border-hover': 'rgba(255,255,255,0.15)',
          blue: '#2D7FF9',
          'blue-dim': 'rgba(45,127,249,0.15)',
          'blue-bright': 'rgba(45,127,249,0.3)',
        },
        
        // Shared Text Hierarchy
        text: {
          bright: '#f5f5f7',
          primary: '#e8eaed',
          mid: '#8e8e93',
          dim: '#686868',
          faint: '#48484d',
        },
        
        // Shared Status Colors
        status: {
          green: '#34c759',
          'green-dim': 'rgba(52,199,89,0.15)',
          'green-bright': 'rgba(52,199,89,0.3)',
          red: '#ff3b30',
          'red-dim': 'rgba(255,59,48,0.15)',
          'red-bright': 'rgba(255,59,48,0.3)',
          amber: '#ff9500',
          'amber-dim': 'rgba(255,149,0,0.15)',
          'amber-bright': 'rgba(255,149,0,0.3)',
          purple: '#af52de',
          'purple-dim': 'rgba(175,82,222,0.15)',
          'purple-bright': 'rgba(175,82,222,0.3)',
        },
        
        // Legacy aliases (will phase out)
        't-bg': '#0a0a0b',
        'delivrd-bg': '#0a0a0b',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['SF Mono', 'JetBrains Mono', 'Monaco', 'Consolas', 'monospace'],
      },
      borderRadius: {
        premium: '14px',
        button: '12px',
        tag: '8px',
      },
      fontSize: {
        // Premium Typography Scale
        'display-xl': ['80px', { lineHeight: '1.1', fontWeight: '700', letterSpacing: '-0.02em' }],
        'display-lg': ['64px', { lineHeight: '1.1', fontWeight: '700', letterSpacing: '-0.02em' }],
        'display': ['56px', { lineHeight: '1.1', fontWeight: '700', letterSpacing: '-0.015em' }],
        'headline': ['36px', { lineHeight: '1.2', fontWeight: '600', letterSpacing: '-0.01em' }],
        'title-lg': ['28px', { lineHeight: '1.3', fontWeight: '600' }],
        'title': ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        'body-lg': ['20px', { lineHeight: '1.5', fontWeight: '400' }],
        'body': ['17px', { lineHeight: '1.5', fontWeight: '400' }],
        'label': ['15px', { lineHeight: '1.4', fontWeight: '500' }],
        'caption': ['13px', { lineHeight: '1.3', fontWeight: '400' }],
        'micro': ['11px', { lineHeight: '1.2', fontWeight: '600', letterSpacing: '0.06em' }],
      },
      spacing: {
        'section': '80px',
        'block': '48px',
        'card': '32px',
        'element': '20px',
      },
      keyframes: {
        'fade-up': {
          'from': { opacity: '0', transform: 'translateY(8px)' },
          'to': { opacity: '1', transform: 'translateY(0)' }
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' }
        }
      },
      animation: {
        'fade-up': 'fade-up 0.4s ease forwards',
        'pulse': 'pulse 2s infinite',
      }
    },
  },
  plugins: [],
} satisfies Config;
