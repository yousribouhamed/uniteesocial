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

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        setProgress(80);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Upload failed");
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
        const data = await response.json();
        throw new Error(data.error || "Delete failed");
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
