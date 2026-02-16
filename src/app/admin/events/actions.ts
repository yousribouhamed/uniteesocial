"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const EVENT_IMAGES_BUCKET = "event-images";
let hasMatchDetailsColumnCache: boolean | null = null;

function isMissingColumnError(error: unknown, columnName: string) {
  if (!error) return false;
  const parsedError = error as {
    message?: string;
    details?: string;
    hint?: string;
    code?: string;
  };
  const haystack = [parsedError.message, parsedError.details, parsedError.hint, parsedError.code]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(columnName.toLowerCase()) || parsedError.code === "PGRST204";
}

async function hasEventsColumnMatchDetails(supabase: Awaited<ReturnType<typeof createClient>>) {
  if (hasMatchDetailsColumnCache !== null) return hasMatchDetailsColumnCache;

  const { error } = await supabase
    .from("events")
    .select("match_details")
    .limit(1);

  hasMatchDetailsColumnCache = !isMissingColumnError(error, "match_details");
  return hasMatchDetailsColumnCache;
}

export interface EventData {
  id?: string;
  title: string;
  cover_image: string | null;
  chapter: string;
  type: "Onsite" | "Online" | "Hybrid";
  event_category: "general" | "match";
  event_date: string | null;
  location: string;
  signups: number;
  max_signups: number;
  description?: string;
  match_details?: any | null;
  created_at?: string;
  updated_at?: string;
}

export async function getEvents() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching events:", error);
      return { success: false, error: error.message, data: [] };
    }

    return { success: true, data: data || [] };
  } catch (err: any) {
    console.error("Exception fetching events:", err);
    return { success: false, error: err.message || "Failed to fetch events", data: [] };
  }
}

export async function createEvent(eventData: Omit<EventData, "id" | "created_at" | "updated_at">) {
  try {
    const supabase = await createClient();
    const canWriteMatchDetails = await hasEventsColumnMatchDetails(supabase);

    const basePayload = {
      title: eventData.title,
      cover_image: eventData.cover_image,
      chapter: eventData.chapter,
      type: eventData.type,
      event_category: eventData.event_category,
      event_date: eventData.event_date,
      location: eventData.location,
      signups: eventData.signups || 0,
      max_signups: eventData.max_signups || 0,
      description: eventData.description || null,
    };

    const payload = canWriteMatchDetails
      ? { ...basePayload, match_details: eventData.match_details || null }
      : basePayload;

    let data;
    let error;

    ({ data, error } = await supabase
      .from("events")
      .insert(payload)
      .select()
      .single());

    // Fallback if the database doesn't have match_details yet
    if (canWriteMatchDetails && isMissingColumnError(error, "match_details")) {
      console.warn("match_details column missing; retrying without it.");
      hasMatchDetailsColumnCache = false;
      ({ data, error } = await supabase
        .from("events")
        .insert(basePayload)
        .select()
        .single());
    }

    if (error) {
      console.error("Error creating event:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/events");

    // 📡 Emit WebSocket event to mobile app
    try {
      await emitWebSocketEvent("event_created", data);
      console.log("✅ WebSocket event emitted for event creation");
    } catch (wsError) {
      console.warn("⚠️ WebSocket event failed (non-critical):", wsError);
      // Don't fail the request if WebSocket fails - mobile app will poll
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("Exception creating event:", err);
    return { success: false, error: err.message || "Failed to create event" };
  }
}

export async function updateEvent(id: string, eventData: Partial<EventData>) {
  try {
    const supabase = await createClient();
    const canWriteMatchDetails = await hasEventsColumnMatchDetails(supabase);

    const basePayload = {
      title: eventData.title,
      cover_image: eventData.cover_image,
      chapter: eventData.chapter,
      type: eventData.type,
      event_category: eventData.event_category,
      event_date: eventData.event_date,
      location: eventData.location,
      signups: eventData.signups,
      max_signups: eventData.max_signups,
      description: eventData.description,
      updated_at: new Date().toISOString(),
    };

    const payload = canWriteMatchDetails
      ? { ...basePayload, match_details: eventData.match_details }
      : basePayload;

    let data;
    let error;

    ({ data, error } = await supabase
      .from("events")
      .update(payload)
      .eq("id", id)
      .select()
      .single());

    if (canWriteMatchDetails && isMissingColumnError(error, "match_details")) {
      console.warn("match_details column missing; retrying without it.");
      hasMatchDetailsColumnCache = false;
      ({ data, error } = await supabase
        .from("events")
        .update(basePayload)
        .eq("id", id)
        .select()
        .single());
    }

    if (error) {
      console.error("Error updating event:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/events");

    // 📡 Emit WebSocket event to mobile app
    try {
      await emitWebSocketEvent("event_updated", data);
      console.log("✅ WebSocket event emitted for event update");
    } catch (wsError) {
      console.warn("⚠️ WebSocket event failed (non-critical):", wsError);
      // Don't fail the request if WebSocket fails - mobile app will poll
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("Exception updating event:", err);
    return { success: false, error: err.message || "Failed to update event" };
  }
}

export async function deleteEvent(id: string) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting event:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/events");
    return { success: true };
  } catch (err: any) {
    console.error("Exception deleting event:", err);
    return { success: false, error: err.message || "Failed to delete event" };
  }
}

export async function uploadEventCoverImage(base64Data: string, fileName: string) {
  try {
    const supabase = await createClient();

    // Extract the base64 content and mime type
    const matches = base64Data.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
      return { success: false, error: "Invalid image data format" };
    }

    const mimeType = matches[1];
    const base64Content = matches[2];

    // Convert base64 to buffer
    const buffer = Buffer.from(base64Content, "base64");

    // Generate unique filename
    const fileExt = mimeType.split("/")[1] || "jpg";
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `covers/${uniqueFileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(EVENT_IMAGES_BUCKET)
      .upload(filePath, buffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (uploadError) {
      console.error("Error uploading event cover image:", uploadError);
      return { success: false, error: uploadError.message };
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(EVENT_IMAGES_BUCKET)
      .getPublicUrl(filePath);

    return { success: true, url: publicUrlData.publicUrl };
  } catch (err: any) {
    console.error("Exception uploading event cover image:", err);
    return { success: false, error: err.message || "Failed to upload image" };
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
    const channel = supabase.channel("events-channel");
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
