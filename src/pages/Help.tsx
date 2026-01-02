import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Search,
  Mail,
  MessageCircle,
  BookOpen,
  Sparkles,
  CreditCard,
  Settings,
  HelpCircle,
  ArrowRight,
  Phone,
  Clock,
} from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  faqs: FAQItem[];
}

const FAQ_CATEGORIES: FAQCategory[] = [
  {
    id: "getting-started",
    name: "Primeiros Passos",
    icon: BookOpen,
    color: "from-orange-500 to-amber-500",
    faqs: [
      {
        question: "Como criar minha conta no Educa Sol?",
        answer: "Clique em 'Criar Conta' no canto superior direito da página. Você pode se cadastrar usando seu email ou conta Google. Após o cadastro, você terá acesso imediato ao plano gratuito com 5 gerações por mês."
      },
      {
        question: "O Educa Sol é gratuito?",
        answer: "Sim! Oferecemos um plano gratuito com 5 gerações por mês. Para uso ilimitado e recursos avançados como correção automática de provas, oferecemos planos pagos a partir de R$ 29,90/mês."
      },
      {
        question: "Preciso instalar algum software?",
        answer: "Não! O Educa Sol funciona 100% no navegador. Basta acessar nosso site e fazer login para começar a usar. Funciona em qualquer dispositivo com acesso à internet."
      },
      {
        question: "Quais navegadores são compatíveis?",
        answer: "O Educa Sol funciona em todos os navegadores modernos: Chrome, Firefox, Safari, Edge. Recomendamos manter seu navegador atualizado para a melhor experiência."
      }
    ]
  },
  {
    id: "content-creation",
    name: "Criação de Conteúdo",
    icon: Sparkles,
    color: "from-teal-500 to-emerald-500",
    faqs: [
      {
        question: "Como gerar um plano de aula?",
        answer: "No Dashboard, clique em 'Novo Conteúdo' e selecione 'Plano de Aula'. Preencha o tema, série, disciplina e objetivos. Nossa IA gerará um plano completo alinhado à BNCC em segundos."
      },
      {
        question: "Posso editar o conteúdo gerado?",
        answer: "Sim! Todo conteúdo gerado pode ser editado livremente. Você também pode usar o recurso de 'Refinar' para pedir ajustes específicos à IA, como simplificar a linguagem ou adicionar mais exemplos."
      },
      {
        question: "Os conteúdos são alinhados à BNCC?",
        answer: "Sim! Todos os conteúdos são automaticamente alinhados às competências e habilidades da Base Nacional Comum Curricular (BNCC). Você pode ver os códigos BNCC relacionados em cada material gerado."
      },
      {
        question: "Quais tipos de conteúdo posso criar?",
        answer: "Você pode criar planos de aula, atividades, avaliações, apresentações de slides, textos nivelados para leitura, e muito mais. Todos adaptados para a série e disciplina que você escolher."
      },
      {
        question: "Como exportar meus materiais?",
        answer: "Clique no botão 'Exportar' em qualquer conteúdo gerado. Você pode baixar em PDF, DOCX (Word), ou formato de apresentação (PPTX). Todos os formatos mantêm a formatação profissional."
      }
    ]
  },
  {
    id: "grading",
    name: "Correção de Provas",
    icon: Settings,
    color: "from-purple-500 to-violet-500",
    faqs: [
      {
        question: "Como funciona a correção automática?",
        answer: "Imprima suas provas com QR Code único gerado pelo sistema, escaneie as respostas dos alunos usando scanner ou celular, e nossa IA analisa as respostas manuscritas, fornecendo notas e feedback detalhado automaticamente."
      },
      {
        question: "A IA consegue ler letra cursiva?",
        answer: "Sim! Nossa tecnologia de reconhecimento de escrita foi treinada com milhares de amostras de caligrafia brasileira, incluindo letra cursiva e de forma. A precisão é superior a 95% em condições normais."
      },
      {
        question: "Posso revisar as notas dadas pela IA?",
        answer: "Absolutamente! Você tem controle total sobre as notas finais. Pode ajustar qualquer nota, adicionar comentários personalizados e sobrescrever a avaliação da IA quando necessário."
      },
      {
        question: "Como imprimir provas com QR Code?",
        answer: "Ao criar uma avaliação, selecione a opção 'Gerar com QR Code'. O sistema criará um código único para cada aluno, permitindo identificação automática ao escanear as provas respondidas."
      },
      {
        question: "Qual a qualidade mínima do escaneamento?",
        answer: "Recomendamos escaneamento em 300 DPI ou superior. Fotos de celular também funcionam, desde que a imagem esteja bem iluminada e sem sombras. O sistema avisa se a qualidade estiver baixa."
      }
    ]
  },
  {
    id: "billing",
    name: "Conta e Cobrança",
    icon: CreditCard,
    color: "from-amber-500 to-orange-500",
    faqs: [
      {
        question: "Quais formas de pagamento são aceitas?",
        answer: "Aceitamos cartão de crédito, débito, PIX e boleto bancário através do Mercado Pago. Todas as transações são seguras e criptografadas."
      },
      {
        question: "Como cancelar minha assinatura?",
        answer: "Você pode cancelar a qualquer momento em Configurações > Assinatura > Cancelar Plano. O acesso premium continua até o fim do período já pago, sem cobranças adicionais."
      },
      {
        question: "Existe reembolso?",
        answer: "Oferecemos reembolso integral nos primeiros 7 dias após a assinatura, sem perguntas. Basta entrar em contato com nosso suporte."
      },
      {
        question: "Como mudar meu plano?",
        answer: "Acesse Configurações > Assinatura e clique em 'Alterar Plano'. Você pode fazer upgrade ou downgrade a qualquer momento. A diferença é calculada proporcionalmente."
      },
      {
        question: "Recebo nota fiscal?",
        answer: "Sim! Enviamos nota fiscal por email após cada pagamento. Você também pode acessar todas as suas notas em Configurações > Histórico de Pagamentos."
      }
    ]
  }
];

