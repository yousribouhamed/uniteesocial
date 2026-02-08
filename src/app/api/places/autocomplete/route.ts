"use server";

import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const input = url.searchParams.get("input") || "";

  if (!input.trim()) {
    return NextResponse.json({ predictions: [] });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing GOOGLE_MAPS_API_KEY" },
      { status: 500 }
    );
  }

  const endpoint = new URL(
    "https://maps.googleapis.com/maps/api/place/autocomplete/json"
  );
  endpoint.searchParams.set("input", input);
  endpoint.searchParams.set("key", apiKey);

  // Optional tuning (kept minimal; user can add components=country:.. etc.)
  endpoint.searchParams.set("types", "geocode");

  const res = await fetch(endpoint.toString(), {
    // Avoid caching in edge/runtime
    cache: "no-store",
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

