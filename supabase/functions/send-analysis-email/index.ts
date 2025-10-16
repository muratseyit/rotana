import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AnalysisEmailRequest {
  email: string;
  companyName: string;
  overallScore: number;
  topChallenge: string;
  upgradeUrl: string;
  industry?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, companyName, overallScore, topChallenge, upgradeUrl, industry }: AnalysisEmailRequest = await req.json();

    console.log(`Sending analysis email to ${email} for ${companyName}`);

    // Determine urgency level based on score
    const urgencyLevel = overallScore < 60 ? 'critical' : overallScore < 75 ? 'moderate' : 'good';
    const scoreColor = urgencyLevel === 'critical' ? '#EF4444' : urgencyLevel === 'moderate' ? '#F59E0B' : '#10B981';
    const scoreEmoji = urgencyLevel === 'critical' ? '⚠️' : urgencyLevel === 'moderate' ? '⚡' : '✅';

    const emailResponse = await resend.emails.send({
      from: "Converta Analysis <analysis@converta.uk>",
      to: [email],
      subject: `${scoreEmoji} Your UK Market Readiness: ${overallScore}% - ${companyName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your UK Market Analysis Results</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc; }
            .container { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { background: linear-gradient(135deg, #0047AB, #E30A17); color: white; padding: 40px 30px; text-align: center; }
            .header h1 { margin: 0 0 10px 0; font-size: 28px; font-weight: 700; }
            .header p { margin: 0; font-size: 16px; opacity: 0.95; }
            .content { padding: 40px 30px; }
            .score-card { background: linear-gradient(135deg, #f0f9ff, #f0fdf4); border-left: 4px solid ${scoreColor}; padding: 24px; border-radius: 8px; margin: 24px 0; }
            .score-number { font-size: 48px; font-weight: 800; color: ${scoreColor}; margin: 0; line-height: 1; }
            .score-label { color: #64748b; font-size: 14px; margin-top: 8px; }
            .challenge-box { background: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 8px; margin: 24px 0; }
            .challenge-box h3 { color: #dc2626; margin: 0 0 12px 0; font-size: 16px; }
            .challenge-box p { margin: 0; color: #7f1d1d; }
            .benefits { background: #f8fafc; padding: 24px; border-radius: 8px; margin: 24px 0; }
            .benefits h3 { margin: 0 0 16px 0; color: #0f172a; font-size: 18px; }
            .benefits ul { margin: 0; padding-left: 0; list-style: none; }
            .benefits li { padding: 12px 0; border-bottom: 1px solid #e2e8f0; display: flex; align-items: start; }
            .benefits li:last-child { border-bottom: none; }
            .benefits li::before { content: "✓"; color: #10B981; font-weight: bold; font-size: 18px; margin-right: 12px; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #0047AB, #0059D9); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; margin: 24px 0; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(0, 71, 171, 0.3); }
            .cta-button:hover { transform: translateY(-2px); }
            .urgency { background: #fff7ed; border: 2px solid #fb923c; padding: 20px; border-radius: 8px; margin: 24px 0; text-align: center; }
            .urgency p { margin: 0; color: #c2410c; font-weight: 600; }
            .footer { background: #f8fafc; padding: 30px; text-align: center; color: #64748b; font-size: 14px; }
            .footer a { color: #3b82f6; text-decoration: none; }
            .divider { height: 1px; background: #e2e8f0; margin: 32px 0; }
            .stats { display: flex; justify-content: space-around; margin: 24px 0; }
            .stat { text-align: center; }
            .stat-number { font-size: 32px; font-weight: 700; color: #0047AB; }
            .stat-label { font-size: 12px; color: #64748b; margin-top: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎯 Your UK Market Analysis is Ready!</h1>
              <p>Comprehensive insights for ${companyName}</p>
            </div>
            
            <div class="content">
              <p>Great news! We've completed the initial analysis of ${companyName}'s UK market readiness.</p>
              
              <div class="score-card">
                <div class="score-number">${overallScore}%</div>
                <div class="score-label">UK Market Readiness Score${industry ? ` - ${industry}` : ''}</div>
              </div>

              ${urgencyLevel === 'critical' ? `
                <div class="challenge-box">
                  <h3>⚠️ Critical Challenge Identified</h3>
                  <p>${topChallenge}</p>
                </div>
              ` : ''}

              <div class="stats">
                <div class="stat">
                  <div class="stat-number">87%</div>
                  <div class="stat-label">Users Upgrade</div>
                </div>
                <div class="stat">
                  <div class="stat-number">3x</div>
                  <div class="stat-label">Faster Entry</div>
                </div>
                <div class="stat">
                  <div class="stat-number">£50k</div>
                  <div class="stat-label">Avg. Cost Saved</div>
                </div>
              </div>

              <div class="divider"></div>

              <h2 style="color: #0f172a; margin-bottom: 16px;">🔓 What You're Missing</h2>
              <p style="color: #64748b; margin-bottom: 24px;">Your free analysis is just the beginning. Here's what the comprehensive analysis includes:</p>

              <div class="benefits">
                <ul>
                  <li><strong>3 Verified Partner Matches</strong> - Pre-vetted UK partners in your industry</li>
                  <li><strong>12-Month Compliance Roadmap</strong> - Exact deadlines, costs, and requirements</li>
                  <li><strong>7-Category Deep Dive</strong> - Regulatory, logistics, scalability, team, and more</li>
                  <li><strong>Companies House Verification</strong> - Official UK registration guidance</li>
                  <li><strong>Cost Breakdown Analysis</strong> - Complete financial planning for market entry</li>
                  <li><strong>Expert Review Session</strong> - 30-min consultation with UK market specialist</li>
                </ul>
              </div>

              <div class="urgency">
                <p>🔥 ${urgencyLevel === 'critical' ? 'Act Now: Your score suggests immediate action needed' : 'Limited Time: Complete your analysis within 48 hours'}</p>
              </div>

              <center>
                <a href="${upgradeUrl}" class="cta-button">
                  Get Complete Analysis Now →
                </a>
              </center>

              <p style="font-size: 14px; color: #64748b; text-align: center; margin-top: 16px;">
                💳 No payment required to start • 📊 Results in 5 minutes • ✅ 95% satisfaction
              </p>

              <div class="divider"></div>

              <h3 style="color: #0f172a; margin-bottom: 12px;">📈 Success Story</h3>
              <p style="color: #475569; font-style: italic; background: #f8fafc; padding: 16px; border-radius: 8px; margin: 0;">
                "We increased our score from 63% to 86% in 3 weeks using the comprehensive analysis roadmap. The partner matches alone saved us £30,000 in consultant fees."
                <br><br>
                <strong>- Mehmet Y., Tech Startup Founder</strong>
              </p>
            </div>
            
            <div class="footer">
              <p><strong>Converta - Connecting Turkish SMEs to UK Opportunities</strong></p>
              <p style="margin-top: 12px;">
                Need help? Reply to this email or visit our 
                <a href="https://converta.uk/support">Help Center</a>
              </p>
              <p style="margin-top: 20px; font-size: 12px;">
                This email was sent to ${email} because you completed a free analysis for ${companyName}.
                <br>
                You'll receive 2 more follow-up emails with additional insights over the next week.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Analysis email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-analysis-email function:", error);
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
