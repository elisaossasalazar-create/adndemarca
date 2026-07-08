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
  const subject = "Hoy todavía no has escrito tu journal ✍️";
  const html = shell(
    name,
    `<p style="margin:0 0 12px;font-size:22px;font-weight:700;color:#171717;line-height:1.3;">
      Tu journal de hoy te está esperando.
    </p>
    <p style="margin:0 0 12px;font-size:15px;color:#555555;line-height:1.6;">
      Son solo 3 páginas. No tienen que ser perfectas — solo honestas.
      Cada día que escribes estás construyendo tu marca desde adentro.
    </p>
    <p style="margin:0;font-size:15px;color:#555555;line-height:1.6;">
      Además, sumas <strong>+${points} puntos</strong> al marcarlo como completado.
      Cada punto cuenta para el ranking final.
    </p>
    ${ctaButton("Ir a completar mi journaling →", `${BASE_URL}/dashboard`)}`
  );
  return { subject, html };
}

// ── Escenario 2: journaling hecho, falta el reto de Hotmart ──────────────────
export function hotmartReminderEmail(name: string, week: number, points: number): { subject: string; html: string } {
  const subject = "Falta una cosa importante esta semana 👀";
  const html = shell(
    name,
    `<p style="margin:0 0 12px;font-size:22px;font-weight:700;color:#171717;line-height:1.3;">
      Tu journaling de hoy: ✓. Pero falta algo.
    </p>
    <p style="margin:0 0 12px;font-size:15px;color:#555555;line-height:1.6;">
      Todavía no has subido tu entregable de la semana ${week} a la comunidad de Hotmart.
      Ese es el reto que más pesa: pasar a la acción y mostrarte.
    </p>
    <p style="margin:0;font-size:15px;color:#555555;line-height:1.6;">
      Cuando lo hagas, marca el reto como completado en la app y sumas
      <strong>+${points} puntos</strong> de un golpe.
    </p>
    ${ctaButton("Marcar reto de Hotmart como hecho →", `${BASE_URL}/dashboard`)}`
  );
  return { subject, html };
}

// ── Escenario 3: diario + Hotmart hechos, no ha tomado retos extra ────────────
export function extrasMotivationEmail(name: string, points: number): { subject: string; html: string } {
  const subject = "Ya hiciste lo importante — ahora ve por los puntos extra 🏆";
  const html = shell(
    name,
    `<p style="margin:0 0 12px;font-size:22px;font-weight:700;color:#171717;line-height:1.3;">
      Journaling ✓ · Hotmart ✓<br/>¿Y los retos extra?
    </p>
    <p style="margin:0 0 12px;font-size:15px;color:#555555;line-height:1.6;">
      Ya tienes lo obligatorio de esta semana. Eso ya te pone por encima de muchos.
      Pero si quieres escalar en el ranking, los retos extra son tu oportunidad.
    </p>
    <p style="margin:0;font-size:15px;color:#555555;line-height:1.6;">
      Cada reto completado con evidencia suma <strong>+${points} puntos</strong>.
      Elige uno que se sienta pequeño y hazlo hoy.
    </p>
    ${ctaButton("Ver los retos extra de esta semana →", `${BASE_URL}/dashboard`)}`
  );
  return { subject, html };
}
