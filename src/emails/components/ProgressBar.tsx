import { Section, Text } from '@react-email/components';
import * as React from 'react';

interface ProgressBarProps {
  /** Porcentagem atual (0-100) */
  percent: number;
  /** Rótulo opcional */
  label?: string;
  /** Mostrar porcentagem no texto */
  showPercent?: boolean;
  /** Cor da barra (padrão: baseado na porcentagem) */
  color?: 'primary' | 'success' | 'warning' | 'error';
}

/**
 * ProgressBar - Barra de progresso visual para alertas de uso
 * 
 * Usa estilos inline e tabelas para compatibilidade com clientes de email.
 * A cor muda automaticamente baseada na porcentagem se não especificada.
 * 
 * Requirements: 3.4, 5.1
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  percent,
  label,
  showPercent = true,
  color,
}) => {
  // Limitar entre 0 e 100
  const safePercent = Math.max(0, Math.min(100, percent));
  
  // Determinar cor baseada na porcentagem se não especificada
  const barColor = color ? colorMap[color] : getColorByPercent(safePercent);

  return (
    <Section style={containerStyle}>
      {label && (
        <Text style={labelStyle}>
          {label}
          {showPercent && ` - ${safePercent}%`}
        </Text>
      )}
      
      {/* Barra de progresso usando tabela para compatibilidade */}
      <table cellPadding="0" cellSpacing="0" style={barContainerStyle}>
        <tbody>
          <tr>
            <td style={{ ...barFillStyle, width: `${safePercent}%`, backgroundColor: barColor }}>
              &nbsp;
            </td>
            <td style={{ ...barEmptyStyle, width: `${100 - safePercent}%` }}>
              &nbsp;
            </td>
          </tr>
        </tbody>
      </table>

      {!label && showPercent && (
        <Text style={percentTextStyle}>{safePercent}% utilizado</Text>
      )}
    </Section>
  );
};

// Mapa de cores
const colorMap: Record<string, string> = {
  primary: '#2563EB',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#E11D48',
};

// Determinar cor baseada na porcentagem
function getColorByPercent(percent: number): string {
  if (percent >= 100) return colorMap.error;
  if (percent >= 80) return colorMap.warning;
  if (percent >= 50) return colorMap.primary;
  return colorMap.success;
}

// Estilos inline para compatibilidade com clientes de email
const containerStyle: React.CSSProperties = {
  margin: '16px 0',
};

const labelStyle: React.CSSProperties = {
  color: '#0F172A',
  fontSize: '14px',
  fontWeight: '500',
  fontFamily: "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  margin: '0 0 8px 0',
};

const barContainerStyle: React.CSSProperties = {
  width: '100%',
  height: '12px',
  backgroundColor: '#E2E8F0',
  borderRadius: '6px',
  overflow: 'hidden',
};

const barFillStyle: React.CSSProperties = {
  height: '12px',
  borderRadius: '6px 0 0 6px',
};

const barEmptyStyle: React.CSSProperties = {
  height: '12px',
  backgroundColor: '#E2E8F0',
};

const percentTextStyle: React.CSSProperties = {
  color: '#64748B',
  fontSize: '12px',
  fontFamily: "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  margin: '8px 0 0 0',
  textAlign: 'right' as const,
};

export default ProgressBar;
