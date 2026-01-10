/**
 * Edge Function: send-email
 * 
 * Handles email sending via Resend API with:
 * - Zod payload validation
 * - Marketing preferences verification
 * - Email logging to email_logs table
 * - Retry logic for transient failures
 * 
 * Requirements: 1.1, 1.2, 1.4, 2.6, 6.4
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Email template types
const EmailTemplateEnum = z.enum([
  'welcome',
  'usage-warning-80',
  'usage-warning-100',
  'usage-followup',
  'reset-password',
  'premium-welcome',
  'payment-failed',
  'activity-summary',
  'reengagement',
  'churn-survey',
  'onboarding-day1',
  'onboarding-day3',
]);

type EmailTemplate = z.infer<typeof EmailTemplateEnum>;

// Email category classification
type EmailCategory = 'transactional' | 'notification' | 'marketing';

/**
 * Classifies email templates by category
 * - Transactional: Direct user actions (password reset, payment)
 * - Notification: Product alerts (usage warnings)
 * - Marketing: Onboarding, re-engagement, newsletters
 */
function getEmailCategory(templateId: EmailTemplate): EmailCategory {
  const transactionalTemplates: EmailTemplate[] = [
    'reset-password',
    'premium-welcome',
    'payment-failed',
  ];
  
  const notificationTemplates: EmailTemplate[] = [
    'usage-warning-80',
    'usage-warning-100',
    'usage-followup',
    'activity-summary',
  ];
  
  if (transactionalTemplates.includes(templateId)) {
    return 'transactional';
  }
  
  if (notificationTemplates.includes(templateId)) {
    return 'notification';
  }
  
  return 'marketing';
}

// Attachment schema
const AttachmentSchema = z.object({
  filename: z.string().min(1).max(255),
  content: z.string(), // Base64 encoded content
  contentType: z.string().min(1).max(100),
});

// Request payload schema
const SendEmailRequestSchema = z.object({
  to: z.string().email(),
  templateId: EmailTemplateEnum,
  data: z.record(z.unknown()).default({}),
  userId: z.string().uuid().optional(),
  attachments: z.array(AttachmentSchema).max(5).optional(),
  subject: z.string().min(1).max(200).optional(),
});

type SendEmailRequest = z.infer<typeof SendEmailRequestSchema>;

// Response types
interface SendEmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  backoffMs: [1000, 5000, 15000],
  retryableCodes: ['RATE_LIMITED', 'API_ERROR', 'NETWORK_ERROR'],
};

// Template subject mapping
const TEMPLATE_SUBJECTS: Record<EmailTemplate, string> = {
  'welcome': 'Bem-vindo ao Educa Sol! 🎉',
  'usage-warning-80': 'Você está chegando ao limite de uso',
  'usage-warning-100': 'Limite de uso atingido',
  'usage-followup': 'Desbloqueie todo o potencial do Educa Sol',
  'reset-password': 'Redefinir sua senha - Educa Sol',
  'premium-welcome': 'Parabéns! Você agora é Premium 🌟',
  'payment-failed': 'Problema com seu pagamento - Ação necessária',
  'activity-summary': 'Seu resumo semanal - Educa Sol',
  'reengagement': 'Sentimos sua falta! 💙',
  'churn-survey': 'Nos ajude a melhorar - Pesquisa rápida',
  'onboarding-day1': 'Precisa de ajuda com a BNCC?',
  'onboarding-day3': 'Descubra funcionalidades avançadas',
};

/**
 * Delays execution for specified milliseconds
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Sends email via Resend API with retry logic
 */
