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
  "image/avif",
  "image/bmp",
  "image/tiff",
  "image/heic",
  "image/heif",
  "application/octet-stream", // Some browsers send this for HEIC
];

// Allowed extensions (as fallback when MIME type is missing/wrong)
const ALLOWED_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "svg",
  "avif",
  "bmp",
  "tif",
  "tiff",
  "heic",
  "heif",
];
const EXTENSION_TO_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
  avif: "image/avif",
  bmp: "image/bmp",
  tif: "image/tiff",
  tiff: "image/tiff",
  heic: "image/heic",
  heif: "image/heif",
};

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

  return EXTENSION_TO_MIME[ext] || file.type || "application/octet-stream";
}

function getExtensionFromMimeType(mimeType: string): string {
  const normalized = mimeType.toLowerCase().split(";")[0].trim();
  const match = Object.entries(EXTENSION_TO_MIME).find(([, value]) => value === normalized);
  return match?.[0] || "";
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

    let folder = "general";
    let originalFileName = "upload.jpg";
    let contentType = "application/octet-stream";
    let fileSize = 0;
    let buffer: Buffer | null = null;

    const incomingContentType = request.headers.get("content-type") || "";
    const isJsonPayload = incomingContentType.includes("application/json");
    const isMultipartPayload = incomingContentType.includes("multipart/form-data");
    const isBinaryPayload = !isJsonPayload && !isMultipartPayload;

    if (isJsonPayload) {
      let payload: unknown;
      try {
        const rawBody = await request.text();
        payload = JSON.parse(rawBody);
      } catch (e) {
        console.error("JSON parse error:", e);
        return NextResponse.json(
          { error: "Invalid JSON payload" },
          { status: 400 }
        );
      }

      const body = payload as {
        base64Data?: string;
        folder?: string;
        fileName?: string;
      };
      if (!body.base64Data || typeof body.base64Data !== "string") {
        return NextResponse.json(
          { error: "base64Data is required" },
          { status: 400 }
        );
      }

      const matches = body.base64Data.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) {
        return NextResponse.json(
          { error: "Invalid image data format" },
          { status: 400 }
        );
      }

      const mimeType = matches[1];
      const base64Content = matches[2];
      const mimeExtRaw = mimeType.split("/")[1]?.toLowerCase() || "jpg";
      const mimeExt = mimeExtRaw.replace("+xml", "");

      folder = typeof body.folder === "string" && body.folder.trim() ? body.folder : "general";
      originalFileName = typeof body.fileName === "string" && body.fileName.trim()
        ? body.fileName
        : `upload-${Date.now()}.${mimeExt}`;

      const hasAllowedMime = ALLOWED_TYPES.includes(mimeType);
      const extFromName = getFileExtension(originalFileName);
      const effectiveExt = extFromName || mimeExt;
      if (!hasAllowedMime && !ALLOWED_EXTENSIONS.includes(effectiveExt)) {
        return NextResponse.json(
          { error: `Invalid file type: ${mimeType}. Allowed: JPG, PNG, GIF, WebP, SVG, AVIF, BMP, TIFF, HEIC` },
          { status: 400 }
        );
      }

      if (!extFromName) {
        originalFileName = `${originalFileName}.${effectiveExt}`;
      }

      try {
        buffer = Buffer.from(base64Content, "base64");
      } catch (e) {
        console.error("Base64 decode error:", e);
        return NextResponse.json(
          { error: "Failed to decode image data" },
          { status: 400 }
        );
      }

      fileSize = buffer.length;
      contentType = hasAllowedMime
        ? mimeType
        : (EXTENSION_TO_MIME[effectiveExt] || "application/octet-stream");

      console.log("Upload request (json):", {
        name: originalFileName,
        type: contentType,
        size: fileSize,
        extension: getFileExtension(originalFileName),
      });
    } else if (isMultipartPayload) {
      // Parse multipart/form-data
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
      folder = (formData.get("folder") as string) || "general";

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

      // Validate file type (by MIME type or extension)
      if (!isAllowedFileType(file)) {
        console.error("Invalid file type:", file.type, "name:", file.name);
        return NextResponse.json(
          {
            error: `Invalid file type: ${file.type || "unknown"}. Allowed: JPG, PNG, GIF, WebP, SVG, AVIF, BMP, TIFF, HEIC`,
          },
          { status: 400 }
        );
      }

      originalFileName = file.name;
      fileSize = file.size;
      contentType = getProperMimeType(file);

      // Convert file to buffer
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
    } else if (isBinaryPayload) {
      folder = request.nextUrl.searchParams.get("folder") || request.headers.get("x-upload-folder") || "general";

      const headerFileName = request.headers.get("x-file-name");
      const queryFileName = request.nextUrl.searchParams.get("fileName");
      const extFromMime = getExtensionFromMimeType(incomingContentType) || "jpg";
      originalFileName = (queryFileName || headerFileName || `upload-${Date.now()}.${extFromMime}`).trim();

      if (!getFileExtension(originalFileName)) {
        originalFileName = `${originalFileName}.${extFromMime}`;
      }

      const extFromName = getFileExtension(originalFileName);
      const normalizedMime = incomingContentType.toLowerCase().split(";")[0].trim() || "application/octet-stream";
      if (!ALLOWED_EXTENSIONS.includes(extFromName) && !ALLOWED_TYPES.includes(normalizedMime)) {
        return NextResponse.json(
          { error: `Invalid file type: ${normalizedMime}. Allowed: JPG, PNG, GIF, WebP, SVG, AVIF, BMP, TIFF, HEIC` },
          { status: 400 }
        );
      }

      contentType = ALLOWED_TYPES.includes(normalizedMime)
        ? normalizedMime
        : (EXTENSION_TO_MIME[extFromName] || "application/octet-stream");

      try {
        const arrayBuffer = await request.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
      } catch (e) {
        console.error("Binary buffer error:", e);
        return NextResponse.json(
          { error: "Invalid binary payload" },
          { status: 400 }
        );
      }

      fileSize = buffer.length;

      console.log("Upload request (binary):", {
        name: originalFileName,
        type: contentType,
        size: fileSize,
        extension: getFileExtension(originalFileName),
      });
    }

    if (!buffer || buffer.length === 0) {
      return NextResponse.json(
        { error: "No file data to upload" },
        { status: 400 }
      );
    }

    // Validate file size
    if (fileSize > MAX_FILE_SIZE) {
      console.error("File too large:", fileSize);
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const originalExt = getFileExtension(originalFileName) || "jpg";
    const safeExt = ALLOWED_EXTENSIONS.includes(originalExt) ? originalExt : "jpg";
    const filename = `${timestamp}-${randomString}.${safeExt}`;
    const storagePath = `${folder}/${filename}`;

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
      size: fileSize,
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
