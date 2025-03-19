import { fontFamily } from 'tailwindcss/defaultTheme';
import type { Config } from 'tailwindcss';

const config: Config = {
    darkMode: ['class'],
    content: [   './src/**/*.{html,js,svelte,ts}',
        './node_modules/svelte-ux/**/*.{svelte,js}',
        './node_modules/layerchart/**/*.{svelte,js}'],
    theme: {
        container: {
            center: true,
            padding: '2rem',
            screens: {
                'sm': '640px',
                'md': '768px',
                'lg': '1024px',
                'xl': '1280px',
                '2xl': '1536px',
            },
        },
        screens: {
            'sm': '640px',
            'md': '768px',
            'lg': '1024px',
            'xl': '1280px',
            '2xl': '1536px',
        },
        extend: {
            fontSize: {
                '2xs': ['0.625rem', { lineHeight: '0.75rem' }],  // 10px with 12px line height
            },
            colors: {
                border: 'hsl(var(--border) / <alpha-value>)',
                input: 'hsl(var(--input) / <alpha-value>)',
                ring: 'hsl(var(--ring) / <alpha-value>)',
                background: 'hsl(var(--background) / <alpha-value>)',
                foreground: 'hsl(var(--foreground) / <alpha-value>)',
                primary: {
                    DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
                    foreground: 'hsl(var(--primary-foreground) / <alpha-value>)'
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
                    foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)'
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive) / <alpha-value>)',
                    foreground: 'hsl(var(--destructive-foreground) / <alpha-value>)'
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted) / <alpha-value>)',
                    foreground: 'hsl(var(--muted-foreground) / <alpha-value>)'
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
                    foreground: 'hsl(var(--accent-foreground) / <alpha-value>)'
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover) / <alpha-value>)',
                    foreground: 'hsl(var(--popover-foreground) / <alpha-value>)'
                },
                card: {
                    DEFAULT: 'hsl(var(--card) / <alpha-value>)',
                    foreground: 'hsl(var(--card-foreground) / <alpha-value>)'
                }
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
                none: '0',
                DEFAULT: '0.25rem',
                full: '9999px',
                large: '12px',
            },
            borderWidth: {
                DEFAULT: '1px',
                '0': '0',
                '1': '1px',
                '2': '2px',
                '3': '3px',
                '4': '4px',
                '6': '6px',
                '8': '8px',
            },
            fontFamily: {
                sans: ['"IBM Plex Sans"', ...fontFamily.sans],
                mono: ['"IBM Plex Mono"', ...fontFamily.mono],
                serif: ['"IBM Plex Serif"', ...fontFamily.serif]
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'border-beam': 'border-beam calc(var(--duration)*1s) infinite linear',
                'image-glow': 'image-glow 4100ms 600ms ease-out forwards',
                'fade-in': 'fade-in 1000ms var(--animation-delay, 0ms) ease forwards',
                'fade-up': 'fade-up 1000ms var(--animation-delay, 0ms) ease forwards',
                shimmer: 'shimmer 8s infinite',
                marquee: 'marquee var(--duration) infinite linear',
                'marquee-vertical': 'marquee-vertical var(--duration) linear infinite'
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' }
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' }
                },
                'border-beam': {
                    '100%': {
                        'offset-distance': '100%'
                    }
                },
                'image-glow': {
                    '0%': {
                        opacity: '0',
                        'animation-timing-function': 'cubic-bezier(0.74, 0.25, 0.76, 1)'
                    },
                    '10%': {
                        opacity: '0.7',
                        'animation-timing-function': 'cubic-bezier(0.12, 0.01, 0.08, 0.99)'
                    },
                    '100%': {
                        opacity: '0.4'
                    }
                },
                'fade-in': {
                    from: { opacity: '0', transform: 'translateY(-10px)' },
                    to: { opacity: '1', transform: 'none' }
                },
                'fade-up': {
                    from: { opacity: '0', transform: 'translateY(20px)' },
                    to: { opacity: '1', transform: 'none' }
                },
                shimmer: {
                    '0%, 90%, 100%': {
                        'background-position': 'calc(-100% - var(--shimmer-width)) 0'
                    },
                    '30%, 60%': {
                        'background-position': 'calc(100% + var(--shimmer-width)) 0'
                    }
                },
                marquee: {
                    from: { transform: 'translateX(0)' },
                    to: { transform: 'translateX(calc(-100% - var(--gap)))' }
                },
                'marquee-vertical': {
                    from: { transform: 'translateY(0)' },
                    to: { transform: 'translateY(calc(-100% - var(--gap)))' }
                }
            }
        }
    },
    plugins: [
        require('tailwindcss-animate'),
        require('@tailwindcss/forms')
    ],
} satisfies Config;

export default config;