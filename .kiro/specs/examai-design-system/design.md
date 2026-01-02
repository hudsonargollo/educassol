# Design Document: ExamAI Design System

## Overview

This design document defines the technical implementation of the ExamAI design system, featuring a modern dark/light mode toggle, purple/violet accent colors, gradient backgrounds, glassmorphism effects, and consistent card-based layouts. The system will be built using Tailwind CSS with CSS custom properties for theme switching, React Context for state management, and shadcn/ui components as the foundation.

## Architecture

The design system follows a layered architecture:

```
┌─────────────────────────────────────────────────────────┐
│                    Application Layer                     │
│         (Pages: Landing, Dashboard, Settings)            │
├─────────────────────────────────────────────────────────┤
│                    Component Layer                       │
│    (Cards, Buttons, Inputs, Navigation, Chat Widget)     │
├─────────────────────────────────────────────────────────┤
│                   Theme Provider Layer                   │
│         (React Context + localStorage persistence)       │
├─────────────────────────────────────────────────────────┤
│                    Token Layer                           │
│         (CSS Variables + Tailwind Configuration)         │
└─────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Theme Provider Component

```typescript
interface ThemeContextValue {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
}

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: 'light' | 'dark' | 'system';
  storageKey?: string;
}
```

The ThemeProvider wraps the application root and:
- Reads initial theme from localStorage or system preference
- Applies `dark` class to `<html>` element for dark mode
- Persists theme changes to localStorage
- Provides context for child components

### Theme Toggle Component

```typescript
interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}
```

The ThemeToggle renders:
- Sun icon when in dark mode (click to switch to light)
- Moon icon when in light mode (click to switch to dark)
- Accessible button with ARIA labels
- Smooth icon transition animation

### Card Component Variants

```typescript
interface CardProps {
  variant?: 'default' | 'gradient' | 'glass' | 'feature';
  interactive?: boolean;
  children: React.ReactNode;
  className?: string;
}
```

Card variants:
- `default`: Standard card with border and background
- `gradient`: Card with gradient background (for hero sections)
- `glass`: Glassmorphism effect with backdrop blur
- `feature`: Dashboard feature cards with icon support

## Data Models

### Color Token Structure

```typescript
interface ColorTokens {
  // Backgrounds
  background: string;
  backgroundSecondary: string;
  backgroundCard: string;
  backgroundCardHover: string;
  
  // Text
  foreground: string;
  foregroundMuted: string;
  foregroundSubtle: string;
  
  // Accents
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  
  // Semantic
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Borders
  border: string;
  borderSubtle: string;
  ring: string;
}
```

### Theme Configuration

```typescript
interface ThemeConfig {
  light: ColorTokens;
  dark: ColorTokens;
}
```

## CSS Custom Properties

### Dark Mode Palette (Primary)

```css
:root.dark {
  /* Backgrounds - Deep navy/slate */
  --background: 222 47% 6%;           /* #0a0d14 */
  --background-secondary: 222 47% 9%; /* #101520 */
  --card: 222 47% 11%;                /* #141a26 */
  --card-hover: 222 47% 14%;          /* #1a2233 */
  
  /* Text */
  --foreground: 210 40% 98%;          /* #f8fafc */
  --muted-foreground: 215 20% 65%;    /* #94a3b8 */
  
  /* Primary - Purple/Violet */
  --primary: 270 95% 65%;             /* #a855f7 - Purple */
  --primary-foreground: 0 0% 100%;
  
  /* Secondary - Amber/Orange for CTAs */
  --secondary: 38 92% 50%;            /* #f59e0b - Amber */
  --secondary-foreground: 0 0% 0%;
  
  /* Accent variations */
  --accent-purple: 270 95% 65%;
  --accent-violet: 258 90% 66%;
  --accent-blue: 217 91% 60%;
  --accent-cyan: 192 91% 36%;
  --accent-green: 142 71% 45%;
  --accent-amber: 38 92% 50%;
  --accent-orange: 25 95% 53%;
  --accent-red: 0 84% 60%;
  
  /* Borders */
  --border: 215 20% 20%;
  --border-subtle: 215 20% 15%;
  --ring: 270 95% 65%;
  
  /* Glassmorphism */
  --glass-bg: rgba(20, 26, 38, 0.8);
  --glass-border: rgba(168, 85, 247, 0.2);
}
```

### Light Mode Palette

```css
:root {
  /* Backgrounds */
  --background: 0 0% 100%;            /* #ffffff */
  --background-secondary: 210 40% 98%; /* #f8fafc */
  --card: 0 0% 100%;
  --card-hover: 210 40% 96%;
  
  /* Text */
  --foreground: 222 47% 11%;          /* #1e293b */
  --muted-foreground: 215 16% 47%;    /* #64748b */
  
  /* Primary - Same purple */
  --primary: 270 95% 55%;
  --primary-foreground: 0 0% 100%;
  
  /* Secondary */
  --secondary: 38 92% 50%;
  --secondary-foreground: 0 0% 100%;
  
  /* Borders */
  --border: 214 32% 91%;
  --border-subtle: 214 32% 95%;
  --ring: 270 95% 55%;
}
```

## Gradient Definitions

```css
/* Hero gradient - Purple to blue radial */
.gradient-hero {
  background: radial-gradient(
    ellipse 80% 50% at 50% -20%,
    rgba(120, 119, 198, 0.3),
    transparent
  );
}

