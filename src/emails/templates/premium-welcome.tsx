import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';
import { EmailHeader } from '../components/EmailHeader';
import { EmailFooter } from '../components/EmailFooter';
import { EmailButton } from '../components/EmailButton';

interface PremiumWelcomeEmailProps {
  /** Nome do usuário */
  userName?: string;
  /** Nome do plano assinado */
  planName?: string;
  /** URL do dashboard */
  dashboardUrl?: string;
}

/**
 * PremiumWelcomeEmail - Template de boas-vindas ao plano Premium
 * 
 * Email transacional enviado quando o usuário confirma assinatura Premium.
 * Lista benefícios desbloqueados e próximos passos.
 * 
 * Requirements: 4.2
 * Validates: Transactional email - não inclui conteúdo de marketing
 */
export const PremiumWelcomeEmail: React.FC<PremiumWelcomeEmailProps> = ({
  userName = 'Professor',
  planName = 'Premium',
  dashboardUrl = 'https://educasol.com.br/dashboard',
}) => {
  const benefits = [
    { icon: '♾️', title: 'Gerações ilimitadas', description: 'Crie quantos planos de aula e atividades precisar' },
    { icon: '🎯', title: 'Alinhamento BNCC avançado', description: 'Sugestões inteligentes de competências e habilidades' },
    { icon: '📊', title: 'Relatórios detalhados', description: 'Acompanhe o progresso das suas turmas' },
    { icon: '⚡', title: 'Prioridade no suporte', description: 'Atendimento prioritário para suas dúvidas' },
  ];

  return (
    <Html>
      <Head />
      <Preview>Bem-vindo ao Educa Sol {planName}! 🎉</Preview>
      <Body style={bodyStyle}>
        <EmailHeader />
        
        <Container style={containerStyle}>
          <Section style={contentStyle}>
            {/* Celebração */}
            <Section style={celebrationStyle}>
              <Text style={celebrationEmojiStyle}>🎉</Text>
              <Text style={celebrationTitleStyle}>
                Parabéns, {userName}!
              </Text>
              <Text style={celebrationSubtitleStyle}>
                Você agora é {planName}
              </Text>
            </Section>
            
            <Text style={paragraphStyle}>
              Sua assinatura foi confirmada com sucesso. Agora você tem acesso a 
              todos os recursos do Educa Sol para transformar seu planejamento pedagógico.
            </Text>

            {/* Benefícios desbloqueados */}
            <Text style={sectionTitleStyle}>
              ✨ Seus novos benefícios
            </Text>

            <Section style={benefitsContainerStyle}>
              {benefits.map((benefit, index) => (
                <Section key={index} style={benefitRowStyle}>
                  <table cellPadding="0" cellSpacing="0" style={benefitTableStyle}>
                    <tbody>
                      <tr>
                        <td style={benefitIconCellStyle}>
                          <Text style={benefitIconStyle}>{benefit.icon}</Text>
                        </td>
                        <td style={benefitContentCellStyle}>
                          <Text style={benefitTitleStyle}>{benefit.title}</Text>
                          <Text style={benefitDescStyle}>{benefit.description}</Text>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </Section>
              ))}
            </Section>

            {/* Próximos passos */}
            <Text style={sectionTitleStyle}>
              🚀 Próximos passos
            </Text>

            <Section style={stepsContainerStyle}>
              <table cellPadding="0" cellSpacing="0" style={stepsTableStyle}>
                <tbody>
                  <tr>
                    <td style={stepNumberCellStyle}>
                      <Text style={stepNumberStyle}>1</Text>
                    </td>
                    <td style={stepContentCellStyle}>
                      <Text style={stepTextStyle}>
                        Acesse o dashboard e explore as novas funcionalidades
                      </Text>
                    </td>
                  </tr>
                  <tr>
                    <td style={stepNumberCellStyle}>
                      <Text style={stepNumberStyle}>2</Text>
                    </td>
                    <td style={stepContentCellStyle}>
                      <Text style={stepTextStyle}>
                        Crie seu primeiro plano de aula com alinhamento BNCC avançado
                      </Text>
                    </td>
                  </tr>
                  <tr>
                    <td style={stepNumberCellStyle}>
                      <Text style={stepNumberStyle}>3</Text>
                    </td>
                    <td style={stepContentCellStyle}>
                      <Text style={stepTextStyle}>
                        Gere atividades diferenciadas para suas turmas
                      </Text>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>

            <Section style={buttonContainerStyle}>
              <EmailButton href={dashboardUrl} variant="success">
                Começar Agora
              </EmailButton>
            </Section>

            <Text style={helpTextStyle}>
              Dúvidas sobre sua assinatura? Fale com nosso suporte em{' '}
              <a href="mailto:suporte@educasol.com.br" style={linkStyle}>
                suporte@educasol.com.br
              </a>
            </Text>
          </Section>
        </Container>

        {/* Footer sem opção de unsubscribe - email transacional */}
        <EmailFooter isMarketing={false} />
      </Body>
    </Html>
  );
};

