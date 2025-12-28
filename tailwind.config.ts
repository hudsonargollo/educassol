import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
					hover: 'hsl(var(--card-hover))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// ExamAI Design System Colors
				examai: {
					purple: {
						50: '#faf5ff',
						100: '#f3e8ff',
						200: '#e9d5ff',
						300: '#d8b4fe',
						400: '#c084fc',
						500: '#a855f7',
						600: '#9333ea',
						700: '#7c3aed',
						800: '#6b21a8',
						900: '#581c87',
					},
					navy: {
						50: '#f8fafc',
						100: '#f1f5f9',
						200: '#e2e8f0',
						300: '#cbd5e1',
						400: '#94a3b8',
						500: '#64748b',
						600: '#475569',
						700: '#334155',
						800: '#1e293b',
						900: '#0f172a',
						950: '#0a0d14',
					},
					amber: {
						50: '#fffbeb',
						100: '#fef3c7',
						200: '#fde68a',
						300: '#fcd34d',
						400: '#fbbf24',
						500: '#f59e0b',
						600: '#d97706',
						700: '#b45309',
						800: '#92400e',
						900: '#78350f',
					},
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				xl: '0.75rem',
				'2xl': '1rem',
			},
			backgroundImage: {
				'gradient-sun': 'var(--gradient-sun)',
				'gradient-hero': 'var(--gradient-hero)',
				'gradient-warm': 'var(--gradient-warm)',
				// ExamAI Gradients
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'examai-hero': 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(120, 119, 198, 0.3), transparent)',
				'examai-card': 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
				'examai-cta': 'linear-gradient(90deg, hsl(38, 92%, 50%) 0%, hsl(25, 95%, 53%) 100%)',
				'examai-purple': 'linear-gradient(135deg, #a855f7 0%, #8b5cf6 100%)',
				'examai-blue': 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
				'examai-green': 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)',
				'examai-amber': 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
			},
			boxShadow: {
				'warm': 'var(--shadow-warm)',
				'glow': 'var(--shadow-glow)',
				// ExamAI Shadows
				'examai-purple': '0 0 20px rgba(168, 85, 247, 0.25)',
				'examai-purple-lg': '0 0 40px rgba(168, 85, 247, 0.35)',
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'glow-pulse': {
					'0%, 100%': { 
						boxShadow: '0 0 20px hsl(45 100% 70% / 0.3)'
					},
					'50%': { 
						boxShadow: '0 0 40px hsl(45 100% 70% / 0.6)'
					}
				},
				// ExamAI Animations
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' },
				},
				'pulse-slow': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.7' },
				},
				'purple-glow': {
					'0%, 100%': { 
						boxShadow: '0 0 20px rgba(168, 85, 247, 0.25)'
					},
					'50%': { 
						boxShadow: '0 0 40px rgba(168, 85, 247, 0.45)'
					}
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
				// ExamAI Animations
				'float': 'float 6s ease-in-out infinite',
				'pulse-slow': 'pulse-slow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'purple-glow': 'purple-glow 2s ease-in-out infinite',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
