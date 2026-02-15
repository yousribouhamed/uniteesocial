import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

// GET /api/chapters/:id — Get a single chapter
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const adminClient = createAdminClient();

        const { data: chapter, error } = await adminClient
            .from("chapters")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        if (!chapter) {
            return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: chapter });
    } catch (error) {
        console.error("Fetch chapter error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// PUT /api/chapters/:id — Update a chapter
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
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
            status,
            events,
        } = body;

        // Build update payload — only include fields that were provided
        const updatePayload: Record<string, unknown> = {
            updated_at: new Date().toISOString(),
        };

        if (name !== undefined) updatePayload.name = name;
        if (code !== undefined) updatePayload.code = code;
        if (city !== undefined) updatePayload.city = city;
        if (country !== undefined) updatePayload.country = country;
        if (cover_image !== undefined) updatePayload.cover_image = cover_image;
        if (venue_name !== undefined) updatePayload.venue_name = venue_name;
        if (full_address !== undefined) updatePayload.full_address = full_address;
        if (sort_order !== undefined) updatePayload.sort_order = sort_order;
        if (notifications !== undefined) updatePayload.notifications = notifications;
        if (team !== undefined) updatePayload.team = team;
        if (visible !== undefined) updatePayload.visible = visible;
        if (status !== undefined) updatePayload.status = status;
        if (events !== undefined) updatePayload.events = events;

        const { data: updated, error } = await adminClient
            .from("chapters")
            .update(updatePayload)
            .eq("id", id)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        console.log("📍 Chapter updated:", id);

        return NextResponse.json({ success: true, data: updated });
    } catch (error) {
        console.error("Update chapter error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// DELETE /api/chapters/:id — Delete a chapter
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const adminClient = createAdminClient();

        const { error } = await adminClient
            .from("chapters")
            .delete()
            .eq("id", id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        console.log("🗑️ Chapter deleted:", id);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete chapter error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
