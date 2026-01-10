import {
  Container,
  Hr,
  Link,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface EmailFooterProps {
  /** Token para unsubscribe (obrigatório para emails de marketing) */
  unsubscribeToken?: string;
  /** URL base do app */
  baseUrl?: string;
  /** Se é email de marketing (mostra link de unsubscribe) */
  isMarketing?: boolean;
}

/**
 * EmailFooter - Rodapé padrão para todos os emails do Educa Sol
 * 
 * Inclui links úteis e link de descadastrar para emails de marketing.
 * O link de unsubscribe é obrigatório para emails de marketing (LGPD).
 * 
 * Requirements: 2.4, 3.4
 */
export const EmailFooter: React.FC<EmailFooterProps> = ({
  unsubscribeToken,
  baseUrl = 'https://educasol.com.br',
  isMarketing = false,
}) => {
  const unsubscribeUrl = unsubscribeToken
    ? `${baseUrl}/unsubscribe?token=${unsubscribeToken}`
    : `${baseUrl}/settings/notifications`;

  return (
    <Section style={footerStyle}>
      <Container style={containerStyle}>
        <Hr style={dividerStyle} />
        
        {/* Links úteis */}
        <table cellPadding="0" cellSpacing="0" style={linksTableStyle}>
          <tbody>
            <tr>
              <td style={linkCellStyle}>
                <Link href={`${baseUrl}/help`} style={linkStyle}>
                  Central de Ajuda
                </Link>
              </td>
              <td style={separatorCellStyle}>
                <Text style={separatorStyle}>•</Text>
              </td>
              <td style={linkCellStyle}>
                <Link href={`${baseUrl}/privacy`} style={linkStyle}>
                  Privacidade
                </Link>
              </td>
              <td style={separatorCellStyle}>
                <Text style={separatorStyle}>•</Text>
              </td>
              <td style={linkCellStyle}>
                <Link href={`${baseUrl}/terms`} style={linkStyle}>
                  Termos de Uso
                </Link>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Informações da empresa */}
        <Text style={companyTextStyle}>
          Educa Sol - Plataforma de Planejamento Pedagógico
        </Text>
        <Text style={addressStyle}>
          Brasil
        </Text>

        {/* Link de descadastrar (apenas para marketing) */}
        {isMarketing && (
          <Text style={unsubscribeTextStyle}>
            Não quer mais receber estes emails?{' '}
            <Link href={unsubscribeUrl} style={unsubscribeLinkStyle}>
              Descadastrar
            </Link>
          </Text>
        )}

        <Text style={copyrightStyle}>
          © {new Date().getFullYear()} Educa Sol. Todos os direitos reservados.
        </Text>
      </Container>
    </Section>
  );
};

// Estilos inline para compatibilidade com clientes de email
const footerStyle: React.CSSProperties = {
  backgroundColor: '#F1F5F9',
  padding: '32px 0',
};

const containerStyle: React.CSSProperties = {
  maxWidth: '600px',
  margin: '0 auto',
  padding: '0 20px',
};

const dividerStyle: React.CSSProperties = {
  borderColor: '#E2E8F0',
  borderWidth: '1px',
  margin: '0 0 24px 0',
};

const linksTableStyle: React.CSSProperties = {
  margin: '0 auto 16px auto',
};

const linkCellStyle: React.CSSProperties = {
  padding: '0 4px',
};

const separatorCellStyle: React.CSSProperties = {
  padding: '0 8px',
};

const separatorStyle: React.CSSProperties = {
  color: '#64748B',
  fontSize: '12px',
  margin: '0',
};

const linkStyle: React.CSSProperties = {
  color: '#2563EB',
  fontSize: '12px',
  textDecoration: 'none',
  fontFamily: "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
};

const companyTextStyle: React.CSSProperties = {
  color: '#64748B',
  fontSize: '12px',
  textAlign: 'center' as const,
  margin: '0 0 4px 0',
  fontFamily: "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
};

const addressStyle: React.CSSProperties = {
  color: '#64748B',
  fontSize: '12px',
  textAlign: 'center' as const,
  margin: '0 0 16px 0',
  fontFamily: "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
};

const unsubscribeTextStyle: React.CSSProperties = {
  color: '#64748B',
  fontSize: '11px',
  textAlign: 'center' as const,
  margin: '0 0 16px 0',
  fontFamily: "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
};

const unsubscribeLinkStyle: React.CSSProperties = {
  color: '#64748B',
  textDecoration: 'underline',
};

const copyrightStyle: React.CSSProperties = {
  color: '#94A3B8',
  fontSize: '11px',
  textAlign: 'center' as const,
  margin: '0',
  fontFamily: "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
};

export default EmailFooter;
