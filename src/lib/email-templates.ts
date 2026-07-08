const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

function shell(name: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ADN de Marca</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;">

        <!-- Header -->
        <tr>
          <td style="padding:28px 32px 0;border-bottom:1px solid #f0f0f0;">
            <p style="margin:0 0 4px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#999999;">ADN de Marca · 7ma Edición</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:28px 32px;">
            <p style="margin:0 0 20px;font-size:15px;color:#444444;">Hola, <strong>${name}</strong> 👋</p>
            ${body}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;border-top:1px solid #f0f0f0;background:#fafafa;">
            <p style="margin:0;font-size:11px;color:#bbbbbb;text-align:center;">
              Recibes este correo porque estás inscrita/o en el reto ADN de Marca.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function ctaButton(text: string, url: string): string {
  return `<a href="${url}" style="display:inline-block;margin-top:24px;padding:14px 28px;background:#171717;color:#ffffff;text-decoration:none;border-radius:100px;font-size:14px;font-weight:600;">${text}</a>`;
}

// ── Escenario 1: no ha hecho el journaling de hoy ─────────────────────────────
export function journalReminderEmail(name: string, points: number): { subject: string; html: string } {
  const subject = "✍🏼 tus 3 hojas diarias te están esperandooo";
  const html = shell(
    name,
    `<p style="margin:0 0 16px;font-size:15px;color:#555555;line-height:1.7;">
      son sólo 30 minutos que pueden ayudarte a desenredar lo que hay en tu mente
      para que te liberes creativamente, you got thisss superstar,
      ve y completa tus páginas del día 🌟
    </p>
    <p style="margin:0;font-size:13px;color:#999999;line-height:1.6;">
      Al marcarlo como completado sumas <strong>+${points} puntos</strong> en el ranking.
    </p>
    ${ctaButton("completar mi journaling de hoy →", `${BASE_URL}/dashboard`)}`
  );
  return { subject, html };
}

// ── Escenario 2: journaling hecho, falta el reto de Hotmart ──────────────────
export function hotmartReminderEmail(name: string, week: number, points: number): { subject: string; html: string } {
  const subject = "🥹 tenemos un pendiente ...";
  const html = shell(
    name,
    `<p style="margin:0 0 16px;font-size:15px;color:#555555;line-height:1.7;">
      amooo ver que estás comprometida con tus morning pagesss 🫶
      peeero plis no me dejes en el olvido el reto semanal de Hotmart —
      recuerda dejar en la sección de comunidad tu reto de la semana ${week}.
    </p>
    <p style="margin:0;font-size:13px;color:#999999;line-height:1.6;">
      Cuando lo marques como hecho sumas <strong>+${points} puntos</strong> de un golpe.
    </p>
    ${ctaButton("marcar reto de Hotmart como hecho →", `${BASE_URL}/dashboard`)}`
  );
  return { subject, html };
}

// ── Escenario 3: diario + Hotmart hechos, no ha tocado retos extra ────────────
export function extrasMotivationEmail(name: string, points: number): { subject: string; html: string } {
  const subject = "👀 y si nos lanzamos con un reto?";
  const html = shell(
    name,
    `<p style="margin:0 0 16px;font-size:15px;color:#555555;line-height:1.7;">
      my little superstar verteee tan activa me da mil años de vida 🌈
      y sé que lanzarte con uno de los retos extra va a terminar de llevarte al estrellato —
      ¿ya viste los retos extra de esta semana?
    </p>
    <p style="margin:0;font-size:13px;color:#999999;line-height:1.6;">
      Cada reto completado con evidencia suma <strong>+${points} puntos</strong>.
    </p>
    ${ctaButton("ver los retos extra →", `${BASE_URL}/dashboard`)}`
  );
  return { subject, html };
}
