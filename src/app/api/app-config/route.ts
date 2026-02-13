import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const DEFAULT_PRIMARY = "#3F52FF";

function normalizeHex(value: unknown): string {
  if (typeof value !== "string") return DEFAULT_PRIMARY;
  const trimmed = value.trim();
  const isValid = /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test(trimmed);
  return isValid ? trimmed : DEFAULT_PRIMARY;
}

function parseColors(raw: unknown): Record<string, unknown> {
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

// Public app configuration for mobile clients.
export async function GET() {
  try {
    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from("business_profiles")
      .select("colors, web_login_image, updated_at")
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const colors = parseColors(data?.colors);
    const primaryColor = normalizeHex(colors.primary);
    
    // Get splash logo from colors JSON or fall back to web_login_image
    const splashLogo = colors.splash_screen_logo || 
                       colors.splashScreenLogo || 
                       colors.splashLogo || 
                       data?.web_login_image || 
                       null;
    
    // Get started logo from colors JSON
    const getStartedLogo = colors.get_started_logo || 
                           colors.getStartedLogo || 
                           colors.getStarted || 
                           null;

    return NextResponse.json(
      {
        success: true,
        data: {
          branding: {
            primaryColor,
            splashLogo,
            getStartedLogo,
          },
          updatedAt: data?.updated_at ?? null,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Fetch app config error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

