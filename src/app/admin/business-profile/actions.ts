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
        const res = await supabase
            .from("business_profiles")
            .update(payload)
            .eq("id", existing.id);
        error = res.error;
    } else {
        const res = await supabase
            .from("business_profiles")
            .insert(payload);
        error = res.error;
    }

    if (error) {
        console.error("Error updating profile:", error);
        throw new Error(error.message);
    }

    revalidatePath("/admin/business-profile");
    return { success: true };
}
