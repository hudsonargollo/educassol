import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from './ThemeProvider';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-9 w-9',
  lg: 'h-10 w-10',
};

const iconSizes = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

export function ThemeToggle({ className, size = 'md' }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        sizeClasses[size],
        'relative',
        className
      )}
      onClick={toggleTheme}
      aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
      aria-pressed={resolvedTheme === 'dark'}
    >
      <Sun 
        className={cn(
          iconSizes[size],
          'rotate-0 scale-100 transition-all duration-300',
          'dark:-rotate-90 dark:scale-0'
        )} 
      />
      <Moon 
        className={cn(
          iconSizes[size],
          'absolute rotate-90 scale-0 transition-all duration-300',
          'dark:rotate-0 dark:scale-100'
        )} 
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
