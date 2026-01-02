import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Calendar } from "lucide-react";

const LAST_UPDATED = "2 de janeiro de 2026";

const PRIVACY_SECTIONS = [
  {
    id: "introduction",
    title: "1. Introdução",
    content: `A Educa Sol ("nós", "nosso" ou "Empresa") está comprometida em proteger sua privacidade. Esta Política de Privacidade explica como coletamos, usamos, divulgamos e protegemos suas informações quando você usa nossa plataforma.

Ao usar o Educa Sol, você concorda com a coleta e uso de informações de acordo com esta política. Se você não concordar com os termos desta política, por favor não use nosso Serviço.`,
  },
  {
    id: "data-collection",
    title: "2. Dados que Coletamos",
    content: `Coletamos diferentes tipos de informações para fornecer e melhorar nosso Serviço:

Informações fornecidas por você:
• Nome e sobrenome
• Endereço de email
• Informações de perfil profissional (escola, disciplina, série)
• Conteúdo que você cria ou carrega na plataforma
• Comunicações conosco (suporte, feedback)

Informações coletadas automaticamente:
• Dados de uso (páginas visitadas, funcionalidades usadas)
• Informações do dispositivo (tipo, sistema operacional, navegador)
• Endereço IP e localização aproximada
• Cookies e tecnologias similares

Informações de pagamento:
• Processadas por nossos parceiros de pagamento (Mercado Pago)
• Não armazenamos dados completos de cartão de crédito`,
  },
  {
    id: "data-usage",
    title: "3. Como Usamos seus Dados",
    content: `Usamos as informações coletadas para:

Fornecer o Serviço:
• Criar e gerenciar sua conta
• Processar suas solicitações de geração de conteúdo
• Personalizar sua experiência na plataforma
• Processar pagamentos e assinaturas

Melhorar o Serviço:
• Analisar padrões de uso para melhorar funcionalidades
• Desenvolver novos recursos e produtos
• Treinar e melhorar nossos modelos de IA (de forma anonimizada)

Comunicação:
• Enviar notificações sobre sua conta
• Informar sobre atualizações do Serviço
• Responder a solicitações de suporte
• Enviar comunicações de marketing (com seu consentimento)

Segurança e conformidade:
• Detectar e prevenir fraudes
• Cumprir obrigações legais
• Proteger nossos direitos e propriedade`,
  },
  {
    id: "data-sharing",
    title: "4. Compartilhamento de Dados",
    content: `Não vendemos suas informações pessoais. Podemos compartilhar dados nas seguintes circunstâncias:

Provedores de serviço:
• Serviços de hospedagem e infraestrutura (Supabase, Cloudflare)
• Processadores de pagamento (Mercado Pago)
• Serviços de análise (Google Analytics)
• Provedores de IA (Google AI, OpenAI)

Requisitos legais:
• Quando exigido por lei ou processo legal
• Para proteger nossos direitos legais
• Em resposta a solicitações de autoridades governamentais

Transferências de negócios:
• Em caso de fusão, aquisição ou venda de ativos
• Seus dados podem ser transferidos como parte da transação

Dados agregados:
• Podemos compartilhar dados estatísticos anonimizados
• Esses dados não identificam usuários individuais`,
  },
  {
    id: "data-protection",
    title: "5. Proteção de Dados",
    content: `Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações:

Medidas técnicas:
• Criptografia de dados em trânsito (HTTPS/TLS)
• Criptografia de dados em repouso
• Autenticação segura e controle de acesso
• Monitoramento contínuo de segurança
• Backups regulares e recuperação de desastres

Medidas organizacionais:
• Acesso restrito a dados pessoais
• Treinamento de funcionários em privacidade
• Políticas internas de segurança da informação
• Avaliações regulares de segurança

Apesar de nossos esforços, nenhum método de transmissão pela Internet ou armazenamento eletrônico é 100% seguro. Não podemos garantir segurança absoluta.`,
  },
  {
    id: "data-retention",
    title: "6. Retenção de Dados",
    content: `Mantemos suas informações pelo tempo necessário para:

• Fornecer o Serviço enquanto sua conta estiver ativa
• Cumprir obrigações legais e regulatórias
• Resolver disputas e fazer cumprir nossos acordos

Períodos de retenção:
• Dados da conta: enquanto a conta estiver ativa + 2 anos após exclusão
• Conteúdo gerado: enquanto a conta estiver ativa
• Logs de uso: 12 meses
• Dados de pagamento: conforme exigido por lei (geralmente 5 anos)

Após a exclusão da conta:
• Seus dados pessoais serão excluídos ou anonimizados
• Alguns dados podem ser retidos para fins legais
• Backups podem conter dados por até 30 dias adicionais`,
  },
  {
    id: "user-rights",
    title: "7. Seus Direitos",
    content: `De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem os seguintes direitos:

• Acesso: solicitar uma cópia dos seus dados pessoais
• Correção: corrigir dados incompletos ou imprecisos
• Exclusão: solicitar a exclusão dos seus dados
• Portabilidade: receber seus dados em formato estruturado
• Oposição: opor-se ao processamento de seus dados
• Revogação: retirar seu consentimento a qualquer momento

Para exercer esses direitos:
• Acesse as configurações da sua conta
• Entre em contato: privacidade@educasol.com.br
• Responderemos em até 15 dias úteis

Algumas solicitações podem ser limitadas por obrigações legais ou interesses legítimos.`,
  },
  {
    id: "cookies",
    title: "8. Cookies e Tecnologias Similares",
    content: `Usamos cookies e tecnologias similares para:

Cookies essenciais:
• Autenticação e segurança da sessão
• Preferências de idioma e tema
• Funcionamento básico da plataforma

Cookies de análise:
• Entender como você usa o Serviço
• Medir desempenho e identificar problemas
• Melhorar a experiência do usuário

Cookies de marketing:
• Personalizar anúncios (com seu consentimento)
• Medir eficácia de campanhas

Gerenciamento de cookies:
• Você pode configurar seu navegador para recusar cookies
• Alguns recursos podem não funcionar sem cookies essenciais
• Usamos banner de consentimento para cookies não essenciais`,
  },
  {
    id: "children",
    title: "9. Privacidade de Menores",
    content: `O Educa Sol é destinado a educadores adultos. Não coletamos intencionalmente informações de menores de 18 anos.

Se você é pai ou responsável e acredita que seu filho nos forneceu informações pessoais, entre em contato conosco imediatamente.

Se descobrirmos que coletamos dados de menores sem verificação de consentimento parental, tomaremos medidas para remover essas informações.`,
  },
  {
    id: "international",
    title: "10. Transferências Internacionais",
    content: `Seus dados podem ser transferidos e processados em servidores localizados fora do Brasil, incluindo Estados Unidos e União Europeia.

Garantimos que essas transferências:
• Cumprem a LGPD e regulamentações aplicáveis
• São protegidas por cláusulas contratuais padrão
• Mantêm nível adequado de proteção de dados

Ao usar o Serviço, você consente com essas transferências internacionais.`,
  },
  {
    id: "changes",
    title: "11. Alterações nesta Política",
    content: `Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre alterações significativas:

• Publicando a nova política nesta página
• Enviando email para usuários registrados
• Exibindo aviso destacado na plataforma

Recomendamos revisar esta política periodicamente. Alterações entram em vigor quando publicadas nesta página.

Seu uso continuado do Serviço após alterações constitui aceitação da política atualizada.`,
  },
  {
    id: "contact",
    title: "12. Contato",
    content: `Para questões sobre esta Política de Privacidade ou sobre seus dados pessoais:

Encarregado de Proteção de Dados (DPO):
Email: privacidade@educasol.com.br

Suporte geral:
Email: suporte@educasol.com.br

Educa Sol
São Paulo, SP - Brasil

Você também pode registrar reclamação junto à Autoridade Nacional de Proteção de Dados (ANPD) se acreditar que seus direitos não foram respeitados.`,
  },
];

export default function Privacy() {
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
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Privacidade</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Política de Privacidade
              </h1>
              <p className="text-lg text-muted-foreground mb-4">
                Saiba como coletamos, usamos e protegemos suas informações pessoais
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Última atualização: {LAST_UPDATED}</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Card className="border-border">
                <CardContent className="p-6 sm:p-10">
                  <div className="prose prose-neutral dark:prose-invert max-w-none">
                    {PRIVACY_SECTIONS.map((section, index) => (
                      <motion.div
                        key={section.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="mb-8 last:mb-0"
                      >
                        <h2 className="text-xl font-semibold text-foreground mb-4">
                          {section.title}
                        </h2>
                        <div className="text-muted-foreground whitespace-pre-line leading-relaxed">
                          {section.content}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
