export const emailTemplates = {
  'appointment-confirmation': {
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      padding: 20px 0;
      border-bottom: 2px solid {{primary_color}};
    }
    .sender-name {
      font-weight: bold;
      font-size: 24px;
      color: {{primary_color}};
      margin-bottom: 10px;
    }
    .content {
      padding: 30px 0;
    }
    .appointment-box {
      background-color: #f5f5f5;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      padding: 20px 0;
      border-top: 1px solid #ddd;
      margin-top: 40px;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="header">
    {{#if logo_url}}
      <img src="{{logo_url}}" alt="Logo" style="max-height: 60px; margin-bottom: 10px;">
    {{/if}}
    <p class="sender-name">{{notification_sender_name}}</p>
    {{#if tagline}}
      <p style="color: #666; font-size: 14px;">{{tagline}}</p>
    {{/if}}
  </div>
  
  <div class="content">
    <h2>Appointment Confirmed</h2>
    <p>Hi {{patient_name}},</p>
    <p>Your appointment has been successfully scheduled. Here are the details:</p>
    
    <div class="appointment-box">
      <p><strong>Date:</strong> {{appointment_date}}</p>
      <p><strong>Time:</strong> {{appointment_time}}</p>
      <p><strong>Provider:</strong> {{provider_name}}</p>
      <p><strong>Type:</strong> {{appointment_type}}</p>
      <p><strong>Reason:</strong> {{appointment_reason}}</p>
    </div>
    
    <p>Please arrive 15 minutes early to complete any necessary paperwork.</p>
    <p>If you need to reschedule or cancel, please contact us as soon as possible.</p>
  </div>
  
  <div class="footer">
    <p>This email was sent by {{notification_sender_name}}</p>
    <p>© 2024 All rights reserved</p>
  </div>
</body>
</html>
    `,
    text: `
{{notification_sender_name}}

Appointment Confirmed

Hi {{patient_name}},

Your appointment has been successfully scheduled. Here are the details:

Date: {{appointment_date}}
Time: {{appointment_time}}
Provider: {{provider_name}}
Type: {{appointment_type}}
Reason: {{appointment_reason}}

Please arrive 15 minutes early to complete any necessary paperwork.

If you need to reschedule or cancel, please contact us as soon as possible.

This email was sent by {{notification_sender_name}}
    `
  },

  'visit-summary': {
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      padding: 20px 0;
      border-bottom: 2px solid {{primary_color}};
    }
    .sender-name {
      font-weight: bold;
      font-size: 24px;
      color: {{primary_color}};
      margin-bottom: 10px;
    }
    .content {
      padding: 30px 0;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background-color: {{primary_color}};
      color: white;
      text-decoration: none;
      border-radius: 5px;
      font-weight: bold;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      padding: 20px 0;
      border-top: 1px solid #ddd;
      margin-top: 40px;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="header">
    <p class="sender-name">{{notification_sender_name}}</p>
  </div>
  
  <div class="content">
    <h2>Your Visit Summary is Ready</h2>
    <p>Hi {{patient_name}},</p>
    <p>Thank you for your visit on {{visit_date}}. Your provider has completed your visit summary, which includes:</p>
    
    <ul>
      <li>Visit notes and observations</li>
      <li>Treatment recommendations</li>
      <li>Follow-up instructions</li>
      <li>Prescribed medications (if any)</li>
    </ul>
    
    <div style="text-align: center;">
      <a href="{{portal_link}}" class="button">View Visit Summary</a>
    </div>
    
    <p>If you have any questions about your visit or the information provided, please don't hesitate to contact us.</p>
  </div>
  
  <div class="footer">
    <p>This email was sent by {{notification_sender_name}}</p>
    <p>© 2024 All rights reserved</p>
  </div>
</body>
</html>
    `,
    text: `
{{notification_sender_name}}

Your Visit Summary is Ready

Hi {{patient_name}},

Thank you for your visit on {{visit_date}}. Your provider has completed your visit summary, which includes:

- Visit notes and observations
- Treatment recommendations
- Follow-up instructions
- Prescribed medications (if any)

View your visit summary at: {{portal_link}}

If you have any questions about your visit or the information provided, please don't hesitate to contact us.

This email was sent by {{notification_sender_name}}
    `
  },

  'lab-results': {
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      padding: 20px 0;
      border-bottom: 2px solid {{primary_color}};
    }
    .sender-name {
      font-weight: bold;
      font-size: 24px;
      color: {{primary_color}};
      margin-bottom: 10px;
    }
    .content {
      padding: 30px 0;
    }
    .alert-box {
      background-color: #fff3cd;
      border: 1px solid #ffeaa7;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background-color: {{primary_color}};
      color: white;
      text-decoration: none;
      border-radius: 5px;
      font-weight: bold;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      padding: 20px 0;
      border-top: 1px solid #ddd;
      margin-top: 40px;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="header">
    <p class="sender-name">{{notification_sender_name}}</p>
  </div>
  
  <div class="content">
    <h2>New Lab Results Available</h2>
    <p>Hi {{patient_name}},</p>
    <p>Your recent lab results are now available in your patient portal.</p>
    
    <div class="alert-box">
      <p><strong>Important:</strong> Your healthcare provider has reviewed these results. If any immediate action is required, they will contact you directly.</p>
    </div>
    
    <div style="text-align: center;">
      <a href="{{portal_link}}" class="button">View Lab Results</a>
    </div>
    
    <p>When viewing your results, you'll find:</p>
    <ul>
      <li>Test values and reference ranges</li>
      <li>Provider notes and interpretations</li>
      <li>AI-powered explanations in simple terms</li>
    </ul>
    
    <p>If you have questions about your results, please contact your healthcare provider.</p>
  </div>
  
  <div class="footer">
    <p>This email was sent by {{notification_sender_name}}</p>
    <p>© 2024 All rights reserved</p>
  </div>
</body>
</html>
    `,
    text: `
{{notification_sender_name}}

New Lab Results Available

Hi {{patient_name}},

Your recent lab results are now available in your patient portal.

Important: Your healthcare provider has reviewed these results. If any immediate action is required, they will contact you directly.

View your lab results at: {{portal_link}}

When viewing your results, you'll find:
- Test values and reference ranges
- Provider notes and interpretations
- AI-powered explanations in simple terms

If you have questions about your results, please contact your healthcare provider.

This email was sent by {{notification_sender_name}}
    `
  }
};