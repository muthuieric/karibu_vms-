export const MAX_LOGO_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
export const ALLOWED_LOGO_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/svg+xml",
  "image/webp",
] as const;

export type AllowedLogoMimeType = (typeof ALLOWED_LOGO_MIME_TYPES)[number];

const MIME_TO_EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/svg+xml": "svg",
  "image/webp": "webp",
};

export function getLogoExtension(mimeType: string, fileName?: string): string {
  if (MIME_TO_EXT[mimeType]) {
    return MIME_TO_EXT[mimeType];
  }

  if (fileName) {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (ext === "png") return "png";
    if (ext === "jpg" || ext === "jpeg") return "jpg";
    if (ext === "svg") return "svg";
    if (ext === "webp") return "webp";
  }

  return "png";
}

export function validateLogoFile(file: File): {
  valid: boolean;
  error?: string;
  ext: string;
  contentType: string;
} {
  if (!file) {
    return { valid: false, error: "No file selected.", ext: "png", contentType: "image/png" };
  }

  const isMimeAllowed = ALLOWED_LOGO_MIME_TYPES.includes(file.type as AllowedLogoMimeType);
  const nameExt = file.name.split(".").pop()?.toLowerCase();
  const isExtAllowed = ["png", "jpg", "jpeg", "svg", "webp"].includes(nameExt || "");

  if (!isMimeAllowed && !isExtAllowed) {
    return {
      valid: false,
      error: "Invalid file type. Only PNG, JPEG, SVG, and WebP images are supported.",
      ext: "png",
      contentType: "image/png",
    };
  }

  if (file.size > MAX_LOGO_SIZE_BYTES) {
    return {
      valid: false,
      error: "File size exceeds 2MB limit. Please upload a smaller logo.",
      ext: getLogoExtension(file.type, file.name),
      contentType: file.type || "image/png",
    };
  }

  const ext = getLogoExtension(file.type, file.name);
  const contentType = file.type || (ext === "svg" ? "image/svg+xml" : `image/${ext === "jpg" ? "jpeg" : ext}`);

  return {
    valid: true,
    ext,
    contentType,
  };
}

/**
 * Compresses raster logo images while preserving transparency for PNG/WebP.
 * For SVGs (vector format), returns the original file untouched.
 */
export async function compressLogoImage(
  file: File,
  maxDimension = 800
): Promise<{ file: File; ext: string; contentType: string }> {
  const validation = validateLogoFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || "Invalid logo file.");
  }

  const { ext, contentType } = validation;

  // Do not compress SVG vectors
  if (ext === "svg" || contentType === "image/svg+xml") {
    return { file, ext: "svg", contentType: "image/svg+xml" };
  }

  // If in a non-browser environment or canvas unsupported, return file
  if (typeof window === "undefined" || typeof document === "undefined") {
    return { file, ext, contentType };
  }

  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      // Only resize if exceeding max dimensions
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve({ file, ext, contentType });
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      // Target MIME type: preserve PNG for transparency, otherwise WebP or JPEG
      const targetMime =
        contentType === "image/png"
          ? "image/png"
          : contentType === "image/webp"
          ? "image/webp"
          : "image/jpeg";

      const quality = targetMime === "image/png" ? undefined : 0.85;

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve({ file, ext, contentType });
            return;
          }

          const compressedFile = new File([blob], `logo.${ext}`, {
            type: targetMime,
            lastModified: Date.now(),
          });

          resolve({
            file: compressedFile,
            ext,
            contentType: targetMime,
          });
        },
        targetMime,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ file, ext, contentType });
    };

    img.src = objectUrl;
  });
}

export function fileToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip data:image/...;base64, prefix if present
      const commaIndex = result.indexOf(",");
      resolve(commaIndex >= 0 ? result.substring(commaIndex + 1) : result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function getCompanyLogoStoragePath(companyId: string, ext: string): string {
  const safeExt = ext.replace(/^\./, "").toLowerCase();
  return `logos/${companyId}/logo.${safeExt}`;
}

