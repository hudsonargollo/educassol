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

interface WelcomeEmailProps {
  /** Nome do usuário */
  userName?: string;
  /** URL do dashboard para começar */
  dashboardUrl?: string;
  /** URL do tutorial */
  tutorialUrl?: string;
  /** Token para unsubscribe */
  unsubscribeToken?: string;
}

/**
 * WelcomeEmail - Template de boas-vindas para novos usuários
 * 
 * Email de marketing enviado imediatamente após o cadastro.
 * Inclui mensagem pessoal, botão "Começar Agora" e link para tutorial.
 * 
 * Requirements: 6.1
 * Validates: Property 10 (Welcome Email on Registration)
 */
export const WelcomeEmail: React.FC<WelcomeEmailProps> = ({
  userName = 'Professor',
  dashboardUrl = 'https://educasol.com.br/dashboard',
  tutorialUrl = 'https://educasol.com.br/help/getting-started',
  unsubscribeToken,
}) => {
  return (
    <Html>
      <Head />
      <Preview>Bem-vindo ao Educa Sol! Comece a criar planos de aula incríveis 🌟</Preview>
      <Body style={bodyStyle}>
        <EmailHeader />
        
        <Container style={containerStyle}>
          <Section style={contentStyle}>
            {/* Mensagem de boas-vindas */}
            <Section style={welcomeBoxStyle}>
              <Text style={welcomeEmojiStyle}>👋</Text>
              <Text style={welcomeTitleStyle}>
                Olá, {userName}!
              </Text>
              <Text style={welcomeSubtitleStyle}>
                Bem-vindo ao Educa Sol
              </Text>
            </Section>
            
            <Text style={paragraphStyle}>
              Estamos muito felizes em ter você conosco! O Educa Sol foi criado para 
              facilitar seu planejamento pedagógico, com alinhamento automático à BNCC 
              e geração inteligente de atividades.
            </Text>

            {/* O que você pode fazer */}
            <Text style={sectionTitleStyle}>
              ✨ O que você pode fazer
            </Text>

            <Section style={featuresContainerStyle}>
              <table cellPadding="0" cellSpacing="0" style={featuresTableStyle}>
                <tbody>
                  <tr>
                    <td style={featureIconCellStyle}>
                      <Text style={featureIconStyle}>📝</Text>
                    </td>
                    <td style={featureContentCellStyle}>
                      <Text style={featureTitleStyle}>Criar planos de aula</Text>
                      <Text style={featureDescStyle}>
                        Gere planos completos alinhados à BNCC em minutos
                      </Text>
                    </td>
                  </tr>
                  <tr>
                    <td style={featureIconCellStyle}>
                      <Text style={featureIconStyle}>🎯</Text>
                    </td>
                    <td style={featureContentCellStyle}>
                      <Text style={featureTitleStyle}>Alinhar com a BNCC</Text>
                      <Text style={featureDescStyle}>
                        Sugestões automáticas de competências e habilidades
                      </Text>
                    </td>
                  </tr>
                  <tr>
                    <td style={featureIconCellStyle}>
                      <Text style={featureIconStyle}>📊</Text>
                    </td>
                    <td style={featureContentCellStyle}>
                      <Text style={featureTitleStyle}>Gerar atividades</Text>
                      <Text style={featureDescStyle}>
                        Crie quizzes, worksheets e materiais diferenciados
                      </Text>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>

            {/* CTA Principal */}
            <Section style={ctaContainerStyle}>
              <Text style={ctaTitleStyle}>
                🚀 Pronto para começar?
              </Text>
              <Text style={ctaDescStyle}>
                Crie seu primeiro plano de aula em menos de 5 minutos.
              </Text>
              <Section style={buttonContainerStyle}>
                <EmailButton href={dashboardUrl} variant="primary">
                  Começar Agora
                </EmailButton>
              </Section>
            </Section>

            {/* Link para tutorial */}
            <Section style={tutorialBoxStyle}>
              <Text style={tutorialTextStyle}>
                📚 Precisa de ajuda? Confira nosso{' '}
                <a href={tutorialUrl} style={linkStyle}>
                  guia de primeiros passos
                </a>
                {' '}para aproveitar ao máximo a plataforma.
              </Text>
            </Section>

            <Text style={helpTextStyle}>
              Dúvidas? Estamos aqui para ajudar em{' '}
              <a href="mailto:suporte@educasol.com.br" style={linkStyle}>
                suporte@educasol.com.br
              </a>
            </Text>
          </Section>
        </Container>

        {/* Footer com opção de unsubscribe - email de marketing/onboarding */}
        <EmailFooter isMarketing={true} unsubscribeToken={unsubscribeToken} />
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

const welcomeBoxStyle: React.CSSProperties = {
  textAlign: 'center' as const,
  padding: '24px 0',
  backgroundColor: '#EFF6FF',
  borderRadius: '12px',
  marginBottom: '24px',
};

const welcomeEmojiStyle: React.CSSProperties = {
  fontSize: '48px',
  margin: '0 0 8px 0',
};

const welcomeTitleStyle: React.CSSProperties = {
  color: '#1E40AF',
  fontSize: '24px',
  fontWeight: '700',
  margin: '0 0 4px 0',
};

const welcomeSubtitleStyle: React.CSSProperties = {
  color: '#3B82F6',
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

const featuresContainerStyle: React.CSSProperties = {
  marginBottom: '24px',
};

const featuresTableStyle: React.CSSProperties = {
  width: '100%',
};

const featureIconCellStyle: React.CSSProperties = {
  width: '40px',
  verticalAlign: 'top',
  paddingTop: '2px',
  paddingBottom: '16px',
};

const featureIconStyle: React.CSSProperties = {
  fontSize: '20px',
  margin: '0',
};

const featureContentCellStyle: React.CSSProperties = {
  verticalAlign: 'top',
  paddingBottom: '16px',
};

const featureTitleStyle: React.CSSProperties = {
  color: '#0F172A',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 2px 0',
};

const featureDescStyle: React.CSSProperties = {
  color: '#64748B',
  fontSize: '13px',
  margin: '0',
};

const ctaContainerStyle: React.CSSProperties = {
  backgroundColor: '#F0FDF4',
  borderRadius: '12px',
  padding: '24px',
  marginBottom: '24px',
  textAlign: 'center' as const,
};

const ctaTitleStyle: React.CSSProperties = {
  color: '#166534',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 8px 0',
};

const ctaDescStyle: React.CSSProperties = {
  color: '#15803D',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0 0 16px 0',
};

const buttonContainerStyle: React.CSSProperties = {
  textAlign: 'center' as const,
};

const tutorialBoxStyle: React.CSSProperties = {
  backgroundColor: '#F8FAFC',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '24px',
};

const tutorialTextStyle: React.CSSProperties = {
  color: '#334155',
  fontSize: '13px',
  margin: '0',
  lineHeight: '1.5',
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

export default WelcomeEmail;
