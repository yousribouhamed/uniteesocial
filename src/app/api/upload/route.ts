import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Allowed image types
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "image/heic",
  "image/heif",
  "application/octet-stream", // Some browsers send this for HEIC
];

// Allowed extensions (as fallback when MIME type is missing/wrong)
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "svg", "heic", "heif"];

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Storage bucket name
const BUCKET_NAME = "uploads";

/**
 * Get file extension from filename
 */
function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() || "";
}

/**
 * Check if file type is allowed (by MIME type or extension)
 */
function isAllowedFileType(file: File): boolean {
  // Check MIME type first
  if (ALLOWED_TYPES.includes(file.type)) {
    return true;
  }
  
  // Fallback: check file extension
  const ext = getFileExtension(file.name);
  if (ALLOWED_EXTENSIONS.includes(ext)) {
    return true;
  }
  
  // Special case: HEIC files often have wrong MIME type
  if (ext === "heic" || ext === "heif") {
    return true;
  }
  
  return false;
}

/**
 * Get proper MIME type based on file extension
 */
function getProperMimeType(file: File): string {
  const ext = getFileExtension(file.name);
  
  const mimeTypes: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    heic: "image/heic",
    heif: "image/heif",
  };
  
  return mimeTypes[ext] || file.type || "application/octet-stream";
}

/**
 * Sanitize filename - remove special characters
 */
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, "_") // Replace special chars with underscore
    .replace(/_{2,}/g, "_"); // Replace multiple underscores with single
}

/**
 * POST /api/upload
 * Upload an image to Supabase Storage
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

    // Log file info for debugging
    console.log("Upload request:", {
      name: file.name,
      type: file.type,
      size: file.size,
      extension: getFileExtension(file.name),
    });

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      console.error("File too large:", file.size);
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Validate file type (by MIME type or extension)
    if (!isAllowedFileType(file)) {
      console.error("Invalid file type:", file.type, "name:", file.name);
      return NextResponse.json(
        {
          error: `Invalid file type: ${file.type || "unknown"}. Allowed types: JPG, PNG, GIF, WebP, SVG, HEIC`,
        },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const originalExt = getFileExtension(file.name) || "jpg";
    const safeExt = ALLOWED_EXTENSIONS.includes(originalExt) ? originalExt : "jpg";
    const filename = `${timestamp}-${randomString}.${safeExt}`;
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

    // Get proper MIME type (fix for HEIC and files with wrong MIME type)
    const contentType = getProperMimeType(file);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await adminClient.storage
      .from(BUCKET_NAME)
      .upload(storagePath, buffer, {
        contentType,
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

    console.log("Upload successful:", {
      path: uploadData.path,
      size: file.size,
    });

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
