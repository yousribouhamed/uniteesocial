import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const DEFAULT_PRIMARY = "#3F52FF";
const DEFAULT_INVERT = "#131953";

function normalizeHex(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  const isValid = /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test(trimmed);
  return isValid ? trimmed : fallback;
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

function normalizeString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

// Public app configuration for mobile clients.
export async function GET() {
  try {
    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from("business_profiles")
      .select("colors, web_login_image, getstarted_background_image, updated_at")
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const colors = parseColors(data?.colors);
    const primaryColor = normalizeHex(colors.primary, DEFAULT_PRIMARY);
    const invertColor = normalizeHex(colors.invert, DEFAULT_INVERT);

    const splashLogo =
      normalizeString(data?.web_login_image) ||
      normalizeString(colors.splash_screen_logo) ||
      normalizeString(colors.splashScreenLogo) ||
      normalizeString(colors.splashLogo) ||
      normalizeString(colors.splash_logo) ||
      null;

    const getStartedLogo = normalizeString(colors.get_started_logo) ||
      normalizeString(colors.getStartedLogo) ||
      normalizeString(colors.getStarted) ||
      null;

    const getStartedBackground = normalizeString(colors.get_started_background) ||
      normalizeString(colors.getStartedBackground) ||
      normalizeString(colors.getStartedBg) ||
      null;

    const getstartedBackgroundImage =
      normalizeString(data?.getstarted_background_image) || null;

    return NextResponse.json(
      {
        success: true,
        data: {
          branding: {
            primaryColor,
            invertColor,
            splashLogo,
            splash_screen_logo: splashLogo,
            splashScreenLogo: splashLogo,
            getStartedLogo,
            getStartedBackground,
          },
          getstartedBackgroundImage,
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
