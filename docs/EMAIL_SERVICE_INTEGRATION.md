# Email Service Integration Guide

This guide documents how to integrate email services with the Insperity Health platform's invitation system.

## Overview

The invitation system uses email to send secure invitation links to new users. The backend Edge Functions are already configured to support email integration - you just need to connect your preferred email service.

## Supported Email Services

### 1. SendGrid

```typescript
// supabase/functions/_shared/sendgrid.ts
import { SendGridMail } from 'https://deno.land/x/sendgrid@0.0.3/mod.ts'

const sg = new SendGridMail(Deno.env.get('SENDGRID_API_KEY'))

export async function sendEmail({ to, subject, template, data }) {
  const msg = {
    to,
    from: 'noreply@insperityhealth.com',
    subject,
    templateId: getTemplateId(template),
    dynamicTemplateData: data
  }
  
  await sg.send(msg)
}
```

### 2. Resend

```typescript
// supabase/functions/_shared/resend.ts
import { Resend } from 'https://esm.sh/resend@1.0.0'

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

export async function sendEmail({ to, subject, template, data }) {
  await resend.emails.send({
    from: 'Insperity Health <noreply@insperityhealth.com>',
    to,
    subject,
    react: getEmailTemplate(template, data)
  })
}
```

### 3. AWS SES

```typescript
// supabase/functions/_shared/ses.ts
import { SESClient, SendTemplatedEmailCommand } from 'https://esm.sh/@aws-sdk/client-ses@3'

const client = new SESClient({
  region: 'us-east-1',
  credentials: {
    accessKeyId: Deno.env.get('AWS_ACCESS_KEY_ID'),
    secretAccessKey: Deno.env.get('AWS_SECRET_ACCESS_KEY')
  }
})

export async function sendEmail({ to, subject, template, data }) {
  const command = new SendTemplatedEmailCommand({
    Source: 'noreply@insperityhealth.com',
    Destination: { ToAddresses: [to] },
    Template: template,
    TemplateData: JSON.stringify(data)
  })
  
  await client.send(command)
}
```

## Email Templates

### Invitation Email Template

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; }
    .content { padding: 40px; background: #f7fafc; }
    .button { display: inline-block; padding: 16px 32px; background: #667eea; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; }
    .footer { padding: 20px; text-align: center; color: #718096; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to Insperity Health</h1>
    </div>
    <div class="content">
      <h2>You're Invited!</h2>
      <p>Hi there,</p>
      <p>{{senderName}} has invited you to join {{organizationName}} as a {{role}}.</p>
      <p>Click the button below to create your account:</p>
      <center>
        <a href="{{inviteUrl}}" class="button">Accept Invitation</a>
      </center>
      <p>This invitation will expire in 7 days.</p>
      <p>If you have any questions, please contact your organization administrator.</p>
    </div>
    <div class="footer">
      <p>© 2024 Insperity Health. All rights reserved.</p>
      <p>This is an automated message. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
```

### Invitation Reminder Template

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    /* Same styles as above */
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Reminder: Your Insperity Health Invitation</h1>
    </div>
    <div class="content">
      <h2>Don't Forget to Accept Your Invitation</h2>
      <p>Hi there,</p>
      <p>This is a friendly reminder that you have a pending invitation to join {{organizationName}} as a {{role}}.</p>
      <p>Your invitation will expire soon. Click below to create your account:</p>
      <center>
        <a href="{{inviteUrl}}" class="button">Accept Invitation</a>
      </center>
      <p>If you're having trouble, please contact your organization administrator.</p>
    </div>
    <div class="footer">
      <p>© 2024 Insperity Health. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
```

## Integration Steps

### 1. Set Environment Variables

Add your email service credentials to Supabase:

```bash
# For SendGrid
supabase secrets set SENDGRID_API_KEY=your-api-key

# For Resend
supabase secrets set RESEND_API_KEY=your-api-key

# For AWS SES
supabase secrets set AWS_ACCESS_KEY_ID=your-access-key
supabase secrets set AWS_SECRET_ACCESS_KEY=your-secret-key
```

### 2. Update Edge Functions

Modify the invitation Edge Functions to use your email service:

```typescript
// In send-invitation/index.ts
import { sendEmail } from '../_shared/email.ts'

// After creating the invitation...
await sendEmail({
  to: email,
  subject: 'You\'re invited to Insperity Health',
  template: 'invitation',
  data: {
    inviteUrl,
    role,
    senderName: sender.full_name,
    organizationName: organization?.name || 'Insperity Health'
  }
})
```

### 3. Configure Domain Authentication

For better deliverability, configure domain authentication:

1. **SPF Record**: Add your email service to your SPF record
2. **DKIM**: Configure DKIM signing with your email provider
3. **DMARC**: Set up a DMARC policy

Example DNS records:
```
TXT @ "v=spf1 include:sendgrid.net ~all"
TXT em._domainkey "k=rsa; p=MIGfMA0GCSq..."
TXT _dmarc "v=DMARC1; p=quarantine; rua=mailto:dmarc@insperityhealth.com"
```

## Testing

### 1. Test in Development

Use Supabase's local development environment:

```bash
supabase functions serve send-invitation --env-file .env.local
```

### 2. Test Email Delivery

Create a test script:

```typescript
// test-email.ts
const response = await fetch('http://localhost:54321/functions/v1/send-invitation', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_ANON_KEY'
  },
  body: JSON.stringify({
    email: 'test@example.com',
    role: 'patient',
    senderId: 'your-user-id'
  })
})

console.log(await response.json())
```

## Email Best Practices

1. **Rate Limiting**: Implement rate limiting to prevent abuse
2. **Unsubscribe Links**: Include unsubscribe options where appropriate
3. **Plain Text Alternative**: Always include a plain text version
4. **Mobile Responsive**: Ensure emails render well on mobile devices
5. **Accessible Design**: Use semantic HTML and proper contrast ratios

## Monitoring

Track email metrics:

1. **Delivery Rate**: Monitor successful deliveries
2. **Open Rate**: Track email opens
3. **Click Rate**: Monitor invitation acceptances
4. **Bounce Rate**: Handle bounced emails appropriately
5. **Spam Reports**: Monitor and address spam complaints

## Troubleshooting

### Common Issues

1. **Emails Going to Spam**
   - Verify domain authentication
   - Check email content for spam triggers
   - Warm up IP address gradually

2. **Rate Limit Errors**
   - Implement exponential backoff
   - Queue emails for batch sending
   - Use webhook for async processing

3. **Template Rendering Issues**
   - Validate template variables
   - Test with different email clients
   - Use inline CSS for better compatibility

## Security Considerations

1. **Token Security**: Use cryptographically secure tokens
2. **Expiration**: Set appropriate expiration times
3. **Rate Limiting**: Prevent invitation spam
4. **Audit Logging**: Log all invitation activities
5. **Input Validation**: Validate email addresses

## Next Steps

1. Choose your preferred email service
2. Set up environment variables
3. Configure domain authentication
4. Update Edge Functions with email integration
5. Test in development environment
6. Deploy to production
7. Monitor email metrics