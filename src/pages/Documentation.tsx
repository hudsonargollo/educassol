import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Rocket,
  FileText,
  CheckSquare,
  Sparkles,
  CreditCard,
  Search,
  Clock,
  ArrowRight,
  BookOpen,
  Video,
  Mail,
  MessageCircle,
  Star,
  Lightbulb,
} from "lucide-react";

interface DocArticle {
  id: string;
  title: string;
  description: string;
  readTime: string;
  status: 'available' | 'coming-soon' | 'popular' | 'essential';
  category: string;
}

interface DocCategory {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  articles: DocArticle[];
}

const DOC_CATEGORIES: DocCategory[] = [
  {
    id: 'getting-started',
    name: 'Primeiros Passos',
    icon: Rocket,
    color: 'from-orange-500 to-amber-500',
    articles: [
      { id: '1', title: 'Bem-vindo ao Educa Sol', description: 'Comece a usar a plataforma de IA para educadores', readTime: '3 min', status: 'popular', category: 'getting-started' },
      { id: '2', title: 'Criando sua Primeira Aula', description: 'Passo a passo para gerar seu primeiro plano de aula', readTime: '5 min', status: 'essential', category: 'getting-started' },
      { id: '3', title: 'Entendendo a BNCC', description: 'Como o Educa Sol alinha conteúdo à Base Nacional', readTime: '4 min', status: 'available', category: 'getting-started' },
      { id: '4', title: 'Navegando pelo Dashboard', description: 'Conheça todas as funcionalidades disponíveis', readTime: '6 min', status: 'available', category: 'getting-started' },
    ],
  },
  {
    id: 'creating-content',
    name: 'Criando Conteúdo',
    icon: FileText,
    color: 'from-teal-500 to-emerald-500',
    articles: [
      { id: '5', title: 'Gerando Planos de Aula', description: 'Crie planos completos com objetivos e metodologia', readTime: '7 min', status: 'popular', category: 'creating-content' },
      { id: '6', title: 'Criando Atividades', description: 'Gere exercícios e atividades práticas', readTime: '5 min', status: 'available', category: 'creating-content' },
      { id: '7', title: 'Gerando Avaliações', description: 'Crie provas e questionários personalizados', readTime: '6 min', status: 'essential', category: 'creating-content' },
      { id: '8', title: 'Exportando Conteúdo', description: 'Baixe em PDF, DOCX ou apresentação', readTime: '3 min', status: 'available', category: 'creating-content' },
    ],
  },
  {
    id: 'grading',
    name: 'Correção',
    icon: CheckSquare,
    color: 'from-purple-500 to-violet-500',
    articles: [
      { id: '9', title: 'Correção Automática', description: 'Como funciona a correção por IA', readTime: '8 min', status: 'popular', category: 'grading' },
      { id: '10', title: 'Imprimindo com QR Code', description: 'Configure provas com identificação automática', readTime: '4 min', status: 'available', category: 'grading' },
      { id: '11', title: 'Escaneando Provas', description: 'Use scanner ou celular para digitalizar', readTime: '5 min', status: 'coming-soon', category: 'grading' },
      { id: '12', title: 'Analisando Resultados', description: 'Relatórios e insights sobre desempenho', readTime: '6 min', status: 'coming-soon', category: 'grading' },
    ],
  },
  {
    id: 'advanced',
    name: 'Recursos Avançados',
    icon: Sparkles,
    color: 'from-blue-500 to-cyan-500',
    articles: [
      { id: '13', title: 'Personalizando Conteúdo', description: 'Adapte materiais para diferentes níveis', readTime: '5 min', status: 'available', category: 'advanced' },
      { id: '14', title: 'Usando Contexto de Arquivos', description: 'Faça upload de PDFs para contextualizar', readTime: '6 min', status: 'available', category: 'advanced' },
      { id: '15', title: 'Integrações', description: 'Conecte com Google Classroom e outros LMS', readTime: '7 min', status: 'coming-soon', category: 'advanced' },
      { id: '16', title: 'API para Desenvolvedores', description: 'Integre o Educa Sol em seus sistemas', readTime: '10 min', status: 'coming-soon', category: 'advanced' },
    ],
  },
  {
    id: 'account',
    name: 'Conta e Cobrança',
    icon: CreditCard,
    color: 'from-amber-500 to-orange-500',
    articles: [
      { id: '17', title: 'Gerenciando sua Conta', description: 'Atualize perfil e preferências', readTime: '3 min', status: 'available', category: 'account' },
      { id: '18', title: 'Planos e Preços', description: 'Compare os planos disponíveis', readTime: '4 min', status: 'essential', category: 'account' },
      { id: '19', title: 'Assinatura Premium', description: 'Como assinar e gerenciar seu plano', readTime: '5 min', status: 'available', category: 'account' },
      { id: '20', title: 'Cancelamento e Reembolso', description: 'Política de cancelamento', readTime: '3 min', status: 'available', category: 'account' },
    ],
  },
];

