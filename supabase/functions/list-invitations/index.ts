import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    // Get query parameters
    const url = new URL(req.url)
    const status = url.searchParams.get('status')
    const organizationId = url.searchParams.get('organizationId')
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const offset = parseInt(url.searchParams.get('offset') || '0')

    // Get current user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('role, organization_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      throw new Error('User profile not found')
    }

    // Build query
    let query = supabaseClient
      .from('invitations')
      .select(`
        *,
        invited_by_profile:profiles!invitations_invited_by_fkey(
          id,
          full_name,
          email
        ),
        organization:organizations(
          id,
          name
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters based on role
    if (profile.role === 'owner' || profile.role === 'admin') {
      // Owners and admins can see all invitations in their organization
      if (organizationId) {
        query = query.eq('organization_id', organizationId)
      } else if (profile.organization_id) {
        query = query.eq('organization_id', profile.organization_id)
      }
    } else {
      // Other users can only see invitations they sent
      query = query.eq('invited_by', user.id)
    }

    // Filter by status if provided
    if (status) {
      query = query.eq('status', status)
    }

    const { data: invitations, error: queryError, count } = await query

    if (queryError) {
      throw queryError
    }

    // Calculate statistics
    const stats = {
      total: count || 0,
      pending: 0,
      accepted: 0,
      cancelled: 0,
      expired: 0
    }

    if (invitations) {
      invitations.forEach(inv => {
        stats[inv.status as keyof typeof stats]++
      })
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        invitations: invitations || [],
        pagination: {
          total: count || 0,
          limit,
          offset,
          hasMore: (count || 0) > offset + limit
        },
        stats
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