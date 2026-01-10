/**
 * Edge Function: unsubscribe
 * 
 * Handles email unsubscribe requests with token validation.
 * Updates marketing_preferences and returns a confirmation page.
 * 
 * Requirements: 2.4, 2.5
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Token validation schema
const UnsubscribeTokenSchema = z.object({
  userId: z.string().uuid(),
  email: z.string().email(),
  exp: z.number(), // Expiration timestamp
});

type UnsubscribeToken = z.infer<typeof UnsubscribeTokenSchema>;

/**
 * Decodes and validates the unsubscribe token
 * Token format: base64(JSON({ userId, email, exp }))
 */
function decodeToken(token: string): UnsubscribeToken | null {
  try {
    const decoded = atob(token);
    const parsed = JSON.parse(decoded);
    const validated = UnsubscribeTokenSchema.parse(parsed);
    
    // Check expiration (tokens valid for 30 days)
    if (validated.exp < Date.now()) {
      console.log('Token expired');
      return null;
    }
    
    return validated;
  } catch (error) {
    console.error('Token decode error:', error);
    return null;
  }
}

/**
 * Generates HTML page for unsubscribe confirmation
 */
function generateConfirmationPage(success: boolean, message: string): string {
  const statusColor = success ? '#166534' : '#991B1B';
  const statusBg = success ? '#F0FDF4' : '#FEF2F2';
  const statusIcon = success ? '✓' : '✗';
  
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Educa Sol - Preferências de Email</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #F1F5F9;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      max-width: 480px;
      width: 100%;
      overflow: hidden;
    }
    .header {
      background: #2563EB;
      padding: 24px;
      text-align: center;
    }
    .logo {
      color: white;
      font-size: 24px;
      font-weight: bold;
    }
    .content {
      padding: 32px;
      text-align: center;
    }
    .status-box {
      background: ${statusBg};
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
    }
    .status-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: ${statusColor};
      color: white;
      font-size: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
    }
    .status-title {
      color: ${statusColor};
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .status-message {
      color: #64748B;
      font-size: 14px;
      line-height: 1.6;
    }
    .info-text {
      color: #64748B;
      font-size: 13px;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .button {
      display: inline-block;
      background: #2563EB;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      transition: background 0.2s;
    }
    .button:hover {
      background: #1D4ED8;
    }
    .footer {
      background: #F8FAFC;
      padding: 16px;
      text-align: center;
    }
    .footer-text {
      color: #94A3B8;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">☀️ Educa Sol</div>
    </div>
    <div class="content">
      <div class="status-box">
        <div class="status-icon">${statusIcon}</div>
        <div class="status-title">${success ? 'Descadastrado com sucesso' : 'Erro ao processar'}</div>
        <div class="status-message">${message}</div>
      </div>
      ${success ? `
      <p class="info-text">
        Você não receberá mais emails de marketing do Educa Sol. 
        Emails transacionais importantes (como redefinição de senha) 
        continuarão sendo enviados.
      </p>
      ` : `
      <p class="info-text">
        Se o problema persistir, entre em contato conosco em 
        suporte@educasol.com.br
      </p>
      `}
      <a href="https://educasol.com.br" class="button">
        Voltar ao Educa Sol
      </a>
    </div>
    <div class="footer">
      <p class="footer-text">© ${new Date().getFullYear()} Educa Sol. Todos os direitos reservados.</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generates HTML page for preferences management
 */
function generatePreferencesPage(
  userId: string,
  email: string,
  preferences: { lgpd_consent: boolean; newsletter: boolean; product_updates: boolean },
  token: string
): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Educa Sol - Preferências de Email</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #F1F5F9;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      max-width: 520px;
      width: 100%;
      overflow: hidden;
    }
    .header {
      background: #2563EB;
      padding: 24px;
      text-align: center;
    }
    .logo {
      color: white;
      font-size: 24px;
      font-weight: bold;
    }
    .content {
      padding: 32px;
    }
    .title {
      color: #0F172A;
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .subtitle {
      color: #64748B;
      font-size: 14px;
      margin-bottom: 24px;
    }
    .email-display {
      background: #F8FAFC;
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 24px;
      font-size: 14px;
      color: #334155;
    }
    .preference-group {
      margin-bottom: 24px;
    }
    .preference-item {
      display: flex;
      align-items: flex-start;
      padding: 16px;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      margin-bottom: 12px;
      cursor: pointer;
      transition: border-color 0.2s, background 0.2s;
    }
    .preference-item:hover {
      border-color: #2563EB;
      background: #F8FAFC;
    }
    .preference-item input {
      margin-right: 12px;
      margin-top: 2px;
      width: 18px;
      height: 18px;
      cursor: pointer;
    }
    .preference-content {
      flex: 1;
    }
    .preference-title {
      color: #0F172A;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 4px;
    }
    .preference-desc {
      color: #64748B;
      font-size: 13px;
      line-height: 1.4;
    }
    .button-group {
      display: flex;
      gap: 12px;
    }
    .button {
      flex: 1;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      border: none;
      transition: background 0.2s;
    }
    .button-primary {
      background: #2563EB;
      color: white;
    }
    .button-primary:hover {
      background: #1D4ED8;
    }
    .button-secondary {
      background: #F1F5F9;
      color: #334155;
    }
    .button-secondary:hover {
      background: #E2E8F0;
    }
    .footer {
      background: #F8FAFC;
      padding: 16px;
      text-align: center;
    }
    .footer-text {
      color: #94A3B8;
      font-size: 12px;
    }
    .success-message {
      display: none;
      background: #F0FDF4;
      border: 1px solid #86EFAC;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 24px;
      color: #166534;
      font-size: 14px;
      text-align: center;
    }
    .success-message.show {
      display: block;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">☀️ Educa Sol</div>
    </div>
    <div class="content">
      <h1 class="title">Preferências de Email</h1>
      <p class="subtitle">Escolha quais tipos de comunicação você deseja receber.</p>
      
      <div class="email-display">
        📧 ${email}
      </div>

      <div id="success-message" class="success-message">
        ✓ Preferências atualizadas com sucesso!
      </div>

      <form id="preferences-form">
        <input type="hidden" name="token" value="${token}">
        <input type="hidden" name="userId" value="${userId}">
        
        <div class="preference-group">
          <label class="preference-item">
            <input type="checkbox" name="lgpd_consent" ${preferences.lgpd_consent ? 'checked' : ''}>
            <div class="preference-content">
              <div class="preference-title">Consentimento LGPD</div>
              <div class="preference-desc">
                Autorizo o Educa Sol a me enviar comunicações por email.
              </div>
            </div>
          </label>

          <label class="preference-item">
            <input type="checkbox" name="newsletter" ${preferences.newsletter ? 'checked' : ''}>
            <div class="preference-content">
              <div class="preference-title">Newsletter e Dicas</div>
              <div class="preference-desc">
                Receba dicas pedagógicas, novidades sobre a BNCC e conteúdo educacional.
              </div>
            </div>
          </label>

          <label class="preference-item">
            <input type="checkbox" name="product_updates" ${preferences.product_updates ? 'checked' : ''}>
            <div class="preference-content">
              <div class="preference-title">Atualizações do Produto</div>
              <div class="preference-desc">
                Alertas de uso, resumos semanais e novidades da plataforma.
              </div>
            </div>
          </label>
        </div>

        <div class="button-group">
          <button type="button" class="button button-secondary" onclick="unsubscribeAll()">
            Descadastrar de Tudo
          </button>
          <button type="submit" class="button button-primary">
            Salvar Preferências
          </button>
        </div>
      </form>
    </div>
    <div class="footer">
      <p class="footer-text">© ${new Date().getFullYear()} Educa Sol. Todos os direitos reservados.</p>
    </div>
  </div>

  <script>
    const form = document.getElementById('preferences-form');
    const successMessage = document.getElementById('success-message');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await savePreferences();
    });

    async function savePreferences() {
      const formData = new FormData(form);
      const data = {
        token: formData.get('token'),
        userId: formData.get('userId'),
        lgpd_consent: formData.get('lgpd_consent') === 'on',
        newsletter: formData.get('newsletter') === 'on',
        product_updates: formData.get('product_updates') === 'on',
      };

      try {
        const response = await fetch(window.location.href, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          successMessage.classList.add('show');
          setTimeout(() => successMessage.classList.remove('show'), 3000);
        } else {
          alert('Erro ao salvar preferências. Tente novamente.');
        }
      } catch (error) {
        alert('Erro ao salvar preferências. Tente novamente.');
      }
    }

    function unsubscribeAll() {
      document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
      savePreferences();
    }
  </script>
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
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    const action = url.searchParams.get('action'); // 'unsubscribe' or 'preferences'

    // Create Supabase client with service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Handle POST request (update preferences)
    if (req.method === 'POST') {
      const body = await req.json();
      const { userId, lgpd_consent, newsletter, product_updates } = body;

      if (!userId) {
        return new Response(
          JSON.stringify({ success: false, error: 'Missing userId' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { error } = await supabaseAdmin
        .from('marketing_preferences')
        .update({
          lgpd_consent: lgpd_consent ?? false,
          newsletter: newsletter ?? false,
          product_updates: product_updates ?? false,
          updated_at: new Date().toISOString(),
          unsubscribed_at: (!lgpd_consent && !newsletter && !product_updates) 
            ? new Date().toISOString() 
            : null,
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating preferences:', error);
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to update preferences' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle GET request
    if (!token) {
      const html = generateConfirmationPage(false, 'Token de descadastro não fornecido.');
      return new Response(html, {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    // Decode and validate token
    const tokenData = decodeToken(token);
    if (!tokenData) {
      const html = generateConfirmationPage(false, 'Token inválido ou expirado. Solicite um novo link de descadastro.');
      return new Response(html, {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    const { userId, email } = tokenData;

    // If action is 'preferences', show preferences page
    if (action === 'preferences') {
      // Get current preferences
      const { data: prefs, error: prefsError } = await supabaseAdmin
        .from('marketing_preferences')
        .select('lgpd_consent, newsletter, product_updates')
        .eq('user_id', userId)
        .single();

      if (prefsError || !prefs) {
        const html = generateConfirmationPage(false, 'Não foi possível carregar suas preferências.');
        return new Response(html, {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
        });
      }

      const html = generatePreferencesPage(userId, email, prefs, token);
      return new Response(html, {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    // Default action: unsubscribe from all marketing emails (1-click unsubscribe)
    const { error: updateError } = await supabaseAdmin
      .from('marketing_preferences')
      .update({
        lgpd_consent: false,
        newsletter: false,
        product_updates: false,
        unsubscribed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error updating preferences:', updateError);
      const html = generateConfirmationPage(false, 'Erro ao processar sua solicitação. Tente novamente mais tarde.');
      return new Response(html, {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    console.log(`User ${userId} unsubscribed from marketing emails`);

    const html = generateConfirmationPage(
      true, 
      `O email ${email} foi removido da nossa lista de marketing.`
    );
    return new Response(html, {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
    });

  } catch (error) {
    console.error('Error in unsubscribe:', error);
    const html = generateConfirmationPage(false, 'Erro interno. Tente novamente mais tarde.');
    return new Response(html, {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
    });
  }
});
