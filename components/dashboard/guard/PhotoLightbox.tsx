"use client";

import Image from "next/image";
import { X } from "lucide-react";

type PhotoLightboxProps = {
  photoUrl: string | null;
  onClose: () => void;
};

export default function PhotoLightbox({ photoUrl, onClose }: PhotoLightboxProps) {
  if (!photoUrl) return null;

  return (
    <div
      className="fixed inset-0 bg-black/90 z-[80] flex flex-col items-center justify-center p-4 cursor-pointer backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="relative max-w-2xl w-full flex flex-col items-center">
        <button
          className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors p-2"
          onClick={(e) => { e.stopPropagation(); onClose(); }}
        >
          <X size={32} />
        </button>
        <Image
          src={photoUrl}
          alt="Enlarged security photo"
          width={1000}
          height={1000}
          className="w-full h-auto rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.5)] border-4 border-zinc-800 object-contain max-h-[85vh]"
          onClick={(e) => e.stopPropagation()}
          unoptimized
        />
      </div>
    </div>
  );
}
