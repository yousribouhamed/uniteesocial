import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveBusinessProfileByDomain } from "@/lib/business-profile-resolver";

function parseModules(raw: unknown): Record<string, unknown> {
  if (!raw) return {};
  if (typeof raw === "object" && !Array.isArray(raw)) return raw as Record<string, unknown>;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      return {};
    }
  }
  return {};
}

function normalizeBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;
  }
  return fallback;
}

// POST /api/app/auth/magic-link — Send a magic link to authenticate a mobile app user
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email.trim() : "";
    const redirectTo = typeof body?.redirectTo === "string" ? body.redirectTo.trim() : "";
    const tenantDomain = typeof body?.tenantDomain === "string" ? body.tenantDomain.trim() : "";

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const { data: profiles, error: profileError } = await adminClient
      .from("business_profiles")
      .select("domain, modules, updated_at")
      .order("updated_at", { ascending: false });

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    const profile = resolveBusinessProfileByDomain(
      profiles || [],
      request.headers,
      tenantDomain ? [tenantDomain] : []
    );
    const modules = parseModules(profile?.modules);
    const magicLinkLoginEnabled = normalizeBoolean(modules.magicLinkLogin, false);

    if (!magicLinkLoginEnabled) {
      return NextResponse.json(
        {
          error: "Magic link login is disabled for this tenant",
          code: "MAGIC_LINK_DISABLED",
        },
        { status: 403 }
      );
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        ...(redirectTo ? { emailRedirectTo: redirectTo } : {}),
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: {
        email,
        message: "Magic link sent successfully",
      },
    });
  } catch (error) {
    console.error("App magic-link auth error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
