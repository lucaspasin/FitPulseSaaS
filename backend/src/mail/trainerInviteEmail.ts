export function buildTrainerInviteEmail(input: {
  name: string;
  email: string;
  temporaryPassword: string;
  loginUrl: string;
}): { subject: string; text: string; html: string } {
  const subject = 'Seu acesso de treinador no FitPulse';
  const text = [
    `Olá, ${input.name}.`,
    '',
    'Sua conta de treinador foi criada no FitPulse.',
    `E-mail: ${input.email}`,
    `Senha provisória: ${input.temporaryPassword}`,
    '',
    `Entre em: ${input.loginUrl}`,
    'Recomendamos alterar a senha após o primeiro acesso.'
  ].join('\n');

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#0f172a">
      <h1 style="font-size:20px;margin-bottom:12px">Bem-vindo ao FitPulse</h1>
      <p>Olá, <strong>${escapeHtml(input.name)}</strong>.</p>
      <p>Sua conta de treinador foi criada. Use os dados abaixo para o primeiro acesso:</p>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin:16px 0">
        <p style="margin:0 0 8px"><strong>E-mail:</strong> ${escapeHtml(input.email)}</p>
        <p style="margin:0"><strong>Senha provisória:</strong> ${escapeHtml(input.temporaryPassword)}</p>
      </div>
      <p>
        <a href="${escapeHtml(input.loginUrl)}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:10px 16px;border-radius:10px;font-weight:700">
          Acessar o FitPulse
        </a>
      </p>
      <p style="color:#64748b;font-size:13px">Recomendamos alterar a senha após o primeiro acesso.</p>
    </div>
  `;

  return { subject, text, html };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
