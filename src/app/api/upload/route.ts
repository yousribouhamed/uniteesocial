import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Allowed image types
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Storage bucket name
const BUCKET_NAME = "uploads";

/**
 * POST /api/upload
 * Upload an image to Supabase Storage
 *
 * Form data:
 * - file: The file to upload
 * - folder: Optional folder path (e.g., "avatars", "branding", "events")
 *
 * Returns:
 * - url: The public URL of the uploaded file
 * - path: The storage path of the file
 */
export async function POST(request: NextRequest) {
  try {
    // Verify the requesting user is authenticated
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("Auth error:", authError);
      return NextResponse.json(
        { error: "Authentication error", details: authError.message },
        { status: 401 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      );
    }

    // Parse the form data
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch (e) {
      console.error("Form data parse error:", e);
      return NextResponse.json(
        { error: "Invalid form data" },
        { status: 400 }
      );
    }

    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "general";

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Invalid file type: ${file.type}. Allowed types: ${ALLOWED_TYPES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split(".").pop() || "jpg";
    const filename = `${timestamp}-${randomString}.${extension}`;
    const storagePath = `${folder}/${filename}`;

    // Convert file to buffer
    let buffer: Buffer;
    try {
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } catch (e) {
      console.error("File buffer error:", e);
      return NextResponse.json(
        { error: "Failed to read file data" },
        { status: 400 }
      );
    }

    // Use admin client to bypass RLS for storage operations
    let adminClient;
    try {
      adminClient = createAdminClient();
    } catch (e) {
      console.error("Admin client error:", e);
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await adminClient.storage
      .from(BUCKET_NAME)
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json(
        { error: uploadError.message || "Upload to storage failed" },
        { status: 500 }
      );
    }

    if (!uploadData || !uploadData.path) {
      console.error("No upload data returned");
      return NextResponse.json(
        { error: "Upload failed - no data returned" },
        { status: 500 }
      );
    }

    // Get the public URL
    const { data: urlData } = adminClient.storage
      .from(BUCKET_NAME)
      .getPublicUrl(uploadData.path);

    if (!urlData || !urlData.publicUrl) {
      console.error("No public URL returned");
      return NextResponse.json(
        { error: "Failed to get public URL" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      path: uploadData.path,
    });
  } catch (error) {
    console.error("Upload error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/upload
 * Delete an image from Supabase Storage
 *
 * Query params:
 * - path: The storage path of the file to delete
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verify the requesting user is authenticated
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path");

    if (!path) {
      return NextResponse.json(
        { error: "File path is required" },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    const { error: deleteError } = await adminClient.storage
      .from(BUCKET_NAME)
      .remove([path]);

    if (deleteError) {
      console.error("Storage delete error:", deleteError);
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: "File deleted successfully" 
    });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
