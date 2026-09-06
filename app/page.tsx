'use client';

// Landing de PawBites — 10 secciones canónicas (19-PAGINA-DE-VENTAS.md), copy
// marcado desde docs/copy/landing.md, tokens desde FICHA-ARTE.md (components/landing/tokens.css).
// Modelo 02C: onboarding-first anónimo — todo CTA lleva a /onboarding.

import { Scale, HeartCrack, Snowflake, CircleHelp } from 'lucide-react';
import { Hero } from '@/components/landing/Hero';
import { PlatoMockup, IngredientesBand, CategoriaBar, BackToTop, AyudaContacto } from '@/components/landing/PlatoMockup';
import { Problema } from '@/components/landing/Problema';
import { Agitacion } from '@/components/landing/Agitacion';
import { Solucion } from '@/components/landing/Solucion';
import { AppPorDentro } from '@/components/landing/AppPorDentro';
import { Oferta } from '@/components/landing/Oferta';
import { Garantia } from '@/components/landing/Garantia';
import { Faq } from '@/components/landing/Faq';
import { CtaFinal } from '@/components/landing/CtaFinal';
import { FooterLegal } from '@/components/landing/FooterLegal';
import { StickyCtaMobile, SectionShell } from '@/components/landing/ui';

const CTA_HREF = '/onboarding';
const CTA_LABEL = 'Calcular el plato de mi perro';

