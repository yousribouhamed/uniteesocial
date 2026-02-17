import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

interface ChapterMemberInput {
    id: string;
    name: string;
    email: string;
    role: string;
    avatarUrl: string;
}

function isMissingTableError(error: unknown, table: string): boolean {
    const message =
        typeof error === "object" &&
            error !== null &&
            "message" in error &&
            typeof (error as { message?: unknown }).message === "string"
            ? (error as { message: string }).message.toLowerCase()
            : "";

    return (
        message.includes(table.toLowerCase()) &&
        (message.includes("schema cache") ||
            message.includes("does not exist") ||
            message.includes("relation") ||
            message.includes("table"))
    );
}

function normalizeIncomingTeamMembers(rawMembers: unknown): ChapterMemberInput[] {
    if (!Array.isArray(rawMembers)) return [];

    const seenEmails = new Set<string>();
    const seenMemberRefs = new Set<string>();

    const normalized = rawMembers
        .map((member, index) => {
            const source = (member || {}) as Record<string, unknown>;
            const name = typeof source.name === "string" ? source.name.trim() : "";
            const email = typeof source.email === "string" ? source.email.trim() : "";
            if (!name || !email) return null;

            const emailKey = email.toLowerCase();
            if (seenEmails.has(emailKey)) return null;
            seenEmails.add(emailKey);

            const role =
                typeof source.role === "string" && source.role.trim()
                    ? source.role.trim()
                    : "Member";
            let id =
                typeof source.id === "string" && source.id.trim()
                    ? source.id.trim()
                    : `member-${index + 1}-${emailKey}`;
            while (seenMemberRefs.has(id)) {
                id = `${id}-${index + 1}`;
            }
            seenMemberRefs.add(id);
            const avatarUrl =
                typeof source.avatarUrl === "string"
                    ? source.avatarUrl
                    : typeof source.avatar_url === "string"
                        ? source.avatar_url
                        : "";

            return { id, name, email, role, avatarUrl };
        })
        .filter((member): member is ChapterMemberInput => Boolean(member));

    return normalized;
}

function getFallbackTeamMembers(chapter: Record<string, unknown>): ChapterMemberInput[] {
    const rawMembers = Array.isArray(chapter.team_members)
        ? chapter.team_members
        : Array.isArray((chapter.notifications as Record<string, unknown> | undefined)?.team_members)
            ? (chapter.notifications as Record<string, unknown>).team_members
            : [];
    return normalizeIncomingTeamMembers(rawMembers);
}

function normalizeChapterTeamMembers<T extends Record<string, unknown>>(
    chapter: T,
    explicitMembers?: ChapterMemberInput[]
): T {
    const teamMembers = explicitMembers ?? getFallbackTeamMembers(chapter);
    const persistedTeamCount = typeof chapter.team === "number" ? chapter.team : 0;
    const teamCount = teamMembers.length > 0 ? teamMembers.length : persistedTeamCount;
    return {
        ...chapter,
        team: teamCount,
        team_members: teamMembers,
    };
}

function toChapterMemberRows(chapterId: string, members: ChapterMemberInput[]) {
    return members.map((member, index) => ({
        chapter_id: chapterId,
        member_ref: member.id,
        name: member.name,
        email: member.email,
        role: member.role,
        avatar_url: member.avatarUrl || "",
        sort_order: index,
    }));
}

function normalizeName(value: unknown) {
    if (typeof value !== "string") return "";
    let normalized = value.trim().toLowerCase().replace(/\s+/g, " ");
    while (normalized.endsWith(" chapter")) {
        normalized = normalized.slice(0, -8).trim();
    }
    return normalized;
}

async function resolveChapterEventCount(
    adminClient: ReturnType<typeof createAdminClient>,
    chapter: Record<string, unknown>
) {
    const chapterId = typeof chapter.id === "string" ? chapter.id : String(chapter.id || "");
    const chapterName = normalizeName(chapter.name);

    let eventsData: Record<string, unknown>[] = [];
    const withChapterId = await adminClient
        .from("events")
        .select("id, chapter, chapter_id");

    if (withChapterId.error) {
        const fallback = await adminClient
            .from("events")
            .select("id, chapter");
        if (fallback.error) {
            console.error("Fetch events for chapter count error:", fallback.error);
            return null;
        }
        eventsData = (fallback.data || []) as Record<string, unknown>[];
    } else {
        eventsData = (withChapterId.data || []) as Record<string, unknown>[];
    }

    return eventsData.reduce((sum, event) => {
        const eventChapterId =
            typeof event.chapter_id === "string" ? event.chapter_id : String(event.chapter_id || "");
        const eventChapterName = normalizeName(event.chapter);
        if ((chapterId && eventChapterId === chapterId) || (chapterName && eventChapterName === chapterName)) {
            return sum + 1;
        }
        return sum;
    }, 0);
}

async function fetchChapterMembersFromTable(
    adminClient: ReturnType<typeof createAdminClient>,
    chapterId: string
) {
    const result = await adminClient
        .from("chapter_members")
        .select("member_ref, name, email, role, avatar_url, sort_order, created_at")
        .eq("chapter_id", chapterId)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });

    if (result.error) {
        if (isMissingTableError(result.error, "chapter_members")) {
            return { tableMissing: true, members: [] as ChapterMemberInput[] };
        }
        return { tableMissing: false, error: result.error, members: [] as ChapterMemberInput[] };
    }

    const members = normalizeIncomingTeamMembers(
        (result.data || []).map((row) => {
            const source = row as Record<string, unknown>;
            return {
                id: source.member_ref ?? source.id,
                name: source.name,
                email: source.email,
                role: source.role,
                avatarUrl: source.avatar_url,
            };
        })
    );
    return { tableMissing: false, members };
}

