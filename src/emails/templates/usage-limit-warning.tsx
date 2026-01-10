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
import { ProgressBar } from '../components/ProgressBar';

interface UsageLimitWarningEmailProps {
  /** Nome do usuário */
  userName?: string;
  /** Porcentagem de uso atual (80 ou 100) */
  usagePercent?: number;
  /** Nome do plano atual */
  planName?: string;
  /** Quantidade usada */
  usedCount?: number;
  /** Limite total do plano */
  limitCount?: number;
  /** URL para upgrade */
  upgradeUrl?: string;
  /** Token para unsubscribe */
  unsubscribeToken?: string;
}

/**
 * UsageLimitWarningEmail - Template de alerta de uso
 * 
 * Email de notificação enviado quando o usuário atinge 80% ou 100% da cota.
 * Inclui barra de progresso visual, comparativo Free vs Premium e CTA de upgrade.
 * 
 * Requirements: 5.1, 5.2
 * Validates: Property 8 (80% threshold), Property 9 (100% threshold)
 */
export const UsageLimitWarningEmail: React.FC<UsageLimitWarningEmailProps> = ({
  userName = 'Professor',
  usagePercent = 80,
  planName = 'Gratuito',
  usedCount = 8,
  limitCount = 10,
  upgradeUrl = 'https://educasol.com.br/settings/billing',
  unsubscribeToken,
}) => {
  const isAtLimit = usagePercent >= 100;
  const previewText = isAtLimit
    ? `Você atingiu o limite do plano ${planName}`
    : `Você está usando ${usagePercent}% do seu plano ${planName}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={bodyStyle}>
        <EmailHeader />
        
        <Container style={containerStyle}>
          <Section style={contentStyle}>
            {/* Alert Box */}
            <Section style={isAtLimit ? alertBoxLimitStyle : alertBoxWarningStyle}>
              <Text style={alertIconStyle}>{isAtLimit ? '🚨' : '⚠️'}</Text>
              <Text style={isAtLimit ? alertTitleLimitStyle : alertTitleWarningStyle}>
                {isAtLimit 
                  ? 'Você atingiu o limite do plano' 
                  : 'Você está quase no limite'}
              </Text>
            </Section>

            <Text style={greetingStyle}>Olá, {userName}</Text>
            
            <Text style={paragraphStyle}>
              {isAtLimit 
                ? `Você utilizou todas as ${limitCount} gerações disponíveis no plano ${planName} este mês.`
                : `Você já utilizou ${usedCount} de ${limitCount} gerações disponíveis no plano ${planName} este mês.`
              }
            </Text>

            {/* Progress Bar */}
            <Section style={progressContainerStyle}>
              <ProgressBar 
                percent={usagePercent} 
                label="Uso do plano"
                showPercent={true}
              />
              <Text style={usageDetailStyle}>
                {usedCount} de {limitCount} gerações utilizadas
              </Text>
            </Section>

            {/* Comparativo Free vs Premium */}
            <Text style={sectionTitleStyle}>
              📊 Compare os planos
            </Text>

            <Section style={comparisonContainerStyle}>
              <table cellPadding="0" cellSpacing="0" style={comparisonTableStyle}>
                <thead>
                  <tr>
                    <th style={comparisonHeaderCellStyle}></th>
                    <th style={comparisonHeaderCellStyle}>
                      <Text style={planHeaderFreeStyle}>Gratuito</Text>
                    </th>
                    <th style={comparisonHeaderCellStyle}>
                      <Text style={planHeaderPremiumStyle}>Premium ✨</Text>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={featureCellStyle}>
                      <Text style={featureTextStyle}>Gerações/mês</Text>
                    </td>
                    <td style={valueCellStyle}>
                      <Text style={valueTextStyle}>10</Text>
                    </td>
                    <td style={valueCellPremiumStyle}>
                      <Text style={valuePremiumTextStyle}>Ilimitadas</Text>
                    </td>
                  </tr>
                  <tr>
                    <td style={featureCellStyle}>
                      <Text style={featureTextStyle}>Alinhamento BNCC</Text>
                    </td>
                    <td style={valueCellStyle}>
                      <Text style={valueTextStyle}>Básico</Text>
                    </td>
                    <td style={valueCellPremiumStyle}>
                      <Text style={valuePremiumTextStyle}>Avançado</Text>
                    </td>
                  </tr>
                  <tr>
                    <td style={featureCellStyle}>
                      <Text style={featureTextStyle}>Diferenciação</Text>
                    </td>
                    <td style={valueCellStyle}>
                      <Text style={valueTextStyle}>—</Text>
                    </td>
                    <td style={valueCellPremiumStyle}>
                      <Text style={valuePremiumTextStyle}>✓</Text>
                    </td>
                  </tr>
                  <tr>
                    <td style={featureCellStyle}>
                      <Text style={featureTextStyle}>Suporte</Text>
                    </td>
                    <td style={valueCellStyle}>
                      <Text style={valueTextStyle}>Email</Text>
                    </td>
                    <td style={valueCellPremiumStyle}>
                      <Text style={valuePremiumTextStyle}>Prioritário</Text>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>

            {/* CTA de Upgrade */}
            <Section style={ctaContainerStyle}>
              <Text style={ctaTitleStyle}>
                {isAtLimit 
                  ? '🔓 Desbloqueie gerações ilimitadas' 
                  : '🚀 Faça upgrade e continue criando'}
              </Text>
              <Text style={ctaDescStyle}>
                Com o plano Premium, você cria quantos planos de aula e atividades precisar, 
                sem se preocupar com limites.
              </Text>
              <Section style={buttonContainerStyle}>
                <EmailButton href={upgradeUrl} variant="primary">
                  Fazer Upgrade Agora
                </EmailButton>
              </Section>
            </Section>

            {isAtLimit && (
              <Section style={infoBoxStyle}>
                <Text style={infoTextStyle}>
                  💡 Seu limite será renovado no início do próximo mês. 
                  Ou faça upgrade agora para continuar criando.
                </Text>
              </Section>
            )}

            <Text style={helpTextStyle}>
              Dúvidas sobre os planos? Fale conosco em{' '}
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

const alertBoxWarningStyle: React.CSSProperties = {
  backgroundColor: '#FFFBEB',
  borderRadius: '12px',
  padding: '20px',
  textAlign: 'center' as const,
  marginBottom: '24px',
};

const alertBoxLimitStyle: React.CSSProperties = {
  backgroundColor: '#FEF2F2',
  borderRadius: '12px',
  padding: '20px',
  textAlign: 'center' as const,
  marginBottom: '24px',
};

const alertIconStyle: React.CSSProperties = {
  fontSize: '32px',
  margin: '0 0 8px 0',
};

const alertTitleWarningStyle: React.CSSProperties = {
  color: '#92400E',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0',
};

const alertTitleLimitStyle: React.CSSProperties = {
  color: '#991B1B',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0',
};

const greetingStyle: React.CSSProperties = {
  color: '#0F172A',
  fontSize: '16px',
  fontWeight: '500',
  margin: '0 0 16px 0',
};

const paragraphStyle: React.CSSProperties = {
  color: '#64748B',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0 0 24px 0',
};

const progressContainerStyle: React.CSSProperties = {
  backgroundColor: '#F8FAFC',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '24px',
};

const usageDetailStyle: React.CSSProperties = {
  color: '#64748B',
  fontSize: '12px',
  textAlign: 'center' as const,
  margin: '8px 0 0 0',
};

const sectionTitleStyle: React.CSSProperties = {
  color: '#0F172A',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 16px 0',
};

const comparisonContainerStyle: React.CSSProperties = {
  marginBottom: '24px',
};

const comparisonTableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse' as const,
};

const comparisonHeaderCellStyle: React.CSSProperties = {
  padding: '8px',
  textAlign: 'center' as const,
};

const planHeaderFreeStyle: React.CSSProperties = {
  color: '#64748B',
  fontSize: '12px',
  fontWeight: '600',
  margin: '0',
};

const planHeaderPremiumStyle: React.CSSProperties = {
  color: '#2563EB',
  fontSize: '12px',
  fontWeight: '600',
  margin: '0',
};

const featureCellStyle: React.CSSProperties = {
  padding: '10px 8px',
  borderBottom: '1px solid #E2E8F0',
};

const featureTextStyle: React.CSSProperties = {
  color: '#334155',
  fontSize: '13px',
  margin: '0',
};

const valueCellStyle: React.CSSProperties = {
  padding: '10px 8px',
  borderBottom: '1px solid #E2E8F0',
  textAlign: 'center' as const,
};

const valueCellPremiumStyle: React.CSSProperties = {
  padding: '10px 8px',
  borderBottom: '1px solid #E2E8F0',
  textAlign: 'center' as const,
  backgroundColor: '#EFF6FF',
};

const valueTextStyle: React.CSSProperties = {
  color: '#64748B',
  fontSize: '13px',
  margin: '0',
};

const valuePremiumTextStyle: React.CSSProperties = {
  color: '#2563EB',
  fontSize: '13px',
  fontWeight: '500',
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
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 8px 0',
};

const ctaDescStyle: React.CSSProperties = {
  color: '#3B82F6',
  fontSize: '13px',
  lineHeight: '1.5',
  margin: '0 0 16px 0',
};

const buttonContainerStyle: React.CSSProperties = {
  textAlign: 'center' as const,
};

const infoBoxStyle: React.CSSProperties = {
  backgroundColor: '#F0FDF4',
  borderRadius: '8px',
  padding: '12px 16px',
  marginBottom: '24px',
};

const infoTextStyle: React.CSSProperties = {
  color: '#166534',
  fontSize: '13px',
  margin: '0',
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

export default UsageLimitWarningEmail;
