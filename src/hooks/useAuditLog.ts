import { supabase } from '@/lib/supabase';

interface AuditContext {
  [key: string]: any;
}

export const useAuditLog = () => {
  const logAction = async (action: string, context: AuditContext = {}) => {
    try {
      const { data, error } = await supabase.rpc('log_action', {
        p_action: action,
        p_context: context
      });

      if (error) {
        console.error('Failed to log action:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Audit log error:', error);
      return null;
    }
  };

  const logUserAction = (action: string, details: AuditContext = {}) => {
    // Fire and forget - don't await
    logAction(action, {
      ...details,
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
      url: window.location.href
    });
  };

  const logError = (action: string, error: any, context: AuditContext = {}) => {
    logAction(`error.${action}`, {
      ...context,
      error_message: error.message || String(error),
      error_stack: error.stack,
      timestamp: new Date().toISOString()
    });
  };

  const logApiCall = (endpoint: string, method: string, status: number, context: AuditContext = {}) => {
    logAction('api.call', {
      endpoint,
      method,
      status,
      ...context,
      timestamp: new Date().toISOString()
    });
  };

  return {
    logAction,
    logUserAction,
    logError,
    logApiCall
  };
};