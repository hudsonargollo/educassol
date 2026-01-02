import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Calendar } from "lucide-react";

const LAST_UPDATED = "2 de janeiro de 2026";

const TERMS_SECTIONS = [
  {
    id: "acceptance",
    title: "1. Aceitação dos Termos",
    content: `Ao acessar ou usar a plataforma Educa Sol ("Serviço"), você concorda em estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não poderá acessar o Serviço.

O uso do Serviço está condicionado à sua aceitação e conformidade com estes Termos. Estes Termos se aplicam a todos os visitantes, usuários e outras pessoas que acessam ou usam o Serviço.`,
  },
  {
    id: "description",
    title: "2. Descrição do Serviço",
    content: `O Educa Sol é uma plataforma de inteligência artificial projetada para auxiliar educadores brasileiros na criação de conteúdo pedagógico, incluindo:

• Planos de aula alinhados à BNCC
• Atividades e exercícios personalizados
• Avaliações e provas
• Correção automática de provas com IA
• Materiais didáticos diferenciados

O Serviço utiliza tecnologia de IA para gerar conteúdo educacional, mas o usuário é responsável por revisar e adaptar o conteúdo gerado às suas necessidades específicas.`,
  },
  {
    id: "accounts",
    title: "3. Contas de Usuário",
    content: `Para acessar determinadas funcionalidades do Serviço, você deve criar uma conta. Ao criar uma conta, você concorda em:

• Fornecer informações precisas, atuais e completas
• Manter a segurança de sua senha e conta
• Notificar-nos imediatamente sobre qualquer uso não autorizado
• Ser responsável por todas as atividades realizadas em sua conta

Reservamo-nos o direito de suspender ou encerrar contas que violem estes Termos ou que apresentem atividade suspeita.`,
  },
  {
    id: "usage",
    title: "4. Uso Aceitável",
    content: `Ao usar o Serviço, você concorda em NÃO:

• Usar o Serviço para fins ilegais ou não autorizados
• Violar leis aplicáveis, incluindo leis de propriedade intelectual
• Transmitir vírus, malware ou código malicioso
• Tentar acessar sistemas ou dados não autorizados
• Usar o Serviço para gerar conteúdo ofensivo, discriminatório ou inadequado
• Revender ou redistribuir o Serviço sem autorização
• Usar automação não autorizada para acessar o Serviço

O conteúdo gerado deve ser usado exclusivamente para fins educacionais legítimos.`,
  },
  {
    id: "intellectual-property",
    title: "5. Propriedade Intelectual",
    content: `O Serviço e seu conteúdo original, recursos e funcionalidades são e permanecerão propriedade exclusiva do Educa Sol e seus licenciadores.

Conteúdo gerado pelo usuário:
• Você mantém os direitos sobre o conteúdo que você cria usando o Serviço
• Você nos concede uma licença limitada para processar seu conteúdo conforme necessário para fornecer o Serviço
• O conteúdo gerado pela IA pode ser usado livremente para fins educacionais

Você não pode copiar, modificar, distribuir, vender ou alugar qualquer parte do Serviço sem nossa autorização prévia por escrito.`,
  },
  {
    id: "subscriptions",
    title: "6. Assinaturas e Pagamentos",
    content: `Algumas funcionalidades do Serviço requerem uma assinatura paga. Ao assinar:

• Você autoriza a cobrança recorrente conforme o plano escolhido
• Os preços podem ser alterados com aviso prévio de 30 dias
• Não há reembolso por períodos parciais de uso
• Você pode cancelar sua assinatura a qualquer momento

Plano Gratuito:
• Acesso limitado a funcionalidades básicas
• Limite de gerações mensais conforme especificado

Plano Premium:
• Acesso completo a todas as funcionalidades
• Gerações ilimitadas
• Suporte prioritário`,
  },
  {
    id: "liability",
    title: "7. Limitação de Responsabilidade",
    content: `O Serviço é fornecido "como está" e "conforme disponível", sem garantias de qualquer tipo.

Não garantimos que:
• O Serviço será ininterrupto ou livre de erros
• O conteúdo gerado será 100% preciso ou adequado
• Os resultados atenderão às suas expectativas específicas

Em nenhuma circunstância seremos responsáveis por danos indiretos, incidentais, especiais, consequenciais ou punitivos, incluindo perda de lucros, dados ou uso.

Você é responsável por revisar todo o conteúdo gerado antes de usá-lo em contextos educacionais.`,
  },
  {
    id: "termination",
    title: "8. Rescisão",
    content: `Podemos encerrar ou suspender seu acesso ao Serviço imediatamente, sem aviso prévio, por qualquer motivo, incluindo violação destes Termos.

Após a rescisão:
• Seu direito de usar o Serviço cessará imediatamente
• Podemos excluir seus dados após um período de retenção
• Disposições que por sua natureza devem sobreviver à rescisão permanecerão em vigor

Você pode encerrar sua conta a qualquer momento através das configurações da conta ou entrando em contato conosco.`,
  },
  {
    id: "changes",
    title: "9. Alterações nos Termos",
    content: `Reservamo-nos o direito de modificar ou substituir estes Termos a qualquer momento. Se uma revisão for material, forneceremos aviso com pelo menos 30 dias de antecedência.

O que constitui uma alteração material será determinado a nosso critério. Ao continuar a acessar ou usar o Serviço após essas revisões entrarem em vigor, você concorda em estar vinculado aos termos revisados.`,
  },
  {
    id: "governing-law",
    title: "10. Lei Aplicável",
    content: `Estes Termos serão regidos e interpretados de acordo com as leis do Brasil, sem considerar suas disposições sobre conflitos de leis.

Qualquer disputa decorrente destes Termos será submetida à jurisdição exclusiva dos tribunais da cidade de São Paulo, Estado de São Paulo, Brasil.

Se qualquer disposição destes Termos for considerada inválida ou inexequível, as demais disposições permanecerão em pleno vigor e efeito.`,
  },
  {
    id: "contact",
    title: "11. Contato",
    content: `Se você tiver dúvidas sobre estes Termos de Uso, entre em contato conosco:

Email: legal@educasol.com.br
Email de suporte: suporte@educasol.com.br

Educa Sol
São Paulo, SP - Brasil`,
  },
];

export default function Terms() {
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
                <FileText className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Documento Legal</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Termos de Uso
              </h1>
              <p className="text-lg text-muted-foreground mb-4">
                Leia atentamente os termos e condições de uso da plataforma Educa Sol
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
                    {TERMS_SECTIONS.map((section, index) => (
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
