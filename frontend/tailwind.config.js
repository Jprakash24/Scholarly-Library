/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      /* ── Colour tokens ───────────────────────────────────── */
      colors: {
        /* Primary — CSS var: near-black in light, warm white in dark */
        primary:                    'var(--md-primary)',
        'on-primary':               'var(--md-on-primary)',
        'primary-container':        '#0d1c32',
        'on-primary-container':     '#76849f',
        'primary-fixed':            '#d6e3ff',
        'primary-fixed-dim':        '#b9c7e4',
        'on-primary-fixed':         '#0d1c32',
        'on-primary-fixed-variant': '#39475f',
        'inverse-primary':          '#b9c7e4',

        /* Secondary — CSS var: golden-brown in light, bright gold in dark */
        secondary:                    'var(--md-secondary)',
        'on-secondary':               'var(--md-on-secondary)',
        'secondary-container':        'var(--md-secondary-container)',
        'on-secondary-container':     'var(--md-on-secondary-container)',
        'secondary-fixed':            '#ffdea5',
        'secondary-fixed-dim':        '#e9c176',
        'on-secondary-fixed':         '#261900',
        'on-secondary-fixed-variant': '#5d4201',

        /* Tertiary — slate-blue */
        tertiary:                    '#000000',
        'on-tertiary':               '#ffffff',
        'tertiary-container':        '#0d1c2e',
        'on-tertiary-container':     '#77859a',
        'tertiary-fixed':            '#d5e3fc',
        'tertiary-fixed-dim':        '#b9c7df',
        'on-tertiary-fixed':         '#0d1c2e',
        'on-tertiary-fixed-variant': '#3a485b',

        /* Error */
        error:               '#ba1a1a',
        'on-error':          '#ffffff',
        'error-container':   '#ffdad6',
        'on-error-container':'#93000a',

        /* Surface (CSS-variable — adapts to dark/light) */
        surface:                    'var(--md-surface)',
        background:                 'var(--md-background)',
        'surface-dim':              'var(--md-surface-dim)',
        'surface-bright':           'var(--md-surface-bright)',
        'surface-container-lowest': 'var(--md-surface-container-lowest)',
        'surface-container-low':    'var(--md-surface-container-low)',
        'surface-container':        'var(--md-surface-container)',
        'surface-container-high':   'var(--md-surface-container-high)',
        'surface-container-highest':'var(--md-surface-container-highest)',
        'surface-variant':          'var(--md-surface-variant)',
        'surface-tint':             '#515f78',

        /* On-surface */
        'on-surface':         'var(--md-on-surface)',
        'on-background':      'var(--md-on-background)',
        'on-surface-variant': 'var(--md-on-surface-variant)',

        /* Outline */
        outline:         'var(--md-outline)',
        'outline-variant':'var(--md-outline-variant)',

        /* Inverse */
        'inverse-surface':    'var(--md-inverse-surface)',
        'inverse-on-surface': 'var(--md-inverse-on-surface)',
      },

      /* ── Border radius ───────────────────────────────────── */
      borderRadius: {
        sm:   '0.375rem',
        DEFAULT:'0.5rem',
        md:   '0.5rem',
        lg:   '0.75rem',
        xl:   '1rem',
        '2xl':'1.25rem',
        '3xl':'1.5rem',
        full: '9999px',
      },

      /* ── Spacing ─────────────────────────────────────────── */
      spacing: {
        'margin-mobile':      '16px',
        'margin-desktop':     '40px',
        base:                 '8px',
        gutter:               '24px',
        'container-max-width':'1400px',
      },

      /* ── Font families ───────────────────────────────────── */
      fontFamily: {
        sans:    ['"Work Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Manrope',     'ui-sans-serif', 'system-ui', 'sans-serif'],
        body:    ['"Work Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],

        /* Legacy class-names kept for backwards compat */
        'title-md':         ['Manrope',     'sans-serif'],
        'headline-lg':      ['Manrope',     'sans-serif'],
        'headline-lg-mobile':['Manrope',    'sans-serif'],
        'display-lg':       ['Manrope',     'sans-serif'],
        'body-lg':          ['"Work Sans"', 'sans-serif'],
        'body-md':          ['"Work Sans"', 'sans-serif'],
        'label-sm':         ['"Work Sans"', 'sans-serif'],
      },

      /* ── Type scale ──────────────────────────────────────── */
      fontSize: {
        /* Display — hero headings (Manrope) */
        'display-xl': ['4rem',    { lineHeight: '1.1',  fontWeight: '800', letterSpacing: '-0.03em' }],
        'display-lg': ['3rem',    { lineHeight: '1.15', fontWeight: '700', letterSpacing: '-0.02em' }],
        'display-md': ['2.5rem',  { lineHeight: '1.2',  fontWeight: '700', letterSpacing: '-0.02em' }],
        'display-sm': ['2rem',    { lineHeight: '1.25', fontWeight: '700', letterSpacing: '-0.01em' }],

        /* Headline — section titles */
        'headline-lg': ['2rem',    { lineHeight: '1.25', fontWeight: '700' }],
        'headline-md': ['1.75rem', { lineHeight: '1.3',  fontWeight: '600' }],
        'headline-sm': ['1.5rem',  { lineHeight: '1.35', fontWeight: '600' }],
        /* legacy alias */
        'headline-lg-mobile': ['1.5rem', { lineHeight: '1.35', fontWeight: '600' }],

        /* Title — card / panel headings */
        'title-lg': ['1.375rem', { lineHeight: '1.4',  fontWeight: '600' }],
        'title-md': ['1.25rem',  { lineHeight: '1.45', fontWeight: '600' }],
        'title-sm': ['0.875rem', { lineHeight: '1.5',  fontWeight: '600', letterSpacing: '0.01em' }],

        /* Body — prose and descriptions (Work Sans) */
        'body-lg': ['1rem',      { lineHeight: '1.6',  fontWeight: '400' }],
        'body-md': ['0.875rem',  { lineHeight: '1.55', fontWeight: '400' }],
        'body-sm': ['0.8125rem', { lineHeight: '1.5',  fontWeight: '400' }],

        /* Label — chips, badges, captions */
        'label-lg': ['0.875rem',  { lineHeight: '1.4', fontWeight: '500', letterSpacing: '0.03em' }],
        'label-md': ['0.75rem',   { lineHeight: '1.4', fontWeight: '500', letterSpacing: '0.04em' }],
        'label-sm': ['0.6875rem', { lineHeight: '1.4', fontWeight: '500', letterSpacing: '0.05em' }],
      },

      /* ── Box shadows ─────────────────────────────────────── */
      boxShadow: {
        sm:  '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05)',
        DEFAULT:'0 2px 8px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.06)',
        md:  '0 4px 16px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.07)',
        lg:  '0 8px 28px rgba(0,0,0,0.14), 0 4px 10px rgba(0,0,0,0.08)',
        xl:  '0 16px 48px rgba(0,0,0,0.16), 0 6px 16px rgba(0,0,0,0.09)',
      },

      /* ── Transitions ─────────────────────────────────────── */
      transitionTimingFunction: {
        'md-standard': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'md-decelerate':'cubic-bezier(0, 0, 0.2, 1)',
        'md-accelerate':'cubic-bezier(0.4, 0, 1, 1)',
      },
    },
  },
  plugins: [],
}
