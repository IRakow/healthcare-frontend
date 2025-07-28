import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CancelInvitationRequest {
  invitationId: string
  userId: string
  reason?: string
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

    const { invitationId, userId, reason }: CancelInvitationRequest = await req.json()

    // Get the invitation
    const { data: invitation, error: inviteError } = await supabaseClient
      .from('invitations')
      .select('*')
      .eq('id', invitationId)
      .single()

    if (inviteError || !invitation) {
      throw new Error('Invitation not found')
    }

    // Check if already cancelled or accepted
    if (invitation.status !== 'pending') {
      throw new Error(`Cannot cancel invitation with status: ${invitation.status}`)
    }

    // Verify user has permission to cancel
    const { data: user, error: userError } = await supabaseClient
      .from('profiles')
      .select('role, organization_id')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      throw new Error('Unauthorized: Invalid user')
    }

    // Check permissions
    if (user.role !== 'owner' && user.role !== 'admin') {
      if (invitation.invited_by !== userId) {
        throw new Error('Unauthorized: You can only cancel your own invitations')
      }
    }

    // Cancel the invitation
    const { error: updateError } = await supabaseClient
      .from('invitations')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancelled_by: userId,
        cancellation_reason: reason
      })
      .eq('id', invitationId)

    if (updateError) {
      throw updateError
    }

    // Log the cancellation
    await supabaseClient.from('audit_logs').insert({
      action: 'invitation.cancelled',
      entity_type: 'invitation',
      entity_id: invitationId,
      user_id: userId,
      metadata: { 
        email: invitation.email,
        role: invitation.role,
        reason: reason || 'No reason provided'
      }
    })

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Invitation cancelled successfully'
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