async function syncChapterMembersTable(
    adminClient: ReturnType<typeof createAdminClient>,
    chapterId: string,
    members: ChapterMemberInput[]
) {
    const clearResult = await adminClient
        .from("chapter_members")
        .delete()
        .eq("chapter_id", chapterId);

    if (clearResult.error) {
        if (isMissingTableError(clearResult.error, "chapter_members")) {
            return { tableMissing: true };
        }
        return { error: clearResult.error };
    }

    if (members.length === 0) return { tableMissing: false };

    const insertResult = await adminClient
        .from("chapter_members")
        .insert(toChapterMemberRows(chapterId, members));

    if (insertResult.error) {
        if (isMissingTableError(insertResult.error, "chapter_members")) {
            return { tableMissing: true };
        }
        return { error: insertResult.error };
    }

    return { tableMissing: false };
}

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

        const memberResult = await fetchChapterMembersFromTable(adminClient, id);
        if ("error" in memberResult && memberResult.error) {
            console.error("Fetch chapter members error:", memberResult.error);
        }
        const membersForResponse =
            memberResult.tableMissing || ("error" in memberResult && memberResult.error)
                ? undefined
                : memberResult.members;

        const eventCount = await resolveChapterEventCount(
            adminClient,
            chapter as Record<string, unknown>
        );
        const chapterWithEventCount =
            eventCount === null
                ? chapter
                : {
                    ...chapter,
                    events: `${eventCount} Events`,
                };

        return NextResponse.json({
            success: true,
            data: normalizeChapterTeamMembers(
                chapterWithEventCount as Record<string, unknown>,
                membersForResponse
            ),
        });
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
            team_members,
            visible,
            status,
            events,
        } = body;
        const normalizedTeamMembers = normalizeIncomingTeamMembers(team_members);
        let notificationsForUpdate =
            notifications && typeof notifications === "object"
                ? { ...(notifications as Record<string, unknown>) }
                : undefined;
        if (team_members !== undefined) {
            if (!notificationsForUpdate) {
                const existingNotificationsResult = await adminClient
                    .from("chapters")
                    .select("notifications")
                    .eq("id", id)
                    .maybeSingle();
                if (!existingNotificationsResult.error && existingNotificationsResult.data?.notifications) {
                    notificationsForUpdate = {
                        ...(existingNotificationsResult.data.notifications as Record<string, unknown>),
                    };
                } else {
                    notificationsForUpdate = {};
                }
            }
            notificationsForUpdate.team_members = normalizedTeamMembers;
        }

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
        if (notificationsForUpdate !== undefined) updatePayload.notifications = notificationsForUpdate;
        else if (notifications !== undefined) updatePayload.notifications = notifications;
        if (team !== undefined) updatePayload.team = team;
        if (team_members !== undefined) updatePayload.team_members = normalizedTeamMembers;
        if (team_members !== undefined && team === undefined) {
            updatePayload.team = normalizedTeamMembers.length;
        }
        if (visible !== undefined) updatePayload.visible = visible;
        if (status !== undefined) updatePayload.status = status;
        if (events !== undefined) updatePayload.events = events;

        let { data: updated, error } = await adminClient
            .from("chapters")
            .update(updatePayload)
            .eq("id", id)
            .select()
            .single();

        if (error?.message?.includes("team_members")) {
            const fallbackUpdatePayload = { ...updatePayload };
            delete fallbackUpdatePayload.team_members;
            if (team_members !== undefined) {
                let currentNotifications =
                    (fallbackUpdatePayload.notifications as Record<string, unknown> | undefined) || {};
                if (!fallbackUpdatePayload.notifications) {
                    const existingChapter = await adminClient
                        .from("chapters")
                        .select("notifications")
                        .eq("id", id)
                        .maybeSingle();
                    if (!existingChapter.error && existingChapter.data?.notifications) {
                        currentNotifications = existingChapter.data.notifications as Record<string, unknown>;
                    }
                }
                fallbackUpdatePayload.notifications = {
                    ...currentNotifications,
                    team_members: normalizedTeamMembers,
                };
            }
            const retry = await adminClient
                .from("chapters")
                .update(fallbackUpdatePayload)
                .eq("id", id)
                .select()
                .single();
            updated = retry.data;
            error = retry.error;
        }

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        if (team_members !== undefined) {
            const syncResult = await syncChapterMembersTable(
                adminClient,
                id,
                normalizedTeamMembers
            );
            if ("error" in syncResult && syncResult.error) {
                console.error("Sync chapter members error:", syncResult.error);
            }
        }

        const memberResult = await fetchChapterMembersFromTable(adminClient, id);
        if ("error" in memberResult && memberResult.error) {
            console.error("Fetch chapter members error:", memberResult.error);
        }
        const membersForResponse =
            memberResult.tableMissing || ("error" in memberResult && memberResult.error)
                ? undefined
                : memberResult.members;

        console.log("📍 Chapter updated:", id);

        return NextResponse.json({
            success: true,
            data: normalizeChapterTeamMembers(
                updated as Record<string, unknown>,
                membersForResponse
            ),
        });
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
