-- Diagnóstico sin PII: cuando un aviso de Hotmart no se puede procesar o se ignora, se
-- guarda la FORMA del mensaje (solo nombres de campos, nunca valores) para poder ajustar
-- la lectura sin necesitar los logs de Vercel.
alter table public.webhook_log add column detail text;