// Estilos inline para compatibilidade com clientes de email
const bodyStyle: React.CSSProperties = {
  backgroundColor: '#F1F5F9',
  fontFamily: "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  margin: '0',
  padding: '0',
};

const containerStyle: React.CSSProperties = {
  maxWidth: '600px',
  margin: '0 auto',
};

const contentStyle: React.CSSProperties = {
  backgroundColor: '#FFFFFF',
  padding: '32px',
  margin: '0',
};

const celebrationStyle: React.CSSProperties = {
  textAlign: 'center' as const,
  padding: '24px 0',
  backgroundColor: '#F0FDF4',
  borderRadius: '12px',
  marginBottom: '24px',
};

const celebrationEmojiStyle: React.CSSProperties = {
  fontSize: '48px',
  margin: '0 0 8px 0',
};

const celebrationTitleStyle: React.CSSProperties = {
  color: '#166534',
  fontSize: '24px',
  fontWeight: '700',
  margin: '0 0 4px 0',
};

const celebrationSubtitleStyle: React.CSSProperties = {
  color: '#15803D',
  fontSize: '16px',
  fontWeight: '500',
  margin: '0',
};

const paragraphStyle: React.CSSProperties = {
  color: '#64748B',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0 0 24px 0',
};

const sectionTitleStyle: React.CSSProperties = {
  color: '#0F172A',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 16px 0',
};

const benefitsContainerStyle: React.CSSProperties = {
  marginBottom: '24px',
};

const benefitRowStyle: React.CSSProperties = {
  marginBottom: '12px',
};

const benefitTableStyle: React.CSSProperties = {
  width: '100%',
};

const benefitIconCellStyle: React.CSSProperties = {
  width: '40px',
  verticalAlign: 'top',
  paddingTop: '2px',
};

const benefitIconStyle: React.CSSProperties = {
  fontSize: '20px',
  margin: '0',
};

const benefitContentCellStyle: React.CSSProperties = {
  verticalAlign: 'top',
};

const benefitTitleStyle: React.CSSProperties = {
  color: '#0F172A',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 2px 0',
};

const benefitDescStyle: React.CSSProperties = {
  color: '#64748B',
  fontSize: '13px',
  margin: '0',
};

const stepsContainerStyle: React.CSSProperties = {
  backgroundColor: '#F8FAFC',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '24px',
};

const stepsTableStyle: React.CSSProperties = {
  width: '100%',
};

const stepNumberCellStyle: React.CSSProperties = {
  width: '32px',
  verticalAlign: 'top',
  paddingBottom: '12px',
};

const stepNumberStyle: React.CSSProperties = {
  backgroundColor: '#2563EB',
  color: '#FFFFFF',
  width: '24px',
  height: '24px',
  borderRadius: '50%',
  fontSize: '12px',
  fontWeight: '600',
  textAlign: 'center' as const,
  lineHeight: '24px',
  margin: '0',
  display: 'inline-block',
};

const stepContentCellStyle: React.CSSProperties = {
  verticalAlign: 'top',
  paddingBottom: '12px',
  paddingLeft: '8px',
};

const stepTextStyle: React.CSSProperties = {
  color: '#334155',
  fontSize: '13px',
  margin: '0',
  lineHeight: '24px',
};

const buttonContainerStyle: React.CSSProperties = {
  textAlign: 'center' as const,
  margin: '24px 0',
};

const helpTextStyle: React.CSSProperties = {
  color: '#94A3B8',
  fontSize: '12px',
  textAlign: 'center' as const,
  margin: '0',
};

const linkStyle: React.CSSProperties = {
  color: '#2563EB',
  textDecoration: 'underline',
};

export default PremiumWelcomeEmail;
