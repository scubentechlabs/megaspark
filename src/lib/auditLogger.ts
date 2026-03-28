import { supabase } from "@/integrations/supabase/client";

export async function logAuditEvent(
  action: string,
  tableName?: string,
  recordId?: string,
  details?: Record<string, unknown>
) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    await supabase.from('audit_log').insert({
      user_id: session.user.id,
      user_email: session.user.email || 'unknown',
      action,
      table_name: tableName,
      record_id: recordId,
      details: details as any,
      user_agent: navigator.userAgent,
    });
  } catch {
    // Silent fail - audit logging should never break the app
  }
}