function getStatusBadge(status: DocArticle['status']) {
  switch (status) {
    case 'popular':
      return <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30"><Star className="h-3 w-3 mr-1" />Popular</Badge>;
    case 'essential':
      return <Badge className="bg-purple-500/20 text-purple-500 border-purple-500/30"><Lightbulb className="h-3 w-3 mr-1" />Essencial</Badge>;
    case 'coming-soon':
      return <Badge variant="secondary">Em breve</Badge>;
    default:
      return null;
  }
}

function ArticleCard({ article }: { article: DocArticle }) {
  const isComingSoon = article.status === 'coming-soon';
  
  return (
    <motion.div
      whileHover={!isComingSoon ? { y: -4 } : {}}
      className={`group ${isComingSoon ? 'opacity-60' : ''}`}
    >
      <Card className={`h-full border-border hover:border-primary/30 transition-all ${isComingSoon ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <h4 className={`font-semibold text-foreground ${!isComingSoon && 'group-hover:text-primary'} transition-colors`}>
              {article.title}
            </h4>
            {!isComingSoon && (
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-4">{article.description}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {article.readTime}
            </div>
            {getStatusBadge(article.status)}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function Documentation() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('getting-started');

  // Filter articles by search term
  const filteredCategories = DOC_CATEGORIES.map(category => ({
    ...category,
    articles: category.articles.filter(article =>
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.description.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  })).filter(category => searchTerm === '' || category.articles.length > 0);

  const activeArticles = searchTerm 
    ? filteredCategories.flatMap(c => c.articles)
    : DOC_CATEGORIES.find(c => c.id === activeCategory)?.articles || [];

  return (
    <div className="min-h-screen bg-background">
      <Header showAuthButtons={true} />
      
      <main className="pt-20">
        {/* Hero */}
        <section className="py-16 bg-gradient-to-b from-muted/50 to-background dark:from-[#0c1018] dark:to-[#0a0d14]">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-2xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <BookOpen className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Central de Ajuda</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Documentação
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Guias completos e tutoriais para aproveitar ao máximo o Educa Sol
              </p>
              
              {/* Search */}
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Buscar na documentação..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 bg-card border-border"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar - Categories */}
              {!searchTerm && (
                <aside className="lg:w-64 flex-shrink-0">
                  <nav className="sticky top-24 space-y-2">
                    {DOC_CATEGORIES.map((category) => {
                      const Icon = category.icon;
                      const isActive = activeCategory === category.id;
                      
                      return (
                        <button
                          key={category.id}
                          onClick={() => setActiveCategory(category.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                            isActive 
                              ? 'bg-primary/10 text-primary' 
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          }`}
                        >
                          <div className={`p-2 rounded-lg bg-gradient-to-br ${category.color}`}>
                            <Icon className="h-4 w-4 text-white" />
                          </div>
                          <span className="font-medium">{category.name}</span>
                          <span className="ml-auto text-xs bg-muted px-2 py-0.5 rounded-full">
                            {category.articles.length}
                          </span>
                        </button>
                      );
                    })}
                  </nav>
                </aside>
              )}

              {/* Articles Grid */}
              <div className="flex-1">
                {searchTerm && (
                  <p className="text-sm text-muted-foreground mb-6">
                    {activeArticles.length} resultado(s) para "{searchTerm}"
                  </p>
                )}
                
                <div className="grid sm:grid-cols-2 gap-4">
                  {activeArticles.map((article, i) => (
                    <motion.div
                      key={article.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <ArticleCard article={article} />
                    </motion.div>
                  ))}
                </div>

                {activeArticles.length === 0 && (
                  <div className="text-center py-12">
                    <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum resultado encontrado</h3>
                    <p className="text-muted-foreground">Tente buscar por outros termos</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Need More Help */}
        <section className="py-16 bg-gradient-to-b from-background to-muted/30 dark:from-[#0a0d14] dark:to-[#0c1018]">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto text-center"
            >
              <div className="inline-flex p-4 rounded-full bg-primary/10 mb-6">
                <Lightbulb className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Precisa de Mais Ajuda?
              </h2>
              <p className="text-muted-foreground mb-8">
                Não encontrou o que procurava? Nossa equipe está pronta para ajudar.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Button variant="outline" className="gap-2" asChild>
                  <a href="mailto:suporte@educasol.com.br">
                    <Mail className="h-4 w-4" />
                    suporte@educasol.com.br
                  </a>
                </Button>
                <Button className="gap-2 bg-gradient-to-r from-primary to-amber-500" asChild>
                  <a href="/help">
                    <BookOpen className="h-4 w-4" />
                    Central de Ajuda
                  </a>
                </Button>
                <Button variant="outline" className="gap-2">
                  <Video className="h-4 w-4" />
                  Tutoriais em Vídeo
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Horário de atendimento: Segunda a Sexta, 9h às 18h (horário de Brasília)
              </p>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
