import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AcceptInvitationRequest {
  token: string
  password: string
  fullName: string
  phoneNumber?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { token, password, fullName, phoneNumber }: AcceptInvitationRequest = await req.json()

    // Validate invitation token
    const { data: invitation, error: inviteError } = await supabaseClient
      .from('invitations')
      .select('*')
      .eq('token', token)
      .eq('status', 'pending')
      .single()

    if (inviteError || !invitation) {
      throw new Error('Invalid or expired invitation')
    }

    // Check if invitation has expired
    if (new Date(invitation.expires_at) < new Date()) {
      await supabaseClient
        .from('invitations')
        .update({ status: 'expired' })
        .eq('id', invitation.id)
      
      throw new Error('Invitation has expired')
    }

    // Create auth user
    const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
      email: invitation.email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role: invitation.role,
        organization_id: invitation.organization_id
      }
    })

    if (authError) {
      throw authError
    }

    // Create profile
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: invitation.email,
        full_name: fullName,
        phone_number: phoneNumber,
        role: invitation.role,
        organization_id: invitation.organization_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (profileError) {
      // Rollback auth user if profile creation fails
      await supabaseClient.auth.admin.deleteUser(authData.user.id)
      throw profileError
    }

    // If role is patient, create patient record
    if (invitation.role === 'patient') {
      await supabaseClient
        .from('patients')
        .insert({
          id: authData.user.id,
          organization_id: invitation.organization_id,
          created_at: new Date().toISOString()
        })
    }

    // If role is provider, create provider record
    if (invitation.role === 'provider') {
      await supabaseClient
        .from('providers')
        .insert({
          id: authData.user.id,
          organization_id: invitation.organization_id,
          created_at: new Date().toISOString()
        })
    }

    // Update invitation status
    await supabaseClient
      .from('invitations')
      .update({ 
        status: 'accepted',
        accepted_at: new Date().toISOString()
      })
      .eq('id', invitation.id)

    // Log the acceptance
    await supabaseClient.from('audit_logs').insert({
      action: 'invitation.accepted',
      entity_type: 'user',
      entity_id: authData.user.id,
      user_id: authData.user.id,
      metadata: { 
        invitation_id: invitation.id,
        role: invitation.role,
        organization_id: invitation.organization_id
      }
    })

    // Generate session for immediate login
    const { data: session, error: sessionError } = await supabaseClient.auth.admin.generateLink({
      type: 'magiclink',
      email: invitation.email,
    })

    if (sessionError) {
      console.error('Session generation error:', sessionError)
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        user: {
          id: authData.user.id,
          email: authData.user.email,
          role: invitation.role
        },
        message: 'Account created successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})