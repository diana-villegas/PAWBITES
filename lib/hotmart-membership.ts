// Mapeo evento de Hotmart → plan de PawBites. Ver docs/sistema/18-VENTA-HOTMART.md
// "MÁQUINA DE ESTADOS DE LA MEMBRESÍA" — adaptado al esquema real de este
// proyecto: `profiles.plan` es 'trial' | 'mensual' | 'anual' | 'cancelado'
// (no hay un status separado de trialing/active/past_due).

export type Plan = 'trial' | 'mensual' | 'anual' | 'cancelado';

/** Los 2 offer codes reales del producto (components/onboarding/Paywall.tsx,
 * HOTMART_CHECKOUT_URL) — determinan a qué plan sube una compra. */
const OFFER_TO_PLAN: Record<string, Plan> = {
  zvhojwxd: 'anual',
  l303zeos: 'mensual',
};

export function planForOfferCode(offerCode: string | undefined): Plan | null {
  if (!offerCode) return null;
  return OFFER_TO_PLAN[offerCode] ?? null;
}

/** ⚠️ PLACEHOLDER — verificar con una compra sandbox real (mini-procedimiento
 * de 5 pasos en 18-VENTA-HOTMART.md, sección "OPERACIONES DE SUSCRIPCIÓN").
 * Es plausible que Hotmart dispare esto como un PURCHASE_APPROVED con
 * price/value = 0, no como un evento propio — si es así, ajustar
 * `planForEvent` para leer ese caso desde el payload en vez de este nombre. */
export const TRIAL_START_EVENT = 'SUBSCRIPTION_TRIAL_START';

export const PLAN_CHANGE_EVENT = 'SWITCH_PLAN';

/** Eventos que SIEMPRE cortan el acceso — dinero devuelto o disputado, nunca
 * se reactivan con un evento de acceso reentregado más viejo (ver la RPC). */
const CUTS_ACCESS_NOW = new Set(['PURCHASE_REFUNDED', 'PURCHASE_CHARGEBACK', 'PURCHASE_EXPIRED']);

/** Eventos que NO deben tocar el plan (se registran en webhook_log, pero no
 * cambian el acceso): cancelación (deja de renovar, pero lo ya pagado se
 * respeta — sin tracking de fin de período en este esquema, la forma segura
 * es NO cortar aquí; el acceso se corta cuando de verdad expira, evento
 * PURCHASE_EXPIRED) y pago atrasado (dunning: gracia, no corte inmediato). */
const NO_PLAN_CHANGE = new Set(['SUBSCRIPTION_CANCELLATION', 'PURCHASE_DELAYED']);

export interface PlanDecision {
  /** null = no cambiar el plan actual (solo registrar el evento). */
  plan: Plan | null;
  trialEndsAt?: Date;
}

/** Decide el plan resultante de un evento. `offerCode` viene del payload
 * (oferta/plan comprado) — necesario para PURCHASE_APPROVED/COMPLETE y
 * SWITCH_PLAN, que suben a 'mensual' o 'anual' según qué se compró. */
export function planForEvent(event: string, offerCode: string | undefined): PlanDecision {
  if (event === TRIAL_START_EVENT) {
    return { plan: 'trial', trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) };
  }
  if (event === 'PURCHASE_APPROVED' || event === 'PURCHASE_COMPLETE' || event === PLAN_CHANGE_EVENT) {
    return { plan: planForOfferCode(offerCode) ?? null };
  }
  if (CUTS_ACCESS_NOW.has(event)) {
    return { plan: 'cancelado' };
  }
  if (NO_PLAN_CHANGE.has(event)) {
    return { plan: null };
  }
  return { plan: null };
}