async function sendViaResend(
  to: string,
  subject: string,
  htmlContent: string,
  attachments?: Array<{ filename: string; content: string; contentType: string }>
): Promise<{ success: boolean; messageId?: string; error?: string; retryable?: boolean }> {
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
  const EMAIL_FROM_ADDRESS = Deno.env.get('EMAIL_FROM_ADDRESS') || 'noreply@educasol.com.br';
  
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY not configured');
    return { success: false, error: 'Email service not configured', retryable: false };
  }

  const emailPayload: Record<string, unknown> = {
    from: `Educa Sol <${EMAIL_FROM_ADDRESS}>`,
    to: [to],
    subject,
    html: htmlContent,
  };

  if (attachments && attachments.length > 0) {
    emailPayload.attachments = attachments.map(att => ({
      filename: att.filename,
      content: att.content,
      type: att.contentType,
    }));
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `HTTP ${response.status}`;
      
      // Determine if error is retryable
      const retryable = response.status === 429 || response.status >= 500;
      
      return { 
        success: false, 
        error: errorMessage, 
        retryable,
      };
    }

    const data = await response.json();
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('Network error sending email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Network error',
      retryable: true,
    };
  }
}

/**
 * Sends email with retry logic
 */
async function sendWithRetry(
  to: string,
  subject: string,
  htmlContent: string,
  attachments?: Array<{ filename: string; content: string; contentType: string }>
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  let lastError = '';
  
  for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    if (attempt > 0) {
      const backoffTime = RETRY_CONFIG.backoffMs[attempt - 1] || RETRY_CONFIG.backoffMs[RETRY_CONFIG.backoffMs.length - 1];
      console.log(`Retry attempt ${attempt}, waiting ${backoffTime}ms`);
      await delay(backoffTime);
    }

    const result = await sendViaResend(to, subject, htmlContent, attachments);
    
    if (result.success) {
      return { success: true, messageId: result.messageId };
    }
    
    lastError = result.error || 'Unknown error';
    
    if (!result.retryable) {
      console.log('Non-retryable error, stopping retries');
      break;
    }
    
    console.log(`Attempt ${attempt + 1} failed: ${lastError}`);
  }
  
  return { success: false, error: lastError };
}

/**
 * Logs email to email_logs table
 */
async function logEmail(
  supabase: ReturnType<typeof createClient>,
  userId: string | null,
  templateId: string,
  recipientEmail: string,
  subject: string,
  status: 'sent' | 'failed',
  messageId?: string,
  errorMessage?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    const { error } = await supabase.from('email_logs').insert({
      user_id: userId,
      template_id: templateId,
      recipient_email: recipientEmail,
      subject,
      status,
      resend_message_id: messageId,
      error_message: errorMessage,
      metadata: metadata || {},
      sent_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Error logging email:', error);
    }
  } catch (err) {
    console.error('Exception logging email:', err);
  }
}

/**
 * Checks if user has opted in for the email category
 * Returns true for transactional emails (no opt-in required)
 */
async function checkMarketingPreferences(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  category: EmailCategory
): Promise<{ allowed: boolean; reason?: string }> {
  // Transactional emails don't require opt-in (Requirement 2.6)
  if (category === 'transactional') {
    return { allowed: true };
  }

  try {
    const { data: prefs, error } = await supabase
      .from('marketing_preferences')
      .select('lgpd_consent, newsletter, product_updates')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching marketing preferences:', error);
      // Fail-safe: don't send marketing emails if we can't verify preferences
      return { allowed: false, reason: 'Could not verify preferences' };
    }

    if (!prefs) {
      return { allowed: false, reason: 'No preferences found' };
    }

    // Check LGPD consent first
    if (!prefs.lgpd_consent) {
      return { allowed: false, reason: 'LGPD consent not given' };
    }

    // Check specific preference based on category
    if (category === 'notification' && !prefs.product_updates) {
      return { allowed: false, reason: 'Product updates not enabled' };
    }

    if (category === 'marketing' && !prefs.newsletter) {
      return { allowed: false, reason: 'Newsletter not enabled' };
    }

    return { allowed: true };
  } catch (err) {
    console.error('Exception checking preferences:', err);
    return { allowed: false, reason: 'Error checking preferences' };
  }
}

/**
 * Generates HTML content for email template
 * In production, this would render React Email templates
 */
