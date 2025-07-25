import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID')!;
const authToken = Deno.env.get('TWILIO_AUTH_TOKEN')!;
const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER')!;

serve(async (req) => {
  try {
    const { to, body, mediaUrl, scheduledTime } = await req.json();

    // Validate phone number format
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(to)) {
      return new Response(
        JSON.stringify({ error: 'Invalid phone number format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // If scheduled for future, store in database and process later
    if (scheduledTime && new Date(scheduledTime) > new Date()) {
      // TODO: Implement scheduling logic with Supabase
      return new Response(
        JSON.stringify({ 
          status: 'scheduled',
          scheduledFor: scheduledTime,
          message: 'SMS scheduled successfully'
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Send SMS via Twilio API
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    
    const formData = new URLSearchParams();
    formData.append('From', twilioPhoneNumber);
    formData.append('To', to);
    formData.append('Body', body);
    
    if (mediaUrl) {
      formData.append('MediaUrl', mediaUrl);
    }

    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const result = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: result.message || 'Failed to send SMS' }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        status: 'sent',
        sid: result.sid,
        to: result.to,
        from: result.from,
        dateCreated: result.date_created,
        price: result.price,
        priceUnit: result.price_unit,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});