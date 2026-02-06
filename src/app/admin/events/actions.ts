"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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
  created_at?: string;
  updated_at?: string;
}

export async function getEvents() {
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
}

export async function createEvent(eventData: Omit<EventData, "id" | "created_at" | "updated_at">) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events")
    .insert({
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
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating event:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/events");
  return { success: true, data };
}

export async function updateEvent(id: string, eventData: Partial<EventData>) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events")
    .update({
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
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating event:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/events");
  return { success: true, data };
}

export async function deleteEvent(id: string) {
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
}