function generateEmailHtml(templateId: EmailTemplate, data: Record<string, unknown>): string {
  const userName = (data.userName as string) || 'Professor';
  const baseUrl = 'https://educasol.com.br';
  
  // Base styles
  const styles = {
    body: 'background-color: #F1F5F9; font-family: Inter, Helvetica Neue, Helvetica, Arial, sans-serif; margin: 0; padding: 20px;',
    container: 'max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 8px; overflow: hidden;',
    header: 'background-color: #2563EB; padding: 24px; text-align: center;',
    logo: 'color: #FFFFFF; font-size: 24px; font-weight: bold; margin: 0;',
    content: 'padding: 32px;',
    greeting: 'color: #0F172A; font-size: 20px; font-weight: 600; margin: 0 0 16px 0;',
    paragraph: 'color: #64748B; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;',
    button: 'display: inline-block; background-color: #2563EB; color: #FFFFFF; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;',
    footer: 'background-color: #F8FAFC; padding: 24px; text-align: center; font-size: 12px; color: #94A3B8;',
  };

  // Generate template-specific content
  let content = '';
  
  switch (templateId) {
    case 'welcome':
      content = `
        <p style="${styles.greeting}">Olá, ${userName}! 👋</p>
        <p style="${styles.paragraph}">Bem-vindo ao Educa Sol! Estamos muito felizes em ter você conosco.</p>
        <p style="${styles.paragraph}">Com o Educa Sol, você pode criar planos de aula alinhados à BNCC em minutos.</p>
        <p style="text-align: center; margin: 24px 0;">
          <a href="${baseUrl}/dashboard" style="${styles.button}">Começar Agora</a>
        </p>
      `;
      break;
      
    case 'usage-warning-80':
      const usage80 = (data.usagePercent as number) || 80;
      content = `
        <p style="${styles.greeting}">Olá, ${userName}!</p>
        <p style="${styles.paragraph}">Você já utilizou ${usage80}% do seu limite mensal de gerações.</p>
        <p style="${styles.paragraph}">Considere fazer upgrade para o plano Premium e ter gerações ilimitadas!</p>
        <p style="text-align: center; margin: 24px 0;">
          <a href="${baseUrl}/upgrade" style="${styles.button}">Ver Planos</a>
        </p>
      `;
      break;
      
    case 'usage-warning-100':
      content = `
        <p style="${styles.greeting}">Olá, ${userName}!</p>
        <p style="${styles.paragraph}">Você atingiu 100% do seu limite mensal de gerações.</p>
        <p style="${styles.paragraph}">Faça upgrade agora para continuar criando conteúdos incríveis!</p>
        <p style="text-align: center; margin: 24px 0;">
          <a href="${baseUrl}/upgrade" style="${styles.button}">Fazer Upgrade</a>
        </p>
      `;
      break;
      
    case 'reset-password':
      const resetUrl = (data.resetUrl as string) || `${baseUrl}/reset-password`;
      content = `
        <p style="${styles.greeting}">Olá, ${userName}!</p>
        <p style="${styles.paragraph}">Recebemos uma solicitação para redefinir sua senha.</p>
        <p style="${styles.paragraph}">Clique no botão abaixo para criar uma nova senha:</p>
        <p style="text-align: center; margin: 24px 0;">
          <a href="${resetUrl}" style="${styles.button}">Redefinir Senha</a>
        </p>
        <p style="${styles.paragraph}">Se você não solicitou esta alteração, ignore este email.</p>
      `;
      break;
      
    case 'premium-welcome':
      content = `
        <p style="${styles.greeting}">Parabéns, ${userName}! 🎉</p>
        <p style="${styles.paragraph}">Você agora é um membro Premium do Educa Sol!</p>
        <p style="${styles.paragraph}">Seus novos benefícios:</p>
        <ul style="${styles.paragraph}">
          <li>Gerações ilimitadas de planos de aula</li>
          <li>Acesso ao modelo de IA avançado</li>
          <li>Exportação em múltiplos formatos</li>
          <li>Suporte prioritário</li>
        </ul>
        <p style="text-align: center; margin: 24px 0;">
          <a href="${baseUrl}/dashboard" style="${styles.button}">Explorar Recursos</a>
        </p>
      `;
      break;
      
    case 'payment-failed':
      content = `
        <p style="${styles.greeting}">Olá, ${userName}!</p>
        <p style="${styles.paragraph}">Houve um problema com seu pagamento.</p>
        <p style="${styles.paragraph}">Por favor, atualize seu método de pagamento para continuar aproveitando os benefícios Premium.</p>
        <p style="text-align: center; margin: 24px 0;">
          <a href="${baseUrl}/settings/billing" style="${styles.button}">Atualizar Pagamento</a>
        </p>
      `;
      break;

    case 'onboarding-day1':
      content = `
        <p style="${styles.greeting}">Olá, ${userName}!</p>
        <p style="${styles.paragraph}">Notamos que você ainda não criou seu primeiro plano de aula. Sabemos que alinhar atividades à BNCC pode ser desafiador, mas estamos aqui para ajudar!</p>
        <div style="background-color: #FEF3C7; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
          <p style="font-size: 40px; margin: 0 0 8px 0;">🎯</p>
          <p style="color: #92400E; font-size: 18px; font-weight: 700; margin: 0 0 8px 0;">Alinhamento BNCC simplificado</p>
          <p style="color: #A16207; font-size: 14px; margin: 0;">O Educa Sol sugere automaticamente as competências e habilidades da BNCC mais adequadas para seu conteúdo.</p>
        </div>
        <p style="${styles.paragraph}"><strong>Como criar seu primeiro plano:</strong></p>
        <ol style="${styles.paragraph}">
          <li>Escolha a disciplina e a série</li>
          <li>Informe o tema ou conteúdo da aula</li>
          <li>Receba sugestões de habilidades BNCC automaticamente</li>
          <li>Gere seu plano completo em segundos!</li>
        </ol>
        <p style="text-align: center; margin: 24px 0;">
          <a href="${baseUrl}/planner" style="${styles.button}">Criar Meu Primeiro Plano</a>
        </p>
      `;
      break;

    case 'onboarding-day3':
      content = `
        <p style="${styles.greeting}">Olá, ${userName}!</p>
        <p style="${styles.paragraph}">Você já conhece o básico do Educa Sol. Agora é hora de descobrir funcionalidades que vão transformar ainda mais seu planejamento pedagógico!</p>
        <div style="background-color: #F5F3FF; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
          <p style="font-size: 40px; margin: 0 0 8px 0;">💡</p>
          <p style="color: #5B21B6; font-size: 18px; font-weight: 700; margin: 0 0 8px 0;">Você sabia?</p>
          <p style="color: #7C3AED; font-size: 14px; margin: 0;">Professores que usam as funcionalidades avançadas economizam em média 3 horas por semana no planejamento.</p>
        </div>
        <p style="${styles.paragraph}"><strong>🚀 Funcionalidades avançadas:</strong></p>
        <ul style="${styles.paragraph}">
          <li><strong>Diferenciação de Conteúdo</strong> - Adapte atividades para diferentes níveis</li>
          <li><strong>Avaliações Inteligentes</strong> - Crie provas com correção automática</li>
          <li><strong>Planejamento de Unidades</strong> - Organize sequências didáticas completas</li>
          <li><strong>Exportação Profissional</strong> - Exporte em PDF, PowerPoint e mais</li>
        </ul>
        <p style="text-align: center; margin: 24px 0;">
          <a href="${baseUrl}/dashboard" style="${styles.button}">Acessar Dashboard</a>
        </p>
      `;
      break;

    case 'usage-followup':
      content = `
        <p style="${styles.greeting}">Olá, ${userName}!</p>
        <p style="${styles.paragraph}">Você atingiu o limite do plano gratuito ontem. Que tal desbloquear todo o potencial do Educa Sol?</p>
        <div style="background-color: #EFF6FF; border-radius: 12px; padding: 24px; margin: 24px 0;">
          <p style="color: #1E40AF; font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">💬 O que dizem nossos professores Premium:</p>
          <p style="color: #3B82F6; font-size: 14px; font-style: italic; margin: 0;">"O Educa Sol transformou minha rotina. Antes eu passava horas planejando, agora faço em minutos e com qualidade muito maior!" - Maria S., Professora de Matemática</p>
        </div>
        <p style="${styles.paragraph}">Com o Premium você tem:</p>
        <ul style="${styles.paragraph}">
          <li>Gerações ilimitadas</li>
          <li>Modelo de IA avançado</li>
          <li>Suporte prioritário</li>
        </ul>
        <p style="text-align: center; margin: 24px 0;">
          <a href="${baseUrl}/upgrade" style="${styles.button}">Fazer Upgrade Agora</a>
        </p>
      `;
      break;

    case 'activity-summary':
      const plansCreated = (data.plansCreated as number) || 0;
      const activitiesGenerated = (data.activitiesGenerated as number) || 0;
      const assessmentsCreated = (data.assessmentsCreated as number) || 0;
      const weekStart = (data.weekStartDate as string) || '';
      const weekEnd = (data.weekEndDate as string) || '';
      content = `
        <p style="${styles.greeting}">Olá, ${userName}!</p>
        <p style="${styles.paragraph}">Aqui está seu resumo semanal de atividades (${weekStart} - ${weekEnd}):</p>
        <div style="background-color: #F0FDF4; border-radius: 12px; padding: 24px; margin: 24px 0;">
          <table style="width: 100%;">
            <tr>
              <td style="text-align: center; padding: 12px;">
                <p style="font-size: 32px; margin: 0;">${plansCreated}</p>
                <p style="color: #166534; font-size: 12px; margin: 4px 0 0 0;">Planos criados</p>
              </td>
              <td style="text-align: center; padding: 12px;">
                <p style="font-size: 32px; margin: 0;">${activitiesGenerated}</p>
                <p style="color: #166534; font-size: 12px; margin: 4px 0 0 0;">Atividades geradas</p>
              </td>
              <td style="text-align: center; padding: 12px;">
                <p style="font-size: 32px; margin: 0;">${assessmentsCreated}</p>
                <p style="color: #166534; font-size: 12px; margin: 4px 0 0 0;">Avaliações criadas</p>
              </td>
            </tr>
          </table>
        </div>
        <p style="${styles.paragraph}">Continue assim! Cada plano bem elaborado faz diferença na aprendizagem dos seus alunos.</p>
        <p style="text-align: center; margin: 24px 0;">
          <a href="${baseUrl}/dashboard" style="${styles.button}">Ver Dashboard</a>
        </p>
      `;
      break;

    case 'reengagement':
      content = `
        <p style="${styles.greeting}">Olá, ${userName}! 💙</p>
        <p style="${styles.paragraph}">Sentimos sua falta! Faz um tempo que você não nos visita.</p>
        <p style="${styles.paragraph}">Enquanto isso, adicionamos novas funcionalidades que podem ajudar no seu planejamento:</p>
        <ul style="${styles.paragraph}">
          <li>Novos templates de atividades</li>
          <li>Melhorias no alinhamento BNCC</li>
          <li>Exportação mais rápida</li>
        </ul>
        <div style="background-color: #FEF3C7; border-radius: 12px; padding: 16px; margin: 24px 0;">
          <p style="color: #92400E; font-size: 14px; margin: 0;">💡 <strong>Dica BNCC:</strong> Lembre-se de sempre conectar os objetivos de aprendizagem às competências gerais da BNCC para um planejamento mais completo.</p>
        </div>
        <p style="text-align: center; margin: 24px 0;">
          <a href="${baseUrl}/dashboard" style="${styles.button}">Voltar ao Educa Sol</a>
        </p>
      `;
      break;

    case 'churn-survey':
      const surveyUrl = (data.surveyUrl as string) || `${baseUrl}/feedback`;
      content = `
        <p style="${styles.greeting}">Olá, ${userName}!</p>
        <p style="${styles.paragraph}">Vimos que você cancelou sua assinatura Premium. Sentimos muito por isso!</p>
        <p style="${styles.paragraph}">Sua opinião é muito importante para nós. Poderia nos contar o motivo do cancelamento? Leva menos de 2 minutos.</p>
        <p style="text-align: center; margin: 24px 0;">
          <a href="${surveyUrl}" style="${styles.button}">Responder Pesquisa</a>
        </p>
        <div style="background-color: #EFF6FF; border-radius: 12px; padding: 16px; margin: 24px 0;">
          <p style="color: #1E40AF; font-size: 14px; margin: 0;">🎁 <strong>Oferta especial:</strong> Volte agora e ganhe 20% de desconto nos próximos 3 meses!</p>
        </div>
      `;
      break;
      
    default:
      content = `
        <p style="${styles.greeting}">Olá, ${userName}!</p>
        <p style="${styles.paragraph}">Obrigado por usar o Educa Sol.</p>
      `;
  }

  // Determine if marketing email (needs unsubscribe link)
  const category = getEmailCategory(templateId);
  const unsubscribeSection = category !== 'transactional' 
    ? `<p><a href="${baseUrl}/unsubscribe?token=${data.unsubscribeToken || 'token'}" style="color: #94A3B8;">Descadastrar</a></p>`
    : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="${styles.body}">
      <div style="${styles.container}">
        <div style="${styles.header}">
          <h1 style="${styles.logo}">☀️ Educa Sol</h1>
        </div>
        <div style="${styles.content}">
          ${content}
        </div>
        <div style="${styles.footer}">
          <p>© ${new Date().getFullYear()} Educa Sol. Todos os direitos reservados.</p>
          ${unsubscribeSection}
        </div>
      </div>
    </body>
    </html>
  `;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse and validate request body
    const body = await req.json();
    const validationResult = SendEmailRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      console.error('Validation error:', validationResult.error);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Invalid request payload',
          details: validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { to, templateId, data, userId, attachments, subject: customSubject } = validationResult.data;
    
    console.log(`Processing email request: template=${templateId}, to=${to}, userId=${userId || 'anonymous'}`);

    // Create Supabase client with service role for database operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get email category
    const category = getEmailCategory(templateId);
    
    // Check marketing preferences for non-transactional emails (Requirements 2.6, 6.4)
    if (userId && category !== 'transactional') {
      const prefCheck = await checkMarketingPreferences(supabaseAdmin, userId, category);
      
      if (!prefCheck.allowed) {
        console.log(`Email blocked by preferences: ${prefCheck.reason}`);
        
        // Log the blocked email
        await logEmail(
          supabaseAdmin,
          userId,
          templateId,
          to,
          customSubject || TEMPLATE_SUBJECTS[templateId],
          'failed',
          undefined,
          `Blocked: ${prefCheck.reason}`,
          { category, blocked_by_preferences: true }
        );
        
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Email not sent: ${prefCheck.reason}`,
          }),
          {
            status: 200, // Not an error, just blocked by preferences
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // Generate email content
    const subject = customSubject || TEMPLATE_SUBJECTS[templateId];
    const htmlContent = generateEmailHtml(templateId, data);

    // Send email with retry logic (Requirement 1.4)
    const sendResult = await sendWithRetry(to, subject, htmlContent, attachments);

    // Log email to database (Requirement 1.2)
    await logEmail(
      supabaseAdmin,
      userId || null,
      templateId,
      to,
      subject,
      sendResult.success ? 'sent' : 'failed',
      sendResult.messageId,
      sendResult.error,
      { category, data }
    );

    if (!sendResult.success) {
      console.error(`Failed to send email: ${sendResult.error}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: sendResult.error,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`Email sent successfully: messageId=${sendResult.messageId}`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: sendResult.messageId,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in send-email:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
