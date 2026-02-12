"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface AnnouncementData {
  id?: string;
  title: string;
  content: string;
  category?: string;
  author_name?: string;
  created_at?: string;
  updated_at?: string;
}

export async function getAnnouncements() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching announcements:", error);
      return { success: false, error: error.message, data: [] };
    }

    return { success: true, data: data || [] };
  } catch (err: any) {
    console.error("Exception fetching announcements:", err);
    return { success: false, error: err.message || "Failed to fetch announcements", data: [] };
  }
}

export async function createAnnouncement(announcementData: Omit<AnnouncementData, "id" | "created_at" | "updated_at">) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    const { data, error } = await supabase
      .from("announcements")
      .insert({
        title: announcementData.title,
        content: announcementData.content,
        category: announcementData.category || "General",
        author_id: user.id,
        author_name: announcementData.author_name || user.email || "Admin",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating announcement:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/announcements");

    // 📡 Emit WebSocket event to mobile app
    try {
      await emitWebSocketEvent("announcement_created", data);
      console.log("✅ WebSocket event emitted for announcement creation");
    } catch (wsError) {
      console.warn("⚠️ WebSocket event failed (non-critical):", wsError);
      // Don't fail the request if WebSocket fails - mobile app will poll
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("Exception creating announcement:", err);
    return { success: false, error: err.message || "Failed to create announcement" };
  }
}

export async function updateAnnouncement(id: string, announcementData: Partial<AnnouncementData>) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("announcements")
      .update({
        title: announcementData.title,
        content: announcementData.content,
        category: announcementData.category,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating announcement:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/announcements");

    // 📡 Emit WebSocket event to mobile app
    try {
      await emitWebSocketEvent("announcement_updated", data);
      console.log("✅ WebSocket event emitted for announcement update");
    } catch (wsError) {
      console.warn("⚠️ WebSocket event failed (non-critical):", wsError);
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("Exception updating announcement:", err);
    return { success: false, error: err.message || "Failed to update announcement" };
  }
}

export async function deleteAnnouncement(id: string) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("announcements")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting announcement:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/announcements");

    // 📡 Emit WebSocket event to mobile app
    try {
      await emitWebSocketEvent("announcement_deleted", { id });
      console.log("✅ WebSocket event emitted for announcement deletion");
    } catch (wsError) {
      console.warn("⚠️ WebSocket event failed (non-critical):", wsError);
    }

    return { success: true };
  } catch (err: any) {
    console.error("Exception deleting announcement:", err);
    return { success: false, error: err.message || "Failed to delete announcement" };
  }
}

// 📡 Helper function to emit WebSocket events to connected mobile app clients
async function emitWebSocketEvent(eventType: string, data: any) {
  try {
    // Send to connected WebSocket clients
    // This uses Supabase Realtime to broadcast to all listening clients
    const supabase = await createClient();

    // Broadcast via Supabase Realtime
    // The mobile app listens on this channel and receives updates instantly
    const channel = supabase.channel("announcements-channel");
    await channel.send({
      type: "broadcast",
      event: eventType,
      payload: { type: eventType, data },
    });

    console.log(`📡 Broadcasted ${eventType} event to all connected clients`);
    return { success: true };
  } catch (error) {
    console.error("Error emitting WebSocket event:", error);
    // Don't throw - this is non-critical, mobile app will poll instead
    return { success: false, error };
  }
}
