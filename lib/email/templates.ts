// Plantillas de correo de PawBites. Voz de Camila (FICHA-AVATAR.md): tuteo, cálida,
// clara, sin jerga; sus palabras ("gramos exactos", "sin adivinar", "lista del súper").
// Cada correo: 2 asuntos (A se usa hoy, B queda listo para probar), frase de vista
// previa, cuerpo corto y UN solo botón. Sin mayúsculas gritonas ni urgencia falsa.
// Todo dato que viene de fuera (nombre de Hotmart, nombre del perro) se escapa.

import { SITE_URL } from './config';

export interface Plantilla {
  subject: string;
  subjectAlt: string;
  preheader: string;
  html: string;
  text: string;
}

const CORAL = '#c0431d';
const TINTA = '#1b2a3d';
const SUAVE = '#5c6675';
const CREMA = '#fbf6ef';

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

interface Marco {
  preheader: string;
  parrafos: string[];
  boton?: { texto: string; url: string };
  notaFinal?: string;
  bajaUrl?: string;
}

function armar(m: Marco): { html: string; text: string } {
  const parrafosHtml = m.parrafos
    .map((p) => `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:${TINTA};">${p}</p>`)
    .join('');
  const botonHtml = m.boton
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr><td style="background:${CORAL};border-radius:12px;">
        <a href="${esc(m.boton.url)}" style="display:inline-block;padding:14px 28px;font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;font-family:Arial,Helvetica,sans-serif;">${esc(m.boton.texto)}</a>
      </td></tr></table>`
    : '';
  const notaHtml = m.notaFinal
    ? `<p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:${SUAVE};">${m.notaFinal}</p>`
    : '';
  const bajaHtml = m.bajaUrl
    ? `<p style="margin:12px 0 0;font-size:12px;line-height:1.5;color:${SUAVE};">Si no quieres recibir más correos como este, <a href="${esc(m.bajaUrl)}" style="color:${SUAVE};">date de baja aquí</a>.</p>`
    : '';

  const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>PawBites</title></head>
<body style="margin:0;padding:0;background:${CREMA};font-family:Arial,Helvetica,sans-serif;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${CREMA};">${esc(m.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CREMA};"><tr><td align="center" style="padding:24px 12px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:20px;">
    <tr><td style="padding:28px 28px 8px;">
      <img src="${SITE_URL}/logo.png" width="40" height="40" alt="PawBites" style="display:block;border-radius:10px;">
    </td></tr>
    <tr><td style="padding:12px 28px 28px;">
      ${parrafosHtml}${botonHtml}${notaHtml}
    </td></tr>
  </table>
  <p style="margin:16px 0 0;font-size:12px;line-height:1.5;color:${SUAVE};max-width:520px;">PawBites · paw-bites.com<br>Guía general para perros sanos: ante una condición médica, consulta a tu veterinario.</p>
  ${bajaHtml}
</td></tr></table></body></html>`;

  const quitarTags = (s: string) => s.replace(/<[^>]+>/g, '');
  const textoPlano = [
    ...m.parrafos.map(quitarTags),
    m.boton ? `${m.boton.texto}: ${m.boton.url}` : '',
    m.notaFinal ? quitarTags(m.notaFinal) : '',
    'PawBites · paw-bites.com',
    m.bajaUrl ? `Darte de baja: ${m.bajaUrl}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');
  return { html, text: textoPlano };
}

function saludo(nombre?: string | null): string {
  const n = nombre?.trim().split(/\s+/)[0];
  return n ? `Hola ${esc(n)},` : 'Hola,';
}

/** Correo 1 — acceso después de la compra (el más crítico). */
export function plantillaAcceso(d: { nombre?: string | null; enlace: string }): Plantilla {
  const { html, text } = armar({
    preheader: 'Un toque y ya estás dentro. Sin contraseñas.',
    parrafos: [
      saludo(d.nombre),
      'Gracias por empezar con PawBites. Tu acceso ya está activo.',
      'Toca el botón para entrar. Ahí vas a ver el plato de tu perro en gramos exactos, sin adivinar, y tu lista del súper.',
    ],
    boton: { texto: 'Entrar a PawBites', url: d.enlace },
    notaFinal: `Este enlace funciona una sola vez. Si se venció o no abre, entra a <a href="${SITE_URL}/entrar" style="color:${CORAL};">paw-bites.com/entrar</a> con este mismo correo y te mandamos otro al instante.<br><br>Cancelas cuando quieras, sin letra chica. ¿Dudas? Responde este correo y te ayudamos.`,
  });
  return {
    subject: 'Tu acceso a PawBites ya está listo',
    subjectAlt: 'Entra y ve el plato exacto de tu perro',
    preheader: 'Un toque y ya estás dentro. Sin contraseñas.',
    html,
    text,
  };
}

/** Carrito abandonado 1 (enseguida) — marketing. */
export function plantillaCarrito1(d: { nombre?: string | null; checkoutUrl: string; bajaUrl: string }): Plantilla {
  const { html, text } = armar({
    preheader: 'Empieza con 7 días gratis y cancela cuando quieras.',
    parrafos: [
      saludo(d.nombre),
      'Vimos que estabas a punto de empezar con PawBites. Si algo te frenó, aquí va lo importante:',
      '• Puedes probarlo con el período gratis de 7 días.<br>• Cancelas cuando quieras, sin letra chica.<br>• El plato sale en gramos exactos según el peso, la edad y la actividad de tu perro.',
    ],
    boton: { texto: 'Volver a mi plan', url: d.checkoutUrl },
    notaFinal: 'Si te quedó una duda, responde este correo y te la resolvemos.',
    bajaUrl: d.bajaUrl,
  });
  return {
    subject: '¿Te quedó alguna duda sobre PawBites?',
    subjectAlt: 'Tu plato en gramos exactos sigue esperándote',
    preheader: 'Empieza con 7 días gratis y cancela cuando quieras.',
    html,
    text,
  };
}

/** Carrito abandonado 2 (a las 24 h) — marketing. */
export function plantillaCarrito2(d: { nombre?: string | null; checkoutUrl: string; bajaUrl: string }): Plantilla {
  const { html, text } = armar({
    preheader: 'Un último recordatorio, sin presión.',
    parrafos: [
      saludo(d.nombre),
      'Calcular la comida de tu perro a ojo es lo que más miedo da: pasarte, quedarte corta o que le caiga mal.',
      'PawBites lo hace por ti: pones el peso, la edad y la actividad, y te da los gramos exactos de cada día y la lista del súper. Sin hojas de cálculo.',
      'Si prefieres no seguir, no pasa nada. No te escribiremos más sobre esto.',
    ],
    boton: { texto: 'Ver mi plato exacto', url: d.checkoutUrl },
    bajaUrl: d.bajaUrl,
  });
  return {
    subject: 'Lo que pasa si sigues calculando a ojo',
    subjectAlt: 'Una pregunta rápida sobre tu perro',
    preheader: 'Un último recordatorio, sin presión.',
    html,
    text,
  };
}

/** Pago fallido (Hotmart: compra atrasada) — transaccional. */
export function plantillaPagoFallido(d: { nombre?: string | null }): Plantilla {
  const { html, text } = armar({
    preheader: 'Tu acceso sigue activo unos días. Solo hay que actualizar el pago.',
    parrafos: [
      saludo(d.nombre),
      'Tu último pago de PawBites no se pudo procesar. Es más común de lo que parece: una tarjeta vencida, un límite o un bloqueo del banco.',
      'Tu acceso sigue activo unos días. Para no perderlo, actualiza tu método de pago desde el correo de recibo que te envió Hotmart.',
      'Si no lo encuentras o algo no cuadra, responde este correo y lo resolvemos juntos.',
    ],
    boton: { texto: 'Abrir PawBites', url: `${SITE_URL}/app` },
  });
  return {
    subject: 'Tu pago no se pudo procesar: tu acceso sigue activo',
    subjectAlt: 'Un detalle con tu pago de PawBites',
    preheader: 'Tu acceso sigue activo unos días. Solo hay que actualizar el pago.',
    html,
    text,
  };
}

/** Cancelación — transaccional, tono empático. */
export function plantillaCancelacion(d: { nombre?: string | null }): Plantilla {
  const { html, text } = armar({
    preheader: 'No te cobraremos más. Tus datos siguen guardados.',
    parrafos: [
      saludo(d.nombre),
      'Recibimos la cancelación de tu suscripción. No te cobraremos más.',
      'Tu acceso sigue hasta que termine el período que ya pagaste (o tu prueba). Tus datos y el plan de tu perro quedan guardados por si decides volver.',
      'Si fue por algo que podemos mejorar, respóndenos con una línea: leemos todo.',
    ],
  });
  return {
    subject: 'Cancelaste PawBites: esto es lo que pasa ahora',
    subjectAlt: 'Listo, cancelamos tu suscripción',
    preheader: 'No te cobraremos más. Tus datos siguen guardados.',
    html,
    text,
  };
}

/** Día 3 de la prueba — activación. */
export function plantillaTrialD3(d: { nombre?: string | null; perro?: string | null }): Plantilla {
  const perro = d.perro?.trim();
  const con = perro ? `con ${esc(perro)}` : 'con tu perro';
  const { html, text } = armar({
    preheader: 'Un paso corto para que la transición vaya bien.',
    parrafos: [
      saludo(d.nombre),
      `Ya van 3 días ${con}. Lo que más ayuda ahora es anotar en la app cómo salió cada día (heces bien formadas o blandas). Si hay diarrea, el plato se ajusta solo.`,
      'Y revisa la lista del súper de tu primera tanda, así no improvisas en la tienda.',
    ],
    boton: { texto: 'Abrir mi plan', url: `${SITE_URL}/app/plan` },
  });
  return {
    subject: perro ? `${perro}: ya van 3 días` : 'Ya van 3 días con PawBites',
    subjectAlt: '¿Ya armaste tu lista del súper?',
    preheader: 'Un paso corto para que la transición vaya bien.',
    html,
    text,
  };
}

/** Día 6 de la prueba — aviso honesto antes del cobro (transaccional). */
export function plantillaTrialD6(d: { nombre?: string | null; perro?: string | null }): Plantilla {
  const perro = d.perro?.trim();
  const { html, text } = armar({
    preheader: 'Esto es lo que pasa mañana y cómo cancelar si no quieres seguir.',
    parrafos: [
      saludo(d.nombre),
      'Mañana termina tu prueba gratis de PawBites.',
      'Si sigues, se cobra el plan que elegiste (mensual $4.99 o anual $29.99). Si no quieres seguir, cancela antes desde el correo de recibo de Hotmart y no pagas nada.',
      perro
        ? `Lo que ya tienes armado para ${esc(perro)}: su plato en gramos exactos, el plan de transición de 14 días y la lista del súper.`
        : 'Lo que ya tienes armado: tu plato en gramos exactos, el plan de transición de 14 días y la lista del súper.',
    ],
    boton: { texto: 'Seguir con mi plan', url: `${SITE_URL}/app` },
    notaFinal: 'Si necesitas ayuda para cancelar, responde este correo.',
  });
  return {
    subject: 'Mañana termina tu prueba de PawBites',
    subjectAlt: 'Tu prueba termina mañana: esto es lo que pasa',
    preheader: 'Esto es lo que pasa mañana y cómo cancelar si no quieres seguir.',
    html,
    text,
  };
}
