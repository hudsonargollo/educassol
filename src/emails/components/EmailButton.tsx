import { Button } from '@react-email/components';
import * as React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'warning';

interface EmailButtonProps {
  /** URL de destino do botão */
  href: string;
  /** Texto do botão */
  children: React.ReactNode;
  /** Variante visual do botão */
  variant?: ButtonVariant;
  /** Se o botão deve ocupar toda a largura */
  fullWidth?: boolean;
}

/**
 * EmailButton - Botão de ação para emails do Educa Sol
 * 
 * Usa estilos inline para compatibilidade com clientes de email.
 * Suporta variantes de cor para diferentes contextos.
 * 
 * Requirements: 3.4
 */
export const EmailButton: React.FC<EmailButtonProps> = ({
  href,
  children,
  variant = 'primary',
  fullWidth = false,
}) => {
  const buttonStyle = getButtonStyle(variant, fullWidth);

  return (
    <Button href={href} style={buttonStyle}>
      {children}
    </Button>
  );
};

// Cores por variante
const variantColors: Record<ButtonVariant, { bg: string; text: string }> = {
  primary: { bg: '#2563EB', text: '#FFFFFF' },
  secondary: { bg: '#F1F5F9', text: '#0F172A' },
  success: { bg: '#10B981', text: '#FFFFFF' },
  warning: { bg: '#F59E0B', text: '#0F172A' },
};

function getButtonStyle(variant: ButtonVariant, fullWidth: boolean): React.CSSProperties {
  const colors = variantColors[variant];
  
  return {
    backgroundColor: colors.bg,
    color: colors.text,
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    fontFamily: "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: fullWidth ? 'block' : 'inline-block',
    width: fullWidth ? '100%' : 'auto',
    boxSizing: 'border-box' as const,
  };
}

export default EmailButton;
