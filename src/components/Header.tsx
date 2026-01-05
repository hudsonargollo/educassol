import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme";
import { Sun, LogOut, Users, GraduationCap, Search, Menu, X, Calendar, BarChart2, Settings, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion } from "framer-motion";

interface HeaderProps {
  /** User object with email property, if logged in */
  user?: { email?: string } | null;
  /** Callback for sign out action */
  onSignOut?: () => void;
  /** Whether to show the full navigation (for authenticated pages) */
  showNav?: boolean;
  /** Whether to show auth buttons (for landing page) */
  showAuthButtons?: boolean;
  /** Custom className for the header */
  className?: string;
}

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
}

function NavLink({ to, children, icon, isActive, onClick }: NavLinkProps) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
        "hover:bg-primary/10 hover:text-primary",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isActive 
          ? "bg-primary/10 text-primary" 
          : "text-foreground/70 dark:text-muted-foreground"
      )}
    >
      {icon}
      {children}
    </Link>
  );
}

export function Header({ 
  user, 
  onSignOut, 
  showNav = false, 
  showAuthButtons = false,
  className 
}: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { to: "/dashboard", label: "Início", icon: <Home className="h-4 w-4" /> },
    { to: "/planner", label: "Planejador", icon: <Calendar className="h-4 w-4" /> },
    { to: "/classes", label: "Turmas", icon: <Users className="h-4 w-4" /> },
    { to: "/assessments", label: "Avaliações", icon: <GraduationCap className="h-4 w-4" /> },
    { to: "/usage", label: "Uso", icon: <BarChart2 className="h-4 w-4" /> },
    { to: "/settings", label: "Config", icon: <Settings className="h-4 w-4" /> },
  ];

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header
      className={cn(
        // Fixed positioning
        "fixed top-0 left-0 right-0 z-50",
        // Height and layout
        "h-16",
        // Border bottom with theme-aware color
        "border-b",
        // Theme-aware styling - glassmorphism effect
        "bg-white/95 dark:bg-[#0a0d14]/90 backdrop-blur-xl",
        "border-gray-200 dark:border-primary/10",
        // Shadow for depth
        "shadow-sm dark:shadow-none",
        className
      )}
    >
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo */}
        <Link 
          to={user ? "/dashboard" : "/"} 
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity group"
        >
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary to-amber-500 dark:from-primary dark:to-orange-500 shadow-md shadow-primary/20 group-hover:shadow-primary/30 transition-shadow">
            <Sun className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-foreground">EDUCA SOL</span>
        </Link>

        {/* Desktop Navigation */}
        {showNav && (
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                icon={item.icon}
                isActive={isActive(item.to)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        )}

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle - Only visible in dashboard */}
          {showNav && <ThemeToggle size="sm" />}

          {/* Auth buttons for landing page */}
          {showAuthButtons && !user && (
            <div className="hidden sm:flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/auth')}
                className="text-foreground/70 dark:text-muted-foreground hover:text-foreground hover:bg-primary/10 font-medium"
              >
                Entrar
              </Button>
              <Button
                size="sm"
                onClick={() => navigate('/auth')}
                className="bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90 text-white shadow-lg shadow-primary/25 hover:shadow-primary/35 font-semibold"
              >
                Começar Grátis
              </Button>
            </div>
          )}

          {/* User info and sign out for authenticated pages */}
          {showNav && user && (
            <div className="hidden md:flex items-center gap-3">
              <span className="text-sm text-foreground/70 dark:text-muted-foreground">{user.email}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onSignOut}
                className="text-foreground/70 dark:text-muted-foreground hover:text-primary hover:bg-primary/10"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          )}

          {/* Mobile menu button */}
          {(showNav || showAuthButtons) && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (showNav || showAuthButtons) && (
        <div 
          className={cn(
            "md:hidden absolute top-16 left-0 right-0",
            "bg-white/98 dark:bg-[#0a0d14]/98 backdrop-blur-xl",
            "border-b border-gray-200 dark:border-primary/10",
            "shadow-lg dark:shadow-none",
            "py-4 px-4"
          )}
        >
          {showNav && (
            <nav className="flex flex-col gap-1 mb-4">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  icon={item.icon}
                  isActive={isActive(item.to)}
                  onClick={closeMobileMenu}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          )}

          {showAuthButtons && !user && (
            <div className="flex flex-col gap-2 sm:hidden">
              <Button
                variant="ghost"
                onClick={() => {
                  navigate('/auth');
                  closeMobileMenu();
                }}
                className="justify-start text-foreground/70 dark:text-muted-foreground hover:text-foreground hover:bg-primary/10"
              >
                Entrar
              </Button>
              <Button
                onClick={() => {
                  navigate('/auth');
                  closeMobileMenu();
                }}
                className="bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90"
              >
                Começar Grátis
              </Button>
            </div>
          )}

          {showNav && user && (
            <div className="flex flex-col gap-2 pt-4 border-t border-gray-200 dark:border-border/50">
              <span className="text-sm text-foreground/70 dark:text-muted-foreground px-3">{user.email}</span>
              <Button 
                variant="ghost" 
                onClick={() => {
                  onSignOut?.();
                  closeMobileMenu();
                }}
                className="justify-start text-foreground/70 dark:text-muted-foreground hover:text-primary hover:bg-primary/10"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

export default Header;
