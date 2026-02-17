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

async function hydrateChaptersWithTeamMembers(
    adminClient: ReturnType<typeof createAdminClient>,
    chapters: Record<string, unknown>[]
) {
    const chapterIds = chapters
        .map((chapter) =>
            typeof chapter.id === "string" ? chapter.id : String(chapter.id || "")
        )
        .filter(Boolean);

    if (chapterIds.length === 0) {
        return chapters.map((chapter) => normalizeChapterTeamMembers(chapter));
    }

    const membersResult = await adminClient
        .from("chapter_members")
        .select("chapter_id, member_ref, name, email, role, avatar_url, sort_order, created_at")
        .in("chapter_id", chapterIds)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });

    if (membersResult.error) {
        if (!isMissingTableError(membersResult.error, "chapter_members")) {
            console.error("Fetch chapter members error:", membersResult.error);
        }
        return chapters.map((chapter) => normalizeChapterTeamMembers(chapter));
    }

    const groupedMembers = new Map<string, ChapterMemberInput[]>();
    for (const row of membersResult.data || []) {
        const chapterId = String((row as Record<string, unknown>).chapter_id || "");
        if (!chapterId) continue;
        const member = normalizeIncomingTeamMembers([
            {
                id: (row as Record<string, unknown>).member_ref ?? (row as Record<string, unknown>).id,
                name: (row as Record<string, unknown>).name,
                email: (row as Record<string, unknown>).email,
                role: (row as Record<string, unknown>).role,
                avatarUrl: (row as Record<string, unknown>).avatar_url,
            },
        ])[0];
        if (!member) continue;
        const existing = groupedMembers.get(chapterId) || [];
        existing.push(member);
        groupedMembers.set(chapterId, existing);
    }

    return chapters.map((chapter) => {
        const chapterId =
            typeof chapter.id === "string" ? chapter.id : String(chapter.id || "");
        return normalizeChapterTeamMembers(chapter, groupedMembers.get(chapterId));
    });
}

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

        const normalized = await hydrateChaptersWithTeamMembers(
            adminClient,
            (chapters || []) as Record<string, unknown>[]
        );
        return NextResponse.json({ success: true, data: normalized });
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
            team_members,
            visible,
        } = body;

        if (!name || !code) {
            return NextResponse.json(
                { error: "Name and code are required" },
                { status: 400 }
            );
        }

        const normalizedTeamMembers = normalizeIncomingTeamMembers(team_members);
        const rawNotifications =
            notifications && typeof notifications === "object" ? notifications : {};
        const baseNotifications = {
            enableNotifications: false,
            autoNotifyNewEvents: true,
            autoNotifyNewUpdates: false,
            autoNotifyAnnouncements: true,
            ...(rawNotifications as Record<string, unknown>),
            team_members: normalizedTeamMembers,
        };

        const payload = {
            name,
            code,
            city: city || "",
            country: country || "",
            cover_image: cover_image || "",
            venue_name: venue_name || "",
            full_address: full_address || "",
            sort_order: sort_order ?? 999,
            notifications: baseNotifications,
            team: team ?? normalizedTeamMembers.length,
            team_members: normalizedTeamMembers,
            visible: visible ?? true,
            events: "0 Events",
            status: "Active",
            updated_by: "",
        };

        let { data: chapter, error } = await adminClient
            .from("chapters")
            .insert(payload)
            .select()
            .single();

        if (error?.message?.includes("team_members")) {
            const fallbackPayload = { ...payload } as Record<string, unknown>;
            delete fallbackPayload.team_members;
            fallbackPayload.notifications = {
                ...(baseNotifications || {}),
                team_members: normalizedTeamMembers,
            };
            const retry = await adminClient
                .from("chapters")
                .insert(fallbackPayload)
                .select()
                .single();
            chapter = retry.data;
            error = retry.error;
        }

        if (error) {
            console.error("Create chapter error details:", error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        const chapterId = String((chapter as Record<string, unknown>).id || "");
        if (chapterId) {
            const syncResult = await syncChapterMembersTable(
                adminClient,
                chapterId,
                normalizedTeamMembers
            );
            if ("error" in syncResult && syncResult.error) {
                console.error("Sync chapter members error:", syncResult.error);
            }
        }

        const [hydratedChapter] = await hydrateChaptersWithTeamMembers(
            adminClient,
            [chapter as Record<string, unknown>]
        );

        console.log("📍 New chapter created:", chapter.id);

        return NextResponse.json(
            {
                success: true,
                data: hydratedChapter,
            },
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
