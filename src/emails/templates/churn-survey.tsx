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

interface ChurnSurveyEmailProps {
  /** Nome do usuário */
  userName?: string;
  /** URL da pesquisa de satisfação */
  surveyUrl?: string;
  /** URL para reativar assinatura */
  reactivateUrl?: string;
  /** Desconto oferecido para reativação */
  discountPercent?: string;
  /** Código do cupom de desconto */
  discountCode?: string;
  /** Dias de validade da oferta */
  offerValidDays?: number;
  /** Token para unsubscribe */
  unsubscribeToken?: string;
}

/**
 * ChurnSurveyEmail - Template de pesquisa de satisfação pós-cancelamento
 * 
 * Email enviado quando um usuário cancela a assinatura Premium.
 * Inclui pesquisa de satisfação e oferta de desconto para reativação.
 * 
 * Requirements: 8.1, 8.2, 8.3
 */
export const ChurnSurveyEmail: React.FC<ChurnSurveyEmailProps> = ({
  userName = 'Professor',
  surveyUrl = 'https://educasol.com.br/feedback',
  reactivateUrl = 'https://educasol.com.br/settings/billing',
  discountPercent = '30%',
  discountCode = 'VOLTE30',
  offerValidDays = 7,
  unsubscribeToken,
}) => {
  const previewText = `${userName}, sua opinião é muito importante para nós`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={bodyStyle}>
        <EmailHeader />
        
        <Container style={containerStyle}>
          <Section style={contentStyle}>
            {/* Header */}
            <Section style={headerBoxStyle}>
              <Text style={headerEmojiStyle}>💬</Text>
              <Text style={headerTitleStyle}>Sua opinião importa</Text>
            </Section>

            {/* Greeting */}
            <Text style={greetingStyle}>Olá, {userName}!</Text>
            
            <Text style={paragraphStyle}>
              Vimos que você cancelou sua assinatura Premium. Sentimos muito por isso! 
              Gostaríamos muito de entender o que aconteceu para podermos melhorar.
            </Text>

            <Text style={paragraphStyle}>
              Poderia nos contar o motivo do cancelamento? Sua resposta nos ajuda a 
              criar uma experiência melhor para todos os professores.
            </Text>

            {/* CTA Pesquisa */}
            <Section style={surveyContainerStyle}>
              <Text style={surveyTitleStyle}>
                📋 Pesquisa rápida (2 minutos)
              </Text>
              <Text style={surveyDescStyle}>
                Não precisa fazer login. Basta clicar no botão abaixo.
              </Text>
              <Section style={buttonContainerStyle}>
                <EmailButton href={surveyUrl} variant="secondary">
                  Responder Pesquisa
                </EmailButton>
              </Section>
            </Section>

            {/* Oferta de reativação */}
            <Section style={offerContainerStyle}>
              <Text style={offerBadgeStyle}>🎁 OFERTA ESPECIAL DE RETORNO</Text>
              <Text style={offerTitleStyle}>
                {discountPercent} de desconto
              </Text>
              <Text style={offerSubtitleStyle}>
                nos próximos 3 meses
              </Text>
              <Text style={offerDescStyle}>
                Sabemos que imprevistos acontecem. Se quiser voltar, 
                preparamos uma condição especial para você.
              </Text>
              
              <Section style={couponContainerStyle}>
                <Text style={couponLabelStyle}>Use o código:</Text>
                <Text style={couponCodeStyle}>{discountCode}</Text>
              </Section>

              <Section style={buttonContainerStyle}>
                <EmailButton href={`${reactivateUrl}?coupon=${discountCode}`} variant="primary">
                  Reativar com Desconto
                </EmailButton>
              </Section>

              <Text style={offerExpiryStyle}>
                ⏰ Oferta válida por {offerValidDays} dias
              </Text>
            </Section>

            {/* Mensagem de despedida */}
            <Section style={farewellContainerStyle}>
              <Text style={farewellTextStyle}>
                Independente da sua decisão, agradecemos por ter feito parte da 
                comunidade Educa Sol. Seus planos e atividades continuam disponíveis 
                no plano gratuito, com limite de 10 gerações por mês.
              </Text>
            </Section>

            <Text style={helpTextStyle}>
              Dúvidas? Estamos aqui em{' '}
              <a href="mailto:suporte@educasol.com.br" style={linkStyle}>
                suporte@educasol.com.br
              </a>
            </Text>
          </Section>
        </Container>

        {/* Footer com opção de unsubscribe - email transacional/marketing */}
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
  backgroundColor: '#F8FAFC',
  borderRadius: '12px',
  marginBottom: '24px',
};

const headerEmojiStyle: React.CSSProperties = {
  fontSize: '48px',
  margin: '0 0 8px 0',
};

const headerTitleStyle: React.CSSProperties = {
  color: '#334155',
  fontSize: '22px',
  fontWeight: '700',
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
  margin: '0 0 16px 0',
};

const surveyContainerStyle: React.CSSProperties = {
  backgroundColor: '#EFF6FF',
  borderRadius: '12px',
  padding: '24px',
  marginBottom: '24px',
  textAlign: 'center' as const,
};

const surveyTitleStyle: React.CSSProperties = {
  color: '#1E40AF',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 8px 0',
};

const surveyDescStyle: React.CSSProperties = {
  color: '#3B82F6',
  fontSize: '13px',
  margin: '0 0 16px 0',
};

const offerContainerStyle: React.CSSProperties = {
  backgroundColor: '#F0FDF4',
  borderRadius: '12px',
  padding: '24px',
  marginBottom: '24px',
  textAlign: 'center' as const,
  border: '2px solid #86EFAC',
};

const offerBadgeStyle: React.CSSProperties = {
  color: '#166534',
  fontSize: '11px',
  fontWeight: '700',
  letterSpacing: '1px',
  margin: '0 0 8px 0',
  textTransform: 'uppercase' as const,
};

const offerTitleStyle: React.CSSProperties = {
  color: '#14532D',
  fontSize: '32px',
  fontWeight: '700',
  margin: '0',
};

const offerSubtitleStyle: React.CSSProperties = {
  color: '#166534',
  fontSize: '16px',
  fontWeight: '500',
  margin: '0 0 12px 0',
};

const offerDescStyle: React.CSSProperties = {
  color: '#15803D',
  fontSize: '13px',
  lineHeight: '1.5',
  margin: '0 0 16px 0',
};

const couponContainerStyle: React.CSSProperties = {
  backgroundColor: '#FFFFFF',
  borderRadius: '8px',
  border: '2px dashed #22C55E',
  padding: '12px 24px',
  marginBottom: '16px',
  display: 'inline-block',
};

const couponLabelStyle: React.CSSProperties = {
  color: '#166534',
  fontSize: '11px',
  margin: '0 0 4px 0',
  textTransform: 'uppercase' as const,
};

const couponCodeStyle: React.CSSProperties = {
  color: '#14532D',
  fontSize: '20px',
  fontWeight: '700',
  fontFamily: "'Courier New', monospace",
  letterSpacing: '2px',
  margin: '0',
};

const buttonContainerStyle: React.CSSProperties = {
  textAlign: 'center' as const,
  marginBottom: '12px',
};

const offerExpiryStyle: React.CSSProperties = {
  color: '#15803D',
  fontSize: '12px',
  fontWeight: '500',
  margin: '0',
};

const farewellContainerStyle: React.CSSProperties = {
  backgroundColor: '#F8FAFC',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '24px',
};

const farewellTextStyle: React.CSSProperties = {
  color: '#64748B',
  fontSize: '13px',
  lineHeight: '1.6',
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

export default ChurnSurveyEmail;
