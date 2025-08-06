import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ResendInvitationRequest {
  invitationId: string
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

    const { invitationId, senderId }: ResendInvitationRequest = await req.json()

    // Get the original invitation
    const { data: invitation, error: inviteError } = await supabaseClient
      .from('invitations')
      .select('*')
      .eq('id', invitationId)
      .single()

    if (inviteError || !invitation) {
      throw new Error('Invitation not found')
    }

    // Verify sender has permission to resend
    const { data: sender, error: senderError } = await supabaseClient
      .from('profiles')
      .select('role, organization_id')
      .eq('id', senderId)
      .single()

    if (senderError || !sender) {
      throw new Error('Unauthorized: Invalid sender')
    }

    // Check permissions
    if (sender.role !== 'owner' && sender.role !== 'admin') {
      if (invitation.invited_by !== senderId) {
        throw new Error('Unauthorized: You can only resend your own invitations')
      }
    }

    // Generate new token and expiry
    const newToken = crypto.randomUUID()
    const newExpiresAt = new Date()
    newExpiresAt.setDate(newExpiresAt.getDate() + 7) // 7 days expiry

    // Update invitation
    const { error: updateError } = await supabaseClient
      .from('invitations')
      .update({
        token: newToken,
        expires_at: newExpiresAt.toISOString(),
        status: 'pending',
        resent_at: new Date().toISOString(),
        resent_count: (invitation.resent_count || 0) + 1
      })
      .eq('id', invitationId)

    if (updateError) {
      throw updateError
    }

    // Generate new invite URL
    const inviteUrl = `${req.headers.get('origin')}/accept-invite?token=${newToken}`

    // In production, resend the email
    // await sendEmail({
    //   to: invitation.email,
    //   subject: 'Reminder: You\'re invited to Purity Health',
    //   template: 'invitation-reminder',
    //   data: { inviteUrl, role: invitation.role }
    // })

    // Log the resend
    await supabaseClient.from('audit_logs').insert({
      action: 'invitation.resent',
      entity_type: 'invitation',
      entity_id: invitationId,
      user_id: senderId,
      metadata: { 
        email: invitation.email,
        resent_count: (invitation.resent_count || 0) + 1
      }
    })

    return new Response(
      JSON.stringify({ 
        success: true,
        invitation: {
          id: invitationId,
          inviteUrl,
          expiresAt: newExpiresAt.toISOString()
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