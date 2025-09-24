import { ClipboardList, Star, CheckCircle } from "lucide-react";

const LandingV2 = () => {
  return (
    <div className="font-sans bg-gray-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg fixed top-0 left-0 right-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <a href="#" className="text-3xl font-extrabold text-gray-900">
            EDUCA<span className="text-orange-500">SOL</span>
          </a>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-orange-500 font-medium transition-colors duration-300">Funcionalidades</a>
            <a href="#how-it-works" className="text-gray-600 hover:text-orange-500 font-medium transition-colors duration-300">Como Funciona</a>
            <a href="#for-districts" className="text-gray-600 hover:text-orange-500 font-medium transition-colors duration-300">Para Gestores</a>
          </nav>
          <a href="#dashboard" className="bg-orange-500 text-white font-bold px-6 py-2.5 rounded-full hover:bg-orange-600 transition-all duration-300 transform hover:scale-105 min-h-[44px] min-w-[44px] flex items-center">
            Acessar Plataforma
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-20">
        <section className="relative bg-white overflow-hidden">
          <div className="container mx-auto px-6 py-24 md:py-32 flex flex-col md:flex-row items-center">
            {/* Left Content */}
            <div className="md:w-1/2 text-center md:text-left z-10">
              <span className="bg-orange-100 text-orange-600 font-semibold px-3 py-1 rounded-full text-sm">A REVOLUÇÃO DA IA PARA A EDUCAÇÃO DE JEQUIÉ</span>
              <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mt-4 mb-6 leading-tight">
                Planejamento Pedagógico Inteligente e Alinhado à BNCC.
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-10">
                Otimize o tempo dos seus professores e eleve a qualidade do ensino. A EDUCA SOL é a plataforma que automatiza a criação de planos de aula, atividades e avaliações.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <a href="#dashboard" className="bg-orange-500 text-white font-bold px-8 py-4 rounded-full text-lg hover:bg-orange-600 transition-all duration-300 transform hover:scale-105 shadow-lg min-h-[44px] flex items-center justify-center">
                  Ver Demonstração
                </a>
                <a href="#features" className="bg-white text-gray-700 font-bold px-8 py-4 rounded-full text-lg hover:bg-gray-100 transition-all duration-300 shadow-lg border border-gray-200 min-h-[44px] flex items-center justify-center">
                  Saber Mais
                </a>
              </div>
            </div>
            {/* Right Image */}
            <div className="md:w-1/2 mt-12 md:mt-0 flex justify-center z-10">
              <img src="https://placehold.co/600x500/FFF7ED/FF9843?text=EDUCA+SOL+Dashboard" alt="Dashboard da plataforma EDUCA SOL" className="rounded-2xl shadow-2xl max-w-full h-auto" />
            </div>
          </div>
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-orange-100 rounded-full opacity-50"></div>
          <div className="absolute top-24 -left-24 w-72 h-72 bg-yellow-100 rounded-full opacity-50"></div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-gray-50">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-gray-800 md:text-4xl text-center">A plataforma completa para a excelência pedagógica</h2>
            <p className="mt-4 text-lg text-gray-500 max-w-3xl mx-auto text-center">Nossas ferramentas foram desenhadas para eliminar o trabalho repetitivo e liberar o potencial criativo de cada professor.</p>
            
            <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature Card 1 */}
              <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border-t-4 border-orange-400">
                <div className="bg-orange-100 text-orange-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                  <ClipboardList className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Planos de Aula BNCC</h3>
                <p className="text-gray-600">Gere planos de aula completos em segundos, com objetivos, metodologia, recursos e avaliação, 100% alinhados às competências da BNCC.</p>
              </div>
              {/* Feature Card 2 */}
              <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border-t-4 border-yellow-400">
                <div className="bg-yellow-100 text-yellow-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                  <Star className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Criação de Atividades</h3>
                <p className="text-gray-600">Desenvolva atividades personalizadas, desde exercícios de fixação a projetos lúdicos, para qualquer disciplina e tópico do currículo.</p>
              </div>
              {/* Feature Card 3 */}
              <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border-t-4 border-green-400">
                <div className="bg-green-100 text-green-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Gerador de Avaliações</h3>
                <p className="text-gray-600">Elabore provas, testes e rubricas de avaliação de forma rápida e coerente com o conteúdo lecionado e as habilidades esperadas.</p>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section id="how-it-works" className="py-24 bg-white">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-gray-800 md:text-4xl text-center">Planejamento em 3 Passos Simples</h2>
            <p className="mt-4 text-lg text-gray-500 max-w-3xl mx-auto text-center">A intuição de um professor e a velocidade da inteligência artificial, juntas.</p>
            <div className="relative mt-20">
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 hidden md:block"></div>
              {/* Step 1 */}
              <div className="md:flex items-center md:space-x-8 mb-16 relative">
                <div className="md:w-1/2 flex justify-center md:justify-end md:pr-8">
                  <img src="https://placehold.co/500x350/FEF2F2/F87171?text=Passo+1" className="rounded-lg shadow-xl w-full max-w-md h-auto" alt="Passo 1: Descreva sua necessidade" />
                </div>
                <div className="md:w-1/2 mt-8 md:mt-0 md:pl-8">
                  <div className="bg-orange-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-4">1</div>
                  <h3 className="text-3xl font-bold">Descreva a Necessidade</h3>
                  <p className="mt-2 text-gray-600">Selecione o ano, a disciplina e a habilidade da BNCC. Informe o tema da aula e o tipo de material desejado (plano, atividade, etc.).</p>
                </div>
              </div>
              {/* Step 2 */}
              <div className="md:flex flex-row-reverse items-center md:space-x-8 md:space-x-reverse mb-16 relative">
                <div className="md:w-1/2 flex justify-center md:justify-start md:pl-8">
                  <img src="https://placehold.co/500x350/EFF6FF/60A5FA?text=Passo+2" className="rounded-lg shadow-xl w-full max-w-md h-auto" alt="Passo 2: A IA gera o conteúdo" />
                </div>
                <div className="md:w-1/2 mt-8 md:mt-0 md:pr-8 text-left md:text-right">
                  <div className="bg-orange-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-4 md:ml-auto">2</div>
                  <h3 className="text-3xl font-bold">Clique em Gerar</h3>
                  <p className="mt-2 text-gray-600">Nossa IA processa sua solicitação, consultando as diretrizes da BNCC e as melhores práticas pedagógicas para criar um rascunho inicial.</p>
                </div>
              </div>
              {/* Step 3 */}
              <div className="md:flex items-center md:space-x-8 relative">
                <div className="md:w-1/2 flex justify-center md:justify-end md:pr-8">
                  <img src="https://placehold.co/500x350/F0FDF4/4ADE80?text=Passo+3" className="rounded-lg shadow-xl w-full max-w-md h-auto" alt="Passo 3: Revise e utilize" />
                </div>
                <div className="md:w-1/2 mt-8 md:mt-0 md:pl-8">
                  <div className="bg-orange-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-4">3</div>
                  <h3 className="text-3xl font-bold">Revise e Utilize</h3>
                  <p className="mt-2 text-gray-600">Receba o material completo em segundos. Faça os ajustes que desejar, salve em seu painel ou exporte para usar em sala de aula.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* For Districts Section */}
        <section id="for-districts" className="py-24" style={{background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'}}>
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">Uma Ferramenta de Gestão para a Secretaria de Educação</h2>
            <p className="mt-4 text-lg text-white/80 max-w-3xl mx-auto">
              Com a EDUCA SOL, a gestão pedagógica de Jequié ganha um poderoso aliado para garantir a padronização, a qualidade e o acompanhamento do planejamento escolar em toda a rede.
            </p>
            <a href="#dashboard" className="mt-8 inline-block bg-white text-orange-500 font-bold px-8 py-4 rounded-full text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg min-h-[44px] flex items-center justify-center max-w-max mx-auto">
              Fale com um Especialista
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-6 py-12 text-center">
          <h3 className="text-2xl font-bold">EDUCA<span className="text-orange-500">SOL</span></h3>
          <p className="mt-4 text-gray-400">Transformando a educação em Jequié com tecnologia e inovação.</p>
          <p className="mt-8 text-gray-500 text-sm">&copy; 2025 EDUCA SOL. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingV2;