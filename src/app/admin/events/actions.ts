"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const EVENT_IMAGES_BUCKET = "event-images";
let hasMatchDetailsColumnCache: boolean | null = null;
let hasDedicatedChatEnabledColumnCache: boolean | null = null;
let hasChatsEventIdColumnCache: boolean | null = null;

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

async function hasEventsColumnDedicatedChatEnabled(
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  if (hasDedicatedChatEnabledColumnCache !== null) return hasDedicatedChatEnabledColumnCache;

  const { error } = await supabase
    .from("events")
    .select("dedicated_chat_enabled")
    .limit(1);

  hasDedicatedChatEnabledColumnCache = !isMissingColumnError(error, "dedicated_chat_enabled");
  return hasDedicatedChatEnabledColumnCache;
}

async function hasChatsColumnEventId(supabase: Awaited<ReturnType<typeof createClient>>) {
  if (hasChatsEventIdColumnCache !== null) return hasChatsEventIdColumnCache;

  const { error } = await supabase
    .from("chats")
    .select("event_id")
    .limit(1);

  hasChatsEventIdColumnCache = !isMissingColumnError(error, "event_id");
  return hasChatsEventIdColumnCache;
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
  dedicated_chat_enabled?: boolean;
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
    const canWriteDedicatedChatEnabled = await hasEventsColumnDedicatedChatEnabled(supabase);

    const descriptionText = eventData.description ?? "";
    const embeddedDescription = eventData.match_details
      ? JSON.stringify({ text: descriptionText, match_details: eventData.match_details })
      : descriptionText;

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
      description: (canWriteMatchDetails ? descriptionText : embeddedDescription) || null,
    };

    const payload: Record<string, unknown> = {
      ...basePayload,
      ...(canWriteMatchDetails ? { match_details: eventData.match_details || null } : {}),
      ...(canWriteDedicatedChatEnabled
        ? { dedicated_chat_enabled: Boolean(eventData.dedicated_chat_enabled) }
        : {}),
    };

    const fallbackPayload = {
      ...basePayload,
      description: embeddedDescription || null,
    };

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
      if ("match_details" in payload) delete payload.match_details;
      ({ data, error } = await supabase
        .from("events")
        .insert({ ...fallbackPayload, ...(canWriteDedicatedChatEnabled
          ? { dedicated_chat_enabled: Boolean(eventData.dedicated_chat_enabled) }
          : {}) })
        .select()
        .single());
    }

    if (canWriteDedicatedChatEnabled && isMissingColumnError(error, "dedicated_chat_enabled")) {
      console.warn("dedicated_chat_enabled column missing; retrying without it.");
      hasDedicatedChatEnabledColumnCache = false;
      ({ data, error } = await supabase
        .from("events")
        .insert(canWriteMatchDetails ? basePayload : fallbackPayload)
        .select()
        .single());
    }

    if (error) {
      console.error("Error creating event:", error);
      return { success: false, error: error.message };
    }

    const shouldCreateDedicatedChat = Boolean(
      eventData.dedicated_chat_enabled || eventData.match_details?.dedicatedChatEnabled
    );
    if (shouldCreateDedicatedChat && data?.id) {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user?.id) {
          const canWriteEventId = await hasChatsColumnEventId(supabase);
          const baseChatPayload: Record<string, unknown> = {
            title: `${eventData.title} Chat`,
            is_group: true,
            created_by: user.id,
          };
          const chatPayload = canWriteEventId
            ? { ...baseChatPayload, event_id: data.id }
            : baseChatPayload;

          const { error: createChatError } = await supabase
            .from("chats")
            .insert(chatPayload);

          if (createChatError && isMissingColumnError(createChatError, "event_id")) {
            hasChatsEventIdColumnCache = false;
            await supabase.from("chats").insert(baseChatPayload);
          } else if (createChatError) {
            console.warn("Failed to create dedicated chat group:", createChatError.message);
          }
        }
      } catch (chatErr) {
        console.warn("Dedicated chat group creation failed:", chatErr);
      }
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
    const canWriteDedicatedChatEnabled = await hasEventsColumnDedicatedChatEnabled(supabase);

    const descriptionText = eventData.description ?? "";
    const embeddedDescription = eventData.match_details
      ? JSON.stringify({ text: descriptionText, match_details: eventData.match_details })
      : descriptionText;

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
      description: (canWriteMatchDetails ? descriptionText : embeddedDescription) || null,
      updated_at: new Date().toISOString(),
    };

    const payload: Record<string, unknown> = {
      ...basePayload,
      ...(canWriteMatchDetails ? { match_details: eventData.match_details } : {}),
      ...(canWriteDedicatedChatEnabled && eventData.dedicated_chat_enabled !== undefined
        ? { dedicated_chat_enabled: Boolean(eventData.dedicated_chat_enabled) }
        : {}),
    };

    const fallbackPayload = {
      ...basePayload,
      description: embeddedDescription || null,
    };

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
      if ("match_details" in payload) delete payload.match_details;
      ({ data, error } = await supabase
        .from("events")
        .update({
          ...fallbackPayload,
          ...(canWriteDedicatedChatEnabled && eventData.dedicated_chat_enabled !== undefined
            ? { dedicated_chat_enabled: Boolean(eventData.dedicated_chat_enabled) }
            : {}),
        })
        .eq("id", id)
        .select()
        .single());
    }

    if (canWriteDedicatedChatEnabled && isMissingColumnError(error, "dedicated_chat_enabled")) {
      console.warn("dedicated_chat_enabled column missing; retrying without it.");
      hasDedicatedChatEnabledColumnCache = false;
      ({ data, error } = await supabase
        .from("events")
        .update(canWriteMatchDetails ? basePayload : fallbackPayload)
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
