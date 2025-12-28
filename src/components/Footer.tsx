import { Sun } from "lucide-react";
import { EDUCASSOL_COLORS } from "@/lib/colors";

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-white py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <Sun className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">EducaSol</span>
            </div>
            <p className="text-slate-400 max-w-sm leading-relaxed">
              Plataforma de IA para educadores brasileiros. Crie planos de aula, 
              atividades e avaliações alinhados à BNCC em segundos.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Produto</h4>
            <ul className="space-y-3 text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">Funcionalidades</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Preços</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Demonstração</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Suporte</h4>
            <ul className="space-y-3 text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Termos de Uso</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            © 2025 EducaSol. Todos os direitos reservados.
          </p>
          <p className="text-sm text-slate-500">
            Feito com ❤️ para educadores brasileiros
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