export default function LandingPawBites() {
  return (
    <div className="min-h-dvh bg-[var(--bg)] text-[var(--text-primary)] [font-family:var(--font-body)]">
      <a
        href="#hero"
        className="sr-only rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50"
      >
        Saltar al contenido
      </a>

      {/* 1. HERO */}
      <Hero
        appName="PawBites"
        loginHref="/entrar"
        preciosHref="#oferta"
        navExtra={[
          { label: 'Cómo funciona', href: '#solucion' },
          { label: 'Preguntas', href: '#faq' },
        ]}
        h1Marked="El plato [acento]exacto[/acento] de tu perro, en gramos, hoy mismo"
        subtitleMarked="El Plato Exacto calcula sus porciones y arma [b]la lista del súper[/b] por ti"
        ctaLabel={CTA_LABEL}
        ctaHref={CTA_HREF}
        socialProof={<span>Garantía del Primer Plato — Hotmart, 7 días</span>}
        visual={<PlatoMockup />}
      />

      {/* 2. PROBLEMA */}
      <Problema
        titulo="¿Te suena?"
        preguntas={[
          { icon: Scale, textoMarked: '¿Se te complica calcular los gramos exactos que necesita tu perro?' },
          { icon: HeartCrack, textoMarked: '¿Te da miedo hacerlo mal y que le falte algo importante?' },
          { icon: Snowflake, textoMarked: '¿Preparas comida para varios días y ya no cabe en el congelador?' },
          { icon: CircleHelp, textoMarked: '¿Buscaste tablas y calculadoras y terminaste con 15 pestañas sin respuesta clara?' },
        ]}
      />

      {/* 3. AGITACIÓN */}
      <Agitacion
        frases={[
          'Cada semana que sigues [b]calculando a ojo[/b] es una semana más de miedo a equivocarte.',
          'Y si preparas en batch, cada [acento]15 días se repite lo mismo[/acento]: el congelador no da más.',
          'Mientras tanto, tu perro sigue comiendo lo que ya no querías seguir dándole.',
        ]}
        contraste={{
          labelHoy: 'Hoy',
          hoy: 'Calculas a ojo, dudas de las cantidades, y el concentrado sigue en el plato.',
          labelFuturo: 'En un mes, si nada cambia',
          futuro: 'Sigues postergando el cambio — con la misma duda de siempre.',
        }}
      />

      {/* 4. SOLUCIÓN */}
      <Solucion
        id="solucion"
        tituloMarked="El plato de tu perro, [acento]calculado por ti[/acento]"
        mecanismo="el Plato Exacto"
        bigIdeaMarked="No es que te falte disciplina — es que las calculadoras que probaste son para expertos. [b]El Plato Exacto[/b] hace el cálculo por ti, en 3 clics."
        pasos={[
          { titulo: 'Cuéntanos de tu perro', detalle: 'Peso, edad, actividad y su tipo de dieta.' },
          { titulo: 'El Plato Exacto calcula', detalle: 'Gramos por proteína, hueso, víscera y verdura.' },
          { titulo: 'Recibes todo listo', detalle: 'El plato de hoy y la lista del súper de la semana.' },
        ]}
        antesDespues={{
          labelAntes: 'Antes',
          antes: 'Hojas de cálculo, tablas confusas y miedo a equivocarte.',
          labelDespues: 'Con PawBites',
          despues: 'El plato exacto de tu perro, listo en menos de 3 minutos.',
        }}
      />

      {/* Coda visual de la sección 4 — repite el dispositivo ownable de la ficha (satélites) */}
      <SectionShell elevacion="base" flush="top" compacta ariaLabel="Grupos del plato">
        <IngredientesBand titulo="Los 4 grupos que arma el Plato Exacto" />
      </SectionShell>

      {/* 5. LA APP POR DENTRO (placeholders honestos — app interna en Sesión 5) */}
      <AppPorDentro
        tituloMarked="Tu día a día con [acento]PawBites[/acento]"
        frames={[
          { label: 'El plato de hoy, en gramos', nombrePantalla: 'Hoy' },
          { label: 'Tu plan de transición de 14 días', nombrePantalla: 'Plan' },
          { label: 'La lista del súper, lista para marcar', nombrePantalla: 'Compras' },
          { label: 'El perfil de tu perro', nombrePantalla: 'Perfil' },
        ]}
        ctaLabel={CTA_LABEL}
        ctaHref={CTA_HREF}
      />

      {/* 6. OFERTA — el dispositivo satélite ahora vive INTEGRADO en la card Anual (CategoriaBar) */}
      <Oferta
        tituloMarked="Empieza gratis. Sigue por [acento]$0.10 al día[/acento]"
        trialDias={3}
        stack={{
          lineas: [
            { resultado: 'PawBites Pro con el Plato Exacto (12 meses)', valor: '$60' },
            { resultado: 'Plan de transición de 14 días guiado', valor: '$19' },
            { resultado: 'Sustitutor de ingredientes sin complicarte', valor: '$15' },
          ],
          totalTachado: '$94',
          nota: 'Hoy: $2.50/mes (se cobra $29.99/año)',
        }}
        anual={{
          nombre: 'Anual',
          badge: 'MÁS POPULAR',
          precioMes: '$2.50',
          totalAnual: 'Se cobra $29.99/año',
          ahorro: '6 meses gratis',
          descomposicionDia: 'menos de $0.10 al día',
          ctaLabel: 'Empezar mis 3 días gratis',
          ctaHref: CTA_HREF,
          features: [
            'El plato exacto de tu perro cada día',
            'Plan de transición de 14 días',
            'Lista del súper automática',
            'Elige preparar cada 7 o 15 días',
          ],
        }}
        extraAnual={
          <div className="flex flex-col gap-3">
            <CategoriaBar />
            <p className="text-xs text-[var(--text-secondary)]">Cancelas cuando quieras · sin letra chica</p>
          </div>
        }
        mensual={{
          nombre: 'Mensual',
          precioMes: '$4.99',
          ctaLabel: 'Elegir mensual',
          ctaHref: CTA_HREF,
          features: [
            'El plato exacto de tu perro cada día',
            'Plan de transición de 14 días',
            'Lista del súper automática',
            'Cancelas cuando quieras',
          ],
        }}
      />

      {/* 7. GARANTÍA (7 días > 3 días de prueba) */}
      <Garantia
        nombre="la Garantía del Primer Plato"
        condicionMarked="Si en tus primeros 7 días el Plato Exacto no te da el desglose correcto para tu perro, escribes un correo y te devolvemos todo. [b]Sin preguntas.[/b]"
        pisoLegal="Respaldada por la garantía Hotmart de 7 días"
      />

      {/* 8. FAQ */}
      <Faq
        id="faq"
        items={[
          {
            pregunta: '¿Necesito saber de nutrición canina?',
            respuestaMarked: 'No: el Plato Exacto hace el cálculo por ti. Tú solo [b]ingresas el peso y la actividad[/b] de tu perro.',
          },
          {
            pregunta: '¿Y si no consigo un ingrediente?',
            respuestaMarked: 'Usa el sustitutor rápido: cambias hígado por otra víscera equivalente en un toque.',
          },
          {
            pregunta: '¿Es caro comparado con el concentrado?',
            respuestaMarked: 'Cuesta menos de $0.10 al día — mucho menos que un nutricionista veterinario o la comida precocinada premium.',
          },
          {
            pregunta: '¿Qué pasa si mi perro tiene una condición médica?',
            respuestaMarked: 'PawBites da recomendaciones para perros sanos. Con condiciones previas, [b]consulta siempre a tu veterinario[/b] antes de cambiar su dieta.',
          },
          {
            pregunta: '¿Puedo pagar de forma segura?',
            respuestaMarked: 'Pagas por Hotmart — tarjeta o el método disponible en tu país. Cancelas cuando quieras.',
          },
        ]}
      />

      {/* Ayuda/documentación (h10 de usabilidad): salida clara si la FAQ no resolvió la duda */}
      <AyudaContacto email="hola@pawbites.app" />

      {/* 9. CTA FINAL */}
      <CtaFinal
        h2Marked="Imagina el plato de tu perro, [acento]ya resuelto[/acento]"
        futurePacingMarked="Abres la app, ves el plato de hoy en gramos, y sigues con tu día — sin dudas, sin Excel."
        ctaLabel={CTA_LABEL}
        ctaHref={CTA_HREF}
        recap="Garantía del Primer Plato · 3 días gratis"
        psMarked="Recuerda: PawBites calcula el plato exacto de tu perro y arma tu lista del súper con el Plato Exacto. Hoy entras con 3 días gratis y la Garantía del Primer Plato."
      />

      {/* 10. FOOTER LEGAL */}
      <FooterLegal
        appName="PawBites"
        soporteEmail="hola@pawbites.app"
        enlaces={[
          { label: 'Privacidad', href: '/privacidad' },
          { label: 'Términos y Condiciones', href: '/terminos' },
          { label: 'Reembolsos', href: '/reembolsos' },
          { label: 'Aviso Nutricional', href: '/aviso-nutricional' },
        ]}
      />

      <StickyCtaMobile labelComercial={CTA_LABEL} href={CTA_HREF} />
      <BackToTop />
    </div>
  );
}
