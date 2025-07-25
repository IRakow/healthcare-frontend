import { supabase } from '@/lib/supabase';

export async function logout() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
      throw error;
    }
    
    // Clear any local storage or session data if needed
    localStorage.removeItem('user_preferences');
    sessionStorage.clear();
    
    // Redirect to home page
    window.location.href = '/';
  } catch (error) {
    console.error('Failed to logout:', error);
    // Force redirect even if logout fails
    window.location.href = '/';
  }
}