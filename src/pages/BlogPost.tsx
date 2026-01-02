import { Link, useParams, useNavigate } from "react-router-dom";
import { Sun, Calendar, Clock, ArrowLeft, Share2, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Footer from "@/components/Footer";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: "tips" | "tutorials" | "updates" | "case-studies";
  date: string;
  readTime: string;
  featured?: boolean;
  author: string;
}

const BLOG_POSTS: BlogPost[] = [
  {
    id: "1",
    title: "5 Dicas para Criar Planos de Aula Mais Engajantes",
    excerpt: "Descubra como usar a IA do Educa Sol para criar planos de aula que capturam a atenção dos alunos e promovem aprendizado ativo.",
    content: `
      <p>Criar planos de aula engajantes é um dos maiores desafios enfrentados pelos educadores. Com a ajuda da inteligência artificial do Educa Sol, esse processo pode se tornar muito mais simples e eficiente.</p>
      
      <h2>1. Comece com Objetivos Claros</h2>
      <p>Antes de gerar qualquer conteúdo, defina claramente o que você quer que seus alunos aprendam. O Educa Sol usa esses objetivos para criar atividades alinhadas às suas metas pedagógicas.</p>
      
      <h2>2. Use a Diferenciação de Conteúdo</h2>
      <p>Nem todos os alunos aprendem da mesma forma. Utilize o recurso de diferenciação para criar versões adaptadas do mesmo conteúdo para diferentes níveis de aprendizado.</p>
      
      <h2>3. Incorpore Atividades Interativas</h2>
      <p>O Educa Sol pode gerar quizzes, jogos e atividades práticas que mantêm os alunos engajados durante toda a aula.</p>
      
      <h2>4. Alinhe com a BNCC</h2>
      <p>Use o seletor de competências da BNCC para garantir que suas aulas estejam alinhadas com os padrões nacionais de educação.</p>
      
      <h2>5. Revise e Personalize</h2>
      <p>A IA é uma ferramenta poderosa, mas sua experiência como educador é insubstituível. Sempre revise e personalize o conteúdo gerado para atender às necessidades específicas da sua turma.</p>
    `,
    category: "tips",
    date: "2026-01-02",
    readTime: "5 min",
    featured: true,
    author: "Equipe Educa Sol"
  },
  {
    id: "2",
    title: "Tutorial: Correção Automática de Provas Passo a Passo",
    excerpt: "Aprenda a configurar e usar o sistema de correção automática de provas do Educa Sol, desde a impressão até a análise de resultados.",
    content: `
      <p>O sistema de correção automática do Educa Sol revoluciona a forma como você avalia seus alunos. Siga este guia passo a passo para começar.</p>
      
      <h2>Passo 1: Crie sua Prova</h2>
      <p>Acesse o módulo de avaliações e crie uma nova prova. Você pode usar questões geradas pela IA ou adicionar suas próprias.</p>
      
      <h2>Passo 2: Configure o QR Code</h2>
      <p>Cada prova gerada inclui um QR code único que identifica o aluno e a avaliação. Isso permite a correção automática sem necessidade de identificação manual.</p>
      
      <h2>Passo 3: Imprima e Aplique</h2>
      <p>Imprima as provas e aplique normalmente. Os alunos respondem no próprio papel.</p>
      
      <h2>Passo 4: Escaneie as Respostas</h2>
      <p>Use um scanner ou a câmera do seu celular para digitalizar as provas respondidas. O sistema aceita múltiplos formatos de imagem.</p>
      
      <h2>Passo 5: Análise Automática</h2>
      <p>A IA analisa as respostas, reconhece a escrita manual e atribui notas baseadas na rubrica configurada.</p>
      
      <h2>Passo 6: Revise e Publique</h2>
      <p>Revise as correções, faça ajustes se necessário, e publique os resultados para os alunos.</p>
    `,
    category: "tutorials",
    date: "2025-12-28",
    readTime: "8 min",
    author: "Equipe Educa Sol"
  },
  {
    id: "3",
    title: "Novidades de Janeiro: Novos Recursos e Melhorias",
    excerpt: "Confira as últimas atualizações do Educa Sol, incluindo novos tipos de atividades, melhorias na IA e muito mais.",
    content: `
      <p>Começamos 2026 com muitas novidades! Confira o que há de novo no Educa Sol.</p>
      
      <h2>Novos Tipos de Atividades</h2>
      <p>Adicionamos suporte para criação de caça-palavras, palavras cruzadas e jogos de associação. Perfeitos para tornar o aprendizado mais divertido!</p>
      
      <h2>Melhorias na IA de Correção</h2>
      <p>Nossa IA de reconhecimento de escrita foi aprimorada, com 30% mais precisão na leitura de respostas manuscritas.</p>
      
      <h2>Novo Dashboard de Análise</h2>
      <p>Visualize o desempenho da sua turma com gráficos interativos e relatórios detalhados.</p>
      
      <h2>Integração com Google Classroom</h2>
      <p>Agora você pode sincronizar suas turmas e atividades diretamente com o Google Classroom.</p>
    `,
    category: "updates",
    date: "2025-12-20",
    readTime: "3 min",
    author: "Equipe Educa Sol"
  },
  {
    id: "4",
    title: "Como a Escola Municipal de São Paulo Economizou 10 Horas por Semana",
    excerpt: "Estudo de caso mostrando como professores da rede municipal reduziram drasticamente o tempo de planejamento usando o Educa Sol.",
    content: `
      <p>A Escola Municipal Professor João da Silva, localizada na zona leste de São Paulo, implementou o Educa Sol em agosto de 2025. Os resultados foram impressionantes.</p>
      
      <h2>O Desafio</h2>
      <p>Com 45 professores atendendo mais de 1.200 alunos, o tempo gasto em planejamento e correção era um problema constante. Muitos professores relatavam trabalhar nos fins de semana para dar conta das demandas.</p>
      
      <h2>A Solução</h2>
      <p>Após a implementação do Educa Sol, os professores passaram a usar a IA para gerar planos de aula, atividades diferenciadas e corrigir provas automaticamente.</p>
      
      <h2>Os Resultados</h2>
      <p>Em média, cada professor economizou 10 horas por semana. Esse tempo foi reinvestido em atendimento individualizado aos alunos e desenvolvimento profissional.</p>
      
      <h2>Depoimento</h2>
      <p>"O Educa Sol transformou minha rotina. Agora tenho tempo para realmente ensinar, em vez de ficar preso em tarefas administrativas." - Maria Santos, professora de Matemática</p>
    `,
    category: "case-studies",
    date: "2025-12-15",
    readTime: "6 min",
    featured: true,
    author: "Equipe Educa Sol"
  },
  {
    id: "5",
    title: "Entendendo a BNCC: Guia Prático para Educadores",
    excerpt: "Um guia completo sobre como alinhar suas aulas às competências e habilidades da Base Nacional Comum Curricular.",
    content: `
      <p>A Base Nacional Comum Curricular (BNCC) é o documento que define as aprendizagens essenciais que todos os alunos devem desenvolver ao longo da Educação Básica.</p>
      
      <h2>O que é a BNCC?</h2>
      <p>A BNCC estabelece conhecimentos, competências e habilidades que se espera que todos os estudantes desenvolvam ao longo da escolaridade básica.</p>
      
      <h2>Como o Educa Sol Ajuda</h2>
      <p>O Educa Sol possui um banco de dados completo com todas as competências e habilidades da BNCC. Ao criar um plano de aula, você pode selecionar as habilidades que deseja trabalhar.</p>
      
      <h2>Dicas Práticas</h2>
      <p>1. Comece identificando as habilidades prioritárias para sua turma</p>
      <p>2. Use o filtro por área de conhecimento para encontrar habilidades relevantes</p>
      <p>3. Combine múltiplas habilidades em uma única atividade interdisciplinar</p>
      <p>4. Acompanhe o progresso dos alunos em cada habilidade ao longo do ano</p>
    `,
    category: "tutorials",
    date: "2025-12-10",
    readTime: "10 min",
    author: "Equipe Educa Sol"
  },
  {
    id: "6",
    title: "Diferenciação de Conteúdo: Atendendo Todos os Alunos",
    excerpt: "Aprenda a usar o recurso de diferenciação do Educa Sol para criar materiais adaptados a diferentes níveis de aprendizado.",
    content: `
      <p>Cada aluno aprende de forma diferente. O recurso de diferenciação do Educa Sol permite criar versões adaptadas do mesmo conteúdo para atender às necessidades individuais.</p>
      
      <h2>O que é Diferenciação?</h2>
      <p>Diferenciação é a prática de adaptar o ensino para atender às diferentes necessidades, interesses e habilidades dos alunos.</p>
      
      <h2>Como Funciona no Educa Sol</h2>
      <p>Ao gerar qualquer conteúdo, você pode solicitar versões diferenciadas para diferentes níveis: básico, intermediário e avançado.</p>
      
      <h2>Exemplos Práticos</h2>
      <p>- Textos de leitura com vocabulário simplificado ou enriquecido</p>
      <p>- Exercícios com diferentes níveis de complexidade</p>
      <p>- Atividades com mais ou menos suporte visual</p>
      
      <h2>Benefícios</h2>
      <p>A diferenciação permite que todos os alunos acessem o mesmo conteúdo curricular, cada um no seu ritmo e nível de compreensão.</p>
    `,
    category: "tips",
    date: "2025-12-05",
    readTime: "7 min",
    author: "Equipe Educa Sol"
  }
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

const BlogPostPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const post = BLOG_POSTS.find(p => p.id === id);
  
  // Get related posts (same category, excluding current)
  const relatedPosts = post 
    ? BLOG_POSTS.filter(p => p.category === post.category && p.id !== post.id).slice(0, 2)
    : [];

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Artigo não encontrado</h1>
          <p className="text-muted-foreground mb-6">O artigo que você procura não existe ou foi removido.</p>
          <Button onClick={() => navigate("/blog")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Blog
          </Button>
        </div>
      </div>
    );
  }

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
              <Link to="/blog">
                <Button variant="ghost" size="sm">Blog</Button>
              </Link>
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

      {/* Article Content */}
      <article className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="mb-6"
            onClick={() => navigate("/blog")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Blog
          </Button>

          {/* Article Header */}
          <header className="mb-8">
            <Badge className={`mb-4 ${getCategoryColor(post.category)}`}>
              {getCategoryName(post.category)}
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
            <p className="text-xl text-muted-foreground mb-6">{post.excerpt}</p>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(post.date)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {post.readTime} de leitura
              </span>
              <span>Por {post.author}</span>
            </div>
          </header>

          {/* Featured Image Placeholder */}
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-8">
            <Sun className="h-20 w-20 text-primary/20" />
          </div>

          {/* Article Body */}
          <div 
            className="prose prose-lg dark:prose-invert max-w-none mb-12"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Share and Save Actions */}
          <div className="flex items-center gap-4 py-6 border-t border-b border-border mb-12">
            <Button variant="outline" size="sm">
              <Share2 className="mr-2 h-4 w-4" />
              Compartilhar
            </Button>
            <Button variant="outline" size="sm">
              <Bookmark className="mr-2 h-4 w-4" />
              Salvar
            </Button>
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6">Artigos Relacionados</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Card 
                    key={relatedPost.id} 
                    className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate(`/blog/${relatedPost.id}`)}
                  >
                    <div className="aspect-video bg-muted flex items-center justify-center">
                      <Sun className="h-12 w-12 text-primary/20" />
                    </div>
                    <CardHeader className="pb-2">
                      <Badge className={`w-fit ${getCategoryColor(relatedPost.category)}`}>
                        {getCategoryName(relatedPost.category)}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">{relatedPost.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{relatedPost.excerpt}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>
      </article>

      {/* CTA Section */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Pronto para Transformar suas Aulas?</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Experimente o Educa Sol gratuitamente e descubra como a IA pode ajudar você a criar conteúdo educacional de qualidade.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/auth">
              <Button size="lg">Começar Gratuitamente</Button>
            </Link>
            <Link to="/docs">
              <Button variant="outline" size="lg">Ver Documentação</Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BlogPostPage;
