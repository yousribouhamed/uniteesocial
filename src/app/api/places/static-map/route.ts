"use server";

import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const lat = url.searchParams.get("lat");
  const lng = url.searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json({ error: "Missing lat/lng" }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing GOOGLE_MAPS_API_KEY" },
      { status: 500 }
    );
  }

  const endpoint = new URL("https://maps.googleapis.com/maps/api/staticmap");
  endpoint.searchParams.set("center", `${lat},${lng}`);
  endpoint.searchParams.set("zoom", "14");
  endpoint.searchParams.set("size", "900x400");
  endpoint.searchParams.set("scale", "2");
  endpoint.searchParams.set("markers", `color:0x3f52ff|${lat},${lng}`);
  endpoint.searchParams.set("key", apiKey);

  const res = await fetch(endpoint.toString(), { cache: "no-store" });
  const contentType = res.headers.get("content-type") || "image/png";

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: text || "Failed to load map" }, { status: res.status });
  }

  const bytes = await res.arrayBuffer();
  return new Response(bytes, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "no-store",
    },
  });
}
