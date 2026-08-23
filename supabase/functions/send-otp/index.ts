import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const ADMIN_EMAIL = "admin@gmail.com";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Check if email belongs to a valid account
    let accountType: string | null = null;

    if (normalizedEmail === ADMIN_EMAIL) {
      accountType = "admin";
    } else {
      // Check staff
      const { data: staff } = await adminClient
        .from("staff_accounts")
        .select("id")
        .ilike("email", normalizedEmail)
        .maybeSingle();

      if (staff) {
        accountType = "staff";
      } else {
        // Check customer
        const { data: customer } = await adminClient
          .from("customers")
          .select("id")
          .ilike("email", normalizedEmail)
          .maybeSingle();

        if (customer) {
          accountType = "customer";
        }
      }
    }

    if (!accountType) {
      return new Response(
        JSON.stringify({ error: "No account found with that email address" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Ensure the user exists in Supabase Auth so OTP can be sent.
    // Try to create them; if they already exist, that's fine.
    const randomPassword = crypto.randomUUID() + crypto.randomUUID();
    const { error: createError } = await adminClient.auth.admin.createUser({
      email: normalizedEmail,
      password: randomPassword,
      email_confirm: true,
    });

    // "User already registered" is expected — ignore it, proceed to send OTP
    if (createError && !createError.message.toLowerCase().includes("already")) {
      throw createError;
    }

    // Send OTP using the service role client (admin API doesn't have signInWithOtp,
    // so use the anon client which can send OTP to existing users)
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const anonClient = createClient(supabaseUrl, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { error: otpError } = await anonClient.auth.signInWithOtp({
      email: normalizedEmail,
      options: { shouldCreateUser: false },
    });

    if (otpError) throw otpError;

    return new Response(
      JSON.stringify({ success: true, accountType }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send OTP";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
