import {
  Container,
  Heading,
  Img,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface EmailHeaderProps {
  previewText?: string;
}

/**
 * EmailHeader - Cabeçalho padrão para todos os emails do Educa Sol
 * 
 * Inclui logo e nome da marca com estilos inline para compatibilidade
 * com clientes de email.
 * 
 * Requirements: 3.4
 */
export const EmailHeader: React.FC<EmailHeaderProps> = ({ previewText }) => {
  return (
    <Section style={headerStyle}>
      <Container style={containerStyle}>
        {/* Logo placeholder - usar URL absoluta em produção */}
        <table cellPadding="0" cellSpacing="0" style={logoTableStyle}>
          <tbody>
            <tr>
              <td style={logoIconStyle}>
                <span style={logoEmojiStyle}>☀️</span>
              </td>
              <td style={logoTextCellStyle}>
                <Text style={logoTextStyle}>Educa Sol</Text>
              </td>
            </tr>
          </tbody>
        </table>
        {previewText && (
          <Text style={previewStyle}>{previewText}</Text>
        )}
      </Container>
    </Section>
  );
};

// Estilos inline para compatibilidade com clientes de email
const headerStyle: React.CSSProperties = {
  backgroundColor: '#2563EB',
  padding: '24px 0',
};

const containerStyle: React.CSSProperties = {
  maxWidth: '600px',
  margin: '0 auto',
  padding: '0 20px',
};

const logoTableStyle: React.CSSProperties = {
  margin: '0 auto',
};

const logoIconStyle: React.CSSProperties = {
  verticalAlign: 'middle',
  paddingRight: '8px',
};

const logoEmojiStyle: React.CSSProperties = {
  fontSize: '28px',
};

const logoTextCellStyle: React.CSSProperties = {
  verticalAlign: 'middle',
};

const logoTextStyle: React.CSSProperties = {
  color: '#FFFFFF',
  fontSize: '24px',
  fontWeight: '700',
  fontFamily: "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  margin: '0',
  lineHeight: '1',
};

const previewStyle: React.CSSProperties = {
  display: 'none',
  maxHeight: '0',
  overflow: 'hidden',
};

export default EmailHeader;