/* Card gradient - Subtle purple */
.gradient-card {
  background: linear-gradient(
    135deg,
    rgba(168, 85, 247, 0.1) 0%,
    rgba(139, 92, 246, 0.05) 100%
  );
}

/* CTA gradient - Amber to orange */
.gradient-cta {
  background: linear-gradient(
    90deg,
    hsl(38, 92%, 50%) 0%,
    hsl(25, 95%, 53%) 100%
  );
}

/* Feature card gradients */
.gradient-purple { background: linear-gradient(135deg, #a855f7 0%, #8b5cf6 100%); }
.gradient-blue { background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%); }
.gradient-green { background: linear-gradient(135deg, #22c55e 0%, #10b981 100%); }
.gradient-amber { background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); }
```

## Component Styling Specifications

### Button Variants

| Variant | Background | Border | Text | Hover |
|---------|------------|--------|------|-------|
| Primary | Purple gradient | None | White | Brightness increase |
| Secondary | Transparent | Purple | Purple | Purple bg 10% |
| CTA | Amber gradient | None | Dark | Brightness increase |
| Ghost | Transparent | None | Muted | Background subtle |
| Destructive | Red | None | White | Red darker |

### Card Specifications

| Property | Dark Mode | Light Mode |
|----------|-----------|------------|
| Background | `hsl(222 47% 11%)` | `white` |
| Border | `1px solid rgba(168, 85, 247, 0.2)` | `1px solid hsl(214 32% 91%)` |
| Border Radius | `12px` (0.75rem) | `12px` |
| Shadow | None | `0 1px 3px rgba(0,0,0,0.1)` |
| Hover Border | `rgba(168, 85, 247, 0.4)` | `hsl(270 95% 55% / 0.3)` |

### Input Field Specifications

| State | Dark Mode | Light Mode |
|-------|-----------|------------|
| Default BG | `hsl(222 47% 9%)` | `white` |
| Default Border | `hsl(215 20% 20%)` | `hsl(214 32% 91%)` |
| Focus Border | `hsl(270 95% 65%)` | `hsl(270 95% 55%)` |
| Focus Ring | `0 0 0 2px rgba(168, 85, 247, 0.2)` | Same |
| Placeholder | `hsl(215 20% 45%)` | `hsl(215 16% 60%)` |

### Header/Navigation

- Position: Fixed top
- Background: Glassmorphism (`backdrop-blur-md`)
- Dark: `rgba(10, 13, 20, 0.8)` with purple border bottom
- Light: `rgba(255, 255, 255, 0.8)` with gray border bottom
- Height: `64px`
- Z-index: `50`

## Tailwind Configuration Extensions

```typescript
// tailwind.config.ts additions
{
  theme: {
    extend: {
      colors: {
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
            800: '#1e293b',
            900: '#0f172a',
            950: '#0a0d14',
          }
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient': 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(120, 119, 198, 0.3), transparent)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    }
  }
}
```



## Component Implementation Details

### ThemeProvider Implementation

```tsx
// src/components/theme/ThemeProvider.tsx
import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'dark' | 'light';
}

const ThemeContext = createContext<ThemeProviderState | undefined>(undefined);

export function ThemeProvider({ 
  children, 
  defaultTheme = 'system',
  storageKey = 'examai-theme' 
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem(storageKey) as Theme) || defaultTheme;
    }
    return defaultTheme;
  });

  const resolvedTheme = theme === 'system' 
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme;

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme);
    localStorage.setItem(storageKey, theme);
  }, [theme, resolvedTheme, storageKey]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
```

### ThemeToggle Implementation

```tsx
// src/components/theme/ThemeToggle.tsx
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from './ThemeProvider';

export function ThemeToggle({ className, size = 'md' }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-9 w-9',
    lg: 'h-10 w-10'
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(sizeClasses[size], className)}
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
```

### Enhanced Card Component

```tsx
// src/components/ui/card.tsx (enhanced)
interface ExamAICardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'gradient' | 'glass' | 'feature';
  interactive?: boolean;
}

const cardVariants = {
  default: 'bg-card border border-border',
  gradient: 'bg-gradient-to-br from-purple-500/10 to-violet-500/5 border border-purple-500/20',
  glass: 'bg-glass-bg backdrop-blur-md border border-glass-border',
  feature: 'bg-card border border-border hover:border-purple-500/40 transition-colors'
};

