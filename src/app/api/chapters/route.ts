import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GET /api/chapters — List all chapters
export async function GET() {
    try {
        const adminClient = createAdminClient();

        const { data: chapters, error } = await adminClient
            .from("chapters")
            .select("*")
            .order("sort_order", { ascending: true })
            .order("created_at", { ascending: false });

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            );
        }

        return NextResponse.json({ success: true, data: chapters });
    } catch (error) {
        console.error("Fetch chapters error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// POST /api/chapters — Create a new chapter
export async function POST(request: Request) {
    try {
        const adminClient = createAdminClient();
        const body = await request.json();

        const {
            name,
            code,
            city,
            country,
            cover_image,
            venue_name,
            full_address,
            sort_order,
            notifications,
            team,
            visible,
        } = body;

        if (!name || !code) {
            return NextResponse.json(
                { error: "Name and code are required" },
                { status: 400 }
            );
        }

        const { data: chapter, error } = await adminClient
            .from("chapters")
            .insert({
                name,
                code,
                city: city || "",
                country: country || "",
                cover_image: cover_image || "",
                venue_name: venue_name || "",
                full_address: full_address || "",
                sort_order: sort_order ?? 999,
                notifications: notifications || {
                    enableNotifications: false,
                    autoNotifyNewEvents: true,
                    autoNotifyNewUpdates: false,
                    autoNotifyAnnouncements: true,
                },
                team: team ?? 0,
                visible: visible ?? true,
                events: "0 Events",
                status: "Active",
                updated_by: "",
            })
            .select()
            .single();

        if (error) {
            console.error("Create chapter error details:", error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        console.log("📍 New chapter created:", chapter.id);

        return NextResponse.json(
            { success: true, data: chapter },
            { status: 201 }
        );
    } catch (error) {
        console.error("Create chapter error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
