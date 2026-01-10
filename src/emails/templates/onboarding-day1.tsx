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

interface OnboardingDay1EmailProps {
  /** Nome do usuário */
  userName?: string;
  /** URL para criar plano de aula */
  createPlanUrl?: string;
  /** URL para guia BNCC */
  bnccGuideUrl?: string;
  /** Token para unsubscribe */
  unsubscribeToken?: string;
}

/**
 * OnboardingDay1Email - Email de onboarding enviado 24h após cadastro
 * 
 * Enviado se o usuário não criou nenhum conteúdo após 24h.
 * Foco em ajuda com a BNCC e CTA para gerar primeiro plano.
 * 
 * Requirements: 6.2
 */
export const OnboardingDay1Email: React.FC<OnboardingDay1EmailProps> = ({
  userName = 'Professor',
  createPlanUrl = 'https://educasol.com.br/planner',
  bnccGuideUrl = 'https://educasol.com.br/help/bncc-guide',
  unsubscribeToken,
}) => {
  return (
    <Html>
      <Head />
      <Preview>Precisa de ajuda com a BNCC? Veja como o Educa Sol pode facilitar 📚</Preview>
      <Body style={bodyStyle}>
        <EmailHeader />
        
        <Container style={containerStyle}>
          <Section style={contentStyle}>
            {/* Mensagem pessoal */}
            <Text style={greetingStyle}>Olá, {userName}!</Text>
            
            <Text style={paragraphStyle}>
              Notamos que você ainda não criou seu primeiro plano de aula. 
              Sabemos que alinhar atividades à BNCC pode ser desafiador, 
              mas estamos aqui para ajudar!
            </Text>

            {/* Destaque BNCC */}
            <Section style={bnccBoxStyle}>
              <Text style={bnccIconStyle}>🎯</Text>
              <Text style={bnccTitleStyle}>
                Alinhamento BNCC simplificado
              </Text>
              <Text style={bnccDescStyle}>
                O Educa Sol sugere automaticamente as competências e habilidades 
                da BNCC mais adequadas para seu conteúdo. Você só precisa informar 
                o tema e a série!
              </Text>
            </Section>

            {/* Como funciona */}
            <Text style={sectionTitleStyle}>
              📝 Como criar seu primeiro plano
            </Text>

            <Section style={stepsContainerStyle}>
              <table cellPadding="0" cellSpacing="0" style={stepsTableStyle}>
                <tbody>
                  <tr>
                    <td style={stepNumberCellStyle}>
                      <Text style={stepNumberStyle}>1</Text>
                    </td>
                    <td style={stepContentCellStyle}>
                      <Text style={stepTextStyle}>
                        Escolha a disciplina e a série
                      </Text>
                    </td>
                  </tr>
                  <tr>
                    <td style={stepNumberCellStyle}>
                      <Text style={stepNumberStyle}>2</Text>
                    </td>
                    <td style={stepContentCellStyle}>
                      <Text style={stepTextStyle}>
                        Informe o tema ou conteúdo da aula
                      </Text>
                    </td>
                  </tr>
                  <tr>
                    <td style={stepNumberCellStyle}>
                      <Text style={stepNumberStyle}>3</Text>
                    </td>
                    <td style={stepContentCellStyle}>
                      <Text style={stepTextStyle}>
                        Receba sugestões de habilidades BNCC automaticamente
                      </Text>
                    </td>
                  </tr>
                  <tr>
                    <td style={stepNumberCellStyle}>
                      <Text style={stepNumberStyle}>4</Text>
                    </td>
                    <td style={stepContentCellStyle}>
                      <Text style={stepTextStyle}>
                        Gere seu plano completo em segundos!
                      </Text>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>

            {/* CTA Principal */}
            <Section style={ctaContainerStyle}>
              <Text style={ctaTitleStyle}>
                🚀 Experimente agora
              </Text>
              <Text style={ctaDescStyle}>
                Crie seu primeiro plano de aula em menos de 5 minutos, 
                já alinhado à BNCC.
              </Text>
              <Section style={buttonContainerStyle}>
                <EmailButton href={createPlanUrl} variant="primary">
                  Criar Meu Primeiro Plano
                </EmailButton>
              </Section>
            </Section>

            {/* Link para guia BNCC */}
            <Section style={guideBoxStyle}>
              <Text style={guideTextStyle}>
                📚 Quer entender melhor como funciona o alinhamento BNCC?{' '}
                <a href={bnccGuideUrl} style={linkStyle}>
                  Confira nosso guia completo
                </a>
              </Text>
            </Section>

            <Text style={helpTextStyle}>
              Precisa de ajuda? Responda este email ou escreva para{' '}
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

const bnccBoxStyle: React.CSSProperties = {
  textAlign: 'center' as const,
  padding: '24px',
  backgroundColor: '#FEF3C7',
  borderRadius: '12px',
  marginBottom: '24px',
};

const bnccIconStyle: React.CSSProperties = {
  fontSize: '40px',
  margin: '0 0 8px 0',
};

const bnccTitleStyle: React.CSSProperties = {
  color: '#92400E',
  fontSize: '18px',
  fontWeight: '700',
  margin: '0 0 8px 0',
};

const bnccDescStyle: React.CSSProperties = {
  color: '#A16207',
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

const stepsContainerStyle: React.CSSProperties = {
  backgroundColor: '#F8FAFC',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '24px',
};

const stepsTableStyle: React.CSSProperties = {
  width: '100%',
};

const stepNumberCellStyle: React.CSSProperties = {
  width: '32px',
  verticalAlign: 'top',
  paddingBottom: '12px',
};

const stepNumberStyle: React.CSSProperties = {
  backgroundColor: '#2563EB',
  color: '#FFFFFF',
  width: '24px',
  height: '24px',
  borderRadius: '50%',
  fontSize: '12px',
  fontWeight: '600',
  textAlign: 'center' as const,
  lineHeight: '24px',
  margin: '0',
  display: 'inline-block',
};

const stepContentCellStyle: React.CSSProperties = {
  verticalAlign: 'top',
  paddingBottom: '12px',
  paddingLeft: '8px',
};

const stepTextStyle: React.CSSProperties = {
  color: '#334155',
  fontSize: '13px',
  margin: '0',
  lineHeight: '24px',
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
  backgroundColor: '#F0FDF4',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '24px',
};

const guideTextStyle: React.CSSProperties = {
  color: '#166534',
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

export default OnboardingDay1Email;
