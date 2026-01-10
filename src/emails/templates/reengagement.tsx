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

interface ReengagementEmailProps {
  /** Nome do usuário */
  userName?: string;
  /** Dias desde o último acesso */
  daysSinceLastVisit?: number;
  /** URL do dashboard */
  dashboardUrl?: string;
  /** Token para unsubscribe */
  unsubscribeToken?: string;
  /** Dica BNCC para incluir */
  bnccTip?: string;
  /** Título da dica BNCC */
  bnccTipTitle?: string;
}

/**
 * ReengagementEmail - Template de re-engajamento para usuários inativos
 * 
 * Email de marketing enviado quando o usuário fica 14 dias sem login.
 * Inclui conteúdo educacional relevante (dicas BNCC) e CTA para voltar.
 * 
 * Requirements: 7.1, 7.2
 */
export const ReengagementEmail: React.FC<ReengagementEmailProps> = ({
  userName = 'Professor',
  daysSinceLastVisit = 14,
  dashboardUrl = 'https://educasol.com.br/dashboard',
  unsubscribeToken,
  bnccTip = 'A BNCC organiza as competências em 10 competências gerais que devem ser desenvolvidas ao longo de toda a Educação Básica. Ao planejar suas aulas, tente conectar os objetivos específicos a pelo menos uma dessas competências gerais para um planejamento mais integrado.',
  bnccTipTitle = 'Competências Gerais da BNCC',
}) => {
  const previewText = `${userName}, sentimos sua falta! Volte e continue criando planos incríveis 💙`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={bodyStyle}>
        <EmailHeader />
        
        <Container style={containerStyle}>
          <Section style={contentStyle}>
            {/* Header emocional */}
            <Section style={headerBoxStyle}>
              <Text style={headerEmojiStyle}>💙</Text>
              <Text style={headerTitleStyle}>Sentimos sua falta!</Text>
            </Section>

            {/* Greeting */}
            <Text style={greetingStyle}>Olá, {userName}!</Text>
            
            <Text style={paragraphStyle}>
              Faz {daysSinceLastVisit} dias que você não nos visita. Esperamos que esteja tudo bem! 
              Sabemos que a rotina de professor é corrida, mas queremos lembrar que estamos 
              aqui para facilitar seu planejamento pedagógico.
            </Text>

            {/* O que há de novo */}
            <Text style={sectionTitleStyle}>✨ O que há de novo</Text>
            
            <Section style={newsContainerStyle}>
              <table cellPadding="0" cellSpacing="0" style={newsTableStyle}>
                <tbody>
                  <tr>
                    <td style={newsIconCellStyle}>
                      <Text style={newsIconStyle}>🎯</Text>
                    </td>
                    <td style={newsTextCellStyle}>
                      <Text style={newsTitleStyle}>Alinhamento BNCC aprimorado</Text>
                      <Text style={newsDescStyle}>
                        Sugestões mais precisas de habilidades e competências
                      </Text>
                    </td>
                  </tr>
                  <tr>
                    <td style={newsIconCellStyle}>
                      <Text style={newsIconStyle}>⚡</Text>
                    </td>
                    <td style={newsTextCellStyle}>
                      <Text style={newsTitleStyle}>Geração mais rápida</Text>
                      <Text style={newsDescStyle}>
                        Planos de aula prontos em segundos
                      </Text>
                    </td>
                  </tr>
                  <tr>
                    <td style={newsIconCellStyle}>
                      <Text style={newsIconStyle}>📑</Text>
                    </td>
                    <td style={newsTextCellStyle}>
                      <Text style={newsTitleStyle}>Novos templates</Text>
                      <Text style={newsDescStyle}>
                        Mais opções para diferentes metodologias
                      </Text>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>

            {/* Dica BNCC - Conteúdo educacional */}
            <Section style={bnccTipContainerStyle}>
              <Text style={bnccTipBadgeStyle}>📚 DICA BNCC</Text>
              <Text style={bnccTipTitleStyle}>{bnccTipTitle}</Text>
              <Text style={bnccTipTextStyle}>{bnccTip}</Text>
            </Section>

            {/* CTA */}
            <Section style={ctaContainerStyle}>
              <Text style={ctaTitleStyle}>
                Pronto para voltar a criar?
              </Text>
              <Text style={ctaDescStyle}>
                Seus planos e atividades estão esperando por você.
              </Text>
              <Section style={buttonContainerStyle}>
                <EmailButton href={dashboardUrl} variant="primary">
                  Voltar ao Educa Sol
                </EmailButton>
              </Section>
            </Section>

            <Text style={helpTextStyle}>
              Precisa de ajuda? Estamos aqui em{' '}
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

const headerBoxStyle: React.CSSProperties = {
  textAlign: 'center' as const,
  padding: '24px',
  backgroundColor: '#EFF6FF',
  borderRadius: '12px',
  marginBottom: '24px',
};

const headerEmojiStyle: React.CSSProperties = {
  fontSize: '48px',
  margin: '0 0 8px 0',
};

const headerTitleStyle: React.CSSProperties = {
  color: '#1E40AF',
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
  margin: '0 0 24px 0',
};

const sectionTitleStyle: React.CSSProperties = {
  color: '#0F172A',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 16px 0',
};

const newsContainerStyle: React.CSSProperties = {
  backgroundColor: '#F8FAFC',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '24px',
};

const newsTableStyle: React.CSSProperties = {
  width: '100%',
};

const newsIconCellStyle: React.CSSProperties = {
  width: '40px',
  verticalAlign: 'top',
  paddingTop: '2px',
  paddingBottom: '12px',
};

const newsIconStyle: React.CSSProperties = {
  fontSize: '20px',
  margin: '0',
};

const newsTextCellStyle: React.CSSProperties = {
  verticalAlign: 'top',
  paddingBottom: '12px',
};

const newsTitleStyle: React.CSSProperties = {
  color: '#0F172A',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 2px 0',
};

const newsDescStyle: React.CSSProperties = {
  color: '#64748B',
  fontSize: '13px',
  margin: '0',
};

const bnccTipContainerStyle: React.CSSProperties = {
  backgroundColor: '#FEF3C7',
  borderRadius: '12px',
  padding: '20px',
  marginBottom: '24px',
};

const bnccTipBadgeStyle: React.CSSProperties = {
  color: '#92400E',
  fontSize: '11px',
  fontWeight: '700',
  letterSpacing: '1px',
  margin: '0 0 8px 0',
  textTransform: 'uppercase' as const,
};

const bnccTipTitleStyle: React.CSSProperties = {
  color: '#78350F',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 8px 0',
};

const bnccTipTextStyle: React.CSSProperties = {
  color: '#92400E',
  fontSize: '13px',
  lineHeight: '1.6',
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

export default ReengagementEmail;