export function ExamAICard({ 
  variant = 'default', 
  interactive = false,
  className,
  children,
  ...props 
}: ExamAICardProps) {
  return (
    <div
      className={cn(
        'rounded-xl p-6',
        cardVariants[variant],
        interactive && 'cursor-pointer hover:bg-card-hover transition-colors',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
```

### Feature Card for Dashboard

```tsx
// src/components/dashboard/FeatureCard.tsx
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  illustration?: React.ReactNode;
  href?: string;
  gradient?: 'purple' | 'blue' | 'green' | 'amber' | 'none';
}

const gradientClasses = {
  purple: 'from-purple-500/20 to-violet-500/10',
  blue: 'from-blue-500/20 to-cyan-500/10',
  green: 'from-green-500/20 to-emerald-500/10',
  amber: 'from-amber-500/20 to-orange-500/10',
  none: ''
};

export function FeatureCard({ 
  icon, 
  title, 
  description, 
  illustration,
  href,
  gradient = 'none' 
}: FeatureCardProps) {
  const Wrapper = href ? Link : 'div';
  
  return (
    <Wrapper
      href={href}
      className={cn(
        'group relative overflow-hidden rounded-xl border border-border bg-card p-6',
        'hover:border-purple-500/40 transition-all duration-200',
        gradient !== 'none' && `bg-gradient-to-br ${gradientClasses[gradient]}`
      )}
    >
      {illustration && (
        <div className="mb-4 h-24 flex items-center justify-center">
          {illustration}
        </div>
      )}
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 p-2 rounded-lg bg-purple-500/10 text-purple-500">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
      </div>
    </Wrapper>
  );
}
```

### Support Chat Widget

```tsx
// src/components/support/SupportChat.tsx
interface SupportChatProps {
  isOnline?: boolean;
}

export function SupportChat({ isOnline = true }: SupportChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-6 right-6 z-50',
          'h-14 w-14 rounded-full',
          'bg-purple-500 hover:bg-purple-600',
          'flex items-center justify-center',
          'shadow-lg shadow-purple-500/25',
          'transition-all duration-200'
        )}
        aria-label="Open support chat"
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className={cn(
          'fixed bottom-24 right-6 z-50',
          'w-80 rounded-xl overflow-hidden',
          'bg-card border border-border',
          'shadow-xl shadow-black/20'
        )}>
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <GraduationCap className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold">Support Chat</h3>
                <p className="text-xs text-muted-foreground">
                  Ask me anything about the platform
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn(
                'px-2 py-0.5 rounded-full text-xs font-medium',
                isOnline 
                  ? 'bg-green-500/10 text-green-500' 
                  : 'bg-gray-500/10 text-gray-500'
              )}>
                {isOnline ? '● Online' : '○ Offline'}
              </span>
              <button onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="h-64 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <ChatMessage key={i} message={msg} />
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="relative">
              <input
                type="text"
                placeholder="Type your question..."
                className={cn(
                  'w-full px-4 py-3 rounded-lg',
                  'bg-background border border-border',
                  'focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20',
                  'outline-none transition-all'
                )}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              ✨ Powered by ExamAI Support
            </p>
          </div>
        </div>
      )}
    </>
  );
}
```

## Error Handling

| Error Scenario | Handling Strategy |
|----------------|-------------------|
| localStorage unavailable | Fall back to in-memory state, default to system preference |
| Invalid theme value in storage | Reset to default theme, clear corrupted value |
| System preference detection fails | Default to dark mode |
| CSS variable not defined | Provide fallback values in Tailwind config |
| Component renders before hydration | Use CSS-only initial state to prevent flash |

## Testing Strategy

### Unit Tests
- Theme context provides correct values
- Theme toggle switches between modes
- localStorage persistence works correctly
- System preference detection functions
- Color contrast validation for accessibility

### Property-Based Tests
- Theme state consistency across components
- CSS variable application correctness
- Accessibility compliance verification



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Theme Persistence Round-Trip

*For any* valid theme value ('light' or 'dark'), setting the theme and then reading from localStorage should return the same theme value that was set.

**Validates: Requirements 1.1, 1.2**

### Property 2: Theme Toggle Inversion

*For any* current theme state, clicking the theme toggle should result in the opposite theme state (light → dark, dark → light).

**Validates: Requirements 2.2**

### Property 3: Theme Icon Consistency

*For any* theme state, the Theme_Toggle component should display the sun icon when in dark mode and the moon icon when in light mode.

**Validates: Requirements 2.1**

### Property 4: Document Root Class Application

*For any* theme value, when the theme is set, the document root element should have exactly that theme value as a class (either 'dark' or 'light', not both).

**Validates: Requirements 1.4**

### Property 5: WCAG Contrast Compliance

*For any* text color and background color combination defined in the Design_System, the contrast ratio should be at least 4.5:1 for normal text (WCAG AA compliance).

**Validates: Requirements 3.4, 4.3**

### Property 6: Card Variant Styling Consistency

*For any* card variant ('default', 'gradient', 'glass', 'feature'), the rendered card should include the CSS classes specific to that variant.

**Validates: Requirements 6.1, 6.2, 6.3, 6.5**

### Property 7: Button State Styling

*For any* button variant and state combination (default, hover, disabled, focus), the button should render with the appropriate styling classes for that combination.

**Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5, 8.6**

