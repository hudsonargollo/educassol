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

interface ActivitySummaryEmailProps {
  /** Nome do usuário */
  userName?: string;
  /** Data de início da semana (formato: "01/01/2026") */
  weekStartDate?: string;
  /** Data de fim da semana (formato: "07/01/2026") */
  weekEndDate?: string;
  /** Número de planos de aula criados */
  plansCreated?: number;
  /** Número de atividades geradas */
  activitiesGenerated?: number;
  /** Número de avaliações criadas */
  assessmentsCreated?: number;
  /** URL do dashboard */
  dashboardUrl?: string;
  /** Token para unsubscribe */
  unsubscribeToken?: string;
  /** Dica da semana */
  weeklyTip?: string;
}

/**
 * ActivitySummaryEmail - Template de resumo semanal de atividades
 * 
 * Email de notificação enviado semanalmente para usuários ativos.
 * Inclui métricas da semana (planos, atividades, avaliações) e dicas.
 * 
 * Requirements: 9.1, 9.2
 * Validates: Property 12 (Activity Summary Content Completeness)
 */
export const ActivitySummaryEmail: React.FC<ActivitySummaryEmailProps> = ({
  userName = 'Professor',
  weekStartDate = '01/01/2026',
  weekEndDate = '07/01/2026',
  plansCreated = 0,
  activitiesGenerated = 0,
  assessmentsCreated = 0,
  dashboardUrl = 'https://educasol.com.br/dashboard',
  unsubscribeToken,
  weeklyTip = 'Experimente usar a diferenciação de conteúdo para adaptar suas atividades a diferentes níveis de aprendizagem na mesma turma.',
}) => {
  const totalItems = plansCreated + activitiesGenerated + assessmentsCreated;
  const previewText = `Seu resumo semanal: ${totalItems} itens criados de ${weekStartDate} a ${weekEndDate}`;

  // Determine encouragement message based on activity level
  const getEncouragementMessage = () => {
    if (totalItems >= 10) {
      return 'Semana incrível! Você está arrasando no planejamento pedagógico! 🏆';
    } else if (totalItems >= 5) {
      return 'Ótimo trabalho! Continue assim e seus alunos agradecem! 💪';
    } else if (totalItems >= 1) {
      return 'Bom começo! Cada plano bem feito faz diferença na aprendizagem. 🌱';
    }
    return 'Que tal criar seu primeiro conteúdo da semana? Estamos aqui para ajudar! 🚀';
  };

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={bodyStyle}>
        <EmailHeader />
        
        <Container style={containerStyle}>
          <Section style={contentStyle}>
            {/* Header com período */}
            <Section style={headerBoxStyle}>
              <Text style={headerIconStyle}>📊</Text>
              <Text style={headerTitleStyle}>Seu Resumo Semanal</Text>
              <Text style={headerPeriodStyle}>
                {weekStartDate} - {weekEndDate}
              </Text>
            </Section>

            {/* Greeting */}
            <Text style={greetingStyle}>Olá, {userName}!</Text>
            
            <Text style={paragraphStyle}>
              Aqui está um resumo do que você criou esta semana no Educa Sol.
            </Text>

            {/* Métricas da semana */}
            <Section style={metricsContainerStyle}>
              <table cellPadding="0" cellSpacing="0" style={metricsTableStyle}>
                <tbody>
                  <tr>
                    <td style={metricCellStyle}>
                      <Text style={metricValueStyle}>{plansCreated}</Text>
                      <Text style={metricLabelStyle}>Planos de Aula</Text>
                    </td>
                    <td style={metricCellStyle}>
                      <Text style={metricValueStyle}>{activitiesGenerated}</Text>
                      <Text style={metricLabelStyle}>Atividades</Text>
                    </td>
                    <td style={metricCellStyle}>
                      <Text style={metricValueStyle}>{assessmentsCreated}</Text>
                      <Text style={metricLabelStyle}>Avaliações</Text>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>

            {/* Mensagem de encorajamento */}
            <Section style={encouragementBoxStyle}>
              <Text style={encouragementTextStyle}>
                {getEncouragementMessage()}
              </Text>
            </Section>

            {/* Dica da semana */}
            <Section style={tipContainerStyle}>
              <Text style={tipTitleStyle}>💡 Dica da Semana</Text>
              <Text style={tipTextStyle}>{weeklyTip}</Text>
            </Section>

            {/* CTA */}
            <Section style={ctaContainerStyle}>
              <Text style={ctaTitleStyle}>
                Pronto para mais uma semana produtiva?
              </Text>
              <Section style={buttonContainerStyle}>
                <EmailButton href={dashboardUrl} variant="primary">
                  Acessar Dashboard
                </EmailButton>
              </Section>
            </Section>

            <Text style={helpTextStyle}>
              Dúvidas ou sugestões? Estamos sempre ouvindo em{' '}
              <a href="mailto:suporte@educasol.com.br" style={linkStyle}>
                suporte@educasol.com.br
              </a>
            </Text>
          </Section>
        </Container>

        {/* Footer com opção de unsubscribe - email de notificação */}
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

const headerBoxStyle: React.CSSProperties = {
  textAlign: 'center' as const,
  padding: '24px',
  backgroundColor: '#EFF6FF',
  borderRadius: '12px',
  marginBottom: '24px',
};

const headerIconStyle: React.CSSProperties = {
  fontSize: '40px',
  margin: '0 0 8px 0',
};

const headerTitleStyle: React.CSSProperties = {
  color: '#1E40AF',
  fontSize: '20px',
  fontWeight: '700',
  margin: '0 0 4px 0',
};

const headerPeriodStyle: React.CSSProperties = {
  color: '#3B82F6',
  fontSize: '14px',
  fontWeight: '500',
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

const metricsContainerStyle: React.CSSProperties = {
  backgroundColor: '#F0FDF4',
  borderRadius: '12px',
  padding: '24px',
  marginBottom: '24px',
};

const metricsTableStyle: React.CSSProperties = {
  width: '100%',
};

const metricCellStyle: React.CSSProperties = {
  textAlign: 'center' as const,
  padding: '8px',
  width: '33.33%',
};

const metricValueStyle: React.CSSProperties = {
  color: '#166534',
  fontSize: '36px',
  fontWeight: '700',
  margin: '0 0 4px 0',
};

const metricLabelStyle: React.CSSProperties = {
  color: '#15803D',
  fontSize: '12px',
  fontWeight: '500',
  margin: '0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const encouragementBoxStyle: React.CSSProperties = {
  backgroundColor: '#FEF3C7',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '24px',
  textAlign: 'center' as const,
};

const encouragementTextStyle: React.CSSProperties = {
  color: '#92400E',
  fontSize: '14px',
  fontWeight: '500',
  margin: '0',
};

const tipContainerStyle: React.CSSProperties = {
  backgroundColor: '#F5F3FF',
  borderRadius: '12px',
  padding: '20px',
  marginBottom: '24px',
};

const tipTitleStyle: React.CSSProperties = {
  color: '#5B21B6',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 8px 0',
};

const tipTextStyle: React.CSSProperties = {
  color: '#7C3AED',
  fontSize: '13px',
  lineHeight: '1.5',
  margin: '0',
};

const ctaContainerStyle: React.CSSProperties = {
  textAlign: 'center' as const,
  marginBottom: '24px',
};

const ctaTitleStyle: React.CSSProperties = {
  color: '#334155',
  fontSize: '14px',
  margin: '0 0 16px 0',
};

const buttonContainerStyle: React.CSSProperties = {
  textAlign: 'center' as const,
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

export default ActivitySummaryEmail;
