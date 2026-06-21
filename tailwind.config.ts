import type { Config } from 'tailwindcss';

/**
 * Design tokens mirror the UI/UX Design System (D-15) and the document house style.
 * Brand rust #C0451F, slate text #1F2933, etc.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        rust: { DEFAULT: '#C0451F', dark: '#9E3416', soft: '#F4E3DD' },
        slate: { DEFAULT: '#1F2933', 2: '#323F4B' },
        muted: '#52606D',
        cream: '#F4F1EE',
        line: '#D9D2CC',
        open: '#2F8F4F',
        soldout: '#C9821F',
      },
      borderRadius: {
        card: '12px',
        control: '8px',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'Arial', 'sans-serif'],
        arabic: ['var(--font-arabic)', 'Tahoma', 'Arial', 'sans-serif'],
      },
      minHeight: { tap: '44px' },
      minWidth: { tap: '44px' },
    },
  },
  plugins: [],
};

export default config;
