# Requirements Document

## Introduction

Sistema de email e automação de engajamento para a plataforma Educa Sol. O sistema atua como um "concierge" que avisa sobre cotas de uso, sugere melhorias nos planos de aula alinhados à BNCC e educa o usuário sobre o valor da assinatura Premium. O objetivo principal é aumentar a retenção de usuários (D1, D7, D30), converter usuários Free em Premium e reduzir churn através de comunicação contextual.

## Glossary

- **Email_Service**: Serviço responsável pelo envio de emails via API do Resend
- **Automation_Engine**: Sistema que monitora eventos e dispara emails automaticamente
- **Template_Renderer**: Componente que renderiza templates React em HTML para envio
- **Marketing_Preferences**: Tabela que armazena preferências de comunicação do usuário (LGPD)
- **Email_Log**: Registro de emails enviados para auditoria e prevenção de spam
- **Usage_Monitor**: Componente que monitora a tabela usage_logs para gatilhos de automação
- **Transactional_Email**: Email disparado por ação direta do usuário (verificação, senha, pagamento)
- **Notification_Email**: Email disparado por eventos do sistema (alertas de cota, resumos)
- **Marketing_Email**: Email de nutrição e campanhas (onboarding, newsletter, re-engajamento)

## Requirements

### Requirement 1: Infraestrutura de Envio de Email

**User Story:** Como desenvolvedor, quero uma infraestrutura robusta de envio de emails, para que todos os tipos de comunicação sejam entregues de forma confiável.

#### Acceptance Criteria

1. THE Email_Service SHALL integrar com a API do Resend para envio de emails
2. WHEN um email é enviado, THE Email_Service SHALL registrar o envio na tabela email_logs com user_id, template_id, sent_at e status
3. THE Email_Service SHALL validar a sessão do usuário antes de enviar emails autenticados
4. WHEN o envio falhar, THE Email_Service SHALL registrar o erro e retornar status de falha
5. THE Email_Service SHALL suportar envio de emails com anexos (para exportações futuras)

### Requirement 2: Gestão de Preferências de Marketing (LGPD)

**User Story:** Como usuário, quero controlar quais tipos de comunicação recebo, para que minha privacidade seja respeitada conforme a LGPD.

#### Acceptance Criteria

1. WHEN um usuário se cadastra, THE System SHALL criar um registro em marketing_preferences com lgpd_consent, newsletter e product_updates como false por padrão
2. THE Auth_Page SHALL exibir checkbox não marcado: "Aceito receber dicas pedagógicas e novidades do Educa Sol"
3. WHEN o usuário marca o checkbox de consentimento, THE System SHALL atualizar marketing_preferences com lgpd_consent = true
4. THE Marketing_Email SHALL incluir link de "Descadastrar" no rodapé que funciona com 1 clique
5. WHEN o usuário clica em "Descadastrar", THE System SHALL atualizar marketing_preferences e redirecionar para página de confirmação
6. THE Transactional_Email SHALL NOT incluir conteúdo de marketing

### Requirement 3: Templates de Email com React

**User Story:** Como desenvolvedor, quero criar templates de email usando React, para que a manutenção do design system seja consistente com o resto da aplicação.

#### Acceptance Criteria

1. THE Template_Renderer SHALL usar @react-email/components para criar templates
2. THE Template_Renderer SHALL renderizar componentes React em HTML válido para email
3. WHEN um template é renderizado, THE Template_Renderer SHALL aplicar estilos inline compatíveis com clientes de email
4. THE System SHALL manter templates base reutilizáveis: Header, Footer, Button, ProgressBar
5. THE System SHALL criar os seguintes templates MVP: welcome-email, usage-limit-warning, reset-password, activity-summary, premium-welcome

### Requirement 4: Emails Transacionais

**User Story:** Como usuário, quero receber emails transacionais importantes, para que eu seja informado sobre ações críticas da minha conta.

#### Acceptance Criteria

1. WHEN um usuário solicita redefinição de senha, THE System SHALL enviar email reset-password com link seguro
2. WHEN um usuário confirma assinatura Premium, THE System SHALL enviar email premium-welcome com lista de benefícios
3. WHEN um pagamento falha, THE System SHALL enviar email de falha com instruções para atualizar método de pagamento
4. THE Transactional_Email SHALL ter taxa de entrega > 98%
5. THE Transactional_Email SHALL ter taxa de abertura > 60%

### Requirement 5: Alertas de Uso (Notificações de Produto)

