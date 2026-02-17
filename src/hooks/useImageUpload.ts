"use client";

import { useState, useCallback } from "react";

interface UploadResult {
  url: string;
  path: string;
}

interface UseImageUploadOptions {
  folder?: string;
  onSuccess?: (result: UploadResult) => void;
  onError?: (error: string) => void;
}

// Allowed file types for client-side validation
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
  "application/octet-stream", // Some HEIC files
];

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

function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() || "";
}

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

export function useImageUpload(options: UseImageUploadOptions = {}) {
  const { folder = "general", onSuccess, onError } = options;

  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    async (file: File): Promise<UploadResult | null> => {
      setIsUploading(true);
      setProgress(0);
      setError(null);

      try {
        // Log file info for debugging
        console.log("Uploading file:", {
          name: file.name,
          type: file.type,
          size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
          extension: getFileExtension(file.name),
        });

        // Validate file size (10MB)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
          throw new Error(`File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 10MB`);
        }

        // Validate file type (by MIME type or extension)
        if (!isAllowedFileType(file)) {
          const ext = getFileExtension(file.name);
          throw new Error(
            `Invalid file type: ${file.type || ext}. Allowed: JPG, PNG, GIF, WebP, SVG, AVIF, BMP, TIFF, HEIC`
          );
        }

        setProgress(10);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);

        setProgress(30);

        let response: Response;
        try {
          response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
            headers: {
              "Cache-Control": "no-cache",
            },
          });
        } catch (networkError) {
          console.error("Network error:", networkError);
          throw new Error(
            "Network error - please check your connection and try again"
          );
        }

        setProgress(60);

        // Check if response is JSON
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          let textResponse = "";
          try {
            textResponse = await response.text();
          } catch {
            // Ignore
          }
          console.error("Non-JSON response:", textResponse.substring(0, 500));
          
          if (response.status === 401) {
            throw new Error("Your session has expired. Please sign in again and retry.");
          } else if (response.status === 413) {
            throw new Error("File too large. Maximum size is 10MB");
          } else if (response.status >= 500) {
            throw new Error("Server error. Please try again later or contact support.");
          } else {
            throw new Error("Server returned an invalid response. Please try again.");
          }
        }

        let data;
        try {
          data = await response.json();
        } catch (parseError) {
          console.error("JSON parse error:", parseError);
          throw new Error("Failed to parse server response. Please try again.");
        }

        setProgress(80);

        if (!response.ok) {
          throw new Error(data.error || `Upload failed with status ${response.status}`);
        }

        // Validate response data
        if (!data.url || !data.path) {
          console.error("Invalid response data:", data);
          throw new Error("Server returned incomplete data. Please try again.");
        }

        setProgress(100);

        const result: UploadResult = {
          url: data.url,
          path: data.path,
        };

        console.log("Upload successful:", result);
        onSuccess?.(result);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Upload failed";
        console.error("Upload error:", errorMessage);
        setError(errorMessage);
        onError?.(errorMessage);
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [folder, onSuccess, onError]
  );

  const deleteImage = useCallback(async (path: string): Promise<boolean> => {
    try {
      const response = await fetch(
        `/api/upload?path=${encodeURIComponent(path)}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          throw new Error(data.error || "Delete failed");
        } else {
          throw new Error("Delete failed - server error");
        }
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Delete failed";
      setError(errorMessage);
      onError?.(errorMessage);
      return false;
    }
  }, [onError]);

  const reset = useCallback(() => {
    setIsUploading(false);
    setProgress(0);
    setError(null);
  }, []);

  return {
    upload,
    deleteImage,
    isUploading,
    progress,
    error,
    reset,
  };
}
