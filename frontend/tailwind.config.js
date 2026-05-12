/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'devil-red': '#e11d48',
        'devil-red-dark': '#9f1239',
        'devil-red-light': '#fb7185',
        'devil-bg': '#0a0a0f',
        'devil-surface': '#12121a',
        'devil-surface2': '#1a1a26',
        'devil-surface3': '#222235',
        'devil-border': '#2a2a3e',
        'devil-text': '#e2e2f0',
        'devil-muted': '#8888aa',
        'devil-neon': '#ff2d6e',
        'devil-glow': '#e11d4840',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'neon': '0 0 20px rgba(225, 29, 72, 0.4)',
        'neon-sm': '0 0 10px rgba(225, 29, 72, 0.3)',
        'neon-lg': '0 0 40px rgba(225, 29, 72, 0.5)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 10px rgba(225, 29, 72, 0.3)' },
          '100%': { boxShadow: '0 0 25px rgba(225, 29, 72, 0.7)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backgroundImage: {
        'devil-gradient': 'linear-gradient(135deg, #e11d48 0%, #9f1239 100%)',
        'dark-gradient': 'linear-gradient(180deg, #0a0a0f 0%, #12121a 100%)',
        'card-gradient': 'linear-gradient(135deg, #12121a 0%, #1a1a26 100%)',
        'glow-gradient': 'radial-gradient(circle at 50% 50%, rgba(225,29,72,0.15) 0%, transparent 70%)',
      },
    },
  },
  plugins: [],
};