**User Story:** Como usuário do plano gratuito, quero ser avisado quando estou próximo do limite de uso, para que eu possa decidir se faço upgrade ou aguardo o próximo ciclo.

#### Acceptance Criteria

1. WHEN o usuário atinge 80% da cota gratuita, THE Usage_Monitor SHALL disparar email usage-limit-warning com barra de progresso visual
2. WHEN o usuário atinge 100% da cota, THE Usage_Monitor SHALL disparar email com CTA de upgrade e prova social
3. IF o usuário não converteu 24h após atingir 100%, THEN THE System SHALL enviar email com reforço de valor
4. THE Usage_Monitor SHALL verificar last_email_date para evitar spam (mínimo 7 dias entre alertas similares)
5. WHEN um email de alerta é enviado, THE System SHALL registrar em email_logs para evitar duplicatas

### Requirement 6: Fluxo de Onboarding (Welcome Series)

**User Story:** Como novo usuário, quero receber orientações sobre como usar a plataforma, para que eu consiga gerar meu primeiro plano de aula rapidamente.

#### Acceptance Criteria

1. WHEN um usuário se cadastra, THE Automation_Engine SHALL enviar email de boas-vindas imediatamente
2. IF o usuário não criou nenhum conteúdo após 24h, THEN THE System SHALL enviar email "Precisa de ajuda com a BNCC?"
3. WHEN 3 dias se passam após cadastro, THE System SHALL enviar email apresentando funcionalidades avançadas
4. THE Welcome_Series SHALL respeitar marketing_preferences.lgpd_consent
5. THE Welcome_Series SHALL ter taxa de abertura > 25%

### Requirement 7: Fluxo de Re-engajamento

**User Story:** Como gestor do produto, quero recuperar usuários inativos, para que eles voltem a usar a plataforma.

#### Acceptance Criteria

1. WHEN um usuário fica 14 dias sem login, THE Automation_Engine SHALL enviar email "Sentimos sua falta"
2. THE Re-engagement_Email SHALL incluir conteúdo educacional relevante (dicas BNCC)
3. THE Re-engagement_Email SHALL respeitar marketing_preferences
4. IF o usuário retorna após email de re-engajamento, THEN THE System SHALL registrar conversão

### Requirement 8: Prevenção de Churn

**User Story:** Como gestor do produto, quero entender por que usuários cancelam e oferecer alternativas, para reduzir a taxa de churn.

#### Acceptance Criteria

1. WHEN um usuário cancela assinatura Premium, THE System SHALL enviar email com pesquisa de satisfação
2. THE Churn_Email SHALL incluir oferta de desconto para reativação imediata
3. THE Churn_Email SHALL ter link direto para pesquisa (sem login obrigatório)

### Requirement 9: Resumo Semanal de Atividades

**User Story:** Como usuário ativo, quero receber um resumo das minhas atividades, para que eu acompanhe meu progresso.

#### Acceptance Criteria

1. WHEN uma semana se passa, THE System SHALL enviar email activity-summary para usuários ativos
2. THE Activity_Summary SHALL incluir: planos criados, atividades geradas, avaliações criadas
3. THE Activity_Summary SHALL respeitar marketing_preferences.product_updates
4. IF o usuário não teve atividade na semana, THEN THE System SHALL NOT enviar resumo

### Requirement 10: Métricas e Monitoramento

**User Story:** Como gestor do produto, quero monitorar a eficácia dos emails, para que eu possa otimizar as campanhas.

#### Acceptance Criteria

1. THE System SHALL rastrear taxa de entrega (meta > 98%)
2. THE System SHALL rastrear taxa de abertura (transacionais > 60%, marketing > 25%)
3. THE System SHALL rastrear taxa de clique (meta > 3% para marketing)
4. THE System SHALL rastrear conversão de upgrade por email (% que assina até 24h após clique)
5. WHEN métricas estão abaixo da meta, THE System SHALL alertar via dashboard

### Requirement 11: Database Triggers e Webhooks

**User Story:** Como desenvolvedor, quero que automações sejam disparadas automaticamente por eventos do banco, para que o sistema seja reativo e em tempo real.

#### Acceptance Criteria

1. THE System SHALL usar Database Webhooks do Supabase para observar tabelas relevantes
2. WHEN um registro é inserido em auth.users, THE Webhook SHALL chamar Edge Function trigger-automation
3. WHEN um registro é inserido em usage_logs, THE Webhook SHALL verificar condições de alerta
4. THE Edge_Function SHALL validar payload antes de processar
5. IF a condição de automação for atendida, THEN THE Edge_Function SHALL chamar send-email
