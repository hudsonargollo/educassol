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

interface OnboardingDay3EmailProps {
  /** Nome do usuário */
  userName?: string;
  /** URL do dashboard */
  dashboardUrl?: string;
  /** URL para funcionalidades avançadas */
  featuresUrl?: string;
  /** Token para unsubscribe */
  unsubscribeToken?: string;
}

/**
 * OnboardingDay3Email - Email de onboarding enviado 72h após cadastro
 * 
 * Apresenta funcionalidades avançadas da plataforma para engajar
 * usuários que já conhecem o básico.
 * 
 * Requirements: 6.3
 */
export const OnboardingDay3Email: React.FC<OnboardingDay3EmailProps> = ({
  userName = 'Professor',
  dashboardUrl = 'https://educasol.com.br/dashboard',
  featuresUrl = 'https://educasol.com.br/help/advanced-features',
  unsubscribeToken,
}) => {
  const advancedFeatures = [
    {
      icon: '🎨',
      title: 'Diferenciação de Conteúdo',
      description: 'Adapte atividades para diferentes níveis de aprendizagem na mesma turma',
    },
    {
      icon: '📊',
      title: 'Avaliações Inteligentes',
      description: 'Crie provas e quizzes com correção automática e feedback personalizado',
    },
    {
      icon: '📅',
      title: 'Planejamento de Unidades',
      description: 'Organize sequências didáticas completas com progressão de habilidades',
    },
    {
      icon: '📑',
      title: 'Exportação Profissional',
      description: 'Exporte seus planos em PDF, PowerPoint ou compartilhe com colegas',
    },
  ];

  return (
    <Html>
      <Head />
      <Preview>Descubra funcionalidades avançadas do Educa Sol 🚀</Preview>
      <Body style={bodyStyle}>
        <EmailHeader />
        
        <Container style={containerStyle}>
          <Section style={contentStyle}>
            {/* Mensagem pessoal */}
            <Text style={greetingStyle}>Olá, {userName}!</Text>
            
            <Text style={paragraphStyle}>
              Você já conhece o básico do Educa Sol. Agora é hora de descobrir 
              funcionalidades que vão transformar ainda mais seu planejamento pedagógico!
            </Text>

            {/* Destaque */}
            <Section style={highlightBoxStyle}>
              <Text style={highlightIconStyle}>💡</Text>
              <Text style={highlightTitleStyle}>
                Você sabia?
              </Text>
              <Text style={highlightDescStyle}>
                Professores que usam as funcionalidades avançadas economizam 
                em média 3 horas por semana no planejamento.
              </Text>
            </Section>

            {/* Funcionalidades avançadas */}
            <Text style={sectionTitleStyle}>
              🚀 Funcionalidades avançadas
            </Text>

            <Section style={featuresContainerStyle}>
              {advancedFeatures.map((feature, index) => (
                <Section key={index} style={featureRowStyle}>
                  <table cellPadding="0" cellSpacing="0" style={featureTableStyle}>
                    <tbody>
                      <tr>
                        <td style={featureIconCellStyle}>
                          <Text style={featureIconStyle}>{feature.icon}</Text>
                        </td>
                        <td style={featureContentCellStyle}>
                          <Text style={featureTitleStyle}>{feature.title}</Text>
                          <Text style={featureDescStyle}>{feature.description}</Text>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </Section>
              ))}
            </Section>

            {/* CTA Principal */}
            <Section style={ctaContainerStyle}>
              <Text style={ctaTitleStyle}>
                ✨ Explore agora
              </Text>
              <Text style={ctaDescStyle}>
                Acesse o dashboard e experimente essas funcionalidades.
              </Text>
              <Section style={buttonContainerStyle}>
                <EmailButton href={dashboardUrl} variant="primary">
                  Acessar Dashboard
                </EmailButton>
              </Section>
            </Section>

            {/* Link para guia */}
            <Section style={guideBoxStyle}>
              <Text style={guideTextStyle}>
                📖 Quer um passo a passo detalhado?{' '}
                <a href={featuresUrl} style={linkStyle}>
                  Veja nosso guia de funcionalidades avançadas
                </a>
              </Text>
            </Section>

            <Text style={helpTextStyle}>
              Dúvidas ou sugestões? Estamos sempre ouvindo em{' '}
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

const greetingStyle: React.CSSProperties = {
  color: '#0F172A',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 16px 0',
};

const paragraphStyle: React.CSSProperties = {
  color: '#64748B',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0 0 24px 0',
};

const highlightBoxStyle: React.CSSProperties = {
  textAlign: 'center' as const,
  padding: '24px',
  backgroundColor: '#F5F3FF',
  borderRadius: '12px',
  marginBottom: '24px',
};

const highlightIconStyle: React.CSSProperties = {
  fontSize: '40px',
  margin: '0 0 8px 0',
};

const highlightTitleStyle: React.CSSProperties = {
  color: '#5B21B6',
  fontSize: '18px',
  fontWeight: '700',
  margin: '0 0 8px 0',
};

const highlightDescStyle: React.CSSProperties = {
  color: '#7C3AED',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0',
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

const featureRowStyle: React.CSSProperties = {
  marginBottom: '16px',
};

const featureTableStyle: React.CSSProperties = {
  width: '100%',
};

const featureIconCellStyle: React.CSSProperties = {
  width: '48px',
  verticalAlign: 'top',
  paddingTop: '2px',
};

const featureIconStyle: React.CSSProperties = {
  fontSize: '24px',
  margin: '0',
};

const featureContentCellStyle: React.CSSProperties = {
  verticalAlign: 'top',
};

const featureTitleStyle: React.CSSProperties = {
  color: '#0F172A',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 4px 0',
};

const featureDescStyle: React.CSSProperties = {
  color: '#64748B',
  fontSize: '13px',
  lineHeight: '1.4',
  margin: '0',
};

const ctaContainerStyle: React.CSSProperties = {
  backgroundColor: '#EFF6FF',
  borderRadius: '12px',
  padding: '24px',
  marginBottom: '24px',
  textAlign: 'center' as const,
};

const ctaTitleStyle: React.CSSProperties = {
  color: '#1E40AF',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 8px 0',
};

const ctaDescStyle: React.CSSProperties = {
  color: '#3B82F6',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0 0 16px 0',
};

const buttonContainerStyle: React.CSSProperties = {
  textAlign: 'center' as const,
};

const guideBoxStyle: React.CSSProperties = {
  backgroundColor: '#F8FAFC',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '24px',
};

const guideTextStyle: React.CSSProperties = {
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

export default OnboardingDay3Email;
