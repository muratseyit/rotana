import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  name: string;
  email: string;
  company: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, company }: WelcomeEmailRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "Business Bridge <welcome@businessbridge.com>",
      to: [email],
      subject: "Welcome to Business Bridge - Your UK Market Journey Begins!",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Business Bridge</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3B82F6, #10B981); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .highlight { background: #f0f9ff; padding: 15px; border-left: 4px solid #3B82F6; margin: 20px 0; }
            ul { padding-left: 20px; }
            li { margin: 8px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🚀 Welcome to Business Bridge!</h1>
            <p>Your journey to the UK market starts here</p>
          </div>
          
          <div class="content">
            <h2>Hello ${name}!</h2>
            
            <p>Thank you for joining Business Bridge, the leading platform for Turkish businesses expanding to the UK market. We're excited to help ${company} achieve its international growth goals!</p>
            
            <div class="highlight">
              <h3>🎯 What you can expect:</h3>
              <ul>
                <li><strong>AI-Powered Analysis:</strong> Get comprehensive insights about your business potential in the UK market</li>
                <li><strong>Verified Partner Network:</strong> Connect with trusted UK business partners and service providers</li>
                <li><strong>Market Intelligence:</strong> Access the latest UK market trends and opportunities</li>
                <li><strong>Compliance Support:</strong> Navigate UK business regulations with expert guidance</li>
                <li><strong>Personalized Roadmap:</strong> Receive step-by-step action plans tailored to your business</li>
              </ul>
            </div>
            
            <p>Ready to get started? Click the button below to access your personalized dashboard:</p>
            
            <a href="https://businessbridge.com/dashboard" class="button">Access My Dashboard</a>
            
            <h3>🔥 Special Welcome Offer</h3>
            <p>As a new member, you're eligible for a <strong>FREE comprehensive business analysis</strong> (usually worth £299). This includes:</p>
            <ul>
              <li>Detailed market opportunity assessment</li>
              <li>Competitor analysis and positioning</li>
              <li>Regulatory compliance checklist</li>
              <li>Personalized partner recommendations</li>
            </ul>
            
            <a href="https://businessbridge.com/comprehensive-analysis" class="button" style="background: #10B981;">Start My Free Analysis</a>
            
            <h3>📞 Need Help?</h3>
            <p>Our team is here to support you every step of the way. Don't hesitate to reach out:</p>
            <ul>
              <li>📧 Email: support@businessbridge.com</li>
              <li>💬 Live Chat: Available 9 AM - 6 PM GMT</li>
              <li>📚 Help Center: <a href="https://businessbridge.com/help">businessbridge.com/help</a></li>
            </ul>
            
            <p>Once again, welcome to the Business Bridge community. We're thrilled to be part of your UK market expansion journey!</p>
            
            <p>Best regards,<br>
            <strong>The Business Bridge Team</strong><br>
            <em>Connecting Turkish Businesses to UK Opportunities</em></p>
          </div>
          
          <div class="footer">
            <p>© 2024 Business Bridge. All rights reserved.</p>
            <p>This email was sent to ${email}. If you no longer wish to receive these emails, you can <a href="#">unsubscribe here</a>.</p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);