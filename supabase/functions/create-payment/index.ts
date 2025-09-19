import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { analysisData, email } = await req.json();
    
    console.log("Received request:", { analysisData, email });
    
    if (!analysisData || !email) {
      console.error("Missing required fields:", { analysisData: !!analysisData, email: !!email });
      throw new Error("Analysis data and email are required");
    }

    // Get and validate Stripe key
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    console.log("Stripe key exists:", !!stripeKey);
    
    if (!stripeKey) {
      throw new Error("Stripe secret key not configured");
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    console.log("Creating Stripe checkout session...");

    // Create a one-time payment session for £8 AI analysis
    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: { 
              name: "AI Business Analysis",
              description: "Comprehensive AI-powered business analysis and partner access"
            },
            unit_amount: 800, // £8.00 in pence
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/guest-results?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/?canceled=true`,
      metadata: {
        analysis_data: JSON.stringify(analysisData),
        customer_email: email
      }
    });

    console.log("Checkout session created:", session.id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Payment creation error:", error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.toString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});