const POPULAR_ARTICLES = [
  { title: "Guia Completo: Criando seu Primeiro Plano de Aula", link: "/docs", icon: BookOpen },
  { title: "Como Usar a Correção Automática de Provas", link: "/docs", icon: Settings },
  { title: "Entendendo os Códigos BNCC", link: "/docs", icon: Sparkles },
  { title: "Dicas para Melhores Resultados com IA", link: "/docs", icon: Sparkles },
  { title: "Exportando Materiais em PDF e Word", link: "/docs", icon: BookOpen },
];

const Help = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCategories = FAQ_CATEGORIES.map(category => ({
    ...category,
    faqs: category.faqs.filter(
      faq =>
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.faqs.length > 0);

  const totalResults = filteredCategories.reduce((acc, cat) => acc + cat.faqs.length, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header showAuthButtons={true} />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-b from-muted/50 to-background dark:from-[#0c1018] dark:to-[#0a0d14]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-2xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <HelpCircle className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Suporte</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Central de Ajuda
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Encontre respostas para suas dúvidas sobre o Educa Sol
              </p>
              <div className="max-w-md mx-auto relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar perguntas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 bg-card border-border"
                />
              </div>
              {searchTerm && (
                <p className="text-sm text-muted-foreground mt-4">
                  {totalResults} resultado(s) para "{searchTerm}"
                </p>
              )}
            </motion.div>
          </div>
        </section>

        {/* FAQ Sections */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* FAQ Accordions */}
              <div className="lg:col-span-2 space-y-8">
                {filteredCategories.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Nenhum resultado encontrado
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Não encontramos perguntas para "{searchTerm}"
                      </p>
                      <Button variant="outline" onClick={() => setSearchTerm("")}>
                        Limpar busca
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  filteredCategories.map((category, categoryIndex) => (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: categoryIndex * 0.1 }}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${category.color}`}>
                          <category.icon className="h-4 w-4 text-white" />
                        </div>
                        <h2 className="text-xl font-semibold text-foreground">{category.name}</h2>
                      </div>
                      <Card>
                        <Accordion type="single" collapsible className="w-full">
                          {category.faqs.map((faq, index) => (
                            <AccordionItem 
                              key={index} 
                              value={`${category.id}-${index}`}
                              className="border-b last:border-b-0"
                            >
                              <AccordionTrigger className="px-6 py-4 text-left hover:no-underline hover:bg-muted/50">
                                <span className="font-medium text-foreground">{faq.question}</span>
                              </AccordionTrigger>
                              <AccordionContent className="px-6 pb-4">
                                <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </Card>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Popular Articles */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        Artigos Populares
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {POPULAR_ARTICLES.map((article, index) => (
                        <Link
                          key={index}
                          to={article.link}
                          className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                          {article.title}
                        </Link>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Contact Card */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="bg-gradient-to-br from-primary/5 to-amber-500/5 border-primary/20">
                    <CardHeader>
                      <CardTitle className="text-lg">Precisa de Mais Ajuda?</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Nossa equipe está pronta para ajudar você com qualquer dúvida.
                      </p>
                      <div className="space-y-3">
                        <a
                          href="mailto:suporte@educasol.com.br"
                          className="flex items-center gap-3 text-sm hover:text-primary transition-colors group"
                        >
                          <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                            <Mail className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">Email</p>
                            <p className="text-muted-foreground">suporte@educasol.com.br</p>
                          </div>
                        </a>
                        <a
                          href="https://wa.me/5511999999999"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 text-sm hover:text-primary transition-colors group"
                        >
                          <div className="p-2 rounded-lg bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
                            <MessageCircle className="h-4 w-4 text-emerald-500" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">WhatsApp</p>
                            <p className="text-muted-foreground">Resposta rápida</p>
                          </div>
                        </a>
                        <div className="flex items-center gap-3 text-sm">
                          <div className="p-2 rounded-lg bg-muted">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">Horário</p>
                            <p className="text-muted-foreground">Seg-Sex, 9h às 18h</p>
                          </div>
                        </div>
                      </div>
                      <Button className="w-full bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90">
                        <Mail className="h-4 w-4 mr-2" />
                        Enviar Mensagem
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Quick Links */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Links Rápidos</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Link to="/docs" className="block">
                        <Button variant="outline" className="w-full justify-start gap-2">
                          <BookOpen className="h-4 w-4" />
                          Documentação Completa
                        </Button>
                      </Link>
                      <Link to="/blog" className="block">
                        <Button variant="outline" className="w-full justify-start gap-2">
                          <Sparkles className="h-4 w-4" />
                          Blog e Tutoriais
                        </Button>
                      </Link>
                      <Link to="/usage" className="block">
                        <Button variant="outline" className="w-full justify-start gap-2">
                          <Settings className="h-4 w-4" />
                          Meu Uso e Limites
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Help;
