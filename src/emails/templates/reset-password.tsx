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

interface ResetPasswordEmailProps {
  /** Nome do usuário */
  userName?: string;
  /** URL segura para redefinição de senha */
  resetUrl: string;
  /** Tempo de expiração do link em horas */
  expirationHours?: number;
}

/**
 * ResetPasswordEmail - Template para redefinição de senha
 * 
 * Email transacional enviado quando o usuário solicita redefinição de senha.
 * Inclui botão de ação seguro com link temporário.
 * 
 * Requirements: 4.1
 * Validates: Transactional email - não inclui conteúdo de marketing
 */
export const ResetPasswordEmail: React.FC<ResetPasswordEmailProps> = ({
  userName = 'Professor',
  resetUrl,
  expirationHours = 24,
}) => {
  return (
    <Html>
      <Head />
      <Preview>Redefina sua senha do Educa Sol</Preview>
      <Body style={bodyStyle}>
        <EmailHeader />
        
        <Container style={containerStyle}>
          <Section style={contentStyle}>
            <Text style={greetingStyle}>
              Olá, {userName}! 🔐
            </Text>
            
            <Text style={paragraphStyle}>
              Recebemos uma solicitação para redefinir a senha da sua conta no Educa Sol.
            </Text>

            <Text style={paragraphStyle}>
              Clique no botão abaixo para criar uma nova senha:
            </Text>

            <Section style={buttonContainerStyle}>
              <EmailButton href={resetUrl}>
                Redefinir Senha
              </EmailButton>
            </Section>

            <Text style={expirationStyle}>
              Este link expira em {expirationHours} horas.
            </Text>

            <Section style={securityBoxStyle}>
              <Text style={securityTitleStyle}>
                🛡️ Dica de segurança
              </Text>
              <Text style={securityTextStyle}>
                Se você não solicitou esta redefinição de senha, ignore este email. 
                Sua senha atual permanecerá inalterada.
              </Text>
            </Section>

            <Text style={helpTextStyle}>
              Está com problemas? Entre em contato com nosso suporte em{' '}
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

const greetingStyle: React.CSSProperties = {
  color: '#0F172A',
  fontSize: '20px',
  fontWeight: '600',
  margin: '0 0 16px 0',
};

const paragraphStyle: React.CSSProperties = {
  color: '#64748B',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0 0 16px 0',
};

const buttonContainerStyle: React.CSSProperties = {
  textAlign: 'center' as const,
  margin: '24px 0',
};

const expirationStyle: React.CSSProperties = {
  color: '#94A3B8',
  fontSize: '12px',
  textAlign: 'center' as const,
  margin: '0 0 24px 0',
};

const securityBoxStyle: React.CSSProperties = {
  backgroundColor: '#FEF3C7',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
};

const securityTitleStyle: React.CSSProperties = {
  color: '#92400E',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 8px 0',
};

const securityTextStyle: React.CSSProperties = {
  color: '#92400E',
  fontSize: '13px',
  lineHeight: '1.5',
  margin: '0',
};

const helpTextStyle: React.CSSProperties = {
  color: '#94A3B8',
  fontSize: '12px',
  textAlign: 'center' as const,
  margin: '24px 0 0 0',
};

const linkStyle: React.CSSProperties = {
  color: '#2563EB',
  textDecoration: 'underline',
};

export default ResetPasswordEmail;
