import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sun, Calendar, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Footer from "@/components/Footer";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: "tips" | "tutorials" | "updates" | "case-studies";
  date: string;
  readTime: string;
  featured?: boolean;
  image?: string;
}

const BLOG_POSTS: BlogPost[] = [
  {
    id: "1",
    title: "5 Dicas para Criar Planos de Aula Mais Engajantes",
    excerpt: "Descubra como usar a IA do Educa Sol para criar planos de aula que capturam a atenção dos alunos e promovem aprendizado ativo.",
    category: "tips",
    date: "2026-01-02",
    readTime: "5 min",
    featured: true
  },
  {
    id: "2",
    title: "Tutorial: Correção Automática de Provas Passo a Passo",
    excerpt: "Aprenda a configurar e usar o sistema de correção automática de provas do Educa Sol, desde a impressão até a análise de resultados.",
    category: "tutorials",
    date: "2025-12-28",
    readTime: "8 min"
  },
  {
    id: "3",
    title: "Novidades de Janeiro: Novos Recursos e Melhorias",
    excerpt: "Confira as últimas atualizações do Educa Sol, incluindo novos tipos de atividades, melhorias na IA e muito mais.",
    category: "updates",
    date: "2025-12-20",
    readTime: "3 min"
  },
  {
    id: "4",
    title: "Como a Escola Municipal de São Paulo Economizou 10 Horas por Semana",
    excerpt: "Estudo de caso mostrando como professores da rede municipal reduziram drasticamente o tempo de planejamento usando o Educa Sol.",
    category: "case-studies",
    date: "2025-12-15",
    readTime: "6 min",
    featured: true
  },
  {
    id: "5",
    title: "Entendendo a BNCC: Guia Prático para Educadores",
    excerpt: "Um guia completo sobre como alinhar suas aulas às competências e habilidades da Base Nacional Comum Curricular.",
    category: "tutorials",
    date: "2025-12-10",
    readTime: "10 min"
  },
  {
    id: "6",
    title: "Diferenciação de Conteúdo: Atendendo Todos os Alunos",
    excerpt: "Aprenda a usar o recurso de diferenciação do Educa Sol para criar materiais adaptados a diferentes níveis de aprendizado.",
    category: "tips",
    date: "2025-12-05",
    readTime: "7 min"
  }
];

const CATEGORIES = [
  { id: "all", name: "Todos" },
  { id: "tips", name: "Dicas" },
  { id: "tutorials", name: "Tutoriais" },
  { id: "updates", name: "Atualizações" },
  { id: "case-studies", name: "Casos de Sucesso" }
];

const getCategoryColor = (category: string) => {
  switch (category) {
    case "tips":
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
    case "tutorials":
      return "bg-purple-500/10 text-purple-600 dark:text-purple-400";
    case "updates":
      return "bg-green-500/10 text-green-600 dark:text-green-400";
    case "case-studies":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getCategoryName = (category: string) => {
  switch (category) {
    case "tips":
      return "Dicas";
    case "tutorials":
      return "Tutoriais";
    case "updates":
      return "Atualizações";
    case "case-studies":
      return "Casos de Sucesso";
    default:
      return category;
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
};

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const navigate = useNavigate();

  const filteredPosts = selectedCategory === "all"
    ? BLOG_POSTS
    : BLOG_POSTS.filter(post => post.category === selectedCategory);

  const featuredPost = BLOG_POSTS.find(post => post.featured);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center">
                <Sun className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-lg">Educa Sol</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/docs">
                <Button variant="ghost" size="sm">Documentação</Button>
              </Link>
              <Link to="/auth">
                <Button size="sm">Entrar</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Blog Educa Sol</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Dicas, tutoriais e novidades para educadores que querem transformar suas aulas
          </p>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && selectedCategory === "all" && (
        <section className="py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="overflow-hidden bg-gradient-to-br from-primary/5 to-background border-primary/20">
              <div className="grid md:grid-cols-2 gap-6 p-6">
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <Sun className="h-16 w-16 text-primary/30" />
                </div>
                <div className="flex flex-col justify-center">
                  <Badge className={`w-fit mb-4 ${getCategoryColor(featuredPost.category)}`}>
                    {getCategoryName(featuredPost.category)}
                  </Badge>
                  <h2 className="text-2xl font-bold mb-3">{featuredPost.title}</h2>
                  <p className="text-muted-foreground mb-4">{featuredPost.excerpt}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(featuredPost.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {featuredPost.readTime}
                    </span>
                  </div>
                  <Button className="w-fit" onClick={() => navigate(`/blog/${featuredPost.id}`)}>
                    Ler Artigo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </section>
      )}

      {/* Category Filter */}
      <section className="py-8 border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <Card 
                key={post.id} 
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/blog/${post.id}`)}
              >
                <div className="aspect-video bg-muted flex items-center justify-center">
                  <Sun className="h-12 w-12 text-primary/20" />
                </div>
                <CardHeader className="pb-2">
                  <Badge className={`w-fit ${getCategoryColor(post.category)}`}>
                    {getCategoryName(post.category)}
                  </Badge>
                </CardHeader>
                <CardContent className="pb-2">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">{post.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
                </CardContent>
                <CardFooter className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(post.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.readTime}
                    </span>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                Nenhum artigo encontrado nesta categoria.
              </p>
              <Button variant="outline" onClick={() => setSelectedCategory("all")}>
                Ver todos os artigos
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Receba Novidades por Email</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Inscreva-se para receber dicas, tutoriais e atualizações diretamente no seu email.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="seu@email.com"
              className="flex-1 px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button>Inscrever</Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
