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
        // Validate file on client side first
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
          throw new Error("File too large. Maximum size is 10MB");
        }

        const allowedTypes = [
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/webp",
          "image/svg+xml",
        ];
        if (!allowedTypes.includes(file.type)) {
          throw new Error(
            "Invalid file type. Allowed: JPG, PNG, GIF, WebP, SVG"
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
            // Add cache control to prevent caching issues
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
          // Try to get the text response for debugging
          let textResponse = "";
          try {
            textResponse = await response.text();
          } catch {
            // Ignore
          }
          console.error("Non-JSON response:", textResponse.substring(0, 500));
          
          // Provide specific error messages based on status code
          if (response.status === 401) {
            throw new Error(
              "Your session has expired. Please sign in again and retry."
            );
          } else if (response.status === 413) {
            throw new Error("File too large. Maximum size is 10MB");
          } else if (response.status >= 500) {
            throw new Error(
              "Server error. Please try again later or contact support."
            );
          } else {
            throw new Error(
              "Server returned an invalid response. Please try again or contact support if the issue persists."
            );
          }
        }

        let data;
        try {
          data = await response.json();
        } catch (parseError) {
          console.error("JSON parse error:", parseError);
          throw new Error(
            "Failed to parse server response. Please try again."
          );
        }

        setProgress(80);

        if (!response.ok) {
          throw new Error(
            data.error || `Upload failed with status ${response.status}`
          );
        }

        // Validate response data
        if (!data.url || !data.path) {
          console.error("Invalid response data:", data);
          throw new Error(
            "Server returned incomplete data. Please try again."
          );
        }

        setProgress(100);

        const result: UploadResult = {
          url: data.url,
          path: data.path,
        };

        onSuccess?.(result);
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Upload failed";
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
      const errorMessage =
        err instanceof Error ? err.message : "Delete failed";
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
