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

interface ExampleEmailProps {
  userName?: string;
  usagePercent?: number;
}

/**
 * Template de exemplo demonstrando todos os componentes base
 * 
 * Este template serve como referência para criar novos templates.
 */
export const ExampleEmail: React.FC<ExampleEmailProps> = ({
  userName = 'Professor',
  usagePercent = 75,
}) => {
  return (
    <Html>
      <Head />
      <Preview>Exemplo de email do Educa Sol</Preview>
      <Body style={bodyStyle}>
        <EmailHeader />
        
        <Container style={containerStyle}>
          <Section style={contentStyle}>
            <Text style={greetingStyle}>
              Olá, {userName}! 👋
            </Text>
            
            <Text style={paragraphStyle}>
              Este é um exemplo de email do Educa Sol demonstrando todos os 
              componentes base disponíveis para criação de templates.
            </Text>

            <Text style={headingStyle}>
              Seu uso atual
            </Text>
            
            <ProgressBar 
              percent={usagePercent} 
              label="Gerações utilizadas"
            />

            <Text style={paragraphStyle}>
              Você ainda tem {100 - usagePercent}% do seu limite disponível 
              este mês. Continue criando conteúdos incríveis!
            </Text>

            <Section style={buttonContainerStyle}>
              <EmailButton href="https://educasol.com.br/dashboard">
                Acessar Dashboard
              </EmailButton>
            </Section>

            <Section style={buttonContainerStyle}>
              <EmailButton 
                href="https://educasol.com.br/upgrade" 
                variant="success"
              >
                Fazer Upgrade
              </EmailButton>
            </Section>
          </Section>
        </Container>

        <EmailFooter isMarketing unsubscribeToken="example-token-123" />
      </Body>
    </Html>
  );
};

// Estilos inline
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

const headingStyle: React.CSSProperties = {
  color: '#0F172A',
  fontSize: '16px',
  fontWeight: '600',
  margin: '24px 0 8px 0',
};

const paragraphStyle: React.CSSProperties = {
  color: '#64748B',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0 0 16px 0',
};

const buttonContainerStyle: React.CSSProperties = {
  textAlign: 'center' as const,
  margin: '24px 0 8px 0',
};

export default ExampleEmail;
