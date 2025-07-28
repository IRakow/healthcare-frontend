import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InvitationRequest {
  email: string
  role: string
  organizationId?: string
  senderId: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { email, role, organizationId, senderId }: InvitationRequest = await req.json()

    // Verify sender has permission to invite
    const { data: sender, error: senderError } = await supabaseClient
      .from('profiles')
      .select('role, organization_id')
      .eq('id', senderId)
      .single()

    if (senderError || !sender) {
      throw new Error('Unauthorized: Invalid sender')
    }

    // Check sender permissions
    if (sender.role === 'owner' || sender.role === 'admin') {
      // Owners and admins can invite anyone
    } else if (sender.role === 'employer' && role === 'patient') {
      // Employers can only invite patients
    } else {
      throw new Error('Unauthorized: Insufficient permissions')
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      throw new Error('User already exists with this email')
    }

    // Create invitation
    const inviteToken = crypto.randomUUID()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiry

    const { data: invitation, error: inviteError } = await supabaseClient
      .from('invitations')
      .insert({
        email,
        role,
        organization_id: organizationId || sender.organization_id,
        invited_by: senderId,
        token: inviteToken,
        expires_at: expiresAt.toISOString(),
        status: 'pending'
      })
      .select()
      .single()

    if (inviteError) {
      throw inviteError
    }

    // Send email using your preferred email service
    // For now, we'll return the invitation URL
    const inviteUrl = `${req.headers.get('origin')}/accept-invite?token=${inviteToken}`

    // In production, you would send this via email service like:
    // await sendEmail({
    //   to: email,
    //   subject: 'You\'re invited to Insperity Health',
    //   template: 'invitation',
    //   data: { inviteUrl, role, senderName: sender.name }
    // })

    // Log the invitation
    await supabaseClient.from('audit_logs').insert({
      action: 'invitation.sent',
      entity_type: 'invitation',
      entity_id: invitation.id,
      user_id: senderId,
      metadata: { email, role, organization_id: organizationId }
    })

    return new Response(
      JSON.stringify({ 
        success: true, 
        invitation: {
          id: invitation.id,
          inviteUrl,
          expiresAt: invitation.expires_at
        }
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