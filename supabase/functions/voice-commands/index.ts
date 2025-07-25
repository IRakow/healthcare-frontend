import { serve } from 'https://deno.land/std/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { user_id, command, parsed } = await req.json();

    if (!user_id || !command) {
      throw new Error('Missing required fields: user_id or command');
    }

    let response = { reply: '', data: null };

    switch (command) {
      case 'book_appointment':
        response = await handleBookAppointment(user_id, parsed);
        break;
      
      case 'add_medication':
        response = await handleAddMedication(user_id, parsed);
        break;
      
      case 'upload_document':
        response = await handleDocumentUpload(user_id, parsed);
        break;
      
      case 'check_appointments':
        response = await handleCheckAppointments(user_id);
        break;
      
      case 'update_intake':
        response = await handleUpdateIntake(user_id, parsed);
        break;
      
      default:
        response.reply = `❌ Unknown command: ${command}`;
    }

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error processing command:', error);
    return new Response(
      JSON.stringify({ 
        reply: `❌ Error: ${error.message}`,
        error: true 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});

async function handleBookAppointment(user_id: string, parsed: any) {
  // Validate user
  const { data: patient, error: patientError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user_id)
    .single();

  if (patientError || !patient) {
    throw new Error('Patient not found');
  }

  // Get providers
  const { data: providers } = await supabase
    .from('users')
    .select('id, full_name')
    .eq('role', 'provider');

  if (!providers || providers.length === 0) {
    throw new Error('No providers available');
  }

  // Find provider
  let provider_id = '';
  let provider_name = 'a provider';

  if (parsed.providerName) {
    const match = providers.find((p) => 
      p.full_name.toLowerCase().includes(parsed.providerName.toLowerCase())
    );
    if (match) {
      provider_id = match.id;
      provider_name = match.full_name;
    }
  }

  // Use first available provider if no match
  if (!provider_id) {
    provider_id = providers[0].id;
    provider_name = providers[0].full_name;
  }

  // Create appointment
  const appointment = {
    patient_id: patient.id,
    provider_id,
    date: parsed.date,
    time: parsed.time,
    reason: parsed.reason || 'General Consultation',
    type: parsed.type || 'telemed',
    status: 'pending'
  };

  const { error: appointmentError } = await supabase
    .from('appointments')
    .insert(appointment);

  if (appointmentError) {
    throw new Error('Failed to create appointment');
  }

  // Create timeline event with exact structure
  await supabase.from('patient_timeline_events').insert({
    patient_id: patient.id,
    type: 'visit',
    label: `Appointment Booked – ${parsed.date} at ${parsed.time}`,
    data: parsed
  });

  return {
    reply: `✅ Appointment booked with ${provider_name} on ${parsed.date} at ${parsed.time}`,
    data: appointment
  };
}

async function handleAddMedication(user_id: string, parsed: any) {
  // Validate required fields
  if (!parsed.name) {
    throw new Error('Medication name is required');
  }

  const med = {
    patient_id: user_id,
    name: parsed.name,
    strength: parsed.strength || '',
    dosage: parsed.dosage || '',
    frequency: parsed.frequency || '',
    is_active: true
  };

  const { error } = await supabase.from('medications').insert(med);
  
  if (error) {
    throw new Error('Failed to add medication');
  }

  // Create timeline event with exact structure
  await supabase.from('patient_timeline_events').insert({
    patient_id: user_id,
    type: 'med',
    label: `Medication Added – ${parsed.name}`,
    data: parsed
  });

  return {
    reply: `✅ Added ${parsed.name} to your medications`,
    data: med
  };
}

async function handleDocumentUpload(user_id: string, parsed: any) {
  if (!parsed.filename || !parsed.url) {
    throw new Error('Document filename and URL are required');
  }

  const upload = {
    patient_id: user_id,
    filename: parsed.filename,
    url: parsed.url,
    type: parsed.type || 'general',
    category: parsed.category || 'general'
  };

  const { error } = await supabase.from('uploads').insert(upload);
  
  if (error) {
    throw new Error('Failed to record document upload');
  }

  // Create timeline event with exact structure
  await supabase.from('patient_timeline_events').insert({
    patient_id: user_id,
    type: 'upload',
    label: `Uploaded ${parsed.filename}`,
    data: parsed
  });

  return {
    reply: `✅ Document "${parsed.filename}" uploaded successfully`,
    data: upload
  };
}

async function handleCheckAppointments(user_id: string) {
  const today = new Date().toISOString().split('T')[0];
  
  const { data: appointments, error } = await supabase
    .from('appointments')
    .select(`
      *,
      provider:users!appointments_provider_id_fkey(full_name)
    `)
    .eq('patient_id', user_id)
    .gte('date', today)
    .in('status', ['pending', 'confirmed'])
    .order('date', { ascending: true })
    .order('time', { ascending: true })
    .limit(3);

  if (error) {
    throw new Error('Failed to fetch appointments');
  }

  if (!appointments || appointments.length === 0) {
    return {
      reply: 'You have no upcoming appointments.',
      data: []
    };
  }

  const appointmentList = appointments.map(apt => 
    `• ${apt.date} at ${apt.time} - ${apt.reason} with ${apt.provider?.full_name || 'Provider'}`
  ).join('\n');

  return {
    reply: `Your upcoming appointments:\n${appointmentList}`,
    data: appointments
  };
}

async function handleUpdateIntake(user_id: string, parsed: any) {
  const { field, value, action = 'add' } = parsed;
  
  if (!field || !value) {
    throw new Error('Field and value are required for intake update');
  }

  // Validate field
  const validFields = ['conditions', 'surgeries', 'allergies', 'family_history'];
  if (!validFields.includes(field)) {
    throw new Error(`Invalid field. Must be one of: ${validFields.join(', ')}`);
  }

  // Get current intake
  const { data: current } = await supabase
    .from('patient_intake')
    .select('*')
    .eq('patient_id', user_id)
    .maybeSingle();

  let updatedField = current?.[field] || [];
  
  if (action === 'add') {
    if (!updatedField.includes(value)) {
      updatedField.push(value);
    }
  } else if (action === 'remove') {
    updatedField = updatedField.filter((item: string) => item !== value);
  }

  // Update or insert
  if (current) {
    await supabase
      .from('patient_intake')
      .update({ [field]: updatedField })
      .eq('patient_id', user_id);
  } else {
    await supabase
      .from('patient_intake')
      .insert({
        patient_id: user_id,
        [field]: [value]
      });
  }

  // Create timeline event
  await supabase.from('patient_timeline_events').insert({
    patient_id: user_id,
    type: 'update',
    label: `Medical History Updated - ${field}`,
    data: { field, value, action }
  });

  const fieldLabel = field.replace('_', ' ');
  return {
    reply: `✅ ${action === 'add' ? 'Added' : 'Removed'} "${value}" ${action === 'add' ? 'to' : 'from'} your ${fieldLabel}`,
    data: { field, value, action }
  };
}