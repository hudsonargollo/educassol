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

interface UsageFollowupEmailProps {
  /** Nome do usuário */
  userName?: string;
  /** Nome do plano atual */
  planName?: string;
  /** URL para upgrade */
  upgradeUrl?: string;
  /** Token para unsubscribe */
  unsubscribeToken?: string;
  /** Nome do professor no depoimento */
  testimonialAuthor?: string;
  /** Escola do professor no depoimento */
  testimonialSchool?: string;
  /** Texto do depoimento */
  testimonialText?: string;
  /** Desconto especial (ex: "20%") */
  specialDiscount?: string;
  /** Código do cupom */
  discountCode?: string;
}

/**
 * UsageFollowupEmail - Template de follow-up 24h após atingir limite
 * 
 * Email de notificação enviado 24h após o usuário atingir 100% da cota
 * e não ter convertido. Inclui prova social (depoimento) e oferta especial.
 * 
 * Requirements: 5.3
 */
export const UsageFollowupEmail: React.FC<UsageFollowupEmailProps> = ({
  userName = 'Professor',
  planName = 'Gratuito',
  upgradeUrl = 'https://educasol.com.br/settings/billing',
  unsubscribeToken,
  testimonialAuthor = 'Profa. Maria Silva',
  testimonialSchool = 'E.M. Paulo Freire, São Paulo',
  testimonialText = 'Desde que assinei o Premium, economizo pelo menos 5 horas por semana no planejamento. Os planos de aula já vêm alinhados à BNCC e posso focar no que realmente importa: meus alunos.',
  specialDiscount = '20%',
  discountCode = 'VOLTA20',
}) => {
  const previewText = `${userName}, temos uma oferta especial para você continuar criando`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={bodyStyle}>
        <EmailHeader />
        
        <Container style={containerStyle}>
          <Section style={contentStyle}>
            {/* Greeting */}
            <Text style={greetingStyle}>Olá, {userName} 👋</Text>
            
            <Text style={paragraphStyle}>
              Notamos que você atingiu o limite do plano {planName} ontem e ainda não 
              fez upgrade. Sabemos como é importante manter o ritmo do planejamento 
              pedagógico, então preparamos algo especial para você.
            </Text>

            {/* Prova Social - Depoimento */}
            <Section style={testimonialContainerStyle}>
              <Text style={testimonialQuoteStyle}>"</Text>
              <Text style={testimonialTextStyle}>
                {testimonialText}
              </Text>
              <Section style={testimonialAuthorContainerStyle}>
                <Text style={testimonialAuthorStyle}>{testimonialAuthor}</Text>
                <Text style={testimonialSchoolStyle}>{testimonialSchool}</Text>
              </Section>
            </Section>

            {/* Oferta Especial */}
            <Section style={offerContainerStyle}>
              <Text style={offerBadgeStyle}>🎁 OFERTA ESPECIAL</Text>
              <Text style={offerTitleStyle}>
                {specialDiscount} de desconto no primeiro mês
              </Text>
              <Text style={offerDescStyle}>
                Use o código abaixo no checkout e comece a criar sem limites hoje mesmo.
              </Text>
              
              <Section style={couponContainerStyle}>
                <Text style={couponCodeStyle}>{discountCode}</Text>
              </Section>

              <Text style={offerExpiryStyle}>
                ⏰ Oferta válida por 48 horas
              </Text>
            </Section>

            {/* Benefícios rápidos */}
            <Text style={sectionTitleStyle}>
              Com o Premium você terá:
            </Text>

            <Section style={benefitsContainerStyle}>
              <table cellPadding="0" cellSpacing="0" style={benefitsTableStyle}>
                <tbody>
                  <tr>
                    <td style={benefitIconCellStyle}>
                      <Text style={benefitIconStyle}>♾️</Text>
                    </td>
                    <td style={benefitTextCellStyle}>
                      <Text style={benefitTextStyle}>Gerações ilimitadas de planos e atividades</Text>
                    </td>
                  </tr>
                  <tr>
                    <td style={benefitIconCellStyle}>
                      <Text style={benefitIconStyle}>🎯</Text>
                    </td>
                    <td style={benefitTextCellStyle}>
                      <Text style={benefitTextStyle}>Alinhamento BNCC avançado com sugestões inteligentes</Text>
                    </td>
                  </tr>
                  <tr>
                    <td style={benefitIconCellStyle}>
                      <Text style={benefitIconStyle}>📊</Text>
                    </td>
                    <td style={benefitTextCellStyle}>
                      <Text style={benefitTextStyle}>Diferenciação automática para diferentes níveis</Text>
                    </td>
                  </tr>
                  <tr>
                    <td style={benefitIconCellStyle}>
                      <Text style={benefitIconStyle}>⚡</Text>
                    </td>
                    <td style={benefitTextCellStyle}>
                      <Text style={benefitTextStyle}>Suporte prioritário para suas dúvidas</Text>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>

            {/* CTA */}
            <Section style={buttonContainerStyle}>
              <EmailButton href={`${upgradeUrl}?coupon=${discountCode}`} variant="primary">
                Aproveitar Oferta
              </EmailButton>
            </Section>

            <Text style={helpTextStyle}>
              Dúvidas? Responda este email ou fale conosco em{' '}
              <a href="mailto:suporte@educasol.com.br" style={linkStyle}>
                suporte@educasol.com.br
              </a>
            </Text>
          </Section>
        </Container>

        {/* Footer com opção de unsubscribe - email de marketing */}
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

const testimonialContainerStyle: React.CSSProperties = {
  backgroundColor: '#F8FAFC',
  borderLeft: '4px solid #2563EB',
  borderRadius: '0 8px 8px 0',
  padding: '20px 24px',
  marginBottom: '24px',
  position: 'relative' as const,
};

const testimonialQuoteStyle: React.CSSProperties = {
  color: '#2563EB',
  fontSize: '48px',
  fontWeight: '700',
  lineHeight: '1',
  margin: '0 0 -20px 0',
  opacity: 0.3,
};

const testimonialTextStyle: React.CSSProperties = {
  color: '#334155',
  fontSize: '14px',
  fontStyle: 'italic' as const,
  lineHeight: '1.6',
  margin: '0 0 16px 0',
};

const testimonialAuthorContainerStyle: React.CSSProperties = {
  borderTop: '1px solid #E2E8F0',
  paddingTop: '12px',
};

const testimonialAuthorStyle: React.CSSProperties = {
  color: '#0F172A',
  fontSize: '13px',
  fontWeight: '600',
  margin: '0 0 2px 0',
};

const testimonialSchoolStyle: React.CSSProperties = {
  color: '#64748B',
  fontSize: '12px',
  margin: '0',
};

const offerContainerStyle: React.CSSProperties = {
  backgroundColor: '#FEF3C7',
  borderRadius: '12px',
  padding: '24px',
  marginBottom: '24px',
  textAlign: 'center' as const,
};

const offerBadgeStyle: React.CSSProperties = {
  color: '#92400E',
  fontSize: '11px',
  fontWeight: '700',
  letterSpacing: '1px',
  margin: '0 0 8px 0',
  textTransform: 'uppercase' as const,
};

const offerTitleStyle: React.CSSProperties = {
  color: '#78350F',
  fontSize: '24px',
  fontWeight: '700',
  margin: '0 0 8px 0',
};

const offerDescStyle: React.CSSProperties = {
  color: '#92400E',
  fontSize: '13px',
  margin: '0 0 16px 0',
};

const couponContainerStyle: React.CSSProperties = {
  backgroundColor: '#FFFFFF',
  borderRadius: '8px',
  border: '2px dashed #F59E0B',
  padding: '12px 24px',
  display: 'inline-block',
  marginBottom: '12px',
};

const couponCodeStyle: React.CSSProperties = {
  color: '#78350F',
  fontSize: '20px',
  fontWeight: '700',
  fontFamily: "'Courier New', monospace",
  letterSpacing: '2px',
  margin: '0',
};

const offerExpiryStyle: React.CSSProperties = {
  color: '#B45309',
  fontSize: '12px',
  fontWeight: '500',
  margin: '0',
};

const sectionTitleStyle: React.CSSProperties = {
  color: '#0F172A',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 12px 0',
};

const benefitsContainerStyle: React.CSSProperties = {
  marginBottom: '24px',
};

const benefitsTableStyle: React.CSSProperties = {
  width: '100%',
};

const benefitIconCellStyle: React.CSSProperties = {
  width: '32px',
  verticalAlign: 'top',
  paddingBottom: '8px',
};

const benefitIconStyle: React.CSSProperties = {
  fontSize: '16px',
  margin: '0',
};

const benefitTextCellStyle: React.CSSProperties = {
  verticalAlign: 'top',
  paddingBottom: '8px',
};

const benefitTextStyle: React.CSSProperties = {
  color: '#334155',
  fontSize: '13px',
  margin: '0',
  lineHeight: '1.4',
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

export default UsageFollowupEmail;
