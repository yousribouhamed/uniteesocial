"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getBusinessProfile() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("business_profiles")
        .select("*")
        .maybeSingle();

    if (error) {
        console.error("Error fetching profile:", error);
        return null;
    }
    return data;
}

export async function updateBusinessProfile(payload: any) {
    const supabase = await createClient();

    // Check if profile exists
    const { data: existing } = await supabase
        .from("business_profiles")
        .select("id")
        .maybeSingle();

    let error;
    if (existing) {
        console.log("Updating existing profile with payload:", JSON.stringify(payload, null, 2));
        const res = await supabase
            .from("business_profiles")
            .update(payload)
            .eq("id", existing.id);
        error = res.error;
    } else {
        console.log("Inserting new profile with payload:", JSON.stringify(payload, null, 2));
        const res = await supabase
            .from("business_profiles")
            .insert(payload);
        error = res.error;
    }

    if (error) {
        console.error("Error updating profile detailed:", JSON.stringify(error, null, 2));
        return { success: false, error: `Supabase Error: ${error.message} (Code: ${error.code})` };
    }

    revalidatePath("/admin/business-profile");
    return { success: true };
}

export async function uploadBrandAsset(formData: FormData) {
    const file = formData.get("file") as File;
    if (!file) {
        throw new Error("No file provided");
    }

    // Verify file type
    if (!file.type.startsWith("image/")) {
        throw new Error("Invalid file type. Only images are allowed.");
    }

    // Verify file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
        throw new Error("File too large. Max size is 10MB.");
    }

    const { createAdminClient } = await import("@/lib/supabase/admin");
    const supabase = createAdminClient();

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `branding/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = globalThis.Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
        .from("brand-assets")
        .upload(filePath, buffer, {
            contentType: file.type,
            upsert: false
        });

    if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error("Failed to upload image");
    }

    const { data: publicUrlData } = supabase.storage
        .from("brand-assets")
        .getPublicUrl(filePath);

    return { url: publicUrlData.publicUrl };
}

export async function uploadChapterCover(formData: FormData) {
    const file = formData.get("file") as File;
    if (!file) {
        throw new Error("No file provided");
    }

    // Verify file type
    if (!file.type.startsWith("image/")) {
        throw new Error("Invalid file type. Only images are allowed.");
    }

    // Verify file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
        throw new Error("File too large. Max size is 10MB.");
    }

    const { createAdminClient } = await import("@/lib/supabase/admin");
    const supabase = createAdminClient();

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `chapter-covers/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = globalThis.Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
        .from("brand-assets")
        .upload(filePath, buffer, {
            contentType: file.type,
            upsert: false
        });

    if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error("Failed to upload image");
    }

    const { data: publicUrlData } = supabase.storage
        .from("brand-assets")
        .getPublicUrl(filePath);

    return { url: publicUrlData.publicUrl };
}

export async function getChapters() {
    const supabase = await createClient();

    // Fetch chapters along with event counts
    const { data: chapters, error } = await supabase
        .from("chapters")
        .select(`
            *,
            events:events(count)
        `)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching chapters:", error);
        return [];
    }

    // Transform to match the UI expectations
    return chapters.map((ch: any) => ({
        id: ch.id,
        name: ch.chapter_name || ch.name,
        code: ch.chapter_code || ch.id.substring(0, 8),
        city: ch.city,
        country: ch.country,
        team: ch.team_member_count || 0,
        events: `${ch.events?.[0]?.count || 0} Events`,
        visible: ch.visible !== false,
        status: "Active",
        lastUpdate: ch.updated_at ? new Date(ch.updated_at).toLocaleDateString() : new Date(ch.created_at).toLocaleDateString(),
        updatedBy: "",
        coverImage: ch.cover_image
    }));
}

export async function updateChapterVisibility(id: string, visible: boolean) {
    const supabase = await createClient();
    const { error } = await supabase
        .from("chapters")
        .update({ visible })
        .eq("id", id);

    if (error) {
        console.error("Error updating chapter visibility:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/admin/business-profile");
    return { success: true };
}

export async function deleteChapter(id: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from("chapters")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Error deleting chapter:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/admin/business-profile");
    return { success: true };
}
