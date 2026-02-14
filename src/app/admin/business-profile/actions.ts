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
    const buffer = Buffer.from(arrayBuffer);

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
    const filePath = `chapters/covers/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
        .from("uploads")
        .upload(filePath, buffer, {
            contentType: file.type,
            upsert: false
        });

    if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error("Failed to upload cover image");
    }

    const { data: publicUrlData } = supabase.storage
        .from("uploads")
        .getPublicUrl(filePath);

    return { url: publicUrlData.publicUrl, path: filePath };
}
