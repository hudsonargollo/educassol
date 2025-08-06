import { Sun, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-6">
          {/* Logo and Brand */}
          <div className="flex items-center justify-center gap-3">
            <div className="p-2 bg-gradient-sun rounded-lg">
              <Sun className="h-6 w-6 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-bold">EDUCA SOL</h3>
          </div>

          {/* Tagline */}
          <p className="text-background/80 max-w-md mx-auto">
            Iluminando o futuro da educação primária em Jequié com inteligência artificial.
          </p>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <a 
              href="https://educa-sol-dashboard.lovable.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-background/70 hover:text-background transition-colors"
            >
              Acessar Plataforma
            </a>
            <span className="text-background/40">•</span>
            <span className="text-background/70">Suporte</span>
            <span className="text-background/40">•</span>
            <span className="text-background/70">Política de Privacidade</span>
            <span className="text-background/40">•</span>
            <span className="text-background/70">Termos de Uso</span>
          </div>

          {/* Copyright */}
          <div className="pt-6 border-t border-background/20">
            <p className="text-sm text-background/60 flex items-center justify-center gap-2">
              © 2024 EDUCA SOL. Feito com <Heart className="h-4 w-4 text-red-400" /> para os educadores de Jequié, Cidade Sol.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;