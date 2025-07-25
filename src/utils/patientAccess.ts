import { supabase } from '@/lib/supabaseClient';

export async function checkPatientAccess(patientId: string) {
  const user = supabase.auth.user();
  const { data: share } = await supabase
    .from('patient_shares')
    .select('*')
    .eq('shared_with_id', user.id)
    .eq('owner_id', patientId)
    .eq('revoked', false)
    .maybeSingle();

  const canSeeLabs = user.id === patientId || share?.access_labs;
  const canSeeMeds = user.id === patientId || share?.access_meds;
  const canSeeAppointments = user.id === patientId || share?.access_appointments;
  const canSeeUploads = user.id === patientId || share?.access_uploads;
  const canSeeTimeline = user.id === patientId || share?.access_timeline;

  return {
    canSeeLabs,
    canSeeMeds,
    canSeeAppointments,
    canSeeUploads,
    canSeeTimeline,
    isOwner: user.id === patientId
  };
}